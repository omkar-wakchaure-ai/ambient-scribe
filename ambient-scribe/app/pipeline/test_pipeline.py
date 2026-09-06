"""End-to-end test for the audio pipeline on the real Hinglish sample.

Run from the project root:

    python app\\pipeline\\test_pipeline.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)
))))

from app.pipeline.diarization import diarize_audio
from app.pipeline.merge import process_audio
from app.pipeline.transcribe import transcribe_audio

AUDIO = "app/pipeline/sample_data/sample_consultation.wav"


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    print("=" * 40)
    print("AMBIENT SCRIBE AUDIO PIPELINE")
    print("=" * 40)
    print()
    print(f"Audio: {AUDIO}")
    print()

    if not os.path.exists(AUDIO):
        print(f"ERROR: audio file not found: {AUDIO}")
        return 1

    try:
        whisper_segments = transcribe_audio(AUDIO)
    except Exception as exc:
        print(f"TRANSCRIPTION FAILED: {type(exc).__name__}: {exc}")
        return 1

    try:
        speaker_segments = diarize_audio(AUDIO)
    except Exception as exc:
        print(f"DIARIZATION FAILED: {type(exc).__name__}: {exc}")
        print("The pipeline cannot report speaker attribution.")
        return 1

    if not speaker_segments:
        print("DIARIZATION FAILED: no speaker segments were detected.")
        return 1

    unique_speakers = len({s["speaker"] for s in speaker_segments})

    result = process_audio(
        AUDIO,
        _whisper_segments=whisper_segments,
        _diarization_segments=speaker_segments,
    )

    print(f"Whisper segments: {len(whisper_segments)}")
    print(f"Speaker segments: {len(speaker_segments)}")
    print(f"Unique speakers: {unique_speakers}")

    print()
    print("FINAL TRANSCRIPT")
    print("=" * 40)
    print()

    for item in result:
        print(
            f"[{item['start']:.2f}s -> {item['end']:.2f}s] "
            f"{item['speaker']}: "
            f"{item['text']}"
        )

    print()
    print("=" * 40)
    print("PIPELINE COMPLETE")
    print("=" * 40)

    return 0


if __name__ == "__main__":
    sys.exit(main())