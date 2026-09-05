"""
app/main.py
------------
FastAPI application entry point for the clinical intelligence (Person B)
pipeline. Run from the `app` directory with `python -m uvicorn main:app`.
"""

from fastapi import FastAPI

from routers.consultations import router as consultations_router

app = FastAPI()

app.include_router(consultations_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
