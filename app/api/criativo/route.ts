import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userHasAccess, planRequired } from "@/lib/access-server";
import { GoogleAuth } from "google-auth-library";
import { ART_DIRECTOR_SKILL, CRIATIVO_STYLES, CriativoStyle, imagePrompt } from "@/lib/criativo-skills";

export const maxDuration = 120;

// Tried in order; a model missing from the Vertex project falls through to the next.
const BRIEF_MODELS = ["gemini-3-pro-preview", "gemini-3.1-flash-lite"];
const IMAGE_MODELS = ["gemini-3-pro-image-preview", "gemini-3.1-flash-lite-image"];

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

    const vertex = (model: string, body: unknown) =>
      fetch(
        `https://aiplatform.googleapis.com/v1/projects/${credentials.project_id}/locations/global/publishers/google/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    const photoPart = imageBase64 ? [{ inlineData: { mimeType, data: imageBase64 } }] : [];

    // Step 1: the art director turns the short request into a full visual brief.
    let brief = `${styleBrief}\n\nThe artist's request (Portuguese): "${request}"`;
    const briefPrompt = [
      `Format: ${fmt.label}.`,
      `Visual style to follow: ${styleBrief}`,
      `Artist's request (Portuguese): "${request}"`,
      imageBase64 ? "A reference photo is attached." : "No photo attached.",
    ].join("\n");
    for (const model of BRIEF_MODELS) {
      try {
        const res = await vertex(model, {
          systemInstruction: { parts: [{ text: ART_DIRECTOR_SKILL }] },
          contents: [{ role: "user", parts: [...photoPart, { text: briefPrompt }] }],
          // Thinking models spend output tokens on reasoning; leave room for the brief itself.
          generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
        });
        if (!res.ok) {
          console.warn(`[criativo] brief model ${model} failed`, res.status, (await res.text()).slice(0, 200));
          continue;
        }
        const data = await res.json();
        const text = (data.candidates?.[0]?.content?.parts ?? [])
          .filter((p: any) => !p.thought)
          .map((p: any) => p.text ?? "")
          .join("")
          .trim();
        if (text) {
          brief = text;
          console.log(`[criativo] brief by ${model}: ${text.length} chars`);
          break;
        }
      } catch (err) {
        console.warn(`[criativo] brief model ${model} error:`, err);
      }
    }

    // Step 2: render the brief.
    const parts: any[] = [...photoPart, { text: imagePrompt(brief, fmt.label, !!imageBase64) }];
    const imageBody = (withAspect: boolean) => ({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
        temperature: 1,
        ...(withAspect ? { imageConfig: { aspectRatio: fmt.aspectRatio } } : {}),
      },
    });

    let blockedReason: string | undefined;
    for (const model of IMAGE_MODELS) {
      let res = await vertex(model, imageBody(true));
      if (res.status === 400) {
        // Some model versions reject imageConfig; the prompt still asks for the format.
        console.warn(`[criativo] ${model} rejected aspectRatio:`, (await res.text()).slice(0, 200));
        res = await vertex(model, imageBody(false));
      }
      if (!res.ok) {
        console.warn(`[criativo] image model ${model} failed`, res.status, (await res.text()).slice(0, 300));
        continue;
      }
      const result = await res.json();
      const image = (result.candidates?.[0]?.content?.parts ?? []).find((p: any) => p.inlineData?.data);
      if (image) {
        console.log(`[criativo] image by ${model}`);
        return NextResponse.json({
          imageBase64: image.inlineData.data,
          imageMimeType: image.inlineData.mimeType ?? "image/png",
        });
      }
      blockedReason = result.candidates?.[0]?.finishReason;
      console.warn(`[criativo] ${model} returned no image, finishReason:`, blockedReason);
      if (blockedReason === "SAFETY" || blockedReason === "PROHIBITED_CONTENT") break;
    }

    return NextResponse.json(
      {
        error:
          blockedReason === "SAFETY" || blockedReason === "PROHIBITED_CONTENT"
            ? "A IA recusou esse pedido por política de conteúdo. Ajuste a descrição ou a foto."
            : "A IA não conseguiu gerar a arte agora. Tente novamente.",
      },
      { status: blockedReason ? 422 : 502 }
    );
  } catch (error) {
    console.error("[criativo] Error:", error);
    return NextResponse.json({ error: "Erro ao gerar a arte." }, { status: 500 });
  }
}
