#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any


NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


PRODUCT_ALIAS_RULES = [
    ("tab12", [r"\btab\s*12\b"]),
    ("flex15", [r"\bflex\s*15\b"]),
    ("clone16", [r"\bclone\s*16\b"]),
    ("olleson18", [r"\bollesson\s*18\b"]),
    ("folder22n", [r"\bfolder\s*22n\b"]),
    ("cue24", [r"\bcue\s*24\b"]),
    ("cue27", [r"\bcue\s*27\b"]),
    ("cue32", [r"\bcue\s*32\b"]),
    ("framer24", [r"\bframer\s*24\b"]),
    ("framer27", [r"\bframer\s*27\b"]),
    ("framer32", [r"\bframer\s*32\b"]),
    ("mime24", [r"\bmime\s*24\b"]),
    ("mime27", [r"\bmime\s*27\b"]),
    ("mime32", [r"\bmime\s*32\b"]),
    ("ultra43", [r"\bultra\s*43\b"]),
    ("ultra55", [r"\bultra\s*55\b"]),
    ("lessonq24", [r"\blessonq\s*24\b"]),
    ("lessonq27", [r"\blessonq\s*27\b"]),
    ("lessonq32", [r"\blessonq\s*32\b"]),
    ("lessonq43", [r"\blessonq\s*43\b"]),
    ("rotunda15", [r"\brotunda\s*15\b"]),
    ("adamas19", [r"\badamas\s*19\b"]),
    ("adamas22", [r"\badamas\s*22\b"]),
    ("adamas24", [r"\badamas\s*24\b"]),
    ("ep30k", [r"\bep\s*30k\b"]),
    ("ep40k", [r"\bep\s*40k\b"]),
    ("ep50k", [r"\bep\s*50k\b"]),
    ("ep60k", [r"\bep\s*60k\b"]),
    ("ep80k", [r"\bep\s*80k\b"]),
]


class PriceImportError(Exception):
    pass


@dataclass
class PriceItem:
    source_file: str
    sheet_name: str
    source_row_number: int
    row_label: str | None
    size_label: str | None
    model_name: str
    property_text: str | None
    prompter_monitor: str | None
    portable_hardcase: str | None
    protect_cover: str | None
    software_bundle: str | None
    camera_plate: str | None
    global_online_price_usd: Decimal | None
    abroad_dealer_price_usd: Decimal | None
    product_slug: str | None


def clean(value: Any) -> str:
    return " ".join(str(value or "").split())


def parse_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    return [
        "".join(node.text or "" for node in item.iterfind(".//main:t", NS))
        for item in root.findall("main:si", NS)
    ]


def get_sheet_targets(zf: zipfile.ZipFile) -> list[tuple[str, str]]:
    workbook = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rel_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels.findall("pkgrel:Relationship", NS)}
    targets = []
    for sheet in workbook.find("main:sheets", NS):
        name = sheet.attrib.get("name", "")
        rel_id = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id", "")
        target = rel_map.get(rel_id, "")
        if not target.startswith("xl/"):
            target = f"xl/{target}"
        targets.append((name, target))
    return targets


def read_sheet_rows(zf: zipfile.ZipFile, target: str, shared_strings: list[str]) -> list[list[str]]:
    root = ET.fromstring(zf.read(target))
    rows = []
    for row in root.findall(".//main:sheetData/main:row", NS):
        values = []
        for cell in row.findall("main:c", NS):
            cell_type = cell.attrib.get("t")
            value_node = cell.find("main:v", NS)
            value = "" if value_node is None else (value_node.text or "")
            if cell_type == "s" and value.isdigit():
                value = shared_strings[int(value)]
            values.append(value)
        rows.append(values)
    return rows


def infer_product_slug(model_name: str) -> str | None:
    haystack = clean(model_name).lower()
    for slug, patterns in PRODUCT_ALIAS_RULES:
        for pattern in patterns:
            if re.search(pattern, haystack):
                return slug
    return None


def parse_decimal(value: str) -> Decimal | None:
    text = clean(value).replace("$", "").replace(",", "")
    if not text:
        return None
    try:
        return Decimal(text)
    except InvalidOperation:
        return None


