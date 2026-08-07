const SUPPORTED_EXTS = ['.png', '.jpg', '.jpeg', '.bmp', '.webp', '.tiff', '.tif', '.gif', '.jfif'];
const SUPPORTED_VIDEO_EXTS = ['.mp4', '.m4v', '.mov', '.webm', '.mkv', '.avi'];
const VIDEO_WARN_BYTES = 100 * 1024 * 1024;
const MAX_DIM = 1280;
const DURATION = 3;
const FPS = 15;

const I18N = {
    fileLoaded: { ru: 'Файл загружен: {name}', en: 'File loaded: {name}' },
    preparing: { ru: 'Подготовка...', en: 'Preparing...' },
    converting: { ru: 'Конвертация...', en: 'Converting...' },
    convertingElapsed: { ru: 'Конвертация… {elapsed}', en: 'Converting… {elapsed}' },
    convertingEta: { ru: 'Конвертация… {elapsed} / {total} · осталось ~{remaining}', en: 'Converting… {elapsed} / {total} · ~{remaining} left' },
    loadingEngine: { ru: 'Загрузка движка… {pct}%', en: 'Loading engine… {pct}%' },
    badFormat: { ru: 'Неподдерживаемый формат. Используй PNG, JPG, BMP, WEBP, TIFF, GIF, MP4, MOV, WEBM, MKV, AVI', en: 'Unsupported format. Use PNG, JPG, BMP, WEBP, TIFF, GIF, MP4, MOV, WEBM, MKV, AVI' },
    videoTooLarge: { ru: 'Файл больше 100 МБ — конвертация может занять много времени и памяти', en: 'File is over 100 MB — conversion may take a while and use lots of memory' },
    err: { ru: 'Ошибка: {msg}', en: 'Error: {msg}' },
    engineMissing: { ru: 'Движок конвертации не загрузился (vendor/ffmpeg.js). Проверь вкладку Network — файлы vendor/* должны отвечать 200 — и открой страницу через http://', en: 'Conversion engine failed to load (vendor/ffmpeg.js). Check the Network tab — vendor/* files must return 200 — and open the page via http://' },
    fileProtocol: { ru: 'Страница открыта как file:// — конвертация не работает. Запусти локальный сервер (npx serve) и открой через http://', en: 'Page opened as file:// — conversion will not work. Run a local server (npx serve) and open via http://' },
};

const ENGINE_MISSING = 'ENGINE_MISSING';

if (!window.FFmpegUtil) {
    window.FFmpegUtil = {
        toBlobURL: function (url, mimeType, crossOrigin, progress) {
            const CHUNK_SIZES = [4 * 1024 * 1024, 1024 * 1024, 256 * 1024];
            const fetchPlain = async () => {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error('HTTP ' + res.status + ' ' + res.statusText);
                }
                return URL.createObjectURL(await res.blob());
            };
            const fetchChunked = async (chunkSize) => {
                const parts = [];
                let offset = 0;
                let total = 0;
                for (;;) {
                    const end = offset + chunkSize - 1;
                    const res = await fetch(url, { headers: { Range: 'bytes=' + offset + '-' + end } });
                    if (!res.ok) {
                        throw new Error('HTTP ' + res.status + ' ' + res.statusText);
                    }
                    if (res.status !== 206) {
                        throw new Error('range not supported');
                    }
                    const cr = res.headers.get('Content-Range') || '';
                    const m = /\/\s*(\d+)\s*$/.exec(cr);
                    if (m) total = Number(m[1]);
                    const bytes = new Uint8Array(await res.arrayBuffer());
                    parts.push(bytes);
                    offset += bytes.length;
                    if (progress) progress({ received: offset, total: total || offset + 1 });
                    if (total && offset >= total) break;
                    if (!total && bytes.length < chunkSize) break;
                }
                return URL.createObjectURL(new Blob(parts, { type: mimeType }));
            };
            const delay = (ms) => new Promise(r => setTimeout(r, ms));
            const tryChunked = async (sizes) => {
                for (let i = 0; i < sizes.length; i++) {
                    try {
                        return await fetchChunked(sizes[i]);
                    } catch (err) {
                        if (i === sizes.length - 1) throw err;
                        await delay(200);
                    }
                }
            };
            return tryChunked(CHUNK_SIZES)
                .catch(() => delay(200).then(fetchPlain))
                .catch(err => {
                    throw new Error('Failed to fetch ' + url + ': ' + (err && err.message ? err.message : err));
                });
        },
    };
}

