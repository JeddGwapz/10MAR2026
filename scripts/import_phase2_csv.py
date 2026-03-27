#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import os
import sys
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any


CSV_FILES = {
    "products": {
        "filename": "google-sheets-products.csv",
        "required": {
            "tenant_slug",
            "family_slug",
            "product_slug",
            "product_name",
            "tagline",
            "summary",
            "status",
        },
    },
    "product_aliases": {
        "filename": "google-sheets-product-aliases.csv",
        "required": {"product_slug", "alias", "alias_type"},
    },
    "product_specs": {
        "filename": "google-sheets-product-specs.csv",
        "required": {"product_slug", "spec_group", "spec_label", "spec_value", "display_order"},
    },
    "product_faqs": {
        "filename": "google-sheets-faqs.csv",
        "required": {
            "product_slug",
            "faq_key",
            "question",
            "answer",
            "keywords",
            "display_order",
            "is_published",
        },
    },
    "media_assets": {
        "filename": "google-sheets-media.csv",
        "required": {
            "asset_slug",
            "asset_type",
            "title",
            "storage_provider",
            "storage_key",
            "public_url",
            "mime_type",
            "duration_seconds",
            "thumbnail_url",
            "source_label",
        },
    },
    "product_media_links": {
        "filename": "google-sheets-product-media-links.csv",
        "required": {"product_slug", "asset_slug", "usage_type", "display_order", "is_primary"},
    },
    "support_channels": {
        "filename": "google-sheets-support-channels.csv",
        "required": {
            "tenant_slug",
            "channel_type",
            "label",
            "value",
            "region_code",
            "is_sales",
            "is_support",
            "display_order",
        },
    },
}


class ImportValidationError(Exception):
    pass


@dataclass
class Dataset:
    products: list[dict[str, Any]]
    product_aliases: list[dict[str, Any]]
    product_specs: list[dict[str, Any]]
    product_faqs: list[dict[str, Any]]
    media_assets: list[dict[str, Any]]
    product_media_links: list[dict[str, Any]]
    support_channels: list[dict[str, Any]]
    tenants: list[dict[str, Any]]
    product_families: list[dict[str, Any]]


def clean_string(value: str | None) -> str:
    return " ".join((value or "").strip().split())


def clean_optional(value: str | None) -> str | None:
    normalized = clean_string(value)
    return normalized or None


def slug_to_name(slug: str) -> str:
    return clean_string(slug.replace("-", " ").replace("_", " ").title())


def parse_bool(value: str | None, *, field_name: str) -> bool:
    normalized = clean_string(value).lower()
    if normalized in {"true", "1", "yes", "y"}:
        return True
    if normalized in {"false", "0", "no", "n"}:
        return False
    raise ImportValidationError(f"Invalid boolean for {field_name}: {value!r}")


def parse_int(value: str | None, *, field_name: str) -> int:
    normalized = clean_string(value)
    if not normalized:
        return 0
    try:
        return int(normalized)
    except ValueError as exc:
        raise ImportValidationError(f"Invalid integer for {field_name}: {value!r}") from exc


def parse_decimal(value: str | None, *, field_name: str) -> Decimal | None:
    normalized = clean_string(value)
    if not normalized:
        return None
    try:
        return Decimal(normalized)
    except InvalidOperation as exc:
        raise ImportValidationError(f"Invalid decimal for {field_name}: {value!r}") from exc


def parse_csv_list(value: str | None) -> list[str]:
    normalized = clean_string(value)
    if not normalized:
        return []
    return [item.strip() for item in normalized.split(",") if item.strip()]


def infer_tenant_slug_from_media(row: dict[str, str], known_tenant_slugs: set[str]) -> str | None:
    storage_key = clean_string(row.get("storage_key"))
    if storage_key:
        parts = [part for part in storage_key.split("/") if part]
        if len(parts) >= 2 and parts[0] == "tenants" and parts[1] in known_tenant_slugs:
            return parts[1]
        if parts and parts[0] in known_tenant_slugs:
            return parts[0]

    public_url = clean_string(row.get("public_url"))
    for tenant_slug in sorted(known_tenant_slugs):
        if tenant_slug and tenant_slug in public_url:
            return tenant_slug

    if len(known_tenant_slugs) == 1:
        return next(iter(known_tenant_slugs))
    return None


