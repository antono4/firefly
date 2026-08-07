// === Lumina AI - Creative Image Generator ===
// Application State
const state = {
    prompt: '',
    aspectRatio: '1:1',
    style: 'photorealistic',
    quality: 4,
    isGenerating: false,
    currentImage: null,
    gallery: [],
    history: []
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
    clearHistory: null
};

// === Inspiration Prompts ===
const inspirationPrompts = [
    "A bioluminescent underwater city where ancient coral structures have evolved into futuristic architecture, illuminated by glowing sea creatures",
    "Steampunk Victorian-era airship docked at a floating garden in the clouds, brass and copper machinery covered in emerald vines",
    "Samurai standing on a cliff edge during a dramatic typhoon, traditional armor fused with futuristic technology, lightning striking the ocean below",
    "A cozy bookshop that exists inside a giant sleeping dragon, shelves built into the dragon's spines, warm candlelight from hovering orbs",
    "Hyper-detailed macro photography of a raindrop landing on a leaf, capturing a tiny universe reflected in the water",
    "Art Deco cityscape from the 1920s that never stopped evolving, golden spires reaching into a perpetual sunset",
    "A forest clearing where magical deer with crystalline antlers gather under a sky filled with northern lights",
    "Cyberpunk street food vendor stall in neon-lit alley, steam rising from dumplings while rain reflects colorful lights"
];

// === Style Presets ===
const stylePresets = {
    photorealistic: {
        keywords: ['photorealistic', 'ultra detailed', '8K', 'professional photography', 'natural lighting'],
        colors: ['natural tones', 'realistic shadows', 'high dynamic range']
    },
    'digital-art': {
        keywords: ['digital art', 'concept art', 'digital painting', 'detailed', 'vibrant colors'],
        colors: ['vibrant palette', 'rich saturation', 'dramatic lighting']
    },
    'concept-art': {
        keywords: ['concept art', 'artstation', 'trending', 'detailed environment', 'matte painting'],
        colors: ['cinematic colors', 'dramatic atmosphere', 'moody lighting']
    },
    anime: {
        keywords: ['anime style', 'Studio Ghibli inspired', 'anime art', 'cel shaded', 'beautiful background'],
        colors: ['soft colors', 'pastel tones', 'warm lighting']
    },
    '3d-render': {
        keywords: ['3D render', 'Cinema 4D', 'Octane render', 'ray tracing', 'professional lighting'],
        colors: ['clean aesthetic', 'studio lighting', 'high contrast']
    },
    'oil-painting': {
        keywords: ['oil painting', 'classical art', 'brush strokes visible', 'museum quality', 'fine art'],
        colors: ['rich textures', 'warm tones', 'Renaissance style']
    }
};

// === Initialize Application ===
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    console.log('Lumina AI: Initializing...');
    
    // Get DOM elements
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
    
    console.log('Elements found:', {
        promptInput: !!elements.promptInput,
        generateBtn: !!elements.generateBtn
    });
    
    loadFromStorage();
    initializeEventListeners();
    updateUI();
    showInspirationPrompt();
    
    console.log('Lumina AI: Initialization complete');
}

// === Storage Functions ===
function loadFromStorage() {
    const savedGallery = localStorage.getItem('lumina_gallery');
    const savedHistory = localStorage.getItem('lumina_history');
    
    if (savedGallery) {
        try {
            state.gallery = JSON.parse(savedGallery);
        } catch (e) {
            state.gallery = [];
        }
    }
    
    if (savedHistory) {
        try {
            state.history = JSON.parse(savedHistory);
        } catch (e) {
            state.history = [];
        }
    }
}

function saveToStorage() {
    localStorage.setItem('lumina_gallery', JSON.stringify(state.gallery));
    localStorage.setItem('lumina_history', JSON.stringify(state.history));
}

