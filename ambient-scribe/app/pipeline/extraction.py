"""
app/pipeline/extraction.py
----------------------------
extract_clinical_info(transcript) -> dict, validated against
models.schemas.ExtractionResult.
"""

from models.llm_client import call_llm, safe_json_parse
from models.schemas import ExtractionResult
from pipeline.prompts import EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT_TEMPLATE


def extract_clinical_info(transcript: str, model: str = "70b") -> dict:
    """
    Transcript (raw, possibly Hinglish) -> structured clinical JSON.

    ASSUMPTION: `transcript` is a single plain-text string by the time
    it reaches here (diarization.py / merge.py already combined speaker
    turns into one text blob, e.g. "Doctor: ... \n Patient: ..." lines).
    If merge.py hands over a list of {speaker, text} turns instead,
    flatten it before calling this:
        transcript = "\n".join(f"{t['speaker']}: {t['text']}" for t in turns)
    """
    if not transcript or not transcript.strip():
        raise ValueError("transcript is empty")

    user_prompt = EXTRACTION_USER_PROMPT_TEMPLATE.format(transcript=transcript.strip())
    raw = call_llm(
        system_prompt=EXTRACTION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        model=model,
        temperature=0.0,
        json_mode=True,
    )
    data = safe_json_parse(raw)
    validated = ExtractionResult(**data)
    return validated.model_dump()
