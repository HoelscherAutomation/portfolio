"""Generate the Open Graph social share image (1200×630).

Composites the navy logo with the company name and tagline.
Run once; commit the output. Re-run if the logo or tagline changes.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUTPUT = Path("public/og-image.png")
LOGO = Path("public/assets/logo/logo-square-navy.png")
WIDTH, HEIGHT = 1200, 630
NAVY = (10, 14, 26)  # bg-deep
ORANGE = (240, 166, 83)  # brand-orange-bright
TEXT = (232, 235, 242)  # text-primary
MUTED = (160, 170, 187)  # text-secondary

COMPANY = "Hoelscher Automation"
TAGLINE = "AI tools and automation for professional services teams"


def find_font(name_substrings: list[str], size: int) -> ImageFont.FreeTypeFont:
    """Find a system font by name fragment, fall back to default."""
    import subprocess
    try:
        out = subprocess.check_output(
            ["fc-list", ":", "file"], text=True, stderr=subprocess.DEVNULL
        )
        for line in out.splitlines():
            path = line.split(":")[0].strip()
            low = path.lower()
            if any(s.lower() in low for s in name_substrings):
                try:
                    return ImageFont.truetype(path, size)
                except Exception:
                    continue
    except Exception:
        pass
    return ImageFont.load_default()


def main() -> None:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), NAVY)
    draw = ImageDraw.Draw(canvas)

    # Subtle orange accent line
    draw.rectangle([(0, HEIGHT - 6), (WIDTH, HEIGHT)], fill=ORANGE)

    # Logo on left
    logo = Image.open(LOGO).convert("RGBA")
    logo.thumbnail((280, 280))
    canvas.paste(logo, (80, (HEIGHT - logo.height) // 2), logo)

    # Text on right
    text_x = 80 + 280 + 60

    company_font = find_font(["DejaVuSerif-Bold", "Georgia", "TimesNewRoman"], 64)
    tagline_font = find_font(["DejaVuSans", "Helvetica", "Arial"], 32)

    draw.text((text_x, 220), COMPANY, font=company_font, fill=TEXT)
    draw.text((text_x, 320), TAGLINE, font=tagline_font, fill=MUTED)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT, optimize=True)
    print(f"Wrote {OUTPUT} ({WIDTH}×{HEIGHT})")


if __name__ == "__main__":
    main()
