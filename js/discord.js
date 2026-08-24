const DISCORD_ID = '912749532062830703';
let lanyardSocket = null;
let heartbeatInterval = null;
let reconnectTimeout = null;

const DISCORD_CACHE_KEY = 'lepex:discord';
const DISCORD_AVATAR_KEY = 'lepex:discord-avatar';

function loadDiscordCache() {
    try {
        const raw = localStorage.getItem(DISCORD_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveDiscordCache(data) {
    try {
        localStorage.setItem(DISCORD_CACHE_KEY, JSON.stringify(data));
    } catch {}
}

function cacheAvatarDataUrl(url) {
    if (!url) return;
    fetch(url)
        .then(r => r.blob())
        .then(b => {
            const reader = new FileReader();
            reader.onloadend = () => {
                try { localStorage.setItem(DISCORD_AVATAR_KEY, reader.result); } catch {}
            };
            reader.readAsDataURL(b);
        })
        .catch(() => {});
}

async function initializeDiscord() {
    const cached = loadDiscordCache();
    if (cached) {
        renderDiscord(cached);
    }

    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const body = await res.json();
        if (body.success) {
            renderDiscord(body.data);
            saveDiscordCache(body.data);
        }
    } catch {
        console.warn('Initial Lanyard REST fetch failed, relying on WebSocket');
    }

    connectLanyardWS();
}

function connectLanyardWS() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }

    if (lanyardSocket) {
        lanyardSocket.onclose = null;
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
                saveDiscordCache(msg.d);
            }
            }
        } catch (err) {
            console.error('Error handling Lanyard message:', err);
        }
    };

    lanyardSocket.onclose = () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(connectLanyardWS, 5000);
    };

    lanyardSocket.onerror = (err) => {
        console.error('Lanyard WebSocket error:', err);
    };
}

function getActivityPrefix(type) {
    const ru = currentLanguage === 'ru';
    switch (type) {
        case 0: return ru ? 'Играет' : 'Playing';
        case 1: return ru ? 'Стримит' : 'Streaming';
        case 2: return ru ? 'Слушает' : 'Listening to';
        case 3: return ru ? 'Смотрит' : 'Watching';
        case 5: return ru ? 'Соревнуется в' : 'Competing in';
        default: return ru ? 'Играет' : 'Playing';
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
        const avatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${data.discord_user.avatar}.webp?size=1024`;
        let cachedAvatar = null;
        try { cachedAvatar = localStorage.getItem(DISCORD_AVATAR_KEY); } catch {}
        avatar.src = cachedAvatar || avatarUrl;
        cacheAvatarDataUrl(avatarUrl);
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
            <div class="discord-activity__header">${currentLanguage === 'ru' ? 'Слушает Spotify' : 'Listening to Spotify'}</div>
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
            stateText = (active.assets && active.assets.large_text) ? active.assets.large_text : '';
        }

        const title = escapeHtml(titleText);
        const subtitle = subtitleText ? escapeHtml(subtitleText) : '';
        const state = stateText ? escapeHtml(stateText) : '';

        const isPaused = isListening && (
            stateText.includes('⏸') ||
            stateText.toLowerCase().includes('paused') ||
            stateText.toLowerCase().includes('пауза')
        );

        const titleHtml = isListening
            ? `<span class="material-symbols-outlined md-icon--inline">music_note</span>${title}`
            : title;

        const subtitleHtml = subtitle
            ? `<span class="discord-activity__artist">${isListening ? `<span class="material-symbols-outlined md-icon--inline">mic</span>` : ''}${subtitle}</span>`
            : '';

        const stateHtml = state
            ? `<span class="discord-activity__album">${isListening && !isPaused ? `<span class="material-symbols-outlined md-icon--inline">album</span>` : ''}${state}</span>`
            : '';

        block.innerHTML = `
            <div class="discord-activity__header">${headerText}</div>
            <div class="discord-activity__body">
                ${iconHtml}
                <div class="discord-activity__details">
                    <span class="discord-activity__title">${titleHtml}</span>
                    ${subtitleHtml}
                    ${stateHtml}
                    ${hasTimestamps ? `<div class="discord-activity__progress" data-start="${active.timestamps.start || ''}" data-end="${active.timestamps.end || ''}" data-paused="${isPaused}"></div>` : ''}
                </div>
            </div>
        `;
        activityBlocks.push(block);
    });

    activity.innerHTML = '';

    if (activityBlocks.length > 0) {
        activityBlocks.forEach(block => activity.appendChild(block));
    } else {
        activity.innerHTML = '<div class="md3-discord__activity-skeleton">' + (currentLanguage === 'ru' ? 'Нет активности' : 'No activity') + '</div>';
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
        const isPaused = el.dataset.paused === 'true';

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
                    ${formatTime(elapsed)} ${currentLanguage === 'ru' ? 'прошло' : 'elapsed'}
                </span>
            `;
        }
    });
}

function updateDiscordLanguage() {
    const cached = loadDiscordCache();
    if (cached) {
        renderDiscord(cached);
    }
}
