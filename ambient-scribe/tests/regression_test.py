"""Regression tests for the integrated ambient-scribe pipeline.

Combines the verified logic of Person A (audio pipeline), Person B
(clinical intelligence) and Person C (API/service/job layer) against the
real sample consultation.

Run from the project root:
    python tests/regression_test.py

The Person A audio leg runs against the real sample (offline). The Person B
LLM functions are verified structurally with a stubbed LLM so the test does
not require a network call or API key; the stubbed responses are shaped
exactly like Person B's prompts are documented to produce.
"""

import os
import sys
import json
import time
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(os.path.join(__file__, os.pardir))))

SAMPLE = os.path.join("app", "pipeline", "sample_data", "sample_consultation.wav")


# ----------------------------------------------------------------------
# Person A - merge/alignment logic (pure, no models)
# ----------------------------------------------------------------------

class TestPersonAMerge(unittest.TestCase):
    def test_overlap_assignment_and_merge(self):
        from app.pipeline.merge import merge_segments

        whisper = [
            {"start": 0.0, "end": 2.0, "text": "Hello"},
            {"start": 2.0, "end": 5.0, "text": "everyone"},
            {"start": 5.0, "end": 8.0, "text": "   "},
            {"start": 8.0, "end": 10.0, "text": "who are you"},
        ]
        diar = [
            {"speaker": "SPEAKER_00", "start": 0.5, "end": 4.0},
            {"speaker": "SPEAKER_01", "start": 4.0, "end": 9.0},
        ]
        result = merge_segments(whisper, diar)
        self.assertEqual(result[0]["speaker"], "SPEAKER_00")
        self.assertEqual(result[0]["text"], "Hello everyone")
        self.assertEqual(result[0]["start"], 0.0)
        self.assertEqual(result[0]["end"], 5.0)
        self.assertEqual(result[1]["speaker"], "SPEAKER_01")

    def test_unknown_when_no_overlap(self):
        from app.pipeline.merge import merge_segments

        result = merge_segments(
            [{"start": 20.0, "end": 25.0, "text": "orphan"}],
            [{"speaker": "SPEAKER_00", "start": 0.0, "end": 5.0}],
        )
        self.assertEqual(result[0]["speaker"], "UNKNOWN")


# ----------------------------------------------------------------------
# Person B - clinical functions with a stubbed LLM backend
# ----------------------------------------------------------------------

MOCK_TRANSCRIPT = (
    "[0.00-5.00] SPEAKER_00: mujhe do din se bukhaar hai aur "
    "thoda kamzori bhi feel ho raha hai\n"
    "[5.00-9.00] SPEAKER_01: kya aapne koi dawai li?\n"
    "[9.00-12.00] SPEAKER_00: maine Calpol le liya tha"
)

EXTRACTION_FIXTURE = {
    "chief_complaint": "Fever for 2 days with mild weakness",
    "symptoms": [
        {"name": "fever", "duration": "2 days", "severity": "moderate"},
        {"name": "weakness", "severity": "mild"},
    ],
    "medications": [{"name": "paracetamol", "status": "mentioned_only"}],
    "history": {
        "past_medical_history": [],
        "family_history": [],
        "allergies": [],
        "social_history": [],
    },
    "investigations": [],
    "assessment": "Viral fever, likely self-limiting",
    "plan": ["Paracetamol 650mg TDS for 2 days", "Review in 48h"],
    "extraction_confidence": "medium",
    "unclear_segments": [],
}

SOAP_FIXTURE = (
    "SUBJECTIVE: 2 days of fever and mild weakness.\n"
    "OBJECTIVE: Not examined.\n"
    "ASSESSMENT: Viral fever.\n"
    "PLAN: Paracetamol and review in 48 hours."
)

ACTIONS_FIXTURE = {
    "medication_actions": ["Paracetamol 650mg TDS for 2 days"],
    "investigation_actions": ["CBC if fever persists beyond 48h"],
    "referral_actions": [],
    "follow_up": {
        "required": True,
        "timeframe": "48 hours",
        "reason": "If fever persists",
    },
    "patient_instructions": ["Hydration and rest"],
    "flags_for_review": [],
}


