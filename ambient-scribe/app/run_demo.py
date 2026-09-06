"""
app/run_demo.py
---------------
End-to-end demo of the clinical intelligence pipeline (Person B):
transcript -> clinical extraction -> SOAP note -> action summary.

The output clearly shows four sections:
    TRANSCRIPT
    EXTRACTED CLINICAL DATA
    SOAP NOTE
    ACTION ITEMS / ACTION SUMMARY

Run from the `app` directory:
    python run_demo.py              # improved demo consultation (default)
    python run_demo.py --minimal    # anti-hallucination check (no actions)
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from demo_consultations import DEMO_CONSULTATION, SHORT_CONSULTATION  # noqa: E402
from pipeline.extraction import extract_clinical_info  # noqa: E402
from pipeline.soap_generator import generate_soap  # noqa: E402
from pipeline.action_summary import generate_actions  # noqa: E402


def pretty(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2)


def main() -> int:
    minimal = "--minimal" in sys.argv[1:]
    transcript = SHORT_CONSULTATION if minimal else DEMO_CONSULTATION

    print("=" * 72)
    print("AMBIENT AI CLINICAL SCRIBE — DEMO")
    if minimal:
        print("MODE: anti-hallucination check (no explicit doctor actions)")
    print("=" * 72)

    print("\n--- TRANSCRIPT ---")
    print(transcript)

    print("\n--- EXTRACTED CLINICAL DATA ---")
    extraction = extract_clinical_info(transcript)
    print(pretty(extraction))

    print("\n--- SOAP NOTE ---")
    print(generate_soap(extraction))

    print("\n--- ACTION ITEMS / ACTION SUMMARY ---")
    print(pretty(generate_actions(extraction)))

    print("\n" + "=" * 72)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())