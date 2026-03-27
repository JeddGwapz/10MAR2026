CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS price_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file TEXT NOT NULL,
  sheet_name TEXT NOT NULL,
  source_row_number INTEGER NOT NULL,
  row_label TEXT,
  size_label TEXT,
  model_name TEXT NOT NULL,
  property_text TEXT,
  prompter_monitor TEXT,
  portable_hardcase TEXT,
  protect_cover TEXT,
  software_bundle TEXT,
  camera_plate TEXT,
  global_online_price_usd NUMERIC(12,2),
  abroad_dealer_price_usd NUMERIC(12,2),
  product_slug TEXT,
  raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_file, sheet_name, source_row_number)
);

CREATE INDEX IF NOT EXISTS idx_price_list_items_model ON price_list_items (model_name);
CREATE INDEX IF NOT EXISTS idx_price_list_items_product_slug ON price_list_items (product_slug);