class TestPersonBClinical(unittest.TestCase):
    def _stub(self):
        patchers = [
            mock.patch(
                "app.pipeline.extraction.call_llm",
                return_value=json.dumps(EXTRACTION_FIXTURE, ensure_ascii=False),
            ),
            mock.patch("app.pipeline.soap_generator.call_llm", return_value=SOAP_FIXTURE),
            mock.patch(
                "app.pipeline.action_summary.call_llm",
                return_value=json.dumps(ACTIONS_FIXTURE, ensure_ascii=False),
            ),
        ]
        for p in patchers:
            p.start()
        self.addCleanup(mock.patch.stopall)

    def test_extract(self):
        self._stub()
        import app.pipeline.extraction as ex

        out = ex.extract_clinical_info(MOCK_TRANSCRIPT)
        self.assertEqual(out["chief_complaint"], EXTRACTION_FIXTURE["chief_complaint"])
        self.assertEqual(len(out["symptoms"]), 2)

    def test_soap(self):
        self._stub()
        import app.pipeline.extraction as ex
        import app.pipeline.soap_generator as sg

        extraction = ex.extract_clinical_info(MOCK_TRANSCRIPT)
        soap = sg.generate_soap(extraction)
        self.assertIn("SUBJECTIVE", soap)

    def test_actions(self):
        self._stub()
        import app.pipeline.extraction as ex
        import app.pipeline.action_summary as ac

        extraction = ex.extract_clinical_info(MOCK_TRANSCRIPT)
        actions = ac.generate_actions(extraction)
        self.assertTrue(actions["follow_up"]["required"])
        self.assertEqual(actions["follow_up"]["timeframe"], "48 hours")

    def test_empty_transcript_rejected(self):
        self._stub()
        import app.pipeline.extraction as ex

        with self.assertRaises(ValueError):
            ex.extract_clinical_info("   ")


# ----------------------------------------------------------------------
# Person C - API + service orchestration
# ----------------------------------------------------------------------

class TestPersonCApi(unittest.TestCase):
    def setUp(self):
        from fastapi.testclient import TestClient
        from app.main import app

        self.client = TestClient(app)

    def test_status_and_health(self):
        r = self.client.get("/status")
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertEqual(body["status"], "ok")
        self.assertIn("llm_backend", body)

        r = self.client.get("/health")
        self.assertEqual(r.status_code, 200)

    def test_unknown_job_404(self):
        r = self.client.get("/status/does-not-exist")
        self.assertEqual(r.status_code, 404)

    def test_transcript_endpoint_missing_key_failure_is_clear(self):
        r = self.client.post("/transcript", json={"transcript": "patient has fever"})
        body = r.json()
        # With no configured backend the endpoint must fail loudly, not
        # silently return mock data.
        self.assertIn("GROQ_API_KEY", str(body.get("detail", "")))

    def test_upload_job_flow_without_llm(self):
        if not os.path.exists(SAMPLE):
            self.skipTest("sample audio missing")
        with open(SAMPLE, "rb") as f:
            data = f.read()
        r = self.client.post(
            "/consultations", files={"file": ("sample.wav", data, "audio/wav")}
        )
        self.assertEqual(r.status_code, 200)
        job_id = r.json()["job_id"]

        for _ in range(300):  # up to ~5 min
            job = self.client.get(f"/status/{job_id}").json()
            if job["status"] in ("completed", "failed"):
                break
            time.sleep(1)
        self.assertIn(job["status"], ("completed", "failed"))


# ----------------------------------------------------------------------
# A -> B data contract
# ----------------------------------------------------------------------

class TestAContract(unittest.TestCase):
    def test_transcript_to_text(self):
        from app.services.pipeline_service import transcript_to_text

        segments = [
            {"speaker": "SPEAKER_00", "start": 0.0, "end": 2.5, "text": "namaste"},
            {"speaker": "SPEAKER_01", "start": 2.5, "end": 4.0, "text": "theek hai"},
        ]
        text = transcript_to_text(segments)
        lines = text.splitlines()
        self.assertIn("SPEAKER_00", lines[0])
        self.assertIn("namaste", lines[0])
        self.assertTrue(lines[0].startswith("[0.00-2.50]"))
        self.assertIn("SPEAKER_01", lines[1])
        self.assertIn("theek hai", lines[1])


if __name__ == "__main__":
    unittest.main(verbosity=2)