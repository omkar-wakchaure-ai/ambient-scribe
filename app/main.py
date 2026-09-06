"""Ambient Scribe - FastAPI application entry point.

Run from the project root (the directory containing the ``app`` package):
    uvicorn app.main:app --host 127.0.0.1 --port 8000

Integrates:
  - Person A: audio pipeline (whisper + pyannote diarization)
  - Person B: clinical intelligence (extraction -> SOAP -> actions)
  - Person C: API routes + job manager
  - React frontend: served statically in production (frontend/dist)

Production layout:
    Browser
       |
       v
    FastAPI :8000
       |
   +---+-----------------------------+
   v                                 v
React static files (frontend/dist)  /api routes (consultations etc.)
"""

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routers.consultations import router as consultations_router
from app.routers.api import router as api_router

# React dev server origins. Override with ALLOWED_ORIGINS (comma-separated)
# for non-default environments.
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
_allowed_origins = [
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", ",".join(_default_origins)).split(",")
    if o.strip()
]

app = FastAPI(
    title="Ambient Scribe API",
    description="Doctor-patient consultation transcription with "
    "diarization, clinical extraction, SOAP notes and action summaries.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(consultations_router)
app.include_router(api_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# ----------------------------------------------------------------------
# Production: serve the built React app from frontend/dist when present.
# API routes above take precedence; everything else is either a static
# asset or the SPA entry point (so browser back/forward and deep links
# work). In development the dist folder does not exist, so no static
# mount is installed at all and the Vite dev server proxies /api here.
# ----------------------------------------------------------------------
_DIST_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if _DIST_DIR.is_dir():
    _ASSETS_DIR = _DIST_DIR / "assets"
    if _ASSETS_DIR.is_dir():
        app.mount("/assets", StaticFiles(directory=_ASSETS_DIR), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        candidate = _DIST_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(_DIST_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)