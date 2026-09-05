"""Ambient Scribe application package."""

import warnings


def _silence_known_benign_warnings():
    """Silence two known-benign warnings that spam stderr/harness output.

    1. torchcodec: pyannote.audio warns that built-in decoding is broken
       (its Windows DLL fails to load against CPU-only torch). We never use
       it - audio is decoded with PyAV and passed as an in-memory waveform
       tensor - so the warning is pure noise. Filter by module (not
       message), because the message starts with a leading newline that
       breaks the message-regex match.
    2. std(): pyannote's pooling layer warns on short/empty embeddings.
       Doesn't affect diarization of the supported sample lengths.
    """
    warnings.filterwarnings(
        "ignore",
        category=UserWarning,
        module=r"pyannote\.audio\.core\.io",
    )
    warnings.filterwarnings(
        "ignore",
        message=r"std\(\): degrees of freedom is <= 0\..*",
    )


_silence_known_benign_warnings()