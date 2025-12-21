// /public/js/sticker-result.js

// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:8000/api';
const STORAGE_URL = 'http://localhost:8000/storage/stickers';

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
    
    stickerData = JSON.parse(storedData);
    console.log('✅ Loaded sticker:', stickerData);
    
    displaySticker();
}

// ==================== DISPLAY STICKER ====================
function displaySticker() {
    // Set sticker image
    const imageUrl = `${STORAGE_URL}/${stickerData.file_path}`;
    document.getElementById('stickerImage').src = imageUrl;
    
    // Set mood info
    document.getElementById('stickerEmoji').textContent = stickerData.mood_emoji;
    document.getElementById('stickerMoodName').textContent = stickerData.mood_name;
    
    // Set details
    document.getElementById('stickerId').textContent = `#${stickerData.id}`;
    document.getElementById('stickerDownloads').textContent = stickerData.download_count;
    
    // Format date
    const date = new Date(stickerData.created_at);
    const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('stickerDate').textContent = formattedDate;
}

// ==================== DOWNLOAD STICKER ====================
document.getElementById('downloadBtn').addEventListener('click', async () => {
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
            
            // Update download count
            stickerData.download_count++;
            document.getElementById('stickerDownloads').textContent = stickerData.download_count;
            
            // Show success message
            showSuccess('🎉 Sticker downloaded successfully!');
            
            console.log('✅ Download tracked and file downloaded');
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('❌ Download error:', error);
        alert('Download failed. Please try again.');
    }
});

// ==================== NFT MINTING ====================
let selectedBlockchain = null;

// Blockchain button handlers
document.querySelectorAll('.btn-blockchain').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedBlockchain = btn.dataset.blockchain;
        document.getElementById('selectedBlockchain').textContent = 
            selectedBlockchain.toUpperCase();
        
        // Show NFT modal
        document.getElementById('nftModal').classList.add('show');
    });
});

// Close NFT modal
document.getElementById('closeNftModal').addEventListener('click', () => {
    document.getElementById('nftModal').classList.remove('show');
});

document.getElementById('cancelNftBtn').addEventListener('click', () => {
    document.getElementById('nftModal').classList.remove('show');
});

// Confirm NFT minting
document.getElementById('confirmNftBtn').addEventListener('click', async () => {
    try {
        const walletAddress = document.getElementById('walletAddress').value || '0xDemoWallet';
        
        console.log('🎨 Minting NFT on', selectedBlockchain);
        
        // Call NFT mint API
        const response = await fetch(`${API_BASE_URL}/nft/mint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sticker_id: stickerData.id,
                wallet_address: walletAddress,
                blockchain: selectedBlockchain
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ NFT mint initiated:', result.data);
            
            // Close NFT modal
            document.getElementById('nftModal').classList.remove('show');
            
            // Show success
            showSuccess(`🌟 NFT minting initiated on ${selectedBlockchain.toUpperCase()}! This is a demo - in production, you'd see a transaction hash.`);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('❌ NFT minting error:', error);
        alert('NFT minting failed: ' + error.message);
    }
});

// ==================== SHARE FUNCTIONS ====================
document.querySelector('.twitter-btn').addEventListener('click', () => {
    const text = `Check out my Y2K mood sticker! ${stickerData.mood_emoji} ${stickerData.mood_name}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
});

document.querySelector('.instagram-btn').addEventListener('click', () => {
    showSuccess('📷 To share on Instagram: Download your sticker and upload it to your story or feed!');
});

document.getElementById('copyLinkBtn').addEventListener('click', () => {
    const link = `${window.location.origin}/views/sticker-result.html?id=${stickerData.id}`;
    
    navigator.clipboard.writeText(link).then(() => {
        showSuccess('🔗 Link copied to clipboard!');
    }).catch(() => {
        alert('Link: ' + link);
    });
});

// ==================== CREATE ANOTHER ====================
document.getElementById('createAnotherBtn').addEventListener('click', () => {
    // Clear session storage
    sessionStorage.removeItem('selectedMood');
    sessionStorage.removeItem('generatedSticker');
    
    // Go back to landing
    window.location.href = 'landing.html';
});

// ==================== SUCCESS MODAL ====================
function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').classList.add('show');
}

document.getElementById('closeSuccessModal').addEventListener('click', () => {
    document.getElementById('successModal').classList.remove('show');
});

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
    console.log('🎉 Result page loading...');
    
    // Create visual effects
    createFloatingShapes();
    createSparkles();
    
    // Load sticker data
    loadStickerData();
    
    console.log('✅ Result page loaded!');
});
