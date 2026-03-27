#!/usr/bin/env python3
import base64
import getpass
import json
import os
import re
import shlex
import shutil
import subprocess
import tempfile
import threading
import time
import uuid
import wave
from decimal import Decimal
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib import error as urllib_error
from urllib import request as urllib_request
from urllib.parse import parse_qs, urlparse


DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8000
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
GENERATED_AVATAR_DIR = os.path.join(ROOT_DIR, "generated", "avatar")
DEFAULT_DATABASE_URL = f"postgresql://{getpass.getuser()}@localhost:5432/crystal_prompter"
DEFAULT_OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "").strip() or "gpt-5-mini"
DEFAULT_OPENAI_TTS_MODEL = os.environ.get("OPENAI_TTS_MODEL", "").strip() or "gpt-4o-mini-tts"
DEFAULT_OPENAI_TTS_VOICE = os.environ.get("OPENAI_TTS_VOICE", "").strip() or "coral"
DEFAULT_XTTS_LANGUAGE = os.environ.get("XTTS_LANGUAGE", "").strip() or "en"
DEFAULT_XTTS_PYTHON = os.environ.get("XTTS_PYTHON", "").strip() or "/venv/xtts/bin/python"
MAX_TEXT_LENGTH = 700
VOICE_MAP = {
    "EN": "Daniel",
    "FIL": "Eddy (English (US))",
    "ES": "Eddy (Spanish (Spain))",
    "JA": "Eddy (Japanese (Japan))",
}
RHYTHM_SHAPES = ["B", "C", "D", "C", "E", "F", "C", "B"]
RHYTHM_VOWEL_MAP = {
    "a": "D",
    "e": "C",
    "i": "B",
    "o": "E",
    "u": "F",
}
OPENAI_TTS_VOICE_MAP = {
    "Daniel": "coral",
    "Eddy (English (US))": "coral",
    "Eddy (Spanish (Spain))": "alloy",
    "Eddy (Japanese (Japan))": "alloy",
}
MAX_SENTENCE_CHUNKS = 3
CHUNK_SESSION_TTL_SECONDS = 300
TARGET_CHUNK_WORDS = 18
MIN_CHUNK_WORDS = 8
chunk_sessions = {}
chunk_sessions_lock = threading.Lock()


def load_env_file():
    env_path = os.path.join(ROOT_DIR, ".env")
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip()
            if not key:
                continue

            if value and value[0] == value[-1] and value[0] in {"'", '"'}:
                value = value[1:-1]

            os.environ.setdefault(key, value)


load_env_file()


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query = parse_qs(parsed_url.query)

        try:
            if path == "/api/health":
                return self._send_json(get_health_payload())

            if path == "/api/avatar-chunk":
                session_id = clean_query_value(query.get("session_id", [""])[0])
                index_raw = clean_query_value(query.get("index", ["0"])[0])
                if not session_id:
                    return self._send_json_error(HTTPStatus.BAD_REQUEST, "session_id is required")
                try:
                    chunk_index = max(0, int(index_raw or "0"))
                except ValueError:
                    return self._send_json_error(HTTPStatus.BAD_REQUEST, "index must be an integer")

                chunk_response = get_or_create_chunk_response(session_id, chunk_index)
                if chunk_response is None:
                    return self._send_json_error(HTTPStatus.NOT_FOUND, "Chunk session or chunk was not found")
                return self._send_json(chunk_response)

            if path == "/api/products":
                limit = parse_limit(query.get("limit", ["25"])[0], default=25, maximum=100)
                return self._send_json({
                    "items": list_products(limit=limit),
                    "limit": limit,
                })

            if path == "/api/prices":
                limit = parse_limit(query.get("limit", ["50"])[0], default=50, maximum=200)
                product_slug = clean_query_value(query.get("product_slug", [""])[0])
                return self._send_json({
                    "items": list_prices(product_slug=product_slug or None, limit=limit),
                    "limit": limit,
                    "productSlug": product_slug or None,
                })

            if path == "/api/knowledge/search":
                limit = parse_limit(query.get("limit", ["10"])[0], default=10, maximum=50)
                text_query = clean_query_value(query.get("q", [""])[0])
                product_slug = clean_query_value(query.get("product_slug", [""])[0])
                if not text_query:
                    return self._send_json({
                        "items": [],
                        "query": "",
                        "limit": limit,
                        "productSlug": product_slug or None,
                    })
                return self._send_json({
                    "items": search_knowledge(text_query, product_slug=product_slug or None, limit=limit),
                    "query": text_query,
                    "limit": limit,
                    "productSlug": product_slug or None,
                })

            product_route = parse_product_route(path)
            if product_route:
                product_slug, product_subresource = product_route
                if product_subresource is None:
                    product = get_product(product_slug)
                    if not product:
                        return self._send_json_error(HTTPStatus.NOT_FOUND, "Product not found")
                    return self._send_json(product)

                if product_subresource == "faqs":
                    return self._send_json({
                        "productSlug": product_slug,
                        "items": get_product_faqs(product_slug),
                    })
        except Exception as error:
            if path.startswith("/api/"):
                return self._send_json_error(HTTPStatus.SERVICE_UNAVAILABLE, str(error))
            raise

        return super().do_GET()

    def do_POST(self):
        if self.path not in {"/api/tts", "/api/speak", "/api/chat", "/api/avatar-speak"}:
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid content length")
            return

        raw_body = self.rfile.read(content_length)
        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON body")
            return

        if self.path == "/api/chat":
            try:
                message = clean_query_value(payload.get("message", ""))
                product_slug = clean_query_value(payload.get("product_slug", ""))
                language = str(payload.get("language", "EN")).upper().strip() or "EN"
                voice = str(payload.get("voice", "")).strip() or VOICE_MAP.get(language, VOICE_MAP["EN"])
                history = payload.get("history", [])
                if not message:
                    return self._send_json_error(HTTPStatus.BAD_REQUEST, "message is required")
                return self._send_json(
                    chat_with_openai(
                        message,
                        product_slug=product_slug or None,
                        history=history,
                        language=language,
                        voice=voice,
                    )
                )
            except Exception as error:
                return self._send_json_error(HTTPStatus.SERVICE_UNAVAILABLE, str(error))

        text = " ".join(str(payload.get("text", "")).split()).strip()
        language = str(payload.get("language", "EN")).upper()
        voice = str(payload.get("voice", "")).strip() or VOICE_MAP.get(language, VOICE_MAP["EN"])

        if not text:
            self.send_error(HTTPStatus.BAD_REQUEST, "Text is required")
            return

        if len(text) > MAX_TEXT_LENGTH:
            text = text[:MAX_TEXT_LENGTH].rstrip()

        try:
            speech_package = build_speech_package(text, voice, language)
        except subprocess.CalledProcessError as error:
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, f"TTS failed: {error}")
            return

        if self.path == "/api/avatar-speak":
            try:
                avatar_package = build_avatar_speech_package(
                    text=text,
                    voice=voice,
                    language=language,
                    speech_package=speech_package,
                )
            except Exception as error:
                return self._send_json_error(HTTPStatus.SERVICE_UNAVAILABLE, str(error))

            return self._send_json({
                "audioBase64": base64.b64encode(avatar_package["audio_bytes"]).decode("ascii"),
                "audioMimeType": "audio/wav",
                "durationMs": avatar_package["duration_ms"],
                "voice": avatar_package.get("voice_used", speech_package.get("voice_used", voice)),
                "language": language,
                "videoUrl": avatar_package["video_url"],
                "jobId": avatar_package["job_id"],
            })

        if self.path == "/api/speak":
            return self._send_json({
                "audioBase64": base64.b64encode(speech_package["audio_bytes"]).decode("ascii"),
                "audioMimeType": "audio/wav",
                "durationMs": speech_package["duration_ms"],
                "mouthCues": speech_package["mouth_cues"],
                "lipsyncSource": speech_package["lipsync_source"],
                "voice": speech_package.get("voice_used", voice),
                "language": language
            })

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(speech_package["audio_bytes"])))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(speech_package["audio_bytes"])

    def log_message(self, format, *args):
        super().log_message(format, *args)

    def _send_json(self, payload):
        body = json.dumps(payload, default=json_default).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_json_error(self, status, message):
        body = json.dumps({"error": message}).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def json_default(value):
    if isinstance(value, Decimal):
        return float(value)
    if hasattr(value, "isoformat"):
        return value.isoformat()
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def clean_query_value(value):
    return " ".join(str(value or "").split()).strip()


