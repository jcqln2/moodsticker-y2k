<?php
// app/controllers/MoodController.php
// Handles mood-related API requests

class MoodController extends Controller {
    
    private $moodModel;
    
    public function __construct() {
        $this->moodModel = $this->model('Mood');
    }
    
    // GET /api/moods - Get all moods
    public function index() {
        try {
            $moods = $this->moodModel->getAllMoods();
            
            $this->successResponse($moods, 'Moods retrieved successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/moods/{id} - Get specific mood
    public function show($id) {
        try {
            $mood = $this->moodModel->getMoodWithStats($id);
            
            if (!$mood) {
                $this->errorResponse('Mood not found', 404);
            }
            
            $this->successResponse($mood);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/moods/random - Get random mood
    public function random() {
        try {
            $mood = $this->moodModel->getRandomMood();
            
            $this->successResponse($mood, 'Random mood selected');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/moods/popular - Get popular moods
    public function popular() {
        try {
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
            $moods = $this->moodModel->getPopularMoods($limit);
            
            $this->successResponse($moods, 'Popular moods retrieved');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/moods/search - Search moods
    public function search() {
        try {
            $keyword = isset($_GET['q']) ? $this->sanitize($_GET['q']) : '';
            
            if (empty($keyword)) {
                $this->errorResponse('Search keyword required', 400);
            }
            
            $moods = $this->moodModel->searchMoods($keyword);
            
            $this->successResponse($moods, "Found " . count($moods) . " mood(s)");
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
}
