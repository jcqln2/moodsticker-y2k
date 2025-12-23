<?php
// api/index.php
// REST API entry point

// Set error handler to catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'Fatal error: ' . $error['message'],
            'file' => $error['file'],
            'line' => $error['line']
        ], JSON_PRETTY_PRINT);
        exit;
    }
});

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
    $errorMessage = $e->getMessage();
    
    // Always show error details for API key issues or if DEBUG_MODE is on
    $showDetails = DEBUG_MODE || strpos($errorMessage, 'OPENAI_API_KEY') !== false || strpos($errorMessage, 'API key') !== false;
    
    $response = [
        'success' => false,
        'error' => $showDetails ? $errorMessage : 'Internal server error'
    ];
    
    // Add debug info for API key errors
    if (strpos($errorMessage, 'OPENAI_API_KEY') !== false) {
        $response['debug'] = [
            'has_ENV' => isset($_ENV['OPENAI_API_KEY']),
            'has_SERVER' => isset($_SERVER['OPENAI_API_KEY']),
            'has_getenv' => getenv('OPENAI_API_KEY') !== false,
            'variables_order' => ini_get('variables_order'),
        ];
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
}
