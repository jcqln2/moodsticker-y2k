<?php
require_once 'app/config/config.php';

use App\Services\OpenAIService;

echo "Testing OpenAI Integration...\n\n";

// Check if API key is loaded
$apiKey = getenv('OPENAI_API_KEY');
if (!$apiKey) {
    die("ERROR: OPENAI_API_KEY not found in environment!\nMake sure you have a .env file with OPENAI_API_KEY=your-key\n");
}

echo "✓ API Key loaded: " . substr($apiKey, 0, 10) . "...\n\n";

// Test the service
try {
    $service = new OpenAIService();
    echo "✓ OpenAIService instantiated\n\n";
    
    echo "Generating test sticker for 'happy' mood...\n";
    echo "(This will cost about $0.04)\n\n";
    
    $result = $service->generateMoodSticker('happy', 'y2k', 'Test Vibes');
    
    if ($result['success']) {
        echo "✓ SUCCESS! Image generated!\n\n";
        echo "Image URL: " . $result['url'] . "\n\n";
        if (isset($result['revised_prompt'])) {
            echo "Revised prompt: " . $result['revised_prompt'] . "\n\n";
        }
        echo "Open the URL above in your browser to see the generated sticker!\n";
    } else {
        echo "✗ FAILED: " . $result['error'] . "\n";
    }
    
} catch (Exception $e) {
    echo "✗ ERROR: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}
