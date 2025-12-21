<?php
// setup-database.php
// Initialize SQLite database

require_once 'app/config/config.php';
require_once 'app/config/database.php';

try {
    echo "Setting up SQLite database...\n";
    
    // Get database connection
    $db = Database::getInstance()->getConnection();
    
    // Read SQL file
    $sql = file_get_contents('database-sqlite.sql');
    
    // Execute SQL
    $db->exec($sql);
    
    echo "✅ Database setup complete!\n";
    echo "📁 Database location: " . DB_PATH . "\n";
    
    // Verify tables were created
    $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll();
    
    echo "\n📋 Tables created:\n";
    foreach ($tables as $table) {
        echo "  - " . $table['name'] . "\n";
    }
    
    // Verify moods were inserted
    $moodCount = $db->query("SELECT COUNT(*) as count FROM moods")->fetch();
    echo "\n😊 Moods inserted: " . $moodCount['count'] . "\n";
    
    echo "\n🎉 All done! Your database is ready to use.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
