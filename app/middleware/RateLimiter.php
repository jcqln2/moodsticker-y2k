<?php

class RateLimiter {
    private $maxRequestsPerDay = 100; // Adjust based on your budget
    private $logFile;
    
    public function __construct() {
        $this->logFile = STORAGE_PATH . '/logs/api_usage.log';
        
        // Create log directory if it doesn't exist
        $logDir = dirname($this->logFile);
        if (!file_exists($logDir)) {
            mkdir($logDir, 0777, true);
        }
    }
    
    public function checkLimit() {
        $today = date('Y-m-d');
        $count = $this->getTodayCount($today);
        
        if ($count >= $this->maxRequestsPerDay) {
            return [
                'allowed' => false,
                'message' => 'Daily generation limit reached! Try again tomorrow 🦋',
                'used' => $count,
                'limit' => $this->maxRequestsPerDay
            ];
        }
        
        $this->incrementCount($today);
        return [
            'allowed' => true,
            'used' => $count + 1,
            'limit' => $this->maxRequestsPerDay
        ];
    }
    
    private function getTodayCount($date) {
        if (!file_exists($this->logFile)) {
            return 0;
        }
        
        $logs = file_get_contents($this->logFile);
        return substr_count($logs, $date);
    }
    
    private function incrementCount($date) {
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($this->logFile, "$timestamp\n", FILE_APPEND);
    }
    
    public function getUsageStats() {
        $today = date('Y-m-d');
        $used = $this->getTodayCount($today);
        
        return [
            'used' => $used,
            'limit' => $this->maxRequestsPerDay,
            'remaining' => max(0, $this->maxRequestsPerDay - $used),
            'percentage' => round(($used / $this->maxRequestsPerDay) * 100, 1)
        ];
    }
}
