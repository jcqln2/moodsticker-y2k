// /public/js/landing.js

// ==================== SPARKLES ANIMATION ====================
function createSparkles() {
    const container = document.getElementById('sparkles');
    const sparkleCount = 50;
    
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

// ==================== STARS ANIMATION ====================
function createStars() {
    const container = document.getElementById('stars');
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(star);
    }
}


// ==================== BUTTON INTERACTIONS ====================
const startBtn = document.getElementById('startBtn');

startBtn.addEventListener('click', () => {
    // Add click animation
    startBtn.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        startBtn.style.transform = 'scale(1)';
        // Navigate to mood selection page
        window.location.href = 'mood-selection.html';
    }, 100);
});

// Add hover sound effect (optional - requires sound files)
startBtn.addEventListener('mouseenter', () => {
    // Could add sound effect here
    console.log('Button hover!');
});

// ==================== RESIZE HANDLER ====================
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    createSparkles();
    createStars();
    animateParticles();
    
    console.log('✨ Y2K Mood Stickers loaded! ✨');
});
