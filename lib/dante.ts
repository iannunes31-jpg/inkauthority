import { GoogleAuth } from "google-auth-library";

export const STAGES = [
  { key: "novo", label: "Novo contato" },
  { key: "qualificando", label: "Qualificando" },
  { key: "projeto", label: "Projeto" },
  { key: "orcamento", label: "Orçamento enviado" },
  { key: "agendamento", label: "Agendando" },
  { key: "fechado", label: "Fechado" },
  { key: "perdido", label: "Perdido" },
] as const;
export type StageKey = (typeof STAGES)[number]["key"];

export const CLOSING_STAGES: StageKey[] = ["orcamento", "agendamento"];
export const STALLED_AFTER_HOURS = 48;

export function isStage(v: unknown): v is StageKey {
  return STAGES.some((s) => s.key === v);
}

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

// Evolution API v2 payloads (the v1 "textMessage"/"mediaMessage" shapes are rejected).
export const sendText = (instance: string, number: string, text: string, delay = 1200) =>
  evoPost(`/message/sendText/${instance}`, { number: number.replace(/\D/g, ""), text, delay });

export const sendImage = (instance: string, number: string, media: string, caption: string, mimetype = "image/jpeg") =>
  evoPost(`/message/sendMedia/${instance}`, {
    number: number.replace(/\D/g, ""),
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
