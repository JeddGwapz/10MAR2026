#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path
from typing import Any


NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


PRODUCT_ALIAS_RULES = [
    ("cue24", [r"\bcue\s*24\b", r"\bcue24\b"]),
    ("cue27", [r"\bcue\s*27\b", r"\bcue27\b"]),
    ("cue32", [r"\bcue\s*32\b", r"\bcue32\b"]),
    ("clone16", [r"\bclone\s*16\b", r"\bclone16\b"]),
    ("tab12", [r"\btab\s*12\b", r"\btab12\b"]),
    ("flex15", [r"\bflex\s*15\b", r"\bflex15\b"]),
    ("folder22n", [r"\bfolder\s*22n\b", r"\bfolder22n\b"]),
    ("lessonq24", [r"\blessonq\s*24\b", r"\blessonq24\b"]),
    ("lessonq27", [r"\blessonq\s*27\b", r"\blessonq27\b"]),
    ("lessonq32", [r"\blessonq\s*32\b", r"\blessonq32\b"]),
    ("lessonq43", [r"\blessonq\s*43\b", r"\blessonq43\b"]),
    ("ultra43", [r"\bultra\s*43\b", r"\bultra43\b"]),
    ("ultra55", [r"\bultra\s*55\b", r"\bultra55\b"]),
    ("speech24", [r"\bspeech\s*24\b", r"\bspeech24\b"]),
    ("speech27", [r"\bspeech\s*27\b", r"\bspeech27\b"]),
    ("speech32", [r"\bspeech\s*32\b", r"\bspeech32\b"]),
    ("speech43", [r"\bspeech\s*43\b", r"\bspeech43\b"]),
    ("mime24", [r"\bmime\s*24\b", r"\bmime24\b"]),
    ("mime27", [r"\bmime\s*27\b", r"\bmime27\b"]),
    ("mime32", [r"\bmime\s*32\b", r"\bmime32\b"]),
    ("framer24", [r"\bframer\s*24\b", r"\bframer24\b"]),
    ("framer27", [r"\bframer\s*27\b", r"\bframer27\b"]),
    ("framer32", [r"\bframer\s*32\b", r"\bframer32\b"]),
    ("adamas19", [r"\badamas\s*19\b", r"\badamas19\b"]),
    ("adamas22", [r"\badamas\s*22\b", r"\badamas22\b"]),
    ("adamas24", [r"\badamas\s*24\b", r"\badamas24\b"]),
    ("olleson18", [r"\bollesson\s*18\b", r"\bollesson18\b", r"\bspot\s*18\b"]),
]


class WorkbookImportError(Exception):
    pass


@dataclass
class QAItem:
    source_file: str
    category_slug: str
    category_name: str
    source_sheet: str
    source_row_number: int
    item_code: str | None
    item_number: int | None
    question: str
    answer: str
    multimedia_asset: str | None
    content_type: str | None
    file_name: str | None
    product_slug: str | None


def slugify(value: str) -> str:
    lowered = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return lowered or "uncategorized"


def clean(value: Any) -> str:
    return " ".join(str(value or "").replace("\u2000", " ").split())


def infer_product_slug(*parts: str) -> str | None:
    haystack = " ".join(clean(part) for part in parts).lower()
    for product_slug, patterns in PRODUCT_ALIAS_RULES:
        for pattern in patterns:
            if re.search(pattern, haystack):
                return product_slug
    return None


def parse_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    shared: list[str] = []
    for item in root.findall("main:si", NS):
        text = "".join(node.text or "" for node in item.iterfind(".//main:t", NS))
        shared.append(text)
    return shared


def get_sheet_targets(zf: zipfile.ZipFile) -> list[tuple[str, str]]:
    workbook = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rel_map = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in rels.findall("pkgrel:Relationship", NS)
    }
    targets: list[tuple[str, str]] = []
    for sheet in workbook.find("main:sheets", NS):
        sheet_name = sheet.attrib.get("name", "")
        rel_id = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id", "")
        target = rel_map.get(rel_id, "")
        if not target:
            continue
        if not target.startswith("xl/"):
            target = f"xl/{target}"
        targets.append((sheet_name, target))
    return targets


