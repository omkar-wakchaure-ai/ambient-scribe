"""Person C API routes.

Replaces the mocked A/B responses with the real integrations exposed by
``app.services.pipeline_service`` and ``app.jobs.job_manager``.

Routes:
    POST /consultations          - upload audio -> background job (full pipeline)
    POST /transcript             - transcript text -> clinical extraction
    POST /soap-note              - extraction -> SOAP note
    POST /action-summary         - extraction -> action summary
    GET  /status                 - API/backend health + model config
    GET  /status/{job_id}        - job progress for an audio consultation
    GET  /consultations/{job_id} - full job status (React primary poll target)
    GET  /transcript/{job_id}    - speaker-labelled transcript (completed job)
    GET  /soap-note/{job_id}     - SOAP note (completed job)
    GET  /action-summary/{job_id} - action summary (completed job)
"""

import os

from fastapi import APIRouter, HTTPException, UploadFile, File, Form

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

# Audio file upload guardrails (configurable through environment variables).
ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".webm", ".aac"}
MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_BYTES", str(50 * 1024 * 1024)))


def _validate_audio_upload(filename: str, size: int) -> None:
    if not filename:
        raise HTTPException(status_code=400, detail="Uploaded file has no name.")
    ext = os.path.splitext(filename or "")[1].lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{ext or 'unknown'}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_AUDIO_EXTENSIONS))}."
            ),
        )
    if size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File is {size / (1024 * 1024):.1f} MB, above the "
                f"{MAX_UPLOAD_BYTES / (1024 * 1024):.0f} MB upload limit."
            ),
        )


@router.post("/consultations", response_model=ConsultationUploadResponse)
async def create_consultation(
    file: UploadFile = File(...),
    language: str = Form(default=None),
):
    """Upload an audio file and start the full A -> B pipeline in the
    background. Poll ``GET /status/{job_id}`` for progress."""
    try:
        data = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Upload failed: {exc}")

    _validate_audio_upload(file.filename or "upload.wav", len(data))

    try:
        audio_path = save_upload(file.filename or "upload.wav", data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Upload failed: {exc}")

    job_id, _ = job_manager.create_job()

    from app.services import pipeline_service

    def worker(report):
        return pipeline_service.run_pipeline(
            audio_path, language=language or None, on_progress=report
        )

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


# ----------------------------------------------------------------------
# Job-derived result accessors (React frontend contract).
# ----------------------------------------------------------------------

def _get_job(job_id: str) -> dict:
    job = job_manager.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


def _require_completed(job: dict) -> dict:
    if job["status"] != "completed":
        raise HTTPException(
            status_code=409,
            detail=f"Job is {job['status']}",  # not completed yet
        )
    return job.get("result") or {}


@router.get("/consultations/{job_id}", response_model=JobStatusResponse)
def consultation_status(job_id: str):
    """Full job status for one audio consultation (alias of /status/{id})."""
    return JobStatusResponse(**_get_job(job_id))


@router.get("/transcript/{job_id}")
def job_transcript(job_id: str):
    """Speaker-labelled transcript for a completed consultation."""
    result = _require_completed(_get_job(job_id))
    return {"job_id": job_id, "segments": result.get("transcript", [])}


@router.get("/soap-note/{job_id}")
def job_soap_note(job_id: str):
    """SOAP note for a completed consultation."""
    result = _require_completed(_get_job(job_id))
    return {"job_id": job_id, "soap_note": result.get("soap_note", "")}


@router.get("/action-summary/{job_id}")
def job_action_summary(job_id: str):
    """Action summary for a completed consultation."""
    result = _require_completed(_get_job(job_id))
    return {"job_id": job_id, "actions": result.get("actions", {})}