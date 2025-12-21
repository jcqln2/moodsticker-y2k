<?php
// app/models/Sticker.php
// Sticker model - handles sticker creation and management

class Sticker extends Model {
    
    protected $table = 'stickers';
    protected $primaryKey = 'id';
    
    // Create a new sticker
    public function createSticker($data) {
        $stickerData = [
            'mood_id' => $data['mood_id'],
            'user_name' => $data['user_name'] ?? null,
            'custom_text' => $data['custom_text'] ?? null,
            'custom_color' => $data['custom_color'] ?? null,
            'file_path' => $data['file_path']
        ];
        
        return $this->create($stickerData);
    }
    
    // Get sticker with mood info
    public function getStickerWithMood($id) {
        $sql = "SELECT 
                    s.*,
                    m.name as mood_name,
                    m.emoji as mood_emoji,
                    m.color as mood_color
                FROM {$this->table} s
                JOIN moods m ON s.mood_id = m.id
                WHERE s.id = :id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
    
    // Get all stickers with mood info
    public function getAllStickersWithMood($limit = 50, $offset = 0) {
        $sql = "SELECT 
                    s.*,
                    m.name as mood_name,
                    m.emoji as mood_emoji,
                    m.color as mood_color
                FROM {$this->table} s
                JOIN moods m ON s.mood_id = m.id
                ORDER BY s.created_at DESC
                LIMIT :limit OFFSET :offset";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    // Get stickers by mood
    public function getStickersByMood($moodId, $limit = 20) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE mood_id = :mood_id 
                ORDER BY created_at DESC 
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':mood_id', $moodId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    // Increment download count
    public function incrementDownloads($id) {
        $sql = "UPDATE {$this->table} 
                SET download_count = download_count + 1 
                WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
    
    // Get recent stickers (for gallery)
    public function getRecentStickers($limit = 20) {
        return $this->getAllStickersWithMood($limit, 0);
    }
    
    // Get most downloaded stickers
    public function getMostDownloaded($limit = 10) {
        $sql = "SELECT 
                    s.*,
                    m.name as mood_name,
                    m.emoji as mood_emoji,
                    m.color as mood_color
                FROM {$this->table} s
                JOIN moods m ON s.mood_id = m.id
                ORDER BY s.download_count DESC
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    // Sort stickers using Quick Sort algorithm
    public function sortStickers($stickers, $sortBy = 'created_at', $order = 'desc') {
        if (empty($stickers)) {
            return $stickers;
        }
        
        return $this->quickSort($stickers, $sortBy, $order);
    }
    
    // Quick Sort implementation
    private function quickSort($array, $sortBy, $order) {
        if (count($array) < 2) {
            return $array;
        }
        
        $left = $right = [];
        reset($array);
        $pivot_key = key($array);
        $pivot = array_shift($array);
        
        foreach ($array as $k => $v) {
            $comparison = $this->compareValues($v[$sortBy], $pivot[$sortBy]);
            
            if ($order === 'asc') {
                if ($comparison < 0) {
                    $left[$k] = $v;
                } else {
                    $right[$k] = $v;
                }
            } else {
                if ($comparison > 0) {
                    $left[$k] = $v;
                } else {
                    $right[$k] = $v;
                }
            }
        }
        
        return array_merge(
            $this->quickSort($left, $sortBy, $order),
            [$pivot_key => $pivot],
            $this->quickSort($right, $sortBy, $order)
        );
    }
    
    // Helper to compare values
    private function compareValues($a, $b) {
        if ($a == $b) return 0;
        return ($a < $b) ? -1 : 1;
    }
    
    // Get sticker statistics
    public function getStatistics() {
        $sql = "SELECT 
                    COUNT(*) as total_stickers,
                    SUM(download_count) as total_downloads,
                    AVG(download_count) as avg_downloads,
                    MAX(download_count) as max_downloads
                FROM {$this->table}";
        
        $stmt = $this->db->query($sql);
        return $stmt->fetch();
    }
}