def log_timing(event_name, **fields):
    payload = {
        "event": event_name,
        "timestampMs": int(time.time() * 1000),
    }
    payload.update(fields)
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def cleanup_expired_chunk_sessions():
    now = time.monotonic()
    with chunk_sessions_lock:
        expired_ids = [
            session_id
            for session_id, session in chunk_sessions.items()
            if float(session.get("expiresAt", 0)) <= now
        ]
        for session_id in expired_ids:
            chunk_sessions.pop(session_id, None)


def split_into_sentence_chunks(text, max_chunks=MAX_SENTENCE_CHUNKS):
    # Keep chunking low-risk: split by sentence first, then split any overly long sentence by word budget.
    cleaned_text = clean_query_value(text)
    if not cleaned_text:
        return []

    def normalize_chunk(value):
        return clean_query_value(value)[:MAX_TEXT_LENGTH].rstrip()

    def count_words(value):
        return len([word for word in value.split() if word])

    def split_long_chunk_by_words(value, parts=2):
        words = [word for word in value.split() if word]
        if len(words) <= TARGET_CHUNK_WORDS or parts <= 1:
            return [normalize_chunk(value)]

        result = []
        start_index = 0
        total_words = len(words)

        for part_index in range(parts):
            remaining_slots = parts - part_index
            remaining_words = total_words - start_index
            if remaining_words <= 0:
                break

            if remaining_slots == 1:
                result.append(normalize_chunk(" ".join(words[start_index:])))
                break

            min_reserved_words = max(0, (remaining_slots - 1) * MIN_CHUNK_WORDS)
            take_words = min(
                TARGET_CHUNK_WORDS,
                max(MIN_CHUNK_WORDS, remaining_words - min_reserved_words),
            )
            result.append(normalize_chunk(" ".join(words[start_index:start_index + take_words])))
            start_index += take_words

        return [chunk for chunk in result if chunk]

    sentence_chunks = [
        normalize_chunk(part)
        for part in re.split(r"(?<=[.!?])\s+", cleaned_text)
        if normalize_chunk(part)
    ]

    if not sentence_chunks:
        return [normalize_chunk(cleaned_text)]

    # If the reply only has one long sentence, split it so chunk 1 can start much earlier.
    while len(sentence_chunks) < max_chunks:
        longest_index = -1
        longest_word_count = 0
        for index, chunk in enumerate(sentence_chunks):
            word_count = count_words(chunk)
            if word_count > TARGET_CHUNK_WORDS * 2 and word_count > longest_word_count:
                longest_index = index
                longest_word_count = word_count

        if longest_index < 0:
            break

        chunk_to_split = sentence_chunks.pop(longest_index)
        split_parts = split_long_chunk_by_words(chunk_to_split, parts=2)
        for offset, split_part in enumerate(split_parts):
            sentence_chunks.insert(longest_index + offset, split_part)

    if len(sentence_chunks) <= max_chunks:
        return sentence_chunks

    # Preserve order and cap at max_chunks by merging any overflow into the final chunk.
    merged_chunks = list(sentence_chunks[:max_chunks - 1])
    merged_chunks.append(
        normalize_chunk(" ".join(sentence_chunks[max_chunks - 1:]))
    )
    return [chunk for chunk in merged_chunks if chunk]


