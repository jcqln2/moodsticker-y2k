// /public/js/personalization.js

// ==================== CONFIGURATION ====================
const API_BASE_URL = window.location.origin + '/api';

// ==================== STATE ====================
let selectedMood = null;
let customizations = {
    userName: '',
    customText: '',
    customColor: '#FF00FF'
};

// ==================== LOAD SELECTED MOOD ====================
function loadSelectedMood() {
    const moodData = sessionStorage.getItem('selectedMood');
    
    if (!moodData) {
        alert('No mood selected! Redirecting to mood selection...');
        window.location.href = 'mood-selection.html';
        return;
    }
    
    selectedMood = JSON.parse(moodData);
    console.log('✅ Loaded mood:', selectedMood.name);
    
    // Display selected mood
    document.getElementById('displayEmoji').textContent = selectedMood.emoji;
    document.getElementById('displayName').textContent = selectedMood.name;
    
    // Set default color to mood color
    customizations.customColor = selectedMood.color;
    document.getElementById('customColor').value = selectedMood.color;
    
    // Highlight the mood color in palette
    highlightColorInPalette(selectedMood.color);
    
    // Show initial preview
    updatePreview();
}

// ==================== PHRASE BUTTONS ====================
document.querySelectorAll('.phrase-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const phrase = btn.dataset.phrase;
        
        // Toggle selection
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            document.getElementById('customText').value = '';
            customizations.customText = '';
        } else {
            // Remove other selections
            document.querySelectorAll('.phrase-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            // Set text
            document.getElementById('customText').value = phrase;
            customizations.customText = phrase;
        }
        
        updatePreview();
    });
});

// ==================== COLOR BUTTONS ====================
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        
        // Update selection
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        // Update color input
        document.getElementById('customColor').value = color;
        customizations.customColor = color;
        
        updatePreview();
    });
});

// Helper to highlight color in palette
function highlightColorInPalette(color) {
    document.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.dataset.color.toLowerCase() === color.toLowerCase()) {
            btn.classList.add('selected');
        }
    });
}

// ==================== FORM INPUTS ====================
document.getElementById('userName').addEventListener('input', (e) => {
    customizations.userName = e.target.value;
    updatePreview();
});

document.getElementById('customText').addEventListener('input', (e) => {
    customizations.customText = e.target.value;
    
    // Deselect phrase buttons if manually typing
    document.querySelectorAll('.phrase-btn').forEach(btn => btn.classList.remove('selected'));
    
    updatePreview();
});

document.getElementById('customColor').addEventListener('input', (e) => {
    customizations.customColor = e.target.value;
    
    // Deselect color buttons
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
    
    updatePreview();
});

// ==================== UPDATE PREVIEW ====================
function updatePreview() {
    const preview = document.getElementById('stickerPreview');
    
    // Create preview HTML
    preview.innerHTML = `
        <div class="preview-sticker" style="background: ${customizations.customColor};">
            <div class="preview-mood-name">${selectedMood.name}</div>
            <div class="preview-emoji">${selectedMood.emoji}</div>
            ${customizations.customText ? `<div class="preview-custom-text">${customizations.customText}</div>` : ''}
            ${customizations.userName ? `<div class="preview-user-name">${customizations.userName}</div>` : ''}
        </div>
    `;
}

// ==================== GENERATE STICKER ====================
document.getElementById('customizationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await generateSticker();
});

document.getElementById('skipBtn').addEventListener('click', async () => {
    // Clear customizations and generate
    customizations = {
        userName: '',
        customText: '',
        customColor: selectedMood.color
    };
    await generateSticker();
});

async function generateSticker() {
    try {
        // Show loading modal
        const loadingModal = document.getElementById('loadingModal');
        loadingModal.classList.add('show');
        
        console.log('🎨 Generating sticker...');
        
        // Prepare data for API
        const stickerData = {
            mood_id: selectedMood.id,
            user_name: customizations.userName || null,
            custom_text: customizations.customText || null,
            custom_color: customizations.customColor || null
        };
        
        console.log('Sending to API:', stickerData);
        
        // Call API to generate sticker
        const response = await fetch(`${API_BASE_URL}/stickers/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stickerData)
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to generate sticker');
        }
        
        console.log('✅ Sticker generated!', result.data);
        
        // Store sticker data
        sessionStorage.setItem('generatedSticker', JSON.stringify(result.data));
        
        // Hide loading modal
        loadingModal.classList.remove('show');
        
        // Navigate to preview/download page
        // window.location.href = 'sticker-result.html';
        
        // For now, show success message
        window.location.href = 'sticker-result.html';
        
    } catch (error) {
        console.error('❌ Error generating sticker:', error);
        
        // Hide loading modal
        const loadingModal = document.getElementById('loadingModal');
        loadingModal.classList.remove('show');
        
        alert(`Error: ${error.message}\n\nPlease try again.`);
    }
}

// ==================== FLOATING SHAPES ====================
function createFloatingShapes() {
    const container = document.getElementById('shapes');
    const shapes = ['○', '△', '□', '◇', '☆'];
    const shapeCount = 15;
    
    for (let i = 0; i < shapeCount; i++) {
        const shape = document.createElement('div');
        shape.className = 'shape';
        shape.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        shape.style.left = Math.random() * 100 + '%';
        shape.style.top = Math.random() * 100 + '%';
        shape.style.fontSize = (Math.random() * 40 + 20) + 'px';
        shape.style.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        shape.style.animationDuration = (Math.random() * 10 + 15) + 's';
        shape.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(shape);
    }
}

// ==================== SPARKLES ====================
function createSparkles() {
    const container = document.getElementById('sparkles');
    const sparkleCount = 30;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 3 + 's';
        sparkle.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(sparkle);
    }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('💖 Personalization page loading...');
    
    // Create visual effects
    createFloatingShapes();
    createSparkles();
    
    // Load selected mood
    loadSelectedMood();
    
    console.log('✅ Personalization page loaded!');
});
