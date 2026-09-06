"""Standalone speaker diarization test for the real Hinglish sample.

Run from the project root:

    python app\\pipeline\\diarization_test.py
"""

import os
import sys
from pathlib import Path

import av
import numpy as np
import torch
from dotenv import load_dotenv
from pyannote.audio import Pipeline

AUDIO_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "sample_data",
    "sample_consultation.wav",
)

RESAMPLE_RATE = 16000


def load_audio(path, sample_rate=RESAMPLE_RATE):
    container = av.open(path)
    stream = next(s for s in container.streams if s.type == "audio")

    resampler = av.AudioResampler(
        format="fltp", layout="mono", rate=sample_rate
    )
    frames = []
    for frame in container.decode(stream):
        for resampled in resampler.resample(frame):
            frames.append(resampled.to_ndarray())

    audio = np.concatenate(frames, axis=1)

    if audio.ndim == 1:
        audio = audio[np.newaxis, :]

    waveform = torch.from_numpy(audio).float()
    return waveform, sample_rate


def get_annotation(result):
    if hasattr(result, "speaker_diarization"):
        return result.speaker_diarization
    return result


def main():
    if not os.path.exists(AUDIO_FILE):
        print(f"ERROR: Sample audio not found at {AUDIO_FILE}")
        return 1

    print("Loading diarization model...")

    project_root = Path(__file__).resolve().parents[2]
    load_dotenv(project_root / ".env", override=False)
    token = (
        os.environ.get("HF_TOKEN")
        or os.environ.get("HUGGINGFACE_TOKEN")
        or os.environ.get("HUGGINGFACEHUB_API_TOKEN")
    )
    if not token:
        print(
            "ERROR: Set HF_TOKEN or HUGGINGFACE_TOKEN in the project-root .env file."
        )
        return 1

    try:
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1", token=token
        )
    except TypeError as error:
        if "token" not in str(error):
            raise
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1", use_auth_token=token
        )

    print("Loading audio...")

    waveform, sample_rate = load_audio(AUDIO_FILE)

    print("Running speaker diarization...")

    result = pipeline(
        {"waveform": waveform, "sample_rate": sample_rate}
    )
    annotation = get_annotation(result)

    turns = [
        (turn, speaker)
        for turn, _, speaker in annotation.itertracks(yield_label=True)
    ]

    print("\n--- SPEAKERS ---\n")

    for turn, speaker in turns:
        print(
            f"[{turn.start:.2f}s -> {turn.end:.2f}s] "
            f"{speaker}"
        )

    unique_speakers = sorted({s for _, s in turns})

    print(f"\nTotal speaker segments: {len(turns)}")
    print(f"Unique speakers: {len(unique_speakers)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())