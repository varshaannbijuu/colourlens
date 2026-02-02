from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
import uuid

from app.services.image_processor import process_and_save_image, extract_colors
from app.utils.storage import save_upload

router = APIRouter()
HISTORY = []


@router.post("/colorize")
async def colorize_image(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image type")

    upload_path, _ = save_upload(image)

    # 🔥 THIS is the real output image
    result_filename = process_and_save_image(upload_path)

    colors = extract_colors(upload_path)

    entry = {
        "id": str(uuid.uuid4()),
        "originalFilename": image.filename,
        "resultUrl": f"/static/results/{result_filename}",
        "createdAt": datetime.utcnow().isoformat(),
        "colors": colors,
    }

    HISTORY.insert(0, entry)
    return entry
