"""Ambient Scribe - FastAPI application entry point.

Run from the project root (the directory containing the ``app`` package):
    uvicorn app.main:app --reload

Integrates:
  - Person A: audio pipeline (whisper + pyannote diarization)
  - Person B: clinical intelligence (extraction -> SOAP -> actions)
  - Person C: API routes + job manager + Streamlit frontend
"""

from fastapi import FastAPI

from app.routers.consultations import router as consultations_router
from app.routers.api import router as api_router

app = FastAPI(
    title="Ambient Scribe API",
    description="Doctor-patient consultation transcription with "
    "diarization, clinical extraction, SOAP notes and action summaries.",
    version="0.1.0",
)

app.include_router(consultations_router)
app.include_router(api_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)