def load_csv_rows(csv_path: Path, required_columns: set[str]) -> list[dict[str, str]]:
    if not csv_path.exists():
        raise ImportValidationError(f"Missing CSV file: {csv_path}")

    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        header = set(reader.fieldnames or [])
        missing = required_columns - header
        if missing:
            missing_str = ", ".join(sorted(missing))
            raise ImportValidationError(f"{csv_path.name} is missing required columns: {missing_str}")
        return [{key: value or "" for key, value in row.items()} for row in reader]


def load_raw_tables(csv_dir: Path) -> dict[str, list[dict[str, str]]]:
    tables: dict[str, list[dict[str, str]]] = {}
    for table_name, config in CSV_FILES.items():
        csv_path = csv_dir / config["filename"]
        tables[table_name] = load_csv_rows(csv_path, config["required"])
    return tables


def validate_and_normalize(raw_tables: dict[str, list[dict[str, str]]]) -> Dataset:
    raw_products = raw_tables["products"]
    raw_aliases = raw_tables["product_aliases"]
    raw_specs = raw_tables["product_specs"]
    raw_faqs = raw_tables["product_faqs"]
    raw_media = raw_tables["media_assets"]
    raw_media_links = raw_tables["product_media_links"]
    raw_support = raw_tables["support_channels"]

    if not raw_products:
        raise ImportValidationError("The products CSV is empty.")

    product_slug_seen: set[str] = set()
    tenant_slug_seen: set[str] = set()
    family_seen: set[tuple[str, str]] = set()
    products: list[dict[str, Any]] = []

    for index, row in enumerate(raw_products, start=2):
        tenant_slug = clean_string(row.get("tenant_slug"))
        family_slug = clean_string(row.get("family_slug"))
        product_slug = clean_string(row.get("product_slug"))
        product_name = clean_string(row.get("product_name"))
        status = clean_string(row.get("status")) or "draft"

        if not tenant_slug:
            raise ImportValidationError(f"products row {index}: tenant_slug is required.")
        if not family_slug:
            raise ImportValidationError(f"products row {index}: family_slug is required.")
        if not product_slug:
            raise ImportValidationError(f"products row {index}: product_slug is required.")
        if not product_name:
            raise ImportValidationError(f"products row {index}: product_name is required.")
        if product_slug in product_slug_seen:
            raise ImportValidationError(f"Duplicate product_slug in products CSV: {product_slug}")

        product_slug_seen.add(product_slug)
        tenant_slug_seen.add(tenant_slug)
        family_seen.add((tenant_slug, family_slug))

        products.append(
            {
                "tenant_slug": tenant_slug,
                "family_slug": family_slug,
                "product_slug": product_slug,
                "product_name": product_name,
                "tagline": clean_optional(row.get("tagline")),
                "summary": clean_optional(row.get("summary")),
                "status": status,
                "screen_size_inches": parse_decimal(row.get("screen_size_inches"), field_name="screen_size_inches"),
                "resolution": clean_optional(row.get("resolution")),
                "aspect_ratio": clean_optional(row.get("aspect_ratio")),
                "brightness_cd_m2": parse_decimal(row.get("brightness_cd_m2"), field_name="brightness_cd_m2"),
                "weight_kg": parse_decimal(row.get("weight_kg"), field_name="weight_kg"),
                "inputs": parse_csv_list(row.get("inputs")),
                "hero_image_url": clean_optional(row.get("hero_image_url")),
                "thumbnail_url": clean_optional(row.get("thumbnail_url")),
                "buy_now_notes": clean_optional(row.get("buy_now_notes")),
            }
        )

    product_slugs = {item["product_slug"] for item in products}

    aliases: list[dict[str, Any]] = []
    alias_keys: set[tuple[str, str]] = set()
    for index, row in enumerate(raw_aliases, start=2):
        product_slug = clean_string(row.get("product_slug"))
        alias = clean_string(row.get("alias"))
        alias_type = clean_string(row.get("alias_type")) or "search"
        if product_slug not in product_slugs:
            raise ImportValidationError(f"product_aliases row {index}: unknown product_slug {product_slug!r}")
        if not alias:
            raise ImportValidationError(f"product_aliases row {index}: alias is required.")
        alias_key = (product_slug, alias.lower())
        if alias_key in alias_keys:
            raise ImportValidationError(f"Duplicate alias for product {product_slug}: {alias}")
        alias_keys.add(alias_key)
        aliases.append({"product_slug": product_slug, "alias": alias, "alias_type": alias_type})

    specs: list[dict[str, Any]] = []
    spec_keys: set[tuple[str, str, str]] = set()
    for index, row in enumerate(raw_specs, start=2):
        product_slug = clean_string(row.get("product_slug"))
        spec_group = clean_optional(row.get("spec_group"))
        spec_label = clean_string(row.get("spec_label"))
        spec_value = clean_string(row.get("spec_value"))
        if product_slug not in product_slugs:
            raise ImportValidationError(f"product_specs row {index}: unknown product_slug {product_slug!r}")
        if not spec_label or not spec_value:
            raise ImportValidationError(f"product_specs row {index}: spec_label and spec_value are required.")
        spec_key = (product_slug, spec_group or "", spec_label.lower())
        if spec_key in spec_keys:
            raise ImportValidationError(
                f"Duplicate spec for product {product_slug}: {(spec_group or 'default')} / {spec_label}"
            )
        spec_keys.add(spec_key)
        specs.append(
            {
                "product_slug": product_slug,
                "spec_group": spec_group,
                "spec_label": spec_label,
                "spec_value": spec_value,
                "display_order": parse_int(row.get("display_order"), field_name="display_order"),
            }
        )

    faqs: list[dict[str, Any]] = []
    faq_keys: set[tuple[str, str]] = set()
    for index, row in enumerate(raw_faqs, start=2):
        product_slug = clean_string(row.get("product_slug"))
        faq_key = clean_string(row.get("faq_key"))
        question = clean_string(row.get("question"))
        answer = clean_string(row.get("answer"))
        if product_slug not in product_slugs:
            raise ImportValidationError(f"product_faqs row {index}: unknown product_slug {product_slug!r}")
        if not faq_key or not question or not answer:
            raise ImportValidationError(f"product_faqs row {index}: faq_key, question, and answer are required.")
        faq_unique = (product_slug, faq_key)
        if faq_unique in faq_keys:
            raise ImportValidationError(f"Duplicate faq_key for product {product_slug}: {faq_key}")
        faq_keys.add(faq_unique)
        faqs.append(
            {
                "product_slug": product_slug,
                "faq_key": faq_key,
                "question": question,
                "answer": answer,
                "keywords": parse_csv_list(row.get("keywords")),
                "display_order": parse_int(row.get("display_order"), field_name="display_order"),
                "is_published": parse_bool(row.get("is_published"), field_name="is_published"),
            }
        )

    tenants = [
        {"tenant_slug": tenant_slug, "tenant_name": slug_to_name(tenant_slug)}
        for tenant_slug in sorted(tenant_slug_seen | {clean_string(item.get("tenant_slug")) for item in raw_support if clean_string(item.get("tenant_slug"))})
    ]
    tenant_slugs = {item["tenant_slug"] for item in tenants}

    product_families = [
        {
            "tenant_slug": tenant_slug,
            "family_slug": family_slug,
            "family_name": slug_to_name(family_slug),
        }
        for tenant_slug, family_slug in sorted(family_seen)
    ]

    media_assets: list[dict[str, Any]] = []
    asset_slugs: set[str] = set()
    for index, row in enumerate(raw_media, start=2):
        asset_slug = clean_string(row.get("asset_slug"))
        if not asset_slug:
            raise ImportValidationError(f"media_assets row {index}: asset_slug is required.")
        if asset_slug in asset_slugs:
            raise ImportValidationError(f"Duplicate asset_slug in media CSV: {asset_slug}")
        asset_slugs.add(asset_slug)

        tenant_slug = infer_tenant_slug_from_media(row, tenant_slugs)
        if not tenant_slug:
            raise ImportValidationError(
                f"media_assets row {index}: unable to infer tenant_slug for asset {asset_slug!r}. "
                "Use a tenant-aware storage_key or keep the import to a single tenant."
            )

        media_assets.append(
            {
                "tenant_slug": tenant_slug,
                "asset_slug": asset_slug,
                "asset_type": clean_string(row.get("asset_type")),
                "title": clean_string(row.get("title")),
                "storage_provider": clean_string(row.get("storage_provider")),
                "storage_key": clean_optional(row.get("storage_key")),
                "public_url": clean_optional(row.get("public_url")),
                "mime_type": clean_optional(row.get("mime_type")),
                "duration_seconds": parse_decimal(row.get("duration_seconds"), field_name="duration_seconds"),
                "thumbnail_url": clean_optional(row.get("thumbnail_url")),
                "source_label": clean_optional(row.get("source_label")),
            }
        )

    media_links: list[dict[str, Any]] = []
    media_link_keys: set[tuple[str, str, str]] = set()
    for index, row in enumerate(raw_media_links, start=2):
        product_slug = clean_string(row.get("product_slug"))
        asset_slug = clean_string(row.get("asset_slug"))
        usage_type = clean_string(row.get("usage_type")) or "gallery"
        if product_slug not in product_slugs:
            raise ImportValidationError(f"product_media_links row {index}: unknown product_slug {product_slug!r}")
        if asset_slug not in asset_slugs:
            raise ImportValidationError(f"product_media_links row {index}: unknown asset_slug {asset_slug!r}")
        link_key = (product_slug, asset_slug, usage_type)
        if link_key in media_link_keys:
            raise ImportValidationError(
                f"Duplicate product-media link for product {product_slug}, asset {asset_slug}, usage {usage_type}"
            )
        media_link_keys.add(link_key)
        media_links.append(
            {
                "product_slug": product_slug,
                "asset_slug": asset_slug,
                "usage_type": usage_type,
                "display_order": parse_int(row.get("display_order"), field_name="display_order"),
                "is_primary": parse_bool(row.get("is_primary"), field_name="is_primary"),
            }
        )

    support_channels: list[dict[str, Any]] = []
    for index, row in enumerate(raw_support, start=2):
        tenant_slug = clean_string(row.get("tenant_slug"))
        if tenant_slug not in tenant_slugs:
            raise ImportValidationError(f"support_channels row {index}: unknown tenant_slug {tenant_slug!r}")
        support_channels.append(
            {
                "tenant_slug": tenant_slug,
                "channel_type": clean_string(row.get("channel_type")),
                "label": clean_string(row.get("label")),
                "value": clean_string(row.get("value")),
                "region_code": clean_optional(row.get("region_code")),
                "is_sales": parse_bool(row.get("is_sales"), field_name="is_sales"),
                "is_support": parse_bool(row.get("is_support"), field_name="is_support"),
                "display_order": parse_int(row.get("display_order"), field_name="display_order"),
            }
        )

    return Dataset(
        products=products,
        product_aliases=aliases,
        product_specs=specs,
        product_faqs=faqs,
        media_assets=media_assets,
        product_media_links=media_links,
        support_channels=support_channels,
        tenants=tenants,
        product_families=product_families,
    )