def create_chunk_session(*, answer, chunks, voice, language, product_slug=None):
    # Sessions live in memory for a few minutes so the frontend can pull chunk 2/3 on demand.
    cleanup_expired_chunk_sessions()
    session_id = f"sess_{uuid.uuid4().hex}"
    expires_at = time.monotonic() + CHUNK_SESSION_TTL_SECONDS
    with chunk_sessions_lock:
        chunk_sessions[session_id] = {
            "createdAt": time.monotonic(),
            "expiresAt": expires_at,
            "answer": answer,
            "chunks": list(chunks),
            "generated": {},
            "voice": voice,
            "language": language,
            "productSlug": product_slug or "",
        }
    return session_id


def get_chunk_session(session_id):
    cleanup_expired_chunk_sessions()
    with chunk_sessions_lock:
        session = chunk_sessions.get(session_id)
        if not session:
            return None
        session["expiresAt"] = time.monotonic() + CHUNK_SESSION_TTL_SECONDS
        return session


def store_generated_chunk(session_id, chunk_index, payload):
    with chunk_sessions_lock:
        session = chunk_sessions.get(session_id)
        if not session:
            return
        session["expiresAt"] = time.monotonic() + CHUNK_SESSION_TTL_SECONDS
        session.setdefault("generated", {})[chunk_index] = payload


def build_chunk_media_payload(*, session_id, chunk_index, text, voice, language):
    # Generate one chunk at a time so chunk 1 can be returned earlier than the full reply media set.
    chunk_text = clean_query_value(text)[:MAX_TEXT_LENGTH].rstrip()
    if not chunk_text:
        raise RuntimeError("Chunk text is empty")

    tts_started_at = time.monotonic()
    speech_package = build_speech_package(chunk_text, voice, language)
    tts_duration_ms = int((time.monotonic() - tts_started_at) * 1000)

    avatar_duration_ms = 0
    avatar_error = ""
    avatar_package = None
    if is_avatar_generation_configured():
        avatar_started_at = time.monotonic()
        try:
            avatar_package = build_avatar_speech_package(
                text=chunk_text,
                voice=voice,
                language=language,
                speech_package=speech_package,
            )
        except Exception as error:
            avatar_error = str(error)
        avatar_duration_ms = int((time.monotonic() - avatar_started_at) * 1000)

    payload = {
        "index": chunk_index,
        "text": chunk_text,
        "audioBase64": base64.b64encode(speech_package["audio_bytes"]).decode("ascii"),
        "audioMimeType": "audio/wav",
        "durationMs": speech_package["duration_ms"],
        "mouthCues": speech_package["mouth_cues"],
        "lipsyncSource": speech_package["lipsync_source"],
        "voice": speech_package.get("voice_used", voice),
        "language": language,
        "videoUrl": avatar_package["video_url"] if avatar_package else None,
        "jobId": avatar_package["job_id"] if avatar_package else None,
        "avatarError": avatar_error or None,
    }

    log_timing(
        "avatar_chunk_ready",
        sessionId=session_id,
        chunkIndex=chunk_index,
        chunkChars=len(chunk_text),
        ttsMs=tts_duration_ms,
        avatarMs=avatar_duration_ms,
        hasVideo=bool(payload["videoUrl"]),
        avatarFallback=bool(avatar_error or not avatar_package),
    )
    return payload


def get_or_create_chunk_response(session_id, chunk_index):
    session = get_chunk_session(session_id)
    if not session:
        return None

    chunks = session.get("chunks", [])
    if chunk_index < 0 or chunk_index >= len(chunks):
        return None

    generated = session.get("generated", {})
    if chunk_index in generated:
        chunk_payload = generated[chunk_index]
    else:
        chunk_payload = build_chunk_media_payload(
            session_id=session_id,
            chunk_index=chunk_index,
            text=chunks[chunk_index],
            voice=session.get("voice") or VOICE_MAP["EN"],
            language=session.get("language") or "EN",
        )
        store_generated_chunk(session_id, chunk_index, chunk_payload)

    return {
        "sessionId": session_id,
        "chunk": chunk_payload,
        "totalChunks": len(chunks),
        "hasMore": chunk_index + 1 < len(chunks),
    }


def parse_limit(raw_value, *, default, maximum):
    try:
        value = int(str(raw_value).strip() or default)
    except ValueError:
        return default
    return max(1, min(value, maximum))


def get_database_url():
    return os.environ.get("DATABASE_URL", "").strip() or DEFAULT_DATABASE_URL


def get_server_host():
    return os.environ.get("HOST", "").strip() or DEFAULT_HOST


def get_server_port():
    raw_port = os.environ.get("PORT", "").strip()
    if not raw_port:
        return DEFAULT_PORT
    try:
        return int(raw_port)
    except ValueError as exc:
        raise RuntimeError(f"Invalid PORT value: {raw_port}") from exc


def get_openai_api_key():
    return os.environ.get("OPENAI_API_KEY", "").strip()


def get_openai_model():
    return os.environ.get("OPENAI_MODEL", "").strip() or DEFAULT_OPENAI_MODEL


def get_openai_tts_model():
    return os.environ.get("OPENAI_TTS_MODEL", "").strip() or DEFAULT_OPENAI_TTS_MODEL


def get_openai_tts_voice():
    return os.environ.get("OPENAI_TTS_VOICE", "").strip() or DEFAULT_OPENAI_TTS_VOICE


