"""Build the social preview from the real Rank Math audit crop."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    width, height = 1200, 630
    card = Image.new("RGB", (width, height), "#172554")
    draw = ImageDraw.Draw(card)

    draw.rounded_rectangle((34, 34, width - 34, height - 34), 26, fill="#1e3a8a", outline="#3b82f6", width=2)
    draw.ellipse((70, 470, 150, 550), fill="#b45309")

    heading = font(r"C:\Windows\Fonts\consolab.ttf", 53)
    body = font(r"C:\Windows\Fonts\segoeui.ttf", 25)
    label = font(r"C:\Windows\Fonts\consola.ttf", 17)

    draw.text((78, 78), "SEO PUTERA / PORTFOLIO", font=label, fill="#fbbf24")
    draw.multiline_text(
        (78, 132),
        "Technical SEO\nwith visible evidence.",
        font=heading,
        fill="#ffffff",
        spacing=7,
    )
    draw.multiline_text(
        (78, 310),
        "Canonical URLs · Structured data\nCrawlability · Performance · Validation",
        font=body,
        fill="#dbeafe",
        spacing=8,
    )
    draw.text((78, 515), "seo.puteragani.com", font=label, fill="#ffffff")

    evidence = Image.open(args.evidence).convert("RGB")
    evidence.thumbnail((500, 420), Image.Resampling.LANCZOS)
    frame = Image.new("RGB", (540, 460), "#ffffff")
    frame.paste(evidence, ((540 - evidence.width) // 2, (460 - evidence.height) // 2))
    card.paste(frame, (625, 86))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    card.save(args.output, "JPEG", quality=90, optimize=True, progressive=True)
    print(f"{args.output}: {width}x{height}, {args.output.stat().st_size} bytes")


if __name__ == "__main__":
    main()
