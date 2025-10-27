from typing import Iterable

def chunk_text(text: str, size: int = 40) -> Iterable[str]:
    text = text or ""
    for i in range(0, len(text), size):
        yield text[i:i+size]
