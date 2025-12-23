<?php
// setup-database.php
// Initialize SQLite database and run migrations

require_once 'app/config/config.php';
require_once 'app/config/database.php';

try {
    echo "Setting up SQLite database...\n";
    
    // Get database connection
    $db = Database::getInstance()->getConnection();
    
    // Check if database already exists
    $dbExists = file_exists(DB_PATH);
    
    if (!$dbExists) {
        // Fresh install - read SQL file and create everything
        echo "Creating new database...\n";
        $sql = file_get_contents('database-sqlite.sql');
        $db->exec($sql);
        echo "✅ Database created!\n";
    } else {
        // Existing database - check if tables exist
        echo "Database already exists, checking tables...\n";
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='moods'")->fetchAll();
        
        if (empty($tables)) {
            // Tables don't exist, create them
            echo "Creating tables...\n";
            $sql = file_get_contents('database-sqlite.sql');
            $db->exec($sql);
            echo "✅ Tables created!\n";
        } else {
            // Tables exist - check if migration is needed
            echo "Tables exist, checking if migration is needed...\n";
            
            // Check if old moods exist (by checking for old mood names)
            $oldMoods = $db->query("SELECT COUNT(*) as count FROM moods WHERE name IN ('Happy & Energetic', 'Chill & Peaceful', 'Flirty & Fun', 'Thoughtful & Deep')")->fetch();
            
            if ($oldMoods['count'] > 0) {
                echo "Old moods detected, migrating to Y2K themes...\n";
                
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
                    echo "  ✓ Migrated: {$mood[0]}\n";
                }
                
                echo "✅ Migration complete!\n";
            } else {
                // Check if new moods already exist
                $newMoodsCount = $db->query("SELECT COUNT(*) as count FROM moods WHERE name IN ('Bratz Vibes', 'Lipgloss Queen', 'Butterfly Clip Energy')")->fetch();
                
                if ($newMoodsCount['count'] == 0) {
                    // No moods at all, insert new ones
                    echo "No moods found, inserting Y2K themes...\n";
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
                    }
                    echo "✅ Y2K moods inserted!\n";
                } else {
                    echo "✅ Y2K moods already exist, skipping migration.\n";
                }
            }
        }
    }
    
    echo "📁 Database location: " . DB_PATH . "\n";
    
    // Verify tables were created
    $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll();
    
    echo "\n📋 Tables:\n";
    foreach ($tables as $table) {
        echo "  - " . $table['name'] . "\n";
    }
    
    // Verify moods
    $moodCount = $db->query("SELECT COUNT(*) as count FROM moods")->fetch();
    echo "\n😊 Moods: " . $moodCount['count'] . "\n";
    
    // List moods
    $moods = $db->query("SELECT name FROM moods ORDER BY name")->fetchAll();
    foreach ($moods as $mood) {
        echo "  - " . $mood['name'] . "\n";
    }
    
    echo "\n🎉 Database setup complete!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
