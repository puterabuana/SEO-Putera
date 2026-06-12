"""Create web-ready evidence crops from the supplied SEO audit reports."""

from __future__ import annotations

import argparse
import shutil
from io import BytesIO
from pathlib import Path

import fitz
from PIL import Image


def render_page(pdf_path: Path, page_number: int, scale: float = 2.0) -> Image.Image:
    with fitz.open(pdf_path) as document:
        page = document[page_number]
        pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
        return Image.open(BytesIO(pixmap.tobytes("png"))).convert("RGB")


def save_crop(
    pdf_path: Path,
    page_number: int,
    crop_box: tuple[int, int, int, int],
    output_path: Path,
) -> None:
    image = render_page(pdf_path, page_number)
    crop = image.crop(crop_box)
    crop.save(output_path, "WEBP", quality=86, method=6)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--rankmath", type=Path, required=True)
    parser.add_argument("--sitecheckup", type=Path, required=True)
    parser.add_argument("--seoptimer", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    image_dir = args.output / "images" / "audits"
    report_dir = args.output / "reports"
    image_dir.mkdir(parents=True, exist_ok=True)
    report_dir.mkdir(parents=True, exist_ok=True)

    save_crop(
        args.rankmath,
        0,
        (34, 86, 1190, 770),
        image_dir / "rankmath-95.webp",
    )
    save_crop(
        args.sitecheckup,
        0,
        (22, 22, 1168, 850),
        image_dir / "sitecheckup-85.webp",
    )
    save_crop(
        args.seoptimer,
        0,
        (54, 335, 1138, 1100),
        image_dir / "seoptimer-overview.webp",
    )
    save_crop(
        args.seoptimer,
        8,
        (55, 55, 1135, 1560),
        image_dir / "pagespeed-results.webp",
    )
    save_crop(
        args.rankmath,
        5,
        (45, 95, 1180, 1215),
        image_dir / "technical-proof.webp",
    )

    report_names = {
        args.rankmath: "rankmath-audit.pdf",
        args.sitecheckup: "seo-site-checkup-audit.pdf",
        args.seoptimer: "seoptimer-audit.pdf",
    }
    for source, destination_name in report_names.items():
        shutil.copy2(source, report_dir / destination_name)

    for image_path in sorted(image_dir.glob("*.webp")):
        with Image.open(image_path) as image:
            print(f"{image_path.name}: {image.width}x{image.height}, {image_path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
