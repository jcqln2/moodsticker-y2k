<?php
// api/routes.php
// API route definitions

// Simple router
$routes = [
    'GET' => [
        // Moods
        'moods' => 'MoodController@index',
        'moods/(\d+)' => 'MoodController@show',
        'moods/random' => 'MoodController@random',
        'moods/popular' => 'MoodController@popular',
        'moods/search' => 'MoodController@search',
        
        // Stickers
        'stickers' => 'StickerController@index',
        'stickers/(\d+)' => 'StickerController@show',
        'gallery' => 'StickerController@gallery',
        
        // NFTs
        'nft/(\d+)' => 'NFTController@show',
        'nft/wallet/(.+)' => 'NFTController@wallet',
        'nft/pending' => 'NFTController@pending',
        'nft/stats' => 'NFTController@stats',
    ],
    'POST' => [
        // Stickers
        'stickers/generate' => 'StickerController@generate',
        'stickers/(\d+)/download' => 'StickerController@download',
        
        // NFTs
        'nft/mint' => 'NFTController@mint',
    ],
    'PUT' => [
        // Future: Update operations
    ],
    'DELETE' => [
        // Future: Delete operations
    ]
];

// Match route
$matched = false;

if (isset($routes[$requestMethod])) {
    foreach ($routes[$requestMethod] as $pattern => $handler) {
        $regex = '#^' . $pattern . '$#';
        
        if (preg_match($regex, $path, $matches)) {
            $matched = true;
            
            // Parse controller and method
            list($controllerName, $method) = explode('@', $handler);
            
            // Load controller
            $controllerFile = APP_PATH . '/controllers/' . $controllerName . '.php';
            
            if (!file_exists($controllerFile)) {
                throw new Exception("Controller not found: {$controllerName}");
            }
            
            require_once $controllerFile;
            $controller = new $controllerName();
            
            // Get parameters (everything except first match which is full string)
            $params = array_slice($matches, 1);
            
            // Call controller method
            call_user_func_array([$controller, $method], $params);
            break;
        }
    }
}

if (!$matched) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Route not found: ' . $path,
        'method' => $requestMethod,
        'available_routes' => 'See documentation for available endpoints'
    ]);
}