def is_xtts_enabled():
    return os.environ.get("XTTS_ENABLED", "").strip().lower() in {"1", "true", "yes", "on"}


def get_xtts_speaker_wav():
    return os.environ.get("XTTS_SPEAKER_WAV", "").strip()


def get_xtts_language():
    return os.environ.get("XTTS_LANGUAGE", "").strip() or DEFAULT_XTTS_LANGUAGE


def get_xtts_python():
    return os.environ.get("XTTS_PYTHON", "").strip() or DEFAULT_XTTS_PYTHON


def get_avatar_source_image():
    return os.environ.get("AVATAR_SOURCE_IMAGE", "").strip()


def get_avatar_generator_command():
    return os.environ.get("AVATAR_GENERATOR_COMMAND", "").strip()


def is_avatar_generation_configured():
    return bool(get_avatar_generator_command() and get_avatar_source_image())


def connect_postgres():
    try:
        import psycopg
        from psycopg.rows import dict_row
    except ImportError as exc:
        raise RuntimeError(
            "psycopg is required for database-backed API endpoints. Install it with: pip install 'psycopg[binary]'"
        ) from exc
    return psycopg.connect(get_database_url(), row_factory=dict_row)


def run_query(sql, params=None, *, fetch="all"):
    with connect_postgres() as connection:
        with connection.cursor() as cursor:
            cursor.execute(sql, params or ())
            if fetch == "one":
                return cursor.fetchone()
            if fetch == "value":
                row = cursor.fetchone()
                return None if row is None else next(iter(row.values()))
            return cursor.fetchall()


def get_health_payload():
    payload = {
        "status": "ok",
        "rhubarbAvailable": bool(find_rhubarb_binary()),
        "databaseConfigured": bool(get_database_url()),
        "openaiConfigured": bool(get_openai_api_key()),
        "openaiModel": get_openai_model(),
        "avatarConfigured": is_avatar_generation_configured(),
        "databaseReachable": False,
    }
    try:
        row = run_query(
            """
            SELECT
              (SELECT COUNT(*) FROM knowledge_qa_items) AS knowledge_qa_count,
              (SELECT COUNT(*) FROM price_list_items) AS price_item_count,
              (SELECT COUNT(*) FROM products) AS product_count
            """,
            fetch="one",
        )
        payload["databaseReachable"] = True
        payload["counts"] = row or {}
    except Exception as error:
        payload["status"] = "degraded"
        payload["databaseError"] = str(error)
    return payload


def parse_product_route(path):
    parts = [part for part in path.split("/") if part]
    if len(parts) == 3 and parts[:2] == ["api", "products"]:
        return parts[2], None
    if len(parts) == 4 and parts[:2] == ["api", "products"] and parts[3] == "faqs":
        return parts[2], "faqs"
    return None


def list_products(*, limit):
    return run_query(
        """
        SELECT
          p.slug,
          p.name,
          p.tagline,
          p.summary,
          p.status,
          p.screen_size_inches,
          p.resolution,
          p.aspect_ratio,
          p.brightness_cd_m2,
          p.weight_kg,
          p.inputs,
          p.hero_image_url,
          p.thumbnail_url,
          pf.slug AS family_slug,
          pf.name AS family_name,
          pli.global_online_price_usd,
          pli.abroad_dealer_price_usd
        FROM products p
        LEFT JOIN product_families pf ON pf.id = p.family_id
        LEFT JOIN LATERAL (
          SELECT global_online_price_usd, abroad_dealer_price_usd
          FROM price_list_items
          WHERE product_slug = p.slug
          ORDER BY source_row_number
          LIMIT 1
        ) pli ON TRUE
        ORDER BY p.name
        LIMIT %s
        """,
        (limit,),
    )


def get_product(product_slug):
    product = run_query(
        """
        SELECT
          p.slug,
          p.name,
          p.tagline,
          p.summary,
          p.description,
          p.status,
          p.screen_size_inches,
          p.resolution,
          p.aspect_ratio,
          p.brightness_cd_m2,
          p.weight_kg,
          p.inputs,
          p.hero_image_url,
          p.thumbnail_url,
          p.buy_now_notes,
          pf.slug AS family_slug,
          pf.name AS family_name,
          pli.global_online_price_usd,
          pli.abroad_dealer_price_usd
        FROM products p
        LEFT JOIN product_families pf ON pf.id = p.family_id
        LEFT JOIN LATERAL (
          SELECT global_online_price_usd, abroad_dealer_price_usd
          FROM price_list_items
          WHERE product_slug = p.slug
          ORDER BY source_row_number
          LIMIT 1
        ) pli ON TRUE
        WHERE p.slug = %s
        LIMIT 1
        """,
        (product_slug,),
        fetch="one",
    )
    if not product:
        return None
    product["faqs"] = get_product_faqs(product_slug)
    product["specs"] = get_product_specs(product_slug)
    return product


def get_product_specs(product_slug):
    return run_query(
        """
        SELECT spec_group, spec_label, spec_value, display_order
        FROM product_specs
        WHERE product_id = (SELECT id FROM products WHERE slug = %s)
        ORDER BY display_order, spec_label
        """,
        (product_slug,),
    )


def get_product_faqs(product_slug):
    curated_faqs = run_query(
        """
        SELECT
          'product_faqs' AS source_table,
          faq_key,
          question,
          answer,
          keywords,
          display_order,
          NULL::text AS category_name,
          NULL::text AS multimedia_asset,
          NULL::text AS content_type,
          NULL::text AS file_name
        FROM product_faqs
        WHERE product_id = (SELECT id FROM products WHERE slug = %s)
          AND is_published = TRUE
        ORDER BY display_order, question
        """,
        (product_slug,),
    )
    if curated_faqs:
        return curated_faqs

    return run_query(
        """
        SELECT
          'knowledge_qa_items' AS source_table,
          item_code AS faq_key,
          question,
          answer,
          ARRAY[]::text[] AS keywords,
          COALESCE(item_number, source_row_number) AS display_order,
          category_name,
          multimedia_asset,
          content_type,
          file_name
        FROM knowledge_qa_items
        WHERE product_slug = %s
        ORDER BY source_sheet, source_row_number
        """,
        (product_slug,),
    )


