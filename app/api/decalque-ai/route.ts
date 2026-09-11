import { NextRequest, NextResponse } from "next/server";
import { createVertex } from "@ai-sdk/google-vertex";
import { generateText } from "ai";
import { auth } from "@clerk/nextjs/server";

const vertex = createVertex({ location: "us-central1" });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { imageBase64, mimeType = "image/jpeg", style = "linhas" } = body;

  if (!imageBase64) {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  const stylePrompts: Record<string, string> = {
    linhas: "Extract and render ONLY the clean line art / outline / contour of the main subject. Output a pure black line drawing on a pure white background. Lines should be crisp, thin (1-2px weight), and precise. Remove all shading, color, texture, and noise. This will be used as a tattoo stencil/decal to be transferred onto skin.",
    sombras: "Convert this image into a high-contrast black and white stencil with both outlines AND shaded areas filled in black. Think of it as a silhouette-style tattoo stencil. Output pure black shapes on white. Remove all mid-tones and color. This will be used as a tattoo stencil.",
    fino: "Extract ultra-fine, delicate line art from this image. Focus on the most essential contours only, with hairline-thin strokes. Output pure black lines on white background. Make the lines as thin and precise as possible — ideal for fine-line or micro tattoo stencils.",
  };

  const prompt = `You are an expert at converting reference images into tattoo stencil line art.

${stylePrompts[style] || stylePrompts.linhas}

IMPORTANT INSTRUCTIONS:
- Output ONLY the line art image description — describe every line, curve, and contour precisely
- Actually, your response must describe in detail how a tattoo artist would draw this as a stencil
- The final result should be suitable for printing on thermal transfer paper
- Describe the exact lines to draw, their curves, thickness, and connections

Analyze the image and describe the complete tattoo stencil with all outlines and details needed.`;

  try {
    const result = await generateText({
      model: vertex("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: imageBase64,
              mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp",
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ description: result.text, style });
  } catch (error) {
    console.error("[decalque-ai] Error:", error);
    return NextResponse.json({ error: "Erro ao processar imagem com IA" }, { status: 500 });
  }
}
