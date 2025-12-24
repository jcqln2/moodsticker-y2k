// /public/js/mood.js

// ==================== CONFIGURATION ====================
const API_BASE_URL = window.location.origin + '/api';

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '255, 105, 180'; // Default to hot pink
}

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
let moods = [];
let selectedMood = null;

// ==================== FETCH MOODS FROM API ====================
async function fetchMoods() {
    try {
        const response = await fetch(`${API_BASE_URL}/moods`);
        const data = await response.json();
        
        if (data.success) {
            moods = data.data;
            console.log('✅ Loaded', moods.length, 'moods from API');
            return moods;
        } else {
            throw new Error(data.error || 'Failed to fetch moods');
        }
    } catch (error) {
        console.error('❌ Error fetching moods:', error);
        // Fallback to hardcoded moods if API fails
        moods = getFallbackMoods();
        return moods;
    }
}

// ==================== FALLBACK MOODS ====================
function getFallbackMoods() {
    console.warn('⚠️ Using fallback moods data');
    return [
        {
            id: 1,
            name: 'Bratz Vibes',
            emoji: '✨',
            description: 'Totally Bratz! Bold fashion and attitude',
            color: '#FF69B4'
        },
        {
            id: 2,
            name: 'Lipgloss Queen',
            emoji: '💋',
            description: 'Shiny and glossy like your favorite lipgloss',
            color: '#FF1493'
        },
        {
            id: 3,
            name: 'Butterfly Clip Energy',
            emoji: '🦋',
            description: 'Colorful clips and playful accessories',
            color: '#FFB6C1'
        },
        {
            id: 4,
            name: '90s Makeup Mood',
            emoji: '💄',
            description: 'Blue eyeshadow and glitter dreams',
            color: '#00CED1'
        },
        {
            id: 5,
            name: 'Spice Girls Style',
            emoji: '👑',
            description: 'Girl power and platform shoes',
            color: '#FFD700'
        },
        {
            id: 6,
            name: 'Clueless Chic',
            emoji: '👗',
            description: 'As if! Preppy and plaid perfection',
            color: '#FFD700'
        },
        {
            id: 7,
            name: 'Y2K Party',
            emoji: '🎊',
            description: 'Turn up the Y2K vibes!',
            color: '#FF00FF'
        },
        {
            id: 8,
            name: 'Glitter & Glam',
            emoji: '✨',
            description: 'All the sparkles and shine',
            color: '#FF69B4'
        }
    ];
}

// ==================== RENDER MOOD GRID ====================
function renderMoodGrid() {
    const grid = document.getElementById('moodGrid');
    grid.innerHTML = '';
    
    if (moods.length === 0) {
        grid.innerHTML = '<p style="color: #666; text-align: center; grid-column: 1/-1; padding: 40px;">Loading themes...</p>';
        return;
    }
    
    moods.forEach(mood => {
        const card = document.createElement('div');
        card.className = 'mood-card';
        card.dataset.moodId = mood.id;
        
        // Create a modern icon based on theme name
        const themeIcon = getThemeIcon(mood.name);
        
        card.innerHTML = `
            <div class="mood-icon">${themeIcon}</div>
            <h3 class="mood-name">${mood.name}</h3>
            <p class="mood-description">${mood.description}</p>
        `;
        
        // Click handler
        card.addEventListener('click', () => selectMood(mood));
        
        // Simple hover effect
        card.addEventListener('mouseenter', () => {
            if (selectedMood?.id !== mood.id) {
                // No special effects, just rely on CSS
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (selectedMood?.id !== mood.id) {
                // No special effects
            }
        });
        
        grid.appendChild(card);
    });
    
    console.log('✅ Rendered', moods.length, 'mood cards');
}

// ==================== SELECT MOOD ====================
function selectMood(mood) {
    selectedMood = mood;
    
    console.log('Selected mood:', mood.name);
    
    // Remove previous selection
    document.querySelectorAll('.mood-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    const selectedCard = document.querySelector(`[data-mood-id="${mood.id}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Show confirmation modal
    showConfirmationModal(mood);
}

// ==================== RANDOM MOOD ====================
// Removed - random button no longer in UI

// ==================== CONFIRMATION MODAL ====================
function showConfirmationModal(mood) {
    const modal = document.getElementById('confirmModal');
    const selectedMoodName = document.getElementById('selectedMoodName');
    const selectedIcon = document.getElementById('selectedIcon');
    const moodNameRepeat = document.getElementById('moodNameRepeat');
    
    selectedMoodName.textContent = mood.name;
    if (selectedIcon) {
        selectedIcon.innerHTML = getThemeIcon(mood.name);
    }
    moodNameRepeat.textContent = mood.name;
    
    modal.classList.add('show');
    
    // Play a little animation
    if (selectedIcon) {
        setTimeout(() => {
            selectedIcon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                selectedIcon.style.transform = 'scale(1)';
            }, 200);
        }, 100);
    }
}

// Modal button handlers
document.getElementById('changeMindBtn').addEventListener('click', () => {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('show');
    
    // Deselect current mood
    if (selectedMood) {
        const card = document.querySelector(`[data-mood-id="${selectedMood.id}"]`);
        if (card) {
            card.classList.remove('selected');
        }
    }
    
    selectedMood = null;
});

document.getElementById('continueBtn').addEventListener('click', () => {
    // Store selected mood in sessionStorage
    sessionStorage.setItem('selectedMood', JSON.stringify(selectedMood));
    
    console.log('💾 Saved mood to session:', selectedMood);
    
    // Navigate to personalization page
    // window.location.href = 'personalization.html';
    
    // For now, just show success message
    window.location.href = 'personalization.html';
});


// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('💫 Mood selection page loading...');
    
    // Fetch moods from API
    moods = await fetchMoods();
    
    // Render mood grid
    renderMoodGrid();
    
    console.log('✅ Mood selection loaded successfully!');
});
