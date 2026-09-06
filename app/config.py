"""Centralised environment/configuration helpers.

Loads the project-root ``.env`` exactly once (walking upward from this
module and from the CWD, so it works no matter where the process starts)
and exposes helpers for fetching the Hugging Face access token used by the
audio pipeline (pyannote diarization + gated faster-whisper models).
"""

import os
from pathlib import Path

from dotenv import load_dotenv

_ENV_FILE = None


def find_env_file():
    """Locate the project-root ``.env`` file, walking upward from this
    module location and from the current working directory. Returns the
    path or ``None``. The result is cached."""
    global _ENV_FILE
    if _ENV_FILE is not None:
        return _ENV_FILE

    seen = set()

    def _upward(start: Path):
        directory = start
        while True:
            if directory in seen:
                return None
            seen.add(directory)
            env = directory / ".env"
            if env.is_file():
                return env
            if directory.parent == directory:
                return None
            directory = directory.parent

    candidates = []
    try:
        candidates.append(Path(__file__).resolve().parent)
    except Exception:
        pass
    try:
        candidates.append(Path.cwd().resolve())
    except Exception:
        pass

    for start in candidates:
        found = _upward(start)
        if found is not None:
            _ENV_FILE = found
            return _ENV_FILE
    return None


def load_env():
    """Load the project-root ``.env`` into ``os.environ``.

    ``override=False`` means a variable already exported in the shell always
    wins over the value in the file.
    """
    env = find_env_file()
    if env is not None:
        load_dotenv(env, override=False)
    return env


def get_huggingface_token():
    """Return the configured Hugging Face access token or ``None``.

    Accepts any of the common variable names so the credential keeps working
    regardless of which one operators choose:
        HF_TOKEN, HUGGINGFACE_TOKEN, HF_HUB_TOKEN,
        HUGGINGFACE_HUB_TOKEN, HUGGINGFACEHUB_API_TOKEN
    """
    load_env()
    return (
        os.environ.get("HF_TOKEN")
        or os.environ.get("HUGGINGFACE_TOKEN")
        or os.environ.get("HF_HUB_TOKEN")
        or os.environ.get("HUGGINGFACE_HUB_TOKEN")
        or os.environ.get("HUGGINGFACEHUB_API_TOKEN")
        or None
    )


def is_huggingface_token_configured() -> bool:
    return bool(get_huggingface_token())