"""Person C API routes.

Replaces the mocked A/B responses with the real integrations exposed by
``app.services.pipeline_service`` and ``app.jobs.job_manager``.

Routes:
    POST /consultations   - upload audio -> background job (full pipeline)
    POST /transcript      - transcript text -> clinical extraction
    POST /soap-note       - extraction -> SOAP note
    POST /action-summary  - extraction -> action summary
    GET  /status          - API/backend health + model config
    GET  /status/{job_id} - job progress for an audio consultation
"""

import os

from fastapi import APIRouter, HTTPException, UploadFile, File

from app.jobs.job_manager import job_manager
from app.models.schemas import (
    TranscriptRequest,
    ExtractionRequest,
    SoapNoteResponse,
    ActionSummary,
    ConsultationUploadResponse,
    JobStatusResponse,
    ApiStatusResponse,
)
from app.storage import save_upload, cleanup

router = APIRouter(tags=["pipeline"])


@router.post("/consultations", response_model=ConsultationUploadResponse)
async def create_consultation(file: UploadFile = File(...)):
    """Upload an audio file and start the full A -> B pipeline in the
    background. Poll ``GET /status/{job_id}`` for progress."""
    try:
        data = await file.read()
        audio_path = save_upload(file.filename or "upload.wav", data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Upload failed: {exc}")

    job_id, _ = job_manager.create_job()

    from app.services import pipeline_service

    def worker(report):
        return pipeline_service.run_pipeline(audio_path, on_progress=report)

    job_manager.run_async(job_id, worker)
    return {"job_id": job_id, "status": "queued"}


@router.post("/transcript", response_model=dict)
def transcript_endpoint(req: TranscriptRequest):
    """Transcript text -> structured clinical extraction (Person B)."""
    from app.services.pipeline_service import process_transcript

    try:
        result = process_transcript(req.transcript, model=req.model)
        return result["extraction"]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Extraction failed: {exc}")


@router.post("/soap-note", response_model=SoapNoteResponse)
def soap_note_endpoint(req: ExtractionRequest):
    """Extraction -> SOAP note (Person B)."""
    from app.pipeline.soap_generator import generate_soap

    try:
        note = generate_soap(req.extraction, model=req.model or "8b")
        return {"soap_note": note}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"SOAP failed: {exc}")


@router.post("/action-summary", response_model=ActionSummary)
def action_summary_endpoint(req: ExtractionRequest):
    """Extraction -> action summary (Person B)."""
    from app.pipeline.action_summary import generate_actions

    try:
        return generate_actions(req.extraction, model=req.model or "8b")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Actions failed: {exc}")


@router.get("/status", response_model=ApiStatusResponse)
def api_status():
    from app.models.llm_client import BACKEND

    return {
        "status": "ok",
        "llm_backend": BACKEND,
        "whisper_model": os.environ.get("WHISPER_MODEL", "small"),
        "diarization_model": os.environ.get(
            "DIARIZATION_MODEL", "pyannote/speaker-diarization-3.1"
        ),
    }


@router.get("/status/{job_id}", response_model=JobStatusResponse)
def job_status(job_id: str):
    job = job_manager.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(**job)