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
                titleEl.textContent = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ru') ? 'YouTube Видео' : 'YouTube Video';
            }
        }
    }
}

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
        const response = await fetch(`/portfolio/subtitles/data/works.json?t=${Date.now()}`);
        const data = await response.json();
        const worksArray = data.works || (Array.isArray(data) ? data : null);

        if (!worksArray) return;

        container.innerHTML = worksArray.map((work, index) => {
            const safeLink = sanitizeUrl(work.link);
            const safeImage = sanitizeUrl(work.image) || '/portfolio/subtitles/assets/previews/portfolio/placeholder.svg';
            const safeTitle = escapeHtml(work.title);
            const safeAuthor = escapeHtml(work.author);
            const videoId = getYoutubeId(work.link);
            const isAutoTitle = !work.title || work.title.trim() === "";
            const isAutoAuthor = !work.author || work.author.trim() === "";
            const isAutoImg = !work.image || work.image.trim() === "";

            let imageSrc = safeImage;
            if (isAutoImg && videoId) {
                imageSrc = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            } else if (isAutoImg) {
                imageSrc = '/assets/previews/portfolio/placeholder.svg';
            }

            if (isAutoTitle || isAutoAuthor) {
                fetchYoutubeData(work.link, index);
            }

            return `
                <div class="md3-portfolio-card reveal-card" data-index="${index}" data-video="${safeLink}" role="button" tabindex="0">
                    <div class="portfolio-card-thumbnail">
                        <img src="${imageSrc}"
                             class="item-img"
                             data-auto="${isAutoImg}"
                             onload="this.classList.add('loaded')"
                             onerror="this.src='/assets/previews/portfolio/placeholder.svg'; this.classList.add('loaded')"
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
                            ${isAutoTitle ? (typeof currentLanguage !== 'undefined' && currentLanguage === 'ru' ? '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...' : 'Loading...') : safeTitle}
                        </h3>
                    </div>
                </div>
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
        initializePortfolioCards();

    } catch (error) {
        console.error('Portfolio load error:', error);
        container.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'portfolio-error';
        errorDiv.innerHTML = `
            <span class="material-symbols-outlined portfolio-error-icon">error_outline</span>
            <p class="portfolio-error-text">${currentLanguage === 'ru' ? 'Не удалось загрузить работы. Проверьте подключение.' : 'Failed to load works. Check your connection.'}</p>
            <button class="md3-filled-button portfolio-error-retry" onclick="loadPortfolio()">
                <span class="material-symbols-outlined">refresh</span>
                ${currentLanguage === 'ru' ? 'Повторить' : 'Retry'}
            </button>
        `;
        container.appendChild(errorDiv);
    }
}

function openVideoModal(videoUrl) {
    const videoId = getYoutubeId(videoUrl);
    if (!videoId) return;

    const modal = document.getElementById('videoModal');
    const container = modal.querySelector('.video-modal-frame-container');
    const openBtn = modal.querySelector('.video-modal-open-btn');

    container.innerHTML = `<iframe class="video-modal-iframe" src="https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    openBtn.href = `https://www.youtube.com/watch?v=${videoId}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const container = modal.querySelector('.video-modal-frame-container');
    modal.classList.remove('active');
    container.innerHTML = '';
    document.body.style.overflow = '';
}

function initializeVideoModal() {
    const modal = document.getElementById('videoModal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.video-modal-close');
    const backdrop = modal.querySelector('.video-modal-backdrop');

    closeBtn.addEventListener('click', closeVideoModal);
    backdrop.addEventListener('click', closeVideoModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeVideoModal();
        }
    });
}

function initializePortfolioCards() {
    const container = document.getElementById('portfolio-container');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const card = e.target.closest('.md3-portfolio-card');
        if (!card) return;
        const videoUrl = card.dataset.video;
        if (videoUrl) {
            openVideoModal(videoUrl);
        }
    });
}
