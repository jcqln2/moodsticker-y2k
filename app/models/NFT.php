<?php
// app/models/NFT.php
// NFT model - handles NFT minting records

class NFT extends Model {
    
    protected $table = 'nft_mints';
    protected $primaryKey = 'id';
    
    // Create NFT mint record
    public function createMintRecord($data) {
        $mintData = [
            'sticker_id' => $data['sticker_id'],
            'wallet_address' => $data['wallet_address'],
            'blockchain' => $data['blockchain'], // 'lukso' or 'polygon'
            'status' => 'pending'
        ];
        
        return $this->create($mintData);
    }
    
    // Update mint status
    public function updateMintStatus($id, $status, $additionalData = []) {
        $updateData = array_merge(['status' => $status], $additionalData);
        return $this->update($id, $updateData);
    }
    
    // Get NFT by sticker ID
    public function getNFTByStickerId($stickerId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE sticker_id = :sticker_id 
                ORDER BY created_at DESC 
                LIMIT 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['sticker_id' => $stickerId]);
        return $stmt->fetch();
    }
    
    // Get NFTs by wallet address
    public function getNFTsByWallet($walletAddress, $limit = 50) {
        $sql = "SELECT 
                    n.*,
                    s.file_path,
                    s.custom_text,
                    m.name as mood_name,
                    m.emoji as mood_emoji
                FROM {$this->table} n
                JOIN stickers s ON n.sticker_id = s.id
                JOIN moods m ON s.mood_id = m.id
                WHERE n.wallet_address = :wallet
                ORDER BY n.created_at DESC
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':wallet', $walletAddress, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    // Get NFT with full details
    public function getNFTWithDetails($id) {
        $sql = "SELECT 
                    n.*,
                    s.file_path,
                    s.custom_text,
                    s.custom_color,
                    s.user_name,
                    m.name as mood_name,
                    m.emoji as mood_emoji,
                    m.color as mood_color
                FROM {$this->table} n
                JOIN stickers s ON n.sticker_id = s.id
                JOIN moods m ON s.mood_id = m.id
                WHERE n.id = :id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
    
    // Get pending mints
    public function getPendingMints($limit = 20) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE status = 'pending' 
                ORDER BY created_at ASC 
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    // Get NFTs by blockchain
    public function getNFTsByBlockchain($blockchain, $limit = 50) {
        $sql = "SELECT 
                    n.*,
                    s.file_path,
                    m.name as mood_name,
                    m.emoji as mood_emoji
                FROM {$this->table} n
                JOIN stickers s ON n.sticker_id = s.id
                JOIN moods m ON s.mood_id = m.id
                WHERE n.blockchain = :blockchain
                ORDER BY n.created_at DESC
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':blockchain', $blockchain, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    // Check if sticker has been minted
    public function isStickerMinted($stickerId) {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} 
                WHERE sticker_id = :sticker_id 
                AND status = 'completed'";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['sticker_id' => $stickerId]);
        $result = $stmt->fetch();
        
        return $result['count'] > 0;
    }
    
    // Get NFT statistics
    public function getStatistics() {
        $sql = "SELECT 
                    COUNT(*) as total_mints,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_mints,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_mints,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_mints,
                    COUNT(CASE WHEN blockchain = 'lukso' THEN 1 END) as lukso_mints,
                    COUNT(CASE WHEN blockchain = 'polygon' THEN 1 END) as polygon_mints
                FROM {$this->table}";
        
        $stmt = $this->db->query($sql);
        return $stmt->fetch();
    }
    
    // Sort NFTs using Merge Sort algorithm
    public function sortNFTs($nfts, $sortBy = 'created_at', $order = 'desc') {
        if (empty($nfts)) {
            return $nfts;
        }
        
        return $this->mergeSort($nfts, $sortBy, $order);
    }
    
    // Merge Sort implementation (stable sort)
    private function mergeSort($array, $sortBy, $order) {
        if (count($array) <= 1) {
            return $array;
        }
        
        $middle = (int)(count($array) / 2);
        $left = array_slice($array, 0, $middle);
        $right = array_slice($array, $middle);
        
        $left = $this->mergeSort($left, $sortBy, $order);
        $right = $this->mergeSort($right, $sortBy, $order);
        
        return $this->merge($left, $right, $sortBy, $order);
    }
    
    // Merge helper for merge sort
    private function merge($left, $right, $sortBy, $order) {
        $result = [];
        
        while (count($left) > 0 && count($right) > 0) {
            $comparison = $this->compareValues($left[0][$sortBy], $right[0][$sortBy]);
            
            if ($order === 'asc') {
                if ($comparison <= 0) {
                    $result[] = array_shift($left);
                } else {
                    $result[] = array_shift($right);
                }
            } else {
                if ($comparison >= 0) {
                    $result[] = array_shift($left);
                } else {
                    $result[] = array_shift($right);
                }
            }
        }
        
        while (count($left) > 0) {
            $result[] = array_shift($left);
        }
        
        while (count($right) > 0) {
            $result[] = array_shift($right);
        }
        
        return $result;
    }
    
    // Helper to compare values
    private function compareValues($a, $b) {
        if ($a == $b) return 0;
        return ($a < $b) ? -1 : 1;
    }
}
