// /public/js/gallery.js

// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:8000/api';

// ==================== STATE ====================
let allStickers = [];
let filteredStickers = [];
let moods = [];
let currentSort = 'recent';
let currentMoodFilter = 'all';
let displayedCount = 0;
const ITEMS_PER_PAGE = 12;

// ==================== FETCH DATA ====================
async function loadGalleryData() {
    try {
        showLoading();
        
        // Fetch stickers
        const stickersResponse = await fetch(`${API_BASE_URL}/stickers?limit=100`);
        const stickersData = await stickersResponse.json();
        
        if (stickersData.success) {
            allStickers = stickersData.data.stickers || [];
            console.log('✅ Loaded', allStickers.length, 'stickers');
        }
        
        // Fetch moods for filter
        const moodsResponse = await fetch(`${API_BASE_URL}/moods`);
        const moodsData = await moodsResponse.json();
        
        if (moodsData.success) {
            moods = moodsData.data;
            populateMoodFilter();
        }
        
        // Update stats
        updateStats();
        
        // Apply initial filtering and sorting
        applyFiltersAndSort();
        
        hideLoading();
        
        if (allStickers.length === 0) {
            showEmptyState();
        }
        
    } catch (error) {
        console.error('❌ Error loading gallery:', error);
        hideLoading();
        showEmptyState();
    }
}

// ==================== POPULATE MOOD FILTER ====================
function populateMoodFilter() {
    const select = document.getElementById('moodFilter');
    
    moods.forEach(mood => {
        const option = document.createElement('option');
        option.value = mood.id;
        option.textContent = `${mood.emoji} ${mood.name}`;
        select.appendChild(option);
    });
}

// ==================== UPDATE STATS ====================
function updateStats() {
    const totalDownloads = allStickers.reduce((sum, s) => sum + (s.download_count || 0), 0);
    
    document.getElementById('totalStickers').textContent = allStickers.length;
    document.getElementById('totalDownloads').textContent = totalDownloads;
    document.getElementById('footerCount').textContent = allStickers.length;
}

// ==================== APPLY FILTERS AND SORT ====================
function applyFiltersAndSort() {
    // Filter by mood
    if (currentMoodFilter === 'all') {
        filteredStickers = [...allStickers];
    } else {
        filteredStickers = allStickers.filter(s => s.mood_id == currentMoodFilter);
    }
    
    // Sort
    switch (currentSort) {
        case 'popular':
            filteredStickers.sort((a, b) => b.download_count - a.download_count);
            break;
        case 'mood':
            filteredStickers.sort((a, b) => a.mood_name.localeCompare(b.mood_name));
            break;
        case 'recent':
        default:
            filteredStickers.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            break;
    }
    
    console.log('📊 Filtered & sorted:', filteredStickers.length, 'stickers');
    
    // Reset display and render
    displayedCount = 0;
    renderGallery(true);
}

// ==================== RENDER GALLERY ====================
function renderGallery(reset = false) {
    const grid = document.getElementById('galleryGrid');
    
    if (reset) {
        grid.innerHTML = '';
        displayedCount = 0;
    }
    
    const endIndex = Math.min(displayedCount + ITEMS_PER_PAGE, filteredStickers.length);
    const stickersToShow = filteredStickers.slice(displayedCount, endIndex);
    
    stickersToShow.forEach(sticker => {
        const card = createStickerCard(sticker);
        grid.appendChild(card);
    });
    
    displayedCount = endIndex;
    
    // Show/hide load more button
    const loadMoreSection = document.getElementById('loadMoreSection');
    if (displayedCount < filteredStickers.length) {
        loadMoreSection.style.display = 'block';
    } else {
        loadMoreSection.style.display = 'none';
    }
}

