<?php
// api/index.php
// REST API entry point

// Load configuration
require_once dirname(__DIR__) . '/app/config/config.php';
require_once APP_PATH . '/config/database.php';

// Set headers for API
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove base path and query string
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/api/', '', $path);
$path = trim($path, '/');

// Route the request
try {
    // Load routes
    require_once __DIR__ . '/routes.php';
    
    // If no route matched, return 404
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Endpoint not found'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => DEBUG_MODE ? $e->getMessage() : 'Internal server error'
    ]);
}