let file = null;
let outputW = 0;
let outputH = 0;
let currentStatus = null;
let ffmpegPromise = null;
let resultUrl = null;
let videoDurationSec = 0;

function tr(key) {
    return I18N[key] ? I18N[key][currentLanguage] : key;
}

function setStatus(key, params) {
    currentStatus = { key, params };
    const statusEl = document.getElementById('statusText');
    if (key === null) {
        hide(statusEl);
        statusEl.textContent = '';
        return;
    }
    renderStatus();
    show(statusEl);
}

function renderStatus() {
    if (!currentStatus) return;
    let text = tr(currentStatus.key);
    if (currentStatus.params) {
        for (const k in currentStatus.params) {
            text = text.replace('{' + k + '}', currentStatus.params[k]);
        }
    }
    document.getElementById('statusText').textContent = text;
}

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

let progressTimer = null;
let converting = false;
let encodeProgressCb = null;
let encodeStartMs = 0;
let encodeOutSec = 0;
let encodeTotalSec = 0;
let encodeHasData = false;
let encodeClockTimer = null;

function stopProgressTimer() {
    if (progressTimer) {
        clearInterval(progressTimer);
        cancelAnimationFrame(progressTimer);
        progressTimer = null;
    }
}

function stopEncodeClock() {
    if (encodeClockTimer) {
        clearInterval(encodeClockTimer);
        encodeClockTimer = null;
    }
}

function formatClock(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? h + ':' + mm + ':' + ss : mm + ':' + ss;
}

function progressNow() {
    return parseFloat(document.getElementById('progressFill').style.width) || 0;
}

function setPgPct(p, labelText) {
    stopProgressTimer();
    const wrap = document.getElementById('progressWrap');
    const fill = document.getElementById('progressFill');
    fill.classList.remove('indeterminate');
    fill.classList.remove('done');
    const pct = Math.min(100, Math.max(0, p));
    fill.style.width = pct + '%';
    wrap.setAttribute('aria-valuenow', String(Math.round(pct)));
    wrap.setAttribute('aria-valuemin', '0');
    wrap.setAttribute('aria-valuemax', '100');
    const label = document.getElementById('progressLabel');
    if (labelText) {
        label.textContent = labelText;
        show(label);
    } else {
        hide(label);
    }
}

function animatePgTo(p, ms) {
    stopProgressTimer();
    const fill = document.getElementById('progressFill');
    fill.classList.remove('indeterminate');
    const from = progressNow();
    const startTime = performance.now();
    const step = (now) => {
        const t = Math.min((now - startTime) / ms, 1);
        const eased = t * (2 - t);
        fill.style.width = (from + (p - from) * eased) + '%';
        if (t < 1) progressTimer = requestAnimationFrame(step);
    };
    progressTimer = requestAnimationFrame(step);
}

function startEncodeClock() {
    stopProgressTimer();
    stopEncodeClock();
    encodeStartMs = performance.now();
    encodeOutSec = 0;
    encodeHasData = false;
    const fill = document.getElementById('progressFill');
    fill.classList.add('indeterminate');
    renderEncodeLabel();
    const label = document.getElementById('progressLabel');
    show(label);
    encodeClockTimer = setInterval(renderEncodeLabel, 1000);
}

function renderEncodeLabel() {
    const label = document.getElementById('progressLabel');
    const elapsed = (performance.now() - encodeStartMs) / 1000;
    let text;
    if (encodeHasData && encodeTotalSec > 0 && encodeOutSec > 0) {
        const frac = Math.min(1, encodeOutSec / encodeTotalSec);
        const eta = frac >= 0.01 ? Math.round(elapsed * (1 - frac) / frac) : 0;
        text = tr('convertingEta')
            .replace('{elapsed}', formatClock(elapsed))
            .replace('{total}', formatClock(encodeTotalSec))
            .replace('{remaining}', formatClock(eta));
    } else {
        text = tr('convertingElapsed').replace('{elapsed}', formatClock(elapsed));
    }
    label.textContent = text;
    show(label);
    const wrap = document.getElementById('progressWrap');
    if (!encodeHasData) {
        wrap.removeAttribute('aria-valuenow');
        wrap.setAttribute('aria-valuetext', text);
    } else {
        wrap.removeAttribute('aria-valuetext');
    }
}

