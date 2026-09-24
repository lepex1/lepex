// Local static host for dist/ with automatic trailing slashes.
//
// Any extensionless URL that maps to a directory with index.html
// (e.g. /portfolio) gets a 301 redirect to the slashed form (/portfolio/).
// File URLs (.css, .js, .pdf, ...) are served as-is, no redirects.
// Mirrors the production rewrites from vercel.json (config.yml).
//
// Usage: node scripts/serve-local.mjs [--host 127.0.0.1] [--port 4173] [--dir dist] [--open]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
    const i = argv.indexOf(name);
    return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};
const HOST = opt('--host', '127.0.0.1');
const PORT = Number(opt('--port', '4173'));
const distDir = path.resolve(repoRoot, opt('--dir', 'dist'));
const OPEN = argv.includes('--open');

// Same mapping as vercel.json rewrites (prod parity for local preview).
const REWRITES = {
    '/portfolio/subtitles/config.yml': '/portfolio/subtitles/admin/config.yml',
};

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.rss': 'application/rss+xml; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.pdf': 'application/pdf',
    '.srt': 'text/plain; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.yml': 'text/yaml; charset=utf-8',
    '.yaml': 'text/yaml; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
    '.mp4': 'video/mp4',
    '.vtt': 'text/vtt; charset=utf-8',
};

const sendFile = (res, file, status = 200, method = 'GET') => {
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(method === 'HEAD' ? null : 'not found');
            return;
        }
        res.writeHead(status, {
            'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
            'Content-Length': data.length,
        });
        res.end(method === 'HEAD' ? null : data);
    });
};

const send404 = (res, method) => sendFile(res, path.join(distDir, '404.html'), 404, method);

const server = http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405);
        res.end();
        return;
    }
    const url = new URL(req.url, 'http://localhost');
    let p = REWRITES[url.pathname] || decodeURIComponent(url.pathname);

    // Block path escape: resolved path must stay inside dist.
    const fsPath = path.normalize(path.join(distDir, p));
    if (fsPath !== distDir && !fsPath.startsWith(distDir + path.sep)) {
        send404(res, req.method);
        return;
    }

    fs.stat(fsPath, (err, st) => {
        if (!err && st.isFile()) {
            sendFile(res, fsPath, 200, req.method);
            return;
        }
        if (!err && st.isDirectory()) {
            // Auto trailing slash: /portfolio -> /portfolio/ (query preserved).
            if (!p.endsWith('/')) {
                res.writeHead(301, { Location: p + '/' + url.search });
                res.end();
                return;
            }
            sendFile(res, path.join(fsPath, 'index.html'), 200, req.method);
            return;
        }
        send404(res, req.method);
    });
});

server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}/`;
    console.log(`Serving ${distDir}`);
    console.log(`Local: ${url} (Ctrl+C or close window to stop)`);
    if (OPEN) {
        const cmd = process.platform === 'win32' ? `start "" "${url}"`
            : process.platform === 'darwin' ? `open "${url}"`
            : `xdg-open "${url}"`;
        exec(cmd);
    }
});