def list_prices(*, product_slug=None, limit=50):
    if product_slug:
        return run_query(
            """
            SELECT
              product_slug,
              model_name,
              size_label,
              property_text,
              prompter_monitor,
              portable_hardcase,
              protect_cover,
              software_bundle,
              camera_plate,
              global_online_price_usd,
              abroad_dealer_price_usd
            FROM price_list_items
            WHERE product_slug = %s
            ORDER BY source_row_number
            LIMIT %s
            """,
            (product_slug, limit),
        )

    return run_query(
        """
        SELECT
          product_slug,
          model_name,
          size_label,
          property_text,
          prompter_monitor,
          portable_hardcase,
          protect_cover,
          software_bundle,
          camera_plate,
          global_online_price_usd,
          abroad_dealer_price_usd
        FROM price_list_items
        ORDER BY source_row_number
        LIMIT %s
        """,
        (limit,),
    )


def search_knowledge(text_query, *, product_slug=None, limit=10):
    like_query = f"%{text_query}%"
    prefix_query = f"{text_query}%"
    if product_slug:
        return run_query(
            """
            SELECT
              source_file,
              source_sheet,
              category_name,
              product_slug,
              item_code,
              item_number,
              question,
              answer,
              multimedia_asset,
              content_type,
              file_name
            FROM knowledge_qa_items
            WHERE product_slug = %s
              AND (
                question ILIKE %s
                OR answer ILIKE %s
                OR category_name ILIKE %s
              )
            ORDER BY
              CASE
                WHEN question ILIKE %s THEN 0
                WHEN question ILIKE %s THEN 1
                WHEN answer ILIKE %s THEN 2
                ELSE 3
              END,
              source_sheet,
              source_row_number
            LIMIT %s
            """,
            (product_slug, like_query, like_query, like_query, text_query, prefix_query, like_query, limit),
        )

    return run_query(
        """
        SELECT
          source_file,
          source_sheet,
          category_name,
          product_slug,
          item_code,
          item_number,
          question,
          answer,
          multimedia_asset,
          content_type,
          file_name
        FROM knowledge_qa_items
        WHERE
          question ILIKE %s
          OR answer ILIKE %s
          OR category_name ILIKE %s
          OR COALESCE(product_slug, '') ILIKE %s
        ORDER BY
          CASE
            WHEN question ILIKE %s THEN 0
            WHEN question ILIKE %s THEN 1
            WHEN answer ILIKE %s THEN 2
            ELSE 3
          END,
          source_sheet,
          source_row_number
        LIMIT %s
        """,
        (like_query, like_query, like_query, like_query, text_query, prefix_query, like_query, limit),
    )


def search_prices(text_query, *, product_slug=None, limit=5):
    like_query = f"%{text_query}%"
    if product_slug:
        return run_query(
            """
            SELECT
              product_slug,
              model_name,
              size_label,
              property_text,
              global_online_price_usd,
              abroad_dealer_price_usd
            FROM price_list_items
            WHERE product_slug = %s
               OR model_name ILIKE %s
               OR property_text ILIKE %s
            ORDER BY source_row_number
            LIMIT %s
            """,
            (product_slug, like_query, like_query, limit),
        )

    return run_query(
        """
        SELECT
          product_slug,
          model_name,
          size_label,
          property_text,
          global_online_price_usd,
          abroad_dealer_price_usd
        FROM price_list_items
        WHERE model_name ILIKE %s
           OR property_text ILIKE %s
           OR COALESCE(product_slug, '') ILIKE %s
        ORDER BY source_row_number
        LIMIT %s
        """,
        (like_query, like_query, like_query, limit),
    )


def format_currency(value):
    if value in (None, ""):
        return ""
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return ""
    return f"${numeric:,.2f}"


def sanitize_history(history):
    if not isinstance(history, list):
        return []

    cleaned = []
    for item in history[-8:]:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role", "")).strip().lower()
        content = clean_query_value(item.get("content", ""))
        if role not in {"user", "assistant"} or not content:
            continue
        cleaned.append({"role": role, "content": content[:2000]})
    return cleaned