function showProgress(labelKey) {
    stopProgressTimer();
    stopEncodeClock();
    setPgPct(0, labelKey ? tr(labelKey) : null);
    show(document.getElementById('progressWrap'));
}

function hideProgress() {
    stopProgressTimer();
    stopEncodeClock();
    hide(document.getElementById('progressWrap'));
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function computeOutputDims(w, h) {
    if (w > MAX_DIM || h > MAX_DIM) {
        if (w >= h) {
            h = Math.round(h * MAX_DIM / w);
            w = MAX_DIM;
        } else {
            w = Math.round(w * MAX_DIM / h);
            h = MAX_DIM;
        }
    }
    w += w % 2;
    h += h % 2;
    return [w, h];
}

function loadImageDims(blob) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ w: img.naturalWidth, h: img.naturalHeight });
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
        img.src = url;
    });
}

function isVideo(f) {
    return SUPPORTED_VIDEO_EXTS.includes('.' + f.name.split('.').pop().toLowerCase());
}

function loadVideoDims(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve({ w: video.videoWidth, h: video.videoHeight, duration: video.duration || 0 });
        };
        video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
        video.src = url;
    });
}

async function drawScaledToCanvas(blob, w, h) {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
        img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    return canvas;
}

function getVendorUrl(name) {
    return '/portfolio/img2tggif/vendor/' + name + '?v=2';
}

