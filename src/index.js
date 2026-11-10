// Worker entry point: routes /api/* to the order server, everything else to the site files in public/.
import * as createOrder from "./api/orders/index.js";
import * as trackOrder from "./api/orders/track.js";
import * as adminOrders from "./api/admin/orders.js";

const json = (data, status = 200) => Response.json(data, { status });

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const context = { request, env, ctx, params: {} };

    if (pathname === "/api/orders") {
      return request.method === "POST" ? createOrder.onRequestPost(context) : createOrder.onRequest(context);
    }

    const track = pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (track) {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      return trackOrder.onRequestGet({ ...context, params: { id: decodeURIComponent(track[1]) } });
    }

    if (pathname === "/api/admin/orders") return adminOrders.onRequest(context);

    if (pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);

    return env.ASSETS.fetch(request);
  },
};
