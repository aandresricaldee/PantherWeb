"""Genera las imágenes web del logo a partir de assets/PantherBlanco.png."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "PantherBlanco.png"
OUT = ROOT / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

logo = Image.open(SRC).convert("RGBA")
w, h = logo.size  # 8002 x 8699


def save_webp(img, name, width):
    height = round(img.height * width / img.width)
    resized = img.resize((width, height), Image.LANCZOS)
    resized.save(OUT / name, "WEBP", quality=85, method=6)
    print(f"{name}: {width}x{height}")


# Solo el escudo (header): recorte cuadrado que excluye el texto de abajo
shield = logo.crop((600, 0, 7400, 6800))
save_webp(shield, "shield-96.webp", 96)
save_webp(shield, "shield-192.webp", 192)

# Escudo grande para la intro
save_webp(shield, "shield-512.webp", 512)

# Favicon: escudo sobre el color de fondo del sitio (--color-bg = #0B0B0D)
fav = Image.new("RGBA", (64, 64), (11, 11, 13, 255))
icon = shield.resize((56, 56), Image.LANCZOS)
fav.alpha_composite(icon, (4, 4))
fav.save(OUT / "favicon-64.png", "PNG", optimize=True)
print("favicon-64.png: 64x64")

# Fondo del hero (assets/FondoGym.png, 2752x1536, ~8 MB): versiones web livianas
FONDO = ROOT / "assets" / "FondoGym.png"
if FONDO.exists():
    bg = Image.open(FONDO).convert("RGB")
    for width in (1920, 1024):
        height = round(bg.height * width / bg.width)
        bg.resize((width, height), Image.LANCZOS).save(OUT / f"fondo-{width}.webp", "WEBP", quality=72, method=6)
        print(f"fondo-{width}.webp: {width}x{height}")
