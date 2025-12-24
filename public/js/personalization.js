// /public/js/personalization.js

// ==================== CONFIGURATION ====================
const API_BASE_URL = window.location.origin + '/api';

// Get modern icon for theme (using SVG icons instead of emojis)
function getThemeIcon(themeName) {
    const icons = {
        'Bratz Vibes': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/><circle cx="12" cy="12" r="3"/></svg>',
        'Lipgloss Queen': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6v6l4 2"/></svg>',
        'Butterfly Clip Energy': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
        '90s Makeup Mood': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        'Spice Girls Style': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
        'Clueless Chic': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>',
        'Y2K Party': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'Glitter & Glam': '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
    };
    
    // Return icon or a default geometric shape
    return icons[themeName] || '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
}

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
        alert('No theme selected! Redirecting to theme selection...');
        window.location.href = 'mood-selection.html';
        return;
    }
    
    try {
        selectedMood = JSON.parse(moodData);
        
        if (!selectedMood || !selectedMood.name) {
            throw new Error('Invalid mood data');
        }
        
        console.log('✅ Loaded mood:', selectedMood.name);
        
        // Display selected mood with icon
        const displayIcon = document.getElementById('displayIcon');
        if (displayIcon) {
            displayIcon.innerHTML = getThemeIcon(selectedMood.name);
        }
        
        const displayName = document.getElementById('displayName');
        if (displayName) {
            displayName.textContent = selectedMood.name;
        }
        
        // Set default color to mood color
        if (selectedMood.color) {
            customizations.customColor = selectedMood.color;
            const colorInput = document.getElementById('customColor');
            if (colorInput) {
                colorInput.value = selectedMood.color;
            }
            
            // Highlight the mood color in palette
            highlightColorInPalette(selectedMood.color);
        }
        
        // Show initial preview
        updatePreview();
    } catch (error) {
        console.error('Error loading mood:', error);
        alert('Error loading theme. Redirecting to theme selection...');
        window.location.href = 'mood-selection.html';
    }
}

// Helper to highlight color in palette
function highlightColorInPalette(color) {
    document.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.dataset.color.toLowerCase() === color.toLowerCase()) {
            btn.classList.add('selected');
        }
    });
}

// ==================== UPDATE PREVIEW ====================
function updatePreview() {
    if (!selectedMood) {
        return; // Don't update preview if mood isn't loaded yet
    }
    
    const preview = document.getElementById('stickerPreview');
    if (!preview) {
        return; // Preview element doesn't exist (removed from simplified HTML)
    }
    
    // Create preview HTML
    preview.innerHTML = `
        <div class="preview-sticker" style="background: ${customizations.customColor};">
            <div class="preview-mood-name">${selectedMood.name}</div>
            <div class="preview-emoji">${selectedMood.emoji || '✨'}</div>
            ${customizations.customText ? `<div class="preview-custom-text">${customizations.customText}</div>` : ''}
            ${customizations.userName ? `<div class="preview-user-name">${customizations.userName}</div>` : ''}
        </div>
    `;
}

// ==================== GENERATE STICKER ====================
async function generateSticker() {
    try {
        // Check if mood is loaded
        if (!selectedMood || !selectedMood.id) {
            alert('No theme selected. Please go back and select a theme.');
            window.location.href = 'mood-selection.html';
            return;
        }
        
        // Show loading modal
        const loadingModal = document.getElementById('loadingModal');
        if (loadingModal) {
            loadingModal.classList.add('show');
        }
        
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
        
        // Get response text first to handle both JSON and non-JSON responses
        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            // If response isn't JSON, show the raw response
            console.error('Non-JSON response:', responseText);
            throw new Error('Server returned invalid response: ' + responseText.substring(0, 200));
        }
        
        // Log full response for debugging
        console.log('API Response:', result);
        
        if (!result.success) {
            // Include debug info if available
            const errorMsg = result.error || 'Failed to generate sticker';
            const debugInfo = result.debug ? '\nDebug: ' + JSON.stringify(result.debug, null, 2) : '';
            throw new Error(errorMsg + debugInfo);
        }
        
        console.log('✅ Sticker generated!', result.data);
        
        // Store sticker data
        sessionStorage.setItem('generatedSticker', JSON.stringify(result.data));
        
        // Hide loading modal
        if (loadingModal) {
            loadingModal.classList.remove('show');
        }
        
        // Navigate to result page
        window.location.href = 'sticker-result.html';
        
    } catch (error) {
        console.error('❌ Error generating sticker:', error);
        
        // Hide loading modal
        const loadingModal = document.getElementById('loadingModal');
        if (loadingModal) {
            loadingModal.classList.remove('show');
        }
        
        alert(`Error: ${error.message}\n\nPlease try again.`);
    }
}

// ==================== SETUP EVENT LISTENERS ====================
function setupEventListeners() {
    // Phrase buttons
    document.querySelectorAll('.phrase-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const phrase = btn.dataset.phrase;
            
            // Toggle selection
            if (btn.classList.contains('selected')) {
                btn.classList.remove('selected');
                const textInput = document.getElementById('customText');
                if (textInput) {
                    textInput.value = '';
                }
                customizations.customText = '';
            } else {
                // Remove other selections
                document.querySelectorAll('.phrase-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                
                // Set text
                const textInput = document.getElementById('customText');
                if (textInput) {
                    textInput.value = phrase;
                }
                customizations.customText = phrase;
            }
            
            updatePreview();
        });
    });

    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            
            // Update selection
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            // Update color input
            const colorInput = document.getElementById('customColor');
            if (colorInput) {
                colorInput.value = color;
            }
            customizations.customColor = color;
            
            updatePreview();
        });
    });

    // Form inputs
    const userNameInput = document.getElementById('userName');
    if (userNameInput) {
        userNameInput.addEventListener('input', (e) => {
            customizations.userName = e.target.value;
            updatePreview();
        });
    }

    const customTextInput = document.getElementById('customText');
    if (customTextInput) {
        customTextInput.addEventListener('input', (e) => {
            customizations.customText = e.target.value;
            
            // Deselect phrase buttons if manually typing
            document.querySelectorAll('.phrase-btn').forEach(btn => btn.classList.remove('selected'));
            
            updatePreview();
        });
    }

    const customColorInput = document.getElementById('customColor');
    if (customColorInput) {
        customColorInput.addEventListener('input', (e) => {
            customizations.customColor = e.target.value;
            
            // Deselect color buttons
            document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
            
            updatePreview();
        });
    }

    // Form submission
    const form = document.getElementById('customizationForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await generateSticker();
        });
    }

    // Skip button
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
        skipBtn.addEventListener('click', async () => {
            // Clear customizations and generate
            if (selectedMood && selectedMood.color) {
                customizations = {
                    userName: '',
                    customText: '',
                    customColor: selectedMood.color
                };
            }
            await generateSticker();
        });
    }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('💖 Personalization page loading...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Load selected mood
    loadSelectedMood();
    
    console.log('✅ Personalization page loaded!');
});
