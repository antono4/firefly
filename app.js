// === Lumina AI - Image Generator with Real AI ===
const state = {
    prompt: '',
    aspectRatio: '1:1',
    style: 'photorealistic',
    quality: 4,
    isGenerating: false,
    currentImage: null,
    history: [],
    settings: {
        apiProvider: 'huggingface',
        useRealAI: false,
        hfToken: '',
        openaiKey: '',
        stabilityKey: ''
    }
};

const elements = {};

const inspirationPrompts = [
    "A bioluminescent underwater city where ancient coral structures",
    "Steampunk Victorian-era airship docked at floating garden",
    "Samurai on cliff edge during dramatic typhoon",
    "Cozy bookshop inside a giant sleeping dragon",
    "Hyper-detailed macro photography of raindrop on leaf",
    "Art Deco cityscape from 1920s",
    "Forest clearing with magical deer",
    "Cyberpunk street food vendor stall"
];

const stylePresets = {
    photorealistic: { prompt: "photorealistic, ultra detailed, 8K, professional photography" },
    'digital-art': { prompt: "digital art, concept art, digital painting, vibrant colors" },
    'concept-art': { prompt: "concept art, artstation, detailed environment, cinematic" },
    anime: { prompt: "anime style, Studio Ghibli inspired, anime art" },
    '3d-render': { prompt: "3D render, Cinema 4D, Octane render, ray tracing" },
    'oil-painting': { prompt: "oil painting, classical art, brush strokes, museum quality" }
};

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    elements.promptInput = document.getElementById('prompt-input');
    elements.generateBtn = document.getElementById('generate-btn');
    elements.canvasContainer = document.getElementById('canvas-container');
    elements.canvasPlaceholder = document.querySelector('.canvas-placeholder');
    elements.canvasLoading = document.getElementById('canvas-loading');
    elements.outputCanvas = document.getElementById('output-canvas');
    elements.canvasActions = document.getElementById('canvas-actions');
    elements.styleBadge = document.getElementById('style-badge');
    elements.ratioBadge = document.getElementById('ratio-badge');
    elements.qualitySlider = document.getElementById('quality-slider');
    elements.inspirationText = document.getElementById('inspiration-text');
    elements.shufflePrompt = document.getElementById('shuffle-prompt');
    elements.toast = document.getElementById('toast');
    elements.historyList = document.getElementById('history-list');
    elements.historyEmpty = document.getElementById('history-empty');
    elements.clearHistory = document.getElementById('clear-history');
    elements.settingsModal = document.getElementById('settings-modal');
    elements.settingsBtn = document.getElementById('settings-btn');
    elements.closeSettingsBtn = document.getElementById('close-settings');
    elements.saveSettingsBtn = document.getElementById('save-settings');
    elements.useRealAICheckbox = document.getElementById('use-real-ai');
    
    loadFromStorage();
    loadSettings();
    initializeEventListeners();
    renderHistory();
    showInspirationPrompt();
}

function loadFromStorage() {
    const savedHistory = localStorage.getItem('lumina_history');
    if (savedHistory) { try { state.history = JSON.parse(savedHistory); } catch (e) { state.history = []; } }
}

function saveToStorage() {
    localStorage.setItem('lumina_history', JSON.stringify(state.history));
}

function loadSettings() {
    const savedSettings = localStorage.getItem('lumina_settings');
    if (savedSettings) { try { state.settings = { ...state.settings, ...JSON.parse(savedSettings) }; } catch (e) {} }
    if (elements.useRealAICheckbox) elements.useRealAICheckbox.checked = state.settings.useRealAI;
    const providerRadio = document.querySelector(`input[name="api-provider"][value="${state.settings.apiProvider}"]`);
    if (providerRadio) { providerRadio.checked = true; updateProviderInputs(); }
    if (document.getElementById('hf-token')) document.getElementById('hf-token').value = state.settings.hfToken || '';
}

