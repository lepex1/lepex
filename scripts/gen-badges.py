#!/usr/bin/env python3
"""Generates the SVG badges used by the READMEs into `.github/assets/`.

All text is converted to outlines: GitHub has none of the project fonts, and an
SVG with <text> would render in whatever the viewer calls its default sans.

Requires fonttools + brotli:  pip install fonttools brotli
Satoshi (the site's brand font) has no Cyrillic, so Russian strings fall back to
Segoe UI — the same per-glyph fallback the site itself ends up with. Segoe UI is
Windows-only; on another OS point RU_FONTS at a Cyrillic sans that looks close.

Usage:  python scripts/gen-badges.py
"""

import math
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / ".github" / "assets"

# Material 3 dark tokens, copied from css/themes.css
SURFACE = "#141218"
SURFACE_CONT = "#211F26"
ON_SURFACE = "#E6E0E9"
ON_SURFACE_VAR = "#CAC4D0"
ON_SURFACE_DIM = "#938F99"
OUTLINE = "#49454F"
PRIMARY = "#D0BCFF"
ON_PRIMARY = "#220A32"
PRIMARY_CONT = "#4F378B"
SEC_CONT = "#4A4458"
ON_SEC_CONT = "#E8DEF8"
SECONDARY = "#CCC2DC"
TERTIARY = "#EFB8C8"

SATOSHI = ROOT / "fonts" / "satoshi.woff2"
RU_FONTS = {
    400: "C:/Windows/Fonts/segoeui.ttf",
    600: "C:/Windows/Fonts/seguisb.ttf",
    700: "C:/Windows/Fonts/segoeuib.ttf",
}

_cache = {}


def font_for(text, weight):
    """Cyrillic strings go to Segoe UI, Latin ones stay on the brand font."""
    cyrillic = any("\u0400" <= ch <= "\u04ff" for ch in text)
    key = (cyrillic, weight)
    if key in _cache:
        return _cache[key]

    if cyrillic:
        nearest = min(RU_FONTS, key=lambda w: abs(w - weight))
        table = TTFont(RU_FONTS[nearest])
    else:
        satoshi = TTFont(str(SATOSHI))
        table = instantiateVariableFont(satoshi, {"wght": weight}, inplace=False)
    _cache[key] = table
    return table


def text_path(text, size, weight=700, tracking=0.0):
    """Outlines one line; returns (d, width) in user units, baseline at y=0."""
    font = font_for(text, weight)
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    glyphs = font.getGlyphSet()
    scale = size / upem

    pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.1f}")
    x = 0.0
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            raise SystemExit(f"missing glyph {ch!r} in {font!r}")
        glyphs[name].draw(TransformPen(pen, Transform(1, 0, 0, 1, x, 0)))
        x += font["hmtx"][name][0] + tracking / scale

    width = x * scale - tracking
    return pen.getCommands(), width


def line(text, size, cx, baseline, fill, weight=700, tracking=0.0, anchor="middle"):
    """One outlined line. anchor=middle centers on cx, start puts the origin at cx."""
    d, width = text_path(text, size, weight, tracking)
    x = cx - width / 2 if anchor == "middle" else cx
    scale = size / font_for(text, weight)["head"].unitsPerEm
    return (
        f'<path transform="translate({x:.1f} {baseline:.1f}) scale({scale:.5f} -{scale:.5f})" '
        f'fill="{fill}" d="{d}"/>',
        width,
    )


def blob(lobes, amp, phase=0.0, samples_per_lobe=6):
    """Closed organic shape around the origin; smooth cubic through polar points."""
    pts = []
    n = lobes * samples_per_lobe
    for i in range(n):
        t = 2 * math.pi * i / n
        r = 100 * (1 + amp * math.cos(lobes * t + phase))
        pts.append((r * math.cos(t), r * math.sin(t)))

    def fmt(p):
        return f"{p[0]:.1f} {p[1]:.1f}"

    parts = [f"M{fmt(pts[0])}"]
    for i in range(n):
        p0 = pts[(i - 1) % n]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        parts.append(f"C{fmt(c1)} {fmt(c2)} {fmt(p2)}")
    parts.append("Z")
    return "".join(parts)


def spin(dur, reverse=False):
    a, b = (360, 0) if reverse else (0, 360)
    return (
        f'<animateTransform attributeName="transform" type="rotate" '
        f'from="{a}" to="{b}" dur="{dur}s" repeatCount="indefinite"/>'
    )


def svg(width, height, body, label):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" role="img" aria-label="{label}">\n'
        f"{body}\n</svg>\n"
    )


def write(name, content):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(content, encoding="utf-8")
    print(f"{name:<24} {len(content) / 1024:.1f} KB")


