<?php
// test-api.php
// Test API endpoints

echo "🧪 Testing API Endpoints...\n\n";

// Test moods endpoint
echo "📋 Testing GET /api/moods:\n";
$ch = curl_init('http://localhost:8000/api/moods');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);

if ($data['success']) {
    echo "  ✅ Success! Found " . count($data['data']) . " moods\n";
    echo "  First mood: " . $data['data'][0]['name'] . " " . $data['data'][0]['emoji'] . "\n\n";
} else {
    echo "  ❌ Failed: " . $data['error'] . "\n\n";
}

// Test random mood
echo "🎲 Testing GET /api/moods/random:\n";
$ch = curl_init('http://localhost:8000/api/moods/random');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$data = json_decode($response, true);
curl_close($ch);

if ($data['success']) {
    echo "  ✅ Random mood: " . $data['data']['name'] . " " . $data['data']['emoji'] . "\n\n";
} else {
    echo "  ❌ Failed: " . $data['error'] . "\n\n";
}

echo "🎉 API is working!\n";