function saveSettings() {
    const providerRadio = document.querySelector('input[name="api-provider"]:checked');
    state.settings.apiProvider = providerRadio ? providerRadio.value : 'huggingface';
    state.settings.useRealAI = elements.useRealAICheckbox ? elements.useRealAICheckbox.checked : false;
    state.settings.hfToken = document.getElementById('hf-token')?.value || '';
    localStorage.setItem('lumina_settings', JSON.stringify(state.settings));
    showToast('Settings saved!', 'success');
    closeSettingsModal();
}

function openSettingsModal() { if (elements.settingsModal) elements.settingsModal.classList.add('active'); }
function closeSettingsModal() { if (elements.settingsModal) elements.settingsModal.classList.remove('active'); }
function updateProviderInputs() {
    const providerRadio = document.querySelector('input[name="api-provider"]:checked');
    const hfToken = document.getElementById('hf-token');
    if (hfToken) hfToken.disabled = providerRadio?.value !== 'huggingface';
}

function initializeEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => { btn.addEventListener('click', () => switchTab(btn.dataset.tab)); });
    elements.promptInput.addEventListener('input', (e) => { state.prompt = e.target.value; });
    document.querySelector('.btn-magic').addEventListener('click', enhancePrompt);
    document.querySelectorAll('.ratio-btn').forEach(btn => { btn.addEventListener('click', () => selectRatio(btn)); });
    document.querySelectorAll('.style-btn').forEach(btn => { btn.addEventListener('click', () => selectStyle(btn)); });
    elements.qualitySlider.addEventListener('input', (e) => { state.quality = parseInt(e.target.value); });
    elements.generateBtn.addEventListener('click', handleGenerate);
    elements.shufflePrompt.addEventListener('click', showInspirationPrompt);
    document.querySelectorAll('.quick-prompt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prompt = e.target.dataset.prompt || e.target.closest('.quick-prompt').dataset.prompt;
            if (elements.promptInput) elements.promptInput.value = prompt;
            state.prompt = prompt;
        });
    });
    elements.clearHistory.addEventListener('click', clearHistory);
    document.querySelectorAll('.action-btn').forEach((btn, index) => { btn.addEventListener('click', () => handleCanvasAction(index)); });
    if (elements.settingsBtn) elements.settingsBtn.addEventListener('click', openSettingsModal);
    if (elements.closeSettingsBtn) elements.closeSettingsBtn.addEventListener('click', closeSettingsModal);
    if (elements.saveSettingsBtn) elements.saveSettingsBtn.addEventListener('click', saveSettings);
    document.querySelectorAll('input[name="api-provider"]').forEach(radio => { radio.addEventListener('change', updateProviderInputs); });
    if (elements.settingsModal) { elements.settingsModal.addEventListener('click', (e) => { if (e.target === elements.settingsModal) closeSettingsModal(); }); }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey && !state.isGenerating) handleGenerate();
        if (e.key === 'Escape' && elements.settingsModal?.classList.contains('active')) closeSettingsModal();
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-btn').forEach(btn => { btn.classList.toggle('active', btn.dataset.tab === tabName); });
    document.querySelectorAll('section').forEach(section => { section.classList.remove('active'); });
    document.getElementById(`${tabName}-section`).classList.add('active');
    if (tabName === 'history') renderHistory();
}

function enhancePrompt() {
    const currentPrompt = elements.promptInput.value.trim() || state.prompt;
    if (!currentPrompt) { showToast('Please enter a prompt first'); return; }
    const preset = stylePresets[state.style];
    if (elements.promptInput) elements.promptInput.value = `${currentPrompt}, ${preset.prompt}`;
    state.prompt = `${currentPrompt}, ${preset.prompt}`;
    showToast('Prompt enhanced!', 'info');
}

function selectRatio(btn) {
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.aspectRatio = btn.dataset.ratio;
    elements.ratioBadge.textContent = state.aspectRatio;
}

function selectStyle(btn) {
    document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.style = btn.dataset.style;
    elements.styleBadge.textContent = state.style.replace('-', ' ');
}

