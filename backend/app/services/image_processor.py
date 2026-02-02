from PIL import Image, ImageEnhance
from pathlib import Path
import uuid
import numpy as np
from sklearn.cluster import KMeans
from .color_labeler import label_color, rgb_to_hex

# Absolute, guaranteed folders
UPLOAD_DIR = Path("storage/uploads")
RESULT_DIR = Path("storage/results")

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)


def process_and_save_image(uploaded_image_path: str) -> str:
    """
    ALWAYS generates a REAL PNG image.
    """
    img = Image.open(uploaded_image_path).convert("RGB")

    # Force real transformation
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(2.5)

    output_filename = f"{uuid.uuid4()}.png"
    output_path = RESULT_DIR / output_filename

    # CRITICAL: save with explicit format
    img.save(output_path, format="PNG")

    # Safety check
    if not output_path.exists() or output_path.stat().st_size < 100:
        raise RuntimeError("Failed to generate valid image")

    return output_filename


def extract_colors(image_path, k=5):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((120, 120))

    pixels = np.array(img).reshape(-1, 3)

    kmeans = KMeans(n_clusters=k, n_init=10)
    kmeans.fit(pixels)

    colors = []
    for center in kmeans.cluster_centers_:
        rgb = center.astype(int).tolist()
        colors.append({
            "name": label_color(rgb),
            "rgb": rgb,
            "hex": rgb_to_hex(rgb)
        })

    return colors
