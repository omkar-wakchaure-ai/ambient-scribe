"""
app/demo_consultations.py
--------------------------
Synthetic (fictional) demo consultations used ONLY for demonstrating the
clinical intelligence pipeline. There is no real patient data here.

These transcripts are also the canonical test inputs for the pipeline:
    - DEMO_CONSULTATION  -> rich Hinglish consult with explicit doctor
                            actions (medication, investigation, patient
                            instruction, follow-up).
    - SHORT_CONSULTATION -> minimal consult with NO doctor actions
                            (anti-hallucination check: extract what is
                            said, but generate no invented actions).
"""

DEMO_CONSULTATION = """Doctor: Namaste, kya problem ho rahi hai?
Patient: Doctor, mujhe teen din se bukhaar hai aur body mein bahut weakness hai. Body pain bhi hai aur thodi khaansi hai.
Doctor: Bukhaar kitna rehta hai?
Patient: Around 101 degree. Raat ko zyada hota hai.
Doctor: Koi vomiting, loose motion ya saans lene mein problem?
Patient: Nahi doctor.
Doctor: Pehle koi medicine li?
Patient: Haan, Crocin liya tha but zyada relief nahi mila.
Doctor: Theek hai. CBC test karwa lo. Paani zyada piyo. Paracetamol zarurat ke according lena. Teen din baad follow-up ke liye aana."""

SHORT_CONSULTATION = """Patient: Mujhe do din se fever hai. Crocin liya tha but fever nahi gaya."""