<?php
// app/core/Controller.php
// Base controller class

class Controller {
    
    // Load a model
    protected function model($model) {
        require_once APP_PATH . '/models/' . $model . '.php';
        return new $model();
    }
    
    // Load a view
    protected function view($view, $data = []) {
        extract($data);
        require_once APP_PATH . '/views/' . $view . '.php';
    }
    
    // JSON response helper
    protected function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
        exit;
    }
    
    // Error response helper
    protected function errorResponse($message, $statusCode = 400) {
        $this->jsonResponse([
            'success' => false,
            'error' => $message
        ], $statusCode);
    }
    
    // Success response helper
    protected function successResponse($data, $message = null) {
        $response = [
            'success' => true,
            'data' => $data
        ];
        
        if ($message) {
            $response['message'] = $message;
        }
        
        $this->jsonResponse($response, 200);
    }
    
    // Validate request method
    protected function validateMethod($allowedMethods) {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if (!in_array($method, $allowedMethods)) {
            $this->errorResponse('Method not allowed', 405);
        }
    }
    
    // Get POST data as JSON
    protected function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true);
    }
    
    // Sanitize input
    protected function sanitize($data) {
        if (is_array($data)) {
            return array_map([$this, 'sanitize'], $data);
        }
        
        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }
}