def summarize_dataset(dataset: Dataset) -> str:
    return (
        "Validation successful:\n"
        f"- tenants: {len(dataset.tenants)}\n"
        f"- product families: {len(dataset.product_families)}\n"
        f"- products: {len(dataset.products)}\n"
        f"- aliases: {len(dataset.product_aliases)}\n"
        f"- specs: {len(dataset.product_specs)}\n"
        f"- faqs: {len(dataset.product_faqs)}\n"
        f"- media assets: {len(dataset.media_assets)}\n"
        f"- product-media links: {len(dataset.product_media_links)}\n"
        f"- support channels: {len(dataset.support_channels)}"
    )


def connect_postgres(dsn: str):
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError(
            "psycopg is required for --apply mode. Install it with: pip install 'psycopg[binary]'"
        ) from exc
    return psycopg.connect(dsn)


def maybe_apply_schema(cur: Any, schema_path: Path) -> None:
    sql = schema_path.read_text(encoding="utf-8")
    cur.execute(sql)


def upsert_tenant(cur: Any, tenant: dict[str, Any]) -> str:
    cur.execute(
        """
        INSERT INTO tenants (slug, name)
        VALUES (%s, %s)
        ON CONFLICT (slug) DO UPDATE
          SET name = EXCLUDED.name,
              updated_at = NOW()
        RETURNING id
        """,
        (tenant["tenant_slug"], tenant["tenant_name"]),
    )
    return cur.fetchone()[0]


