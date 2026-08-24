export function copyToClipboard(text) {
    if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
    }
    return navigator.clipboard.writeText(text);
}

export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

export function sanitizeUrl(url) {
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
