"""
app/config_check.py
---------------------
SAFE configuration test for the clinical intelligence (Person B) pipeline.

Run from the `app` directory:
    python config_check.py           (Groq backend; requires GROQ_API_KEY)
    set LLM_BACKEND=ollama; python config_check.py   (Ollama backend)

It prints ONLY:
    * Backend name
    * Whether the API key is loaded (True/False)
    * Selected model name for the given alias

It NEVER prints the actual API key.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))


def main() -> int:
    import os

    from app.models import llm_client as client

    alias = sys.argv[1] if len(sys.argv) > 1 else "70b"

    print(f"Backend:      {client.BACKEND}")

    if client.BACKEND == "groq":
        from groq import Groq

        api_key = os.environ.get("GROQ_API_KEY")
        key_loaded = bool(api_key and api_key.strip())
        print(f"API key loaded: {key_loaded}")

        if not key_loaded:
            print("Error: GROQ_API_KEY is not configured.")
            return 1

        groq_client = Groq(api_key=api_key)
        try:
            model = client._resolve_groq_model(groq_client, alias)
        except Exception as exc:  # never hide a real API/auth error
            print(f"Error resolving model: {exc}")
            return 1
        print(f"Selected model: {model}")
    else:
        model = client.OLLAMA_MODELS.get(alias, client.OLLAMA_MODELS["8b"])
        print(f"Selected model: {model}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
