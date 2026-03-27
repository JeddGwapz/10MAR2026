CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS knowledge_qa_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  category_name TEXT NOT NULL,
  source_sheet TEXT NOT NULL,
  source_row_number INTEGER NOT NULL,
  item_code TEXT,
  item_number INTEGER,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  multimedia_asset TEXT,
  content_type TEXT,
  file_name TEXT,
  product_slug TEXT,
  raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_file, source_sheet, source_row_number)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_qa_category ON knowledge_qa_items (category_slug, source_row_number);
CREATE INDEX IF NOT EXISTS idx_knowledge_qa_product_slug ON knowledge_qa_items (product_slug);

ALTER TABLE knowledge_qa_items
ADD COLUMN IF NOT EXISTS item_code TEXT;
