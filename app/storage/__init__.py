"""Storage helpers for uploaded consultation audio."""

import os
import uuid
from pathlib import Path

_UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"


def save_upload(filename: str, data: bytes) -> str:
    """Persist an uploaded file to the local uploads dir and return its
    absolute path. The uploads dir is created on demand and git-ignored."""
    _UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = Path(filename or "upload").name
    target = _UPLOAD_DIR / (uuid.uuid4().hex[:8] + "_" + safe_name)
    target.write_bytes(data)
    return str(target)


def cleanup(path):
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except OSError:
        pass