async function getFfmpeg() {
    if (!ffmpegPromise) {
        ffmpegPromise = (async () => {
            if (typeof FFmpegWASM === 'undefined') {
                console.error('Missing global: FFmpegWASM (vendor/ffmpeg.js)');
                throw new Error(ENGINE_MISSING);
            }
            setStatus('converting');
            const ffmpeg = new FFmpegWASM.FFmpeg();
            const reportRange = (lo, hi) => (r) => {
                if (r.total) {
                    const pct = Math.min(100, lo + Math.round((hi - lo) * (r.received / r.total)));
                    setPgPct(pct, tr('loadingEngine').replace('{pct}', pct));
                }
            };
            const coreURL = await FFmpegUtil.toBlobURL(getVendorUrl('ffmpeg-core.js'), 'text/javascript', true, reportRange(15, 35));
            const wasmURL = await FFmpegUtil.toBlobURL(getVendorUrl('ffmpeg-core.wasm'), 'application/wasm', undefined, reportRange(35, 60));
            await ffmpeg.load({ coreURL, wasmURL });
            if (typeof ffmpeg.on === 'function') {
                let logBuf = '';
                ffmpeg.on('log', ({ message }) => {
                    if (!encodeProgressCb) return;
                    logBuf += message;
                    const lines = logBuf.split('\n');
                    logBuf = lines.pop();
                    for (const line of lines) {
                        const l = line.trim();
                        let m;
                        if ((m = /^Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(l))) {
                            if (!encodeTotalSec) {
                                encodeTotalSec = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
                            }
                        } else if ((m = /^out_time_us=(\d+)/.exec(l))) {
                            const us = Number(m[1]);
                            encodeProgressCb(Math.min(1, us / 1000000 / (encodeTotalSec || 1)), us / 1000000);
                        } else if ((m = /^out_time_ms=(\d+)/.exec(l))) {
                            const ms = Number(m[1]);
                            encodeProgressCb(Math.min(1, ms / 1000 / (encodeTotalSec || 1)), ms / 1000);
                        } else if ((m = /^out_time=(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(l))) {
                            const sec = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
                            encodeProgressCb(Math.min(1, sec / (encodeTotalSec || 1)), sec);
                        }
                    }
                });
            }
            return ffmpeg;
        })().catch(err => {
            ffmpegPromise = null;
            throw err;
        });
    }
    return ffmpegPromise;
}

function handleError(msg) {
    setStatus(null);
    document.getElementById('errorText').textContent = tr('err').replace('{msg}', msg);
    show(document.getElementById('errorText'));
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.disabled = false;
    show(convertBtn);
}

function resetError() {
    hide(document.getElementById('errorText'));
}

async function convert() {
    if (!file || converting) return;
    resetError();
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.disabled = true;
    hide(convertBtn);
    const clearBtn = document.getElementById('clearBtn');
    hide(clearBtn);
    converting = true;
    setStatus('preparing');

    try {
        showProgress('preparing');
        setStatus('preparing');

        const isV = isVideo(file);
        let pngBlob = null;
        if (!isV) {
            const canvas = await drawScaledToCanvas(file, outputW, outputH);
            setPgPct(12);
            pngBlob = await new Promise((resolve, reject) => {
                canvas.toBlob(b => b ? resolve(b) : reject(new Error('canvas')), 'image/png');
            });
            setPgPct(18);
        }

        const ffmpeg = await getFfmpeg();

        encodeTotalSec = isV ? (videoDurationSec || 0) : DURATION;
        setPgPct(60);
        encodeProgressCb = (frac, outSec) => {
            if (typeof outSec === 'number' && outSec > 0) {
                encodeOutSec = outSec;
                if (encodeTotalSec > 0) encodeHasData = true;
            }
            if (encodeHasData && encodeTotalSec > 0) {
                const pf = Math.min(1, frac);
                const p = Math.min(98, 60 + Math.round(38 * pf));
                setPgPct(p, null);
            }
            renderEncodeLabel();
        };
        startEncodeClock();

        const warnEl = document.getElementById('warnText');
        if (isV && file.size > VIDEO_WARN_BYTES) {
            warnEl.textContent = tr('videoTooLarge');
            show(warnEl);
        } else {
            hide(warnEl);
        }

        let inputName;
        let args;
        if (!isV) {
            inputName = 'input.png';
            await ffmpeg.writeFile(inputName, new Uint8Array(await pngBlob.arrayBuffer()));
            args = [
                '-y', '-loop', '1', '-i', inputName,
                '-c:v', 'libx264', '-t', String(DURATION), '-pix_fmt', 'yuv420p',
                '-profile:v', 'high',
                '-crf', '17', '-preset', 'veryslow', '-tune', 'stillimage',
                '-r', String(FPS), '-an', '-movflags', '+faststart',
                '-nostats', '-progress', 'pipe:1',
                'output.mp4'
            ];
        } else {
            inputName = 'input' + '.' + file.name.split('.').pop().toLowerCase();
            await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
            const scale = outputW && outputH
                ? 'scale=' + outputW + ':' + outputH + ':flags=lanczos'
                : 'scale=min(1280,iw):min(1280,ih):force_original_aspect_ratio=decrease:flags=lanczos,crop=trunc(iw/2)*2:trunc(ih/2)*2';
            args = [
                '-y', '-i', inputName,
                '-vf', scale,
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                '-profile:v', 'high',
                '-crf', '17', '-preset', 'veryslow',
                '-r', String(FPS), '-an', '-movflags', '+faststart',
                '-nostats', '-progress', 'pipe:1',
                'output.mp4'
            ];
        }

        const ret = await ffmpeg.exec(args);
        if (ret !== 0) {
            throw new Error('ffmpeg exit code ' + ret);
        }

        const data = await ffmpeg.readFile('output.mp4');
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile('output.mp4');

        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        encodeProgressCb = null;
        setPgPct(100);
        document.getElementById('progressFill').classList.add('done');
        await new Promise(r => setTimeout(r, 450));
        hideProgress();
        showResult(blob);
    } catch (e) {
        hideProgress();
        console.error(e);
        let msg = e.message || 'conversion failed';
        if (e.message === ENGINE_MISSING) msg = tr('engineMissing');
        handleError(msg);
    } finally {
        converting = false;
        encodeProgressCb = null;
        show(clearBtn);
    }
}

function showResult(blob) {
    setStatus(null);

    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = URL.createObjectURL(blob);

    const video = document.getElementById('resultVideo');
    video.src = resultUrl;
    video.load();
    video.play().catch(() => {});

    const base = file.name.replace(/\.[^.]+$/, '');
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.href = resultUrl;
    downloadBtn.download = base + '.mp4';

    show(document.getElementById('resultWrap'));
}

function clearFile() {
    if (converting) return;
    file = null;
    hideProgress();
    hide(document.getElementById('fileCard'));
    hide(document.getElementById('convertBtn'));
    hide(document.getElementById('resultWrap'));
    hide(document.getElementById('errorText'));
    hide(document.getElementById('warnText'));
    show(document.getElementById('dropZone'));
    setStatus(null);
    const imgPreview = document.getElementById('filePreview');
    const vidPreview = document.getElementById('fileVideoPreview');
    if (imgPreview.dataset.url) {
        URL.revokeObjectURL(imgPreview.dataset.url);
        imgPreview.removeAttribute('src');
    }
    if (vidPreview.dataset.url) {
        URL.revokeObjectURL(vidPreview.dataset.url);
        vidPreview.removeAttribute('src');
    }
    hide(vidPreview);
    show(imgPreview);
    if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
        resultUrl = null;
    }
}