async function handleGenerate() {
    const textareaValue = elements.promptInput ? elements.promptInput.value.trim() : '';
    const currentPrompt = textareaValue || state.prompt;
    if (!currentPrompt) { showToast('Please enter a prompt'); if (elements.promptInput) elements.promptInput.focus(); return; }
    state.prompt = currentPrompt;
    if (state.isGenerating) return;
    state.isGenerating = true;
    updateGenerateButton();
    if (elements.canvasPlaceholder) elements.canvasPlaceholder.style.display = 'none';
    if (elements.outputCanvas) elements.outputCanvas.classList.remove('active');
    if (elements.canvasLoading) elements.canvasLoading.classList.add('active');
    try {
        let imageData;
        if (state.settings.useRealAI && state.settings.hfToken) {
            showToast('Generating with AI...', 'info');
            imageData = await generateWithAI(state.prompt, state.style);
        } else {
            showToast('Generating...', 'info');
            imageData = generateProceduralImage(state.prompt, state.style);
        }
        displayGeneratedImage(imageData);
        saveToHistory(state.prompt, imageData, state.style, state.aspectRatio);
        showToast('Image generated!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error: ' + error.message, 'error');
    } finally {
        state.isGenerating = false;
        updateGenerateButton();
        if (elements.canvasLoading) elements.canvasLoading.classList.remove('active');
    }
}

