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
    // ~200 KB of GIFs; defer until idle so they never compete with first paint
    const idle = window.requestIdleCallback
        ? (cb) => window.requestIdleCallback(cb, { timeout: 4000 })
        : (cb) => setTimeout(cb, 2500);
    idle(preloadGifs);

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
        switcher.setAttribute('role', 'button');
        switcher.setAttribute('tabindex', '0');

        const switchTheme = () => {
            switcher.classList.add('clicked', 'no-hover');

            setTimeout(() => {
                switcher.classList.remove('clicked');
                currentIndex = (currentIndex + 1) % GIF_CONFIG.gifs.length;
                const newTheme = GIF_CONFIG.themes[currentIndex];

                const apply = () => {
                    gifElement.src = GIF_CONFIG.gifs[currentIndex];
                    html.setAttribute('data-gif-theme', newTheme);
                };
                if (document.startViewTransition) document.startViewTransition(apply);
                else apply();

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
        };

        switcher.addEventListener('click', switchTheme);
        switcher.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                switchTheme();
            }
        });
    }
}

function initializeLanguage() {
    const savedLang = document.documentElement.getAttribute('data-lang');
    currentLanguage = (savedLang === 'ru' || savedLang === 'en') ? savedLang : 'ru';

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

    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);

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

function initializeThemeToggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const themeToggle = document.createElement('button');
    themeToggle.className = 'md3-icon-button theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle theme');
    themeToggle.innerHTML = '<span class="material-symbols-outlined">' +
        (currentTheme === 'light' ? 'dark_mode' : 'light_mode') + '</span>';

    const appBarActions = document.querySelector('.md3-app-bar-actions');
    if (appBarActions) {
        appBarActions.insertBefore(themeToggle, appBarActions.firstChild);

        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = current === 'light' ? 'dark' : 'light';

            const apply = () => {
                document.documentElement.setAttribute('data-theme', newTheme);
                themeToggle.querySelector('.material-symbols-outlined').textContent =
                    newTheme === 'light' ? 'dark_mode' : 'light_mode';
            };
            if (document.startViewTransition) document.startViewTransition(apply);
            else apply();

            localStorage.setItem('theme', newTheme);
        });
    }
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

function initializeConnectionToast() {
    let toast = null;
    const show = (offline) => {
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'connection-toast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        const ru = offline ? 'Нет подключения' : 'Соединение восстановлено';
        const en = offline ? 'You are offline' : 'Back online';
        toast.innerHTML = '<span class="i18n-container">' +
            `<span class="lang-ru">${ru}</span>` +
            `<span class="lang-en">${en}</span></span>`;
        toast.classList.add('visible');
    };

    window.addEventListener('offline', () => show(true));
    window.addEventListener('online', () => {
        show(false);
        setTimeout(() => { if (toast) toast.classList.remove('visible'); }, 3000);
    });
}

document.addEventListener('DOMContentLoaded', initializeConnectionToast);
