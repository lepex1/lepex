/* Fastfetch card on the homepage: the owner's own terminal output, kept as data so the
   three machines share one layout. */
const FASTFETCH_DEVICES = [
    {
        user: 'user',
        host: 'HOME-PC',
        logo: [
            "                                ..,",
            "                    ....,,:;+ccllll",
            "      ...,,+:;  cllllllllllllllllll",
            ",cclllllllllll  lllllllllllllllllll",
            "llllllllllllll  lllllllllllllllllll",
            "llllllllllllll  lllllllllllllllllll",
            "llllllllllllll  lllllllllllllllllll",
            "llllllllllllll  lllllllllllllllllll",
            "llllllllllllll  lllllllllllllllllll",
            "                                   ",
            "llllllllllllll  lllllllllllllllllll",
            "llllllllllllll  lllllllllllllllllll",
            "llllllllllllll  lllllllllllllllllll",
            "llllllllllllll  lllllllllllllllllll",
            "llllllllllllll  lllllllllllllllllll",
            "`'ccllllllllll  lllllllllllllllllll",
            "       `' \\*::  :ccllllllllllllllll",
            "                       ````''*::cll",
            "                                 ``"
        ].join('\n'),
        lines: [
            { k: 'OS', v: 'Windows 10 Pro (22H2) x86_64' },
            { k: 'Host', v: 'X79G' },
            { k: 'Kernel', v: 'WIN32_NT 10.0.19045.5247'},
            { k: 'Uptime', v: '7 hours, 4 mins' },
            { k: 'Packages', v: '4 (scoop), 15 (choco)'},
            { k: 'Shell', v: 'Windows PowerShell 5.1.19041.5247'},
            { k: 'Display (SKG2722)', v: '2560x1440 in 27", 165 Hz [External] *' },
            { k: 'Display (BENQ E2220HD)', v: '1920x1080 in 22", 60 Hz [External]' },
            { k: 'WM', v: 'Desktop Window Manager 10.0.19041.4355'},
            { k: 'WM Theme', v: 'Custom - #295ACC (System: Dark, Apps: Dark)'},
            { k: 'Theme', v: 'Fluent'},
            { k: 'Font', v: 'Segoe UI (12pt) [Caption / Menu / Message / Status]'},
            { k: 'Cursor', v: 'Moga-White-Free (32px)'},
            { k: 'Terminal', v: 'Windows Terminal 1.23.13503.0'},
            { k: 'Terminal Font', v: 'Cascadia Mono (12pt)'},
            { k: 'CPU', v: 'Intel(R) Xeon(R) E5-2670 v2 (20) @ 4.00 GHz' },
            { k: 'GPU', v: 'NVIDIA GeForce RTX 3070 Ti (7.83 GiB) [Discrete]' },
            { k: 'Memory', v: '16.62 GiB / 31.93 GiB', pct: '52%', level: 'ok' },
            { k: 'Swap', v: '224.79 MiB / 7.90 GiB', pct: '3%', level: 'ok'},
            { k: 'Disk (C:\\)', v: '217.88 GiB / 223.52 GiB', pct: '97%', level: 'crit', tail: '- NTFS' },
            { k: 'Disk (D:\\)', v: '75.88 GiB / 200.00 GiB', pct: '38%', level: 'ok', tail: '- NTFS' },
            { k: 'Disk (E:\\)', v: '701.72 GiB / 731.51 GiB', pct: '96%', level: 'crit', tail: '- NTFS'},
            { k: 'Disk (H:\\)', v: '238.61 GiB / 298.08 GiB', pct: '80%', level: 'warn', tail: '- exFAT'},
            { k: 'Locale', v: 'en-US'}
        ]
    },
    {
        user: 'u0_a453',
        host: 'localhost',
        logo: [
            "         -o          o-",
            "          +hydNNNNdyh+",
            "        +mMMMMMMMMMMMMm+",
            "      `dMMm:NMMMMMMN:mMMd`",
            "      hMMMMMMMMMMMMMMMMMMh",
            "  ..  yyyyyyyyyyyyyyyyyyyy  ..",
            ".mMMm`MMMMMMMMMMMMMMMMMMMM`mMMm.",
            ":MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:",
            ":MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:",
            ":MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:",
            ":MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:",
            "-MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM-",
            " +yy+ MMMMMMMMMMMMMMMMMMMM +yy+",
            "      mMMMMMMMMMMMMMMMMMMm",
            "      `/++MMMMh++hMMMM++/`",
            "          MMMMo  oMMMM",
            "          MMMMo  oMMMM",
            "          oNMm-  -mMNs"
        ].join('\n'),
        lines: [
            { k: 'OS', v: 'Android REL 16 aarch64' },
            { k: 'Host', v: 'samsung SM-S928B' },
            { k: 'Kernel', v: 'Linux 6.1.145-android141'},
            { k: 'Uptime', v: '2 days, 9 hours, 38 mins' },
            { k: 'Packages', v: '200 (dpkg)'},
            { k: 'Shell', v: 'bash 5.3.9'},
            { k: 'DE', v: 'BP4A.251205.006.S928BXXS6DZ1'},
            { k: 'WM', v: 'WindowManager (SurfaceFlinger)'},
            { k: 'Terminal', v: 'Termux googleplay.2029'},
            { k: 'Terminal Font', v: 'monospace'},
            { k: 'CPU', v: 'Qualcomm Snapdragon 8 Gen 3' },
            { k: 'GPU', v: 'Qualcomm Adreno (TM) 750' },
            { k: 'Memory', v: '8.71 GiB / 10.82 GiB', pct: '81%', level: 'warn' },
            { k: 'Swap', v: '6.64 GiB / 12.00 GiB', pct: '55%', level: 'ok' },
            { k: 'Disk (/)', v: '8.17 GiB / 8.17 GiB', pct: '100%', level: 'crit' },
            { k: 'Locale', v: 'en_US.UTF-8'}
        ]
    },
    {
        user: 'u0_a1453',
        host: 'localhost',
        logo: [
            "         -o          o-",
            "          +hydNNNNdyh+",
            "        +mMMMMMMMMMMMMm+",
            "      `dMMm:NMMMMMMN:mMMd`",
            "      hMMMMMMMMMMMMMMMMMMh",
            "  ..  yyyyyyyyyyyyyyyyyyyy  ..",
            ".mMMm`MMMMMMMMMMMMMMMMMMMM`mMMm.",
            ":MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:",
            ":MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:",
            ":MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:",
            ":MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM:",
            "-MMMM-MMMMMMMMMMMMMMMMMMMM-MMMM-",
            " +yy+ MMMMMMMMMMMMMMMMMMMM +yy+",
            "      mMMMMMMMMMMMMMMMMMMm",
            "      `/++MMMMh++hMMMM++/`",
            "          MMMMo  oMMMM",
            "          MMMMo  oMMMM",
            "          oNMm-  -mMNs"
        ].join('\n'),
        lines: [
            { k: 'OS', v: 'Android Snow Cone 12 aarch64' },
            { k: 'Host', v: 'Xiaomi POCO X3 Pro (M2102J20SG)' },
            { k: 'Kernel', v: 'Linux 4.14.180-perf-g5d6f377'},
            { k: 'Uptime', v: '7 mins' },
            { k: 'Packages', v: '111 (dpkg)'},
            { k: 'Shell', v: 'bash 5.2.37'},
            { k: 'DE', v: 'SKQ1.211006.001 test-keys'},
            { k: 'WM', v: 'WindowManager (SurfaceFlinger)'},
            { k: 'Terminal', v: 'Termux 0.118.3'},
            { k: 'Terminal Font', v: 'monospace'},
            { k: 'CPU', v: 'SM8150 (1+3+4) @ 2.96 GHz' },
            { k: 'GPU', v: 'Qualcomm Adreno (TM) 640 [Integrated]' },
            { k: 'Memory', v: '3.11 GiB / 5.37 GiB', pct: '58%', level: 'ok' },
            { k: 'Swap', v: '690.33 MiB / 4.00 GiB', pct: '17%', level: 'ok' },
            { k: 'Disk (/)', v: '3.13 GiB / 3.14 GiB', pct: '100%', level: 'crit', tail: '- ext4 [Read-only]' },
            { k: 'Disk (/storage/emulated)', v: '44.73 GiB / 107.08 GiB', pct: '42%', level: 'ok', tail: '- fuse' },
            { k: 'Locale', v: 'en_US.UTF-8'}
        ]
    }
];

