"""
app/models/schemas.py
----------------------
Pydantic schemas shared by the clinical intelligence pipeline
(extraction -> SOAP -> actions) and the /consultations router.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------
# Extraction schema
# ---------------------------------------------------------------

class Symptom(BaseModel):
    name: str
    duration: Optional[str] = None
    severity: Optional[str] = None
    notes: Optional[str] = None


class Medication(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    status: str = Field(
        default="mentioned_only",
        description="currently_taking | newly_prescribed | discontinued | mentioned_only",
    )


class History(BaseModel):
    past_medical_history: List[str] = Field(default_factory=list)
    family_history: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    social_history: List[str] = Field(default_factory=list)


class Investigation(BaseModel):
    name: str
    status: str = Field(description="ordered | results_reviewed | recommended")
    result: Optional[str] = None


class ExtractionResult(BaseModel):
    chief_complaint: str = ""
    symptoms: List[Symptom] = Field(default_factory=list)
    medications: List[Medication] = Field(default_factory=list)
    history: History = Field(default_factory=History)
    investigations: List[Investigation] = Field(default_factory=list)
    objective_findings: List[str] = Field(
        default_factory=list,
        description="explicitly stated vitals/measurements, e.g. 'Temperature approximately 101°F'; empty if none were stated",
    )
    assessment: str = ""
    plan: List[str] = Field(default_factory=list)
    extraction_confidence: str = Field(default="low", description="high | medium | low")
    unclear_segments: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------
# SOAP schema
# ---------------------------------------------------------------

class SoapNoteResponse(BaseModel):
    soap_note: str


# ---------------------------------------------------------------
# Action summary schema
# ---------------------------------------------------------------

class FollowUp(BaseModel):
    required: bool = False
    timeframe: Optional[str] = None
    reason: Optional[str] = None


class ActionSummary(BaseModel):
    medication_actions: List[str] = Field(default_factory=list)
    investigation_actions: List[str] = Field(default_factory=list)
    referral_actions: List[str] = Field(default_factory=list)
    follow_up: FollowUp = Field(default_factory=FollowUp)
    patient_instructions: List[str] = Field(default_factory=list)
    flags_for_review: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------
# API request/response schemas (used by routers/consultations.py)
# ---------------------------------------------------------------

class TranscriptRequest(BaseModel):
    transcript: str = Field(..., min_length=1)
    model: Optional[str] = Field(default=None, description="'70b' or '8b' override")


class ExtractionRequest(BaseModel):
    extraction: ExtractionResult
    model: Optional[str] = Field(default=None, description="'70b' or '8b' override")


class ProcessResponse(BaseModel):
    extraction: ExtractionResult
    soap_note: str
    actions: ActionSummary


# ---------------------------------------------------------------
# API schemas (used by routers/api.py - Person C integration)
# ---------------------------------------------------------------

class TranscriptSegment(BaseModel):
    speaker: str
    start: float
    end: float
    text: str


class JobStatusEnum(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ConsultationResult(BaseModel):
    transcript: List[TranscriptSegment]
    extraction: ExtractionResult
    soap_note: str
    actions: ActionSummary


class ConsultationUploadResponse(BaseModel):
    job_id: str
    status: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: int = 0
    step: str = ""
    result: Optional[ConsultationResult] = None
    error: Optional[str] = None


class ApiStatusResponse(BaseModel):
    status: str
    llm_backend: str
    whisper_model: str
    diarization_model: str
