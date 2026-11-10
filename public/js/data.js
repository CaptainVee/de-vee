// =====================================================================
//  DEVEE FOODS — SITE SETTINGS & MENU
//  Edit this one file to change prices, dishes, delivery areas, slots
//  and contact details. The website AND the order server both read it,
//  so totals are always checked against these prices.
// =====================================================================

export const BRAND = {
  name: "Devee Foods",
  tagline: "Affordable meals at your comfort",
  // WhatsApp number in international format, digits only (234 + number without the first 0)
  whatsapp: "2349114797560",
  phoneDisplay: "0911 479 7560",
  email: "hello@deveefoods.app",
  address: "Obadore bus stop, opposite B&C Hotel, LASU–Igando Road, Lagos",
  pickupNote: "Pick up from our kitchen at the address above.",
  hours: [
    ["Mon – Fri", "7:00am – 8:00pm"],
    ["Saturday", "8:00am – 8:00pm"],
    ["Sunday", "12:00pm – 6:00pm"],
  ],
  social: {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    x: "https://x.com/",
  },
  // Shown when a customer chooses bank transfer
  bank: { bankName: "Your Bank", accountNumber: "0000000000", accountName: "Devee Foods" },
  announcement: "🔥 Hot meals, fresh daily. Order any time for delivery or pickup!",
};

// Ordering slots (Lagos time). They ONLY apply to menu items marked `slots: true`
// (the Campus Jollof Combo). Everything else can be ordered any time. Set SLOTS_ON = false to turn them off.
// `cutoff` = the hour (24h) after which that slot stops taking orders for today.
// `nextDay: true` means orders placed before the cutoff are delivered the NEXT morning.
export const SLOTS_ON = true;
export const SLOTS = [
  { id: "morning",   name: "Morning",   window: "7:00am – 9:00am",  cutoff: 18, nextDay: true },
  { id: "afternoon", name: "Afternoon", window: "12:00pm – 2:00pm", cutoff: 10, nextDay: false },
  { id: "evening",   name: "Evening",   window: "5:00pm – 7:00pm",  cutoff: 15, nextDay: false },
];

// Delivery areas and fees in Naira. Add or remove as you like.
export const ZONES = [
  { id: "campus", name: "On campus", fee: 0 },
  { id: "zone-a", name: "Zone A — within 3km", fee: 800 },
  { id: "zone-b", name: "Zone B — 3 to 7km", fee: 1500 },
  { id: "zone-c", name: "Zone C — 7 to 12km", fee: 2500 },
  { id: "other",  name: "Somewhere else (we'll confirm the fee on WhatsApp)", fee: 0, confirm: true },
];

export const MIN_ORDER = 1500; // smallest order total (before delivery) we accept

export const CATEGORIES = [
  { id: "combos",  name: "Combos",          blurb: "Our best value plates" },
  { id: "rice",    name: "Rice Dishes",     blurb: "Jollof, fried & more" },
  { id: "swallow", name: "Swallow & Soups", blurb: "Proper home-style" },
  { id: "protein", name: "Proteins",        blurb: "Add something extra" },
  { id: "small",   name: "Small Chops",     blurb: "Snacks & sides" },
  { id: "drinks",  name: "Drinks",          blurb: "Chilled & fresh" },
];

