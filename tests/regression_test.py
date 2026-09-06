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

    def test_diarization_failure_degrades_gracefully(self):
        """A missing/expired HF token or diarization API error must NOT
        abort the job mid-transcription (the old 'stuck at 15%' failure)."""
        import tempfile
        from unittest import mock

        from app.pipeline import merge

        fake_audio = os.path.join(tempfile.gettempdir(), "ambient-dummy.wav")
        with open(fake_audio, "wb") as f:
            f.write(b"RIFF" + b"\x00" * 256)

        whisper = [
            {"start": 0.0, "end": 3.0, "text": "bukhaar hai"},
            {"start": 3.0, "end": 6.0, "text": "koi dawai li?"},
        ]

        with mock.patch.object(
            merge,
            "diarize_audio",
            side_effect=RuntimeError("HF_TOKEN missing!"),
        ):
            try:
                result = merge.process_audio(
                    fake_audio, _whisper_segments=whisper
                )
            finally:
                os.remove(fake_audio)

        self.assertEqual(len(result), 1)
        self.assertTrue(all(s["speaker"] == "UNKNOWN" for s in result))
        self.assertIn("bukhaar hai", result[0]["text"])
        self.assertIn("koi dawai li?", result[0]["text"])


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
        if os.environ.get("GROQ_API_KEY"):
            self.skipTest("GROQ_API_KEY configured; the loud-failure path cannot be exercised")
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
            "/consultations",
            files={"file": ("sample.wav", data, "audio/wav")},
            data={"patient_id": "patient-1", "appointment_id": "appt-1"},
        )
        self.assertEqual(r.status_code, 200)
        body = r.json()
        job_id = body["job_id"]
        self.assertEqual(body["patient_id"], "patient-1")
        self.assertEqual(body["appointment_id"], "appt-1")

        for _ in range(300):  # up to ~5 min
            job = self.client.get(f"/status/{job_id}").json()
            if job["status"] in ("completed", "failed"):
                break
            time.sleep(1)
        self.assertIn(job["status"], ("completed", "failed"))
        self.assertEqual(job["patient_id"], "patient-1")

    def test_upload_requires_patient_id(self):
        """Voice submissions MUST be bound to a patient (no leaks)."""
        upload = {
            "files": {"file": ("tiny.wav", b"\x00" * 512, "audio/wav")},
            "data": {"language": "hi"},
        }
        r = self.client.post("/consultations", **upload)
        self.assertEqual(r.status_code, 400)
        self.assertIn("patient_id", str(r.json().get("detail", "")))


# ----------------------------------------------------------------------
# React frontend -> API contract
# ----------------------------------------------------------------------

RESULT_FIXTURE = {
    "transcript": [
        {"speaker": "SPEAKER_00", "start": 0.0, "end": 2.0, "text": "bukhaar hai"},
        {"speaker": "SPEAKER_01", "start": 2.0, "end": 4.0, "text": "koi dawai li?"},
    ],
    "extraction": EXTRACTION_FIXTURE,
    "soap_note": SOAP_FIXTURE,
    "actions": ACTIONS_FIXTURE,
}


def _make_completed_job():
    from app.jobs.job_manager import job_manager

    job_id, _ = job_manager.create_job()
    job_manager.update(
        job_id, status="completed", progress=100, step="Complete", result=RESULT_FIXTURE
    )
    return job_id


