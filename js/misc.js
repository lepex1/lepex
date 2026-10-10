let miscItems = [];

function layoutMiscGrid() {
    const container = document.getElementById('hub-container');
    if (!container) return;
    const n = miscItems.length;
    const w = window.innerWidth;
    let cols;
    if (w >= 1200) cols = Math.min(4, n);
    else if (w >= 768) cols = Math.min(2, n);
    else cols = 1;
    container.style.setProperty('--hub-cols', cols);
}

let miscLayoutTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(miscLayoutTimer);
    miscLayoutTimer = setTimeout(layoutMiscGrid, 150);
});

function renderMiscCards() {
    const container = document.getElementById('hub-container');
    container.innerHTML = miscItems.map(p => {
        const title = currentLanguage === 'ru' ? p.titleRu : p.title;
        const desc = currentLanguage === 'ru' ? p.descRu : p.desc;
        return `
            <a href="${p.link}" class="hub-card">
                <div class="hub-card-icon" style="background:${p.color}">
                    <span class="material-symbols-outlined">${p.icon}</span>
                </div>
                <div class="hub-card-title">${title}</div>
                <div class="hub-card-desc">${desc}</div>
                <span class="material-symbols-outlined hub-card-arrow">arrow_outward</span>
            </a>
        `;
    }).join('');
    layoutMiscGrid();
}

function updateMiscLanguage() {
    document.querySelectorAll('.hub-card').forEach((card, i) => {
        const p = miscItems[i];
        if (!p) return;
        card.querySelector('.hub-card-title').textContent = currentLanguage === 'ru' ? p.titleRu : p.title;
        card.querySelector('.hub-card-desc').textContent = currentLanguage === 'ru' ? p.descRu : p.desc;
    });
}

async function loadMisc() {
    try {
        const res = await fetch('/portfolio/misc/data/misc.json');
        miscItems = await res.json();
        renderMiscCards();
    } catch(e) {
        document.getElementById('hub-container').innerHTML = '<p style="color:var(--md-sys-color-error)">' + (currentLanguage === 'ru' ? 'Не удалось загрузить всячину' : 'Failed to load misc stuff') + '</p>';
    }
}

document.getElementById('year').textContent = new Date().getFullYear();
document.addEventListener('languagechange', function() { if (miscItems.length) updateMiscLanguage(); });
document.addEventListener('DOMContentLoaded', () => {
    initializeGifTheme();
    loadMisc();
});
initializeLanguage();
initializeThemeToggle();
