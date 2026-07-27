let globalCassieData = [];
let searchFilter = "";
let sectionFilter = "";

const THEME_BACKGROUND_COLORS = {
    ursa: "#141218",
    brew: "#14110f",
    fura: "#121511",
    storm: "#13171a",
    invoker: "#0e0e0e",
    meepo: "#191113",
    bh: "#15130f",
    axe: "#1a1110"
};

function updateThemeColorMeta(themeName) {
    const meta = document.getElementById("theme-color-meta");
    if (meta && THEME_BACKGROUND_COLORS[themeName]) {
        meta.setAttribute("content", THEME_BACKGROUND_COLORS[themeName]);
    }
}

function initCassie() {
    const contentArea = document.getElementById("content-area");

    const savedSection = localStorage.getItem("sectionFilter");
    if (savedSection) sectionFilter = savedSection;

    const savedView = localStorage.getItem("viewMode") || "comfortable";
    document.querySelector(".cassie-app").setAttribute("data-view", savedView);
    const viewToggle = document.getElementById("viewToggle");
    if (viewToggle) {
        const icon = viewToggle.querySelector(".material-symbols-outlined");
        if (icon) {
            icon.textContent = savedView === "compact" ? "view_agenda" : "grid_view";
        }
    }

    const savedIndex = parseInt(localStorage.getItem('gifIndex') || '3', 10);
    const themeName = GIF_CONFIG.themes[savedIndex] || "storm";
    updateThemeColorMeta(themeName);

    document.addEventListener('gifThemeChanged', (e) => {
        updateThemeColorMeta(e.detail.theme);
    });

    fetchAndRender();
}

function fetchAndRender() {
    const contentArea = document.getElementById("content-area");

    const sources = ['data/cassie_standard.md', 'data/cassie_reglament.md'];
    Promise.all(sources.map(url => fetch(url).then(r => {
        if (!r.ok) throw new Error('Ошибка загрузки ' + url + ' (Статус: ' + r.status + ')');
        return r.text();
    })))
    .then(results => {
        globalCassieData = results.flatMap(text => parseMarkdown(text));
        buildSectionTabs();
        render();
        setupCassieListeners();
    })
    .catch(error => {
        contentArea.innerHTML =
            '<div style="color:var(--md-sys-color-error);text-align:center;padding:64px 0;font-size:0.938rem;">' + error.message + '</div>';
    });
}

