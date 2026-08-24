// Global search modal (Cmd+K / Ctrl+K)
let searchModal = null;
let searchInput = null;
let searchResults = null;
let searchIndex = [];
let selectedIndex = 0;

function initializeSearch() {
    createSearchModal();
    setupKeyboardShortcut();
    buildSearchIndex();
}

function createSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.id = 'searchModal';
    modal.innerHTML = `
        <div class="search-modal-backdrop"></div>
        <div class="search-modal-content">
            <div class="search-input-container">
                <span class="material-symbols-outlined">search</span>
                <input type="text" id="searchInput" placeholder="Search projects, commands, subtitles..." autocomplete="off">
                <kbd class="search-kbd">ESC</kbd>
            </div>
            <div class="search-results" id="searchResults"></div>
        </div>
    `;
    document.body.appendChild(modal);

    searchModal = modal;
    searchInput = modal.querySelector('#searchInput');
    searchResults = modal.querySelector('#searchResults');

    modal.querySelector('.search-modal-backdrop').addEventListener('click', closeSearch);
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', handleSearchKeydown);
}

function setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
    });
}

function openSearch() {
    searchModal.classList.add('active');
    searchInput.focus();
    selectedIndex = 0;
}

function closeSearch() {
    searchModal.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
}

function buildSearchIndex() {
    searchIndex = [
        // Projects
        { type: 'project', title: 'CASSIE Command Browser', url: '/portfolio/cassie', keywords: 'cassie command scpsl foxgame module' },
        { type: 'project', title: 'Russian Subtitles', url: '/portfolio/subtitles', keywords: 'subtitles translation russian english' },
        { type: 'project', title: 'Gradient Text Generator', url: '/portfolio/gradient-text', keywords: 'gradient text css animation color' },
        { type: 'project', title: 'Img2TgGif Converter', url: '/portfolio/img2tggif', keywords: 'image telegram gif converter mp4' },

        // Common CASSIE commands (sample)
        { type: 'command', title: '.g7', url: '/portfolio/cassie#g7', keywords: 'cassie command module g7 scpsl' },
        { type: 'command', title: 'PITCH', url: '/portfolio/cassie#pitch', keywords: 'cassie pitch voice tone' },
        { type: 'command', title: 'JAM', url: '/portfolio/cassie#jam', keywords: 'cassie jam glitch effect' },

        // Subtitles (sample)
        { type: 'subtitle', title: 'PxAY OFF! - ANIMATED FILM', url: 'https://www.youtube.com/watch?v=IE0kvIbVmwk', keywords: 'pxay animation subtitles' },
        { type: 'subtitle', title: 'Undertale Yellow Animation', url: 'https://www.youtube.com/watch?v=iznGnD1dr-4', keywords: 'undertale yellow asgore animation' },
        { type: 'subtitle', title: 'When OneDrive Ruins Your Day', url: 'https://www.youtube.com/watch?v=xzbPJ9_CoZ8', keywords: 'onedrive james lee animation' },
    ];
}

function handleSearchInput(e) {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        searchResults.innerHTML = '';
        return;
    }

    const results = fuzzySearch(query);
    displayResults(results);
}

function fuzzySearch(query) {
    return searchIndex
        .map(item => {
            const titleMatch = item.title.toLowerCase().includes(query);
            const keywordMatch = item.keywords.toLowerCase().includes(query);
            const score = titleMatch ? 100 : (keywordMatch ? 50 : 0);
            return { ...item, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
}

function displayResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
        return;
    }

    selectedIndex = 0;
    searchResults.innerHTML = results.map((result, index) => `
        <a href="${result.url}" class="search-result-item ${index === 0 ? 'selected' : ''}" data-index="${index}">
            <span class="search-result-icon material-symbols-outlined">${getIconForType(result.type)}</span>
            <div class="search-result-content">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-type">${result.type}</div>
            </div>
        </a>
    `).join('');
}

function getIconForType(type) {
    const icons = {
        project: 'folder',
        command: 'code',
        subtitle: 'subtitles'
    };
    return icons[type] || 'search';
}

function handleSearchKeydown(e) {
    const items = searchResults.querySelectorAll('.search-result-item');

    if (e.key === 'Escape') {
        closeSearch();
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection(items);
    } else if (e.key === 'Enter' && items[selectedIndex]) {
        e.preventDefault();
        items[selectedIndex].click();
    }
}

function updateSelection(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
    });
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
}
