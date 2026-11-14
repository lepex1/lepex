#!/usr/bin/env python3
"""Generates the SVG badges used by the READMEs into `.github/assets/`.

Geometry, colors and the decorative shapes are taken from h6rd/Dota2PornFxWeb's
README assets (the design the site itself follows), so the badges read as the
same family. Only the words differ.

All text is converted to outlines: GitHub has none of the project fonts, and an
SVG with <text> would render in whatever the viewer calls its default sans.
Lines are placed by their ink box, so each label sits exactly where the
original's does regardless of the font's sidebearings.

Requires fonttools + brotli:  pip install fonttools brotli
Satoshi (the site's brand font) has no Cyrillic, so Russian strings fall back to
Segoe UI — the same per-glyph fallback the site itself ends up with. Segoe UI is
Windows-only; on another OS point RU_FONTS at a Cyrillic sans that looks close.

Usage:  python scripts/gen-badges.py
"""

from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

from badge_shapes import SHAPES

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / ".github" / "assets"

# Material 3 dark tokens, copied from css/themes.css
SURFACE_CONT = "#211F26"
OUTLINE = "#49454F"
PRIMARY = "#D0BCFF"
ON_PRIMARY = "#381E72"
SEC_CONT = "#4A4458"
ON_SEC_CONT = "#E8DEF8"
SECONDARY = "#CCC2DC"
TERTIARY = "#EFB8C8"

# banner palette from the reference badge
BANNER_BG = "#0F0D12"
BANNER_ACCENT = "#C2B1DD"
BANNER_SHAPE = "#3C3053"
BANNER_TITLE = "#EBE3EF"
BANNER_SUB = "#A9A0B0"

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
        table = instantiateVariableFont(TTFont(str(SATOSHI)), {"wght": weight}, inplace=False)
    _cache[key] = table
    return table


def cap_ratio():
    """Cap height of the brand font as a fraction of the em."""
    font = font_for("A", 700)
    return font["OS/2"].sCapHeight / font["head"].unitsPerEm


def cap_size(cap):
    """Font size whose caps are `cap` px tall in Satoshi, so RU and EN match."""
    return round(cap / cap_ratio() * 2) / 2


def outline(text, weight):
    """Outlines one line; returns (path data, font bbox, advance) in font units."""
    font = font_for(text, weight)
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    glyphs = font.getGlyphSet()

    pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.1f}")
    x = 0.0
    box = [1e9, 1e9, -1e9, -1e9]
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            raise SystemExit(f"missing glyph {ch!r} in {font!r}")
        glyphs[name].draw(TransformPen(pen, Transform(1, 0, 0, 1, x, 0)))

        bounds = BoundsPen(glyphs)
        glyphs[name].draw(bounds)
        if bounds.bounds:
            x0, y0, x1, y1 = bounds.bounds
            box = [min(box[0], x + x0), min(box[1], y0), max(box[2], x + x1), max(box[3], y1)]
        x += font["hmtx"][name][0]

    return pen.getCommands(), box, x, upem


def line(text, fill, cap, weight=700, *, left=None, top=None, center=None, max_width=None):
    """One outlined line placed by its ink box.

    left  — desired ink left edge;  center — desired ink horizontal centre
    top   — desired ink top edge
    max_width — shrink the type until the ink fits (long labels would overflow)
    """
    d, box, advance, upem = outline(text, weight)
    size = cap_size(cap)
    width = (box[2] - box[0]) * size / upem
    if max_width and width > max_width:
        size *= max_width / width
        width = (box[2] - box[0]) * size / upem
    s = size / upem

    if left is not None:
        tx = left - s * box[0]
    else:
        tx = center - s * (box[0] + box[2]) / 2

    ty = top + s * box[3]

    return (
        f'<path aria-hidden="true" fill="{fill}" transform="translate({tx:.2f} {ty:.2f}) '
        f'scale({s:.5f} -{s:.5f})" d="{d}"/>',
        width,
        advance * s,
    )


# --------------------------------------------------------------------------- shapes

_boxes = {}


def shape_box(key):
    """Ink box of a decorative shape, so it can be centred the way the original does."""
    if key not in _boxes:
        _boxes[key] = _svg_box(SHAPES[key])
    return _boxes[key]


