import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userHasAccess, planRequired } from "@/lib/access-server";
import { GoogleAuth } from "google-auth-library";
import { ART_DIRECTOR_SKILL, CRIATIVO_STYLES, CriativoStyle, imagePrompt } from "@/lib/criativo-skills";

export const maxDuration = 60;

const IMAGE_MODEL = "gemini-3.1-flash-lite-image";
const TEXT_MODEL = "gemini-3.1-flash-lite";

const FORMATS: Record<string, { aspectRatio: string; label: string }> = {
  feed: { aspectRatio: "4:5", label: "Instagram feed post (portrait 4:5)" },
  quadrado: { aspectRatio: "1:1", label: "square social media post (1:1)" },
  stories: { aspectRatio: "9:16", label: "Instagram/TikTok story or Reels cover (vertical 9:16)" },
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await userHasAccess(userId, "ads"))) return planRequired();

  if (!process.env.GOOGLE_VERTEX_CREDENTIALS) {
    return NextResponse.json({ error: "Credenciais do Vertex AI não configuradas." }, { status: 500 });
  }
  let credentials: Record<string, string>;
  try {
    credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS);
  } catch {
    return NextResponse.json({ error: "JSON do Vertex AI inválido." }, { status: 500 });
  }

  const { prompt, format = "feed", style = "premium", imageBase64, mimeType = "image/jpeg" } = await req.json();
  const request = String(prompt || "").trim();
  if (!request) return NextResponse.json({ error: "Descreva o que você quer na arte." }, { status: 400 });
  if (request.length > 1500) return NextResponse.json({ error: "Descrição muito longa (máx. 1500 caracteres)." }, { status: 400 });
  const fmt = FORMATS[format] ?? FORMATS.feed;
  const styleBrief = (CRIATIVO_STYLES[style as CriativoStyle] ?? CRIATIVO_STYLES.premium).brief;

  try {
    const googleAuth = new GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
    const accessToken = (await (await googleAuth.getClient()).getAccessToken()).token;
    if (!accessToken) return NextResponse.json({ error: "Falha ao autenticar no Vertex AI." }, { status: 500 });

    const modelUrl = (model: string) =>
      `https://aiplatform.googleapis.com/v1/projects/${credentials.project_id}/locations/global/publishers/google/models/${model}:generateContent`;
    const photoPart = imageBase64 ? [{ inlineData: { mimeType, data: imageBase64 } }] : [];

    // Step 1: the art director turns the short request into a full visual brief.
    let brief = `${styleBrief}

The artist's request (Portuguese): "${request}"`;
    try {
      const briefRes = await fetch(modelUrl(TEXT_MODEL), {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ART_DIRECTOR_SKILL }] },
          contents: [{
            role: "user",
            parts: [
              ...photoPart,
              { text: `Format: ${fmt.label}.
Visual style to follow: ${styleBrief}
Artist's request (Portuguese): "${request}"
${imageBase64 ? "A reference photo is attached." : "No photo attached."}` },
            ],
          }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 900 },
        }),
      });
      if (briefRes.ok) {
        const data = await briefRes.json();
        const text = (data.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("").trim();
        if (text) brief = text;
      } else {
        console.warn("[criativo] art director failed", briefRes.status, (await briefRes.text()).slice(0, 300));
      }
    } catch (err) {
      console.warn("[criativo] art director error, using plain prompt:", err);
    }

    // Step 2: render the brief.
    const parts: any[] = [...photoPart, { text: imagePrompt(brief, fmt.label, !!imageBase64) }];
    const endpoint = modelUrl(IMAGE_MODEL);
    const call = (withAspect: boolean) =>
      fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            temperature: 1,
            ...(withAspect ? { imageConfig: { aspectRatio: fmt.aspectRatio } } : {}),
          },
        }),
      });

    let res = await call(true);
    if (res.status === 400) {
      // Some model versions reject imageConfig; the prompt still asks for the format.
      console.warn("[criativo] aspectRatio rejected, retrying without it:", (await res.text()).slice(0, 300));
      res = await call(false);
    }
    if (!res.ok) {
      const errText = await res.text();
      console.error("[criativo] Vertex error", res.status, errText.slice(0, 500));
      return NextResponse.json({ error: "A IA não conseguiu gerar a arte agora. Tente novamente." }, { status: 502 });
    }

    const result = await res.json();
    const outParts: any[] = result.candidates?.[0]?.content?.parts ?? [];
    const image = outParts.find((p) => p.inlineData?.data);
    if (!image) {
      const reason = result.candidates?.[0]?.finishReason;
      console.warn("[criativo] no image returned, finishReason:", reason);
      return NextResponse.json(
        { error: reason === "SAFETY" || reason === "PROHIBITED_CONTENT"
            ? "A IA recusou esse pedido por política de conteúdo. Ajuste a descrição ou a foto."
            : "A IA não devolveu uma imagem. Tente reformular o pedido." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      imageBase64: image.inlineData.data,
      imageMimeType: image.inlineData.mimeType ?? "image/png",
    });
  } catch (error) {
    console.error("[criativo] Error:", error);
    return NextResponse.json({ error: "Erro ao gerar a arte." }, { status: 500 });
  }
}
