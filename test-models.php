<?php
// test-models.php
// Test the models

require_once 'app/config/config.php';
require_once 'app/config/database.php';

try {
    echo "🧪 Testing Models...\n\n";
    
    // Test Mood Model
    echo "📋 Testing Mood Model:\n";
    $moodModel = new Mood();
    $moods = $moodModel->getAllMoods();
    echo "  ✅ Found " . count($moods) . " moods\n";
    echo "  First mood: " . $moods[0]['name'] . " " . $moods[0]['emoji'] . "\n\n";
    
    // Test random mood
    $randomMood = $moodModel->getRandomMood();
    echo "  🎲 Random mood: " . $randomMood['name'] . " " . $randomMood['emoji'] . "\n\n";
    
    // Test Sticker Model
    echo "📸 Testing Sticker Model:\n";
    $stickerModel = new Sticker();
    $stats = $stickerModel->getStatistics();
    echo "  ✅ Total stickers: " . $stats['total_stickers'] . "\n\n";
    
    // Test NFT Model
    echo "🎨 Testing NFT Model:\n";
    $nftModel = new NFT();
    $nftStats = $nftModel->getStatistics();
    echo "  ✅ Total NFT mints: " . $nftStats['total_mints'] . "\n\n";
    
    echo "🎉 All models working perfectly!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
