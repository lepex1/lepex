// ==========================================================================
// GLOBAL STATE & INITIALIZATION
// ==========================================================================

let currentLanguage = 'ru';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setTimeout(() => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }, 100);

    initializeLanguage();
    initializeGifTheme();
    initializeScrollAndLayout();
    initializeUSDT();
    loadPortfolio(); // Запускаем динамический рендеринг

    console.log('✨ MD3E App Initialized');
}

// ==========================================================================
// LANGUAGE SYSTEM (PRESERVING DECAP DATA-LANG COMPATIBILITY)
// ==========================================================================

function initializeLanguage() {
    const russianLangs = ['ru', 'kk', 'be', 'uk'];
    const userLang = navigator.language.split('-')[0];
    currentLanguage = russianLangs.includes(userLang) ? 'ru' : 'en';

    document.querySelectorAll('[data-lang-ru][data-lang-en]').forEach(element => {
        const ruContent = element.getAttribute('data-lang-ru');
        const enContent = element.getAttribute('data-lang-en');

        element.innerHTML = '';
        element.removeAttribute('data-lang-ru');
        element.removeAttribute('data-lang-en');
        element.classList.add('i18n-container');

        const ruSpan = document.createElement('span');
        ruSpan.className = 'lang-ru';
        ruSpan.innerHTML = ruContent;

        const enSpan = document.createElement('span');
        enSpan.className = 'lang-en';
        enSpan.innerHTML = enContent;

        element.appendChild(ruSpan);
        element.appendChild(enSpan);
    });

    const langToggle = document.getElementById('lang-toggle');
    switchLanguage(currentLanguage);

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
            switchLanguage(currentLanguage);
        });
    }
}

function switchLanguage(lang) {
    currentLanguage = lang;

    document.querySelectorAll('.i18n-container').forEach(container => {
        container.querySelectorAll('.lang-ru, .lang-en').forEach(el => {
            el.classList.toggle('active', el.classList.contains('lang-' + lang));
        });
    });

    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        const textNode = langToggle.querySelector('.lang-text');
        if (textNode) {
            textNode.textContent = lang === 'ru' ? 'EN' : 'RU';
        } else {
            langToggle.textContent = lang === 'ru' ? 'EN' : 'RU';
        }
    }
}

// ==========================================================================
// GIF THEME SWITCHER (COLOR SYSTEM FROM GIF CLICK)
// ==========================================================================

const GIF_CONFIG = {
    gifs: [
        "assets/previews/gif-themes/ursa.gif",
        "assets/previews/gif-themes/brew.gif",
        "assets/previews/gif-themes/fura.gif",
        "assets/previews/gif-themes/storm.gif",
        "assets/previews/gif-themes/invoker.gif",
        "assets/previews/gif-themes/meepo.gif",
        "assets/previews/gif-themes/bh.gif",
        "assets/previews/gif-themes/axe.gif"
    ],
    themes: [
        "ursa",
        "brew",
        "fura",
        "storm",
        "invoker",
        "meepo",
        "bh",
        "axe"
    ]
};

function preloadGifs() {
    GIF_CONFIG.gifs.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

function initializeGifTheme() {
    preloadGifs();

    const gifElement = document.getElementById('clickable-gif');
    const html = document.documentElement;

    if (!gifElement) return;

    let currentIndex = 3;
    const savedIndex = localStorage.getItem('gifIndex');
    if (savedIndex !== null) {
        currentIndex = parseInt(savedIndex, 10);
        if (!isNaN(currentIndex) && GIF_CONFIG.gifs[currentIndex]) {
            gifElement.src = GIF_CONFIG.gifs[currentIndex];
            html.setAttribute('data-gif-theme', GIF_CONFIG.themes[currentIndex]);
        }
    }

    gifElement.addEventListener('click', () => {
        gifElement.classList.add('clicked', 'no-hover');

        setTimeout(() => {
            gifElement.classList.remove('clicked');
            currentIndex = (currentIndex + 1) % GIF_CONFIG.gifs.length;
            const newTheme = GIF_CONFIG.themes[currentIndex];

            gifElement.src = GIF_CONFIG.gifs[currentIndex];
            html.setAttribute('data-gif-theme', newTheme);
            localStorage.setItem('gifIndex', currentIndex.toString());

            gifElement.classList.add('appear');
            setTimeout(() => {
                gifElement.classList.remove('appear');
                setTimeout(() => gifElement.classList.remove('no-hover'), 160);
            }, 160);
        }, 160);

        if (navigator.vibrate) navigator.vibrate(10);
    });
}

// ==========================================================================
// DYNAMIC LAYOUT & EXPRESSIVE INTERACTIVE SCROLL
// ==========================================================================

function initializeScrollAndLayout() {
    const revealElements = document.querySelectorAll('.reveal-card');

    // Intersection Observer для плавной анимации появления карточек Bento
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    revealElements.forEach(el => cardObserver.observe(el));
}

// ==========================================================================
// USDT COPY UTILITY (UPDATED FOR NEW TRC-20 WALLET)
// ==========================================================================

function initializeUSDT() {
    const copyBtn = document.getElementById('copy-usdt-btn');
    const addressEl = document.getElementById('usdt-address');
    if (copyBtn && addressEl) {
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const address = addressEl.textContent.trim();
            copyToClipboard(address, copyBtn);
        });
    }
}

