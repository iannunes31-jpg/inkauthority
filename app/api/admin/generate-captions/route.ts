import { NextRequest, NextResponse } from "next/server";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

// Languages to generate captions for
const LANGUAGES = [
  { code: "pt", label: "Português", whisperLang: "pt" },
  { code: "en", label: "English", whisperLang: "en" },
  { code: "es", label: "Español", whisperLang: "es" },
];

// Transcribe audio using Cloudflare Workers AI Whisper
async function transcribeWithWhisper(audioBuffer: ArrayBuffer, language: string): Promise<any> {
  const base64Audio = Buffer.from(audioBuffer).toString("base64");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/openai/whisper`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio: base64Audio,
        task: "transcribe",
        language,
        vtt: true,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Whisper error: ${err}`);
  }

  return response.json();
}

// Translate text using Cloudflare Workers AI translation model
async function translateText(text: string, targetLang: string): Promise<string> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/meta/m2m100-1.2b`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        source_lang: "pt",
        target_lang: targetLang,
      }),
    }
  );

  if (!response.ok) throw new Error("Translation error");
  const data = await response.json();
  return data.result?.translated_text || text;
}

// Upload SRT caption to Cloudflare Stream
async function uploadCaption(videoId: string, langCode: string, vttContent: string): Promise<void> {
  const formData = new FormData();
  const blob = new Blob([vttContent], { type: "text/vtt" });
  formData.append("file", blob, `${langCode}.vtt`);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/${videoId}/captions/${langCode}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Caption upload error (${langCode}): ${err}`);
  }
}

// Convert Whisper word-level timestamps to VTT format
function buildVTT(words: Array<{ word: string; start: number; end: number }>): string {
  if (!words || words.length === 0) return "WEBVTT\n\n";

  const lines: string[] = ["WEBVTT", ""];
  const CHUNK_DURATION = 5; // seconds per subtitle line
  let chunkStart = words[0].start;
  let chunkWords: string[] = [];

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = (s % 60).toFixed(3);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec.padStart(6, "0")}`;
  };

  for (const w of words) {
    chunkWords.push(w.word);
    if (w.end - chunkStart >= CHUNK_DURATION || w === words[words.length - 1]) {
      lines.push(`${formatTime(chunkStart)} --> ${formatTime(w.end)}`);
      lines.push(chunkWords.join(" ").trim());
      lines.push("");
      chunkStart = w.end;
      chunkWords = [];
    }
  }

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { videoId } = await req.json();
    if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

    // 1. Download audio from Cloudflare Stream
    const audioUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/${videoId}/downloads`;
    const downloadsRes = await fetch(audioUrl, {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    });

    if (!downloadsRes.ok) throw new Error("Failed to get video downloads");
    const downloadsData = await downloadsRes.json();
    const mp4Url = downloadsData.result?.default?.url;

    if (!mp4Url) {
      // Create download if doesn't exist
      await fetch(audioUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
      });
      return NextResponse.json({
        status: "processing",
        message: "Download do vídeo sendo preparado. Aguarde 1 minuto e tente novamente.",
      });
    }

    // 2. Fetch the video file
    const videoRes = await fetch(mp4Url);
    if (!videoRes.ok) throw new Error("Failed to download video");
    const audioBuffer = await videoRes.arrayBuffer();

    // 3. Transcribe in Portuguese (source language)
    const transcription = await transcribeWithWhisper(audioBuffer, "pt");
    const words = transcription.result?.words || [];
    const fullText = transcription.result?.text || "";

    const results: Record<string, string> = {};

    // 4. Generate captions for each language
    for (const lang of LANGUAGES) {
      let vttContent: string;

      if (lang.code === "pt") {
        // Source language — use direct transcription
        vttContent = transcription.result?.vtt || buildVTT(words);
      } else {
        // Translate the full text
        const translated = await translateText(fullText, lang.whisperLang);
        // Build simple VTT from translated text (no word timestamps for translations)
        const sentences = translated.match(/[^.!?]+[.!?]+/g) || [translated];
        const avgDuration = words.length > 0
          ? (words[words.length - 1].end - words[0].start) / sentences.length
          : 5;

        const formatTime = (s: number) => {
          const h = Math.floor(s / 3600);
          const m = Math.floor((s % 3600) / 60);
          const sec = (s % 60).toFixed(3);
          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec.padStart(6, "0")}`;
        };

        let vttLines = ["WEBVTT", ""];
        const startOffset = words[0]?.start || 0;
        sentences.forEach((sentence, i) => {
          const start = startOffset + i * avgDuration;
          const end = start + avgDuration;
          vttLines.push(`${formatTime(start)} --> ${formatTime(end)}`);
          vttLines.push(sentence.trim());
          vttLines.push("");
        });
        vttContent = vttLines.join("\n");
      }

      // 5. Upload to Cloudflare Stream
      await uploadCaption(videoId, lang.code, vttContent);
      results[lang.code] = "ok";
    }

    return NextResponse.json({
      status: "done",
      message: "Legendas geradas com sucesso!",
      languages: Object.keys(results),
    });

  } catch (err: any) {
    console.error("Caption generation error:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
