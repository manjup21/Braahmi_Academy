"""Compress QuickShare photos into Static_UI/public/images (< 500 KB each)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageOps

SRC = Path(r"C:\Users\manju\Downloads\QuickShare_2611241156")
ROOT = Path(__file__).resolve().parents[1] / "public" / "images"
MAX_BYTES = 500 * 1024

JOBS = [
    # Staff portraits — keep existing filenames used by content.js
    ("Ganesh_Patel_K_L.JPG", ROOT / "staff" / "GANESH PATEL K L -Chemistry_Lecture.jpg", 1200),
    ("K_Vinay_Kumar.JPG", ROOT / "staff" / "K VINAY KUMAR-Physics.jpg", 1200),
    ("M_V_Manohar_Rao.JPG", ROOT / "staff" / "M V MANOHAR RAO- Mathemetics Lecture.jpg", 1200),
    ("Salla_Srinivas_Reddy.JPG", ROOT / "staff" / "Salla Srinivas Reddy-Biology.jpg", 1200),
    # Campus facilities
    ("DSC_8865.JPG", ROOT / "campus" / "facility-classroom.jpg", 1600),
    ("DSC_8804.JPG", ROOT / "campus" / "facility-laboratory.jpg", 1600),
    ("DSC_8870.JPG", ROOT / "campus" / "facility-library.jpg", 1600),
    ("DSC_8881.JPG", ROOT / "campus" / "hero-campus.jpg", 1920),
    ("DSC_8890.JPG", ROOT / "campus" / "academy-building.jpg", 1600),
    # Gallery
    ("DSC_8881.JPG", ROOT / "gallery" / "gallery-01-campus-building.jpg", 1600),
    ("DSC_8890.JPG", ROOT / "gallery" / "gallery-02-campus-bus.jpg", 1600),
    ("DSC_8865.JPG", ROOT / "gallery" / "gallery-03-classroom.jpg", 1600),
    ("DSC_8853.JPG", ROOT / "gallery" / "gallery-04-classroom-lecture.jpg", 1600),
    ("DSC_8857.JPG", ROOT / "gallery" / "gallery-05-classroom-study.jpg", 1600),
    ("DSC_8804.JPG", ROOT / "gallery" / "gallery-06-chemistry-lab.jpg", 1600),
    ("DSC_8833.JPG", ROOT / "gallery" / "gallery-07-physics-lab.jpg", 1600),
    ("DSC_8844.JPG", ROOT / "gallery" / "gallery-08-biology-lab.jpg", 1600),
    ("DSC_8848.JPG", ROOT / "gallery" / "gallery-09-anatomy-lab.jpg", 1600),
    ("DSC_8870.JPG", ROOT / "gallery" / "gallery-10-library.jpg", 1600),
    ("DSC_8896.JPG", ROOT / "gallery" / "gallery-11-hostel-study.jpg", 1600),
    ("DSC_8908.JPG", ROOT / "gallery" / "gallery-12-hostel-group-study.jpg", 1600),
]


def compress(src: Path, dest: Path, max_side: int) -> int:
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)

    quality = 85
    while quality >= 45:
        im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
        size = dest.stat().st_size
        if size <= MAX_BYTES:
            return size
        quality -= 5

    # Still too large — shrink dimensions further
    side = max_side
    while side >= 800:
        side = int(side * 0.85)
        im2 = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        im2.thumbnail((side, side), Image.Resampling.LANCZOS)
        im2.save(dest, "JPEG", quality=70, optimize=True, progressive=True)
        size = dest.stat().st_size
        if size <= MAX_BYTES:
            return size
    return dest.stat().st_size


def main() -> None:
    # Remove old gallery assets that are being replaced
    gallery = ROOT / "gallery"
    if gallery.exists():
        for old in gallery.iterdir():
            if old.is_file() and old.suffix.lower() in {".jpg", ".jpeg", ".png"}:
                old.unlink()

    # academy-building was .png — remove old if present
    old_png = ROOT / "campus" / "academy-building.png"
    if old_png.exists():
        old_png.unlink()

    results = []
    for src_name, dest, max_side in JOBS:
        src = SRC / src_name
        if not src.exists():
            raise SystemExit(f"Missing source: {src}")
        size = compress(src, dest, max_side)
        ok = size <= MAX_BYTES
        results.append((ok, dest.relative_to(ROOT).as_posix(), size, src_name))
        print(f"{'OK' if ok else 'BIG'} {size:7d}  {dest.relative_to(ROOT)}  <- {src_name}")

    failed = [r for r in results if not r[0]]
    print(f"\nDone: {len(results)} files, {len(failed)} over limit")
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
