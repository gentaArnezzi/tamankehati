from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


# Removed lru_cache to ensure .env is always reloaded with override=True
def load_env() -> Optional[Path]:
    """
    Load variables from a project-level .env file once per process.

    Returns the path that was loaded (if any) so callers can introspect when needed.
    """
    project_root = Path(__file__).resolve().parents[2]
    env_path = project_root / ".env"

    # Prefer explicit project-level .env, fall back to default discovery.
    if env_path.exists():
        load_dotenv(env_path, override=True)
        return env_path

    load_dotenv(override=True)
    return None
