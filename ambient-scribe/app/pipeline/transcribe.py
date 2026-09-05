"""Speech-to-text transcription using faster-whisper."""

import os

from faster_whisper import WhisperModel

_MODEL = None
_MODEL_SIZE = os.environ.get("WHISPER_MODEL", "small")


class Transcriber:
    """Reusable faster-whisper transcriber.

    Loads the Whisper model once and reuses it for all transcription calls.
    """

    def __init__(self, model_size="small", device="cpu", compute_type="int8"):
        print(f"Loading Whisper model: {model_size}")
        self.model = WhisperModel(
            model_size,
            device=device,
            compute_type=compute_type,
        )

    def transcribe(self, audio_file, language=None):
        print("Transcribing audio...")

        segments, info = self.model.transcribe(
            audio_file,
            language=language,
            beam_size=5,
            vad_filter=True,
        )

        results = [
            {
                "start": float(segment.start),
                "end": float(segment.end),
                "text": segment.text.strip(),
            }
            for segment in segments
        ]

        print(
            f"Transcription complete: {len(results)} segments "
            f"(detected language: {getattr(info, 'language', None)})"
        )

        return results


def transcribe_audio(audio_file, language=None):
    """Transcribe an audio file into timestamped text segments.

    Args:
        audio_file: Path to the audio file.
        language: Optional ISO language code (e.g. "hi", "en"). Defaults to
            None, letting Whisper auto-detect. Useful for Hinglish
            code-switching where auto-detection often works best.

    Returns:
        List of dicts with keys: start, end, text.
    """
    global _MODEL

    if _MODEL is None:
        _MODEL = Transcriber(model_size=_MODEL_SIZE)

    if not os.path.exists(audio_file):
        raise FileNotFoundError(f"Audio file does not exist: {audio_file}")

    return _MODEL.transcribe(audio_file, language=language)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <audio_file>")
        sys.exit(1)

    audio_file = sys.argv[1]

    transcriber = Transcriber()

    segments = transcriber.transcribe(audio_file)

    for segment in segments:
        print(
            f"[{segment['start']:.2f} -> "
            f"{segment['end']:.2f}] "
            f"{segment['text']}"
        )