def _svg_box(d):
    import re

    arity = {"M": 2, "L": 2, "H": 1, "V": 1, "Q": 4, "C": 6, "S": 4, "T": 2, "Z": 0}
    tok = re.findall(r"[A-Za-z]|-?\d*\.?\d+(?:[eE][-+]?\d+)?", d)
    xs, ys = [], []
    cx = cy = sx = sy = 0.0
    i = 0
    while i < len(tok):
        cmd = tok[i]
        i += 1
        up = cmd.upper()
        if up == "Z":
            cx, cy = sx, sy
            continue
        n = arity[up]
        args = []
        while i < len(tok) and not tok[i].isalpha():
            args.append(float(tok[i]))
            i += 1
        for k in range(0, len(args) - n + 1, n):
            a = args[k:k + n]
            rel = cmd.islower()
            if up in "ML":
                x, y = (cx + a[0], cy + a[1]) if rel else a
                cx, cy = x, y
                if up == "M":
                    sx, sy = x, y
                xs.append(x)
                ys.append(y)
            elif up == "H":
                cx = cx + a[0] if rel else a[0]
                xs.append(cx)
            elif up == "V":
                cy = cy + a[0] if rel else a[0]
                ys.append(cy)
            elif up == "Q":
                x1, y1, x2, y2 = a
                if rel:
                    x1, y1, x2, y2 = cx + x1, cy + y1, cx + x2, cy + y2
                for step in range(1, 13):
                    u = step / 12
                    xs.append((1 - u) ** 2 * cx + 2 * (1 - u) * u * x1 + u * u * x2)
                    ys.append((1 - u) ** 2 * cy + 2 * (1 - u) * u * y1 + u * u * y2)
                cx, cy = x2, y2
            elif up == "C":
                x1, y1, x2, y2, x3, y3 = a
                if rel:
                    x1, y1, x2, y2, x3, y3 = (cx + x1, cy + y1, cx + x2, cy + y2, cx + x3, cy + y3)
                for step in range(1, 13):
                    u = step / 12
                    xs.append((1 - u) ** 3 * cx + 3 * (1 - u) ** 2 * u * x1
                              + 3 * (1 - u) * u * u * x2 + u ** 3 * x3)
                    ys.append((1 - u) ** 3 * cy + 3 * (1 - u) ** 2 * u * y1
                              + 3 * (1 - u) * u * u * y2 + u ** 3 * y3)
                cx, cy = x3, y3
    return min(xs), min(ys), max(xs), max(ys)


def spin(dur, reverse=False):
    a, b = (360, 0) if reverse else (0, 360)
    return (
        f'<animateTransform attributeName="transform" type="rotate" '
        f'from="{a}" to="{b}" dur="{dur}s" repeatCount="indefinite"/>'
    )


def shape(key, fill, size, x, y, dur, reverse=False, opacity=None):
    """A decorative blob centred on (x, y), drawn `size` px across."""
    bx0, by0, bx1, by1 = shape_box(key)
    s = size / max(bx1 - bx0, by1 - by0)
    cx, cy = (bx0 + bx1) / 2, (by0 + by1) / 2
    fade = f' fill-opacity="{opacity:.2f}"' if opacity is not None else ""
    return (
        f'<g transform="translate({x} {y}) scale({s:.4f})"><g>{spin(dur, reverse)}'
        f'<path transform="translate({-cx:.1f} {-cy:.1f})" d="{SHAPES[key]}" '
        f'fill="{fill}"{fade}/></g></g>'
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
        f'<defs><clipPath id="card"><rect width="{BANNER_W}" height="{BANNER_H}" rx="40" ry="40"/></clipPath>'
        f'<path id="shapeA" d="{SHAPES["dfc063c2"]}"/><path id="shapeB" d="{SHAPES["deca4c7f"]}"/></defs>',
        '<g clip-path="url(#card)">',
        f'<rect width="{BANNER_W}" height="{BANNER_H}" fill="{BANNER_BG}"/>',
        f'<g transform="translate(985 45) scale(0.65)"><g>{spin(24)}'
        f'<use href="#shapeA" transform="translate(-160 -160)" fill="{BANNER_ACCENT}"/></g></g>',
        f'<g transform="translate(45 340) scale(0.62)"><g>{spin(30, reverse=True)}'
        f'<use href="#shapeB" transform="translate(-160 -160)" fill="{BANNER_SHAPE}"/></g></g>',
    ]

    body.append(line(t["banner_title"], BANNER_TITLE, 59.2, center=BANNER_W / 2, top=131.8)[0])
    body.append(line(t["banner_sub"], BANNER_SUB, 27.0, weight=600, center=BANNER_W / 2, top=207.4,
                     max_width=760)[0])
    body.append("</g>")

    write(f"banner{'.' + lang if lang != 'ru' else ''}.svg",
          svg(BANNER_W, BANNER_H, "\n".join(body), t["banner_alt"]))


