// Cloudflare Stream: signed playback for paid lessons.
// Videos marked "requireSignedURLs" only play with a short-lived token issued here,
// so knowing a video id is no longer enough to watch a lesson.

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

export const STREAM_TOKEN_TTL_SECONDS = 6 * 3600;

const cf = (path: string, init: RequestInit = {}) =>
  fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });

export const isVideoId = (id: unknown): id is string => typeof id === "string" && /^[a-f0-9]{32}$/i.test(id);

/** A playback token for one video, valid for a few hours. */
export async function signedToken(videoId: string) {
  const res = await cf(`${videoId}/token`, {
    method: "POST",
    body: JSON.stringify({ exp: Math.floor(Date.now() / 1000) + STREAM_TOKEN_TTL_SECONDS }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.result?.token) throw new Error(body.errors?.[0]?.message || `Cloudflare ${res.status}`);
  return body.result.token as string;
}

/** Turns signed-only playback on (or off) for a video. */
export async function requireSigned(videoId: string, on = true) {
  const res = await cf(videoId, { method: "POST", body: JSON.stringify({ uid: videoId, requireSignedURLs: on }) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.errors?.[0]?.message || `Cloudflare ${res.status}`);
  return !!body.result?.requireSignedURLs;
}
