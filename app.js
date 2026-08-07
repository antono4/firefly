// === Lumina AI - Creative Image Generator with Real AI ===
// Application State
const state = {
    prompt: '',
    aspectRatio: '1:1',
    style: 'photorealistic',
    quality: 4,
    isGenerating: false,
    currentImage: null,
    gallery: [],
    history: [],
    settings: {
        apiProvider: 'huggingface',
        useRealAI: false,
        hfToken: '',
        openaiKey: '',
        stabilityKey: ''
    }
};

// === DOM Elements ===
const elements = {
    promptInput: null,
    generateBtn: null,
    canvasContainer: null,
    canvasPlaceholder: null,
    canvasLoading: null,
    outputCanvas: null,
    canvasActions: null,
    styleBadge: null,
    ratioBadge: null,
    qualitySlider: null,
    inspirationText: null,
    shufflePrompt: null,
    toast: null,
    galleryGrid: null,
    galleryEmpty: null,
    historyList: null,
    historyEmpty: null,
    clearHistory: null,
    settingsModal: null,
    settingsBtn: null,
    closeSettingsBtn: null,
    saveSettingsBtn: null,
    useRealAICheckbox: null
};

// === Inspiration Prompts ===
const inspirationPrompts = [
    "A bioluminescent underwater city where ancient coral structures have evolved into futuristic architecture",
    "Steampunk Victorian-era airship docked at a floating garden in the clouds",
    "Samurai standing on a cliff edge during a dramatic typhoon with lightning",
    "A cozy bookshop that exists inside a giant sleeping dragon",
    "Hyper-detailed macro photography of a raindrop landing on a leaf",
    "Art Deco cityscape from the 1920s with golden spires",
    "A forest clearing where magical deer with crystalline antlers gather",
    "Cyberpunk street food vendor stall in neon-lit alley"
];

// === Style Presets ===
const stylePresets = {
    photorealistic: {
        prompt: "photorealistic, ultra detailed, 8K, professional photography, natural lighting, high dynamic range"
    },
    'digital-art': {
        prompt: "digital art, concept art, digital painting, detailed, vibrant colors, rich saturation"
    },
    'concept-art': {
        prompt: "concept art, artstation, trending, detailed environment, matte painting, cinematic colors"
    },
    anime: {
        prompt: "anime style, Studio Ghibli inspired, anime art, cel shaded, beautiful background"
    },
    '3d-render': {
        prompt: "3D render, Cinema 4D, Octane render, ray tracing, professional studio lighting"
    },
    'oil-painting': {
        prompt: "oil painting, classical art, brush strokes visible, museum quality, fine art, Renaissance style"
    }
};

// === Initialize Application ===
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
    elements.galleryGrid = document.getElementById('gallery-grid');
    elements.galleryEmpty = document.getElementById('gallery-empty');
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
    updateUI();
    showInspirationPrompt();
}

function loadFromStorage() {
    const savedGallery = localStorage.getItem('lumina_gallery');
    const savedHistory = localStorage.getItem('lumina_history');
    if (savedGallery) { try { state.gallery = JSON.parse(savedGallery); } catch (e) { state.gallery = []; } }
    if (savedHistory) { try { state.history = JSON.parse(savedHistory); } catch (e) { state.history = []; } }
}

function saveToStorage() {
    localStorage.setItem('lumina_gallery', JSON.stringify(state.gallery));
    localStorage.setItem('lumina_history', JSON.stringify(state.history));
}

function loadSettings() {
    const savedSettings = localStorage.getItem('lumina_settings');
    if (savedSettings) { try { state.settings = { ...state.settings, ...JSON.parse(savedSettings) }; } catch (e) {} }
    if (elements.useRealAICheckbox) elements.useRealAICheckbox.checked = state.settings.useRealAI;
    const providerRadio = document.querySelector(`input[name="api-provider"][value="${state.settings.apiProvider}"]`);
    if (providerRadio) { providerRadio.checked = true; updateProviderInputs(); }
    const hfToken = document.getElementById('hf-token');
    const openaiKey = document.getElementById('openai-key');
    const stabilityKey = document.getElementById('stability-key');
    if (hfToken) hfToken.value = state.settings.hfToken || '';
    if (openaiKey) openaiKey.value = state.settings.openaiKey || '';
    if (stabilityKey) stabilityKey.value = state.settings.stabilityKey || '';
}

