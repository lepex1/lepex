let customPresets = JSON.parse(localStorage.getItem('gradient:presets') || '[]');

function initializeCustomizer() {
    renderPresets();

    const saveBtn = document.getElementById('savePresetBtn');
    const exportBtn = document.getElementById('exportCssBtn');

    if (saveBtn) saveBtn.addEventListener('click', saveCurrentPreset);
    if (exportBtn) exportBtn.addEventListener('click', exportCSS);
}

function getCurrentGradientColors() {
    const outputText = document.getElementById('outputText');
    if (!outputText) return [];

    const bg = outputText.style.background;
    const match = bg.match(/linear-gradient\([^,]+,\s*(.+)\)/);
    if (!match) return [];

    return match[1].split(',').map(c => c.trim());
}

function applyGradientColors(colors) {
    const outputText = document.getElementById('outputText');
    if (!outputText) return;

    outputText.style.background = `linear-gradient(90deg, ${colors.join(', ')})`;
    outputText.style.backgroundSize = '200% 200%';
    outputText.style.webkitBackgroundClip = 'text';
    outputText.style.webkitTextFillColor = 'transparent';
    outputText.style.animation = 'gradient 6s ease infinite';
}

function saveCurrentPreset() {
    const ru = currentLanguage === 'ru';
    const name = prompt(ru ? 'Название пресета:' : 'Preset name:');
    if (!name) return;

    const colors = getCurrentGradientColors();
    if (colors.length === 0) {
        alert(ru ? 'Сначала создайте градиент!' : 'Create a gradient first!');
        return;
    }

    customPresets.unshift({ name, colors, timestamp: Date.now() });
    if (customPresets.length > 20) customPresets.pop();

    try {
        localStorage.setItem('gradient:presets', JSON.stringify(customPresets));
    } catch (e) {
        console.warn('Failed to save preset:', e);
    }
    renderPresets();
}

function renderPresets() {
    const container = document.getElementById('presetsContainer');
    if (!container) return;

    if (customPresets.length === 0) {
        const ru = currentLanguage === 'ru';
        container.innerHTML = `<p class="presets-empty">${ru ? 'Нет сохранённых пресетов' : 'No saved presets yet'}</p>`;
        return;
    }

    container.innerHTML = customPresets.map((preset, index) => `
        <div class="preset-item" onclick="applyPreset(${index})">
            <div class="preset-preview" style="background: linear-gradient(90deg, ${preset.colors.join(', ')})"></div>
            <div class="preset-name">${preset.name}</div>
            <button class="preset-delete" onclick="deletePreset(${index}); event.stopPropagation();" aria-label="Delete">×</button>
        </div>
    `).join('');
}

function applyPreset(index) {
    const preset = customPresets[index];
    if (preset && typeof applyGradientColors === 'function') {
        applyGradientColors(preset.colors);
    }
}

function deletePreset(index) {
    const ru = currentLanguage === 'ru';
    if (!confirm(ru ? 'Удалить этот пресет?' : 'Delete this preset?')) return;

    customPresets.splice(index, 1);
    try {
        localStorage.setItem('gradient:presets', JSON.stringify(customPresets));
    } catch (e) {
        console.warn('Failed to delete preset:', e);
    }
    renderPresets();
}

function exportCSS() {
    const colors = getCurrentGradientColors();
    if (colors.length === 0) {
        const ru = currentLanguage === 'ru';
        alert(ru ? 'Сначала создайте градиент!' : 'Create a gradient first!');
        return;
    }

    const css = `background: linear-gradient(90deg, ${colors.join(', ')});
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;`;

    navigator.clipboard.writeText(css).then(() => {
        const ru = currentLanguage === 'ru';
        alert(ru ? 'CSS скопирован в буфер обмена!' : 'CSS copied to clipboard!');
    }).catch(() => {
        prompt('CSS code:', css);
    });
}