def upsert_product_family(cur: Any, tenant_id: str, family: dict[str, Any]) -> str:
    cur.execute(
        """
        INSERT INTO product_families (tenant_id, slug, name)
        VALUES (%s, %s, %s)
        ON CONFLICT (tenant_id, slug) DO UPDATE
          SET name = EXCLUDED.name,
              updated_at = NOW()
        RETURNING id
        """,
        (tenant_id, family["family_slug"], family["family_name"]),
    )
    return cur.fetchone()[0]


def upsert_product(cur: Any, tenant_id: str, family_id: str, product: dict[str, Any]) -> str:
    cur.execute(
        """
        INSERT INTO products (
          tenant_id,
          family_id,
          slug,
          name,
          tagline,
          summary,
          status,
          screen_size_inches,
          resolution,
          aspect_ratio,
          brightness_cd_m2,
          weight_kg,
          inputs,
          hero_image_url,
          thumbnail_url,
          buy_now_notes
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (tenant_id, slug) DO UPDATE
          SET family_id = EXCLUDED.family_id,
              name = EXCLUDED.name,
              tagline = EXCLUDED.tagline,
              summary = EXCLUDED.summary,
              status = EXCLUDED.status,
              screen_size_inches = EXCLUDED.screen_size_inches,
              resolution = EXCLUDED.resolution,
              aspect_ratio = EXCLUDED.aspect_ratio,
              brightness_cd_m2 = EXCLUDED.brightness_cd_m2,
              weight_kg = EXCLUDED.weight_kg,
              inputs = EXCLUDED.inputs,
              hero_image_url = EXCLUDED.hero_image_url,
              thumbnail_url = EXCLUDED.thumbnail_url,
              buy_now_notes = EXCLUDED.buy_now_notes,
              updated_at = NOW()
        RETURNING id
        """,
        (
            tenant_id,
            family_id,
            product["product_slug"],
            product["product_name"],
            product["tagline"],
            product["summary"],
            product["status"],
            product["screen_size_inches"],
            product["resolution"],
            product["aspect_ratio"],
            product["brightness_cd_m2"],
            product["weight_kg"],
            product["inputs"],
            product["hero_image_url"],
            product["thumbnail_url"],
            product["buy_now_notes"],
        ),
    )
    return cur.fetchone()[0]