def build_context_text(message, *, product_slug=None):
    knowledge_items = search_knowledge(message, product_slug=product_slug, limit=8)
    if not knowledge_items and product_slug:
        knowledge_items = search_knowledge(message, product_slug=None, limit=8)

    price_items = search_prices(message, product_slug=product_slug, limit=4)
    product = get_product(product_slug) if product_slug else None

    context_sections = []

    if product:
        product_lines = [
            f"Product slug: {product.get('slug')}",
            f"Product name: {product.get('name')}",
            f"Tagline: {product.get('tagline') or ''}",
            f"Summary: {product.get('summary') or ''}",
            f"Inputs: {product.get('inputs') or ''}",
            f"Brightness: {product.get('brightness_cd_m2') or ''}",
            f"Resolution: {product.get('resolution') or ''}",
            f"Aspect ratio: {product.get('aspect_ratio') or ''}",
            f"Weight kg: {product.get('weight_kg') or ''}",
            f"Global online price USD: {product.get('global_online_price_usd') or ''}",
            f"Abroad dealer price USD: {product.get('abroad_dealer_price_usd') or ''}",
            f"Buy now notes: {product.get('buy_now_notes') or ''}",
        ]
        context_sections.append("PRODUCT DETAIL\n" + "\n".join(product_lines))

    if knowledge_items:
        knowledge_lines = []
        for index, item in enumerate(knowledge_items, start=1):
            knowledge_lines.append(
                "\n".join([
                    f"[K{index}] Product: {item.get('product_slug') or 'general'}",
                    f"[K{index}] Category: {item.get('category_name') or 'uncategorized'}",
                    f"[K{index}] Question: {item.get('question') or ''}",
                    f"[K{index}] Answer: {item.get('answer') or ''}",
                ])
            )
        context_sections.append("KNOWLEDGE MATCHES\n" + "\n\n".join(knowledge_lines))

    if price_items:
        price_lines = []
        for index, item in enumerate(price_items, start=1):
            price_lines.append(
                f"[P{index}] {item.get('model_name') or item.get('product_slug')}: "
                f"global_online_price_usd={item.get('global_online_price_usd')}, "
                f"abroad_dealer_price_usd={item.get('abroad_dealer_price_usd')}, "
                f"property_text={item.get('property_text') or ''}"
            )
        context_sections.append("PRICE MATCHES\n" + "\n".join(price_lines))

    return {
        "product": product,
        "knowledgeItems": knowledge_items,
        "priceItems": price_items,
        "contextText": "\n\n".join(context_sections).strip(),
    }


def extract_output_text(response_payload):
    if not isinstance(response_payload, dict):
        return ""

    output_items = response_payload.get("output") or []
    text_parts = []
    for item in output_items:
        if not isinstance(item, dict) or item.get("type") != "message":
            continue
        for content in item.get("content") or []:
            if not isinstance(content, dict):
                continue
            if content.get("type") == "output_text" and content.get("text"):
                text_parts.append(str(content["text"]).strip())

    return "\n\n".join(part for part in text_parts if part).strip()


