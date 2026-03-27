# Phase 2 Importer Usage

## Script

Use:

`scripts/import_phase2_csv.py`

This importer:

- reads the CSV files in `templates/` or another export directory
- validates cross-file references before touching the database
- supports dry-run mode by default
- upserts data into PostgreSQL when `--apply` is used

## CSV Files Expected

- `google-sheets-products.csv`
- `google-sheets-product-aliases.csv`
- `google-sheets-product-specs.csv`
- `google-sheets-faqs.csv`
- `google-sheets-media.csv`
- `google-sheets-product-media-links.csv`
- `google-sheets-support-channels.csv`

## Dependency

Dry-run validation uses only Python standard library.

To write into PostgreSQL, install:

```bash
pip install "psycopg[binary]"
```

## Common Commands

### 1. Validate only

```bash
python3 scripts/import_phase2_csv.py --csv-dir templates
```

### 2. Apply schema and import

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME" \
python3 scripts/import_phase2_csv.py \
  --csv-dir templates \
  --apply \
  --apply-schema
```

### 3. Import without reapplying schema

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME" \
python3 scripts/import_phase2_csv.py \
  --csv-dir templates \
  --apply
```

## Current Assumptions

- `product_slug` must be unique across the CSV import set
- product families are derived from the `products` CSV
- tenant names are derived from `tenant_slug`
- media tenant ownership is inferred from `storage_key`, `public_url`, or the single-tenant dataset

## Recommended Next Step

After this importer works against your real Postgres database:

1. replace the sample CSV rows with your actual product data
2. move the hardcoded product knowledge from `script.js` into Sheets
3. build the API layer that reads from Postgres instead of static frontend data
