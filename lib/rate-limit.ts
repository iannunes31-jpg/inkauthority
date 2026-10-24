// Simple per-user request limiter (sliding window, in memory).
// Each server instance keeps its own count, so it is a speed bump against abuse
// (coupon guessing, AI spam), not an exact quota.

const hits = new Map<string, number[]>();

/** Returns a 429 response when `key` made more than `max` requests in `windowSec`, otherwise null. */
export function rateLimit(key: string, max: number, windowSec: number): Response | null {
  const now = Date.now();
  const since = now - windowSec * 1000;
  const recent = (hits.get(key) ?? []).filter((t) => t > since);
  if (recent.length >= max) {
    const retry = Math.ceil((recent[0] + windowSec * 1000 - now) / 1000);
    return new Response(JSON.stringify({ error: "Muitas tentativas seguidas. Aguarde um pouco e tente de novo." }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": String(retry) },
    });
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => t > since)) hits.delete(k);
  return null;
}
