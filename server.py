#!/usr/bin/env python3
import base64
import json
import os
import shutil
import subprocess
import tempfile
import wave
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


HOST = "127.0.0.1"
PORT = 8000
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
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


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def do_GET(self):
        if self.path == "/api/health":
            return self._send_json({
                "status": "ok",
                "rhubarbAvailable": bool(find_rhubarb_binary())
            })
        return super().do_GET()

    def do_POST(self):
        if self.path not in {"/api/tts", "/api/speak"}:
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

        if self.path == "/api/speak":
            return self._send_json({
                "audioBase64": base64.b64encode(speech_package["audio_bytes"]).decode("ascii"),
                "audioMimeType": "audio/wav",
                "durationMs": speech_package["duration_ms"],
                "mouthCues": speech_package["mouth_cues"],
                "lipsyncSource": speech_package["lipsync_source"],
                "voice": voice,
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
        body = json.dumps(payload).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def find_rhubarb_binary():
    return shutil.which("rhubarb") or shutil.which("rhubarb-lip-sync")


def build_speech_package(text, voice, language):
    with tempfile.TemporaryDirectory(prefix="avatar-voice-") as tmpdir:
        aiff_path = os.path.join(tmpdir, "speech.aiff")
        wav_path = os.path.join(tmpdir, "speech.wav")
        dialog_path = os.path.join(tmpdir, "dialog.txt")

        subprocess.run(
            ["say", "-v", voice, "-r", "175", "-o", aiff_path, text],
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
        }


def get_wav_duration_ms(wav_path):
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


def main():
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"Serving Crystal Prompter on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
