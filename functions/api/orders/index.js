// POST /api/orders  — create an order
import { MENU, ZONES, SLOTS, SLOTS_ON, MIN_ORDER, slotStatus } from "../../../public/js/data.js";

const json = (data, status = 200) => Response.json(data, { status });
const clean = (v, max = 300) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

function newId() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L to avoid confusion
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return "DV-" + [...bytes].map((b) => chars[b % chars.length]).join("");
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20);
  const method = body.method === "pickup" ? "pickup" : "delivery";
  const payment = body.payment === "on_delivery" ? "on_delivery" : "transfer";
  const notes = clean(body.notes, 300);
  const address = method === "delivery" ? clean(body.address, 300) : "";

  if (name.length < 2) return json({ error: "Please enter your name." }, 400);
  if (phone.replace(/\D/g, "").length < 10) return json({ error: "Please enter a valid phone number." }, 400);
  if (method === "delivery" && address.length < 6) return json({ error: "Please enter your delivery address." }, 400);

  // Recalculate everything from the official menu so prices can't be tampered with.
  const menu = Object.fromEntries(MENU.map((m) => [m.id, m]));
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 40) return json({ error: "Your order is empty." }, 400);
  const items = [];
  for (const it of body.items) {
    const m = menu[it?.id];
    const qty = Math.floor(Number(it?.qty));
    if (!m || !(qty >= 1 && qty <= 50)) return json({ error: "Some items in your order are no longer available. Please refresh the menu." }, 400);
    items.push({ id: m.id, name: m.name, price: m.price, qty });
  }
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  if (subtotal < MIN_ORDER) return json({ error: `Minimum order is ₦${MIN_ORDER.toLocaleString()}.` }, 400);

  let zone = null;
  if (method === "delivery") {
    zone = ZONES.find((z) => z.id === body.zone);
    if (!zone) return json({ error: "Please choose a delivery area." }, 400);
  }
  let slot = "";
  if (SLOTS_ON && items.some((i) => menu[i.id].slots)) {   // slots only apply to items like the Campus Combo
    const s = SLOTS.find((x) => x.id === body.slot);
    if (!s || !slotStatus(s).open) return json({ error: "The Campus Combo slot you picked has closed. Pick another slot, or remove the combo to order other meals now." }, 400);
    slot = s.id;
  }
  const deliveryFee = zone ? zone.fee : 0;
  const total = subtotal + deliveryFee;

  if (!env.DB) return json({ error: "Database not connected" }, 503);
  let id;
  for (let tries = 0; tries < 4; tries++) {
    id = newId();
    try {
      await env.DB.prepare(
        `INSERT INTO orders (id, name, phone, method, zone, zone_name, address, slot, payment, notes, items, subtotal, delivery_fee, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, name, phone, method, zone?.id || null, zone?.name || null, address, slot, payment, notes, JSON.stringify(items), subtotal, deliveryFee, total).run();
      break;
    } catch (e) {
      if (!/UNIQUE|constraint/i.test(String(e)) || tries === 3) return json({ error: "Could not save your order. Please try again." }, 500);
    }
  }

  return json({ order: { id, status: "received", items, subtotal, deliveryFee, total, zoneName: zone?.name || "", zoneConfirm: !!zone?.confirm } }, 201);
}

export const onRequest = () => json({ error: "Method not allowed" }, 405);
