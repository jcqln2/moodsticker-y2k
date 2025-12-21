<?php
// router.php
// Router for PHP built-in server

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Handle storage/stickers files
if (preg_match('#^/storage/stickers/(.+)$#', $uri, $matches)) {
    $file = __DIR__ . '/storage/stickers/' . $matches[1];
    if (file_exists($file) && is_file($file)) {
        // Set proper headers for image
        header('Content-Type: image/png');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
    http_response_code(404);
    echo "File not found";
    exit;
}

// Handle API requests
if (preg_match('#^/api/#', $uri)) {
    // Route to API
    require_once __DIR__ . '/api/index.php';
    return true;
}

// Handle static files in public directory
if (preg_match('#^/(css|js|images)/#', $uri)) {
    $file = __DIR__ . '/public' . $uri;
    if (file_exists($file)) {
        return false; // Let PHP server handle static files
    }
}

// Handle view files
if (preg_match('#^/views/#', $uri)) {
    $file = __DIR__ . '/public' . $uri;
    if (file_exists($file)) {
        return false;
    }
}

// Default: show landing page
if ($uri === '/' || $uri === '') {
    header('Location: /views/landing.html');
    exit;
}

// File not found
return false;
