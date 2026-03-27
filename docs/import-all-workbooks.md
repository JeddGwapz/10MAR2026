# Import All Crystal Prompter Workbooks

## Files You Mentioned

- `CODEX_Crystal_Prompter_QA_By_Category.xlsx`
- `COWORK_Crystal_Prompter_QA_Database_300.xlsx`
- `Crystal_Prompter_QA_V3_Professional.xlsx`
- `Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx`

## Important

The three Q&A workbooks overlap heavily.

If you import all three, PostgreSQL will store all three source versions. That is valid, but you will have duplicate knowledge across source files.

Recommended:

- choose one primary Q&A workbook
- import the price workbook separately

Best candidate for primary Q&A source:

- `Crystal_Prompter_QA_V3_Professional.xlsx`

## Q&A Table

Q&A workbooks go into:

- `knowledge_qa_items`

Apply schema:

```bash
psql crystal_prompter -f db/schema_knowledge_qa.sql
```

Dry run one workbook:

```bash
python3 scripts/import_crystal_prompter_qa_xlsx.py \
  "/Users/jeddgwapz/Downloads/Crystal_Prompter_QA_V3_Professional.xlsx"
```

Import one workbook:

```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/crystal_prompter" \
python3 scripts/import_crystal_prompter_qa_xlsx.py \
  "/Users/jeddgwapz/Downloads/Crystal_Prompter_QA_V3_Professional.xlsx" \
  --apply
```

## Price Table

Price workbook goes into:

- `price_list_items`

Apply schema:

```bash
psql crystal_prompter -f db/schema_price_list.sql
```

Dry run:

```bash
python3 scripts/import_price_list_xlsx.py \
  "/Users/jeddgwapz/Downloads/Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx"
```

Import:

```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/crystal_prompter" \
python3 scripts/import_price_list_xlsx.py \
  "/Users/jeddgwapz/Downloads/Crystal Prompter Price table_20260116_KSJ_Global (2).xlsx" \
  --apply
```

## If You Really Want All Three Q&A Workbooks Imported

Run these one by one:

```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/crystal_prompter" \
python3 scripts/import_crystal_prompter_qa_xlsx.py \
  "/Users/jeddgwapz/Downloads/CODEX_Crystal_Prompter_QA_By_Category.xlsx" \
  --apply
```

```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/crystal_prompter" \
python3 scripts/import_crystal_prompter_qa_xlsx.py \
  "/Users/jeddgwapz/Downloads/COWORK_Crystal_Prompter_QA_Database_300.xlsx" \
  --apply
```

```bash
DATABASE_URL="postgresql://$(whoami)@localhost:5432/crystal_prompter" \
python3 scripts/import_crystal_prompter_qa_xlsx.py \
  "/Users/jeddgwapz/Downloads/Crystal_Prompter_QA_V3_Professional.xlsx" \
  --apply
```

## Verify

```bash
psql crystal_prompter
```

Then:

```sql
SELECT source_file, COUNT(*) FROM knowledge_qa_items GROUP BY source_file ORDER BY source_file;
SELECT source_file, sheet_name, COUNT(*) FROM price_list_items GROUP BY source_file, sheet_name;
```
