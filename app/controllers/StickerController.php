<?php
// app/controllers/StickerController.php
// Handles sticker generation and management

require_once __DIR__ . '/../services/OpenAIService.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';  // ADD THIS LINE

use App\Services\OpenAIService;

class StickerController extends Controller {
    
    private $stickerModel;
    private $moodModel;
    private $openAIService;
    
    public function __construct() {
        $this->stickerModel = $this->model('Sticker');
        $this->moodModel = $this->model('Mood');
        $this->openAIService = new OpenAIService();
    }
    
    // GET /api/stickers - Get all stickers (gallery)
    public function index() {
        try {
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
            $sortBy = isset($_GET['sort']) ? $this->sanitize($_GET['sort']) : 'created_at';
            $order = isset($_GET['order']) ? $this->sanitize($_GET['order']) : 'desc';
            
            $stickers = $this->stickerModel->getAllStickersWithMood($limit, $offset);
            
            if (in_array($sortBy, ['created_at', 'download_count'])) {
                $stickers = $this->stickerModel->sortStickers($stickers, $sortBy, $order);
            }
            
            $this->successResponse([
                'stickers' => $stickers,
                'count' => count($stickers),
                'limit' => $limit,
                'offset' => $offset
            ]);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    public function show($id) {
        try {
            $sticker = $this->stickerModel->getStickerWithMood($id);
            
            if (!$sticker) {
                $this->errorResponse('Sticker not found', 404);
            }
            
            $this->successResponse($sticker);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    public function generate() {
        $this->validateMethod(['POST']);
        $rateLimiter = new RateLimiter();
        $limitCheck = $rateLimiter->checkLimit();
    
        if (!$limitCheck['allowed']) {
            $this->errorResponse($limitCheck['message'], 429);
            return;
            }
        
        try {
            $input = $this->getJsonInput();
            
            if (!isset($input['mood_id'])) {
                $this->errorResponse('mood_id is required', 400);
            }
            
            $mood = $this->moodModel->getMoodById($input['mood_id']);
            if (!$mood) {
                $this->errorResponse('Invalid mood_id', 400);
            }
            
            // NEW: Generate with OpenAI
            $result = $this->openAIService->generateMoodSticker(
                $mood['name'],
                'y2k',
                $input['custom_text'] ?? null
            );
            
            if (!$result['success']) {
                $this->errorResponse('Failed to generate sticker: ' . $result['error'], 500);
            }
            
            // Download and save the image locally
            $filename = $this->downloadAndSaveImage($result['url']);
            
            $stickerData = [
                'mood_id' => (int)$input['mood_id'],
                'user_name' => isset($input['user_name']) ? $this->sanitize($input['user_name']) : null,
                'custom_text' => isset($input['custom_text']) ? $this->sanitize($input['custom_text']) : null,
                'custom_color' => isset($input['custom_color']) ? $this->sanitize($input['custom_color']) : null,
                'file_path' => $filename,
            ];
            
            $stickerId = $this->stickerModel->createSticker($stickerData);
            
            if (!$stickerId) {
                $this->errorResponse('Failed to create sticker', 500);
            }
            
            $sticker = $this->stickerModel->getStickerWithMood($stickerId);
            
            $this->successResponse($sticker, 'Sticker generated successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    // NEW: Add fallback method to use old GD generation
    public function generateLegacy() {
        $this->validateMethod(['POST']);
        
        try {
            $input = $this->getJsonInput();
            
            if (!isset($input['mood_id'])) {
                $this->errorResponse('mood_id is required', 400);
            }
            
            $mood = $this->moodModel->getMoodById($input['mood_id']);
            if (!$mood) {
                $this->errorResponse('Invalid mood_id', 400);
            }
            
            $stickerData = [
                'mood_id' => (int)$input['mood_id'],
                'user_name' => isset($input['user_name']) ? $this->sanitize($input['user_name']) : null,
                'custom_text' => isset($input['custom_text']) ? $this->sanitize($input['custom_text']) : null,
                'custom_color' => isset($input['custom_color']) ? $this->sanitize($input['custom_color']) : null,
            ];
            
            $filename = $this->generateStickerImage($mood, $stickerData);
            $stickerData['file_path'] = $filename;
            
            $stickerId = $this->stickerModel->createSticker($stickerData);
            
            if (!$stickerId) {
                $this->errorResponse('Failed to create sticker', 500);
            }
            
            $sticker = $this->stickerModel->getStickerWithMood($stickerId);
            
            $this->successResponse($sticker, 'Sticker generated successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    public function download($id) {
        $this->validateMethod(['POST']);
        
        try {
            $sticker = $this->stickerModel->find($id);
            
            if (!$sticker) {
                $this->errorResponse('Sticker not found', 404);
            }
            
            $this->stickerModel->incrementDownloads($id);
            
            $this->successResponse([
                'file_path' => $sticker['file_path'],
                'download_url' => BASE_URL . '/storage/stickers/' . basename($sticker['file_path'])
            ], 'Download tracked');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    public function gallery() {
        try {
            $sortBy = isset($_GET['sort']) ? $this->sanitize($_GET['sort']) : 'recent';
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
            
            switch ($sortBy) {
                case 'popular':
                    $stickers = $this->stickerModel->getMostDownloaded($limit);
                    break;
                case 'recent':
                default:
                    $stickers = $this->stickerModel->getRecentStickers($limit);
                    break;
            }
            
            $this->successResponse([
                'stickers' => $stickers,
                'sort' => $sortBy,
                'count' => count($stickers)
            ]);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    // ==================== NEW: DOWNLOAD AND SAVE OPENAI IMAGE ====================
    private function downloadAndSaveImage($url) {
        $filename = 'sticker_' . time() . '_' . uniqid() . '.png';
        $filepath = STORAGE_PATH . '/stickers/' . $filename;
        
        // Download the image from OpenAI
        $imageData = file_get_contents($url);
        
        if ($imageData === false) {
            throw new Exception('Failed to download image from OpenAI');
        }
        
        // Save to local storage
        $saved = file_put_contents($filepath, $imageData);
        
        if ($saved === false) {
            throw new Exception('Failed to save image locally');
        }
        
        return $filename;
    }
    
    // ==================== LEGACY GD STICKER GENERATION (KEPT AS BACKUP) ====================
    private function generateStickerImage($mood, $data) {
        $filename = 'sticker_' . time() . '_' . uniqid() . '.png';
        $filepath = STORAGE_PATH . '/stickers/' . $filename;
        
        $width = 600;
        $height = 600;
        $image = imagecreatetruecolor($width, $height);
        
        imagealphablending($image, true);
        imagesavealpha($image, true);
        
        $colorHex = $data['custom_color'] ?? $mood['color'];
        $baseColor = $this->hexToRgb($colorHex);
        
        // Create background with radial gradient
        $this->addRadialGradient($image, $width, $height, $baseColor);
        
        // Add Y2K pattern overlay
        $this->addY2KPattern($image, $width, $height);
        
        // Add decorative borders
        $this->addDecorativeBorder($image, $width, $height);
        
        // Define colors
        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);
        $neonPink = imagecolorallocate($image, 255, 0, 255);
        $cyan = imagecolorallocate($image, 0, 255, 255);
        
        // Add sparkles
        $this->addSparkles($image, $width, $height, $white);
        
        $font = $this->getFont();
        
        // Add mood name at top
        $this->addGlowText($image, strtoupper($mood['name']), 24, $width / 2, 60, $white, $neonPink, $font);
        
        // Add emoji in center
        $emojiSize = 180;
        $emojiY = (int)($height / 2);
        
        if ($font) {
            $this->addTextWithShadow($image, $mood['emoji'], $emojiSize, $width / 2, $emojiY, $white, $black, $font, 8);
        }
        
        // Add custom text if provided
        if (!empty($data['custom_text'])) {
            $textY = $emojiY - 120;
            $this->addGlowText($image, $data['custom_text'], 32, $width / 2, $textY, $white, $cyan, $font);
        }
        
        // Add user name if provided
        if (!empty($data['user_name'])) {
            $nameY = $emojiY + 140;
            $this->addStyledText($image, '~ ' . $data['user_name'] . ' ~', 20, $width / 2, $nameY, $white, $neonPink, $font);
        }
        
        // Add Y2K badge
        $this->addY2KBadge($image, $width, $height);
        
        imagepng($image, $filepath, 6);
        imagedestroy($image);
        
        return $filename;
    }
    
    // ==================== HELPER FUNCTIONS (KEPT FOR LEGACY) ====================
    
    private function hexToRgb($hex) {
        $hex = str_replace('#', '', $hex);
        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2))
        ];
    }
    
    private function addRadialGradient($image, $width, $height, $baseColor) {
        $centerX = $width / 2;
        $centerY = $height / 2;
        $maxRadius = sqrt($centerX * $centerX + $centerY * $centerY);
        
        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                $distance = sqrt(pow($x - $centerX, 2) + pow($y - $centerY, 2));
                $ratio = $distance / $maxRadius;
                
                $r = (int)max(0, min(255, $baseColor[0] - ($ratio * 80)));
                $g = (int)max(0, min(255, $baseColor[1] - ($ratio * 80)));
                $b = (int)max(0, min(255, $baseColor[2] - ($ratio * 80)));
                
                $color = imagecolorallocate($image, $r, $g, $b);
                imagesetpixel($image, $x, $y, $color);
            }
        }
    }
    
    private function addY2KPattern($image, $width, $height) {
        $patternColor = imagecolorallocatealpha($image, 255, 255, 255, 115);
        
        for ($i = -$height; $i < $width + $height; $i += 40) {
            imageline($image, $i, 0, $i + $height, $height, $patternColor);
        }
    }
    
    private function addDecorativeBorder($image, $width, $height) {
        $white = imagecolorallocate($image, 255, 255, 255);
        $pink = imagecolorallocate($image, 255, 0, 255);
        $cyan = imagecolorallocate($image, 0, 255, 255);
        
        imagesetthickness($image, 8);
        imagerectangle($image, 10, 10, $width - 11, $height - 11, $white);
        
        imagesetthickness($image, 4);
        imagerectangle($image, 18, 18, $width - 19, $height - 19, $pink);
        
        imagesetthickness($image, 2);
        imagerectangle($image, 24, 24, $width - 25, $height - 25, $cyan);
    }
    
    private function addSparkles($image, $width, $height, $color) {
        for ($i = 0; $i < 15; $i++) {
            $x = rand(50, $width - 50);
            $y = rand(50, $height - 50);
            $size = rand(8, 16);
            $this->drawStar($image, $x, $y, $size, $color);
        }
    }
    
    private function drawStar($image, $x, $y, $size, $color) {
        imageline($image, $x, $y - $size, $x, $y + $size, $color);
        imageline($image, $x - $size, $y, $x + $size, $y, $color);
        imageline($image, (int)($x - $size/2), (int)($y - $size/2), (int)($x + $size/2), (int)($y + $size/2), $color);
        imageline($image, (int)($x + $size/2), (int)($y - $size/2), (int)($x - $size/2), (int)($y + $size/2), $color);
    }
    
    private function addGlowText($image, $text, $size, $x, $y, $color, $glowColor, $font) {
        $x = (int)$x;
        $y = (int)$y;
        
        if ($font) {
            $bbox = imagettfbbox($size, 0, $font, $text);
            $textWidth = abs($bbox[4] - $bbox[0]);
            $x = (int)($x - ($textWidth / 2));
            
            // Glow effect - simplified
            for ($i = 4; $i > 0; $i--) {
                imagettftext($image, $size, 0, $x + $i, $y + $i, $glowColor, $font, $text);
                imagettftext($image, $size, 0, $x - $i, $y - $i, $glowColor, $font, $text);
            }
            
            // Shadow and main text
            imagettftext($image, $size, 0, $x + 3, $y + 3, imagecolorallocate($image, 0, 0, 0), $font, $text);
            imagettftext($image, $size, 0, $x, $y, $color, $font, $text);
        } else {
            $strWidth = strlen($text) * imagefontwidth(5);
            $x = (int)($x - ($strWidth / 2));
            imagestring($image, 5, $x, (int)($y - 10), $text, $color);
        }
    }
    
    private function addTextWithShadow($image, $text, $size, $x, $y, $color, $shadowColor, $font, $shadowOffset) {
        $x = (int)$x;
        $y = (int)$y;
        
        if ($font) {
            $bbox = imagettfbbox($size, 0, $font, $text);
            $textWidth = abs($bbox[4] - $bbox[0]);
            $x = (int)($x - ($textWidth / 2));
            
            for ($i = $shadowOffset; $i > 0; $i--) {
                imagettftext($image, $size, 0, $x + $i, $y + $i, $shadowColor, $font, $text);
            }
            
            imagettftext($image, $size, 0, $x, $y, $color, $font, $text);
        }
    }
    
    private function addStyledText($image, $text, $size, $x, $y, $color, $accentColor, $font) {
        $x = (int)$x;
        $y = (int)$y;
        
        if ($font) {
            $bbox = imagettfbbox($size, 0, $font, $text);
            $textWidth = abs($bbox[4] - $bbox[0]);
            $x = (int)($x - ($textWidth / 2));
            
            // Outline
            imagettftext($image, $size, 0, $x - 2, $y, $accentColor, $font, $text);
            imagettftext($image, $size, 0, $x + 2, $y, $accentColor, $font, $text);
            imagettftext($image, $size, 0, $x, $y - 2, $accentColor, $font, $text);
            imagettftext($image, $size, 0, $x, $y + 2, $accentColor, $font, $text);
            
            // Shadow
            imagettftext($image, $size, 0, $x + 2, $y + 2, imagecolorallocate($image, 0, 0, 0), $font, $text);
            
            // Main text
            imagettftext($image, $size, 0, $x, $y, $color, $font, $text);
        }
    }
    
    private function addY2KBadge($image, $width, $height) {
        $pink = imagecolorallocate($image, 255, 0, 255);
        $white = imagecolorallocate($image, 255, 255, 255);
        
        $badgeX = $width - 100;
        $badgeY = $height - 80;
        
        imagefilledellipse($image, $badgeX, $badgeY, 60, 60, $pink);
        imageellipse($image, $badgeX, $badgeY, 60, 60, $white);
        
        $font = $this->getFont();
        if ($font) {
            imagettftext($image, 16, 0, $badgeX - 20, $badgeY + 6, $white, $font, 'Y2K');
        }
    }
    
    private function getFont() {
        $fontPaths = [
            '/System/Library/Fonts/Supplemental/Arial.ttf',
            '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
            '/Library/Fonts/Arial.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        ];
        
        foreach ($fontPaths as $font) {
            if (file_exists($font)) {
                return $font;
            }
        }
        
        return null;
    }
}
