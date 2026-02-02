from PIL import Image, ImageEnhance
from pathlib import Path
import uuid
import numpy as np
from sklearn.cluster import KMeans
from .color_labeler import label_color, rgb_to_hex

# ------------------ DIRECTORIES ------------------

UPLOAD_DIR = Path("storage/uploads")
RESULT_DIR = Path("storage/results")

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)


# ------------------ HUE SHIFT FUNCTION ------------------

def hue_shift_rgb(img: Image.Image) -> Image.Image:
    """
    Ishihara-friendly color transformation:
    Red → Purple
    Green → Cyan
    """
    img_np = np.array(img).astype(np.float32) / 255.0

    r, g, b = img_np[..., 0], img_np[..., 1], img_np[..., 2]
    maxc = np.max(img_np, axis=-1)
    minc = np.min(img_np, axis=-1)
    delta = maxc - minc + 1e-6

    hue = np.zeros_like(maxc)

    mask = maxc == r
    hue[mask] = ((g - b)[mask] / delta[mask]) % 6

    mask = maxc == g
    hue[mask] = ((b - r)[mask] / delta[mask]) + 2

    mask = maxc == b
    hue[mask] = ((r - g)[mask] / delta[mask]) + 4

    hue = hue / 6.0

    sat = np.where(maxc == 0, 0, delta / maxc)
    val = maxc

    # -------- HUE REMAPPING --------
    hue_deg = hue * 360

    # Red → Purple
    red_mask = (hue_deg < 20) | (hue_deg > 340)
    hue_deg[red_mask] = 280

    # Green → Cyan
    green_mask = (hue_deg > 90) & (hue_deg < 150)
    hue_deg[green_mask] = 190

    hue = hue_deg / 360

    # -------- HSV → RGB --------
    c = val * sat
    x = c * (1 - np.abs((hue * 6) % 2 - 1))
    m = val - c

    rgb = np.zeros_like(img_np)
    h6 = hue * 6

    conds = [
        (0 <= h6) & (h6 < 1),
        (1 <= h6) & (h6 < 2),
        (2 <= h6) & (h6 < 3),
        (3 <= h6) & (h6 < 4),
        (4 <= h6) & (h6 < 5),
        (5 <= h6) & (h6 < 6),
    ]

    choices = [
        (c, x, 0),
        (x, c, 0),
        (0, c, x),
        (0, x, c),
        (x, 0, c),
        (c, 0, x),
    ]

    for cond, (rc, gc, bc) in zip(conds, choices):
        rgb[..., 0][cond] = rc[cond]
        rgb[..., 1][cond] = gc[cond]
        rgb[..., 2][cond] = bc[cond]

    rgb = ((rgb + m[..., None]) * 255).clip(0, 255).astype(np.uint8)
    return Image.fromarray(rgb, "RGB")


# ------------------ IMAGE PROCESSING ------------------

def process_and_save_image(uploaded_image_path: str) -> str:
    """
    Generates a REAL corrected PNG image with hue shifting
    """
    img = Image.open(uploaded_image_path).convert("RGB")

    # Mild saturation (optional but safe)
    img = ImageEnhance.Color(img).enhance(1.2)

    # REAL hue transformation
    img = hue_shift_rgb(img)

    output_filename = f"{uuid.uuid4()}.png"
    output_path = RESULT_DIR / output_filename

    img.save(output_path, format="PNG")

    if not output_path.exists() or output_path.stat().st_size < 100:
        raise RuntimeError("Failed to generate valid image")

    return output_filename


# ------------------ COLOR EXTRACTION ------------------

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