def upsert_product_alias(cur: Any, product_id: str, alias: dict[str, Any]) -> None:
    cur.execute(
        """
        INSERT INTO product_aliases (product_id, alias, alias_type)
        VALUES (%s, %s, %s)
        ON CONFLICT (product_id, alias) DO UPDATE
          SET alias_type = EXCLUDED.alias_type
        """,
        (product_id, alias["alias"], alias["alias_type"]),
    )


def upsert_product_spec(cur: Any, product_id: str, spec: dict[str, Any]) -> None:
    cur.execute(
        """
        INSERT INTO product_specs (product_id, spec_group, spec_label, spec_value, display_order)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (product_id, spec_group, spec_label) DO UPDATE
          SET spec_value = EXCLUDED.spec_value,
              display_order = EXCLUDED.display_order
        """,
        (product_id, spec["spec_group"], spec["spec_label"], spec["spec_value"], spec["display_order"]),
    )


def upsert_product_faq(cur: Any, product_id: str, faq: dict[str, Any]) -> None:
    cur.execute(
        """
        INSERT INTO product_faqs (
          product_id,
          faq_key,
          question,
          answer,
          keywords,
          display_order,
          is_published
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (product_id, faq_key) DO UPDATE
          SET question = EXCLUDED.question,
              answer = EXCLUDED.answer,
              keywords = EXCLUDED.keywords,
              display_order = EXCLUDED.display_order,
              is_published = EXCLUDED.is_published,
              updated_at = NOW()
        """,
        (
            product_id,
            faq["faq_key"],
            faq["question"],
            faq["answer"],
            faq["keywords"],
            faq["display_order"],
            faq["is_published"],
        ),
    )


