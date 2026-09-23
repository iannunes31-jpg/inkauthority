import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleAuth } from "google-auth-library";

const STYLE_PROMPTS: Record<string, string> = {
  linhas:
    "You are a professional tattoo stencil artist. Convert this reference image into a clean technical tattoo stencil. " +
    "Draw ONLY thin, precise black lines on a pure white background. " +
    "NO filled black areas, NO shading, NO gradients, NO gray tones — only clean black outlines. " +
    "Trace the essential contours of the main subject with crisp, single-pixel-weight lines. " +
    "The result must be suitable for printing on thermal transfer (decal) paper for tattooing.",

  sombras:
    "You are a professional tattoo stencil artist. Convert this reference image into a blackwork tattoo stencil. " +
    "Use solid black filled areas AND black outlines on a pure white background. " +
    "Fill all dark/shadow regions with solid black. Keep highlights white. " +
    "Think silhouette + outline style — high contrast, no gray, no gradients. " +
    "The result must be suitable for printing on thermal transfer paper for tattooing.",

  fino:
    "You are a professional tattoo stencil artist. Convert this reference image into an ultra-fine-line tattoo stencil. " +
    "Draw ONLY the most essential contours with hairline-thin black lines on a pure white background. " +
    "Lines must be as thin and delicate as possible — ideal for fine-line or micro-realism tattoos. " +
    "NO filled areas, NO shading, NO gray. Minimal but precise. " +
    "The result must be suitable for printing on thermal transfer paper for tattooing.",
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.GOOGLE_VERTEX_CREDENTIALS) {
    return NextResponse.json(
      { error: "Credenciais do Vertex AI não configuradas (GOOGLE_VERTEX_CREDENTIALS)." },
      { status: 500 }
    );
  }

  let credentials: Record<string, string>;
  try {
    credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS);
  } catch {
    return NextResponse.json({ error: "JSON do Vertex AI inválido." }, { status: 500 });
  }

  const body = await req.json();
  const { imageBase64, mimeType = "image/jpeg", style = "linhas" } = body;

  if (!imageBase64) {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  try {
    // Authenticate using service account credentials
    const googleAuth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const authClient = await googleAuth.getClient();
    const tokenResponse = await authClient.getAccessToken();
    const accessToken = tokenResponse.token;

    if (!accessToken) {
      return NextResponse.json({ error: "Falha ao obter token de acesso Vertex." }, { status: 500 });
    }

    const projectId = credentials.project_id;
    const location = "global";

    // gemini-3.1-flash-lite-image: suporta responseModalities IMAGE + TEXT
    const IMAGE_MODELS = [
      "gemini-3.1-flash-lite-image",
    ];

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: STYLE_PROMPTS[style] ?? STYLE_PROMPTS.linhas },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
        temperature: 1,
      },
    };

    let imagePart: any = null;
    let textPart: any = null;

    for (const model of IMAGE_MODELS) {
      // global location uses the non-regional base URL
      const base = location === "global"
        ? "https://aiplatform.googleapis.com"
        : `https://${location}-aiplatform.googleapis.com`;
      const endpoint = `${base}/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

      const vertexRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!vertexRes.ok) {
        const errText = await vertexRes.text();
        console.warn(`[decalque-ai] Model ${model} failed (${vertexRes.status}):`, errText.slice(0, 300));
        continue; // try next model
      }

      const result = await vertexRes.json();
      const parts: any[] = result.candidates?.[0]?.content?.parts ?? [];

      imagePart = parts.find((p: any) => p.inlineData?.data) ?? null;
      textPart = parts.find((p: any) => typeof p.text === "string") ?? null;

      if (imagePart) break; // got an image — stop trying
    }

    if (imagePart) {
      // AI generated a real stencil image
      return NextResponse.json({
        imageBase64: imagePart.inlineData.data,
        imageMimeType: imagePart.inlineData.mimeType ?? "image/png",
        description: textPart?.text ?? "Decalque gerado com sucesso pela IA.",
        style,
      });
    }

    // All image models failed or returned text only —
    // return a signal so the client applies canvas edge detection as fallback
    return NextResponse.json({
      description: textPart?.text ?? "Imagem analisada. Aplicando processamento local.",
      style,
      useCanvasFallback: true,
    });
  } catch (error) {
    console.error("[decalque-ai] Error:", error);
    return NextResponse.json({ error: "Erro ao processar imagem com IA." }, { status: 500 });
  }
}
