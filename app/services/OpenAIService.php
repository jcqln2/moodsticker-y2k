<?php
namespace App\Services;

use OpenAI;

class OpenAIService {
    private $client;
    private $apiKey;
    
    public function __construct() {
        // Don't initialize client here - do it lazily when needed
        // This allows the controller to be instantiated even if API key is missing
    }
    
    private function getClient() {
        if ($this->client === null) {
            $this->apiKey = $this->resolveApiKey();
            if (empty($this->apiKey)) {
                throw new \Exception($this->getApiKeyError());
            }
            $this->client = OpenAI::client($this->apiKey);
        }
        return $this->client;
    }
    
    private function resolveApiKey() {
        // #region agent log
        $debugInfo = [
            'has_ENV' => isset($_ENV['OPENAI_API_KEY']),
            'ENV_value_length' => isset($_ENV['OPENAI_API_KEY']) ? strlen($_ENV['OPENAI_API_KEY']) : 0,
            'ENV_value_empty' => isset($_ENV['OPENAI_API_KEY']) ? empty($_ENV['OPENAI_API_KEY']) : true,
            'getenv_result' => getenv('OPENAI_API_KEY') !== false,
            'getenv_length' => getenv('OPENAI_API_KEY') !== false ? strlen(getenv('OPENAI_API_KEY')) : 0,
            'has_SERVER' => isset($_SERVER['OPENAI_API_KEY']),
            'SERVER_value_length' => isset($_SERVER['OPENAI_API_KEY']) ? strlen($_SERVER['OPENAI_API_KEY']) : 0,
            'variables_order' => ini_get('variables_order'),
            'all_SERVER_keys_with_OPENAI' => array_filter(array_keys($_SERVER), function($k) { return stripos($k, 'OPENAI') !== false; }),
        ];
        error_log('[DEBUG] OpenAIService resolveApiKey - env check: ' . json_encode($debugInfo));
        $logData = [
            'location' => 'OpenAIService.php:resolveApiKey',
            'message' => 'Checking environment variable sources',
            'data' => $debugInfo,
            'timestamp' => time() * 1000,
            'sessionId' => 'debug-session',
            'runId' => 'run1',
            'hypothesisId' => 'A,B,C,D,E'
        ];
        $logPath = defined('STORAGE_PATH') ? STORAGE_PATH . '/logs/debug.log' : '/tmp/debug.log';
        @file_put_contents($logPath, json_encode($logData) . "\n", FILE_APPEND);
        // #endregion
        
        // Try multiple sources: $_ENV, $_SERVER, getenv()
        // Also check if $_ENV needs to be populated from $_SERVER (Railway sometimes doesn't populate $_ENV)
        if (empty($_ENV['OPENAI_API_KEY']) && !empty($_SERVER['OPENAI_API_KEY'])) {
            $_ENV['OPENAI_API_KEY'] = $_SERVER['OPENAI_API_KEY'];
        }
        
        $apiKey = null;
        if (!empty($_ENV['OPENAI_API_KEY'])) {
            $apiKey = $_ENV['OPENAI_API_KEY'];
        } elseif (!empty($_SERVER['OPENAI_API_KEY'])) {
            $apiKey = $_SERVER['OPENAI_API_KEY'];
        } elseif (getenv('OPENAI_API_KEY') !== false && !empty(getenv('OPENAI_API_KEY'))) {
            $apiKey = getenv('OPENAI_API_KEY');
        }
        
        // Check if Railway shared variable syntax is present (unresolved template)
        if (!empty($apiKey) && (strpos($apiKey, '${{') !== false || strpos($apiKey, 'shared.') !== false)) {
            error_log('[WARNING] Railway shared variable appears unresolved: ' . substr($apiKey, 0, 50));
            $apiKey = null; // Treat as not found
        }
        
        // #region agent log
        $resultInfo = [
            'apiKey_found' => !empty($apiKey),
            'apiKey_length' => $apiKey ? strlen($apiKey) : 0,
            'apiKey_preview' => $apiKey ? substr($apiKey, 0, 10) . '...' : 'null',
        ];
        error_log('[DEBUG] OpenAIService resolveApiKey - API key resolution: ' . json_encode($resultInfo));
        $logData2 = [
            'location' => 'OpenAIService.php:resolveApiKey',
            'message' => 'API key resolution result',
            'data' => $resultInfo,
            'timestamp' => time() * 1000,
            'sessionId' => 'debug-session',
            'runId' => 'run1',
            'hypothesisId' => 'A,B,C,D,E'
        ];
        @file_put_contents($logPath, json_encode($logData2) . "\n", FILE_APPEND);
        // #endregion
        
        return $apiKey;
    }
    
