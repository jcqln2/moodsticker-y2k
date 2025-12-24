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

// Get kawaii-inspired icon for theme
function getThemeIcon(themeName) {
    const icons = {
        'Bratz Vibes': '<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M8 14c1 1 2.5 1.5 4 1.5s3-.5 4-1.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M12 6v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        'Lipgloss Queen': '<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 12c0 2 1.5 3.5 4 3.5s4-1.5 4-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="11" r="0.8" fill="currentColor"/><circle cx="14" cy="11" r="0.8" fill="currentColor"/><path d="M12 6v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        'Butterfly Clip Energy': '<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-2 0-4 1-5 3-1-2-3-3-5-3v4c2 0 4 1 5 3 1-2 3-3 5-3V2z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="11" r="1" fill="currentColor"/><path d="M10 14c0.5 1 1.5 1.5 2 1.5s1.5-.5 2-1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 8l-2-2M16 8l2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        '90s Makeup Mood': '<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        'Spice Girls Style': '<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 9 9 1-7 6 2 9-7-5-7 5 2-9-7-6 9-1z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
        'Clueless Chic': '<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 10h16M10 4v16" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>',
        'Y2K Party': '<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 6 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="8" r="0.8" fill="currentColor"/><circle cx="18" cy="8" r="0.8" fill="currentColor"/><circle cx="8" cy="16" r="0.8" fill="currentColor"/><circle cx="16" cy="16" r="0.8" fill="currentColor"/></svg>',
        'Glitter & Glam': '<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="8" r="1" fill="currentColor"/><circle cx="18" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/><circle cx="12" cy="5" r="0.8" fill="currentColor"/><circle cx="12" cy="19" r="0.8" fill="currentColor"/><circle cx="5" cy="12" r="0.8" fill="currentColor"/><circle cx="19" cy="12" r="0.8" fill="currentColor"/></svg>'
    };
    
    // Return kawaii default icon
    return icons[themeName] || '<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M9 14c0.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
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
