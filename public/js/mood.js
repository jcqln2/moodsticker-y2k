// /public/js/mood.js

// ==================== CONFIGURATION ====================
const API_BASE_URL = window.location.origin + '/api';

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
        return getFallbackMoods();
    }
}

// ==================== FALLBACK MOODS ====================
function getFallbackMoods() {
    console.warn('⚠️ Using fallback moods data');
    return [
        {
            id: 1,
            name: 'Happy & Energetic',
            emoji: '😊',
            description: 'Feeling pumped!',
            color: '#FFFF00'
        },
        {
            id: 2,
            name: 'Chill & Peaceful',
            emoji: '😌',
            description: 'Just vibing~',
            color: '#00FFFF'
        },
        {
            id: 3,
            name: 'Flirty & Fun',
            emoji: '😍',
            description: 'Feeling cute!',
            color: '#FF69B4'
        },
        {
            id: 4,
            name: 'Thoughtful & Deep',
            emoji: '🤔',
            description: 'In my feels',
            color: '#9933FF'
        },
        {
            id: 5,
            name: 'Fired Up & Ready',
            emoji: '😤',
            description: 'Let\'s GO!',
            color: '#FF6600'
        },
        {
            id: 6,
            name: 'Need a Hug',
            emoji: '😭',
            description: 'Soft mood',
            color: '#FFB6C1'
        },
        {
            id: 7,
            name: 'Party Mode',
            emoji: '🎉',
            description: 'Turn up!',
            color: '#FF00FF'
        },
        {
            id: 8,
            name: 'Creative Vibes',
            emoji: '🎨',
            description: 'Artsy mood',
            color: '#CCFF00'
        }
    ];
}

// ==================== RENDER MOOD GRID ====================
function renderMoodGrid() {
    const grid = document.getElementById('moodGrid');
    grid.innerHTML = '';
    
    if (moods.length === 0) {
        grid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">Loading moods...</p>';
        return;
    }
    
    moods.forEach(mood => {
        const card = document.createElement('div');
        card.className = 'mood-card';
        card.dataset.moodId = mood.id;
        
        card.innerHTML = `
            <span class="mood-emoji">${mood.emoji}</span>
            <h3 class="mood-name">${mood.name}</h3>
            <p class="mood-description">${mood.description}</p>
        `;
        
        // Click handler
        card.addEventListener('click', () => selectMood(mood));
        
        // Hover effect with color
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = mood.color;
            card.style.boxShadow = `0 0 20px ${mood.color}`;
        });
        
        card.addEventListener('mouseleave', () => {
            if (selectedMood?.id !== mood.id) {
                card.style.borderColor = 'transparent';
                card.style.boxShadow = 'none';
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
        selectedCard.style.borderColor = mood.color;
        selectedCard.style.boxShadow = `0 0 30px ${mood.color}`;
    }
    
    // Show confirmation modal
    showConfirmationModal(mood);
}

// ==================== RANDOM MOOD ====================
document.getElementById('randomBtn').addEventListener('click', async () => {
    try {
        // Try to get random mood from API
        const response = await fetch(`${API_BASE_URL}/moods/random`);
        const data = await response.json();
        
        if (data.success) {
            const randomMood = data.data;
            selectMood(randomMood);
            console.log('🎲 Random mood from API:', randomMood.name);
        } else {
            throw new Error('API failed');
        }
    } catch (error) {
        // Fallback to local random
        console.warn('⚠️ Using local random mood');
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        selectMood(randomMood);
    }
});

// ==================== CONFIRMATION MODAL ====================
function showConfirmationModal(mood) {
    const modal = document.getElementById('confirmModal');
    const selectedMoodName = document.getElementById('selectedMoodName');
    const selectedEmoji = document.getElementById('selectedEmoji');
    const moodNameRepeat = document.getElementById('moodNameRepeat');
    
    selectedMoodName.textContent = mood.name;
    selectedEmoji.textContent = mood.emoji;
    moodNameRepeat.textContent = mood.name;
    
    modal.classList.add('show');
    
    // Play a little animation
    setTimeout(() => {
        selectedEmoji.style.transform = 'scale(1.2)';
        setTimeout(() => {
            selectedEmoji.style.transform = 'scale(1)';
        }, 200);
    }, 100);
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
            card.style.borderColor = 'transparent';
            card.style.boxShadow = 'none';
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

// ==================== FLOATING SHAPES ====================
function createFloatingShapes() {
    const container = document.getElementById('shapes');
    const shapes = ['○', '△', '□', '◇', '☆'];
    const shapeCount = 20;
    
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

// ==================== SPARKLES (reused from landing) ====================
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
document.addEventListener('DOMContentLoaded', async () => {
    console.log('💫 Mood selection page loading...');
    
    // Create visual effects
    createFloatingShapes();
    createSparkles();
    
    // Fetch moods from API
    moods = await fetchMoods();
    
    // Render mood grid
    renderMoodGrid();
    
    console.log('✅ Mood selection loaded successfully!');
});