class TestReactContract(unittest.TestCase):
    def setUp(self):
        from fastapi.testclient import TestClient
        from app.main import app

        self.client = TestClient(app)

    def test_unknown_job_404_on_all_react_routes(self):
        for path in (
            "/consultations/does-not-exist",
            "/transcript/does-not-exist",
            "/soap-note/does-not-exist",
            "/action-summary/does-not-exist",
        ):
            r = self.client.get(path)
            self.assertEqual(r.status_code, 404, path)

    def test_partial_routes_409_until_completed(self):
        from app.jobs.job_manager import job_manager

        job_id, _ = job_manager.create_job()  # stays queued
        r = self.client.get(f"/consultations/{job_id}")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["status"], "queued")

        for path in (
            f"/transcript/{job_id}",
            f"/soap-note/{job_id}",
            f"/action-summary/{job_id}",
        ):
            r = self.client.get(path)
            self.assertEqual(r.status_code, 409, path)
            self.assertIn("queued", str(r.json()["detail"]))

    def test_completed_job_exposes_all_results(self):
        job_id = _make_completed_job()

        r = self.client.get(f"/consultations/{job_id}")
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertEqual(body["status"], "completed")
        self.assertEqual(len(body["result"]["transcript"]), 2)
        self.assertEqual(body["result"]["soap_note"], SOAP_FIXTURE)

        r = self.client.get(f"/transcript/{job_id}")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["segments"][0]["speaker"], "SPEAKER_00")

        r = self.client.get(f"/soap-note/{job_id}")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["soap_note"], SOAP_FIXTURE)

        r = self.client.get(f"/action-summary/{job_id}")
        self.assertEqual(r.status_code, 200)
        self.assertIn(
            "Paracetamol 650mg TDS for 2 days", r.json()["actions"]["medication_actions"]
        )

    def test_cors_headers_present(self):
        r = self.client.get("/status", headers={"Origin": "http://localhost:5173"})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.headers.get("access-control-allow-origin"), "http://localhost:5173")

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


class TestPatientIsolation(unittest.TestCase):
    """Patient scoping / voice-message isolation across API endpoints."""

    def setUp(self):
        from fastapi.testclient import TestClient
        from app.main import app

        self.client = TestClient(app)

    def _make_completed_job(self, patient_id, appointment_id=None):
        from app.jobs.job_manager import job_manager

        job_id, _ = job_manager.create_job(
            patient_id=patient_id, appointment_id=appointment_id
        )
        job_manager.update(
            job_id,
            status="completed",
            progress=100,
            step="Complete",
            result=RESULT_FIXTURE,
        )
        return job_id

    def test_job_bound_to_patient_id(self):
        job_id = self._make_completed_job("patient-42", "appt-42")
        r = self.client.get(f"/consultations/{job_id}")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["patient_id"], "patient-42")
        self.assertEqual(r.json()["appointment_id"], "appt-42")

    def test_cross_patient_access_is_blocked(self):
        job_id = self._make_completed_job("patient-42")
        for path in (
            f"/consultations/{job_id}",
            f"/transcript/{job_id}",
            f"/soap-note/{job_id}",
            f"/action-summary/{job_id}",
        ):
            r = self.client.get(path, params={"patient_id": "patient-OTHER"})
            self.assertEqual(r.status_code, 404, path)

        # The owning patient can fetch everything.
        r = self.client.get(f"/soap-note/{job_id}", params={"patient_id": "patient-42"})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["soap_note"], SOAP_FIXTURE)

    def test_patient_reports_endpoint_is_scoped(self):
        self._make_completed_job("patient-7", "appt-7")

        mine = self.client.get("/patients/patient-7/consultations")
        self.assertEqual(mine.status_code, 200)
        reports = mine.json()["reports"]
        self.assertTrue(any(r["job_id"] for r in reports))
        self.assertTrue(all(r["patient_id"] == "patient-7" for r in reports))
        self.assertEqual(reports[0]["soap_note"], SOAP_FIXTURE)

        # A different patient never sees patient-7's reports.
        other = self.client.get("/patients/patient-8/consultations")
        self.assertEqual(other.status_code, 200)
        self.assertEqual(other.json()["reports"], [])

    def test_upload_without_patient_id_rejected(self):
        r = self.client.post(
            "/consultations",
            files={"file": ("a.wav", b"\x00" * 1024, "audio/wav")},
        )
        self.assertEqual(r.status_code, 400)


if __name__ == "__main__":
    unittest.main(verbosity=2)