// === Event Listeners ===
function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Prompt Input - use both input and change events
    elements.promptInput.addEventListener('input', updatePrompt);
    elements.promptInput.addEventListener('change', updatePrompt);
    
    // Enhance Button
    document.querySelector('.btn-magic').addEventListener('click', enhancePrompt);
    
    // Ratio Selector
    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.addEventListener('click', () => selectRatio(btn));
    });
    
    // Style Selector
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => selectStyle(btn));
    });
    
    // Quality Slider
    elements.qualitySlider.addEventListener('input', (e) => {
        state.quality = parseInt(e.target.value);
    });
    
    // Generate Button
    elements.generateBtn.addEventListener('click', handleGenerate);
    
    // Inspiration
    elements.shufflePrompt.addEventListener('click', showInspirationPrompt);
    
    // Quick Prompts - use event delegation
    document.querySelectorAll('.quick-prompt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prompt = e.target.dataset.prompt || e.target.closest('.quick-prompt').dataset.prompt;
            applyPrompt(prompt);
        });
    });
    
    // Gallery Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterGallery(btn.dataset.filter));
    });
    
    // Clear History
    elements.clearHistory.addEventListener('click', clearHistory);
    
    // Canvas Actions
    document.querySelectorAll('.action-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => handleCanvasAction(index));
    });
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey && !state.isGenerating) {
            handleGenerate();
        }
    });
}

// === Prompt Functions ===
function updatePrompt(e) {
    state.prompt = e.target.value;
}

function applyPrompt(prompt) {
    if (!prompt) {
        console.log('applyPrompt called with empty prompt');
        return;
    }
    
    console.log('applyPrompt called with:', prompt);
    
    // Update state first
    state.prompt = prompt;
    
    // Update textarea value directly
    if (elements.promptInput) {
        elements.promptInput.value = prompt;
        console.log('Set textarea value to:', prompt);
    }
    
    // Also update any placeholder elements if needed
    const placeholderDiv = elements.promptInput?.parentElement?.querySelector('.placeholder-content');
    if (placeholderDiv) {
        placeholderDiv.textContent = prompt;
    }
}

