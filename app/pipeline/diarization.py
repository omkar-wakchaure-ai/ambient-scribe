"""Speaker diarization using pyannote.audio.

Works with pyannote.audio >= 3.1. It adapts to whatever the pipeline returns:
pyannote 4.x returns a ``DiarizeOutput`` wrapper exposing ``.speaker_diarization``,
while some 3.x releases return a bare ``Annotation`` directly.
"""

import os

import av
import numpy as np
import torch
from pyannote.audio import Pipeline

from app.config import get_huggingface_token, load_env

RESAMPLE_RATE = 16000

_PIPELINE = None
_PIPELINE_NAME = os.environ.get(
    "DIARIZATION_MODEL", "pyannote/speaker-diarization-3.1"
)


def _get_huggingface_token():
    """Return the configured Hugging Face token or explain how to configure it."""
    load_env()
    token = get_huggingface_token()
    if not token:
        raise RuntimeError(
            "Hugging Face authentication is required for the diarization model. "
            "Set HF_TOKEN or HUGGINGFACE_TOKEN in the project-root .env file, "
            "then restart the FastAPI server."
        )
    return token


def load_audio(path, sample_rate=RESAMPLE_RATE):
    """Decode an audio file into a mono waveform torch.Tensor.

    Uses PyAV (FFmpeg) so it works with MP4/M4A containers regardless of the
    file extension, avoiding the broken system torchcodec decoder.

    Returns:
        A tuple of (waveform: torch.Tensor of shape (1, time), sample_rate).
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"Audio file does not exist: {path}")

    container = av.open(path)
    stream = next(
        (s for s in container.streams if s.type == "audio"), None
    )
    if stream is None:
        raise ValueError(
            f"Audio file contains no audio stream: {path}"
        )

    resampler = av.AudioResampler(
        format="fltp", layout="mono", rate=sample_rate
    )
    frames = []
    for frame in container.decode(stream):
        for resampled in resampler.resample(frame):
            frames.append(resampled.to_ndarray())

    if not frames:
        raise ValueError(f"Audio file contains no decodable audio: {path}")

    audio = np.concatenate(frames, axis=1)

    if audio.ndim == 1:
        audio = audio[np.newaxis, :]

    waveform = torch.from_numpy(audio).float()
    return waveform, sample_rate


def get_pipeline():
    """Return a lazily-loaded diarization pipeline (loaded once)."""
    global _PIPELINE
    if _PIPELINE is None:
        print("Loading diarization model...")
        token = _get_huggingface_token()
        try:
            _PIPELINE = Pipeline.from_pretrained(_PIPELINE_NAME, token=token)
        except TypeError as error:
            # pyannote.audio 3.x used the older Hugging Face keyword.
            if "token" not in str(error):
                raise
            _PIPELINE = Pipeline.from_pretrained(
                _PIPELINE_NAME, use_auth_token=token
            )
    return _PIPELINE


def get_annotation(result):
    """Extract the speaker ``Annotation`` from a pipeline result.

    pyannote.audio 4.x returns a ``DiarizeOutput`` with a
    ``.speaker_diarization`` attribute; older releases return the
    ``Annotation`` itself. This normalises both cases.
    """
    if hasattr(result, "speaker_diarization"):
        return result.speaker_diarization
    return result


def diarize_audio(audio_file):
    """Run speaker diarization on an audio file.

    Args:
        audio_file: Path to the audio file.

    Returns:
        List of dicts with keys: speaker, start, end. Segments are sorted
        chronologically. Returns an empty list if no speakers are detected.
    """
    waveform, sample_rate = load_audio(audio_file)
    pipeline = get_pipeline()

    print("Running speaker diarization...")

    result = pipeline({"waveform": waveform, "sample_rate": sample_rate})
    annotation = get_annotation(result)

    segments = [
        {
            "speaker": speaker,
            "start": float(turn.start),
            "end": float(turn.end),
        }
        for turn, _, speaker in annotation.itertracks(yield_label=True)
    ]

    segments.sort(key=lambda s: (s["start"], s["end"]))

    print(f"Diarization complete: {len(segments)} segments")

    return segments


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python diarization.py <audio_file>")
        sys.exit(1)

    audio_file = sys.argv[1]

    segments = diarize_audio(audio_file)

    for segment in segments:
        print(
            f"[{segment['start']:.2f}s -> {segment['end']:.2f}s] "
            f"{segment['speaker']}"
        )