# --------------------------------------------------------------------------- banner

BANNER_W, BANNER_H = 1042, 386


def banner(lang):
    t = CONTENT[lang]
    body = [
        f'<defs>'
        f'<clipPath id="card"><rect width="{BANNER_W}" height="{BANNER_H}" rx="40"/></clipPath>'
        f'<path id="flower" d="{blob(8, 0.12)}"/>'
        f'<path id="burst" d="{blob(12, 0.34, 0.4)}"/>'
        f'</defs>',
        '<g clip-path="url(#card)">',
        f'<rect width="{BANNER_W}" height="{BANNER_H}" fill="{SURFACE}"/>',
        f'<g transform="translate(1000 30) scale(0.95)"><g>{spin(24)}'
        f'<use href="#flower" fill="{PRIMARY}" opacity="0.9"/></g></g>',
        f'<g transform="translate(34 352) scale(0.8)"><g>{spin(30, reverse=True)}'
        f'<use href="#flower" fill="{PRIMARY_CONT}"/></g></g>',
    ]

    cx = BANNER_W / 2
    for text, size, base, fill, weight, tracking in (
        (t["banner_label"], 20, 139, PRIMARY, 600, 3.0),
        ("lepex", 78, 208, ON_SURFACE, 700, 0),
        (t["banner_sub"][0], 27, 254, ON_SURFACE_VAR, 500, 0),
        (t["banner_sub"][1], 27, 290, ON_SURFACE_VAR, 500, 0),
        (t["banner_tags"], 18, 338, ON_SURFACE_DIM, 500, 1.5),
    ):
        body.append(line(text, size, cx, base, fill, weight, tracking)[0])

    body.append("</g>")
    write(f"banner{'.' + lang if lang != 'ru' else ''}.svg",
          svg(BANNER_W, BANNER_H, "\n".join(body), t["banner_alt"]))


# --------------------------------------------------------------------------- pills

def pill(text, height=40, size=16, weight=600, filled=True, radius=None):
    radius = height / 2 if radius is None else radius
    fill = PRIMARY if filled else SEC_CONT
    ink = ON_PRIMARY if filled else ON_SEC_CONT
    _, width = text_path(text, size, weight)
    width = math.ceil(width + 2 * (18 if height >= 40 else 14))
    body = f'<rect width="{width}" height="{height}" rx="{radius}" fill="{fill}"/>'
    body += line(text, size, width / 2, height / 2 + size * 0.36, ink, weight)[0]
    return width, svg(width, height, body, text)


def section_header(text, accent):
    """Full-width pill with a small spinning blob and the section title."""
    w, h = 880, 64
    body = (
        f'<defs><clipPath id="pill"><rect width="{w}" height="{h}" rx="32"/></clipPath>'
        f'<path id="flower" d="{blob(8, 0.12)}"/></defs>'
        f'<g clip-path="url(#pill)">'
        f'<rect width="{w}" height="{h}" fill="{SURFACE_CONT}"/>'
        f'<g transform="translate(62 32) scale(0.22)"><g>{spin(26)}'
        f'<use href="#flower" fill="{accent}"/></g></g>'
        f'<g transform="translate(884 34) scale(0.55)"><g>{spin(34, reverse=True)}'
        f'<use href="#flower" fill="#33313A"/></g></g>'
        f"</g>"
    )
    body += line(text, 25, 108, 39, ON_SURFACE, 700, 0, anchor="start")[0]
    return svg(w, h, body, text)


# --------------------------------------------------------------------------- cards

CARD_W, CARD_H, CARD_GAP = 304, 192, 24


def features(lang):
    t = CONTENT[lang]
    w = CARD_W * 3 + CARD_GAP * 2
    cards = []
    tints = [
        ("#2B2930", PRIMARY_CONT, PRIMARY),
        (PRIMARY_CONT, PRIMARY, PRIMARY),
        ("#3A2E36", "#8A5060", TERTIARY),
    ]
    for i, (title, lines) in enumerate(t["cards"]):
        bg, blob_fill, accent = tints[i]
        x = i * (CARD_W + CARD_GAP)
        card = [
            f'<g transform="translate({x} 0)">',
            f'<defs><clipPath id="card{i}"><rect width="{CARD_W}" height="{CARD_H}" rx="28"/></clipPath></defs>',
            f'<g clip-path="url(#card{i})">',
            f'<rect width="{CARD_W}" height="{CARD_H}" fill="{bg}"/>',
            f'<g transform="translate(276 8) scale(0.58)"><g>{spin(30 + i * 6, reverse=i % 2 == 1)}'
            f'<use href="#flower" fill="{blob_fill}" opacity="0.45"/></g></g>',
        ]
        card.append(line(title, 24, 28, 66, accent, 700, 0, anchor="start")[0])
        y = 106
        for text in lines:
            card.append(line(text, 19, 28, y, ON_SURFACE_VAR, 400, 0, anchor="start")[0])
            y += 28
        card.append("</g></g>")
        cards.append("\n".join(card))

    body = (
        f'<defs><path id="flower" d="{blob(8, 0.12)}"/></defs>\n'
        + "\n".join(cards)
    )
    write(f"features{'.' + lang if lang != 'ru' else ''}.svg",
          svg(w, CARD_H, body, t["features_alt"]))


