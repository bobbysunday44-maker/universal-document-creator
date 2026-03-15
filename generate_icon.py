"""Generate a professional app icon for UniversalDoc."""
from PIL import Image, ImageDraw, ImageFont
import os

SIZES = [16, 24, 32, 48, 64, 128, 256]
APP_DIR = os.path.dirname(os.path.abspath(__file__))


def create_icon_image(size):
    """Create a single icon at the given size."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded rectangle background with gradient effect
    margin = max(1, size // 16)
    radius = max(2, size // 5)

    # Main background - deep gradient orange-to-coral
    # Draw rounded rect
    bbox = [margin, margin, size - margin, size - margin]
    draw.rounded_rectangle(bbox, radius=radius, fill=(234, 88, 12))  # orange-600

    # Lighter top area for gradient feel
    top_bbox = [margin, margin, size - margin, size // 2]
    draw.rounded_rectangle(top_bbox, radius=radius, fill=(249, 115, 22))  # orange-500

    # Fix bottom corners that got rounded from the top half
    mid_y = size // 2 - radius
    if mid_y > margin:
        draw.rectangle([margin, mid_y, size - margin, size // 2], fill=(249, 115, 22))

    # Draw a document icon in center
    doc_w = int(size * 0.42)
    doc_h = int(size * 0.52)
    doc_x = (size - doc_w) // 2
    doc_y = (size - doc_h) // 2 + max(1, size // 20)

    # Document body (white)
    doc_radius = max(1, size // 20)
    draw.rounded_rectangle(
        [doc_x, doc_y, doc_x + doc_w, doc_y + doc_h],
        radius=doc_radius,
        fill=(255, 255, 255, 240),
    )

    # Folded corner
    fold = max(2, doc_w // 4)
    fold_x = doc_x + doc_w - fold
    fold_y = doc_y
    # Triangle for fold
    draw.polygon(
        [(fold_x, fold_y), (doc_x + doc_w, fold_y + fold), (fold_x, fold_y + fold)],
        fill=(220, 220, 220, 200),
    )
    draw.polygon(
        [(fold_x, fold_y), (doc_x + doc_w, fold_y + fold), (doc_x + doc_w, fold_y)],
        fill=(234, 88, 12, 100),
    )

    # Text lines on document
    line_margin_x = max(2, doc_w // 6)
    line_h = max(1, size // 32)
    line_gap = max(2, size // 16)
    line_start_y = doc_y + fold + max(2, size // 12)
    line_colors = [
        (234, 88, 12, 200),   # orange title line
        (180, 180, 180, 180),  # gray line
        (180, 180, 180, 180),  # gray line
        (180, 180, 180, 140),  # lighter gray
    ]
    line_widths = [0.85, 0.7, 0.6, 0.45]  # relative widths

    for i, (color, width_pct) in enumerate(zip(line_colors, line_widths)):
        ly = line_start_y + i * line_gap
        if ly + line_h > doc_y + doc_h - max(2, size // 12):
            break
        lx1 = doc_x + line_margin_x
        lx2 = doc_x + int(doc_w * width_pct)
        draw.rounded_rectangle(
            [lx1, ly, lx2, ly + line_h],
            radius=max(1, line_h // 2),
            fill=color,
        )

    # Sparkle/star in top-left
    sparkle_size = max(3, size // 7)
    sx = doc_x - sparkle_size // 3
    sy = doc_y - sparkle_size // 3

    # 4-point star shape
    cx, cy = sx + sparkle_size // 2, sy + sparkle_size // 2
    r = sparkle_size // 2
    r_inner = r // 3

    points = []
    import math
    for i in range(8):
        angle = math.pi / 4 * i - math.pi / 2
        radius_pt = r if i % 2 == 0 else r_inner
        px = cx + radius_pt * math.cos(angle)
        py = cy + radius_pt * math.sin(angle)
        points.append((px, py))

    if len(points) >= 3:
        draw.polygon(points, fill=(255, 255, 255, 230))

    return img


def main():
    # Generate icon at largest size
    images = []
    for s in SIZES:
        img = create_icon_image(s)
        images.append(img)

    # Save as .ico (multi-size)
    ico_path = os.path.join(APP_DIR, "universaldoc.ico")
    images[-1].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in SIZES],
        append_images=images[:-1],
    )
    print(f"Icon saved: {ico_path}")

    # Also save a PNG for other uses
    png_path = os.path.join(APP_DIR, "public", "icon-256.png")
    images[-1].save(png_path, format="PNG")
    print(f"PNG saved: {png_path}")

    # Copy to dist too
    dist_ico = os.path.join(APP_DIR, "dist", "favicon.ico")
    if os.path.isdir(os.path.join(APP_DIR, "dist")):
        images[-1].save(
            dist_ico,
            format="ICO",
            sizes=[(s, s) for s in SIZES],
            append_images=images[:-1],
        )
        print(f"Dist icon saved: {dist_ico}")


if __name__ == "__main__":
    main()
