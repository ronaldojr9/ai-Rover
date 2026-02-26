#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

REPO = Path(__file__).resolve().parents[1]

LOGO_INLINE = """<svg class=\"logo-img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 140 36\" width=\"140\" height=\"36\" role=\"img\" aria-label=\"Rover\">\n  <defs>\n    <linearGradient id=\"roverGrad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n      <stop offset=\"0%\" style=\"stop-color:var(--color-accent);stop-opacity:1\" />\n      <stop offset=\"100%\" style=\"stop-color:var(--color-brand-primary);stop-opacity:1\" />\n    </linearGradient>\n  </defs>\n  <rect width=\"36\" height=\"36\" rx=\"8\" ry=\"8\" fill=\"url(#roverGrad)\"/>\n  <text x=\"18\" y=\"25\" font-family=\"DM Sans, Arial, sans-serif\" font-size=\"20\" font-weight=\"700\" fill=\"var(--color-text-inverse)\" text-anchor=\"middle\" letter-spacing=\"-0.5\">R</text>\n  <text x=\"46\" y=\"25\" font-family=\"DM Sans, Arial, sans-serif\" font-size=\"20\" font-weight=\"700\" fill=\"var(--color-brand-secondary)\" letter-spacing=\"-0.5\">Rover</text>\n</svg>"""

ICON_INLINE = """<svg class=\"logo-icon\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 36 36\" width=\"36\" height=\"36\" role=\"img\" aria-label=\"Rover\">\n  <defs>\n    <linearGradient id=\"roverIconGrad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n      <stop offset=\"0%\" style=\"stop-color:var(--color-accent);stop-opacity:1\" />\n      <stop offset=\"100%\" style=\"stop-color:var(--color-brand-primary);stop-opacity:1\" />\n    </linearGradient>\n  </defs>\n  <rect width=\"36\" height=\"36\" rx=\"8\" ry=\"8\" fill=\"url(#roverIconGrad)\"/>\n  <text x=\"18\" y=\"25\" font-family=\"DM Sans, Arial, sans-serif\" font-size=\"20\" font-weight=\"700\" fill=\"var(--color-text-inverse)\" text-anchor=\"middle\" letter-spacing=\"-0.5\">R</text>\n</svg>"""


def replace_in_file(path: Path) -> bool:
    txt = path.read_text(encoding="utf-8", errors="ignore")
    orig = txt

    txt = txt.replace('<img src="rover-logo.svg" class="logo-img" alt="Rover">', LOGO_INLINE)
    txt = txt.replace('<img src="../rover-logo.svg" class="logo-img" alt="Rover">', LOGO_INLINE)

    txt = txt.replace('<img src="../rover-icon.svg" class="logo-icon" alt="Rover">', ICON_INLINE)
    txt = txt.replace('<img src="rover-icon.svg" class="logo-icon" alt="Rover">', ICON_INLINE)

    if txt != orig:
        path.write_text(txt, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for p in REPO.rglob("*.html"):
        if ".git" in p.parts:
            continue
        if replace_in_file(p):
            changed.append(p)

    print(f"Updated {len(changed)} files")
    for p in changed:
        print(p.relative_to(REPO))


if __name__ == "__main__":
    main()
