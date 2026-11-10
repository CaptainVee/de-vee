# Devee Foods website

A food-ordering site that runs entirely on Cloudflare's free plan:

- **Website** (Cloudflare Pages): home, menu with cart, checkout, order tracking, about/contact/FAQ, blog
- **Order server** (Pages Functions in `functions/`): saves orders and checks prices
- **Database** (Cloudflare D1): stores every order
- **Staff dashboard** at `/admin.html`: see orders and update their status
- **WhatsApp**: after checkout, the customer sends the order to your WhatsApp in one tap

## Folder layout

```
public/            ← everything visitors see
  index.html, menu.html, track.html, about.html, blog.html, admin.html
  css/styles.css
  js/data.js       ← EDIT THIS: menu, prices, delivery areas, slots, phone, bank details
  js/app.js        ← site logic (cart, checkout, tracking)
  js/admin.js      ← staff dashboard
  images/          ← logo.svg + your food photos (foodone.png, foodtwo.png, …)
functions/api/     ← the order server
schema.sql         ← database table
wrangler.toml      ← Cloudflare settings
```

## 1. Before you deploy

1. Copy your food photos into `public/images/` (`foodone.png`, `foodtwo.png`, `foodthree.png`, `foodfour.png`). Add more photos and set `img:` for each dish in `public/js/data.js`.
2. Open `public/js/data.js` and fill in your WhatsApp number, phone, address, bank details, menu, prices and delivery areas.

## 2. Deploy (one time setup, about 10 minutes)

You need Node.js installed. In a terminal inside this folder:

```bash
npm install -g wrangler        # Cloudflare's tool
wrangler login                 # opens the browser to log in

# create the database, then copy the database_id it prints into wrangler.toml
wrangler d1 create devee-foods-db

# create the orders table
wrangler d1 execute devee-foods-db --remote --file=schema.sql

# create the site and deploy
wrangler pages project create devee-foods --production-branch=main
wrangler pages deploy

# set your staff dashboard password (8+ characters, keep it secret)
wrangler pages secret put ADMIN_KEY
wrangler pages deploy          # deploy again so the password takes effect
```

The site will be live at `https://devee-foods.pages.dev`. You can add your own domain (e.g. deveefoods.app) under **Workers & Pages → devee-foods → Custom domains**.

**Prefer GitHub?** Push this folder to a GitHub repo, then in Cloudflare go to **Workers & Pages → Create → Pages → Connect to Git**. Set the build output directory to `public`. Then under the project's **Settings → Bindings**, add a D1 binding named `DB` and under **Variables and Secrets** add `ADMIN_KEY`. Every push redeploys automatically.

## 3. Updating the site

Edit files → run `wrangler pages deploy` (or push to GitHub).

## Test locally

```bash
npm install
wrangler d1 execute devee-foods-db --local --file=schema.sql
echo "ADMIN_KEY=localtest123" > .dev.vars
wrangler pages dev
```
Open http://localhost:8788

## Free plan limits (more than enough for a growing food business)

- Static pages: unlimited visits
- Order server: 100,000 requests per day
- Database: 5 GB storage, 100,000 writes per day
