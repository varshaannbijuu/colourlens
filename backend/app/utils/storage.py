import uuid
from pathlib import Path

UPLOAD_DIR = Path("storage/uploads")
RESULT_DIR = Path("storage/results")

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)


def save_upload(file):
    filename = f"{uuid.uuid4()}_{file.filename}"
    path = UPLOAD_DIR / filename

    with open(path, "wb") as buffer:
        buffer.write(file.file.read())

    return path, filename