def caption(text):
    """Small chip under a screenshot."""
    h, size = 34, 16
    _, tw = text_path(text, size, 500)
    w = math.ceil(tw + 2 * 20)
    body = (
        f'<rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" rx="12" '
        f'fill="{SURFACE_CONT}" stroke="{OUTLINE}"/>'
        + line(text, size, w / 2, h / 2 + size * 0.36, ON_SURFACE_VAR, 500)[0]
    )
    return svg(w, h, body, text)


# --------------------------------------------------------------------------- content

CONTENT = {
    "ru": {
        "banner_alt": "lepex — личный сайт: профиль и портфолио мини-инструментов",
        "banner_label": "lepex.vercel.app",
        "banner_sub": ["Личный сайт: профиль,", "портфолио мини-инструментов."],
        "banner_tags": "HTML · CSS · JavaScript · Vite",
        "buttons": {"site": "Открыть сайт"},
        "headers": {
            "about": "О проекте",
            "inside": "Что внутри",
            "screenshot": "Скриншот",
            "run": "Запуск локально",
            "license": "Лицензия",
        },
        "features_alt": "Три карточки: портфолио, всячина, без фреймворков",
        "cards": [
            ("Портфолио", ["Проверка VPN-подписок,", "генератор градиентного", "текста и image → MP4."]),
            ("Всячина", ["Релизы, PDF-справочники", "и другие понравившиеся", "штуки в одном хабе."]),
            ("Без фреймворков", ["Рукописные HTML, CSS", "и ES-модули; сетки 1 / 2 / 3", "колонки от 375 px."]),
        ],
        "caption": "Главная страница",
    },
    "en": {
        "banner_alt": "lepex — a personal site: profile and a portfolio of small tools",
        "banner_label": "lepex.vercel.app",
        "banner_sub": ["A personal site: profile,", "a portfolio of small tools."],
        "banner_tags": "HTML · CSS · JavaScript · Vite",
        "buttons": {"site": "Open the site"},
        "headers": {
            "about": "About",
            "inside": "What is inside",
            "screenshot": "Screenshot",
            "run": "Run locally",
            "license": "License",
        },
        "features_alt": "Three cards: portfolio, misc, no frameworks",
        "cards": [
            ("Portfolio", ["VPN subscription checks,", "gradient text, image → MP4", "and the CASSIE commands."]),
            ("Misc", ["Releases, PDF handbooks", "and other things I simply", "like, gathered in one hub."]),
            ("No frameworks", ["Hand-written HTML, CSS", "and ES modules; grids reflow", "to 1 / 2 / 3 columns."]),
        ],
        "caption": "Home page",
    },
}

HEADER_ACCENTS = [PRIMARY, SECONDARY, TERTIARY, PRIMARY, SECONDARY]
MAX_TEXT_W = CARD_W - 2 * 28


def main():
    for lang in ("ru", "en"):
        suffix = "" if lang == "ru" else ".en"

        banner(lang)

        width, markup = pill(CONTENT[lang]["buttons"]["site"], filled=True)
        write(f"btn-site{suffix}.svg", markup)

        for key, text in CONTENT[lang]["headers"].items():
            accent = HEADER_ACCENTS[list(CONTENT[lang]["headers"]).index(key)]
            write(f"h-{key}{suffix}.svg", section_header(text, accent))

        features(lang)
        write(f"shot-home{suffix}.svg", caption(CONTENT[lang]["caption"]))

    width, markup = pill("GitHub", filled=False)
    write("btn-github.svg", markup)

    # a too-wide line would silently stick out of its card — catch it here
    for lang in ("ru", "en"):
        for title, lines in CONTENT[lang]["cards"]:
            for text in lines:
                _, w = text_path(text, 19, 400)
                if w > MAX_TEXT_W:
                    safe = text.encode("ascii", "replace").decode("ascii")
                    print(f"  ! {lang}: {w:.0f}px > {MAX_TEXT_W}px — {safe!r}")


if __name__ == "__main__":
    main()