def call_openai_responses_api(*, message, context_text, history=None):
    api_key = get_openai_api_key()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    instructions = (
        "You are the Crystal Prompter assistant. "
        "Answer only from the provided Crystal Prompter context. "
        "If the answer is not in the context, say you do not have enough verified information yet. "
        "Do not invent prices, specs, warranty terms, shipping details, or support claims. "
        "Keep answers concise and practical. "
        "Reply in short spoken sentences only. "
        "Maximum 3 short sentences. "
        "Prefer exactly 2 or 3 sentences when helpful. "
        "Make the first sentence very short and direct, ideally under 10 words. "
        "Put extra detail in sentence 2 or sentence 3. "
        "Each sentence should be natural for voice output. "
        "Avoid compound run-on sentences. "
        "Do not use long paragraphs or intro fluff."
    )

    input_items = []
    for item in sanitize_history(history):
        input_items.append({
            "role": item["role"],
            "content": item["content"],
        })

    user_content = []
    if context_text:
      user_content.append({"type": "input_text", "text": f"Crystal Prompter context:\n{context_text}"})
    user_content.append({"type": "input_text", "text": f"User question:\n{message}"})
    input_items.append({
        "role": "user",
        "content": user_content,
    })

    request_body = {
        "model": get_openai_model(),
        "instructions": instructions,
        "input": input_items,
        "text": {
            "format": {
                "type": "text"
            }
        }
    }

    request = urllib_request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(request_body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib_request.urlopen(request, timeout=90) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib_error.HTTPError as error:
        error_body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI API error {error.code}: {error_body}") from error
    except urllib_error.URLError as error:
        raise RuntimeError(f"OpenAI API request failed: {error.reason}") from error

    answer = extract_output_text(payload)
    if not answer:
        raise RuntimeError("OpenAI API returned no text output")
    return {
        "answer": answer,
        "response": payload,
    }


def chat_with_openai(message, *, product_slug=None, history=None, language="EN", voice=""):
    request_started_at = time.monotonic()
    context = build_context_text(message, product_slug=product_slug)
    llm_started_at = time.monotonic()
    openai_result = call_openai_responses_api(
        message=message,
        context_text=context["contextText"],
        history=history or [],
    )
    llm_duration_ms = int((time.monotonic() - llm_started_at) * 1000)
    log_timing(
        "chat_llm_done",
        productSlug=product_slug or (context["product"] or {}).get("slug"),
        messageChars=len(message),
        llmMs=llm_duration_ms,
    )

    split_started_at = time.monotonic()
    chunk_texts = split_into_sentence_chunks(openai_result["answer"])
    split_duration_ms = int((time.monotonic() - split_started_at) * 1000)
    log_timing(
        "chat_split_done",
        chunkCount=len(chunk_texts),
        splitMs=split_duration_ms,
    )

    resolved_voice = voice or VOICE_MAP.get(language, VOICE_MAP["EN"])
    chunk_session_id = create_chunk_session(
        answer=openai_result["answer"],
        chunks=chunk_texts,
        voice=resolved_voice,
        language=language,
        product_slug=product_slug or (context["product"] or {}).get("slug"),
    )

    first_chunk_response = None
    first_chunk_ready_ms = 0
    if chunk_texts:
        first_chunk_started_at = time.monotonic()
        first_chunk_response = get_or_create_chunk_response(chunk_session_id, 0)
        first_chunk_ready_ms = int((time.monotonic() - first_chunk_started_at) * 1000)

    total_request_ms = int((time.monotonic() - request_started_at) * 1000)
    log_timing(
        "chat_first_chunk_ready",
        sessionId=chunk_session_id,
        firstChunkReadyMs=first_chunk_ready_ms,
        totalRequestMs=total_request_ms,
        chunkCount=len(chunk_texts),
    )

    return {
        "answer": openai_result["answer"],
        "model": get_openai_model(),
        "productSlug": product_slug or (context["product"] or {}).get("slug"),
        "knowledgeItems": context["knowledgeItems"],
        "priceItems": context["priceItems"],
        "chunking": {
            "sessionId": chunk_session_id,
            "totalChunks": len(chunk_texts),
            "firstChunk": (first_chunk_response or {}).get("chunk"),
            "hasMore": len(chunk_texts) > 1,
        },
        "timings": {
            "llmMs": llm_duration_ms,
            "splitMs": split_duration_ms,
            "firstChunkReadyMs": first_chunk_ready_ms,
            "totalRequestMs": total_request_ms,
        },
        "sources": {
            "knowledgeCount": len(context["knowledgeItems"]),
            "priceCount": len(context["priceItems"]),
        },
    }


def find_rhubarb_binary():
    return shutil.which("rhubarb") or shutil.which("rhubarb-lip-sync")


def build_speech_package(text, voice, language):
    with tempfile.TemporaryDirectory(prefix="avatar-voice-") as tmpdir:
        wav_path = os.path.join(tmpdir, "speech.wav")
        dialog_path = os.path.join(tmpdir, "dialog.txt")
        voice_used = voice

        # XTTS is optional and runs in its own env so we can clone a custom reference voice without
        # forcing the main app env to import the heavy TTS stack.
        xtts_error = None
        if is_xtts_enabled():
            try:
                voice_used = synthesize_speech_with_xtts(text=text, language=language, wav_path=wav_path)
            except Exception as error:
                xtts_error = str(error)
                log_timing("xtts_fallback", error=xtts_error, textChars=len(text))

        # Prefer neural XTTS/OpenAI TTS for more natural speech, then fall back to macOS voices locally.
        if not os.path.exists(wav_path) and get_openai_api_key():
            voice_used = synthesize_speech_with_openai(text=text, voice=voice, language=language, wav_path=wav_path)
        elif not os.path.exists(wav_path) and shutil.which("say") and shutil.which("afconvert"):
            aiff_path = os.path.join(tmpdir, "speech.aiff")
            subprocess.run(
                ["say", "-v", voice, "-r", "180", "-o", aiff_path, text],
                check=True,
                capture_output=True,
                text=True,
            )
            subprocess.run(
                ["afconvert", "-f", "WAVE", "-d", "LEI16@22050", aiff_path, wav_path],
                check=True,
                capture_output=True,
                text=True,
            )
        elif not os.path.exists(wav_path):
            raise RuntimeError("No TTS backend is available. Configure OPENAI_API_KEY or use macOS say.")

        with open(dialog_path, "w", encoding="utf-8") as dialog_file:
            dialog_file.write(text)

        with open(wav_path, "rb") as file:
            audio_bytes = file.read()

        duration_ms = get_wav_duration_ms(wav_path)
        mouth_cues = []
        lipsync_source = "fallback"

        rhubarb_binary = find_rhubarb_binary()
        if rhubarb_binary:
            try:
                mouth_cues = run_rhubarb_lipsync(
                    rhubarb_binary=rhubarb_binary,
                    wav_path=wav_path,
                    dialog_path=dialog_path,
                    language=language,
                )
                lipsync_source = "rhubarb"
            except subprocess.CalledProcessError:
                mouth_cues = []

        if not mouth_cues:
            mouth_cues = generate_fallback_mouth_cues(text, duration_ms)

        return {
            "audio_bytes": audio_bytes,
            "duration_ms": duration_ms,
            "mouth_cues": mouth_cues,
            "lipsync_source": lipsync_source,
            "voice_used": voice_used,
            "xttsError": xtts_error,
        }


def resolve_openai_tts_voice(voice, language):
    if voice in OPENAI_TTS_VOICE_MAP:
        return OPENAI_TTS_VOICE_MAP[voice]
    if language == "EN":
        return "coral"
    return get_openai_tts_voice()


def synthesize_speech_with_openai(*, text, voice, language, wav_path):
    api_key = get_openai_api_key()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required for cloud TTS")

    resolved_voice = resolve_openai_tts_voice(voice, language)
    request_body = {
        "model": get_openai_tts_model(),
        "voice": resolved_voice,
        "input": text,
        "response_format": "wav",
    }

    request = urllib_request.Request(
        "https://api.openai.com/v1/audio/speech",
        data=json.dumps(request_body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib_request.urlopen(request, timeout=90) as response:
            audio_bytes = response.read()
    except urllib_error.HTTPError as error:
        error_body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI TTS error {error.code}: {error_body}") from error
    except urllib_error.URLError as error:
        raise RuntimeError(f"OpenAI TTS request failed: {error.reason}") from error

    with open(wav_path, "wb") as wav_file:
        wav_file.write(audio_bytes)

    return resolved_voice


def synthesize_speech_with_xtts(*, text, language, wav_path):
    speaker_wav = get_xtts_speaker_wav()
    xtts_python = get_xtts_python()
    if not speaker_wav:
        raise RuntimeError("XTTS_SPEAKER_WAV is not configured")
    if not os.path.exists(speaker_wav):
        raise RuntimeError(f"XTTS_SPEAKER_WAV was not found: {speaker_wav}")
    if not os.path.exists(xtts_python):
        raise RuntimeError(f"XTTS_PYTHON was not found: {xtts_python}")

    xtts_language = get_xtts_language()
    script = """
from TTS.api import TTS

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")
tts.tts_to_file(
    text={text!r},
    file_path={wav_path!r},
    speaker_wav={speaker_wav!r},
    language={language!r},
)
"""
    completed = subprocess.run(
        [xtts_python, "-c", script.format(
            text=text,
            wav_path=wav_path,
            speaker_wav=speaker_wav,
            language=xtts_language if xtts_language else language.lower(),
        )],
        check=True,
        capture_output=True,
        text=True,
    )
    if not os.path.exists(wav_path):
        message = completed.stderr.strip() or completed.stdout.strip() or "XTTS did not produce a wav file"
        raise RuntimeError(message)
    return "xtts-cloned"


def get_wav_duration_ms(wav_path):
    ffprobe_binary = shutil.which("ffprobe")
    if ffprobe_binary:
        try:
            completed = subprocess.run(
                [
                    ffprobe_binary,
                    "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    wav_path,
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            duration_seconds = float((completed.stdout or "").strip() or "0")
            if duration_seconds > 0:
                return max(1, round(duration_seconds * 1000))
        except (subprocess.CalledProcessError, ValueError):
            pass

    with wave.open(wav_path, "rb") as wav_file:
        frame_rate = wav_file.getframerate() or 1
        frame_count = wav_file.getnframes()
        return max(1, round((frame_count / frame_rate) * 1000))


def run_rhubarb_lipsync(rhubarb_binary, wav_path, dialog_path, language):
    json_path = os.path.join(os.path.dirname(wav_path), "lipsync.json")
    recognizer = "pocketSphinx" if language == "EN" else "phonetic"

    subprocess.run(
        [
            rhubarb_binary,
            "-f", "json",
            "-r", recognizer,
            "--extendedShapes", "GHX",
            "-d", dialog_path,
            "-o", json_path,
            wav_path,
        ],
        check=True,
        capture_output=True,
        text=True,
    )

    with open(json_path, "r", encoding="utf-8") as result_file:
        result = json.load(result_file)

    mouth_cues = []
    for cue in result.get("mouthCues", []):
        mouth_cues.append({
            "startMs": max(0, round(float(cue.get("start", 0)) * 1000)),
            "endMs": max(0, round(float(cue.get("end", 0)) * 1000)),
            "value": str(cue.get("value", "X")).upper()[:1] or "X",
        })
    return mouth_cues


def generate_fallback_mouth_cues(text, duration_ms):
    letters = [char.lower() for char in text if char.isalpha()]
    if not letters:
        return [{"startMs": 0, "endMs": max(120, duration_ms), "value": "X"}]

    active_duration = max(220, duration_ms - 120)
    step_count = max(3, min(len(letters), max(4, active_duration // 95)))
    step_ms = max(70, active_duration // step_count)
    cues = [{"startMs": 0, "endMs": 60, "value": "X"}]

    for index in range(step_count):
        start_ms = 60 + index * step_ms
        end_ms = min(duration_ms, start_ms + step_ms)
        if end_ms <= start_ms:
            continue

        letter = letters[min(index, len(letters) - 1)]
        shape = RHYTHM_VOWEL_MAP.get(letter, RHYTHM_SHAPES[index % len(RHYTHM_SHAPES)])
        cues.append({
            "startMs": start_ms,
            "endMs": end_ms,
            "value": shape,
        })

    final_start = cues[-1]["endMs"] if cues else 0
    if final_start < duration_ms:
        cues.append({
            "startMs": final_start,
            "endMs": duration_ms,
            "value": "X",
        })
    elif cues:
        cues[-1]["value"] = "X"

    return cues


def build_avatar_command(command_template, *, audio_path, output_path, source_path, job_id):
    substitutions = {
        "audio_path": shlex.quote(audio_path),
        "output_path": shlex.quote(output_path),
        "source_path": shlex.quote(source_path),
        "workspace": shlex.quote(ROOT_DIR),
        "job_id": job_id,
    }
    try:
        return command_template.format(**substitutions)
    except KeyError as error:
        raise RuntimeError(f"AVATAR_GENERATOR_COMMAND is missing placeholder: {error.args[0]}") from error


def build_avatar_speech_package(*, text, voice, language, speech_package=None):
    command_template = get_avatar_generator_command()
    source_path = get_avatar_source_image()

    if not command_template:
        raise RuntimeError("AVATAR_GENERATOR_COMMAND is not configured")
    if not source_path:
        raise RuntimeError("AVATAR_SOURCE_IMAGE is not configured")
    if not os.path.exists(source_path):
        raise RuntimeError(f"AVATAR_SOURCE_IMAGE was not found: {source_path}")

    package = speech_package or build_speech_package(text, voice, language)
    os.makedirs(GENERATED_AVATAR_DIR, exist_ok=True)

    job_id = uuid.uuid4().hex
    output_path = os.path.join(GENERATED_AVATAR_DIR, f"{job_id}.mp4")

    with tempfile.TemporaryDirectory(prefix="avatar-job-") as temp_dir:
        audio_path = os.path.join(temp_dir, "reply.wav")
        with open(audio_path, "wb") as audio_file:
            audio_file.write(package["audio_bytes"])

        command = build_avatar_command(
            command_template,
            audio_path=audio_path,
            output_path=output_path,
            source_path=source_path,
            job_id=job_id,
        )

        completed = subprocess.run(
            command,
            shell=True,
            cwd=ROOT_DIR,
            capture_output=True,
            text=True,
        )
        if completed.returncode != 0:
            message = completed.stderr.strip() or completed.stdout.strip() or f"Avatar generator failed with exit code {completed.returncode}"
            raise RuntimeError(message)

    if not os.path.exists(output_path):
        raise RuntimeError("Avatar generator did not produce an output video")

    return {
        "audio_bytes": package["audio_bytes"],
        "duration_ms": package["duration_ms"],
        "job_id": job_id,
        "video_url": f"/generated/avatar/{job_id}.mp4",
        "voice_used": package.get("voice_used"),
    }


def main():
    host = get_server_host()
    port = get_server_port()
    server = ThreadingHTTPServer((host, port), AppHandler)
    print(f"Serving Crystal Prompter on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