# --------------------------------------------------------------------------- pills

def pill(text, filled=True):
    """40 px tall button, 24 px padding each side of the ink."""
    ink_left, cap, height = 24.2, 11.2, 40
    fill = PRIMARY if filled else SEC_CONT
    color = ON_PRIMARY if filled else ON_SEC_CONT
    markup, width, _ = line(text, color, cap, left=ink_left, top=14.1)
    total = round(width + 2 * ink_left)
    body = f'<rect x="0" y="0" width="{total}" height="{height}" rx="{height / 2:.0f}" fill="{fill}"/>{markup}'
    return svg(total, height, body, text)


def section_header(text, key, accent):
    """880 px pill: accent blob on the left, a faint one bleeding in on the right."""
    w, h = 880, 64
    body = (
        f'<defs><clipPath id="b"><rect width="{w}" height="{h}" rx="32"/></clipPath></defs>'
        f'<g clip-path="url(#b)">'
        f'<rect width="{w}" height="{h}" fill="{SURFACE_CONT}"/>'
        f'{shape(key, accent, 34 * 3.94, 840, 18, 40, opacity=0.10)}'
        f'{shape(key, accent, 34, 36, 32, 18, reverse=True)}'
        f'{line(text, "#E6E0E9", 20.1, left=71.2, top=21.0)[0]}'
        f"</g>"
    )
    return svg(w, h, body, text)


def shot_chip(text):
    """240 px wide caption under the README screenshot."""
    w, h, cap = 240, 34, 15.0
    body = (
        f'<rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" rx="12" '
        f'fill="{SURFACE_CONT}" stroke="{OUTLINE}" stroke-width="1"/>'
        f'{line(text, "#CAC4D0", cap, weight=600, center=w / 2, top=11.1)[0]}'
    )
    return svg(w, h, body, text)


def chip(text):
    """32 px nav chip that jumps to a section."""
    h, cap = 32, 10.4
    markup, width, _ = line(text, "#CAC4D0", cap, weight=600, left=16.9, top=10.7)
    total = round(width + 2 * 16.9)
    body = (
        f'<rect x="0.5" y="0.5" width="{total - 1}" height="{h - 1}" rx="8" '
        f'fill="{SURFACE_CONT}" stroke="{OUTLINE}" stroke-width="1"/>{markup}'
    )
    return svg(total, h, body, text)


# --------------------------------------------------------------------------- cards

CARD_W, CARD_H, CARD_GAP = 304, 192, 24
CARD_X = [i * (CARD_W + CARD_GAP) for i in range(3)]


def features(lang):
    t = CONTENT[lang]
    cards = []
    tints = [
        ("#4A4458", "#E8DEF8", "#CCC2DC", "dfc063c2", 198.4, PRIMARY, 0.20, 24, False),
        ("#4F378B", "#EADDFF", "#D9CCF7", "deca4c7f", 198.4, PRIMARY, 0.25, 30, True),
        ("#633B48", "#FFD8E4", "#F0C4D2", "5cb7e365", 172.8, TERTIARY, 0.22, 36, False),
    ]
    for i, ((title, lines), tint) in enumerate(zip(t["cards"], tints)):
        bg, title_fill, body_fill, key, size, accent, opacity, dur, reverse = tint
        x = CARD_X[i]
        card = [
            f'<defs><clipPath id="c{i}"><rect x="{x}" width="{CARD_W}" height="{CARD_H}" rx="28"/></clipPath></defs>',
            f'<g clip-path="url(#c{i})">',
            f'<rect x="{x}" width="{CARD_W}" height="{CARD_H}" fill="{bg}"/>',
            shape(key, accent, size, x + 290, 14, dur, reverse, opacity=opacity),
            line(title, title_fill, 25.2, left=x + 28.4, top=54.2, max_width=230)[0],
        ]
        for j, text in enumerate(lines):
            card.append(line(text, body_fill, 13.5, weight=400, left=x + 28.4,
                             top=100.3 + 24 * j, max_width=247.2)[0])
        card.append("</g>")
        cards.append("\n".join(card))

    write(f"features{'.' + lang if lang != 'ru' else ''}.svg",
          svg(CARD_W * 3 + CARD_GAP * 2, CARD_H, "\n".join(cards), t["features_alt"]))


