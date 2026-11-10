// Staff-only order management.
// GET   /api/admin/orders             — latest 300 orders
// PATCH /api/admin/orders {id,status} — update an order's status
// Send header:  Authorization: Bearer <ADMIN_KEY>
import { STATUSES } from "../../../public/js/data.js";

const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

async function safeEqual(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const x = new Uint8Array(ha), y = new Uint8Array(hb);
  let diff = 0; for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function onRequest({ request, env, next }) {
  if (!env.ADMIN_KEY || env.ADMIN_KEY.length < 8) return json({ error: "ADMIN_KEY is not set on the server (min 8 characters)." }, 500);
  const given = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!given || !(await safeEqual(given, env.ADMIN_KEY))) return json({ error: "Unauthorized" }, 401);
  if (!env.DB) return json({ error: "Database not connected" }, 503);

  if (request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 300").all();
    return json({ orders: results.map((r) => ({ ...r, items: JSON.parse(r.items) })) });
  }

  if (request.method === "PATCH") {
    let body; try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
    if (!STATUSES[body.status]) return json({ error: "Unknown status" }, 400);
    const r = await env.DB.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(body.status, String(body.id)).run();
    if (!r.meta.changes) return json({ error: "Order not found" }, 404);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
}
