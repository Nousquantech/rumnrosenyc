from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv


def load_backend_env() -> None:
    """Load backend .env regardless of current working directory.

    Uvicorn reload on Windows often runs from the repo root; relying on the CWD
    makes env loading brittle.
    """

    backend_dir = Path(__file__).resolve().parents[1]  # ai-retail-system/backend
    env_path = backend_dir / ".env"
    load_dotenv(dotenv_path=env_path)