    private function getApiKeyError() {
        // Check if Railway shared variable syntax is present (unresolved template)
        $hasUnresolvedTemplate = false;
        $templateValue = null;
        if (isset($_SERVER['OPENAI_API_KEY']) && (strpos($_SERVER['OPENAI_API_KEY'], '${{') !== false || strpos($_SERVER['OPENAI_API_KEY'], 'shared.') !== false)) {
            $hasUnresolvedTemplate = true;
            $templateValue = $_SERVER['OPENAI_API_KEY'];
        } elseif (isset($_ENV['OPENAI_API_KEY']) && (strpos($_ENV['OPENAI_API_KEY'], '${{') !== false || strpos($_ENV['OPENAI_API_KEY'], 'shared.') !== false)) {
            $hasUnresolvedTemplate = true;
            $templateValue = $_ENV['OPENAI_API_KEY'];
        } elseif (getenv('OPENAI_API_KEY') !== false && (strpos(getenv('OPENAI_API_KEY'), '${{') !== false || strpos(getenv('OPENAI_API_KEY'), 'shared.') !== false)) {
            $hasUnresolvedTemplate = true;
            $templateValue = getenv('OPENAI_API_KEY');
        }
        
        // Check for common variations of the variable name
        $possibleKeys = ['OPENAI_API_KEY', 'openai_api_key', 'OpenAI_Api_Key'];
        $foundVariations = [];
        foreach ($possibleKeys as $keyVar) {
            if (!empty($_SERVER[$keyVar])) {
                $val = $_SERVER[$keyVar];
                $foundVariations[] = "SERVER[$keyVar]=" . strlen($val) . (strpos($val, '${{') !== false ? '(unresolved)' : '');
            }
            if (!empty($_ENV[$keyVar])) {
                $val = $_ENV[$keyVar];
                $foundVariations[] = "ENV[$keyVar]=" . strlen($val) . (strpos($val, '${{') !== false ? '(unresolved)' : '');
            }
            if (getenv($keyVar) !== false && !empty(getenv($keyVar))) {
                $val = getenv($keyVar);
                $foundVariations[] = "getenv($keyVar)=" . strlen($val) . (strpos($val, '${{') !== false ? '(unresolved)' : '');
            }
        }
        
        // Get all keys containing "OPENAI" or "API" for debugging
        $allOpenaiKeys = array_filter(array_keys($_SERVER), function($k) { 
            return stripos($k, 'OPENAI') !== false || stripos($k, 'API') !== false; 
        });
        
        $debugMsg = 'OPENAI_API_KEY not found. ';
        
        if ($hasUnresolvedTemplate) {
            $debugMsg .= 'RAILWAY SHARED VARIABLE UNRESOLVED: The variable exists but contains Railway template syntax (' . substr($templateValue, 0, 50) . '). ';
            $debugMsg .= 'SOLUTION: In Railway dashboard, go to your service → Variables tab → Click on OPENAI_API_KEY → Replace "${{shared.OPENAI_API_KEY}}" with the actual API key value (starts with sk-). ';
        }
        
        $debugMsg .= 'ENV=' . (isset($_ENV['OPENAI_API_KEY']) ? 'set(' . strlen($_ENV['OPENAI_API_KEY']) . ')' : 'not_set') . 
                   ', SERVER=' . (isset($_SERVER['OPENAI_API_KEY']) ? 'set(' . strlen($_SERVER['OPENAI_API_KEY']) . ')' : 'not_set') . 
                   ', getenv=' . (getenv('OPENAI_API_KEY') !== false ? 'set(' . strlen(getenv('OPENAI_API_KEY')) . ')' : 'not_set') .
                   ', vars_order=' . ini_get('variables_order') .
                   (count($foundVariations) > 0 ? ', found_variations=' . implode(',', $foundVariations) : '') .
                   (count($allOpenaiKeys) > 0 ? ', similar_keys=' . implode(',', array_slice($allOpenaiKeys, 0, 10)) : '');
        error_log('[ERROR] ' . $debugMsg);
        return $debugMsg;
    }
    
