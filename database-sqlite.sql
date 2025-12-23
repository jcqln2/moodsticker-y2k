-- database-sqlite.sql
-- Y2K Mood Sticker Generator - SQLite Schema

-- ==================== MOODS TABLE ====================
CREATE TABLE IF NOT EXISTS moods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) DEFAULT '✨',
    description VARCHAR(255),
    color VARCHAR(7) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_moods_name ON moods(name);

-- Insert default moods
INSERT INTO moods (name, emoji, description, color) VALUES
('Happy & Energetic', '😊', 'Feeling pumped!', '#FFFF00'),
('Chill & Peaceful', '😌', 'Just vibing~', '#00FFFF'),
('Flirty & Fun', '😍', 'Feeling cute!', '#FF69B4'),
('Thoughtful & Deep', '🤔', 'In my feels', '#9933FF'),
('Fired Up & Ready', '😤', 'Let''s GO!', '#FF6600'),
('Need a Hug', '😭', 'Soft mood', '#FFB6C1'),
('Party Mode', '🎉', 'Turn up!', '#FF00FF'),
('Creative Vibes', '🎨', 'Artsy mood', '#CCFF00');

-- ==================== STICKERS TABLE ====================
CREATE TABLE IF NOT EXISTS stickers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mood_id INTEGER NOT NULL,
    user_name VARCHAR(100),
    custom_text VARCHAR(255),
    custom_color VARCHAR(7),
    file_path VARCHAR(255) NOT NULL,
    download_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mood_id) REFERENCES moods(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stickers_mood ON stickers(mood_id);
CREATE INDEX IF NOT EXISTS idx_stickers_created ON stickers(created_at);
CREATE INDEX IF NOT EXISTS idx_stickers_downloads ON stickers(download_count);

-- ==================== NFT MINTS TABLE ====================
CREATE TABLE IF NOT EXISTS nft_mints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sticker_id INTEGER NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    blockchain VARCHAR(20) NOT NULL CHECK(blockchain IN ('lukso', 'polygon')),
    transaction_hash VARCHAR(255),
    token_id VARCHAR(100),
    contract_address VARCHAR(255),
    metadata_uri TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'minting', 'completed', 'failed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sticker_id) REFERENCES stickers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_nft_sticker ON nft_mints(sticker_id);
CREATE INDEX IF NOT EXISTS idx_nft_wallet ON nft_mints(wallet_address);
CREATE INDEX IF NOT EXISTS idx_nft_status ON nft_mints(status);
CREATE INDEX IF NOT EXISTS idx_nft_blockchain ON nft_mints(blockchain);

-- ==================== GALLERY STATS TABLE ====================
CREATE TABLE IF NOT EXISTS gallery_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sticker_id INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    last_viewed DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sticker_id) REFERENCES stickers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gallery_views ON gallery_stats(views);
CREATE INDEX IF NOT EXISTS idx_gallery_shares ON gallery_stats(shares);

-- ==================== VIEWS FOR ANALYTICS ====================
CREATE VIEW IF NOT EXISTS popular_moods AS
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

CREATE VIEW IF NOT EXISTS recent_activity AS
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
