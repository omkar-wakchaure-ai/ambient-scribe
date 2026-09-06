# stt_test.py
from faster_whisper import WhisperModel

model = WhisperModel("medium", device="cpu", compute_type="int8")
# use device="cuda", compute_type="float16" if you have GPU

segments, info = model.transcribe("sample_data/sample_consultation.wav", 
                                    language=None,  # let it auto-detect / handle code-switching
                                    task="transcribe")

print(f"Detected language: {info.language}")
for seg in segments:
    print(f"[{seg.start:.2f}s -> {seg.end:.2f}s] {seg.text}")