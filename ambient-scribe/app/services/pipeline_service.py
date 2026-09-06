"""Orchestration service wiring the audio pipeline (Person A) and the
clinical intelligence pipeline (Person B) into one end-to-end flow.

    audio file
        -> process_audio()          (Person A)
        -> extract_clinical_info()  (Person B)
        -> generate_soap()          (Person B)
        -> generate_actions()       (Person B)

The Person C API/frontend layer talks only to this module, never directly
to the pipeline internals.
"""

from typing import Callable, Optional

from app.models.schemas import ConsultationResult
from app.pipeline.merge import process_audio


def transcript_to_text(segments) -> str:
    """Flatten speaker-tagged transcript segments (Person A output) into
    the plain-text form Person B's extract_clinical_info() expects."""
    if isinstance(segments, str):
        return segments
    lines = []
    for seg in segments:
        speaker = seg.get("speaker", "UNKNOWN")
        text = seg.get("text", "").strip()
        start = seg.get("start")
        end = seg.get("end")
        if not text:
            continue
        if start is not None and end is not None:
            lines.append(f"[{float(start):.2f}-{float(end):.2f}] {speaker}: {text}")
        else:
            lines.append(f"{speaker}: {text}")
    return "\n".join(lines)


def process_transcript(
    transcript_text: str,
    model: Optional[str] = None,
) -> dict:
    """B's clinical pipeline on an existing transcript string."""
    from app.pipeline.extraction import extract_clinical_info
    from app.pipeline.soap_generator import generate_soap
    from app.pipeline.action_summary import generate_actions

    extraction = extract_clinical_info(transcript_text, model=model or "70b")
    soap_note = generate_soap(extraction, model=model or "8b")
    actions = generate_actions(extraction, model=model or "8b")
    return {
        "transcript": [],
        "extraction": extraction,
        "soap_note": soap_note,
        "actions": actions,
    }


def run_pipeline(
    audio_file: str,
    language: Optional[str] = None,
    on_progress: Optional[Callable[[str, int], None]] = None,
) -> dict:
    """Full A -> B pipeline on an audio file.

    Args:
        audio_file: Path to the uploaded/saved audio file.
        language: Optional ISO code for Whisper (defaults to auto-detect).
        on_progress: Optional callback ``fn(step_label, percent)``.

    Returns:
        dict matching app.models.schemas.ConsultationResult:
            transcript: List[{speaker, start, end, text}]
            extraction: dict (ExtractionResult)
            soap_note: str
            actions: dict (ActionSummary)
    """
    def report(step: str, percent: int):
        if on_progress is not None:
            on_progress(step, percent)

    report("Transcribing audio", 15)
    transcript = process_audio(audio_file, language=language)

    report("Running speaker diarization", 35)
    # Diarization runs inside process_audio(); mark the stage after.

    report("Extracting clinical info", 55)
    transcript_text = transcript_to_text(transcript)
    from app.pipeline.extraction import extract_clinical_info
    extraction = extract_clinical_info(transcript_text)

    report("Generating SOAP note", 75)
    from app.pipeline.soap_generator import generate_soap
    soap_note = generate_soap(extraction)

    report("Generating action summary", 90)
    from app.pipeline.action_summary import generate_actions
    actions = generate_actions(extraction)

    report("Complete", 100)
    return {
        "transcript": transcript,
        "extraction": extraction,
        "soap_note": soap_note,
        "actions": actions,
    }