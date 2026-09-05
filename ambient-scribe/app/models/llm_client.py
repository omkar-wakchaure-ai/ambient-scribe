"""
app/models/llm_client.py
-------------------------
Thin abstraction over two backends: Groq (hosted, fast) and Ollama
(local, offline). Swap via env var without touching pipeline code.

Env vars:
    LLM_BACKEND   = "groq" | "ollama"   (default: "groq")
    GROQ_API_KEY  = <your key>          (required if backend == groq)
    OLLAMA_HOST   = "http://localhost:11434" (default, if backend == ollama)

Notes on configuration robustness:
  * .env is located RELATIVE TO THE PROJECT ROOT (the directory that
    contains .env), independent of the current working directory, so the
    same code works whether you run from the project root, from `app`, or
    from anywhere else.
  * If GROQ_API_KEY is missing we raise a clear RuntimeError instead of a
    bare KeyError.
  * Groq models are verified against the LIVE model list for the active
    API key at runtime. If a preferred model for an alias is unavailable
    (e.g. the key cannot access it, or it has been retired/renamed), we
    transparently fall back to the best available supported model instead
    of crashing with `model_not_found`.
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv


# ------------------------------------------------------------------
# Robust .env discovery: locate the project-root .env regardless of
# the current working directory. We walk upward from BOTH this module's
# location and the cwd so executing from the project root, from `app`,
# or from any other directory still finds the same .env file.
# ------------------------------------------------------------------
def _find_env_file() -> Path | None:
    seen = set()

    def _upward(start: Path) -> Path | None:
        d = start
        while True:
            if d in seen:
                return None
            seen.add(d)
            env = d / ".env"
            if env.is_file():
                return env
            if d.parent == d:
                return None
            d = d.parent

    candidates = [Path(__file__).resolve().parent]
    try:
        candidates.append(Path.cwd().resolve())
    except Exception:
        pass

    # Most specific (module location) first.
    for start in candidates:
        found = _upward(start)
        if found is not None:
            return found
    return None


_ENV_FILE = _find_env_file()
if _ENV_FILE is not None:
    # override=False -> never clobber a real environment variable that a
    # caller may have exported in the shell.
    load_dotenv(_ENV_FILE, override=False)

BACKEND = os.environ.get("LLM_BACKEND", "groq").lower()

# ------------------------------------------------------------------
# Model catalogs.
#
# GROQ_MODELS: preferred model per aliased "size". These are current,
# supported Groq model names (NOT the retired llama-3.1-70b-versatile).
# Runtime availability to the active API key is checked before use.
# ------------------------------------------------------------------
GROQ_MODELS = {
    "8b": ["llama-3.1-8b-instant"],
    "70b": ["llama-3.3-70b-versatile"],
}

# Shared fallback pool of currently-supported Groq chat models, ordered
# roughly by capability for the clinical-extraction workload. If none of
# the preferred models for an alias is available to the key, we pick the
# first member of this pool that IS available.
GROQ_FALLBACK_POOL = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-safeguard-20b",
    "allam-2-7b",
]

OLLAMA_MODELS = {
    "8b": "llama3.1:8b",
    "70b": "llama3.1:70b",
}


# ------------------------------------------------------------------
# Groq runtime model resolution
# ------------------------------------------------------------------
def _is_chat_model(model_id: str) -> bool:
    """Exclude speech/text-classification helpers that aren't chat models."""
    low = model_id.lower()
    if low.startswith("whisper"):
        return False
    if "prompt-guard" in low:
        return False
    if "audio" in low or "asr" in low or "stt" in low:
        return False
    return True


_GROQ_MODEL_CACHE: set[str] | None = None


def _available_groq_models(client) -> set[str]:
    global _GROQ_MODEL_CACHE
    if _GROQ_MODEL_CACHE is not None:
        return _GROQ_MODEL_CACHE
    try:
        _GROQ_MODEL_CACHE = {m.id for m in client.models.list().data}
    except Exception:
        # Don't mask a real API error silently, but don't fail only
        # because model enumeration is unavailable — callers fall back to
        # the explicit default and let the actual request surface errors.
        return set()
    return _GROQ_MODEL_CACHE


def _resolve_groq_model(client, model_alias: str) -> str:
    preferred = GROQ_MODELS.get(model_alias, [])

    candidates: list[str] = []
    for m in preferred:
        if m not in candidates:
            candidates.append(m)
    for m in GROQ_FALLBACK_POOL:
        if m not in candidates:
            candidates.append(m)

    available = _available_groq_models(client)

    # 1) Preferred model available? -> use it.
    if available:
        for m in candidates:
            if m in available:
                return m
        # 2) Preferred + fallback pool all unavailable -> any available
        #    chat-capable model, so the pipeline keeps working.
        chat = [m for m in available if _is_chat_model(m)]
        if chat:
            return sorted(chat)[0]

    # 3) Model enumeration failed or empty -> fall back to the configured
    #    default so a broken listing never silently picks a bad model.
    return candidates[0]


# ------------------------------------------------------------------
# Backend callers
# ------------------------------------------------------------------
def _call_groq(system_prompt: str, user_prompt: str, model_alias: str,
               temperature: float, json_mode: bool) -> str:
    from groq import Groq  # pip install groq

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not configured. Add GROQ_API_KEY to the "
            "project's .env file."
        )

    client = Groq(api_key=api_key)
    model = _resolve_groq_model(client, model_alias)

    kwargs = {}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    try:
        resp = client.chat.completions.create(
            model=model,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            **kwargs,
        )
    except Exception as exc:
        # Keep real API errors visible and readable, and note which model
        # was selected so a model_not_found / auth failure is diagnosable.
        raise RuntimeError(
            f"Groq request failed (model={model}, alias={model_alias!r}): {exc}"
        ) from exc

    return resp.choices[0].message.content


def _call_ollama(system_prompt: str, user_prompt: str, model_alias: str,
                 temperature: float, json_mode: bool) -> str:
    import requests  # pip install requests

    host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
    model = OLLAMA_MODELS.get(model_alias, OLLAMA_MODELS["8b"])

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "options": {"temperature": temperature},
    }
    if json_mode:
        payload["format"] = "json"

    try:
        r = requests.post(f"{host}/api/chat", json=payload, timeout=120)
        r.raise_for_status()
    except Exception as exc:
        raise RuntimeError(
            f"Ollama request failed (model={model}, host={host}): {exc}"
        ) from exc
    return r.json()["message"]["content"]


def call_llm(system_prompt: str, user_prompt: str, model: str = "70b",
             temperature: float = 0.1, json_mode: bool = False) -> str:
    """
    model: "8b" or "70b" alias. Use 70b for extraction (harder reasoning
    over noisy Hinglish transcript); 8b is usually enough for SOAP/actions
    since those consume already-structured JSON.
    """
    if BACKEND == "groq":
        return _call_groq(system_prompt, user_prompt, model, temperature, json_mode)
    elif BACKEND == "ollama":
        return _call_ollama(system_prompt, user_prompt, model, temperature, json_mode)
    else:
        raise ValueError(f"Unknown LLM_BACKEND: {BACKEND}")


def safe_json_parse(raw: str) -> dict:
    """LLMs sometimes wrap JSON in ```json fences or add stray text — strip and parse."""
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            return json.loads(cleaned[start:end + 1])
        raise
