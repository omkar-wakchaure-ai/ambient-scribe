"""
app/pipeline/action_summary.py
---------------------------------
generate_actions(extraction) -> dict
"""

import json

from models.llm_client import call_llm, safe_json_parse
from models.schemas import ExtractionResult, ActionSummary
from pipeline.prompts import ACTIONS_SYSTEM_PROMPT, ACTIONS_USER_PROMPT_TEMPLATE


def generate_actions(extraction, model: str = "8b") -> dict:
    """extraction: dict or ExtractionResult -> actionable checklist JSON."""
    validated = extraction if isinstance(extraction, ExtractionResult) else ExtractionResult(**extraction)

    user_prompt = ACTIONS_USER_PROMPT_TEMPLATE.format(
        extraction_json=json.dumps(validated.model_dump(), ensure_ascii=False, indent=2)
    )
    raw = call_llm(
        system_prompt=ACTIONS_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        model=model,
        temperature=0.1,
        json_mode=True,
    )
    data = safe_json_parse(raw)
    validated_actions = ActionSummary(**data)
    return validated_actions.model_dump()
