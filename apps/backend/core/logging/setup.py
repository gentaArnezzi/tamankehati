import logging
import os
from logging.handlers import RotatingFileHandler

def configure_logging():
    # Level dari env, default INFO
    level = os.getenv("LOG_LEVEL", "INFO").upper()

    # Format standar
    fmt = "[%(asctime)s] [%(levelname)s] %(name)s - %(message)s"
    datefmt = "%Y-%m-%d %H:%M:%S"

    # Console handler
    logging.basicConfig(level=getattr(logging, level, logging.INFO), format=fmt, datefmt=datefmt)

    # (Opsional) file handler berputar
    log_dir = os.getenv("LOG_DIR", "")
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)
        fh = RotatingFileHandler(os.path.join(log_dir, "app.log"), maxBytes=2_000_000, backupCount=3)
        fh.setLevel(getattr(logging, level, logging.INFO))
        fh.setFormatter(logging.Formatter(fmt, datefmt))
        root = logging.getLogger()
        root.addHandler(fh)

    # Reduksi kebisingan beberapa lib
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine.Engine").setLevel(logging.WARNING)
