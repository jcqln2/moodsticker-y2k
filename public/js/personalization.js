// /public/js/personalization.js

// ==================== CONFIGURATION ====================
const API_BASE_URL = window.location.origin + '/api';

// Get kawaii-inspired icon for theme
function getThemeIcon(themeName) {
    const icons = {
        'Bratz Vibes': '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M8 14c1 1 2.5 1.5 4 1.5s3-.5 4-1.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M12 6v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        'Lipgloss Queen': '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 12c0 2 1.5 3.5 4 3.5s4-1.5 4-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="11" r="0.8" fill="currentColor"/><circle cx="14" cy="11" r="0.8" fill="currentColor"/><path d="M12 6v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        'Butterfly Clip Energy': '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-2 0-4 1-5 3-1-2-3-3-5-3v4c2 0 4 1 5 3 1-2 3-3 5-3V2z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="11" r="1" fill="currentColor"/><path d="M10 14c0.5 1 1.5 1.5 2 1.5s1.5-.5 2-1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 8l-2-2M16 8l2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        '90s Makeup Mood': '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        'Spice Girls Style': '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 9 9 1-7 6 2 9-7-5-7 5 2-9-7-6 9-1z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
        'Clueless Chic': '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 10h16M10 4v16" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>',
        'Y2K Party': '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 6 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="8" r="0.8" fill="currentColor"/><circle cx="18" cy="8" r="0.8" fill="currentColor"/><circle cx="8" cy="16" r="0.8" fill="currentColor"/><circle cx="16" cy="16" r="0.8" fill="currentColor"/></svg>',
        'Glitter & Glam': '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="8" r="1" fill="currentColor"/><circle cx="18" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/><circle cx="12" cy="5" r="0.8" fill="currentColor"/><circle cx="12" cy="19" r="0.8" fill="currentColor"/><circle cx="5" cy="12" r="0.8" fill="currentColor"/><circle cx="19" cy="12" r="0.8" fill="currentColor"/></svg>'
    };
    
    // Return kawaii default icon
    return icons[themeName] || '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M9 14c0.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
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