function parseMarkdown(content) {
    const lines = content.split('\n');
    const items = [];

    let lastSection = "";
    let lastHeader = "";
    let currentCalloutType = "note";
    let lastDescription = "";

    for (let line of lines) {
        let trimmed = line.replace(/^>\s*/, "").trim();

        if (trimmed.startsWith("```dataviewjs")) {
            break;
        }

        if (trimmed.startsWith("## ") && !trimmed.startsWith("###")) {
            lastSection = trimmed.replace(/^##\s+/, "");
            continue;
        }

        if (trimmed.startsWith("###")) {
            lastHeader = trimmed.replace(/^#+\s+/, "");
        }

        const calloutMatch = trimmed.match(/^\[!([a-zA-Z0-9_-]+)\]/i);
        if (calloutMatch) {
            currentCalloutType = calloutMatch[1];
        }

        if (trimmed.startsWith("**") && !trimmed.includes("cassieadvanced")) {
            lastDescription = trimmed.replace(/\*\*/g, "").trim();
        }

        if (trimmed.includes("cassieadvanced")) {
            let cleanCommand = trimmed.replace(/```/g, "").trim();
            let isStrict = cleanCommand.includes("<split>") && cleanCommand.includes("<size=25>");

            items.push({
                section: lastSection,
                category: lastHeader || "Общее",
                callout: currentCalloutType,
                title: lastDescription || "Команда CASSIE",
                command: cleanCommand,
                strict: isStrict
            });

            lastDescription = "";
        }
    }
    return items;
}

function parseUnityRichText(command, strict) {
    const cmdMatch = command.match(/.*?cassieadvanced\s+custom\s+(?:true|false)\s+(\d+)\s+(.*)/i);
    let cleanText = "";

    if (cmdMatch) {
        const wordCount = parseInt(cmdMatch[1], 10);
        const payload = cmdMatch[2];
        const words = payload.split(/\s+/);
        cleanText = words.slice(0, wordCount).join(" ");
        cleanText = cleanText.replace(/<size=0>$/i, "");
        cleanText = cleanText.replace(/<size=0>.*?<\/size>/gi, "");
        cleanText = cleanText.replace(/(?:<br>\s*)+<br>/gi, "<br>");
        cleanText = cleanText.trim();
    } else {
        cleanText = command.replace(/.*?cassieadvanced\s+custom\s+(?:true|false)\s+\d+\s+/, "");
        const audioStart = cleanText.match(/(?:(?:\s+pitch_)|(?:\s+jam_)|(?:\s+\$)|(?:\s+[a-z]{2,}\s+)|(?:\.\w\d)|(?:<size=0>))/);
        if (audioStart) {
            cleanText = cleanText.substring(0, audioStart.index);
        }
    }

    if (strict) {
        let blocks = cleanText.split(/<split>/gi).map(b => b.trim()).filter(b => b);
        blocks = blocks.filter(b => !/^<size=0>/i.test(b));
        let htmlPreview = blocks.map((block, i) => {
            let html = block
                .replace(/<color=(#[a-fA-F0-9]+|orange|red|yellow|green|white|grey|blue|purple)>/gi, '<span style="color:$1;">')
                .replace(/<\/color>/gi, '</span>')
                .replace(/<size=(\d+)>/gi, (m, p1) => '<span style="font-size:' + Math.min(parseInt(p1), 18) + 'px;line-height:1.4;">')
                .replace(/<\/size>/gi, '</span>')
                .replace(/<B>/gi, '<b>').replace(/<\/B>/gi, '</b>')
                .replace(/<I>/gi, '<i>').replace(/<\/I>/gi, '</i>')
                .replace(/<br>/gi, '<br>')
                .trim();
            if (!html) return "";
            return '<div class="md3-card__strict-block">' + html + '</div>';
        }).join("");
        return htmlPreview;
    }

    let htmlPreview = cleanText
        .replace(/<align=center>/gi, '<div style="text-align:center;">')
        .replace(/<\/align>/gi, '</div>')
        .replace(/<color=(#[a-fA-F0-9]+|orange|red|yellow|green|white|grey|blue|purple)>/gi, '<span style="color:$1;">')
        .replace(/<\/color>/gi, '</span>')
        .replace(/<size=(\d+)>/gi, (m, p1) => '<span style="font-size:' + Math.min(parseInt(p1), 18) + 'px;line-height:1.4;">')
        .replace(/<\/size>/gi, '</span>')
        .replace(/<B>/gi, '<b>').replace(/<\/B>/gi, '</b>')
        .replace(/<I>/gi, '<i>').replace(/<\/I>/gi, '</i>')
        .replace(/<br>/gi, '<br>')
        .replace(/<split>/gi, '<hr>');

    return htmlPreview;
}

function normalize(text) {
    return text.toLowerCase().replace(/ё/g, 'е');
}

function copyText(text, onSuccess) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
    } else {
        fallbackCopy(text, onSuccess);
    }
}

function fallbackCopy(text, onSuccess) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); onSuccess(); } catch (e) {}
    document.body.removeChild(ta);
}

function buildSectionTabs() {
    const container = document.getElementById("sectionTabs");
    container.innerHTML = "";

    const sections = [...new Set(globalCassieData.map(i => i.section).filter(Boolean))];

    let activeFound = false;

    sections.forEach((section, i) => {
        const btn = document.createElement("button");
        btn.className = "section-tab";
        if (!sectionFilter && i === 0) sectionFilter = section;
        if (section === sectionFilter) {
            btn.classList.add("active");
            activeFound = true;
        }
        const label = section.replace(/^[^\s]+\s/, "");
        btn.textContent = label;
        if (i > 0) {
            const badge = document.createElement("span");
            badge.className = "tab-badge";
            badge.textContent = "NEW";
            btn.appendChild(badge);
        }
        btn.addEventListener("click", () => {
            sectionFilter = section;
            localStorage.setItem("sectionFilter", section);
            document.querySelectorAll(".section-tab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            render();
        });
        container.appendChild(btn);
    });

    if (!activeFound && sections.length > 0) {
        sectionFilter = sections[0];
        localStorage.setItem("sectionFilter", sections[0]);
        container.firstChild.classList.add("active");
    }
}

function render() {
    const contentArea = document.getElementById("content-area");
    contentArea.innerHTML = "";

    const nf = normalize(searchFilter);
    const grouped = {};

    globalCassieData.forEach(item => {
        if (sectionFilter && item.section !== sectionFilter) return;
        if (searchFilter) {
            const matchTitle = normalize(item.title).includes(nf);
            const matchCommand = normalize(item.command).includes(nf);
            if (!matchTitle && !matchCommand) return;
        }

        const key = item.section || "Стандартные";
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(item);
    });

    if (Object.keys(grouped).length === 0) {
        contentArea.innerHTML = '<div class="not-found">Ничего не найдено</div>';
        return;
    }

    for (const [section, items] of Object.entries(grouped)) {
        const sectionEl = document.createElement("div");
        sectionEl.className = "md3-section";

        const sectionHeader = document.createElement("h2");
        sectionHeader.className = "md3-section-header";
        const isNew = !section.startsWith("📟 Стандартные");
        if (isNew) {
            const span = document.createElement("span");
            span.textContent = section;
            sectionHeader.appendChild(span);
            const badge = document.createElement("span");
            badge.className = "tab-badge section-badge";
            badge.textContent = "NEW";
            sectionHeader.appendChild(badge);
        } else {
            sectionHeader.textContent = section;
        }
        sectionEl.appendChild(sectionHeader);

        const innerGroup = {};

        items.forEach(item => {
            if (!innerGroup[item.category]) {
                innerGroup[item.category] = [];
            }
            innerGroup[item.category].push(item);
        });

        for (const [category, catItems] of Object.entries(innerGroup)) {
            const catHeader = document.createElement("div");
            catHeader.className = "category-header";

            const catText = document.createElement("span");
            catText.className = "category-text";
            catText.textContent = category;
            catHeader.appendChild(catText);

            sectionEl.appendChild(catHeader);

            catItems.forEach(item => {
                const card = document.createElement("div");
                card.className = "md3-card";
                if (item.strict) {
                    card.classList.add("card--strict");
                }
                card.setAttribute("data-callout", item.callout);

                const title = document.createElement("h3");
                title.className = "md3-card__title";
                title.textContent = item.title;
                card.appendChild(title);

                const preview = document.createElement("div");
                preview.className = "md3-card__preview";
                preview.innerHTML = parseUnityRichText(item.command, item.strict);
                card.appendChild(preview);

                const cmdSection = document.createElement("div");
                cmdSection.className = "md3-card__command";

                const cmdCode = document.createElement("code");
                cmdCode.className = "md3-card__command-code";
                cmdCode.textContent = item.command;
                cmdSection.appendChild(cmdCode);

                const copyBtn = document.createElement("button");
                copyBtn.className = "md3-btn--copy";

                const copyIconSpan = document.createElement("span");
                copyIconSpan.className = "material-symbols-outlined";
                copyIconSpan.textContent = "content_copy";

                const copyLabel = document.createTextNode(currentLanguage === 'en' ? 'Copy' : 'Копировать');
                copyBtn.appendChild(copyIconSpan);
                copyBtn.appendChild(copyLabel);

                copyBtn.addEventListener("click", () => {
                    copyText(item.command, () => {
                        copyBtn.classList.add("copied");
                        copyIconSpan.textContent = "done";
                        copyBtn.lastChild.textContent = currentLanguage === 'en' ? 'Copied' : 'Скопировано';
                        setTimeout(() => {
                            copyBtn.classList.remove("copied");
                            copyIconSpan.textContent = "content_copy";
                            copyBtn.lastChild.textContent = "Копировать";
                        }, 2000);
                        fetch('/api/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ command: item.command, section: item.section, category: item.category }),
                        }).catch(() => {});
                    });
                });

                cmdSection.appendChild(copyBtn);
                card.appendChild(cmdSection);
                sectionEl.appendChild(card);
            });
        }

        contentArea.appendChild(sectionEl);
    }
}

function setupCassieListeners() {
    document.getElementById("searchInput").addEventListener("input", (e) => {
        searchFilter = e.target.value;
        render();
    });

    const viewToggle = document.getElementById("viewToggle");
    if (viewToggle) {
        viewToggle.addEventListener("click", () => {
            const app = document.querySelector(".cassie-app");
            const icon = viewToggle.querySelector(".material-symbols-outlined");
            const current = app.getAttribute("data-view");
            const next = current === "compact" ? "comfortable" : "compact";

            app.setAttribute("data-view", next);
            localStorage.setItem("viewMode", next);

            if (icon) {
                icon.textContent = next === "compact" ? "view_agenda" : "grid_view";
            }
        });
    }

    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            setTimeout(() => {
                document.querySelectorAll('.md3-btn--copy').forEach(btn => {
                    const isCopied = btn.classList.contains('copied');
                    btn.lastChild.textContent = currentLanguage === 'en'
                        ? (isCopied ? 'Copied' : 'Copy')
                        : (isCopied ? 'Скопировано' : 'Копировать');
                });
            }, 0);
        });
    }

    const origClick = initializeGifTheme;
    const gifElement = document.getElementById('clickable-gif');
    if (gifElement) {
        gifElement.addEventListener('click', () => {
            setTimeout(() => {
                const idx = parseInt(localStorage.getItem('gifIndex') || '3', 10);
                const themeName = GIF_CONFIG.themes[idx] || "storm";
                updateThemeColorMeta(themeName);

                const event = new CustomEvent('gifThemeChanged', { detail: { theme: themeName } });
                document.dispatchEvent(event);
            }, 200);
        });
    }
}
