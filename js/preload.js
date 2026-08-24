(function() {
    const h = document.documentElement;

    // Theme initialization (light/dark)
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    h.setAttribute('data-theme', theme);

    // Language initialization
    const savedLang = localStorage.getItem('lang');
    const browserLang = (navigator.language || '').split('-')[0];
    const lang = (savedLang === 'ru' || savedLang === 'en')
        ? savedLang
        : (['ru','kk','be','uk'].includes(browserLang) ? 'ru' : 'en');
    h.setAttribute('data-lang', lang);
    h.setAttribute('lang', lang);

    // GIF theme initialization
    const gifIndex = localStorage.getItem('gifIndex');
    if (gifIndex !== null) {
        const ti = parseInt(gifIndex, 10);
        const themes = ['ursa','brew','fura','storm','invoker','meepo','bh','axe'];
        const colors = ['#141218','#14110f','#121511','#13171a','#0e0e0e','#191113','#15130f','#1a1110'];
        if (!isNaN(ti) && ti >= 0 && ti <= 7) {
            h.setAttribute('data-gif-theme', themes[ti]);
            const meta = document.getElementById('theme-color-meta');
            if (meta) meta.setAttribute('content', colors[ti]);
        }
    }
})();