// ==================== CREATE STICKER CARD ====================
function createStickerCard(sticker) {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.dataset.stickerId = sticker.id;
    
    const imageUrl = `/storage/stickers/${sticker.file_path}`;
    const date = new Date(sticker.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${sticker.mood_name} Sticker" class="gallery-card-image">
        <div class="gallery-card-info">
            <div class="card-mood">
                <span class="card-mood-emoji">${sticker.mood_emoji}</span>
                <span>${sticker.mood_name}</span>
            </div>
            <div class="card-meta">
                <span>📅 ${date}</span>
                <span class="card-downloads">⬇️ ${sticker.download_count}</span>
            </div>
        </div>
    `;
    
    // Click handler
    card.addEventListener('click', () => showStickerDetail(sticker));
    
    return card;
}

// ==================== SHOW STICKER DETAIL ====================
function showStickerDetail(sticker) {
    const modal = document.getElementById('stickerModal');
    const imageUrl = `/storage/stickers/${sticker.file_path}`;
    
    // Set modal content
    document.getElementById('modalStickerImage').src = imageUrl;
    document.getElementById('modalMoodEmoji').textContent = sticker.mood_emoji;
    document.getElementById('modalMoodName').textContent = sticker.mood_name;
    document.getElementById('modalStickerId').textContent = `#${sticker.id}`;
    
    const date = new Date(sticker.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('modalCreatedAt').textContent = date;
    document.getElementById('modalDownloads').textContent = sticker.download_count;
    
    // Show custom text if exists
    const customTextSection = document.getElementById('modalCustomText');
    if (sticker.custom_text) {
        customTextSection.style.display = 'block';
        document.getElementById('modalTextValue').textContent = sticker.custom_text;
    } else {
        customTextSection.style.display = 'none';
    }
    
    // Show user name if exists
    const userNameSection = document.getElementById('modalUserName');
    if (sticker.user_name) {
        userNameSection.style.display = 'block';
        document.getElementById('modalUserValue').textContent = sticker.user_name;
    } else {
        userNameSection.style.display = 'none';
    }
    
    // Set download handler
    document.getElementById('modalDownloadBtn').onclick = () => downloadSticker(sticker);
    
    // Set create similar handler
    document.getElementById('modalCreateSimilarBtn').onclick = () => {
        sessionStorage.setItem('selectedMood', JSON.stringify({
            id: sticker.mood_id,
            name: sticker.mood_name,
            emoji: sticker.mood_emoji,
            color: sticker.mood_color
        }));
        window.location.href = 'personalization.html';
    };
    
    modal.classList.add('show');
}

// ==================== DOWNLOAD STICKER ====================
async function downloadSticker(sticker) {
    try {
        // Track download
        await fetch(`${API_BASE_URL}/stickers/${sticker.id}/download`, {
            method: 'POST'
        });
        
        // Download file
        const imageUrl = `/storage/stickers/${sticker.file_path}`;
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mood-sticker-${sticker.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Update download count in UI
        sticker.download_count++;
        document.getElementById('modalDownloads').textContent = sticker.download_count;
        
        // Update card if visible
        const card = document.querySelector(`[data-sticker-id="${sticker.id}"] .card-downloads`);
        if (card) {
            card.textContent = `⬇️ ${sticker.download_count}`;
        }
        
        // Update stats
        updateStats();
        
        console.log('✅ Sticker downloaded:', sticker.id);
        
    } catch (error) {
        console.error('❌ Download error:', error);
        alert('Download failed. Please try again.');
    }
}

// ==================== EVENT LISTENERS ====================

// Sort select
document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    console.log('🔀 Sorting by:', currentSort);
    applyFiltersAndSort();
});

// Mood filter
document.getElementById('moodFilter').addEventListener('change', (e) => {
    currentMoodFilter = e.target.value;
    console.log('😊 Filtering by mood:', currentMoodFilter);
    applyFiltersAndSort();
});

// Load more button
document.getElementById('loadMoreBtn').addEventListener('click', () => {
    renderGallery(false);
});

// Close modal
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('stickerModal').classList.remove('show');
});

// ==================== UI HELPERS ====================
function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('galleryGrid').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('galleryGrid').style.display = 'grid';
}

function showEmptyState() {
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('galleryGrid').style.display = 'none';
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
    console.log('🖼️ Gallery page loading...');
    
    // Create visual effects
    createFloatingShapes();
    createSparkles();
    
    // Load gallery data
    loadGalleryData();
    
    console.log('✅ Gallery page loaded!');
});