// === Tab Switching ===
function switchTab(tabName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tabName}-section`).classList.add('active');
    
    // Update UI for current tab
    if (tabName === 'gallery') {
        renderGallery();
    } else if (tabName === 'history') {
        renderHistory();
    }
}

// === Prompt Enhancement ===
function enhancePrompt() {
    const currentPrompt = elements.promptInput.value.trim() || state.prompt;
    if (!currentPrompt) {
        showToast('Please enter a prompt first');
        return;
    }
    
    const preset = stylePresets[state.style];
    const enhancedPrompt = `${currentPrompt}, ${preset.keywords.join(', ')}, ${preset.colors.join(', ')}`;
    
    applyPrompt(enhancedPrompt);
    showToast('Prompt enhanced with style keywords!');
}

// === Aspect Ratio Selection ===
function selectRatio(btn) {
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.aspectRatio = btn.dataset.ratio;
    elements.ratioBadge.textContent = state.aspectRatio;
}

// === Style Selection ===
function selectStyle(btn) {
    document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.style = btn.dataset.style;
    elements.styleBadge.textContent = state.style.replace('-', ' ');
}

// === Image Generation ===
async function handleGenerate() {
    console.log('handleGenerate called');
    console.log('elements.promptInput:', elements.promptInput ? 'found' : 'null');
    
    // Get prompt from textarea - this is the most reliable source
    const textareaValue = elements.promptInput ? elements.promptInput.value.trim() : '';
    console.log('textareaValue:', textareaValue);
    console.log('state.prompt:', state.prompt);
    
    const currentPrompt = textareaValue || state.prompt;
    
    if (!currentPrompt) {
        console.log('No prompt found! textarea:', textareaValue, 'state:', state.prompt);
        showToast('Please enter a prompt to generate');
        if (elements.promptInput) elements.promptInput.focus();
        return;
    }
    
    console.log('Using prompt:', currentPrompt);
    showToast('Generating image...');
    
    // Update state with current prompt
    state.prompt = currentPrompt;
    
    if (state.isGenerating) return;
    
    state.isGenerating = true;
    updateGenerateButton();
    
    // Show loading state
    if (elements.canvasPlaceholder) elements.canvasPlaceholder.style.display = 'none';
    if (elements.outputCanvas) elements.outputCanvas.classList.remove('active');
    if (elements.canvasLoading) elements.canvasLoading.classList.add('active');
    
    try {
        // Simulate generation time based on quality
        const generationTime = (6 - state.quality) * 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, generationTime));
        
        // Generate the image using Canvas API
        const imageData = generateProceduralImage(state.prompt, state.style);
        
        // Display the generated image
        displayGeneratedImage(imageData);
        
        // Save to history and gallery
        saveToHistory(state.prompt, imageData, state.style, state.aspectRatio);
        
        showToast('Image generated successfully!');
    } catch (error) {
        console.error('Generation error:', error);
        showToast('Failed to generate image. Please try again.');
    } finally {
        state.isGenerating = false;
        updateGenerateButton();
        if (elements.canvasLoading) elements.canvasLoading.classList.remove('active');
    }
}

// === Procedural Image Generation ===
function generateProceduralImage(prompt, style) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
        throw new Error('Failed to get 2D context');
    }
    
    // Set dimensions based on aspect ratio
    const [w, h] = state.aspectRatio.split(':').map(Number);
    const maxDim = 800;
    
    if (w > h) {
        canvas.width = maxDim;
        canvas.height = Math.round(maxDim * h / w);
    } else {
        canvas.height = maxDim;
        canvas.width = Math.round(maxDim * w / h);
    }
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    
    // Style-based color schemes
    const colorSchemes = {
        photorealistic: [
            ['#2d4a6f', '#5a7fa8', '#8eb3d9', '#c4d9f2'],
            ['#3d2b4f', '#6b4d8a', '#9a7bc5', '#d4b8e8']
        ],
        'digital-art': [
            ['#1a1a3e', '#4a3f8a', '#8a6fd4', '#d4a6ff'],
            ['#0f2d4a', '#2d6b8a', '#5aa8c4', '#a8e4ff']
        ],
        'concept-art': [
            ['#2d1b4e', '#5a3d8a', '#9a6fd4', '#e4b8ff'],
            ['#1b3d2d', '#3d6b5a', '#6ba88a', '#b8e4d4']
        ],
        anime: [
            ['#ff9a9e', '#fecfef', '#fecfef', '#ffe4e6'],
            ['#a8edea', '#fed6e3', '#d299c2', '#fef9d7']
        ],
        '3d-render': [
            ['#e8e8e8', '#d4d4d4', '#a8a8a8', '#7a7a7a'],
            ['#2a2a3a', '#4a4a6a', '#7a7a9a', '#aaaacc']
        ],
        'oil-painting': [
            ['#8b4513', '#cd853f', '#deb887', '#f5deb3'],
            ['#2f4f4f', '#556b2f', '#8fbc8f', '#add8e6']
        ]
    };
    
    const schemes = colorSchemes[style] || colorSchemes['digital-art'];
    const colors = schemes[Math.floor(Math.random() * schemes.length)];
    
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.3, colors[1]);
    gradient.addColorStop(0.6, colors[2]);
    gradient.addColorStop(1, colors[3]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add texture/noise based on style
    if (style === 'oil-painting' || style === 'photorealistic') {
        addPaintTexture(ctx, canvas.width, canvas.height);
    }
    
    // Add abstract elements based on prompt keywords
    addAbstractElements(ctx, canvas.width, canvas.height, prompt, style);
    
    // Add style-specific overlays
    if (style === '3d-render') {
        add3DRenderOverlay(ctx, canvas.width, canvas.height);
    } else if (style === 'anime') {
        addAnimeOverlay(ctx, canvas.width, canvas.height);
    }
    
    return canvas.toDataURL('image/png');
}

// === Texture Effects ===
function addPaintTexture(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 15;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function addAbstractElements(ctx, width, height, prompt, style) {
    // Add floating shapes/elements
    const elementCount = 5 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < elementCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 20 + Math.random() * 80;
        const opacity = 0.1 + Math.random() * 0.3;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        
        const shapeType = Math.floor(Math.random() * 3);
        
        if (shapeType === 0) {
            // Circle
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        } else if (shapeType === 1) {
            // Rectangle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x - size/2, y - size/2, size, size * 0.6);
        } else {
            // Line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y + size * 0.5);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Add glow effects
    const glowCount = 2 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < glowCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = 50 + Math.random() * 150;
        
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        const hue = Math.random() * 360;
        glowGradient.addColorStop(0, `hsla(${hue}, 70%, 70%, 0.3)`);
        glowGradient.addColorStop(0.5, `hsla(${hue}, 70%, 50%, 0.1)`);
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);
    }
}

function add3DRenderOverlay(ctx, width, height) {
    // Add subtle vignette
    const vignette = ctx.createRadialGradient(
        width/2, height/2, height * 0.3,
        width/2, height/2, height * 0.8
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    
    // Add highlight
    const highlight = ctx.createLinearGradient(0, 0, width * 0.5, height * 0.5);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    highlight.addColorStop(1, 'transparent');
    ctx.fillStyle = highlight;
    ctx.fillRect(0, 0, width, height);
}

function addAnimeOverlay(ctx, width, height) {
    // Add soft glow
    const glow = ctx.createRadialGradient(
        width * 0.7, height * 0.3, 0,
        width * 0.7, height * 0.3, height * 0.5
    );
    glow.addColorStop(0, 'rgba(255, 240, 200, 0.3)');
    glow.addColorStop(0.5, 'rgba(255, 220, 180, 0.1)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    
    // Add sparkle effects
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 2 + Math.random() * 4;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        
        // 4-point star
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.3, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size * 0.3, y);
        ctx.closePath();
        ctx.fill();
    }
}

// === Display Generated Image ===
function displayGeneratedImage(imageData) {
    const img = new Image();
    img.onload = () => {
        const ctx = elements.outputCanvas.getContext('2d');
        
        // Set canvas size
        const containerWidth = elements.canvasContainer.clientWidth;
        const containerHeight = elements.canvasContainer.clientHeight;
        
        let drawWidth = img.width;
        let drawHeight = img.height;
        
        if (drawWidth > drawHeight) {
            drawHeight = containerHeight * 0.9;
            drawWidth = drawHeight * (img.width / img.height);
        } else {
            drawWidth = containerWidth * 0.9;
            drawHeight = drawWidth * (img.height / img.width);
        }
        
        elements.outputCanvas.width = img.width;
        elements.outputCanvas.height = img.height;
        elements.outputCanvas.style.width = `${drawWidth}px`;
        elements.outputCanvas.style.height = `${drawHeight}px`;
        
        ctx.drawImage(img, 0, 0);
        
        state.currentImage = imageData;
        elements.outputCanvas.classList.add('active');
        elements.canvasActions.classList.add('visible');
    };
    img.src = imageData;
}

// === Update Generate Button ===
function updateGenerateButton() {
    if (!elements.generateBtn) return;
    elements.generateBtn.classList.toggle('loading', state.isGenerating);
    elements.generateBtn.disabled = state.isGenerating;
}

// === History & Gallery ===
function saveToHistory(prompt, imageData, style, ratio) {
    const entry = {
        id: Date.now(),
        prompt,
        imageData,
        style,
        ratio,
        timestamp: new Date().toISOString()
    };
    
    state.history.unshift(entry);
    state.gallery.unshift({ ...entry, isFavorite: false });
    
    if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
    }
    
    saveToStorage();
    renderGallery();
    renderHistory();
}

function renderGallery(filter = 'all') {
    let items = [...state.gallery];
    
    if (filter === 'favorites') {
        items = items.filter(item => item.isFavorite);
    } else if (filter === 'recent') {
        items = items.slice(0, 12);
    }
    
    if (items.length === 0) {
        elements.galleryGrid.innerHTML = '';
        elements.galleryEmpty.classList.add('visible');
        return;
    }
    
    elements.galleryEmpty.classList.remove('visible');
    
    elements.galleryGrid.innerHTML = items.map(item => `
        <div class="gallery-item" data-id="${item.id}">
            <img src="${item.imageData}" alt="${item.prompt}">
            <div class="gallery-item-overlay">
                <p class="gallery-item-prompt">${item.prompt}</p>
                <div class="gallery-item-actions">
                    <button class="gallery-item-btn" title="Download" onclick="downloadImage('${item.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                    </button>
                    <button class="gallery-item-btn ${item.isFavorite ? 'favorited' : ''}" title="Favorite" onclick="toggleFavorite('${item.id}')">
                        <svg viewBox="0 0 24 24" fill="${item.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add click handler to view image
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.gallery-item-btn')) {
                viewGalleryItem(item.dataset.id);
            }
        });
    });
}

