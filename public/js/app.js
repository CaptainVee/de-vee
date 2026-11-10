import {
  BRAND, SLOTS_ON, SLOTS, ZONES, MIN_ORDER, CATEGORIES, MENU, HERO_ROTATION, TICKER,
  DEALS, FAQS, STATUSES, naira, slotStatus,
} from "./data.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const page = document.body.dataset.page;
const byId = Object.fromEntries(MENU.map((m) => [m.id, m]));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const initials = (name) => name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
// If a photo fails to load, try the backup photo, then fall back to a lettered plate.
window.__imgFail = (el) => {
  const alt = el.dataset.photo;
  if (alt && el.src !== alt) { el.src = alt; el.dataset.photo = ""; return; }
  el.replaceWith(Object.assign(document.createElement("div"), { className: "plate", textContent: el.dataset.ini || "DV" }));
};
const pic = (item) => (item.img || item.photo)
  ? `<img src="${item.img || item.photo}" data-photo="${item.photo || ""}" data-ini="${initials(item.name)}" alt="${esc(item.name)}" loading="lazy" onerror="__imgFail(this)">`
  : `<div class="plate">${initials(item.name)}</div>`;

// ---------- icons ----------
const I = {
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  food: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 13h18a9 9 0 0 1-18 0z"/><path d="M8 9c0-2 2-2 2-4M12 9c0-2 2-2 2-4M16 9c0-2 2-2 2-4"/></svg>',
  track: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  tt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 3v11a4 4 0 1 1-4-4"/><path d="M14 3c0 3 2 5 5 5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l16 16M20 4 4 20"/></svg>',
};

// ---------- storage (works even where localStorage is blocked) ----------
const store = {
  mem: {},
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return this.mem[k] ?? d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { this.mem[k] = v; } },
};

// ---------- cart ----------
let cart = store.get("devee_cart", {}).constructor === Object ? store.get("devee_cart", {}) : {};
for (const id of Object.keys(cart)) if (!byId[id]) delete cart[id];
const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
const subtotal = () => Object.entries(cart).reduce((s, [id, q]) => s + byId[id].price * q, 0);
function setQty(id, q) {
  if (q <= 0) delete cart[id]; else cart[id] = Math.min(q, 50);
  store.set("devee_cart", cart);
  refreshCart();
}
function addToCart(id, n = 1) {
  setQty(id, (cart[id] || 0) + n);
  toast(`${byId[id].name} added to your order`);
}

