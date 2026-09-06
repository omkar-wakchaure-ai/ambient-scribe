"""Ambient Scribe - Streamlit dashboard.

Run from the project root:
    streamlit run app/streamlit_app.py

The dashboard talks to the FastAPI service (``app.main``). The API base URL
is taken from ``AMBIENT_API_URL`` (default http://localhost:8000).

Tabs:
    1. Transcript - speaker, timestamp, text
    2. SOAP Note  - Subjective / Objective / Assessment / Plan
    3. Actions    - actionable items from the consultation
"""

import os
import time

import requests
import streamlit as st

_DEFAULT_PORTS = (8000, 8001, 8501)


def api_health(base_url: str) -> bool:
    try:
        r = requests.get(f"{base_url}/status", timeout=5)
        return r.ok
    except requests.RequestException:
        return False


def find_api_url() -> str:
    """Return the reachable API base URL.

    Uses an explicit ``AMBIENT_API_URL`` if set; otherwise probes the
    common local ports so the dashboard works regardless of whether the
    API was started on 8000 or 8001.
    """
    manual = os.environ.get("AMBIENT_API_URL")
    if manual:
        base = manual.rstrip("/")
        if api_health(base):
            return base
        return base  # let the caller surface the health error

    for port in _DEFAULT_PORTS:
        base = f"http://localhost:{port}"
        if api_health(base):
            return base
    return f"http://localhost:{_DEFAULT_PORTS[0]}"


API_URL = find_api_url()


def poll_job(job_id: str, progress_bar):
    while True:
        r = requests.get(f"{API_URL}/status/{job_id}", timeout=30)
        r.raise_for_status()
        job = r.json()
        progress_bar.progress(
            job["progress"] / 100.0, text=f"{job['step']} ({job['progress']}%)"
        )
        if job["status"] in ("completed", "failed"):
            return job
        time.sleep(1.5)


def render_transcript(result):
    transcript = result.get("transcript") or []
    if not transcript:
        st.info("No speaker-tagged transcript produced.")
        return
    st.markdown("| # | From | To | Speaker | Text |")
    st.markdown("|---|------|----|---------|------|")
    for i, seg in enumerate(transcript, start=1):
        st.markdown(
            f"| {i} | {float(seg['start']):.2f}s | {float(seg['end']):.2f}s "
            f"| {seg['speaker']} | {seg['text']} |"
        )


def render_soap(result):
    soap = (result.get("soap_note") or "").strip()
    if not soap:
        st.info("No SOAP note produced.")
        return
    st.markdown(soap)


def render_actions(result):
    actions = result.get("actions") or {}
    sections = [
        ("Medications", actions.get("medication_actions") or []),
        ("Investigations", actions.get("investigation_actions") or []),
        ("Referrals", actions.get("referral_actions") or []),
        ("Patient Instructions", actions.get("patient_instructions") or []),
        ("Flags for Review", actions.get("flags_for_review") or []),
    ]
    st.subheader("Actionable Items")
    shown_any = False
    for label, items in sections:
        if items:
            shown_any = True
            st.markdown(f"**{label}**")
            for item in items:
                st.markdown(f"- {item}")
    follow_up = actions.get("follow_up") or {}
    if follow_up.get("required"):
        shown_any = True
        st.markdown(
            f"**Follow-up**: {follow_up.get('timeframe') or 'as advised'} "
            f"- {follow_up.get('reason') or ''}"
        )
    if not shown_any:
        st.info("No actionable items were generated.")


def main():
    st.set_page_config(page_title="Ambient Scribe", layout="wide")
    st.title("Ambient Scribe")
    st.caption("Consultation transcription, diarization and clinical intelligence")

    if not api_health(API_URL):
        st.error(
            f"API not reachable at {API_URL}. Start it with "
            "`uvicorn app.main:app --reload` (ports 8000 or 8001 are "
            "auto-detected) and try again."
        )
        return

    st.write(f"API: {API_URL}")

    uploaded = st.file_uploader(
        "Upload a consultation recording",
        type=["wav", "mp3", "flac", "m4a"],
    )

    if uploaded is None:
        st.info("Upload an audio file to start.")
        return

    if st.button("Transcribe & analyze", type="primary"):
        with st.spinner("Uploading audio..."):
            files = {"file": (uploaded.name, uploaded.getvalue(), uploaded.type)}
            r = requests.post(f"{API_URL}/consultations", files=files, timeout=60)
            r.raise_for_status()
            job_id = r.json()["job_id"]

        st.write(f"Job: `{job_id}`")
        progress_bar = st.progress(0, text="Queued...")

        job = poll_job(job_id, progress_bar)

        if job["status"] == "failed":
            st.error(f"Pipeline failed: {job.get('error')}")
            return

        result = job.get("result") or {}
        st.success("Consultation processed.")

        tab_transcript, tab_soap, tab_actions = st.tabs(
            ["Transcript", "SOAP Note", "Actions"]
        )
        with tab_transcript:
            render_transcript(result)
        with tab_soap:
            render_soap(result)
        with tab_actions:
            render_actions(result)


if __name__ == "__main__":
    main()