def read_sheet_rows(zf: zipfile.ZipFile, target: str, shared_strings: list[str]) -> list[list[str]]:
    root = ET.fromstring(zf.read(target))
    rows: list[list[str]] = []
    for row in root.findall(".//main:sheetData/main:row", NS):
        values: list[str] = []
        for cell in row.findall("main:c", NS):
            cell_type = cell.attrib.get("t")
            value_node = cell.find("main:v", NS)
            value = "" if value_node is None else (value_node.text or "")
            if cell_type == "s" and value.isdigit():
                value = shared_strings[int(value)]
            values.append(value)
        rows.append(values)
    return rows


def build_items_from_workbook(xlsx_path: Path) -> list[QAItem]:
    if not xlsx_path.exists():
        raise WorkbookImportError(f"Workbook not found: {xlsx_path}")

    items: list[QAItem] = []
    with zipfile.ZipFile(xlsx_path) as zf:
        shared_strings = parse_shared_strings(zf)
        sheets = get_sheet_targets(zf)
        master_sheet = None
        for sheet_name, target in sheets:
            if clean(sheet_name).lower() == "master q&a database":
                master_sheet = (sheet_name, target)
                break

        targets_to_parse = [master_sheet] if master_sheet else list(sheets)

        for sheet_name, target in targets_to_parse:
            if not sheet_name or not target:
                continue
            normalized_name = clean(sheet_name).lower()
            if normalized_name in {"dashboard", "multimedia asset master list"}:
                continue

            rows = read_sheet_rows(zf, target, shared_strings)
            if not rows:
                continue
            header = [clean(value) for value in rows[0]]

            has_category_col = header[:7] in (
                ["#", "Category", "Question", "Multimedia Asset", "Content Type", "File Name (Example)", "Avatar Script"],
                ["#", "Category", "Question", "Multimedia Asset", "Content Type", "File Name", "Avatar Script"],
            )
            simple_sheet = header[:6] == ["#", "Question", "Multimedia Asset", "Content Type", "File Name", "Avatar Script"]

            if not has_category_col and not simple_sheet:
                continue

            for idx, row in enumerate(rows[1:], start=2):
                if has_category_col:
                    padded = row + [""] * (7 - len(row))
                    item_code_raw, category_name_raw, question, multimedia_asset, content_type, file_name, answer = [
                        clean(v) for v in padded[:7]
                    ]
                    category_name = category_name_raw or sheet_name
                else:
                    padded = row + [""] * (6 - len(row))
                    item_code_raw, question, multimedia_asset, content_type, file_name, answer = [clean(v) for v in padded[:6]]
                    category_name = sheet_name

                if not question or not answer:
                    continue

                item_code = item_code_raw or None
                try:
                    item_number = int(item_code_raw) if item_code_raw and item_code_raw.isdigit() else None
                except ValueError:
                    item_number = None

                category_slug = slugify(category_name)
                product_slug = infer_product_slug(question, multimedia_asset, file_name, answer, category_name)
                items.append(
                    QAItem(
                        source_file=xlsx_path.name,
                        category_slug=category_slug,
                        category_name=category_name,
                        source_sheet=sheet_name,
                        source_row_number=idx,
                        item_code=item_code,
                        item_number=item_number,
                        question=question,
                        answer=answer,
                        multimedia_asset=multimedia_asset or None,
                        content_type=content_type or None,
                        file_name=file_name or None,
                        product_slug=product_slug,
                    )
                )
    return items


def print_summary(items: list[QAItem]) -> None:
    categories: dict[str, int] = {}
    product_bound = 0
    for item in items:
        categories[item.category_name] = categories.get(item.category_name, 0) + 1
        if item.product_slug:
            product_bound += 1
    print(f"Workbook rows parsed: {len(items)}")
    print(f"Rows with inferred product_slug: {product_bound}")
    print("Category counts:")
    for name, count in categories.items():
        print(f"- {name}: {count}")