// ---------- layout ----------
function navLinks() {
  return [["index.html", "Home", "home"], ["menu.html", "Menu", "menu"], ["track.html", "Track Order", "track"], ["about.html", "About", "about"], ["about.html#contact", "Contact", "contact"]];
}
function renderLayout() {
  if (BRAND.announcement) document.body.insertAdjacentHTML("afterbegin", `<div class="announce">${esc(BRAND.announcement)}</div>`);
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="wrap bar">
      <a class="logo" href="index.html" aria-label="Devee Foods home"><img src="images/logo.svg" alt="Devee Foods"></a>
      <nav class="nav">${navLinks().map(([h, t, p]) => `<a href="${h}" class="${p === page ? "active" : ""}">${t}</a>`).join("")}</nav>
      <div class="head-actions">
        <a class="btn btn-gold btn-sm order-head" href="menu.html">Order now</a>
        <button class="icon-btn cart-btn" data-open-cart aria-label="Open cart">${I.cart}<span class="count" data-count>0</span></button>
        <button class="icon-btn menu-toggle" aria-label="Open menu">${I.menu}</button>
      </div>
    </div>`;
  document.querySelector(".announce") ? document.querySelector(".announce").after(header) : document.body.prepend(header);

  document.body.insertAdjacentHTML("beforeend", `
    <div class="mobile-nav"><div class="panel"><button class="close" aria-label="Close menu">×</button>
      ${navLinks().map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}
      <a class="btn btn-gold" style="margin-top:18px;border:0" href="menu.html">Order now</a></div></div>
    <footer class="site-footer"><div class="wrap">
      <div class="foot-grid">
        <div><img src="images/logo.svg" alt="Devee Foods"><p>${esc(BRAND.tagline)}. Fresh home-style meals cooked daily and delivered hot to your door, or ready for pickup.</p>
          <div class="socials"><a href="${BRAND.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a><a href="${BRAND.social.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${I.tt}</a><a href="${BRAND.social.x}" target="_blank" rel="noopener" aria-label="X">${I.x}</a></div></div>
        <div><h4>Explore</h4><ul><li><a href="menu.html">Order online</a></li><li><a href="menu.html#combos">Combos & deals</a></li><li><a href="track.html">Track your order</a></li></ul></div>
        <div><h4>Devee Foods</h4><ul><li><a href="about.html">About us</a></li><li><a href="about.html#contact">Contact us</a></li><li><a href="about.html#faq">FAQs</a></li><li><a href="about.html#terms">Terms</a></li></ul></div>
        <div><h4>Get in touch</h4><ul><li><a href="${waLink("Hi Devee Foods!")}" target="_blank" rel="noopener">WhatsApp: ${esc(BRAND.phoneDisplay)}</a></li><li><a href="tel:${BRAND.phoneDisplay.replace(/\s/g, "")}">Call: ${esc(BRAND.phoneDisplay)}</a></li><li>${esc(BRAND.email)}</li><li>${esc(BRAND.address)}</li></ul></div>
      </div>
      <div class="copy"><span>© ${new Date().getFullYear()} Devee Foods. All rights reserved.</span><span>Made with ❤️ and pepper.</span></div>
    </div></footer>
    <nav class="bottom-nav"><div class="in">
      <a href="index.html" class="${page === "home" ? "active" : ""}">${I.home}Home</a>
      <a href="menu.html" class="${page === "menu" ? "active" : ""}">${I.food}Menu</a>
      <button data-open-cart>${I.cart}Cart<span class="count" data-count>0</span></button>
      <a href="track.html" class="${page === "track" ? "active" : ""}">${I.track}Orders</a>
      <a href="about.html#contact" class="${page === "about" ? "active" : ""}">${I.chat}Contact</a>
    </div></nav>
    <div class="overlay" id="cartOverlay"><aside class="drawer" role="dialog" aria-label="Your order">
      <div class="drawer-head"><h2>Your order</h2><button class="x" data-close aria-label="Close">×</button></div>
      <div class="drawer-body" id="cartBody"></div>
      <div class="drawer-foot" id="cartFoot"></div>
    </aside></div>
    <div class="overlay" id="checkoutOverlay"><div class="modal" role="dialog" aria-label="Checkout">
      <div class="modal-head"><h2 id="coTitle">Checkout</h2><button class="x" data-close aria-label="Close">×</button></div>
      <div class="modal-body" id="coBody"></div>
    </div></div>
    <div class="cart-bar" id="cartBar"><span><b data-count>0</b> item(s) · <b id="barTotal">₦0</b></span><button class="btn btn-gold btn-sm" data-open-cart>View order →</button></div>
    <div class="toast" id="toast"></div>`);

  const mnav = $(".mobile-nav");
  $(".menu-toggle").onclick = () => mnav.classList.add("open");
  mnav.onclick = (e) => { if (e.target === mnav || e.target.closest(".close") || e.target.closest("a")) mnav.classList.remove("open"); };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-cart]")) openOverlay("cartOverlay");
    const add = e.target.closest("[data-add]");
    if (add) addToCart(add.dataset.add);
    const q = e.target.closest("[data-q]");
    if (q) setQty(q.dataset.id, (cart[q.dataset.id] || 0) + Number(q.dataset.q));
    if (e.target.closest("[data-close]") || e.target.classList.contains("overlay")) closeOverlays();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeOverlays(); });
}

function openOverlay(id) { closeOverlays(); $("#toast")?.classList.remove("show"); $("#" + id).classList.add("open"); document.body.classList.add("lock"); }
function closeOverlays() { $$(".overlay.open").forEach((o) => o.classList.remove("open")); document.body.classList.remove("lock"); }

let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1900);
}

function waLink(text) { return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`; }

// ---------- cart rendering ----------
function refreshCart() {
  const n = cartCount();
  $$("[data-count]").forEach((c) => (c.textContent = n));
  const bar = $("#cartBar");
  if (bar) { bar.classList.toggle("show", n > 0 && page === "menu"); $("#barTotal").textContent = naira(subtotal()); }
  $$("[data-item-ctl]").forEach((el) => (el.innerHTML = itemCtl(el.dataset.itemCtl)));

  const body = $("#cartBody"), foot = $("#cartFoot");
  if (!body) return;
  if (!n) {
    body.innerHTML = `<div class="empty-cart"><div class="plate">:(</div><h3>Your plate is empty</h3><p>Add something delicious from the menu.</p><a class="btn btn-red" style="margin-top:18px" href="menu.html">Browse the menu</a></div>`;
    foot.innerHTML = "";
    return;
  }
  body.innerHTML = Object.entries(cart).map(([id, q]) => {
    const m = byId[id];
    return `<div class="line"><div class="thumb">${pic(m)}</div><div class="meta"><b>${esc(m.name)}</b><small>${naira(m.price)} each</small></div>
      <div class="qty"><button data-q="-1" data-id="${id}" aria-label="Remove one">−</button><span>${q}</span><button class="plus" data-q="1" data-id="${id}" aria-label="Add one">+</button></div></div>`;
  }).join("");
  const st = subtotal(), short = MIN_ORDER - st;
  foot.innerHTML = `<div class="sum-row total"><span>Subtotal</span><span>${naira(st)}</span></div>
    <p class="muted" style="font-size:.85rem;margin:6px 0 14px">Delivery fee is added at checkout based on your area.</p>
    ${short > 0 ? `<div class="note-box">Add ${naira(short)} more to reach our minimum order of ${naira(MIN_ORDER)}.</div>` : ""}
    <button class="btn btn-red btn-block" id="toCheckout" ${short > 0 ? "disabled" : ""}>Checkout · ${naira(st)}</button>`;
  $("#toCheckout").onclick = openCheckout;
}

function itemCtl(id) {
  const q = cart[id] || 0;
  return q
    ? `<div class="qty"><button data-q="-1" data-id="${id}" aria-label="Remove one">−</button><span>${q}</span><button class="plus" data-q="1" data-id="${id}" aria-label="Add one">+</button></div>`
    : `<button class="add" data-add="${id}">Add +</button>`;
}

// ---------- checkout ----------
const co = store.get("devee_customer", { method: "delivery", name: "", phone: "", zone: ZONES[0].id, address: "", slot: "", payment: "transfer", notes: "" });

function openCheckout() {
  openOverlay("checkoutOverlay");
  $("#coTitle").textContent = "Checkout";
  renderCheckout();
}

const needsSlot = () => SLOTS_ON && Object.keys(cart).some((id) => byId[id].slots);

function renderCheckout() {
  const slotItems = Object.keys(cart).filter((id) => byId[id].slots).map((id) => byId[id].name).join(", ");
  const slotsHtml = needsSlot() ? `<div class="note-box" style="margin-top:0">The <b>${esc(slotItems)}</b> is cooked in batches, so please pick a slot for it. Everything else is ready any time.</div>` + (SLOTS_ON ? `<div class="field"><label>When should we have it ready?</label><div class="opt-list">
    ${SLOTS.map((s) => { const st = slotStatus(s); return `<label class="opt ${st.open ? "" : "disabled"}"><input type="radio" name="slot" value="${s.id}" ${st.open ? "" : "disabled"} ${co.slot === s.id && st.open ? "checked" : ""}>
      <span class="t"><b>${s.name} · ${st.when}</b><small>${s.window} · ${st.open ? `order before ${fmtHour(s.cutoff)}` : "closed for now"}</small></span><span class="pill ${st.open ? "open" : "closed"}">${st.open ? "Open" : "Closed"}</span></label>`; }).join("")}
  </div></div>` : "") : "";
  const zone = ZONES.find((z) => z.id === co.zone) || ZONES[0];
  const fee = co.method === "delivery" ? zone.fee : 0;
  const st = subtotal();

  $("#coBody").innerHTML = `
    <form id="coForm" novalidate>
      <div class="seg"><button type="button" data-method="delivery" class="${co.method === "delivery" ? "active" : ""}">🛵 Delivery</button><button type="button" data-method="pickup" class="${co.method === "pickup" ? "active" : ""}">🛍️ Pickup</button></div>
      <div class="row2">
        <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" value="${esc(co.name)}" autocomplete="name" required></div>
        <div class="field"><label for="f-phone">Phone (WhatsApp)</label><input id="f-phone" name="phone" value="${esc(co.phone)}" inputmode="tel" autocomplete="tel" placeholder="080..." required></div>
      </div>
      ${co.method === "delivery" ? `
        <div class="field"><label for="f-zone">Delivery area</label><select id="f-zone" name="zone">${ZONES.map((z) => `<option value="${z.id}" ${z.id === zone.id ? "selected" : ""}>${esc(z.name)}${z.confirm ? "" : ` — ${z.fee ? naira(z.fee) : "Free"}`}</option>`).join("")}</select></div>
        <div class="field"><label for="f-address">Delivery address</label><textarea id="f-address" name="address" rows="2" placeholder="House number, street, landmark (or hostel & room number)" required>${esc(co.address)}</textarea></div>`
      : `<div class="note-box"><b>Pickup from:</b> ${esc(BRAND.address)}<br><span class="muted">${esc(BRAND.pickupNote)}</span></div>`}
      ${slotsHtml}
      <div class="field"><label>Payment</label><div class="opt-list">
        <label class="opt"><input type="radio" name="payment" value="transfer" ${co.payment === "transfer" ? "checked" : ""}><span class="t"><b>Bank transfer</b><small>Account details shown after you place the order</small></span></label>
        <label class="opt"><input type="radio" name="payment" value="on_delivery" ${co.payment === "on_delivery" ? "checked" : ""}><span class="t"><b>Pay on ${co.method === "delivery" ? "delivery" : "pickup"}</b><small>Cash or transfer when you get your food</small></span></label>
      </div></div>
      <div class="field"><label for="f-notes">Notes (optional)</label><input id="f-notes" name="notes" value="${esc(co.notes)}" placeholder="E.g. extra pepper, no onions, call when you arrive"></div>
      <div class="sum-row"><span>Subtotal</span><span>${naira(st)}</span></div>
      <div class="sum-row"><span>${co.method === "delivery" ? "Delivery" : "Pickup"}</span><span>${co.method === "delivery" ? (zone.confirm ? "To be confirmed" : fee ? naira(fee) : "Free") : "Free"}</span></div>
      <div class="sum-row total"><span>Total</span><span>${naira(st + fee)}</span></div>
      <p class="field err" id="coErr" style="margin-top:10px"></p>
      <button class="btn btn-red btn-block" id="placeBtn" type="submit" style="margin-top:8px">Place order · ${naira(st + fee)}</button>
      <p class="muted center" style="font-size:.82rem;margin-top:10px">After placing your order we'll open WhatsApp so you can send it to us.</p>
    </form>`;

  const form = $("#coForm");
  const save = () => {
    const fd = new FormData(form);
    for (const k of ["name", "phone", "zone", "address", "slot", "payment", "notes"]) if (fd.has(k)) co[k] = String(fd.get(k)).trim();
    store.set("devee_customer", co);
  };
  $$("[data-method]", form).forEach((b) => (b.onclick = () => { save(); co.method = b.dataset.method; renderCheckout(); }));
  form.addEventListener("change", (e) => { save(); if (e.target.name === "zone") renderCheckout(); });
  form.onsubmit = (e) => { e.preventDefault(); save(); placeOrder(); };
}

function fmtHour(h) { const ap = h >= 12 ? "pm" : "am"; return `${((h + 11) % 12) + 1}${ap}`; }

function validate() {
  if (co.name.length < 2) return "Please enter your name.";
  if (co.phone.replace(/\D/g, "").length < 10) return "Please enter a valid phone number.";
  if (co.method === "delivery" && co.address.length < 6) return "Please enter your delivery address.";
  if (needsSlot()) { const s = SLOTS.find((x) => x.id === co.slot); if (!s || !slotStatus(s).open) return "Please choose an open slot for the Campus Combo (or remove it to order other meals now)."; }
  if (subtotal() < MIN_ORDER) return `Minimum order is ${naira(MIN_ORDER)}.`;
  return "";
}

function orderMessage(o) {
  const lines = o.items.map((i) => `• ${i.qty} × ${i.name} — ${naira(i.qty * i.price)}`).join("\n");
  const slot = SLOTS.find((s) => s.id === o.slot);
  return [
    `Hello Devee Foods! 👋 I'd like to order.`,
    o.id ? `Order no: *${o.id}*` : "",
    ``, lines, ``,
    `Subtotal: ${naira(o.subtotal)}`,
    o.method === "delivery" ? `Delivery (${o.zoneName}): ${o.zoneConfirm ? "please confirm" : naira(o.deliveryFee)}` : `Pickup`,
    `*Total: ${naira(o.total)}*`, ``,
    `Name: ${o.name}`, `Phone: ${o.phone}`,
    o.method === "delivery" ? `Address: ${o.address}` : "",
    slot && o.items.some((i) => byId[i.id]?.slots) ? `Combo slot: ${slot.name} (${slot.window})` : "",
    `Payment: ${o.payment === "transfer" ? "Bank transfer" : "Pay on " + o.method}`,
    o.notes ? `Notes: ${o.notes}` : "",
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
}

async function placeOrder() {
  const err = validate();
  $("#coErr").textContent = err;
  if (err) return;
  const btn = $("#placeBtn"); btn.disabled = true; btn.textContent = "Placing order…";
  if (!needsSlot()) co.slot = "";

  // Open the WhatsApp tab straight away (while we still have the tap), then point it at the message.
  let waWin = null;
  try { waWin = window.open("", "_blank"); if (waWin) waWin.document.write("<p style='font:16px sans-serif;padding:20px'>Opening WhatsApp…</p>"); } catch { waWin = null; }

  const zone = ZONES.find((z) => z.id === co.zone) || ZONES[0];
  const payload = { ...co, items: Object.entries(cart).map(([id, qty]) => ({ id, qty })) };
  let order = {
    ...co, id: "", zoneName: zone.name, zoneConfirm: !!zone.confirm,
    items: Object.entries(cart).map(([id, qty]) => ({ id, qty, name: byId[id].name, price: byId[id].price })),
    subtotal: subtotal(), deliveryFee: co.method === "delivery" ? zone.fee : 0,
  };
  order.total = order.subtotal + order.deliveryFee;
  let saved = false;
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: ctrl.signal });
    clearTimeout(t);
    const data = await res.json().catch(() => null);
    if (res.status === 400 && data?.error) {           // a real problem with the order (e.g. slot just closed)
      try { waWin?.close(); } catch {}
      $("#coErr").textContent = data.error; btn.disabled = false; btn.textContent = "Place order"; return;
    }
    if (res.ok && data?.order?.id) {
      order = { ...order, ...data.order }; saved = true;
      const mine = store.get("devee_orders", []); mine.unshift({ id: order.id, phone: co.phone, at: Date.now() }); store.set("devee_orders", mine.slice(0, 10));
    }
  } catch { /* server unreachable: still send the order on WhatsApp */ }

  const link = waLink(orderMessage(order));
  let opened = false;
  if (waWin && !waWin.closed) { try { waWin.location.href = link; opened = true; } catch {} }
  cart = {}; store.set("devee_cart", cart); refreshCart();
  showSuccess(order, saved, opened);
}

