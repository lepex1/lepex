document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setTimeout(() => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }, 100);

    initializeGifTheme();
    initializeDiscord();
    initializeScrollAndLayout();
}

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
        "ursa", "brew", "fura", "storm", "invoker", "meepo", "bh", "axe"
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

    const gifElement = document.getElementById('gifPreview');
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

    const switcher = document.getElementById('gifSwitcher');
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

const DISCORD_ID = '912749532062830703';
let lanyardSocket = null;
let heartbeatInterval = null;
let reconnectTimeout = null;

async function initializeDiscord() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const body = await res.json();
        if (body.success) {
            renderDiscord(body.data);
        }
    } catch {
        console.warn('Initial Lanyard REST fetch failed, relying on WebSocket');
    }

    connectLanyardWS();
}

function connectLanyardWS() {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);

    if (lanyardSocket) {
        try { lanyardSocket.close(); } catch (e) {}
    }

    lanyardSocket = new WebSocket('wss://api.lanyard.rest/socket');

    lanyardSocket.onopen = () => {
        console.log('Lanyard WebSocket connected');
    };

    lanyardSocket.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);

            if (msg.op === 1) {
                const interval = msg.d.heartbeat_interval;
                if (heartbeatInterval) clearInterval(heartbeatInterval);

                heartbeatInterval = setInterval(() => {
                    if (lanyardSocket && lanyardSocket.readyState === WebSocket.OPEN) {
                        lanyardSocket.send(JSON.stringify({ op: 3 }));
                    }
                }, interval);

                lanyardSocket.send(JSON.stringify({
                    op: 2,
                    d: { subscribe_to_id: DISCORD_ID }
                }));
            }

            if (msg.op === 0) {
                if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
                    renderDiscord(msg.d);
                }
            }
        } catch (err) {
            console.error('Error handling Lanyard message:', err);
        }
    };

    lanyardSocket.onclose = () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        reconnectTimeout = setTimeout(connectLanyardWS, 5000);
    };

    lanyardSocket.onerror = (err) => {
        console.error('Lanyard WebSocket error:', err);
    };
}

function getActivityPrefix(type) {
    switch (type) {
        case 0: return 'Playing';
        case 1: return 'Streaming';
        case 2: return 'Listening to';
        case 3: return 'Watching';
        case 5: return 'Competing in';
        default: return 'Playing';
    }
}

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