def connect_postgres(dsn: str):
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError(
            "psycopg is required for --apply mode. Install it with: pip install 'psycopg[binary]'"
        ) from exc
    return psycopg.connect(dsn)


def apply_schema(cur: Any, schema_path: Path) -> None:
    cur.execute(schema_path.read_text(encoding="utf-8"))


def upsert_item(cur: Any, item: QAItem) -> None:
    cur.execute(
        """
        INSERT INTO knowledge_qa_items (
          source_file,
          category_slug,
          category_name,
          source_sheet,
          source_row_number,
          item_code,
          item_number,
          question,
          answer,
          multimedia_asset,
          content_type,
          file_name,
          product_slug,
          raw_metadata
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
        ON CONFLICT (source_file, source_sheet, source_row_number) DO UPDATE
          SET category_slug = EXCLUDED.category_slug,
              category_name = EXCLUDED.category_name,
              item_code = EXCLUDED.item_code,
              item_number = EXCLUDED.item_number,
              question = EXCLUDED.question,
              answer = EXCLUDED.answer,
              multimedia_asset = EXCLUDED.multimedia_asset,
              content_type = EXCLUDED.content_type,
              file_name = EXCLUDED.file_name,
              product_slug = EXCLUDED.product_slug,
              raw_metadata = EXCLUDED.raw_metadata,
              updated_at = NOW()
        """,
        (
            item.source_file,
            item.category_slug,
            item.category_name,
            item.source_sheet,
            item.source_row_number,
            item.item_code,
            item.item_number,
            item.question,
            item.answer,
            item.multimedia_asset,
            item.content_type,
            item.file_name,
            item.product_slug,
            json.dumps({}),
        ),
    )


def run_import(items: list[QAItem], dsn: str, schema_path: Path | None) -> None:
    connection = connect_postgres(dsn)
    try:
        with connection:
            with connection.cursor() as cur:
                if schema_path:
                    apply_schema(cur, schema_path)
                for item in items:
                    upsert_item(cur, item)
    finally:
        connection.close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Import Crystal Prompter QA workbook into PostgreSQL.")
    parser.add_argument("xlsx_path", help="Path to the Excel workbook (.xlsx)")
    parser.add_argument("--dsn", default="", help="PostgreSQL DSN. Falls back to DATABASE_URL.")
    parser.add_argument("--apply", action="store_true", help="Write parsed rows into PostgreSQL.")
    parser.add_argument("--apply-schema", action="store_true", help="Apply db/schema_knowledge_qa.sql before import.")
    parser.add_argument("--schema-path", default="db/schema_knowledge_qa.sql", help="Schema file path.")
    parser.add_argument("--sample", type=int, default=5, help="Number of parsed rows to preview in dry-run mode.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    dsn = args.dsn or __import__("os").environ.get("DATABASE_URL", "")
    xlsx_path = Path(args.xlsx_path).expanduser().resolve()
    schema_path = Path(args.schema_path).resolve()

    try:
        items = build_items_from_workbook(xlsx_path)
    except Exception as exc:
        print(f"Parse failed: {exc}", file=sys.stderr)
        return 1

    print_summary(items)

    if not args.apply:
        print("\nSample rows:")
        for item in items[: max(0, args.sample)]:
            print(f"- [{item.category_name}] product={item.product_slug or '-'} question={item.question}")
        print("\nDry run only. Re-run with --apply to write to PostgreSQL.")
        return 0

    if not dsn:
        print("Import aborted: provide --dsn or set DATABASE_URL.", file=sys.stderr)
        return 1

    try:
        run_import(items, dsn, schema_path if args.apply_schema else None)
    except Exception as exc:
        print(f"Import failed: {exc}", file=sys.stderr)
        return 1

    print("\nImport completed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