function saveSettings() {
    const providerRadio = document.querySelector('input[name="api-provider"]:checked');
    state.settings.apiProvider = providerRadio ? providerRadio.value : 'huggingface';
    state.settings.useRealAI = elements.useRealAICheckbox ? elements.useRealAICheckbox.checked : false;
    const hfToken = document.getElementById('hf-token');
    const openaiKey = document.getElementById('openai-key');
    const stabilityKey = document.getElementById('stability-key');
    state.settings.hfToken = hfToken ? hfToken.value : '';
    state.settings.openaiKey = openaiKey ? openaiKey.value : '';
    state.settings.stabilityKey = stabilityKey ? stabilityKey.value : '';
    localStorage.setItem('lumina_settings', JSON.stringify(state.settings));
    showToast('Settings saved!', 'success');
    closeSettingsModal();
}

function openSettingsModal() { if (elements.settingsModal) elements.settingsModal.classList.add('active'); }
function closeSettingsModal() { if (elements.settingsModal) elements.settingsModal.classList.remove('active'); }

function updateProviderInputs() {
    const providerRadio = document.querySelector('input[name="api-provider"]:checked');
    const hfToken = document.getElementById('hf-token');
    const openaiKey = document.getElementById('openai-key');
    const stabilityKey = document.getElementById('stability-key');
    if (hfToken) hfToken.disabled = providerRadio?.value !== 'huggingface';
    if (openaiKey) openaiKey.disabled = providerRadio?.value !== 'openai';
    if (stabilityKey) stabilityKey.disabled = providerRadio?.value !== 'stability';
}

function initializeEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => { btn.addEventListener('click', () => switchTab(btn.dataset.tab)); });
    elements.promptInput.addEventListener('input', updatePrompt);
    elements.promptInput.addEventListener('change', updatePrompt);
    document.querySelector('.btn-magic').addEventListener('click', enhancePrompt);
    document.querySelectorAll('.ratio-btn').forEach(btn => { btn.addEventListener('click', () => selectRatio(btn)); });
    document.querySelectorAll('.style-btn').forEach(btn => { btn.addEventListener('click', () => selectStyle(btn)); });
    elements.qualitySlider.addEventListener('input', (e) => { state.quality = parseInt(e.target.value); });
    elements.generateBtn.addEventListener('click', handleGenerate);
    elements.shufflePrompt.addEventListener('click', showInspirationPrompt);
    document.querySelectorAll('.quick-prompt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prompt = e.target.dataset.prompt || e.target.closest('.quick-prompt').dataset.prompt;
            applyPrompt(prompt);
        });
    });
    document.querySelectorAll('.filter-btn').forEach(btn => { btn.addEventListener('click', () => filterGallery(btn.dataset.filter)); });
    elements.clearHistory.addEventListener('click', clearHistory);
    document.querySelectorAll('.action-btn').forEach((btn, index) => { btn.addEventListener('click', () => handleCanvasAction(index)); });
    if (elements.settingsBtn) elements.settingsBtn.addEventListener('click', openSettingsModal);
    if (elements.closeSettingsBtn) elements.closeSettingsBtn.addEventListener('click', closeSettingsModal);
    if (elements.saveSettingsBtn) elements.saveSettingsBtn.addEventListener('click', saveSettings);
    document.querySelectorAll('input[name="api-provider"]').forEach(radio => { radio.addEventListener('change', updateProviderInputs); });
    if (elements.settingsModal) {
        elements.settingsModal.addEventListener('click', (e) => { if (e.target === elements.settingsModal) closeSettingsModal(); });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey && !state.isGenerating) handleGenerate();
        if (e.key === 'Escape' && elements.settingsModal?.classList.contains('active')) closeSettingsModal();
    });
}

function updatePrompt(e) { state.prompt = e.target.value; }
function applyPrompt(prompt) { if (!prompt) return; state.prompt = prompt; if (elements.promptInput) elements.promptInput.value = prompt; }

function switchTab(tabName) {
    document.querySelectorAll('.nav-btn').forEach(btn => { btn.classList.toggle('active', btn.dataset.tab === tabName); });
    document.querySelectorAll('section').forEach(section => { section.classList.remove('active'); });
    document.getElementById(`${tabName}-section`).classList.add('active');
    if (tabName === 'gallery') renderGallery();
    else if (tabName === 'history') renderHistory();
}

function enhancePrompt() {
    const currentPrompt = elements.promptInput.value.trim() || state.prompt;
    if (!currentPrompt) { showToast('Please enter a prompt first'); return; }
    const preset = stylePresets[state.style];
    applyPrompt(`${currentPrompt}, ${preset.prompt}`);
    showToast('Prompt enhanced with style keywords!', 'info');
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
    if (!currentPrompt) { showToast('Please enter a prompt to generate'); if (elements.promptInput) elements.promptInput.focus(); return; }
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
        showToast('Image generated successfully!', 'success');
    } catch (error) {
        console.error('Generation error:', error);
        showToast('Failed to generate: ' + error.message, 'error');
    } finally {
        state.isGenerating = false;
        updateGenerateButton();
        if (elements.canvasLoading) elements.canvasLoading.classList.remove('active');
    }
}

