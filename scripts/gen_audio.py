#!/usr/bin/env python3
"""Generate Fish Audio mp3s and whisper word timings for Blackjack 学习app.

Reads data/audio-lines.json, writes:
  audio/<id>.mp3          mono 24 kHz 64 kbps
  audio/<id>.json         {"words":[{"w","start","end"}]}
  audio/index.json        {"ids":[...],"timings":[...]}

Only missing (or too-small) mp3s are synthesized. Alignment runs for any id
that has an mp3 but no timings file, and again after new synthesis.
Rebuilds index.json every run.

The Fish key is read from the FISH_KEY_PATH environment variable.
The key is never printed, logged, or written into this repo.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LINES_PATH = ROOT / "data" / "audio-lines.json"
AUDIO_DIR = ROOT / "audio"
INDEX_PATH = AUDIO_DIR / "index.json"

API = "https://api.fish.audio/v1/tts"
MODEL = "s2.1-pro-free"
VOICES = {
    "dealer": "536d3a5e000945adb7038665781a4aca",  # Ethan
    "player": "c2623f0c075b4492ac367989aee1576f",  # Paula
    "narrator": "0327fdb5da9e4fd782899a8058c8ae2b",
}

MIN_MP3_BYTES = 400
TTS_ATTEMPTS = 6
LINE_RETRIES = 2  # extra full passes after the first attempt
TTS_WORKERS = 2
HTTP_TIMEOUT = 120

_KEY = None  # loaded once; never printed


def _redact(text: str) -> str:
    """Strip the key from any string before it is printed."""
    if not text:
        return text
    out = text
    key = _KEY
    if key:
        out = out.replace(key, "[redacted]")
    return out


def log(msg: str) -> None:
    print(_redact(str(msg)), flush=True)


def load_key() -> str:
    global _KEY
    path = os.environ.get("FISH_KEY_PATH", "")
    if not path:
        raise SystemExit("Set FISH_KEY_PATH to a key file. Do not commit the key.")
    p = Path(path)
    if not p.is_file():
        raise SystemExit(f"Fish key file not found at {path}. Set FISH_KEY_PATH.")
    key = p.read_text(encoding="utf-8").strip()
    if not key:
        raise SystemExit(f"Fish key file at {path} is empty.")
    _KEY = key
    return key


def is_mp3_bytes(data: bytes) -> bool:
    if len(data) < 4:
        return False
    if data[:3] == b"ID3":
        return True
    return data[:2] in (b"\xff\xfb", b"\xff\xf3", b"\xff\xf2", b"\xff\xfa")


def valid_mp3(path: Path) -> bool:
    if not path.is_file() or path.stat().st_size < MIN_MP3_BYTES:
        return False
    head = path.read_bytes()[:16]
    return is_mp3_bytes(head)


def ffmpeg_to_mp3(src: Path, dest: Path) -> None:
    tmp = dest.with_suffix(".tmp.mp3")
    subprocess.run(
        [
            "ffmpeg", "-y", "-v", "error",
            "-i", str(src),
            "-ac", "1", "-ar", "24000",
            "-c:a", "libmp3lame", "-b:a", "64k",
            str(tmp),
        ],
        check=True,
    )
    tmp.replace(dest)


def synth_one(line: dict) -> Path:
    """Call Fish TTS and write audio/<id>.mp3. Raises on failure."""
    line_id = line["id"]
    text = line["text"]
    role = line["role"]
    if role not in VOICES:
        raise RuntimeError(f"{line_id}: unknown role {role}")
    dest = AUDIO_DIR / f"{line_id}.mp3"
    body = json.dumps(
        {
            "text": text,
            "reference_id": VOICES[role],
            "format": "mp3",
            "mp3_bitrate": 128,
            "sample_rate": 44100,
            "normalize": True,
            "latency": "normal",
            "prosody": {"speed": 1.0, "normalize_loudness": True},
        },
        ensure_ascii=False,
    ).encode("utf-8")
    err = None
    for attempt in range(TTS_ATTEMPTS):
        req = urllib.request.Request(
            API,
            data=body,
            method="POST",
            headers={
                "Authorization": f"Bearer {_KEY}",
                "Content-Type": "application/json",
                "model": MODEL,
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
                data = resp.read()
            if not is_mp3_bytes(data):
                preview = data[:200].decode("utf-8", "replace")
                raise RuntimeError(f"not audio: {preview}")
            with tempfile.NamedTemporaryFile(suffix=".raw.mp3", delete=False) as raw:
                raw_path = Path(raw.name)
                raw.write(data)
            try:
                ffmpeg_to_mp3(raw_path, dest)
            finally:
                raw_path.unlink(missing_ok=True)
            if not valid_mp3(dest):
                raise RuntimeError("ffmpeg output was not a valid mp3")
            return dest
        except urllib.error.HTTPError as e:
            code = e.code
            msg = e.read().decode("utf-8", "replace")[:200]
            err = f"HTTP {code} {msg}"
            if code in (401, 402, 403):
                raise RuntimeError(f"Fish billing/auth error HTTP {code}") from None
            time.sleep(min(30, 2 ** attempt + 1))
        except Exception as e:
            err = str(e)
            time.sleep(min(30, 2 ** attempt + 1))
    raise RuntimeError(err or "tts failed")


def duration_sec(path: Path) -> float:
    out = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "csv=p=0",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(out.stdout.strip())


def pcm16k(path: Path):
    raw = subprocess.run(
        [
            "ffmpeg", "-v", "error",
            "-i", str(path),
            "-ac", "1", "-ar", "16000",
            "-f", "s16le", "-",
        ],
        capture_output=True,
        check=True,
    ).stdout
    import numpy as np

    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def display_words(text: str) -> list[str]:
    return text.split()


def map_timings(text: str, whisper_words: list, dur: float) -> list[dict]:
    """Align whisper word timings onto the original display words."""
    disp = display_words(text)
    if not disp:
        return []
    if not whisper_words:
        # even fallback so karaoke still has spans; rare
        step = dur / len(disp) if dur > 0 else 0.2
        return [
            {
                "w": w,
                "start": round(i * step, 3),
                "end": round(dur if i == len(disp) - 1 else (i + 1) * step, 3),
            }
            for i, w in enumerate(disp)
        ]

    def clean(s: str) -> str:
        return re.sub(r"[^a-z0-9']+", "", s.lower())

    ww = []
    for w in whisper_words:
        token = (w.word or "").strip()
        if not token:
            continue
        ww.append(w)

    if len(ww) == len(disp):
        chosen = ww
    else:
        # map by cumulative alphanumeric length
        tw = disp
        cw, c = [], 0
        for w in tw:
            c += max(1, len(clean(w)))
            cw.append(c)
        wc, c = [], 0
        for w in ww:
            c += max(1, len(clean(w.word)))
            wc.append(c)
        total_t = cw[-1] or 1
        total_w = wc[-1] or 1
        chosen = []
        for i in range(len(tw)):
            target = cw[i] / total_t
            j = min(range(len(ww)), key=lambda k: abs(wc[k] / total_w - target))
            chosen.append(ww[j])

    out = []
    for i, w in enumerate(disp):
        start = float(chosen[i].start)
        end = float(chosen[i].end)
        if i:
            start = max(start, out[-1]["end"])
        if end <= start:
            end = start + 0.05
        out.append({"w": w, "start": round(start, 3), "end": round(end, 3)})
    if out:
        out[0]["start"] = min(out[0]["start"], 0.0)
        if out[0]["start"] < 0:
            out[0]["start"] = 0.0
        out[-1]["end"] = max(out[-1]["end"], round(dur, 3))
    return out


def align_one(line: dict, model) -> Path | None:
    line_id = line["id"]
    mp3 = AUDIO_DIR / f"{line_id}.mp3"
    dest = AUDIO_DIR / f"{line_id}.json"
    if not valid_mp3(mp3):
        return None
    dur = duration_sec(mp3)
    audio = pcm16k(mp3)
    segs, _ = model.transcribe(
        audio,
        language="en",
        word_timestamps=True,
        beam_size=5,
        condition_on_previous_text=False,
    )
    words = [w for sg in segs for w in (sg.words or [])]
    payload = {"words": map_timings(line["text"], words, dur)}
    if not payload["words"]:
        raise RuntimeError(f"{line_id}: no words after alignment")
    dest.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    return dest


def valid_timings(path: Path) -> bool:
    if not path.is_file():
        return False
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False
    words = data.get("words")
    if not isinstance(words, list) or not words:
        return False
    return all(
        isinstance(w, dict) and "w" in w and "start" in w and "end" in w
        for w in words
    )


def rebuild_index(lines: list[dict]) -> dict:
    ids = [ln["id"] for ln in lines if valid_mp3(AUDIO_DIR / f"{ln['id']}.mp3")]
    timings = [ln["id"] for ln in lines if ln["id"] in ids and valid_timings(AUDIO_DIR / f"{ln['id']}.json")]
    index = {"ids": ids, "timings": timings}
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return index


def generate_missing(lines: list[dict]) -> tuple[list[str], list[str]]:
    """Return (made, failed) after retries."""
    pending = [ln for ln in lines if not valid_mp3(AUDIO_DIR / f"{ln['id']}.mp3")]
    made: list[str] = []
    failed: list[str] = []
    if not pending:
        log("all mp3s already present")
        return made, failed

    load_key()
    log(f"synthesizing {len(pending)} missing lines")

    remaining = pending
    for wave in range(1, LINE_RETRIES + 2):
        if not remaining:
            break
        log(f"tts pass {wave}: {len(remaining)} lines")
        still = []
        with ThreadPoolExecutor(TTS_WORKERS) as ex:
            futs = {ex.submit(synth_one, ln): ln for ln in remaining}
            for fut in as_completed(futs):
                ln = futs[fut]
                try:
                    fut.result()
                    made.append(ln["id"])
                    log(f"  ok  {ln['id']}")
                except Exception as e:
                    still.append(ln)
                    log(f"  fail {ln['id']}: {e}")
        remaining = still
    failed = [ln["id"] for ln in remaining]
    return made, failed


def align_missing(lines: list[dict]) -> tuple[list[str], list[str], bool]:
    need = [
        ln
        for ln in lines
        if valid_mp3(AUDIO_DIR / f"{ln['id']}.mp3")
        and not valid_timings(AUDIO_DIR / f"{ln['id']}.json")
    ]
    if not need:
        log("all timings already present")
        return [], [], True
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        log("faster-whisper is not installed; skipping timings")
        return [], [ln["id"] for ln in need], False

    log(f"aligning {len(need)} lines with faster-whisper base.en")
    model = WhisperModel("base.en", device="cpu", compute_type="float32", cpu_threads=4)
    made, failed = [], []
    for ln in need:
        try:
            align_one(ln, model)
            made.append(ln["id"])
            log(f"  timing ok  {ln['id']}")
        except Exception as e:
            failed.append(ln["id"])
            log(f"  timing fail {ln['id']}: {e}")
    return made, failed, True


def main() -> int:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    lines = json.loads(LINES_PATH.read_text(encoding="utf-8"))
    if not isinstance(lines, list) or not lines:
        raise SystemExit(f"no lines in {LINES_PATH}")
    log(f"loaded {len(lines)} lines from {LINES_PATH.relative_to(ROOT)}")

    made_mp3, failed_mp3 = generate_missing(lines)
    made_t, failed_t, whisper_ok = align_missing(lines)
    index = rebuild_index(lines)

    log(
        f"done: {len(index['ids'])} mp3s in index, "
        f"{len(index['timings'])} timings, "
        f"new mp3s={len(made_mp3)}, new timings={len(made_t)}"
    )
    if failed_mp3:
        log("FAILED mp3s: " + ", ".join(failed_mp3))
    if not whisper_ok:
        log("timings skipped because whisper could not run")
    elif failed_t:
        log("FAILED timings: " + ", ".join(failed_t))
    return 1 if failed_mp3 else 0


if __name__ == "__main__":
    sys.exit(main())