async function handleFile(f) {
    if (!f) return;
    const isV = isVideo(f);
    if (!SUPPORTED_EXTS.includes('.' + f.name.split('.').pop().toLowerCase()) && !isV) {
        setStatus('badFormat');
        return;
    }

    resetError();
    file = f;

    const previewUrl = URL.createObjectURL(f);
    const imgPreview = document.getElementById('filePreview');
    const vidPreview = document.getElementById('fileVideoPreview');
    if (isV) {
        if (imgPreview.dataset.url) URL.revokeObjectURL(imgPreview.dataset.url);
        imgPreview.removeAttribute('src');
        hide(imgPreview);
        vidPreview.src = previewUrl;
        vidPreview.dataset.url = previewUrl;
        show(vidPreview);
        vidPreview.load();
        vidPreview.play().catch(() => {});
    } else {
        if (vidPreview.dataset.url) URL.revokeObjectURL(vidPreview.dataset.url);
        vidPreview.removeAttribute('src');
        hide(vidPreview);
        imgPreview.src = previewUrl;
        imgPreview.dataset.url = previewUrl;
        show(imgPreview);
    }
    document.getElementById('fileName').textContent = f.name;
    document.getElementById('fileInfo').textContent = formatSize(f.size);

    try {
        if (isV) {
            const { w, h, duration } = await loadVideoDims(f);
            videoDurationSec = duration || 0;
            [outputW, outputH] = computeOutputDims(w, h);
            document.getElementById('fileInfo').textContent = `${w}×${h} · ${formatSize(f.size)}`;
            document.getElementById('outputInfo').textContent = `→ ${outputW}×${outputH} · ${FPS}fps · MP4`;
        } else {
            const { w, h } = await loadImageDims(f);
            [outputW, outputH] = computeOutputDims(w, h);
            document.getElementById('fileInfo').textContent = `${w}×${h} · ${formatSize(f.size)}`;
            document.getElementById('outputInfo').textContent = `→ ${outputW}×${outputH} · ${DURATION}s · ${FPS}fps · MP4`;
        }
    } catch (e) {
        console.error(e);
        handleError(tr('err').replace('{msg}', 'decode failed'));
        return;
    }

    hide(document.getElementById('dropZone'));
    show(document.getElementById('fileCard'));
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.disabled = false;
    show(convertBtn);
    hide(document.getElementById('resultWrap'));

    setStatus('fileLoaded', { name: f.name });
}

function initImg2TgGif() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');

    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });
    fileInput.addEventListener('change', () => {
        handleFile(fileInput.files[0]);
        fileInput.value = '';
    });

    ['dragenter', 'dragover'].forEach(ev => dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    }));
    ['dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    }));
    dropZone.addEventListener('drop', (e) => {
        handleFile(e.dataTransfer.files[0]);
    });

    document.getElementById('convertBtn').addEventListener('click', convert);
    document.getElementById('clearBtn').addEventListener('click', clearFile);
    document.getElementById('newBtn').addEventListener('click', clearFile);

    const origSwitch = window.switchLanguage;
    if (origSwitch) {
        window.switchLanguage = function (lang) {
            origSwitch(lang);
            renderStatus();
        };
    }

    const errorEl = document.getElementById('errorText');
    if (location.protocol === 'file:') {
        console.error('Page opened via file:// — conversion will not work');
        errorEl.textContent = tr('fileProtocol');
        show(errorEl);
    } else if (window.__vendorErrors && window.__vendorErrors.length) {
        console.error('Vendor scripts failed to load:', window.__vendorErrors);
        errorEl.textContent = tr('engineMissing');
        show(errorEl);
    }
}
