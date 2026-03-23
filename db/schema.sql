-- Juniper Commerce — onX Data Schema
-- Compatible with PostgreSQL and SQLite (minor syntax differences noted)

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT 'juniper_001',
  name TEXT NOT NULL,
  description TEXT,
  handle TEXT,
  status TEXT DEFAULT 'active',
  vendor TEXT,
  tags TEXT,          -- JSON array stored as text
  categories TEXT,    -- JSON array stored as text
  options TEXT,       -- JSON array stored as text
  image_urls TEXT,    -- JSON array stored as text
  custom_fields TEXT  -- JSON array stored as text
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  external_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT 'juniper_001',
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  title TEXT,
  selected_options TEXT,  -- JSON array
  price REAL,
  currency TEXT DEFAULT 'USD',
  compare_at_price REAL,
  cost REAL,
  weight_value REAL,
  weight_unit TEXT,
  dim_length REAL,
  dim_width REAL,
  dim_height REAL,
  dim_unit TEXT,
  image_urls TEXT,       -- JSON array
  taxable INTEGER DEFAULT 1,
  inventory_not_tracked INTEGER DEFAULT 0,
  custom_fields TEXT     -- JSON array
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT 'juniper_001',
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  type TEXT DEFAULT 'individual',
  status TEXT DEFAULT 'active',
  notes TEXT,
  addresses TEXT,      -- JSON array
  custom_fields TEXT,  -- JSON array
  tags TEXT            -- JSON array
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT 'juniper_001',
  name TEXT,
  status TEXT DEFAULT 'confirmed',
  customer_id TEXT,
  customer_data TEXT,      -- JSON (denormalized customer snapshot)
  line_items TEXT NOT NULL, -- JSON array
  billing_address TEXT,    -- JSON
  shipping_address TEXT,   -- JSON
  currency TEXT DEFAULT 'USD',
  sub_total_price REAL,
  order_tax REAL,
  shipping_price REAL,
  total_price REAL,
  order_note TEXT,
  order_source TEXT,
  shipping_carrier TEXT,
  shipping_class TEXT,
  tags TEXT,               -- JSON array
  custom_fields TEXT,      -- JSON array
  payment_status TEXT
);

CREATE TABLE IF NOT EXISTS fulfillments (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT 'juniper_001',
  order_id TEXT NOT NULL REFERENCES orders(id),
  tracking_numbers TEXT,   -- JSON array
  line_items TEXT NOT NULL, -- JSON array
  status TEXT DEFAULT 'shipped',
  shipping_carrier TEXT,
  shipping_class TEXT,
  shipping_address TEXT,   -- JSON
  expected_ship_date TEXT,
  expected_delivery_date TEXT,
  location_id TEXT,
  custom_fields TEXT       -- JSON array
);

CREATE TABLE IF NOT EXISTS inventory (
  tenant_id TEXT NOT NULL DEFAULT 'juniper_001',
  sku TEXT NOT NULL,
  location_id TEXT NOT NULL,
  on_hand INTEGER DEFAULT 0,
  unavailable INTEGER DEFAULT 0,
  available INTEGER DEFAULT 0,
  PRIMARY KEY (sku, location_id)
);

CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  return_number TEXT,
  order_id TEXT NOT NULL REFERENCES orders(id),
  status TEXT DEFAULT 'requested',
  outcome TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT 'juniper_001',
  return_line_items TEXT,  -- JSON array
  total_quantity INTEGER,
  return_total REAL,
  refund_amount REAL,
  restocking_fee REAL,
  refund_status TEXT,
  refund_method TEXT,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_order ON fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_returns_order ON returns(order_id);
