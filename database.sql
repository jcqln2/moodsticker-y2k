-- database.sql
-- Y2K Mood Sticker Generator Database Schema

CREATE DATABASE IF NOT EXISTS moodsticker_y2k CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE moodsticker_y2k;

-- ==================== MOODS TABLE ====================
CREATE TABLE moods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description VARCHAR(255),
    color VARCHAR(7) NOT NULL, -- Hex color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default moods
INSERT INTO moods (name, emoji, description, color) VALUES
('Happy & Energetic', '😊', 'Feeling pumped!', '#FFFF00'),
('Chill & Peaceful', '😌', 'Just vibing~', '#00FFFF'),
('Flirty & Fun', '😍', 'Feeling cute!', '#FF69B4'),
('Thoughtful & Deep', '🤔', 'In my feels', '#9933FF'),
('Fired Up & Ready', '😤', 'Let\'s GO!', '#FF6600'),
('Need a Hug', '😭', 'Soft mood', '#FFB6C1'),
('Party Mode', '🎉', 'Turn up!', '#FF00FF'),
('Creative Vibes', '🎨', 'Artsy mood', '#CCFF00');

-- ==================== STICKERS TABLE ====================
CREATE TABLE stickers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mood_id INT NOT NULL,
    user_name VARCHAR(100),
    custom_text VARCHAR(255),
    custom_color VARCHAR(7),
    file_path VARCHAR(255) NOT NULL,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mood_id) REFERENCES moods(id) ON DELETE CASCADE,
    INDEX idx_mood (mood_id),
    INDEX idx_created (created_at),
    INDEX idx_downloads (download_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== NFT MINTS TABLE ====================
CREATE TABLE nft_mints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sticker_id INT NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    blockchain ENUM('lukso', 'polygon') NOT NULL,
    transaction_hash VARCHAR(255),
    token_id VARCHAR(100),
    contract_address VARCHAR(255),
    metadata_uri TEXT,
    status ENUM('pending', 'minting', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sticker_id) REFERENCES stickers(id) ON DELETE CASCADE,
    INDEX idx_sticker (sticker_id),
    INDEX idx_wallet (wallet_address),
    INDEX idx_status (status),
    INDEX idx_blockchain (blockchain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== GALLERY STATS TABLE ====================
-- For tracking popular stickers and sorting
CREATE TABLE gallery_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sticker_id INT NOT NULL,
    views INT DEFAULT 0,
    shares INT DEFAULT 0,
    last_viewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sticker_id) REFERENCES stickers(id) ON DELETE CASCADE,
    INDEX idx_views (views),
    INDEX idx_shares (shares)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== VIEWS FOR ANALYTICS ====================
CREATE VIEW popular_moods AS
SELECT 
    m.id,
    m.name,
    m.emoji,
    COUNT(s.id) as total_stickers,
    SUM(s.download_count) as total_downloads
FROM moods m
LEFT JOIN stickers s ON m.id = s.mood_id
GROUP BY m.id
ORDER BY total_stickers DESC;

CREATE VIEW recent_activity AS
SELECT 
    s.id as sticker_id,
    m.name as mood_name,
    m.emoji,
    s.user_name,
    s.download_count,
    s.created_at,
    CASE 
        WHEN nm.id IS NOT NULL THEN 'NFT'
        ELSE 'Download'
    END as type
FROM stickers s
JOIN moods m ON s.mood_id = m.id
LEFT JOIN nft_mints nm ON s.id = nm.sticker_id
ORDER BY s.created_at DESC
LIMIT 50;
