# Third-party notices

Код сайта — MIT (см. [LICENSE](LICENSE)). Ниже всё, что написано не мной, и на каких условиях оно здесь лежит.
This list covers everything in the repository that is not mine and the terms it is used under.

## Библиотеки и сборка / Libraries and tooling

| Компонент | Лицензия | Где |
|---|---|---|
| [Vite](https://vite.dev/) | MIT | сборка |
| [vite-plugin-static-copy](https://github.com/sapphi-red/vite-plugin-static-copy) | MIT | сборка |
| [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) (ffmpeg.wasm) | MIT (обёртка) | `portfolio/img2tggif/vendor/` |
| FFmpeg / `ffmpeg-core.wasm` | LGPL 2.1+ (сборка может быть GPL) | `portfolio/img2tggif/vendor/ffmpeg-core.wasm` |

`ffmpeg-core.wasm` — сторонний бинарник, собранный проектом ffmpeg.wasm. Исходники FFmpeg: <https://ffmpeg.org/download.html>.

## Шрифты и иконки / Fonts and icons

| Компонент | Лицензия | Где |
|---|---|---|
| [Satoshi](https://www.fontshare.com/fonts/satoshi) (Indian Type Foundry) | бесплатная лицензия для личного использования | `fonts/satoshi.woff2` |
| [Material Symbols](https://fonts.google.com/icons) (Google) | Apache License 2.0 | подключается с Google Fonts, в репозитории не лежит |

Satoshi используется только для этого личного сайта. Для коммерческого проекта нужна отдельная лицензия у Indian Type Foundry.

## Чужой контент / Third-party content

Всё перечисленное — не мои материалы, права остаются у авторов. Файлы лежат в репозитории как личная подборка; по запросу правообладателя будут убраны.

| Материал | Права | Где |
|---|---|---|
| Emesis Blue (Fortress Films) и переводы субтитров к нему | фильм и исходные субтитры — у авторов фильма; переводы — у переводчиков, чьи имена указаны в файлах | `portfolio/misc/emesis-blue/subs/` |
| «Справочник по тактической медицине» (2022), «Методические рекомендации по лечению боевой хирургической травмы» (2022) | у составителей и издателей; копии взяты из открытых источников (`mos-medsestra.ru`, `vmeda.mil.ru`) | `portfolio/misc/tactical-medicine/pdf/` |
| Превью и постеры к работам | у авторов видео и переводчиков | `assets/previews/`, `portfolio/misc/emesis-blue/img/` |
| Превью-гифки тем, иконки игр и предметов | у Valve (Dota 2), Northwood Studios (SCP: SL) | `assets/previews/gif-themes/` |

## Внешние сервисы / External services

| Сервис | Что даёт | Условия |
|---|---|---|
| [Lanyard](https://api.lanyard.rest/) | статус Discord на главной | публичный API, данные не хранятся в репозитории |
| [GitHub API](https://docs.github.com/rest) | данные профиля на главной | публичный API |
| [Vercel](https://vercel.com/) | хостинг | — |
| [shields.io](https://shields.io/) | бейджи в README | — |

## Оформление / Design

Цветовые схемы, типографика и хедер вдохновлены [Dota2PornFxWeb](https://github.com/h6rd/Dota2PornFxWeb) от h6rd и Material Design 3. Код оттуда не копировался.

Декоративные фигуры в SVG-плашках README (`scripts/badge_shapes.py`) взяты из README-ассетов того же проекта — это часть того же визуального языка. Текст, вёрстка и сами плашки собраны в `scripts/gen-badges.py`.

Сайт не аффилирован с SCP: Secret Laboratory, Northwood Studios, FoxGame, Valve, New Blood Interactive, Fortress Films и Indian Type Foundry.
