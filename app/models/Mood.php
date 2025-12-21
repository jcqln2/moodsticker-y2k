<?php
// app/models/Mood.php
// Mood model - handles mood data

class Mood extends Model {
    
    protected $table = 'moods';
    protected $primaryKey = 'id';
    
    // Get all moods
    public function getAllMoods() {
        return $this->all('name ASC');
    }
    
    // Get mood by ID
    public function getMoodById($id) {
        return $this->find($id);
    }
    
    // Get mood by name
    public function getMoodByName($name) {
        $sql = "SELECT * FROM {$this->table} WHERE name = :name LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['name' => $name]);
        return $stmt->fetch();
    }
    
    // Get random mood
    public function getRandomMood() {
        $sql = "SELECT * FROM {$this->table} ORDER BY RANDOM() LIMIT 1";
        $stmt = $this->db->query($sql);
        return $stmt->fetch();
    }
    
    // Get popular moods (from view)
    public function getPopularMoods($limit = 5) {
        $sql = "SELECT * FROM popular_moods LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    // Get mood with sticker count
    public function getMoodWithStats($id) {
        $sql = "SELECT 
                    m.*,
                    COUNT(s.id) as sticker_count,
                    SUM(s.download_count) as total_downloads
                FROM {$this->table} m
                LEFT JOIN stickers s ON m.id = s.mood_id
                WHERE m.id = :id
                GROUP BY m.id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
    
    // Search moods by keyword
    public function searchMoods($keyword) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE name LIKE :keyword 
                OR description LIKE :keyword
                ORDER BY name ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['keyword' => "%{$keyword}%"]);
        return $stmt->fetchAll();
    }
}
