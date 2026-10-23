import { NextRequest, NextResponse } from "next/server";
import { createVertex } from "@ai-sdk/google-vertex";
import { generateText } from "ai";
import { checkIsAdmin } from "@/lib/auth-server";

export const maxDuration = 300;

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const SOURCE = "pt";
const TARGETS = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish (Latin America)" },
];

const cf = (path: string, init: RequestInit = {}) =>
  fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${CF_API_TOKEN}`, ...(init.headers || {}) },
  });

async function cfJson(path: string, init: RequestInit = {}) {
  const res = await cf(path, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.errors?.[0]?.message || `Cloudflare ${res.status}`);
  }
  return body.result;
}

type Caption = { language: string; label?: string; generated?: boolean; status?: string };

// Translates only the text lines of a WebVTT, keeping every cue timing, in chunks.
async function translateVtt(vtt: string, targetName: string) {
  const credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS || "{}");
  const vertex = createVertex({ project: credentials.project_id, location: "global", googleAuthOptions: { credentials } });

  const blocks = vtt.replace(/\r/g, "").split(/\n{2,}/);
  const header = blocks[0].startsWith("WEBVTT") ? blocks.shift()! : "WEBVTT";
  const cues = blocks.filter((b) => b.includes("-->"));

  const out: string[] = [];
  for (let i = 0; i < cues.length; i += 120) {
    const chunk = cues.slice(i, i + 120);
    // Number the cues so the model's answer can be matched back without touching timings.
    const numbered = chunk.map((c, n) => `[${n}] ${c.split("\n").filter((l) => !l.includes("-->")).join(" ")}`).join("\n");
    const { text } = await generateText({
      model: vertex("gemini-3.1-flash-lite"),
      system: `You translate video subtitles from Brazilian Portuguese to ${targetName}. The video is a course for tattoo artists about marketing and positioning. Keep it natural and short, like real subtitles. Keep proper names and brand names (Ink Authority, Instagram, Reels). Answer with exactly one line per input line, in the same "[n] text" format, nothing else.`,
      prompt: numbered,
    });
    const map = new Map<number, string>();
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*\[(\d+)\]\s*(.*)$/);
      if (m) map.set(Number(m[1]), m[2].trim());
    }
    chunk.forEach((c, n) => {
      const timing = c.split("\n").find((l) => l.includes("-->"))!;
      const original = c.split("\n").filter((l) => !l.includes("-->") && !/^\d+$/.test(l.trim())).join(" ");
      out.push(`${timing}\n${map.get(n) || original}`);
    });
  }
  return `${header}\n\n${out.join("\n\n")}\n`;
}

// Step by step, so each call stays short: the client calls again while the status is "processing".
// 1. Ask Cloudflare Stream to generate the Portuguese captions from the audio (runs on their side).
// 2. When ready, translate them to English and Spanish keeping the timings, and upload.
export async function POST(req: NextRequest) {
  if (!(await checkIsAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { videoId } = await req.json();
    if (!videoId || !/^[a-f0-9]{32}$/i.test(videoId)) return NextResponse.json({ error: "videoId inválido" }, { status: 400 });

    const captions: Caption[] = (await cfJson(`${videoId}/captions`)) ?? [];
    const pt = captions.find((c) => c.language === SOURCE);

    if (!pt) {
      await cfJson(`${videoId}/captions/${SOURCE}/generate`, { method: "POST" });
      return NextResponse.json({ status: "processing", message: "Transcrevendo o áudio (pode levar alguns minutos)..." });
    }
    if (pt.status === "error") {
      // Clear the failed track so the next click starts over.
      await cf(`${videoId}/captions/${SOURCE}`, { method: "DELETE" });
      return NextResponse.json({ error: "A transcrição falhou no Cloudflare. Clique de novo para tentar outra vez." }, { status: 502 });
    }
    if (pt.status && pt.status !== "ready") {
      return NextResponse.json({ status: "processing", message: "Transcrevendo o áudio (pode levar alguns minutos)..." });
    }

    const missing = TARGETS.filter((t) => !captions.some((c) => c.language === t.code));
    if (missing.length) {
      const vttRes = await cf(`${videoId}/captions/${SOURCE}/vtt`);
      if (!vttRes.ok) throw new Error(`Não foi possível baixar a legenda em português (${vttRes.status}).`);
      const vtt = await vttRes.text();

      // One language per call keeps each request well within the time limit.
      const target = missing[0];
      const translated = await translateVtt(vtt, target.name);
      const form = new FormData();
      form.append("file", new Blob([translated], { type: "text/vtt" }), `${target.code}.vtt`);
      await cfJson(`${videoId}/captions/${target.code}`, { method: "PUT", body: form });

      if (missing.length > 1) {
        return NextResponse.json({ status: "processing", message: `Traduzindo (${target.code.toUpperCase()} pronto)...` });
      }
    }

    return NextResponse.json({ status: "done", message: "Legendas prontas", languages: [SOURCE, ...TARGETS.map((t) => t.code)] });
  } catch (err: any) {
    console.error("Caption generation error:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
