// GET /api/orders/DV-XXXXX?phone=080...  — customer order tracking
const json = (data, status = 200) => Response.json(data, { status });
const digits = (s) => String(s || "").replace(/\D/g, "").slice(-10); // compare last 10 digits (handles 080… vs 23480…)

export async function onRequestGet({ params, request, env }) {
  const id = String(params.id || "").toUpperCase();
  const phone = new URL(request.url).searchParams.get("phone");
  if (!/^DV-[A-Z0-9]{5}$/.test(id) || !phone) return json({ error: "Enter a valid order number and phone." }, 400);
  if (!env.DB) return json({ error: "Database not connected" }, 503);

  const row = await env.DB.prepare("SELECT id, created_at, status, method, items, total, phone FROM orders WHERE id = ?").bind(id).first();
  if (!row || digits(row.phone) !== digits(phone)) return json({ error: "We couldn't find that order. Check the number and phone." }, 404);

  const { phone: _p, ...order } = row;
  order.items = JSON.parse(order.items).map(({ name, qty }) => ({ name, qty }));
  return json({ order });
}
