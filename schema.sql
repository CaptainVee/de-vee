-- Devee Foods orders table (Cloudflare D1 / SQLite)
CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,                 -- e.g. DV-7K3Q9
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  status        TEXT NOT NULL DEFAULT 'received',
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  method        TEXT NOT NULL,                    -- delivery | pickup
  zone          TEXT,
  zone_name     TEXT,
  address       TEXT,
  slot          TEXT,
  payment       TEXT NOT NULL,                    -- transfer | on_delivery
  notes         TEXT,
  items         TEXT NOT NULL,                    -- JSON array
  subtotal      INTEGER NOT NULL,
  delivery_fee  INTEGER NOT NULL DEFAULT 0,
  total         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
