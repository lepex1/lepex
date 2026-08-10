let currentLanguage = 'ru';

const GIF_CONFIG = {
    gifs: [
        "/assets/previews/gif-themes/ursa.gif",
        "/assets/previews/gif-themes/brew.gif",
        "/assets/previews/gif-themes/fura.gif",
        "/assets/previews/gif-themes/storm.gif",
        "/assets/previews/gif-themes/invoker.gif",
        "/assets/previews/gif-themes/meepo.gif",
        "/assets/previews/gif-themes/bh.gif",
        "/assets/previews/gif-themes/axe.gif"
    ],
    themes: [
        "ursa", "brew", "fura", "storm", "invoker", "meepo", "bh", "axe"
    ]
};

function preloadGifs() {
    GIF_CONFIG.gifs.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

const GIF_THEME_COLORS = {
    ursa: "#141218",
    brew: "#14110f",
    fura: "#121511",
    storm: "#13171a",
    invoker: "#0e0e0e",
    meepo: "#191113",
    bh: "#15130f",
    axe: "#1a1110"
};

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

    const switcher = document.getElementById('clickable-gif');
    if (switcher) {
        switcher.addEventListener('click', () => {
            switcher.classList.add('clicked', 'no-hover');

            setTimeout(() => {
                switcher.classList.remove('clicked');
                currentIndex = (currentIndex + 1) % GIF_CONFIG.gifs.length;
                const newTheme = GIF_CONFIG.themes[currentIndex];

                gifElement.src = GIF_CONFIG.gifs[currentIndex];
                html.setAttribute('data-gif-theme', newTheme);
                localStorage.setItem('gifIndex', currentIndex.toString());

                const themeColorMeta = document.getElementById('theme-color-meta');
                if (themeColorMeta && GIF_THEME_COLORS[newTheme]) {
                    themeColorMeta.setAttribute('content', GIF_THEME_COLORS[newTheme]);
                }

                switcher.classList.add('appear');
                setTimeout(() => {
                    switcher.classList.remove('appear');
                    setTimeout(() => switcher.classList.remove('no-hover'), 160);
                }, 160);
            }, 160);

            if (navigator.vibrate) navigator.vibrate(10);
        });
    }
}

function initializeLanguage() {
    const russianLangs = ['ru', 'kk', 'be', 'uk'];
    const userLang = navigator.language.split('-')[0];
    const savedLang = localStorage.getItem('lang');
    currentLanguage = (savedLang === 'ru' || savedLang === 'en')
        ? savedLang
        : (russianLangs.includes(userLang) ? 'ru' : 'en');

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
            localStorage.setItem('lang', currentLanguage);
            if (typeof updateDiscordLanguage === 'function') updateDiscordLanguage();
            document.dispatchEvent(new CustomEvent('languagechange'));
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

    document.querySelectorAll('[data-placeholder-ru][data-placeholder-en]').forEach(el => {
        el.placeholder = el.getAttribute('data-placeholder-' + lang);
    });

    document.querySelectorAll('[data-label-ru][data-label-en]').forEach(el => {
        const label = el.getAttribute('data-label-' + lang);
        if (label) el.setAttribute('aria-label', label);
    });

    document.querySelectorAll('[data-title-ru][data-title-en]').forEach(el => {
        const title = el.getAttribute('data-title-' + lang);
        if (title) el.setAttribute('title', title);
    });

    document.querySelectorAll('title[data-lang-ru][data-lang-en]').forEach(el => {
        document.title = el.getAttribute('data-lang-' + lang);
    });

    document.querySelectorAll('meta[name="description"][data-lang-ru][data-lang-en]').forEach(el => {
        el.content = el.getAttribute('data-lang-' + lang);
    });
    document.querySelectorAll('meta[name="keywords"][data-lang-ru][data-lang-en]').forEach(el => {
        el.content = el.getAttribute('data-lang-' + lang);
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

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function initializeScrollAndLayout() {
    const revealElements = document.querySelectorAll('.reveal-card');

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    revealElements.forEach(el => cardObserver.observe(el));
}
