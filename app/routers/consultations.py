"""
app/routers/consultations.py
-------------------------------
FastAPI endpoints for the clinical intelligence pipeline:
transcript -> extraction -> SOAP note + action summary.
"""

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    TranscriptRequest,
    ExtractionRequest,
    ExtractionResult,
    SoapNoteResponse,
    ActionSummary,
    ProcessResponse,
)
from app.pipeline.extraction import extract_clinical_info
from app.pipeline.soap_generator import generate_soap
from app.pipeline.action_summary import generate_actions

router = APIRouter(prefix="/consultations", tags=["consultations"])


@router.post("/extract", response_model=ExtractionResult)
def extract_endpoint(req: TranscriptRequest):
    try:
        return extract_clinical_info(req.transcript, model=req.model or "70b")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM extraction failed: {e}")


@router.post("/soap", response_model=SoapNoteResponse)
def soap_endpoint(req: ExtractionRequest):
    try:
        note = generate_soap(req.extraction, model=req.model or "8b")
        return {"soap_note": note}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"SOAP generation failed: {e}")


@router.post("/actions", response_model=ActionSummary)
def actions_endpoint(req: ExtractionRequest):
    try:
        return generate_actions(req.extraction, model=req.model or "8b")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Action generation failed: {e}")


@router.post("/process", response_model=ProcessResponse)
def process_endpoint(req: TranscriptRequest):
    """Convenience endpoint: transcript in, everything out in one call."""
    try:
        extraction = extract_clinical_info(req.transcript, model=req.model or "70b")
        soap_note = generate_soap(extraction)
        actions = generate_actions(extraction)
        return {"extraction": extraction, "soap_note": soap_note, "actions": actions}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Pipeline failed: {e}")
