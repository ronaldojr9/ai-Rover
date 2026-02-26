#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]

# Only standardize in code-like files (HTML/CSS/JS). SVG excluded due to external-file styling limitations.
INCLUDE_SUFFIXES = {".html", ".css", ".js"}
EXCLUDE = {
    REPO / ".git",
    REPO / "styles" / "theme.css",  # token source-of-truth allowed to contain raw colors
}

REPLACEMENTS: list[tuple[re.Pattern[str], str]] = [
    # Accent (legacy orange)
    (re.compile(r"rgba\(255,\s*107,\s*53,\s*0\.1\)"), "var(--alpha-accent-10)"),
    (re.compile(r"rgba\(255,\s*107,\s*53,\s*0\.2\)"), "var(--alpha-accent-20)"),
    (re.compile(r"rgba\(255,\s*107,\s*53,\s*0\.05\)"), "var(--alpha-accent-05)"),

    # Brand primary (legacy cyan/blue/green tints)
    (re.compile(r"rgba\(6,\s*182,\s*212,\s*0\.1\)"), "var(--alpha-brand-primary-10)"),
    (re.compile(r"rgba\(6,\s*182,\s*212,\s*0\.2\)"), "var(--alpha-brand-primary-20)"),
    (re.compile(r"rgba\(6,\s*182,\s*212,\s*0\.15\)"), "var(--alpha-brand-primary-15)"),

    (re.compile(r"rgba\(16,\s*185,\s*129,\s*0\.1\)"), "var(--alpha-brand-primary-10)"),
    (re.compile(r"rgba\(16,\s*185,\s*129,\s*0\.2\)"), "var(--alpha-brand-primary-20)"),

    (re.compile(r"rgba\(59,\s*130,\s*246,\s*0\.1\)"), "var(--alpha-brand-primary-10)"),
    (re.compile(r"rgba\(59,\s*130,\s*246,\s*0\.15\)"), "var(--alpha-brand-primary-15)"),

    # Shadows
    (re.compile(r"rgba\(0,\s*0,\s*0,\s*0\.3\)"), "var(--alpha-shadow-30)"),
    (re.compile(r"rgba\(0,\s*0,\s*0,\s*0\.2\)"), "var(--alpha-shadow-20)"),
    (re.compile(r"rgba\(0,\s*0,\s*0,\s*0\.15\)"), "var(--alpha-shadow-15)"),

    # Inline surface tint used on dark theme cards previously
    (re.compile(r"rgba\(26,\s*34,\s*52,\s*0\.55\)"), "var(--alpha-secondary-55)"),

    # Hex values in HTML/CSS
    (re.compile(r"#ef4444\b", re.IGNORECASE), "var(--color-danger)"),
    (re.compile(r"#f59e0b\b", re.IGNORECASE), "var(--color-accent)"),
    (re.compile(r"#10b981\b", re.IGNORECASE), "var(--color-brand-primary)"),
    (re.compile(r"#ffaa80\b", re.IGNORECASE), "var(--color-brand-primary-bright)"),
]


def should_process(path: Path) -> bool:
    if path.suffix.lower() not in INCLUDE_SUFFIXES:
        return False
    if path.name.lower().endswith(".svg"):
        return False
    for ex in EXCLUDE:
        try:
            if path.resolve() == ex.resolve():
                return False
        except FileNotFoundError:
            pass
    if ".git" in path.parts:
        return False
    return True


def process_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8", errors="ignore")
    updated = original
    for pattern, repl in REPLACEMENTS:
        updated = pattern.sub(repl, updated)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for p in REPO.rglob("*"):
        if p.is_file() and should_process(p):
            if process_file(p):
                changed.append(p)

    print(f"Changed {len(changed)} files")
    for p in changed:
        print(p.relative_to(REPO))


if __name__ == "__main__":
    main()