function renderDiscord(data) {
    const avatar = document.getElementById('discordAvatar');
    const status = document.getElementById('discordStatus');
    const username = document.getElementById('discordUsername');
    const activity = document.getElementById('discordActivity');

    if (data.discord_user && data.discord_user.avatar) {
        avatar.src = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${data.discord_user.avatar}.webp?size=1024`;
    }

    status.className = 'md3-discord__status ' + (data.discord_status || 'offline');

    const activityBlocks = [];

    const spotify = data.spotify;
    const spotifyActive = data.listening_to_spotify && spotify;

    let filteredActivities = data.activities ? data.activities.filter(a => a.type !== 4) : [];

    if (spotifyActive) {
        filteredActivities = filteredActivities.filter(a => a.name !== 'Spotify');
    }

    if (spotifyActive) {
        const block = document.createElement('div');
        block.className = 'discord-activity__item';
        block.innerHTML = `
            <div class="discord-activity__header">Listening to Spotify</div>
            <div class="discord-activity__body">
                <img src="${spotify.album_art_url}" alt="album" class="discord-activity__art" loading="lazy">
                <div class="discord-activity__details">
                    <span class="discord-activity__title"><span class="material-symbols-outlined md-icon--inline">music_note</span>${escapeHtml(spotify.song)}</span>
                    <span class="discord-activity__artist"><span class="material-symbols-outlined md-icon--inline">mic</span>${escapeHtml(spotify.artist)}</span>
                    <span class="discord-activity__album"><span class="material-symbols-outlined md-icon--inline">album</span>${escapeHtml(spotify.album)}</span>
                    <div class="discord-activity__progress" data-start="${spotify.timestamps.start}" data-end="${spotify.timestamps.end}"></div>
                </div>
            </div>
        `;
        activityBlocks.push(block);
    }

    filteredActivities.forEach(active => {
        const block = document.createElement('div');
        block.className = 'discord-activity__item';

        let iconHtml = '';
        if (active.assets && active.assets.large_image) {
            const img = active.assets.large_image.startsWith('mp:external/')
                ? `https://media.discordapp.net/external/${active.assets.large_image.replace('mp:external/', '')}`
                : `https://cdn.discordapp.com/app-assets/${active.application_id}/${active.assets.large_image}.png`;
            const tooltip = active.assets.large_text ? ` title="${escapeHtml(active.assets.large_text)}"` : '';
            iconHtml = `<img src="${img}" alt="" class="discord-activity__art" loading="lazy" onerror="this.style.display='none'"${tooltip}>`;
        } else {
            const initials = active.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            iconHtml = `<div class="discord-activity__art-initials">${initials}</div>`;
        }

        const hasTimestamps = active.timestamps && (active.timestamps.start || active.timestamps.end);
        const isListening = active.type === 2;

        let titleText = active.name;
        let subtitleText = active.details ? active.details : '';
        let stateText = active.state ? active.state : '';
        let headerText = getActivityPrefix(active.type);

        if (isListening) {
            headerText = `${headerText} ${escapeHtml(active.name)}`;
            titleText = active.details || active.name;
            subtitleText = active.details ? (active.state || '') : '';
            stateText = '';
        }

        const title = escapeHtml(titleText);
        const subtitle = subtitleText ? escapeHtml(subtitleText) : '';
        const state = stateText ? escapeHtml(stateText) : '';

        const titleHtml = isListening
            ? `<span class="material-symbols-outlined md-icon--inline">music_note</span>${title}`
            : title;

        const subtitleHtml = subtitle
            ? `<span class="discord-activity__artist">${isListening ? `<span class="material-symbols-outlined md-icon--inline">mic</span>` : ''}${subtitle}</span>`
            : '';

        const stateHtml = state
            ? `<span class="discord-activity__album">${isListening ? `<span class="material-symbols-outlined md-icon--inline">album</span>` : ''}${state}</span>`
            : '';

        block.innerHTML = `
            <div class="discord-activity__header">${headerText}</div>
            <div class="discord-activity__body">
                ${iconHtml}
                <div class="discord-activity__details">
                    <span class="discord-activity__title">${titleHtml}</span>
                    ${subtitleHtml}
                    ${stateHtml}
                    ${hasTimestamps ? `<div class="discord-activity__progress" data-start="${active.timestamps.start || ''}" data-end="${active.timestamps.end || ''}"></div>` : ''}
                </div>
            </div>
        `;
        activityBlocks.push(block);
    });

    activity.innerHTML = '';

    if (activityBlocks.length > 0) {
        activityBlocks.forEach(block => activity.appendChild(block));
    } else {
        activity.innerHTML = '<div class="md3-discord__activity-skeleton">No activity</div>';
    }

    const card = document.getElementById('discordCard');
    if (card) {
        setTimeout(() => card.classList.add('in-view'), 100);
    }

    updateAllProgress();
    if (!window._progressInterval) {
        window._progressInterval = setInterval(updateAllProgress, 1000);
    }
}

function updateAllProgress() {
    document.querySelectorAll('.discord-activity__progress').forEach(el => {
        const start = parseInt(el.dataset.start);
        const end = parseInt(el.dataset.end);

        if (!start) return;

        const now = Date.now();

        if (end) {
            const total = end - start;
            const elapsed = Math.min(total, Math.max(0, now - start));
            const pct = Math.min(100, (elapsed / total) * 100);
            el.innerHTML = `
                <span class="discord-activity__time">${formatTime(elapsed)}</span>
                <div class="discord-activity__bar-track">
                    <div class="discord-activity__bar-fill" style="width:${pct}%"></div>
                </div>
                <span class="discord-activity__time">${formatTime(total)}</span>
            `;
        } else {
            const elapsed = Math.max(0, now - start);
            el.innerHTML = `
                <span class="discord-activity__elapsed">
                    <span class="material-symbols-outlined discord-activity__elapsed-icon">schedule</span>
                    ${formatTime(elapsed)} elapsed
                </span>
            `;
        }
    });
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