function showSuccess(o, saved, opened) {
  $("#coTitle").textContent = saved ? "Order placed!" : "Almost done!";
  const link = waLink(orderMessage(o));
  $("#coBody").innerHTML = `<div class="success">
    <div class="tick">✓</div>
    ${saved ? `<p class="muted">Your order number is</p><div class="order-code">${esc(o.id)}</div>` : `<h3>Send your order on WhatsApp</h3>`}
    ${opened ? `<p class="note-box">WhatsApp has opened in a new tab with your order. Just press <b>Send</b>. If it didn't open, tap the green button below.</p>` : ""}
    <p class="muted">${saved ? "Tap the button below to send your order to us on WhatsApp. We'll confirm it and let you know when it's on the way." : "We couldn't reach our order system just now, but you can still send your order straight to us on WhatsApp."}</p>
    ${o.payment === "transfer" ? `<div class="bank"><b>Pay by transfer</b><div><span class="muted">Bank</span><span>${esc(BRAND.bank.bankName)}</span></div><div><span class="muted">Account no.</span><b>${esc(BRAND.bank.accountNumber)}</b></div><div><span class="muted">Name</span><span>${esc(BRAND.bank.accountName)}</span></div><div><span class="muted">Amount</span><b>${naira(o.total)}</b></div><small class="muted">Use your order number as the narration and send the receipt on WhatsApp.</small></div>` : ""}
    <a class="btn btn-wa btn-block" href="${link}" target="_blank" rel="noopener">Send order on WhatsApp</a>
    ${saved ? `<a class="btn btn-outline btn-block" style="margin-top:10px;color:var(--red)" href="track.html?id=${encodeURIComponent(o.id)}&phone=${encodeURIComponent(o.phone)}">Track this order</a>` : ""}
  </div>`;
}

// ---------- pages ----------
function initHome() {
  // hero rotation
  const word = $("#heroWord"), img = $("#heroImg");
  let i = 0;
  HERO_ROTATION.forEach((r) => { const im = new Image(); im.src = r.img; });
  const heroImgEl = $("img", img);
  heroImgEl.onerror = () => {
    const ph = HERO_ROTATION[i].photo;
    if (ph && heroImgEl.src !== ph) { heroImgEl.src = ph; return; }
    heroImgEl.style.display = "none"; if (!$(".plate", img)) img.insertAdjacentHTML("beforeend", '<div class="plate">DV</div>');
  };
  heroImgEl.onload = () => { heroImgEl.style.display = ""; $(".plate", img)?.remove(); };
  if (heroImgEl.complete && !heroImgEl.naturalWidth) heroImgEl.onerror();
  setInterval(() => {
    i = (i + 1) % HERO_ROTATION.length;
    word.classList.add("swap"); img.classList.add("swap");
    setTimeout(() => {
      word.textContent = HERO_ROTATION[i].word;
      heroImgEl.src = HERO_ROTATION[i].img;
      word.classList.remove("swap"); img.classList.remove("swap");
    }, 300);
  }, 2800);

  // ticker (duplicated for a seamless loop)
  const chips = TICKER.map((t) => `<a class="chip" href="menu.html">${esc(t)}</a>`).join("");
  $("#ticker").innerHTML = chips + chips;

  // deals
  $("#deals").innerHTML = DEALS.map((d) => `<div class="deal"><div class="badge">${esc(d.badge)}</div><div><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p><button data-add="${d.item}">Add to order +</button></div></div>`).join("");

  // category carousel
  const track = $("#cats");
  track.innerHTML = CATEGORIES.map((c) => {
    const first = MENU.find((m) => m.cat === c.id && m.img) || MENU.find((m) => m.cat === c.id) || { name: c.name, img: "" };
    return `<a class="cat-card" href="menu.html#${c.id}"><div class="cap"><span>${esc(c.name)}</span><span>→</span></div><div class="pic">${pic({ ...first, name: c.name })}</div><small>${esc(c.blurb)}</small></a>`;
  }).join("");
  $("#catPrev").onclick = () => track.scrollBy({ left: -260, behavior: "smooth" });
  $("#catNext").onclick = () => track.scrollBy({ left: 260, behavior: "smooth" });

  // visit card
  $("#hours").innerHTML = BRAND.hours.map(([d, h]) => `<li><span>${esc(d)}</span><b>${esc(h)}</b></li>`).join("");
  $("#addr").textContent = BRAND.address;
  $("#phone").innerHTML = `<a href="tel:${BRAND.phoneDisplay.replace(/\s/g, "")}">${esc(BRAND.phoneDisplay)}</a>`;
  $$("[data-wa]").forEach((a) => (a.href = waLink(a.dataset.wa)));

}

function initMenu() {
  const tabs = $("#tabs"), list = $("#menuList"), search = $("#search");
  tabs.innerHTML = CATEGORIES.map((c, i) => `<button data-cat="${c.id}" class="${i ? "" : "active"}">${esc(c.name)}</button>`).join("");
  const draw = (term = "") => {
    const t = term.toLowerCase();
    const html = CATEGORIES.map((c) => {
      const items = MENU.filter((m) => m.cat === c.id && (!t || (m.name + " " + m.desc).toLowerCase().includes(t)));
      if (!items.length) return "";
      return `<section class="menu-sec" id="${c.id}"><h2 class="display">${esc(c.name)}</h2><p>${esc(c.blurb)}</p><div class="items">
        ${items.map((m) => `<article class="item"><div class="pic">${m.tag ? `<span class="ribbon">${esc(m.tag)}</span>` : ""}${pic(m)}</div>
          <div class="body"><h3>${esc(m.name)}</h3><p>${esc(m.desc)}</p><div class="foot"><span class="price">${naira(m.price)}</span><span data-item-ctl="${m.id}">${itemCtl(m.id)}</span></div></div></article>`).join("")}
      </div></section>`;
    }).join("");
    list.innerHTML = html || `<div class="empty-search"><div class="plate" style="margin:0 auto 14px">?</div>No dishes match “${esc(term)}”.</div>`;
  };
  draw();
  search.oninput = () => draw(search.value.trim());
  tabs.onclick = (e) => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    if (search.value) { search.value = ""; draw(); }
    document.getElementById(b.dataset.cat)?.scrollIntoView({ behavior: "smooth" });
  };
  // highlight the tab of the section in view
  const spy = () => {
    let cur = CATEGORIES[0].id;
    for (const c of CATEGORIES) { const s = document.getElementById(c.id); if (s && s.getBoundingClientRect().top < 220) cur = c.id; }
    $$("[data-cat]", tabs).forEach((b) => { const on = b.dataset.cat === cur; b.classList.toggle("active", on); if (on && b.scrollIntoViewIfNeeded) b.scrollIntoViewIfNeeded(); });
  };
  window.addEventListener("scroll", spy, { passive: true });
  if (location.hash) setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView(), 50);
}

function initTrack() {
  const form = $("#trackForm"), out = $("#trackOut");
  const params = new URLSearchParams(location.search);
  const recent = store.get("devee_orders", []);
  form.id_.value = params.get("id") || recent[0]?.id || "";
  form.phone.value = params.get("phone") || recent[0]?.phone || "";
  const order = ["received", "confirmed", "preparing", "out_for_delivery", "delivered"];
  form.onsubmit = async (e) => {
    e.preventDefault();
    const id = form.id_.value.trim().toUpperCase(), phone = form.phone.value.trim();
    if (!id || !phone) { out.innerHTML = `<p class="field err">Enter your order number and phone number.</p>`; return; }
    out.innerHTML = `<p class="muted">Checking…</p>`;
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      const o = data.order;
      const steps = o.method === "pickup" ? ["received", "confirmed", "preparing", "ready_for_pickup", "delivered"] : order;
      const idx = steps.indexOf(o.status);
      out.innerHTML = `<div style="margin-top:22px"><div class="sum-row"><span>Order</span><b>${esc(o.id)}</b></div><div class="sum-row"><span>Total</span><b>${naira(o.total)}</b></div>
        <div class="sum-row"><span>Items</span><span>${o.items.map((i) => `${i.qty}× ${esc(i.name)}`).join(", ")}</span></div>
        ${o.status === "cancelled" ? `<div class="note-box" style="margin-top:14px">This order was cancelled. Message us on WhatsApp if this is a mistake.</div>` :
        `<ul class="timeline">${steps.map((s, i) => `<li class="${i <= idx ? "done" : ""}">${STATUSES[s] === "Delivered" && o.method === "pickup" ? "Picked up" : STATUSES[s]}</li>`).join("")}</ul>`}
        <a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="${waLink(`Hi Devee Foods, I'm checking on my order ${o.id}.`)}">Ask about this order on WhatsApp</a></div>`;
    } catch (err) {
      out.innerHTML = `<div class="note-box" style="margin-top:18px">${/fetch|json|Unexpected|Load failed/i.test(err.message) ? "Order tracking isn't available right now." : esc(err.message)} You can also <a href="${waLink(`Hi Devee Foods, I'm checking on my order ${id}.`)}" target="_blank" rel="noopener">ask us on WhatsApp</a>.</div>`;
    }
  };
  if (form.id_.value && form.phone.value) form.requestSubmit();
}

function initAbout() {
  $("#faqList").innerHTML = FAQS.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");
  $("#hours").innerHTML = BRAND.hours.map(([d, h]) => `<li><span>${esc(d)}</span><b>${esc(h)}</b></li>`).join("");
  $("#addr").textContent = BRAND.address;
  $("#phone").innerHTML = `<a href="tel:${BRAND.phoneDisplay.replace(/\s/g, "")}">${esc(BRAND.phoneDisplay)}</a> · ${esc(BRAND.email)}`;
  const f = $("#contactForm");
  f.onsubmit = (e) => {
    e.preventDefault();
    const d = new FormData(f);
    const msg = `Hi Devee Foods, my name is ${d.get("name")}.\n\n${d.get("message")}`;
    window.open(waLink(msg), "_blank", "noopener");
    $("#contactOk").classList.remove("hidden");
  };
}

// ---------- boot ----------
renderLayout();
refreshCart();
({ home: initHome, menu: initMenu, track: initTrack, about: initAbout }[page] || (() => {}))();
