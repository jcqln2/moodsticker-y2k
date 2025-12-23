<?php
// app/config/config.php
// Main application configuration

// Load .env file if it exists (for local development)
if (file_exists(dirname(dirname(__DIR__)) . '/.env')) {
    $lines = file(dirname(dirname(__DIR__)) . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments and empty lines
        if (strpos(trim($line), '#') === 0 || empty(trim($line))) {
            continue;
        }
        
        // Parse the line
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            $value = trim($value, '"\'');
            
            // Set environment variable
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

// Sync $_SERVER environment variables to $_ENV
// This is critical for Railway and other platforms where $_ENV might not be auto-populated
// Railway exposes environment variables via $_SERVER, but $_ENV might not be populated
$isRailway = getenv('RAILWAY_ENVIRONMENT') || getenv('RAILWAY_STATIC_URL') || !empty($_SERVER['RAILWAY_ENVIRONMENT']) || !empty($_SERVER['RAILWAY_STATIC_URL']);
$isProduction = !DEBUG_MODE; // If not in debug mode, assume production environment

// Always sync environment variables in production or if Railway is detected
if ($isRailway || $isProduction) {
    $excludedKeys = ['REQUEST_METHOD', 'REQUEST_URI', 'SCRIPT_NAME', 'QUERY_STRING', 'SERVER_NAME', 'SERVER_PORT', 'SERVER_PROTOCOL', 'GATEWAY_INTERFACE', 'SERVER_SOFTWARE', 'PATH', 'HOME', 'USER', 'SHELL', 'PWD', 'SHLVL', '_', 'DOCUMENT_ROOT', 'SCRIPT_FILENAME', 'SERVER_ADDR', 'SERVER_SOFTWARE', 'REMOTE_ADDR', 'REMOTE_PORT', 'CONTENT_TYPE', 'CONTENT_LENGTH'];
    
    foreach ($_SERVER as $key => $value) {
        // Only sync actual environment variables (not HTTP headers or other $_SERVER vars)
        // Environment variables are typically uppercase and don't contain HTTP_ prefix
        if (!isset($_ENV[$key]) && 
            is_string($value) && 
            strlen($key) > 0 &&
            substr($key, 0, 5) !== 'HTTP_' && 
            !in_array($key, $excludedKeys)) {
            // Check if key looks like an environment variable (all uppercase with underscores/numbers)
            $keyWithoutUnderscores = str_replace('_', '', $key);
            $keyWithoutUnderscoresNumbers = preg_replace('/[0-9]/', '', $keyWithoutUnderscores);
            if (ctype_upper($keyWithoutUnderscoresNumbers) && strlen($keyWithoutUnderscoresNumbers) > 0) {
                $_ENV[$key] = $value;
                // Also ensure putenv is set for compatibility
                putenv("$key=$value");
            }
        }
    }
}

// Explicitly check for OPENAI_API_KEY in all sources and sync it
// This is a critical variable, so we check multiple sources aggressively
$openaiKey = null;
if (!empty($_SERVER['OPENAI_API_KEY'])) {
    $openaiKey = $_SERVER['OPENAI_API_KEY'];
} elseif (getenv('OPENAI_API_KEY') !== false && !empty(getenv('OPENAI_API_KEY'))) {
    $openaiKey = getenv('OPENAI_API_KEY');
} elseif (!empty($_ENV['OPENAI_API_KEY'])) {
    $openaiKey = $_ENV['OPENAI_API_KEY'];
}

// Sync OPENAI_API_KEY to all sources if found in any source
if (!empty($openaiKey)) {
    if (empty($_ENV['OPENAI_API_KEY'])) {
        $_ENV['OPENAI_API_KEY'] = $openaiKey;
    }
    if (empty($_SERVER['OPENAI_API_KEY'])) {
        $_SERVER['OPENAI_API_KEY'] = $openaiKey;
    }
    if (getenv('OPENAI_API_KEY') === false) {
        putenv('OPENAI_API_KEY=' . $openaiKey);
    }
}

// Define root path
define('ROOT_PATH', dirname(dirname(__DIR__)));
define('APP_PATH', ROOT_PATH . '/app');
define('PUBLIC_PATH', ROOT_PATH . '/public');
define('STORAGE_PATH', ROOT_PATH . '/storage');

// Application settings
define('APP_NAME', 'Y2K Mood Sticker Generator');
define('APP_VERSION', '1.0.0');
define('DEBUG_MODE', getenv('RAILWAY_ENVIRONMENT') ? false : true); // Production mode on Railway

// URL Configuration - use Railway URL if available
$baseUrl = getenv('RAILWAY_STATIC_URL') 
    ? 'https://' . getenv('RAILWAY_STATIC_URL')
    : 'http://localhost:8000';
define('BASE_URL', $baseUrl);
define('API_URL', BASE_URL . '/api');

// File upload settings
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif']);

// Sticker generation settings
define('STICKER_WIDTH', 500);
define('STICKER_HEIGHT', 500);
define('STICKER_FORMAT', 'png');

// Session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
session_start();

// Error reporting
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    ini_set('error_log', ROOT_PATH . '/logs/error.log');
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('America/Toronto');

// Load Composer's autoloader
require_once ROOT_PATH . '/vendor/autoload.php';

// Autoloader for classes (fallback for non-namespaced classes)
spl_autoload_register(function ($class) {
    $paths = [
        APP_PATH . '/core/',
        APP_PATH . '/models/',
        APP_PATH . '/controllers/'
    ];
    
    foreach ($paths as $path) {
        $file = $path . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});