async function generateWithAI(prompt, style) {
    const stylePreset = stylePresets[style] || stylePresets['digital-art'];
    const fullPrompt = `${prompt}, ${stylePreset.prompt}`;
    
    showToast('Connecting to MiniMax AI model...', 'info');
    
    const response = await fetch(
        "https://api-inference.huggingface.co/models/MiniMaxAI/MiniMax-H3",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${state.settings.hfToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: fullPrompt,
                parameters: {
                    guidance_scale: state.quality >= 4 ? 7.5 : 5,
                    num_inference_steps: state.quality >= 4 ? 30 : 20,
                    width: 512,
                    height: 512
                }
            })
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
    const maxDim = 512;
    if (w > h) { canvas.width = maxDim; canvas.height = Math.round(maxDim * h / w); }
    else { canvas.height = maxDim; canvas.width = Math.round(maxDim * w / h); }
    
    const colorSchemes = {
        photorealistic: [['#2d4a6f', '#5a7fa8', '#8eb3d9'], ['#3d2b4f', '#6b4d8a', '#9a7bc5']],
        'digital-art': [['#1a1a3e', '#4a3f8a', '#8a6fd4'], ['#0f2d4a', '#2d6b8a', '#5aa8c4']],
        'concept-art': [['#2d1b4e', '#5a3d8a', '#9a6fd4'], ['#1b3d2d', '#3d6b5a', '#6ba88a']],
        anime: [['#ff9a9e', '#fecfef', '#ffe4e6'], ['#a8edea', '#fed6e3', '#d299c2']],
        '3d-render': [['#e8e8e8', '#d4d4d4', '#a8a8a8'], ['#2a2a3a', '#4a4a6a', '#7a7a9a']],
        'oil-painting': [['#8b4513', '#cd853f', '#deb887'], ['#2f4f4f', '#556b2f', '#8fbc8f']]
    };
    const schemes = colorSchemes[style] || colorSchemes['digital-art'];
    const colors = schemes[Math.floor(Math.random() * schemes.length)];
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * canvas.width, y = Math.random() * canvas.height, size = 20 + Math.random() * 60;
        ctx.save();
        ctx.globalAlpha = 0.1 + Math.random() * 0.2;
        if (Math.random() > 0.5) {
            const radGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
            radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = radGrad;
            ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x - size/2, y - size/2, size, size * 0.6);
        }
        ctx.restore();
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 15;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
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

function updateGenerateButton() { if (!elements.generateBtn) return; elements.generateBtn.classList.toggle('loading', state.isGenerating); elements.generateBtn.disabled = state.isGenerating; }

function saveToHistory(prompt, imageData, style, ratio) {
    const entry = { id: Date.now(), prompt, imageData, style, ratio, timestamp: new Date().toISOString() };
    state.history.unshift(entry);
    state.gallery.unshift({ ...entry, isFavorite: false });
    if (state.history.length > 50) state.history = state.history.slice(0, 50);
    saveToStorage();
    renderGallery();
    renderHistory();
}

