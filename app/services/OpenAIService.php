<?php
namespace App\Services;

use OpenAI;

class OpenAIService {
    private $client;
    
    public function __construct() {
        $apiKey = $_ENV['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY');
        $this->client = OpenAI::client($apiKey);
    }
    
    public function generateMoodSticker($mood, $style = 'y2k', $customText = null) {
        // Build the prompt
        $prompt = $this->buildPrompt($mood, $style, $customText);
        
        try {
            $response = $this->client->images()->create([
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
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    private function buildPrompt($mood, $style, $customText) {
        // Craft Y2K-style prompts
        $basePrompt = "Create a vibrant Y2K aesthetic digital sticker with a ";
        $moodDescription = strtolower($mood) . " mood vibe";
        $styleElements = ", featuring bright gradients, chrome effects, butterfly motifs, holographic elements, and early 2000s digital aesthetic. ";
        
        $prompt = $basePrompt . $moodDescription . $styleElements;
        
        // Add custom text if provided
        if ($customText) {
            $prompt .= "Include the text '" . $customText . "' prominently in the design. ";
        }
        
        $prompt .= "Digital art, glossy finish, nostalgic 2000s internet culture, sticker format with transparent or complementary background.";
        
        return $prompt;
    }
}