function copyToClipboard(text, btn) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();

    try {
        textarea.select();
        textarea.setSelectionRange(0, text.length);
        const ok = document.execCommand('copy');
        if (ok) {
            showCopyFeedback(btn);
        } else {
            fallbackClipboardAPI(text, btn);
        }
    } catch {
        fallbackClipboardAPI(text, btn);
    }
    document.body.removeChild(textarea);
}

function fallbackClipboardAPI(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback(btn);
        }).catch(err => {
            console.error('Copy failed:', err);
        });
    } else {
        console.error('Clipboard API not available');
    }
}

function showCopyFeedback(btn) {
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) {
        icon.textContent = 'done';
        icon.style.color = '#26A17B';
        setTimeout(() => {
            icon.textContent = 'content_copy';
            icon.style.color = '';
        }, 2000);
    }
}

// ==========================================================================
// SANITIZATION HELPERS
// ==========================================================================

function htmlEncode(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function sanitizeUrl(url) {
    if (!url) return '';
    const dangerous = /^(javascript|data|vbscript):/i;
    if (dangerous.test(url)) return '';
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../') || !url.includes('://')) {
        return url;
    }
    try {
        const parsed = new URL(url);
        if (dangerous.test(parsed.protocol)) return '';
        return url;
    } catch {
        return '';
    }
}

// ==========================================================================
// YOUTUBE AUTO-DATA SYSTEM
// ==========================================================================

function getYoutubeId(url) {
    if (!url) return false;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

async function fetchYoutubeData(url, index) {
    const videoId = getYoutubeId(url);
    if (!videoId) return;

    try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        
        const item = document.querySelector(`[data-index="${index}"]`);
        if (!item) return;

        const titleEl = item.querySelector('.item-title');
        const authorEl = item.querySelector('.item-author');

        if (response.ok) {
            const data = await response.json();
            if (titleEl && titleEl.dataset.auto === "true") titleEl.textContent = data.title;
            if (authorEl && authorEl.dataset.auto === "true") authorEl.textContent = data.author_name;
        } else {
            throw new Error('Video metadata not accessible');
        }
    } catch (e) {
        const item = document.querySelector(`[data-index="${index}"]`);
        if (item) {
            const titleEl = item.querySelector('.item-title');
            if (titleEl && titleEl.dataset.auto === "true") {
                titleEl.textContent = "YouTube Video";
            }
        }
    }
}

// ==========================================================================
// PORTFOLIO LOADER (GENERATING HIGHLY EXPRESSIVE MD3 CARDS)
// ==========================================================================

function renderSkeletons(count = 4) {
    const container = document.getElementById('portfolio-container');
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
        <div class="skeleton-card">
            <div class="skeleton-thumbnail"></div>
            <div class="skeleton-chip"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-action"></div>
        </div>
    `).join('');
}

async function loadPortfolio() {
    const container = document.getElementById('portfolio-container');
    if (!container) return;

    renderSkeletons(4);

    try {
        const response = await fetch(`./data/works.json?t=${Date.now()}`);
        const data = await response.json();
        const worksArray = data.works || (Array.isArray(data) ? data : null);

        if (!worksArray) return;

        container.innerHTML = worksArray.map((work, index) => {
            const safeLink = sanitizeUrl(work.link);
            const safeImage = sanitizeUrl(work.image) || 'assets/previews/portfolio/placeholder.svg';
            const safeTitle = htmlEncode(work.title);
            const safeAuthor = htmlEncode(work.author);
            const videoId = getYoutubeId(work.link);
            const isAutoTitle = !work.title || work.title.trim() === "";
            const isAutoAuthor = !work.author || work.author.trim() === "";
            const isAutoImg = !work.image || work.image.trim() === "";

            let imageSrc = safeImage;
            if (isAutoImg && videoId) {
                imageSrc = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            } else if (isAutoImg) {
                imageSrc = 'assets/previews/portfolio/placeholder.svg';
            }

            if (isAutoTitle || isAutoAuthor) {
                fetchYoutubeData(work.link, index);
            }

            return `
                <a href="${safeLink}" target="_blank" class="md3-portfolio-card reveal-card" data-index="${index}">
                    <div class="portfolio-card-thumbnail">
                        <img src="${imageSrc}" 
                             class="item-img" 
                             data-auto="${isAutoImg}"
                             onload="this.classList.add('loaded')"
                             onerror="this.src='assets/previews/portfolio/placeholder.svg'; this.classList.add('loaded')"
                             loading="lazy"
                             alt="thumbnail">
                        <div class="card-play-overlay">
                            <span class="material-symbols-outlined overlay-play-icon">play_arrow</span>
                        </div>
                    </div>
                    <div class="portfolio-card-content">
                        <div class="portfolio-card-author-chip">
                            <span class="material-symbols-outlined chip-icon">person</span>
                            <span class="item-author" data-auto="${isAutoAuthor}">
                                ${isAutoAuthor ? '\u2014' : safeAuthor}
                            </span>
                        </div>
                        <h3 class="portfolio-card-title item-title" data-auto="${isAutoTitle}">
                            ${isAutoTitle ? '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...' : safeTitle}
                        </h3>
                    </div>
                </a>
            `;
        }).join('');

        const newCards = container.querySelectorAll('.reveal-card');
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.05 });
        newCards.forEach(c => cardObserver.observe(c));

        switchLanguage(currentLanguage);

    } catch (error) {
        console.error('Ошибка загрузки портфолио в стиле MD3:', error);
    }
}