// img: the photo shown for the dish. `photo` is a backup used if `img` fails to load
// (the combos use your campus photos foodone/two/three.png if you add them, otherwise a matching dish photo).
// To use your own photo, put it in /images and set img: "images/your-photo.jpg".
export const MENU = [
  { id: "campus-combo",  cat: "combos",  name: "Campus Jollof Combo",    price: 2500, img: "images/foodone.png", photo: "images/jollof-chicken.jpg",   tag: "Student deal", slots: true, desc: "Jollof rice + fried rice + chicken. Our best-seller." },
  { id: "big-combo",     cat: "combos",  name: "Big Boy Combo",          price: 4500, img: "images/foodtwo.png", photo: "images/fried-rice.jpg",   tag: "Popular",      desc: "Jollof + fried rice, two pieces of chicken, plantain and coleslaw." },
  { id: "party-combo",   cat: "combos",  name: "Party Pack (feeds 3)",   price: 12000, img: "images/foodthree.png", photo: "images/jollof-chicken.jpg", tag: "Share",       desc: "Party jollof, fried rice, 3 chicken, plantain, moi moi and salad." },
  { id: "jollof-chicken",cat: "rice",    name: "Jollof Rice & Chicken",  price: 3000, img: "images/jollof-chicken.jpg", photo: "",  desc: "Smoky party jollof with a juicy fried chicken." },
  { id: "fried-chicken", cat: "rice",    name: "Fried Rice & Chicken",   price: 3000, img: "images/fried-rice.jpg", photo: "",                     desc: "Vegetable fried rice with chicken." },
  { id: "white-stew",    cat: "rice",    name: "White Rice & Stew",      price: 2500, img: "images/white-rice-stew.jpg", photo: "",                     desc: "Fluffy white rice with rich tomato stew and beef." },
  { id: "coconut-rice",  cat: "rice",    name: "Coconut Rice & Turkey",  price: 4500, img: "images/coconut-rice.jpg", photo: "",                     desc: "Creamy coconut rice with peppered turkey." },
  { id: "egusi",         cat: "swallow", name: "Egusi & Pounded Yam",    price: 3500, img: "images/egusi.jpg", photo: "",                     desc: "Egusi soup with assorted meat and pounded yam." },
  { id: "efo",           cat: "swallow", name: "Efo Riro & Eba",         price: 3000, img: "images/efo-riro.jpg", photo: "",                     desc: "Spinach stew with beef and garri." },
  { id: "okra",          cat: "swallow", name: "Okra Soup & Semo",       price: 3000, img: "images/okra-soup.jpg", photo: "",                     desc: "Fresh okra soup with fish and beef." },
  { id: "chicken",       cat: "protein", name: "Extra Chicken",          price: 1500, img: "images/chicken.jpg", photo: "",                     desc: "One piece, fried or peppered." },
  { id: "turkey",        cat: "protein", name: "Peppered Turkey",        price: 2500, img: "images/turkey.jpg", photo: "",                     desc: "Spicy and tender." },
  { id: "beef",          cat: "protein", name: "Beef (2 pcs)",           price: 1000, img: "images/beef.jpg", photo: "",                     desc: "Stewed beef." },
  { id: "plantain",      cat: "small",   name: "Fried Plantain (Dodo)",  price: 700,  img: "images/dodo.jpg", photo: "",                     desc: "Sweet and golden." },
  { id: "moimoi",        cat: "small",   name: "Moi Moi",                price: 800,  img: "images/moi-moi.jpg", photo: "",                     desc: "Steamed bean pudding with egg." },
  { id: "puffpuff",      cat: "small",   name: "Puff-Puff (6 pcs)",      price: 600,  img: "images/puff-puff.jpg", photo: "",                     desc: "Soft and sweet." },
  { id: "meatpie",       cat: "small",   name: "Meat Pie",               price: 900,  img: "images/meat-pie.jpg", photo: "",                     desc: "Flaky pastry, minced beef filling." },
  { id: "zobo",          cat: "drinks",  name: "Zobo (50cl)",            price: 700,  img: "images/zobo.jpg", photo: "",                     desc: "Hibiscus with ginger and pineapple." },
  { id: "chapman",       cat: "drinks",  name: "Chapman",                price: 1200, img: "images/chapman.jpg", photo: "",                     desc: "Fruity, alcohol-free." },
  { id: "water",         cat: "drinks",  name: "Bottled Water",          price: 300,  img: "images/water.jpg", photo: "",                     desc: "75cl." },
  { id: "soft-drink",    cat: "drinks",  name: "Soft Drink (50cl)",      price: 600,  img: "images/soft-drink.jpg", photo: "",                     desc: "Coke, Fanta or Sprite." },
];

// Words that rotate in the hero: "Do you want to eat ___"
export const HERO_ROTATION = [
  { word: "Jollof Rice",  img: "images/jollof-chicken.jpg" },
  { word: "Fried Rice",   img: "images/fried-rice.jpg" },
  { word: "Chicken",      img: "images/chicken.jpg" },
  { word: "Egusi Soup",   img: "images/egusi.jpg" },
  { word: "Coconut Rice", img: "images/coconut-rice.jpg" },
];

export const TICKER = ["Jollof Rice", "Fried Rice", "Chicken", "Combos", "Swallow & Soups", "Small Chops", "Affordable Meals", "Fresh Daily", "Order Online", "Fast Delivery", "Pickup"];

export const DEALS = [
  { title: "Campus Jollof Combo", text: "Jollof + fried rice + chicken for just ₦2,500. Free delivery on campus.", badge: "₦2,500", item: "campus-combo" },
  { title: "Party Pack for 3",    text: "Feed the whole squad with one order. Perfect for hostels and offices.", badge: "Save 15%", item: "party-combo" },
];

export const FAQS = [
  ["Where do you deliver?", "We deliver on campus and to the areas listed at checkout. If your area isn't listed, choose \"Somewhere else\" and we'll confirm the fee on WhatsApp."],
  ["When can I order?", "Any time! Everything on the menu can be ordered whenever we're open. Only the Campus Jollof Combo is cooked in slots: Morning orders close at 6pm the day before, Afternoon at 10am and Evening at 3pm."],
  ["How do I pay?", "Pay by bank transfer (details are shown after you order) or pay on delivery. Please send your transfer receipt on WhatsApp."],
  ["Can I pick up my order?", "Yes. Choose Pickup at checkout and collect from our kitchen during your slot."],
  ["How do I track my order?", "Use the Track Order page with your order number (e.g. DV-7K3Q9) and the phone number you ordered with."],
  ["Can I cancel or change my order?", "Message us on WhatsApp as soon as possible. We can change orders until we start cooking for your slot."],
];

export const STATUSES = {
  received: "Order received",
  confirmed: "Confirmed",
  preparing: "Being prepared",
  out_for_delivery: "Out for delivery",
  ready_for_pickup: "Ready for pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// ---------- helpers shared by the website and the server ----------
export const naira = (n) => "₦" + Number(n).toLocaleString("en-NG");

export function lagosHour(date = new Date()) {
  return (date.getUTCHours() + 1) % 24; // Lagos is UTC+1, no daylight saving
}

export function slotStatus(slot, date = new Date()) {
  const open = lagosHour(date) < slot.cutoff;
  return { open, when: slot.nextDay ? "Tomorrow" : "Today" };
}