def build_items_from_workbook(xlsx_path: Path) -> list[PriceItem]:
    if not xlsx_path.exists():
        raise PriceImportError(f"Workbook not found: {xlsx_path}")

    items: list[PriceItem] = []
    with zipfile.ZipFile(xlsx_path) as zf:
        shared_strings = parse_shared_strings(zf)
        sheets = get_sheet_targets(zf)
        if not sheets:
            raise PriceImportError("No sheets found in workbook.")

        for sheet_name, target in sheets:
            rows = read_sheet_rows(zf, target, shared_strings)
            header_idx = None
            for i, row in enumerate(rows):
                header = [clean(v) for v in row]
                if len(header) >= 11 and header[1:11] == [
                    "Size",
                    "Model",
                    "Property",
                    "Prompter Monitor",
                    "Portable Hardcase",
                    "Protect cover",
                    "SW",
                    "CAM Plate",
                    "Global Online Price",
                    "Abroad Dealer price",
                ]:
                    header_idx = i
                    break
            if header_idx is None:
                continue

            for row_number, row in enumerate(rows[header_idx + 2 :], start=header_idx + 3):
                padded = row + [""] * (11 - len(row))
                values = [clean(v) for v in padded[:11]]
                if not any(values):
                    continue
                row_label, size_label, model_name, property_text, prompter_monitor, portable_hardcase, protect_cover, software_bundle, camera_plate, global_online_price, abroad_dealer_price = values
                if not model_name:
                    continue

                items.append(
                    PriceItem(
                        source_file=xlsx_path.name,
                        sheet_name=sheet_name,
                        source_row_number=row_number,
                        row_label=row_label or None,
                        size_label=size_label or None,
                        model_name=model_name,
                        property_text=property_text or None,
                        prompter_monitor=prompter_monitor or None,
                        portable_hardcase=portable_hardcase or None,
                        protect_cover=protect_cover or None,
                        software_bundle=software_bundle or None,
                        camera_plate=camera_plate or None,
                        global_online_price_usd=parse_decimal(global_online_price),
                        abroad_dealer_price_usd=parse_decimal(abroad_dealer_price),
                        product_slug=infer_product_slug(model_name),
                    )
                )

    if not items:
        raise PriceImportError("No price rows found in workbook.")
    return items


def print_summary(items: list[PriceItem]) -> None:
    product_bound = sum(1 for item in items if item.product_slug)
    print(f"Price rows parsed: {len(items)}")
    print(f"Rows with inferred product_slug: {product_bound}")
    for item in items[:8]:
        print(
            f"- model={item.model_name} global={item.global_online_price_usd} "
            f"dealer={item.abroad_dealer_price_usd} product={item.product_slug or '-'}"
        )


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


def upsert_item(cur: Any, item: PriceItem) -> None:
    cur.execute(
        """
        INSERT INTO price_list_items (
          source_file,
          sheet_name,
          source_row_number,
          row_label,
          size_label,
          model_name,
          property_text,
          prompter_monitor,
          portable_hardcase,
          protect_cover,
          software_bundle,
          camera_plate,
          global_online_price_usd,
          abroad_dealer_price_usd,
          product_slug,
          raw_metadata
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
        ON CONFLICT (source_file, sheet_name, source_row_number) DO UPDATE
          SET row_label = EXCLUDED.row_label,
              size_label = EXCLUDED.size_label,
              model_name = EXCLUDED.model_name,
              property_text = EXCLUDED.property_text,
              prompter_monitor = EXCLUDED.prompter_monitor,
              portable_hardcase = EXCLUDED.portable_hardcase,
              protect_cover = EXCLUDED.protect_cover,
              software_bundle = EXCLUDED.software_bundle,
              camera_plate = EXCLUDED.camera_plate,
              global_online_price_usd = EXCLUDED.global_online_price_usd,
              abroad_dealer_price_usd = EXCLUDED.abroad_dealer_price_usd,
              product_slug = EXCLUDED.product_slug,
              raw_metadata = EXCLUDED.raw_metadata,
              updated_at = NOW()
        """,
        (
            item.source_file,
            item.sheet_name,
            item.source_row_number,
            item.row_label,
            item.size_label,
            item.model_name,
            item.property_text,
            item.prompter_monitor,
            item.portable_hardcase,
            item.protect_cover,
            item.software_bundle,
            item.camera_plate,
            item.global_online_price_usd,
            item.abroad_dealer_price_usd,
            item.product_slug,
            json.dumps({}),
        ),
    )


def run_import(items: list[PriceItem], dsn: str, schema_path: Path | None) -> None:
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
    parser = argparse.ArgumentParser(description="Import Crystal Prompter price list workbook into PostgreSQL.")
    parser.add_argument("xlsx_path", help="Path to the price workbook (.xlsx)")
    parser.add_argument("--dsn", default="", help="PostgreSQL DSN. Falls back to DATABASE_URL.")
    parser.add_argument("--apply", action="store_true", help="Write parsed rows into PostgreSQL.")
    parser.add_argument("--apply-schema", action="store_true", help="Apply db/schema_price_list.sql before import.")
    parser.add_argument("--schema-path", default="db/schema_price_list.sql", help="Schema file path.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    import os

    dsn = args.dsn or os.environ.get("DATABASE_URL", "")
    xlsx_path = Path(args.xlsx_path).expanduser().resolve()
    schema_path = Path(args.schema_path).resolve()

    try:
        items = build_items_from_workbook(xlsx_path)
    except Exception as exc:
        print(f"Parse failed: {exc}", file=sys.stderr)
        return 1

    print_summary(items)

    if not args.apply:
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
