<?php
// migrate-to-y2k-themes.php
// Migration script to update moods to Y2K themes

require_once 'app/config/config.php';
require_once 'app/config/database.php';

try {
    echo "Migrating to Y2K themes...\n";
    
    $db = Database::getInstance()->getConnection();
    
    // Delete old moods
    $db->exec("DELETE FROM moods");
    
    // Insert new Y2K-themed moods
    $newMoods = [
        ['Bratz Vibes', '✨', 'Totally Bratz! Bold fashion and attitude', '#FF69B4'],
        ['Lipgloss Queen', '💋', 'Shiny and glossy like your favorite lipgloss', '#FF1493'],
        ['Butterfly Clip Energy', '🦋', 'Colorful clips and playful accessories', '#FFB6C1'],
        ['90s Makeup Mood', '💄', 'Blue eyeshadow and glitter dreams', '#00CED1'],
        ['Spice Girls Style', '👑', 'Girl power and platform shoes', '#FFD700'],
        ['Clueless Chic', '👗', 'As if! Preppy and plaid perfection', '#FFD700'],
        ['Y2K Party', '🎊', 'Turn up the Y2K vibes!', '#FF00FF'],
        ['Glitter & Glam', '✨', 'All the sparkles and shine', '#FF69B4'],
    ];
    
    $stmt = $db->prepare("INSERT INTO moods (name, emoji, description, color) VALUES (?, ?, ?, ?)");
    
    foreach ($newMoods as $mood) {
        $stmt->execute($mood);
        echo "  ✓ Added: {$mood[0]}\n";
    }
    
    echo "\n✅ Migration complete! " . count($newMoods) . " Y2K-themed moods added.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