def upsert_media_asset(cur: Any, tenant_id: str, asset: dict[str, Any]) -> str:
    cur.execute(
        """
        INSERT INTO media_assets (
          tenant_id,
          asset_slug,
          asset_type,
          title,
          storage_provider,
          storage_key,
          public_url,
          thumbnail_url,
          mime_type,
          duration_seconds,
          source_label
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (tenant_id, asset_slug) DO UPDATE
          SET asset_type = EXCLUDED.asset_type,
              title = EXCLUDED.title,
              storage_provider = EXCLUDED.storage_provider,
              storage_key = EXCLUDED.storage_key,
              public_url = EXCLUDED.public_url,
              thumbnail_url = EXCLUDED.thumbnail_url,
              mime_type = EXCLUDED.mime_type,
              duration_seconds = EXCLUDED.duration_seconds,
              source_label = EXCLUDED.source_label,
              updated_at = NOW()
        RETURNING id
        """,
        (
            tenant_id,
            asset["asset_slug"],
            asset["asset_type"],
            asset["title"],
            asset["storage_provider"],
            asset["storage_key"],
            asset["public_url"],
            asset["thumbnail_url"],
            asset["mime_type"],
            asset["duration_seconds"],
            asset["source_label"],
        ),
    )
    return cur.fetchone()[0]


def upsert_product_media_link(cur: Any, product_id: str, media_asset_id: str, link: dict[str, Any]) -> None:
    cur.execute(
        """
        INSERT INTO product_media_links (product_id, media_asset_id, usage_type, display_order, is_primary)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (product_id, media_asset_id, usage_type) DO UPDATE
          SET display_order = EXCLUDED.display_order,
              is_primary = EXCLUDED.is_primary
        """,
        (product_id, media_asset_id, link["usage_type"], link["display_order"], link["is_primary"]),
    )


