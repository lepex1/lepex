const SUPPORTED_EXTS = ['.png', '.jpg', '.jpeg', '.bmp', '.webp', '.tiff', '.tif', '.gif', '.jfif'];
const MAX_DIM = 1280;
const DURATION = 3;
const FPS = 15;

const I18N = {
    fileLoaded: { ru: 'Файл загружен: {name}', en: 'File loaded: {name}' },
    preparing: { ru: 'Подготовка...', en: 'Preparing...' },
    converting: { ru: 'Конвертация...', en: 'Converting...' },
    badFormat: { ru: 'Неподдерживаемый формат. Используй PNG, JPG, BMP, WEBP, TIFF, GIF', en: 'Unsupported format. Use PNG, JPG, BMP, WEBP, TIFF, GIF' },
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
            const coreURL = await FFmpegUtil.toBlobURL(getVendorUrl('ffmpeg-core.js'), 'text/javascript', true);
            const wasmURL = await FFmpegUtil.toBlobURL(getVendorUrl('ffmpeg-core.wasm'), 'application/wasm');
            await ffmpeg.load({ coreURL, wasmURL });
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
    if (!file) return;
    resetError();
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.disabled = true;
    hide(convertBtn);
    setStatus('preparing');

    try {
        const canvas = await drawScaledToCanvas(file, outputW, outputH);
        const pngBlob = await new Promise((resolve, reject) => {
            canvas.toBlob(b => b ? resolve(b) : reject(new Error('canvas')), 'image/png');
        });

        const ffmpeg = await getFfmpeg();

        await ffmpeg.writeFile('input.png', new Uint8Array(await pngBlob.arrayBuffer()));

        const args = [
            '-y', '-loop', '1', '-i', 'input.png',
            '-c:v', 'libx264', '-t', String(DURATION), '-pix_fmt', 'yuv420p',
            '-profile:v', 'high',
            '-crf', '17', '-preset', 'veryslow', '-tune', 'stillimage',
            '-r', String(FPS),
            '-an', '-movflags', '+faststart',
            'output.mp4'
        ];

        const ret = await ffmpeg.exec(args);
        if (ret !== 0) {
            throw new Error('ffmpeg exit code ' + ret);
        }

        const data = await ffmpeg.readFile('output.mp4');
        await ffmpeg.deleteFile('input.png');
        await ffmpeg.deleteFile('output.mp4');

        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        showResult(blob);
    } catch (e) {
        console.error(e);
        let msg = e.message || 'conversion failed';
        if (e.message === ENGINE_MISSING) msg = tr('engineMissing');
        handleError(msg);
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
    file = null;
    hide(document.getElementById('fileCard'));
    hide(document.getElementById('convertBtn'));
    hide(document.getElementById('resultWrap'));
    hide(document.getElementById('errorText'));
    show(document.getElementById('dropZone'));
    setStatus(null);
    if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
        resultUrl = null;
    }
}

async function handleFile(f) {
    if (!f) return;
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_EXTS.includes(ext)) {
        setStatus('badFormat');
        return;
    }

    resetError();
    file = f;

    const previewUrl = URL.createObjectURL(f);
    document.getElementById('filePreview').src = previewUrl;
    const oldPreview = document.getElementById('filePreview').dataset.url;
    if (oldPreview) URL.revokeObjectURL(oldPreview);
    document.getElementById('filePreview').dataset.url = previewUrl;
    document.getElementById('fileName').textContent = f.name;
    document.getElementById('fileInfo').textContent = formatSize(f.size);

    const { w, h } = await loadImageDims(f);
    [outputW, outputH] = computeOutputDims(w, h);
    document.getElementById('fileInfo').textContent = `${w}×${h} · ${formatSize(f.size)}`;
    document.getElementById('outputInfo').textContent = `→ ${outputW}×${outputH} · ${DURATION}s · ${FPS}fps · MP4`;

    hide(document.getElementById('dropZone'));
    show(document.getElementById('fileCard'));
    show(document.getElementById('convertBtn'));
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