function renderGallery(filter = 'all') {
    let items = [...state.gallery];
    if (filter === 'favorites') items = items.filter(item => item.isFavorite);
    else if (filter === 'recent') items = items.slice(0, 12);
    if (items.length === 0) { elements.galleryGrid.innerHTML = ''; elements.galleryEmpty.classList.add('visible'); return; }
    elements.galleryEmpty.classList.remove('visible');
    elements.galleryGrid.innerHTML = items.map(item => `
        <div class="gallery-item" data-id="${item.id}">
            <img src="${item.imageData}" alt="${item.prompt}">
            <div class="gallery-item-overlay">
                <p class="gallery-item-prompt">${item.prompt}</p>
                <div class="gallery-item-actions">
                    <button class="gallery-item-btn" title="Download" onclick="downloadImage('${item.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    </button>
                    <button class="gallery-item-btn ${item.isFavorite ? 'favorited' : ''}" title="Favorite" onclick="toggleFavorite('${item.id}')">
                        <svg viewBox="0 0 24 24" fill="${item.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    document.querySelectorAll('.gallery-item').forEach(item => { item.addEventListener('click', (e) => { if (!e.target.closest('.gallery-item-btn')) viewGalleryItem(item.dataset.id); }); });
}

function filterGallery(filter) { document.querySelectorAll('.filter-btn').forEach(btn => { btn.classList.toggle('active', btn.dataset.filter === filter); }); renderGallery(filter); }

function viewGalleryItem(id) {
    const item = state.gallery.find(i => i.id == id);
    if (item) {
        state.prompt = item.prompt;
        elements.promptInput.value = item.prompt;
        state.style = item.style;
        state.aspectRatio = item.ratio;
        displayGeneratedImage(item.imageData);
        elements.styleBadge.textContent = item.style.replace('-', ' ');
        elements.ratioBadge.textContent = item.ratio;
        document.querySelectorAll('.style-btn').forEach(btn => { btn.classList.toggle('active', btn.dataset.style === item.style); });
        document.querySelectorAll('.ratio-btn').forEach(btn => { btn.classList.toggle('active', btn.dataset.ratio === item.ratio); });
        switchTab('create');
    }
}

function toggleFavorite(id) {
    const item = state.gallery.find(i => i.id == id);
    if (item) { item.isFavorite = !item.isFavorite; saveToStorage(); renderGallery(document.querySelector('.filter-btn.active').dataset.filter); showToast(item.isFavorite ? 'Added to favorites' : 'Removed from favorites'); }
}

function downloadImage(id) {
    const item = state.gallery.find(i => i.id == id) || (state.currentImage ? { imageData: state.currentImage } : null);
    if (item) { const link = document.createElement('a'); link.download = `lumina-${item.id || Date.now()}.png`; link.href = item.imageData; link.click(); showToast('Image downloaded!'); }
}

function renderHistory() {
    if (state.history.length === 0) { elements.historyList.innerHTML = ''; elements.historyEmpty.classList.add('visible'); return; }
    elements.historyEmpty.classList.remove('visible');
    elements.historyList.innerHTML = state.history.map(item => `
        <div class="history-item" onclick="viewGalleryItem('${item.id}')">
            <div class="history-item-thumb"><img src="${item.imageData}" alt="${item.prompt}"></div>
            <div class="history-item-content">
                <p class="history-item-prompt">${item.prompt}</p>
                <div class="history-item-meta">
                    <span class="history-item-style"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z"/></svg>${item.style.replace('-', ' ')}</span>
                    <span class="history-item-time"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${getTimeAgo(new Date(item.timestamp))}</span>
                </div>
            </div>
            <div class="history-item-actions">
                <button class="action-btn" title="Reuse prompt" onclick="event.stopPropagation(); reusePrompt('${item.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function reusePrompt(id) { const item = state.history.find(i => i.id == id); if (item) { elements.promptInput.value = item.prompt; state.prompt = item.prompt; switchTab('create'); showToast('Prompt loaded!'); } }

function clearHistory() { if (confirm('Clear all history?')) { state.history = []; state.gallery = []; saveToStorage(); renderHistory(); renderGallery(); showToast('History cleared'); } }

function handleCanvasAction(index) {
    switch(index) {
        case 0: if (state.currentImage) downloadImage(); break;
        case 1: showToast('Share feature coming soon'); break;
        case 2: showToast('Modify prompt and generate again'); break;
        case 3: if (state.gallery.length > 0) { const latestItem = state.gallery[0]; latestItem.isFavorite = !latestItem.isFavorite; saveToStorage(); renderGallery(); showToast(latestItem.isFavorite ? 'Added to favorites' : 'Removed from favorites'); } break;
    }
}

function showInspirationPrompt() {
    const randomIndex = Math.floor(Math.random() * inspirationPrompts.length);
    elements.inspirationText.style.opacity = '0';
    setTimeout(() => { elements.inspirationText.textContent = inspirationPrompts[randomIndex]; elements.inspirationText.style.opacity = '1'; }, 200);
    elements.inspirationText.parentElement.onclick = () => { elements.promptInput.value = inspirationPrompts[randomIndex]; state.prompt = inspirationPrompts[randomIndex]; showToast('Prompt applied!', 'info'); };
}

function updateUI() { renderGallery(); renderHistory(); }

function showToast(message, type = '') {
    elements.toast.className = 'toast visible';
    if (type) elements.toast.classList.add(type);
    elements.toast.querySelector('.toast-message').textContent = message;
    setTimeout(() => { elements.toast.classList.remove('visible'); }, 3000);
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
    for (const [unit, secondsInUnit] of Object.entries(intervals)) { const interval = Math.floor(seconds / secondsInUnit); if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`; }
    return 'Just now';
}

window.downloadImage = downloadImage;
window.toggleFavorite = toggleFavorite;
window.viewGalleryItem = viewGalleryItem;
window.reusePrompt = reusePrompt;
