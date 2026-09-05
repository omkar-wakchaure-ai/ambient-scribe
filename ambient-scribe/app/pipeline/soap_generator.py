"""
app/pipeline/soap_generator.py
--------------------------------
generate_soap(extraction) -> str
"""

import json

from models.llm_client import call_llm
from models.schemas import ExtractionResult
from pipeline.prompts import SOAP_SYSTEM_PROMPT, SOAP_USER_PROMPT_TEMPLATE


def generate_soap(extraction, model: str = "8b") -> str:
    """extraction: dict or ExtractionResult -> SOAP note plain text."""
    validated = extraction if isinstance(extraction, ExtractionResult) else ExtractionResult(**extraction)

    user_prompt = SOAP_USER_PROMPT_TEMPLATE.format(
        extraction_json=json.dumps(validated.model_dump(), ensure_ascii=False, indent=2)
    )
    soap_text = call_llm(
        system_prompt=SOAP_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        model=model,
        temperature=0.2,
        json_mode=False,
    )
    return soap_text.strip()
