let hubProjects = [];

function layoutHubGrid() {
    const container = document.getElementById('hub-container');
    if (!container) return;
    const n = hubProjects.length;
    const w = window.innerWidth;
    let cols;
    if (w >= 1200) cols = Math.min(4, n);
    else if (w >= 768) cols = Math.min(2, n);
    else cols = 1;
    container.style.setProperty('--hub-cols', cols);
}

let layoutTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(layoutHubGrid, 150);
});

function renderHubCards() {
    const container = document.getElementById('hub-container');
    container.innerHTML = hubProjects.map(p => {
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
    layoutHubGrid();
}

function updateHubLanguage() {
    document.querySelectorAll('.hub-card').forEach((card, i) => {
        const p = hubProjects[i];
        if (!p) return;
        card.querySelector('.hub-card-title').textContent = currentLanguage === 'ru' ? p.titleRu : p.title;
        card.querySelector('.hub-card-desc').textContent = currentLanguage === 'ru' ? p.descRu : p.desc;
    });
}

async function loadHub() {
    try {
        const res = await fetch('/portfolio/data/projects.json');
        hubProjects = await res.json();
        renderHubCards();
    } catch(e) {
        document.getElementById('hub-container').innerHTML = '<p style="color:var(--md-sys-color-error)">' + (currentLanguage === 'ru' ? 'Не удалось загрузить проекты' : 'Failed to load projects') + '</p>';
    }
}

document.getElementById('year').textContent = new Date().getFullYear();
document.addEventListener('languagechange', function() { if (hubProjects.length) updateHubLanguage(); });
document.addEventListener('DOMContentLoaded', () => {
    initializeGifTheme();
    loadHub();
});
initializeLanguage();
initializeThemeToggle();
