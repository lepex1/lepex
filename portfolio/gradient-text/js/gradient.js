const gradients = {
    rainbow: 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #4169e1, #9370db)',
    sunset: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
    ocean: 'linear-gradient(90deg, #00d2ff, #3a7bd5, #00d2ff)',
    fire: 'linear-gradient(90deg, #f12711, #f5af19, #f12711)',
    purple: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
    neon: 'linear-gradient(90deg, #00f260, #0575e6, #ff00cc)',
    gold: 'linear-gradient(90deg, #ffd700, #ffed4e, #ffaf00, #ffd700)',
    cosmic: 'linear-gradient(90deg, #8e2de2, #4a00e0, #ff00cc, #333399)',
};

function initGradient() {
    const gradientList = document.getElementById('gradientList');
    const gradientName = document.getElementById('gradientName');
    const fontSize = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const textInput = document.getElementById('textInput');
    const showButton = document.getElementById('showButton');
    const backButton = document.getElementById('backButton');
    const editor = document.getElementById('editor');
    const display = document.getElementById('display');
    const outputText = document.getElementById('outputText');
    const fontSizeLabel = document.getElementById('fontSizeLabel');

    let selectedGradient = 'rainbow';

    function applyGradientPlaceholder() {
        const ru = textInput.getAttribute('data-placeholder-ru');
        const en = textInput.getAttribute('data-placeholder-en');
        textInput.placeholder = currentLanguage === 'ru' ? ru : en;
    }

    function applyGradientLabels() {
        if (fontSizeLabel) {
            const labelRu = 'Размер шрифта:';
            const labelEn = 'Font Size:';
            const text = (currentLanguage === 'ru' ? labelRu : labelEn) + ' ';
            if (fontSizeLabel.firstChild && fontSizeLabel.firstChild.nodeType === 3) {
                fontSizeLabel.firstChild.textContent = text;
            }
        }
    }

    applyGradientPlaceholder();
    applyGradientLabels();

    const origSwitch = window.switchLanguage;
    if (origSwitch) {
        window.switchLanguage = function(lang) {
            origSwitch(lang);
            applyGradientPlaceholder();
            applyGradientLabels();
        };
    }

    Object.keys(gradients).forEach((key) => {
        const btn = document.createElement('div');
        btn.classList.add('gradient-btn');
        btn.style.background = gradients[key];
        if (key === selectedGradient) btn.classList.add('active');
        btn.addEventListener('click', () => {
            document.querySelectorAll('.gradient-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGradient = key;
            gradientName.textContent = key;
        });
        gradientList.appendChild(btn);
    });

    fontSize.addEventListener('input', () => {
        fontSizeValue.textContent = fontSize.value;
    });

    showButton.addEventListener('click', () => {
        const size = fontSize.value + 'px';
        outputText.textContent = textInput.value || (currentLanguage === 'ru' ? 'Введите текст!' : 'Type something!');
        outputText.style.fontSize = size;
        outputText.style.background = gradients[selectedGradient];
        outputText.style.backgroundSize = '200% 200%';
        outputText.style.webkitBackgroundClip = 'text';
        outputText.style.webkitTextFillColor = 'transparent';
        outputText.style.animation = 'gradient 6s ease infinite';
        outputText.style.textShadow = '0 0 60px rgba(255,255,255,0.2)';

        editor.classList.add('hidden');
        display.classList.remove('hidden');
    });

    backButton.addEventListener('click', () => {
        display.classList.add('hidden');
        editor.classList.remove('hidden');
    });
}
