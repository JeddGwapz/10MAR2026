# Crystal Prompter Workbook Import

Use this when you want to import the Excel workbook:

`CODEX_Crystal_Prompter_QA_By_Category.xlsx`

This workbook is not a direct match for the `product_faqs` table because it mixes:

- product FAQs
- company FAQs
- contact/support Q&A
- shipping and warranty Q&A
- pricing and compatibility knowledge

So this importer writes into:

- `knowledge_qa_items`

That table is meant for broader structured knowledge, not only product-bound FAQs.

## 1. Apply the table schema

```bash
psql crystal_prompter -f db/schema_knowledge_qa.sql
```

## 2. Dry-run the workbook parser

```bash
python3 scripts/import_crystal_prompter_qa_xlsx.py \
  "/Users/jeddgwapz/Downloads/CODEX_Crystal_Prompter_QA_By_Category.xlsx"
```

## 3. Import into PostgreSQL

```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/crystal_prompter" \
python3 scripts/import_crystal_prompter_qa_xlsx.py \
  "/Users/jeddgwapz/Downloads/CODEX_Crystal_Prompter_QA_By_Category.xlsx" \
  --apply
```

If the new table has not yet been created, use:

```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/crystal_prompter" \
python3 scripts/import_crystal_prompter_qa_xlsx.py \
  "/Users/jeddgwapz/Downloads/CODEX_Crystal_Prompter_QA_By_Category.xlsx" \
  --apply \
  --apply-schema
```

## 4. Verify imported rows

```bash
psql crystal_prompter
```

Then run:

```sql
\dt
SELECT category_name, COUNT(*) FROM knowledge_qa_items GROUP BY category_name ORDER BY category_name;
SELECT product_slug, question FROM knowledge_qa_items ORDER BY source_sheet, source_row_number LIMIT 20;
```

## Notes

- `product_slug` is inferred automatically when the workbook text clearly mentions a product like `Cue 24`, `Cue 27`, `Cue 32`, or `Clone 16`.
- Rows that are general company/support/shipping knowledge are still imported, but `product_slug` may be `NULL`.
- This is the correct place for your workbook data if you want to preserve all categories exactly as written.