def upsert_support_channel(cur: Any, tenant_id: str, channel: dict[str, Any]) -> None:
    cur.execute(
        """
        INSERT INTO support_channels (
          tenant_id,
          channel_type,
          label,
          value,
          region_code,
          is_sales,
          is_support,
          display_order
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            tenant_id,
            channel["channel_type"],
            channel["label"],
            channel["value"],
            channel["region_code"],
            channel["is_sales"],
            channel["is_support"],
            channel["display_order"],
        ),
    )


def run_import(dataset: Dataset, dsn: str, schema_path: Path | None) -> None:
    connection = connect_postgres(dsn)
    try:
        with connection:
            with connection.cursor() as cur:
                if schema_path:
                    maybe_apply_schema(cur, schema_path)

                cur.execute(
                    """
                    INSERT INTO ingestion_runs (source_type, source_label, status)
                    VALUES (%s, %s, %s)
                    RETURNING id
                    """,
                    ("csv_directory", "phase2-importer", "running"),
                )
                ingestion_run_id = cur.fetchone()[0]

                tenant_ids: dict[str, str] = {}
                family_ids: dict[tuple[str, str], str] = {}
                product_ids: dict[str, str] = {}
                media_asset_ids: dict[str, str] = {}
                records_written = 0

                for tenant in dataset.tenants:
                    tenant_id = upsert_tenant(cur, tenant)
                    tenant_ids[tenant["tenant_slug"]] = tenant_id
                    records_written += 1

                for family in dataset.product_families:
                    family_id = upsert_product_family(cur, tenant_ids[family["tenant_slug"]], family)
                    family_ids[(family["tenant_slug"], family["family_slug"])] = family_id
                    records_written += 1

                for product in dataset.products:
                    family_id = family_ids[(product["tenant_slug"], product["family_slug"])]
                    product_id = upsert_product(cur, tenant_ids[product["tenant_slug"]], family_id, product)
                    product_ids[product["product_slug"]] = product_id
                    records_written += 1

                for alias in dataset.product_aliases:
                    upsert_product_alias(cur, product_ids[alias["product_slug"]], alias)
                    records_written += 1

                for spec in dataset.product_specs:
                    upsert_product_spec(cur, product_ids[spec["product_slug"]], spec)
                    records_written += 1

                for faq in dataset.product_faqs:
                    upsert_product_faq(cur, product_ids[faq["product_slug"]], faq)
                    records_written += 1

                for asset in dataset.media_assets:
                    media_asset_id = upsert_media_asset(cur, tenant_ids[asset["tenant_slug"]], asset)
                    media_asset_ids[asset["asset_slug"]] = media_asset_id
                    records_written += 1

                for link in dataset.product_media_links:
                    upsert_product_media_link(
                        cur,
                        product_ids[link["product_slug"]],
                        media_asset_ids[link["asset_slug"]],
                        link,
                    )
                    records_written += 1

                for channel in dataset.support_channels:
                    upsert_support_channel(cur, tenant_ids[channel["tenant_slug"]], channel)
                    records_written += 1

                cur.execute(
                    """
                    UPDATE ingestion_runs
                    SET status = %s,
                        records_seen = %s,
                        records_written = %s,
                        finished_at = NOW()
                    WHERE id = %s
                    """,
                    (
                        "completed",
                        sum(
                            [
                                len(dataset.tenants),
                                len(dataset.product_families),
                                len(dataset.products),
                                len(dataset.product_aliases),
                                len(dataset.product_specs),
                                len(dataset.product_faqs),
                                len(dataset.media_assets),
                                len(dataset.product_media_links),
                                len(dataset.support_channels),
                            ]
                        ),
                        records_written,
                        ingestion_run_id,
                    ),
                )
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate and import Phase 2 Google Sheets CSV exports into PostgreSQL."
    )
    parser.add_argument(
        "--csv-dir",
        default="templates",
        help="Directory containing the Phase 2 CSV exports. Defaults to ./templates",
    )
    parser.add_argument(
        "--dsn",
        default=os.environ.get("DATABASE_URL", ""),
        help="PostgreSQL DSN. Falls back to DATABASE_URL.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Run the Postgres import after validation. Without this flag, the script only validates.",
    )
    parser.add_argument(
        "--apply-schema",
        action="store_true",
        help="Apply db/schema_phase2.sql before importing.",
    )
    parser.add_argument(
        "--schema-path",
        default="db/schema_phase2.sql",
        help="Schema file path used with --apply-schema.",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    csv_dir = Path(args.csv_dir).resolve()
    schema_path = Path(args.schema_path).resolve()

    try:
        raw_tables = load_raw_tables(csv_dir)
        dataset = validate_and_normalize(raw_tables)
    except ImportValidationError as exc:
        print(f"Validation failed: {exc}", file=sys.stderr)
        return 1

    print(summarize_dataset(dataset))

    if not args.apply:
        print("\nDry run only. Re-run with --apply to write to PostgreSQL.")
        return 0

    if not args.dsn:
        print("Import aborted: provide --dsn or set DATABASE_URL.", file=sys.stderr)
        return 1

    try:
        run_import(dataset, args.dsn, schema_path if args.apply_schema else None)
    except Exception as exc:
        print(f"Import failed: {exc}", file=sys.stderr)
        return 1

    print("\nImport completed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