async function generateWithAI(prompt, style) {
    const stylePreset = stylePresets[style] || stylePresets['digital-art'];
    const fullPrompt = `${prompt}, ${stylePreset.prompt}`;
    showToast('Connecting to MiniMax AI...', 'info');
    const response = await fetch(
        "https://api-inference.huggingface.co/models/MiniMaxAI/MiniMax-H3",
        {
            method: "POST",
            headers: { "Authorization": `Bearer ${state.settings.hfToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ inputs: fullPrompt, parameters: { guidance_scale: 7.5, num_inference_steps: 30 } })
        }
    );
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API Error: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function generateProceduralImage(prompt, style) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const [w, h] = state.aspectRatio.split(':').map(Number);
    canvas.width = 512; canvas.height = Math.round(512 * h / w);
    
    const colorSchemes = {
        photorealistic: [['#2d4a6f', '#5a7fa8', '#8eb3d9']],
        'digital-art': [['#1a1a3e', '#4a3f8a', '#8a6fd4']],
        'concept-art': [['#2d1b4e', '#5a3d8a', '#9a6fd4']],
        anime: [['#ff9a9e', '#fecfef', '#ffe4e6']],
        '3d-render': [['#e8e8e8', '#d4d4d4', '#a8a8a8']],
        'oil-painting': [['#8b4513', '#cd853f', '#deb887']]
    };
    const colors = colorSchemes[style]?.[0] || colorSchemes['digital-art'][0];
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * canvas.width, y = Math.random() * canvas.height, size = 20 + Math.random() * 60;
        ctx.save(); ctx.globalAlpha = 0.1 + Math.random() * 0.2;
        const radGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
        radGrad.addColorStop(0, 'rgba(255,255,255,0.8)'); radGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = radGrad; ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 15;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
}

function displayGeneratedImage(imageData) {
    const img = new Image();
    img.onload = () => {
        const ctx = elements.outputCanvas.getContext('2d');
        elements.outputCanvas.width = img.width;
        elements.outputCanvas.height = img.height;
        const containerWidth = elements.canvasContainer.clientWidth;
        const containerHeight = elements.canvasContainer.clientHeight;
        let drawWidth = img.width, drawHeight = img.height;
        if (drawWidth > drawHeight) { drawHeight = containerHeight * 0.9; drawWidth = drawHeight * (img.width / img.height); }
        else { drawWidth = containerWidth * 0.9; drawHeight = drawWidth * (img.height / img.width); }
        elements.outputCanvas.style.width = `${drawWidth}px`;
        elements.outputCanvas.style.height = `${drawHeight}px`;
        ctx.drawImage(img, 0, 0);
        state.currentImage = imageData;
        elements.outputCanvas.classList.add('active');
        elements.canvasActions.classList.add('visible');
    };
    img.src = imageData;
}

function updateGenerateButton() {
    if (!elements.generateBtn) return;
    elements.generateBtn.classList.toggle('loading', state.isGenerating);
    elements.generateBtn.disabled = state.isGenerating;
}

function saveToHistory(prompt, imageData, style, ratio) {
    const entry = { id: Date.now(), prompt, imageData, style, ratio, timestamp: new Date().toISOString() };
    state.history.unshift(entry);
    if (state.history.length > 50) state.history = state.history.slice(0, 50);
    saveToStorage();
    renderHistory();
}

function downloadImage() {
    if (state.currentImage) {
        const link = document.createElement('a');
        link.download = `lumina-${Date.now()}.png`;
        link.href = state.currentImage;
        link.click();
        showToast('Downloaded!');
    }
}

function renderHistory() {
    if (state.history.length === 0) { elements.historyList.innerHTML = ''; elements.historyEmpty.classList.add('visible'); return; }
    elements.historyEmpty.classList.remove('visible');
    elements.historyList.innerHTML = state.history.map(item => `
        <div class="history-item" onclick="reusePrompt('${item.id}')">
            <div class="history-item-thumb"><img src="${item.imageData}" alt="${item.prompt}"></div>
            <div class="history-item-content">
                <p class="history-item-prompt">${item.prompt}</p>
                <div class="history-item-meta">
                    <span class="history-item-style">${item.style.replace('-', ' ')}</span>
                    <span class="history-item-time">${getTimeAgo(new Date(item.timestamp))}</span>
                </div>
            </div>
            <div class="history-item-actions">
                <button class="action-btn" title="Download" onclick="event.stopPropagation(); downloadHistoryImage('${item.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function downloadHistoryImage(id) {
    const item = state.history.find(i => i.id == id);
    if (item) { const link = document.createElement('a'); link.download = `lumina-${item.id}.png`; link.href = item.imageData; link.click(); showToast('Downloaded!'); }
}

function reusePrompt(id) {
    const item = state.history.find(i => i.id == id);
    if (item) { if (elements.promptInput) elements.promptInput.value = item.prompt; state.prompt = item.prompt; switchTab('create'); }
}

function clearHistory() {
    if (confirm('Clear all history?')) { state.history = []; saveToStorage(); renderHistory(); showToast('History cleared'); }
}

function handleCanvasAction(index) {
    switch(index) {
        case 0: downloadImage(); break;
        case 1: showToast('Share ready'); break;
        case 2: showToast('Modify prompt'); break;
        case 3: showToast('Saved in history'); break;
    }
}

function showInspirationPrompt() {
    const randomIndex = Math.floor(Math.random() * inspirationPrompts.length);
    if (elements.inspirationText) {
        elements.inspirationText.style.opacity = '0';
        setTimeout(() => { elements.inspirationText.textContent = inspirationPrompts[randomIndex]; elements.inspirationText.style.opacity = '1'; }, 200);
        elements.inspirationText.parentElement.onclick = () => {
            if (elements.promptInput) elements.promptInput.value = inspirationPrompts[randomIndex];
            state.prompt = inspirationPrompts[randomIndex];
        };
    }
}

function showToast(message, type = '') {
    elements.toast.className = 'toast visible';
    if (type) elements.toast.classList.add(type);
    const msgEl = elements.toast.querySelector('.toast-message');
    if (msgEl) msgEl.textContent = message;
    setTimeout(() => { elements.toast.classList.remove('visible'); }, 3000);
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
    for (const [unit, secondsInUnit] of Object.entries(intervals)) { const interval = Math.floor(seconds / secondsInUnit); if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`; }
    return 'Just now';
}

window.downloadHistoryImage = downloadHistoryImage;
window.reusePrompt = reusePrompt;
