# Devee Foods website

A food-ordering site that runs entirely on Cloudflare's free plan:

- **Website** (Cloudflare Workers, static assets): home, menu with cart, checkout, order tracking, about/contact/FAQ, blog
- **Order server** (Worker code in `src/`): saves orders and checks prices
- **Database** (Cloudflare D1): stores every order
- **Staff dashboard** at `/admin.html`: see orders and update their status
- **WhatsApp**: after checkout, the customer sends the order to your WhatsApp in one tap

The site deploys from GitHub: every time you commit and push, Cloudflare publishes the new version automatically.

## Folder layout

```
public/            ← everything visitors see
  index.html, menu.html, track.html, about.html, blog.html, admin.html
  css/styles.css
  js/data.js       ← EDIT THIS: menu, prices, delivery areas, slots, phone, bank details
  js/app.js        ← site logic (cart, checkout, tracking)
  js/admin.js      ← staff dashboard
  images/          ← logo.svg + food photos
src/index.js       ← Worker entry: sends /api/* to the order server, everything else to public/
src/api/           ← the order server
schema.sql         ← database table
wrangler.toml      ← Cloudflare settings
```

## 1. Before you deploy

1. Put your food photos in `public/images/` and set `img:` for each dish in `public/js/data.js`.
2. Open `public/js/data.js` and fill in your WhatsApp number, phone, address, bank details, menu, prices and delivery areas.

## 2. One-time setup in Cloudflare

All of this is done in the Cloudflare dashboard (dash.cloudflare.com).

**Create the database**

1. Go to **Storage & Databases → D1 → Create database**, name it `devee-foods-db`.
2. Open the database, go to the **Console** tab, paste the contents of `schema.sql` and run it.
3. Copy the database's **Database ID**, paste it into `wrangler.toml` in place of `PASTE-YOUR-DATABASE-ID-HERE`, then commit and push:

   ```bash
   git add wrangler.toml
   git commit -m "Set D1 database ID"
   git push
   ```

**Connect the GitHub repo**

1. Open your Worker under **Workers & Pages**, go to **Settings → Build**, and connect the `de-vee` GitHub repo.
2. Branch: `main`. Build command: leave empty. Deploy command: `npx wrangler deploy`.
3. Make sure `name` in `wrangler.toml` matches the Worker's name exactly, or the deploy will fail.

**Set the staff dashboard password**

1. In the Worker, go to **Settings → Variables and Secrets** and add a secret named `ADMIN_KEY` (8+ characters, keep it secret).
2. Push any change (or retry the latest build under **Deployments**) so it takes effect.

Your own domain (e.g. deveefoods.app) is set under the Worker's **Settings → Domains & Routes**.

## 3. Updating the site

Edit files, then commit and push:

```bash
git add .
git commit -m "Describe your change"
git push
```

Cloudflare picks up the push and redeploys within a minute or two. You can watch progress under the Worker's **Deployments** tab.

## Free plan limits (more than enough for a growing food business)

- Static pages: unlimited visits
- Order server: 100,000 requests per day
- Database: 5 GB storage, 100,000 writes per day