function filterGallery(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderGallery(filter);
}

function viewGalleryItem(id) {
    const item = state.gallery.find(i => i.id == id);
    if (item) {
        state.prompt = item.prompt;
        elements.promptInput.value = item.prompt;
        state.style = item.style;
        state.aspectRatio = item.ratio;
        
        displayGeneratedImage(item.imageData);
        
        // Update badges
        elements.styleBadge.textContent = item.style.replace('-', ' ');
        elements.ratioBadge.textContent = item.ratio;
        
        // Update selections
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === item.style);
        });
        
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.ratio === item.ratio);
        });
        
        switchTab('create');
    }
}

function toggleFavorite(id) {
    const item = state.gallery.find(i => i.id == id);
    if (item) {
        item.isFavorite = !item.isFavorite;
        saveToStorage();
        renderGallery(document.querySelector('.filter-btn.active').dataset.filter);
        showToast(item.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    }
}

function downloadImage(id) {
    const item = state.gallery.find(i => i.id == id);
    if (item) {
        const link = document.createElement('a');
        link.download = `lumina-${item.id}.png`;
        link.href = item.imageData;
        link.click();
        showToast('Image downloaded!');
    }
}

function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = '';
        elements.historyEmpty.classList.add('visible');
        return;
    }
    
    elements.historyEmpty.classList.remove('visible');
    
    elements.historyList.innerHTML = state.history.map(item => {
        const date = new Date(item.timestamp);
        const timeAgo = getTimeAgo(date);
        
        return `
            <div class="history-item" onclick="viewGalleryItem('${item.id}')">
                <div class="history-item-thumb">
                    <img src="${item.imageData}" alt="${item.prompt}">
                </div>
                <div class="history-item-content">
                    <p class="history-item-prompt">${item.prompt}</p>
                    <div class="history-item-meta">
                        <span class="history-item-style">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z"/>
                            </svg>
                            ${item.style.replace('-', ' ')}
                        </span>
                        <span class="history-item-time">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v6l4 2"/>
                            </svg>
                            ${timeAgo}
                        </span>
                    </div>
                </div>
                <div class="history-item-actions">
                    <button class="action-btn" title="Reuse prompt" onclick="event.stopPropagation(); reusePrompt('${item.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 1l4 4-4 4"/>
                            <path d="M3 11V9a4 4 0 014-4h14"/>
                            <path d="M7 23l-4-4 4-4"/>
                            <path d="M21 13v2a4 4 0 01-4 4H3"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function reusePrompt(id) {
    const item = state.history.find(i => i.id == id);
    if (item) {
        elements.promptInput.value = item.prompt;
        state.prompt = item.prompt;
        switchTab('create');
        showToast('Prompt loaded!');
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        state.history = [];
        state.gallery = [];
        saveToStorage();
        renderHistory();
        renderGallery();
        showToast('History cleared');
    }
}

// === Canvas Actions ===
function handleCanvasAction(index) {
    switch(index) {
        case 0: // Download
            if (state.currentImage) {
                const link = document.createElement('a');
                link.download = `lumina-${Date.now()}.png`;
                link.href = state.currentImage;
                link.click();
                showToast('Image downloaded!');
            }
            break;
        case 1: // Share
            if (state.currentImage) {
                if (navigator.share) {
                    fetch(state.currentImage)
                        .then(res => res.blob())
                        .then(blob => {
                            const file = new File([blob], 'lumina-image.png', { type: 'image/png' });
                            navigator.share({
                                files: [file],
                                title: 'Lumina AI Creation',
                                text: state.prompt
                            });
                        });
                } else {
                    showToast('Sharing not supported on this device');
                }
            }
            break;
        case 2: // Remix
            showToast('Opening remix mode...');
            // Could implement prompt modification
            break;
        case 3: // Favorite
            if (state.gallery.length > 0) {
                const latestItem = state.gallery[0];
                latestItem.isFavorite = !latestItem.isFavorite;
                saveToStorage();
                renderGallery();
                showToast(latestItem.isFavorite ? 'Added to favorites' : 'Removed from favorites');
            }
            break;
    }
}

// === Inspiration ===
function showInspirationPrompt() {
    const randomIndex = Math.floor(Math.random() * inspirationPrompts.length);
    elements.inspirationText.style.opacity = '0';
    
    setTimeout(() => {
        elements.inspirationText.textContent = inspirationPrompts[randomIndex];
        elements.inspirationText.style.opacity = '1';
    }, 200);
    
    // Add click to use
    elements.inspirationText.parentElement.onclick = () => {
        elements.promptInput.value = inspirationPrompts[randomIndex];
        state.prompt = inspirationPrompts[randomIndex];
        showToast('Prompt applied!');
    };
}

// === UI Updates ===
function updateUI() {
    renderGallery();
    renderHistory();
}

// === Toast Notifications ===
function showToast(message) {
    elements.toast.querySelector('.toast-message').textContent = message;
    elements.toast.classList.add('visible');
    
    setTimeout(() => {
        elements.toast.classList.remove('visible');
    }, 3000);
}

// === Utilities ===
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

// === Make functions globally available ===
window.downloadImage = downloadImage;
window.toggleFavorite = toggleFavorite;
window.viewGalleryItem = viewGalleryItem;
window.reusePrompt = reusePrompt;
