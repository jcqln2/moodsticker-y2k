<?php
// app/config/database.php
// SQLite Database configuration

// SQLite database file path
define('DB_PATH', ROOT_PATH . '/storage/database.sqlite');

// PDO options
define('DB_OPTIONS', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);