# --------------------------------------------------------------------------- content

CONTENT = {
    "ru": {
        "banner_alt": "lepex — личный сайт: профиль и портфолио мини-инструментов",
        "banner_title": "lepex",
        "banner_sub": "профиль · портфолио · всячина",
        "buttons": {"site": "Открыть сайт"},
        "headers": {
            "about": "О проекте",
            "inside": "Что внутри",
            "screenshot": "Скриншот",
            "run": "Запуск локально",
            "thanks": "Благодарности",
            "license": "Лицензия",
        },
        "features_alt": "Три карточки: портфолио, всячина, без фреймворков",
        "cards": [
            ("Портфолио", ["Проверка VPN-подписок,", "генератор градиентного", "текста и image → MP4."]),
            ("Всячина", ["Релизы, PDF-справочники", "и другие понравившиеся", "штуки в одном хабе."]),
            ("Без фреймворков", ["HTML, CSS и ES-модули", "вручную; сетки 1 / 2 / 3", "колонки от 375 px."]),
        ],
        "caption": "Главная",
    },
    "en": {
        "banner_alt": "lepex — a personal site: a profile and a portfolio of small tools",
        "banner_title": "lepex",
        "banner_sub": "profile · portfolio · misc",
        "buttons": {"site": "Open the site"},
        "headers": {
            "about": "About",
            "inside": "What is inside",
            "screenshot": "Screenshot",
            "run": "Run locally",
            "thanks": "Thanks",
            "license": "License",
        },
        "features_alt": "Three cards: portfolio, misc, no frameworks",
        "cards": [
            ("Portfolio", ["VPN subscription checks,", "a gradient text generator,", "and image → MP4."]),
            ("Misc", ["Releases, PDF handbooks", "and other things I simply", "like, gathered in one hub."]),
            ("No frameworks", ["Hand-written HTML, CSS", "and ES modules; grids", "reflow to 1 / 2 / 3."]),
        ],
        "caption": "Home page",
    },
}

HEADERS = [
    ("about", "3c963680", PRIMARY),
    ("inside", "dd0b5db5", TERTIARY),
    ("screenshot", "8bcc60b2", SECONDARY),
    ("run", "ccac7225", TERTIARY),
    ("thanks", "5f785996", PRIMARY),
    ("license", "2be8b523", PRIMARY),
]

# nav chips under the buttons; the intro section is left out, as in the reference
CHIPS = ["inside", "screenshot", "run", "thanks", "license"]

MAX_TEXT_W = CARD_W - 2 * 28.4


def main():
    for lang in ("ru", "en"):
        suffix = "" if lang == "ru" else ".en"

        banner(lang)

        write(f"btn-site{suffix}.svg", pill(CONTENT[lang]["buttons"]["site"], filled=True))
        for key, shape_key, accent in HEADERS:
            write(f"h-{key}{suffix}.svg", section_header(CONTENT[lang]["headers"][key], shape_key, accent))
        for key in CHIPS:
            write(f"chip-{key}{suffix}.svg", chip(CONTENT[lang]["headers"][key]))
        features(lang)
        write(f"shot-home{suffix}.svg", shot_chip(CONTENT[lang]["caption"]))

    write("btn-github.svg", pill("GitHub", filled=False))

    # a too-wide line would silently stick out of its card — catch it here
    for lang in ("ru", "en"):
        for title, lines in CONTENT[lang]["cards"]:
            for text in lines:
                _, width, _ = line(text, "#000", 13.5, weight=400, center=0, top=0)
                if width > MAX_TEXT_W:
                    safe = text.encode("ascii", "replace").decode("ascii")
                    print(f"  ! {lang}: {width:.0f}px > {MAX_TEXT_W}px -- {safe!r}")


if __name__ == "__main__":
    main()
