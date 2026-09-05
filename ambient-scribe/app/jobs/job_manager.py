"""In-memory job registry for background consultation processing.

Each audio upload creates a job; a background daemon thread runs the full
A -> B pipeline and updates status/progress so the Streamlit UI can poll
``GET /status/{job_id}`` for progress.

Thread-safe, no persistence. Jobs are kept in memory for the lifetime of
the API process.
"""

import threading
import time
import uuid
from typing import Callable, Optional


class JobManager:
    def __init__(self):
        self._jobs = {}
        self._lock = threading.Lock()

    def create_job(self) -> tuple[str, dict]:
        job_id = uuid.uuid4().hex[:12]
        job = {
            "job_id": job_id,
            "status": "queued",
            "progress": 0,
            "step": "Queued",
            "result": None,
            "error": None,
            "created_at": time.time(),
            "updated_at": time.time(),
        }
        with self._lock:
            self._jobs[job_id] = job
        return job_id, job

    def update(
        self,
        job_id: str,
        status: Optional[str] = None,
        progress: Optional[int] = None,
        step: Optional[str] = None,
        result: Optional[dict] = None,
        error: Optional[str] = None,
    ):
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return
            if status is not None:
                job["status"] = status
            if progress is not None:
                job["progress"] = max(0, min(100, int(progress)))
            if step is not None:
                job["step"] = step
            if result is not None:
                job["result"] = result
            if error is not None:
                job["error"] = error
            job["updated_at"] = time.time()

    def get(self, job_id: str) -> Optional[dict]:
        with self._lock:
            job = self._jobs.get(job_id)
            return dict(job) if job is not None else None

    def _runner(self, job_id: str, fn: Callable[[Callable[[str, int], None]], dict]):
        def report(step: str, percent: int):
            self.update(job_id, status="running", progress=percent, step=step)
        try:
            self.update(job_id, status="running", progress=1, step="Starting")
            result = fn(report)
            self.update(
                job_id,
                status="completed",
                progress=100,
                step="Complete",
                result=result,
            )
        except Exception as exc:  # never swallow job errors silently
            self.update(
                job_id,
                status="failed",
                error=f"{type(exc).__name__}: {exc}",
            )

    def run_async(self, job_id: str, fn: Callable[[Callable[[str, int], None]], dict]):
        """Run ``fn(report)`` on a daemon thread; ``report(step, percent)``
        is the progress callback the runner hands to the pipeline."""
        thread = threading.Thread(
            target=self._runner, args=(job_id, fn), daemon=True
        )
        thread.start()


job_manager = JobManager()