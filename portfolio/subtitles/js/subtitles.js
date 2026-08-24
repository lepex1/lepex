// Subtitle preview player. Works grid rendering lives in /js/portfolio.js.
function showPreview(videoUrl) {
    const preview = document.getElementById('subtitlePreview');
    const player = document.getElementById('videoPlayer');

    const videoId = extractYouTubeId(videoUrl);
    if (videoId) {
        player.src = `https://www.youtube.com/embed/${videoId}?cc_load_policy=1&cc_lang_pref=ru`;
        preview.style.display = 'block';
        preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function extractYouTubeId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
}

function closePreview() {
    const preview = document.getElementById('subtitlePreview');
    const player = document.getElementById('videoPlayer');
    preview.style.display = 'none';
    player.src = '';
}
