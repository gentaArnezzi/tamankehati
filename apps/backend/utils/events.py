# apps/backend/utils/events.py
from typing import Callable, Dict, List

_SUBS: Dict[str, List[Callable]] = {}

def on(event: str, handler: Callable):
    _SUBS.setdefault(event, []).append(handler)

def emit(event: str, **payload):
    for h in _SUBS.get(event, []):
        try:
            h(**payload)
        except Exception:
            pass
