<?php
// app/core/Database.php
// Database connection handler using PDO with SQLite

class Database {
    private static $instance = null;
    private $connection;
    
    // Private constructor (Singleton pattern)
    private function __construct() {
        try {
            // Create database file if it doesn't exist
            if (!file_exists(DB_PATH)) {
                $dir = dirname(DB_PATH);
                if (!is_dir($dir)) {
                    mkdir($dir, 0755, true);
                }
                touch(DB_PATH);
            }
            
            $dsn = "sqlite:" . DB_PATH;
            $this->connection = new PDO($dsn, null, null, DB_OPTIONS);
            
            if (DEBUG_MODE) {
                error_log("SQLite database connection established successfully");
            }
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed. Please try again later.");
        }
    }
    
    // Get singleton instance
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    // Get PDO connection
    public function getConnection() {
        return $this->connection;
    }
    
    // Prevent cloning
    private function __clone() {}
    
    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
