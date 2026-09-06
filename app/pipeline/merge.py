"""Speaker-tagged transcript generation.

Combines faster-whisper transcription and pyannote diarization using
timestamp-overlap alignment, then merges consecutive same-speaker segments.
"""

import os

from .diarization import diarize_audio
from .transcribe import transcribe_audio

UNKNOWN_SPEAKER = "UNKNOWN"


class PipelineError(Exception):
    """Base error for the audio pipeline."""


class TranscriptionError(PipelineError):
    """Raised when speech-to-text transcription fails."""


class DiarizationError(PipelineError):
    """Raised when speaker diarization fails."""


def check_audio_file(audio_file):
    """Validate that the audio file exists and is non-empty."""
    if not os.path.exists(audio_file):
        raise FileNotFoundError(f"Audio file does not exist: {audio_file}")
    if os.path.getsize(audio_file) == 0:
        raise ValueError(f"Audio file is empty: {audio_file}")


def compute_overlap(seg_start, seg_end, spk_start, spk_end):
    """Return the overlap duration between two intervals in seconds."""
    return max(0.0, min(seg_end, spk_end) - max(seg_start, spk_start))


def find_dominant_speaker(seg_start, seg_end, diarization):
    """Find the speaker with the greatest timestamp overlap for a segment.

    Args:
        seg_start: Whisper segment start time.
        seg_end: Whisper segment end time.
        diarization: List of speaker segments
            (dicts with speaker, start, end).

    Returns:
        The best-matching speaker label, or None if there is no overlap
        with any speaker segment.
    """
    best_speaker = None
    best_overlap = 0.0

    for spk in diarization:
        overlap = compute_overlap(
            seg_start, seg_end, spk["start"], spk["end"]
        )
        if overlap > best_overlap:
            best_overlap = overlap
            best_speaker = spk["speaker"]

    return best_speaker


def merge_consecutive(segments):
    """Merge consecutive transcript segments attributed to the same speaker.

    Args:
        segments: List of dicts with speaker, start, end, text, in
            chronological order.

    Returns:
        A new list with consecutive same-speaker segments combined into
        single turns. Different speakers are never merged.
    """
    if not segments:
        return []

    merged = [dict(segments[0])]

    for seg in segments[1:]:
        last = merged[-1]
        if (
            last["speaker"] == seg["speaker"]
            and last["end"] <= seg["start"]
        ):
            last["end"] = seg["end"]
            last_text = (last["text"] or "").strip()
            new_text = (seg["text"] or "").strip()
            if last_text and new_text:
                last["text"] = f"{last_text} {new_text}"
            else:
                last["text"] = f"{last_text}{new_text}"
        else:
            merged.append(dict(seg))

    return merged


def merge_segments(whisper_segments, diarization_segments):
    """Assign speakers to Whisper segments and merge same-speaker turns.

    For each Whisper segment, every speaker interval is checked for a
    timestamp overlap. The speaker with the largest overlap wins. Text with
    no overlapping speaker is labelled ``UNKNOWN`` (never dropped).

    Consecutive segments attributed to the same speaker are then merged into
    a single turn, preserving chronological order and cleaning whitespace.
    Empty transcription segments are ignored.

    Args:
        whisper_segments: List of dicts with start, end, text.
        diarization_segments: List of dicts with speaker, start, end.

    Returns:
        List of dicts with keys: speaker, start, end, text, in
        chronological order.
    """
    aligned = []
    diarization = sorted(
        diarization_segments, key=lambda s: (s["start"], s["end"])
    )

    for seg in whisper_segments:
        start = float(seg["start"])
        end = float(seg["end"])
        text = (seg.get("text") or "").strip()

        if not text:
            continue

        speaker = find_dominant_speaker(start, end, diarization)
        if speaker is None:
            speaker = UNKNOWN_SPEAKER

        aligned.append(
            {
                "speaker": speaker,
                "start": start,
                "end": end,
                "text": text,
            }
        )

    return merge_consecutive(aligned)


def process_audio(audio_file, language=None, _whisper_segments=None,
                  _diarization_segments=None, on_progress=None):
    """Run the full audio pipeline on a file.

    Steps: transcription -> diarization -> timestamp alignment -> speaker
    assignment -> consecutive speaker merging.

    Diarization is best-effort: if the Hugging Face token is missing, the
    model cannot be downloaded, or the API rate-limits/returns a connection
    error, the pipeline degrades gracefully instead of aborting. Every
    whisper segment is then labelled ``UNKNOWN`` and the job continues, so
    the transcript + SOAP generation still complete (this fixes the
    "stuck at 15%" failure mode).

    Args:
        audio_file: Path to the audio file.
        language: Optional ISO language code for transcription. Defaults to
            None (Whisper auto-detects, good for Hinglish).
        _whisper_segments: Optional pre-computed transcription (used by
            tests to avoid re-running Whisper).
        _diarization_segments: Optional pre-computed diarization (used by
            tests to avoid re-running pyannote).
        on_progress: Optional callback ``fn(step: str, percent: int)``.

    Returns:
        List of dicts with keys: speaker, start, end, text.

    Raises:
        FileNotFoundError: If the audio file does not exist.
        ValueError: If the audio file is empty or contains no audio.
        TranscriptionError: If transcription fails.
    """
    check_audio_file(audio_file)

    def _report(step, percent):
        if on_progress is not None:
            on_progress(step, percent)

    if _whisper_segments is None:
        _report("Transcribing audio", 15)
        try:
            _whisper_segments = transcribe_audio(
                audio_file, language=language
            )
        except Exception as exc:
            raise TranscriptionError(
                f"Transcription failed for {audio_file}: {exc}"
            ) from exc

    if not _whisper_segments:
        raise TranscriptionError(
            f"Transcription produced no segments for {audio_file}"
        )

    if _diarization_segments is None:
        _report("Running speaker diarization", 35)
        try:
            _diarization_segments = diarize_audio(audio_file)
        except Exception as exc:
            print(
                f"[warn] speaker diarization unavailable for {audio_file}; "
                f"continuing with UNKNOWN speakers: {exc}"
            )
            _diarization_segments = []
        if not _diarization_segments:
            print(
                "[warn] diarization returned no speaker segments; "
                "labelling every turn as UNKNOWN"
            )

    _report("Aligning speakers and merging turns", 45)
    return merge_segments(_whisper_segments, _diarization_segments)