    public function generateMoodSticker($mood, $style = 'y2k', $customText = null) {
        // #region agent log
        $logPath = defined('STORAGE_PATH') ? STORAGE_PATH . '/logs/debug.log' : '/tmp/debug.log';
        $logData = [
            'location' => 'OpenAIService.php:66',
            'message' => 'generateMoodSticker called',
            'data' => [
                'mood' => $mood,
                'style' => $style,
                'customText' => $customText,
                'client_exists' => isset($this->client),
            ],
            'timestamp' => time() * 1000,
            'sessionId' => 'debug-session',
            'runId' => 'run1',
            'hypothesisId' => 'E'
        ];
        error_log('[DEBUG] generateMoodSticker called: ' . json_encode(['mood' => $mood, 'style' => $style]));
        @file_put_contents($logPath, json_encode($logData) . "\n", FILE_APPEND);
        // #endregion
        
        // Build the prompt
        $prompt = $this->buildPrompt($mood, $style, $customText);
        
        try {
            $client = $this->getClient();
            $response = $client->images()->create([
                'model' => 'dall-e-3',
                'prompt' => $prompt,
                'n' => 1,
                'size' => '1024x1024',
                'quality' => 'standard', // 'standard' is cheaper than 'hd'
                'response_format' => 'url',
            ]);
            
            return [
                'success' => true,
                'url' => $response->data[0]->url,
                'revised_prompt' => $response->data[0]->revisedPrompt ?? null
            ];
            
        } catch (\Exception $e) {
            // #region agent log
            $logPath = defined('STORAGE_PATH') ? STORAGE_PATH . '/logs/debug.log' : '/tmp/debug.log';
            $logData = [
                'location' => 'OpenAIService.php:104',
                'message' => 'OpenAI API error caught',
                'data' => [
                    'error_message' => $e->getMessage(),
                    'error_code' => $e->getCode(),
                ],
                'timestamp' => time() * 1000,
                'sessionId' => 'debug-session',
                'runId' => 'run1',
                'hypothesisId' => 'E'
            ];
            error_log('[ERROR] OpenAI API error: ' . $e->getMessage());
            @file_put_contents($logPath, json_encode($logData) . "\n", FILE_APPEND);
            // #endregion
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    private function buildPrompt($mood, $style, $customText) {
        // Y2K theme elements to randomly incorporate
        $themes = [
            'Bratz dolls aesthetic with oversized heads, large eyes, full glossy lips, trendy streetwear fashion, bold makeup, and attitude',
            'lipgloss and beauty products with shiny, glossy textures, pink and purple hues, sparkles, and early 2000s makeup aesthetic',
            'colorful butterfly clips in hair, playful accessories, pastel colors, and fun Y2K fashion accessories',
            '90s makeup style with blue eyeshadow, glitter, bold eyeliner, frosted lips, and dramatic lashes',
            'Spice Girls inspired fashion with platform shoes, Union Jack elements, bold patterns, girl power aesthetic, and 90s pop culture',
            'Clueless movie aesthetic with plaid skirts, yellow outfits, preppy fashion, Beverly Hills style, and 90s teen movie vibes'
        ];
        
        // Randomly select 2-3 themes to combine
        shuffle($themes);
        $selectedThemes = array_slice($themes, 0, rand(2, 3));
        $themeDescription = implode(', ', $selectedThemes);
        
        // Build the prompt with mood and themes
        $prompt = "Create a vibrant Y2K aesthetic digital sticker with a " . strtolower($mood) . " mood. ";
        $prompt .= "Incorporate elements inspired by: " . $themeDescription . ". ";
        $prompt .= "Style: bright neon colors, chrome effects, holographic elements, glitter, sparkles, glossy textures, and early 2000s pop culture aesthetic. ";
        $prompt .= "Design should be fun, playful, and nostalgic, capturing the essence of late 90s and early 2000s fashion and beauty trends. ";
        
        // Add custom text if provided
        if ($customText) {
            $prompt .= "Include the text '" . $customText . "' prominently in the design, styled in a fun Y2K font. ";
        }
        
        $prompt .= "Digital art style, sticker format with transparent background or soft gradient background. High quality, detailed, vibrant colors.";
        
        return $prompt;
    }
}
