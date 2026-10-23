import { GoogleAuth } from "google-auth-library";
export { STAGES, CLOSING_STAGES, STALLED_AFTER_HOURS, isStage, type StageKey } from "@/lib/dante-stages";


const evolutionUrl = () => process.env.EVOLUTION_API_URL || "https://evolution-api-production-fbfd.up.railway.app";

async function evoPost(path: string, body: unknown) {
  const res = await fetch(`${evolutionUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: process.env.EVOLUTION_API_KEY! },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error("[evolution]", path, res.status, (await res.text().catch(() => "")).slice(0, 200));
  return res.ok;
}

// A full JID (e.g. "123@lid" for contacts with a hidden number) must be sent as is.
const target = (number: string) => (number.includes("@") ? number : number.replace(/\D/g, ""));

// Evolution API v2 payloads (the v1 "textMessage"/"mediaMessage" shapes are rejected).
export const sendText = (instance: string, number: string, text: string, delay = 1200) =>
  evoPost(`/message/sendText/${instance}`, { number: target(number), text, delay });

export const sendImage = (instance: string, number: string, media: string, caption: string, mimetype = "image/jpeg") =>
  evoPost(`/message/sendMedia/${instance}`, {
    number: target(number),
    mediatype: "image",
    mimetype,
    caption,
    media,
    fileName: mimetype === "image/png" ? "imagem.png" : "imagem.jpg",
    delay: 1500,
  });

const IMAGE_MODELS = ["gemini-3-pro-image-preview", "gemini-3.1-flash-lite-image"];

/** Generates one image with Gemini on Vertex; returns base64 + mime type, or null. */
export async function generateImage(prompt: string, aspectRatio = "1:1") {
  const credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS || "{}");
  if (!credentials.project_id) return null;
  const token = (await (await new GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/cloud-platform"] }).getClient()).getAccessToken()).token;
  if (!token) return null;

  for (const model of IMAGE_MODELS) {
    const res = await fetch(
      `https://aiplatform.googleapis.com/v1/projects/${credentials.project_id}/locations/global/publishers/google/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"], imageConfig: { aspectRatio } },
        }),
      }
    );
    if (!res.ok) {
      console.warn("[dante preview]", model, res.status, (await res.text()).slice(0, 200));
      continue;
    }
    const data = await res.json();
    const img = (data.candidates?.[0]?.content?.parts ?? []).find((p: any) => p.inlineData?.data);
    if (img) return { base64: img.inlineData.data as string, mimeType: (img.inlineData.mimeType as string) || "image/png" };
  }
  return null;
}
