# Phase 2: Knowledge and Database Setup

## Goal
Turn product knowledge into structured data that can power:

- product lookup
- FAQ answers
- media suggestions
- future RAG ingestion
- multi-tenant admin workflows later

This phase should finish with three things:

1. a clean Google Sheets input format for non-technical updates
2. a normalized PostgreSQL schema for app data
3. a predictable import pipeline from Sheets to Postgres and storage

## Locked MVP Stack

- Data input: Google Sheets
- Main database: PostgreSQL
- File/video storage: AWS S3 or Cloudinary
- Optional backend shortcut: Supabase
- RAG prep language: Python

## Recommended Data Model

### Core Tables

- `tenants`
  - for future multi-tenant separation
- `product_families`
  - groups like Cue Series, Clone Series, Framer, Adamas
- `products`
  - the main product record
- `product_aliases`
  - alternate search names
- `product_specs`
  - structured specifications
- `product_faqs`
  - FAQ question/answer pairs
- `media_assets`
  - videos, brochures, PDFs, images
- `product_media_links`
  - map media to products
- `support_channels`
  - purchase/support contacts

### RAG-Ready Tables

- `documents`
  - brochure/manual/source documents
- `document_chunks`
  - text chunks for embeddings later
- `ingestion_runs`
  - logs for imports and sync jobs

## Google Sheets Structure

Use separate tabs so non-technical users do not break relational structure.

### Tab 1: `products`

One row per product.

Required columns:

- `tenant_slug`
- `family_slug`
- `product_slug`
- `product_name`
- `tagline`
- `summary`
- `status`

Recommended columns:

- `screen_size_inches`
- `resolution`
- `aspect_ratio`
- `brightness_cd_m2`
- `weight_kg`
- `inputs`
- `hero_image_url`
- `thumbnail_url`
- `buy_now_notes`

### Tab 2: `product_aliases`

One row per alias.

- `product_slug`
- `alias`
- `alias_type`

### Tab 3: `product_specs`

One row per spec item.

- `product_slug`
- `spec_group`
- `spec_label`
- `spec_value`
- `display_order`

Example:

- `cue24 | display | Screen Size | 23.8 inches | 1`
- `cue24 | display | Brightness | 1000 cd/m2 | 4`

### Tab 4: `product_faqs`

One row per FAQ item.

- `product_slug`
- `faq_key`
- `question`
- `answer`
- `keywords`
- `display_order`
- `is_published`

`keywords` should be comma-separated for MVP.

### Tab 5: `media_assets`

One row per file/video/image/brochure.

- `asset_slug`
- `asset_type`
- `title`
- `storage_provider`
- `storage_key`
- `public_url`
- `mime_type`
- `duration_seconds`
- `thumbnail_url`
- `source_label`

### Tab 6: `product_media_links`

One row per product-media relationship.

- `product_slug`
- `asset_slug`
- `usage_type`
- `display_order`
- `is_primary`

### Tab 7: `support_channels`

One row per support contact or channel.

- `tenant_slug`
- `channel_type`
- `label`
- `value`
- `region_code`
- `is_sales`
- `is_support`
- `display_order`

## Import Flow

### Step 1: Validate Sheets

Before import:

- reject missing slugs
- reject duplicate `product_slug`
- reject FAQ rows with missing question or answer
- reject media links that point to unknown products/assets

### Step 2: Normalize

Convert:

- booleans to true/false
- numbers to numeric fields
- comma-separated keywords to arrays
- blank strings to `NULL`

### Step 3: Upsert to Postgres

Order:

1. `tenants`
2. `product_families`
3. `products`
4. `product_aliases`
5. `product_specs`
6. `product_faqs`
7. `media_assets`
8. `product_media_links`
9. `support_channels`

### Step 4: Queue for RAG

After import:

- create/update document rows
- mark changed product summaries, FAQs, and brochures for chunking
- later generate embeddings in Python

## Storage Rules

### S3 Option

Recommended key pattern:

- `tenants/{tenant_slug}/products/{product_slug}/images/...`
- `tenants/{tenant_slug}/products/{product_slug}/videos/...`
- `tenants/{tenant_slug}/products/{product_slug}/docs/...`

### Cloudinary Option

Recommended folder pattern:

- `{tenant_slug}/products/{product_slug}/images`
- `{tenant_slug}/products/{product_slug}/videos`
- `{tenant_slug}/products/{product_slug}/docs`

## API Shape For Later Phases

These endpoints should be easy to build once this schema exists:

- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/products/:slug/faqs`
- `GET /api/products/:slug/media`
- `GET /api/search/products?q=...`
- `POST /api/import/google-sheets`

## Suggested Backend Folder Layout

```text
backend/
  src/
    api/
    db/
    services/
    importers/
    rag/
    storage/
```

Recommended service split:

- `services/product_service`
- `services/faq_service`
- `services/media_service`
- `importers/google_sheets_importer`
- `rag/chunker`
- `rag/embedder`

## Phase 2 Deliverables

Complete this phase only when all are true:

- Google Sheets tabs are finalized
- PostgreSQL schema is applied
- sample product data imports cleanly
- product lookup works from DB, not hardcoded JS
- media metadata is stored in DB
- FAQ data is stored in DB
- changed records can be identified for future embeddings

## Recommended Next Steps

1. Apply the schema in `db/schema_phase2.sql`
2. Create the Google Sheet using the CSV templates in `templates/`
3. Build a Python or Node import script from Sheets CSV export to Postgres
4. Move the current hardcoded product data from `script.js` into Sheets
5. Start Phase 3 with chunking plus embeddings
