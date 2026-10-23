import { NextRequest, NextResponse } from "next/server";
import { createVertex } from "@ai-sdk/google-vertex";
import { generateText } from "ai";
import { checkIsAdmin } from "@/lib/auth-server";

export const maxDuration = 300;

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const SOURCE = "pt";
const TARGETS = [
  { code: "en", name: "English", label: "inglês" },
  { code: "es", name: "Spanish (Latin America)", label: "espanhol" },
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

// Readable subtitles: at most 2 lines of ~42 characters, a little above the bottom edge and centered.
// Long cues are split in parts with the time shared by length, so nothing runs off the screen.
const MAX_LINE = 42;
const CUE_SETTINGS = "line:78% position:50% align:center size:86%";

const toSec = (t: string) => {
  const [h, m, s] = t.split(":").length === 3 ? t.split(":") : ["0", ...t.split(":")];
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};
const toStamp = (sec: number) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`;
};

function wrap(text: string) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && (line + " " + word).length > MAX_LINE) { lines.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

function formatVtt(vtt: string) {
  const blocks = vtt.replace(/\r/g, "").split(/\n{2,}/);
  const out: string[] = [];
  for (const block of blocks) {
    const rows = block.split("\n");
    const t = rows.findIndex((r) => r.includes("-->"));
    if (t < 0) continue;
    const [startRaw, endRaw] = rows[t].split("-->").map((x) => x.trim().split(/\s+/)[0]);
    const text = rows.slice(t + 1).join(" ").replace(/\s+/g, " ").trim();
    if (!text) continue;
    const lines = wrap(text);
    const parts: string[][] = [];
    for (let i = 0; i < lines.length; i += 2) parts.push(lines.slice(i, i + 2));
    const start = toSec(startRaw), end = toSec(endRaw);
    const total = parts.reduce((n, p) => n + p.join(" ").length, 0) || 1;
    let at = start;
    parts.forEach((part, i) => {
      const until = i === parts.length - 1 ? end : at + ((end - start) * part.join(" ").length) / total;
      out.push(`${toStamp(at)} --> ${toStamp(until)} ${CUE_SETTINGS}\n${part.join("\n")}`);
      at = until;
    });
  }
  return `WEBVTT\n\n${out.join("\n\n")}\n`;
}

async function uploadVtt(videoId: string, lang: string, vtt: string) {
  const put = () => {
    const form = new FormData();
    form.append("file", new Blob([vtt], { type: "text/vtt" }), `${lang}.vtt`);
    return cfJson(`${videoId}/captions/${lang}`, { method: "PUT", body: form });
  };
  try {
    await put();
  } catch {
    // A generated track may refuse to be overwritten; replace it.
    await cf(`${videoId}/captions/${lang}`, { method: "DELETE" });
    await put();
  }
}

// Re-formats every caption track a video already has.
async function formatAll(videoId: string, captions: Caption[]) {
  for (const c of captions.filter((c) => !c.status || c.status === "ready")) {
    const res = await cf(`${videoId}/captions/${c.language}/vtt`);
    if (!res.ok) throw new Error(`Não foi possível baixar a legenda ${c.language} (${res.status}).`);
    await uploadVtt(videoId, c.language, formatVtt(await res.text()));
  }
}

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
  return formatVtt(`${header}\n\n${out.join("\n\n")}\n`);
}

// Which caption languages a video already has, so the admin page can show it on load.
export async function GET(req: NextRequest) {
  if (!(await checkIsAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const videoId = req.nextUrl.searchParams.get("videoId") || "";
  if (!/^[a-f0-9]{32}$/i.test(videoId)) return NextResponse.json({ error: "videoId inválido" }, { status: 400 });
  try {
    const captions: Caption[] = (await cfJson(`${videoId}/captions`)) ?? [];
    const ready = captions.filter((c) => !c.status || c.status === "ready").map((c) => c.language);
    const all = [SOURCE, ...TARGETS.map((t) => t.code)];
    return NextResponse.json({ languages: ready, complete: all.every((l) => ready.includes(l)) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Step by step, so each call stays short: the client calls again while the status is "processing".
// Each answer carries the real progress (steps done out of 3) and the step that runs next.
// 1. Ask Cloudflare Stream to generate the Portuguese captions from the audio (runs on their side).
// 2. When ready, translate them to English and Spanish keeping the timings, and upload.
export async function POST(req: NextRequest) {
  if (!(await checkIsAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { videoId, translate, format } = await req.json();
    if (!videoId || !/^[a-f0-9]{32}$/i.test(videoId)) return NextResponse.json({ error: "videoId inválido" }, { status: 400 });

    const captions: Caption[] = (await cfJson(`${videoId}/captions`)) ?? [];
    const pt = captions.find((c) => c.language === SOURCE);

    if (format) {
      await formatAll(videoId, captions);
      return NextResponse.json({ status: "done", progress: 100, step: "Legendas formatadas" });
    }

    if (!pt) {
      await cfJson(`${videoId}/captions/${SOURCE}/generate`, { method: "POST" });
      return NextResponse.json({ status: "processing", progress: 5, step: "Transcrevendo o áudio" });
    }
    if (pt.status === "error") {
      // Clear the failed track so the next click starts over.
      await cf(`${videoId}/captions/${SOURCE}`, { method: "DELETE" });
      return NextResponse.json({ error: "A transcrição falhou no Cloudflare. Clique de novo para tentar outra vez." }, { status: 502 });
    }
    if (pt.status && pt.status !== "ready") {
      return NextResponse.json({ status: "processing", progress: 5, step: "Transcrevendo o áudio" });
    }

    const missing = TARGETS.filter((t) => !captions.some((c) => c.language === t.code));
    const doneSteps = 1 + TARGETS.length - missing.length;
    const progressOf = (steps: number) => Math.round((steps / (TARGETS.length + 1)) * 100);
    // Announce the translation first, so the page shows the right step while it runs.
    if (missing.length && !translate) {
      return NextResponse.json({ status: "processing", progress: progressOf(doneSteps), step: `Traduzindo para o ${missing[0].label}`, next: "translate" });
    }
    if (missing.length) {
      const vttRes = await cf(`${videoId}/captions/${SOURCE}/vtt`);
      if (!vttRes.ok) throw new Error(`Não foi possível baixar a legenda em português (${vttRes.status}).`);
      const vtt = await vttRes.text();
      if (pt.generated) await uploadVtt(videoId, SOURCE, formatVtt(vtt));

      // One language per call keeps each request well within the time limit.
      const target = missing[0];
      const translated = await translateVtt(vtt, target.name);
      await uploadVtt(videoId, target.code, translated);

      if (missing.length > 1) {
        return NextResponse.json({ status: "processing", progress: progressOf(doneSteps + 1), step: `Traduzindo para o ${missing[1].label}`, next: "translate" });
      }
    }

    return NextResponse.json({ status: "done", progress: 100, step: "Legendas prontas", languages: [SOURCE, ...TARGETS.map((t) => t.code)] });
  } catch (err: any) {
    console.error("Caption generation error:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
