"use client";

export type Purchase = { product_id: string; product_type: string };
export type Access = { isAdmin: boolean; purchases: Purchase[] };

let cached: { userId: string; promise: Promise<Access> } | null = null;

// Layout and page both ask on the same navigation; share one request per user.
export function fetchAccess(userId: string): Promise<Access> {
  if (cached?.userId === userId) return cached.promise;
  const promise = fetch("/api/me/access", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`access ${r.status}`))))
    .catch((err) => {
      cached = null;
      throw err;
    });
  cached = { userId, promise };
  return promise;
}

export function hasProductType(access: Access, types: string[]) {
  return access.isAdmin || access.purchases.some((p) => types.includes(p.product_type));
}