function initializeFastfetch() {
    const terminal = document.querySelector('.md3-fastfetch .ff-terminal');
    if (!terminal) return;

    const logoEl = terminal.querySelector('.ff-logo');
    const detailsEl = terminal.querySelector('.ff-details');
    const hostEl = terminal.querySelector('.ff-host');
    const linesEl = terminal.querySelector('.ff-lines');
    const tabs = Array.from(document.querySelectorAll('.ff-tab'));

    // The logo and the specs are one text flow for the browser, so a drag across the gap
    // copies both. Remember the last single-column range and roll back to it as soon as a
    // selection starts spanning the columns.
    let lastRange = null;
    let lastBlock = null;
    let restoring = false;

    const columnOf = (node) => (logoEl.contains(node) ? logoEl : detailsEl.contains(node) ? detailsEl : null);

    document.addEventListener('selectionchange', () => {
        if (restoring) return;
        const sel = document.getSelection();
        if (!sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        if (!terminal.contains(range.commonAncestorContainer)) return;

        if (!(range.intersectsNode(logoEl) && range.intersectsNode(detailsEl))) {
            lastRange = range.cloneRange();
            lastBlock = columnOf(range.startContainer);
            return;
        }

        const anchorBlock = columnOf(sel.anchorNode);
        restoring = true;
        try {
            if (lastRange && anchorBlock && anchorBlock === lastBlock) {
                sel.removeAllRanges();
                sel.addRange(lastRange);
            } else if (anchorBlock) {
                sel.selectAllChildren(anchorBlock);
            }
        } finally {
            restoring = false;
        }
    });

    const span = (className, text) => {
        const el = document.createElement('span');
        el.className = className;
        el.textContent = text;
        return el;
    };

    const render = (index) => {
        const device = FASTFETCH_DEVICES[index];

        lastRange = null;
        lastBlock = null;
        logoEl.textContent = device.logo;

        const sep = document.createElement('div');
        sep.className = 'ff-sep';
        sep.textContent = '-'.repeat(device.user.length + device.host.length + 1);
        hostEl.replaceChildren(span('ff-accent', device.user), '@', span('ff-accent', device.host), sep);

        const rows = device.lines.map((line) => {
            const row = document.createElement('div');
            row.className = 'ff-line';
            row.append(span('ff-k', line.k + ':'), ' ' + line.v);
            if (line.pct) row.append(' ', span('ff-pct ff-' + line.level, '(' + line.pct + ')'));
            if (line.tail) row.append(' ' + line.tail);
            return row;
        });
        linesEl.replaceChildren(...rows);

        tabs.forEach((tab, i) => {
            const active = i === index;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-pressed', String(active));
        });
    };

    tabs.forEach((tab, i) => tab.addEventListener('click', () => render(i)));

    render(0);
}
