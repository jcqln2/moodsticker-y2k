// /public/js/sticker-result.js

// ==================== CONFIGURATION ====================
const API_BASE_URL = window.location.origin + '/api';
const STORAGE_URL = window.location.origin + '/storage/stickers';

// ==================== STATE ====================
let stickerData = null;

// ==================== LOAD STICKER DATA ====================
function loadStickerData() {
    const storedData = sessionStorage.getItem('generatedSticker');
    
    if (!storedData) {
        alert('No sticker data found! Redirecting to home...');
        window.location.href = 'landing.html';
        return;
    }
    
    try {
        stickerData = JSON.parse(storedData);
        
        if (!stickerData || !stickerData.id) {
            throw new Error('Invalid sticker data');
        }
        
        console.log('✅ Loaded sticker:', stickerData);
        
        displaySticker();
    } catch (error) {
        console.error('Error loading sticker:', error);
        alert('Error loading sticker. Redirecting to home...');
        window.location.href = 'landing.html';
    }
}

// ==================== DISPLAY STICKER ====================
function displaySticker() {
    if (!stickerData) {
        return;
    }
    
    // Set sticker image
    const stickerImage = document.getElementById('stickerImage');
    if (stickerImage && stickerData.file_path) {
        const imageUrl = `${STORAGE_URL}/${stickerData.file_path}`;
        stickerImage.src = imageUrl;
        stickerImage.alt = stickerData.mood_name || 'Your Mood Sticker';
    }
}

// ==================== DOWNLOAD STICKER ====================
async function downloadSticker() {
    if (!stickerData || !stickerData.id) {
        alert('Sticker data not loaded. Please try again.');
        return;
    }
    
    try {
        console.log('📥 Downloading sticker...');
        
        // Track download in API
        const response = await fetch(`${API_BASE_URL}/stickers/${stickerData.id}/download`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Create download link
            const link = document.createElement('a');
            link.href = `${STORAGE_URL}/${stickerData.file_path}`;
            link.download = `mood-sticker-${stickerData.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Update download count if available
            if (stickerData.download_count !== undefined) {
                stickerData.download_count++;
            }
            
            console.log('✅ Download tracked and file downloaded');
        } else {
            throw new Error(result.error || 'Download failed');
        }
        
    } catch (error) {
        console.error('❌ Download error:', error);
        alert('Download failed. Please try again.');
    }
}

// ==================== CREATE ANOTHER ====================
function createAnother() {
    // Clear session storage
    sessionStorage.removeItem('selectedMood');
    sessionStorage.removeItem('generatedSticker');
    
    // Go back to mood selection
    window.location.href = 'mood-selection.html';
}

// ==================== SETUP EVENT LISTENERS ====================
function setupEventListeners() {
    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadSticker);
    }

    // Create another button
    const createAnotherBtn = document.getElementById('createAnotherBtn');
    if (createAnotherBtn) {
        createAnotherBtn.addEventListener('click', createAnother);
    }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 Result page loading...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Load sticker data
    loadStickerData();
    
    console.log('✅ Result page loaded!');
});
