import { STATUSES, SLOTS, BRAND, naira } from "./data.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let key = "";
try { key = sessionStorage.getItem("devee_admin") || ""; } catch {}
let orders = [], filter = "active", timer;

function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 1800); }

async function api(path, opts = {}) {
  const res = await fetch(path, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, ...(opts.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { status: res.status });
  return data;
}

async function load() {
  try {
    const data = await api("/api/admin/orders");
    orders = data.orders;
    $("#login").classList.add("hidden"); $("#dash").classList.remove("hidden"); $("#logout").classList.remove("hidden");
    $("#updated").textContent = "Updated " + new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
    render();
    clearInterval(timer); timer = setInterval(load, 30000);
  } catch (e) {
    if (e.status === 401) { key = ""; try { sessionStorage.removeItem("devee_admin"); } catch {} $("#loginErr").textContent = "Wrong admin key."; }
    else $("#loginErr").textContent = "Couldn't reach the order server. " + e.message;
    $("#login").classList.remove("hidden"); $("#dash").classList.add("hidden");
  }
}

function render() {
  const today = new Date().toISOString().slice(0, 10);
  const todays = orders.filter((o) => o.created_at.startsWith(today) && o.status !== "cancelled");
  const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  $("#stats").innerHTML = [
    ["Active orders", active.length], ["Today's orders", todays.length],
    ["Today's sales", naira(todays.reduce((s, o) => s + o.total, 0))], ["All-time orders", orders.length],
  ].map(([l, v]) => `<div class="stat"><small>${l}</small><b>${v}</b></div>`).join("");

  const list = orders.filter((o) => filter === "all" ? true : filter === "active" ? !["delivered", "cancelled"].includes(o.status) : o.status === filter);
  $("#orders").innerHTML = list.length ? list.map((o) => {
    const slot = SLOTS.find((s) => s.id === o.slot);
    const wa = `https://wa.me/${o.phone.replace(/\D/g, "").replace(/^0/, "234")}?text=${encodeURIComponent(`Hi ${o.name}, this is Devee Foods about your order ${o.id}.`)}`;
    return `<div class="order">
      <div><h3>${esc(o.id)}</h3><small>${new Date(o.created_at.replace(" ", "T") + "Z").toLocaleString("en-NG")}</small>
        <p style="margin-top:8px"><b>${esc(o.name)}</b><br><a href="${wa}" target="_blank" rel="noopener">${esc(o.phone)}</a></p>
        <small>${o.method === "delivery" ? `🛵 ${esc(o.zone_name)}<br>${esc(o.address)}` : "🛍️ Pickup"}</small></div>
      <div><ul>${o.items.map((i) => `<li>${i.qty} × ${esc(i.name)} <span class="muted">${naira(i.qty * i.price)}</span></li>`).join("")}</ul>
        ${o.notes ? `<p class="note-box" style="margin:8px 0 0;padding:8px 12px">📝 ${esc(o.notes)}</p>` : ""}
        <small style="margin-top:8px">${slot ? `Slot: ${slot.name} (${slot.window})` : ""} · ${o.payment === "transfer" ? "Bank transfer" : "Pay on " + o.method}</small></div>
      <div><span class="price">${naira(o.total)}</span><small>incl. ${naira(o.delivery_fee)} delivery</small>
        <select data-id="${o.id}" aria-label="Order status">${Object.entries(STATUSES).map(([k, v]) => `<option value="${k}" ${k === o.status ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    </div>`;
  }).join("") : `<div class="empty-search">No orders here yet.</div>`;
}

$("#login").onsubmit = (e) => { e.preventDefault(); key = $("#key").value.trim(); try { sessionStorage.setItem("devee_admin", key); } catch {} load(); };
$("#logout").onclick = () => { key = ""; try { sessionStorage.removeItem("devee_admin"); } catch {} clearInterval(timer); location.reload(); };
$("#refresh").onclick = load;
$("#filters").onclick = (e) => { const b = e.target.closest("[data-f]"); if (!b) return; filter = b.dataset.f; document.querySelectorAll("#filters button").forEach((x) => x.classList.toggle("active", x === b)); render(); };
$("#orders").onchange = async (e) => {
  const sel = e.target.closest("select[data-id]"); if (!sel) return;
  try { await api("/api/admin/orders", { method: "PATCH", body: JSON.stringify({ id: sel.dataset.id, status: sel.value }) }); orders.find((o) => o.id === sel.dataset.id).status = sel.value; render(); toast("Status updated"); }
  catch (err) { toast("Couldn't update: " + err.message); }
};
document.title = `Orders | ${BRAND.name}`;
if (key) load();
