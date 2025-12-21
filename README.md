# 🌟 Y2K Mood Sticker Generator

A nostalgic Y2K-themed web application that generates custom mood stickers with optional NFT minting capabilities.

[Deloyed here](https://moodsticker-y2k-production.up.railway.app/views/landing.html)

![Y2K Stickers](https://img.shields.io/badge/Y2K-Vibes-ff00ff?style=for-the-badge)
![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)

## ✨ Features

- 🎨 **Custom Sticker Generation** - Create personalized mood stickers with Y2K aesthetic
- 😊 **8 Mood Types** - Choose from Happy, Chill, Flirty, Thoughtful, Fired Up, Need a Hug, Party Mode, or Creative Vibes
- 🎨 **Personalization** - Add custom text, colors, and your name
- 💾 **Free Download** - Save stickers as PNG files
- 🌟 **NFT Ready** - Demo NFT minting on LUKSO or Polygon blockchains
- 🖼️ **Gallery** - Browse and sort all created stickers
- 📊 **Sorting Algorithms** - QuickSort and MergeSort implementations

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Y2K-inspired design with animations and gradients
- Responsive layout

### Backend
- PHP 8.3
- MVC Architecture
- REST API
- SQLite Database
- GD Library for image generation

### Algorithms & Data Structures
- **QuickSort** - Sticker sorting by date/downloads
- **MergeSort** - NFT sorting (stable sort)
- **Hash Tables** - Mood lookups
- **Arrays** - Data storage and manipulation

## 📁 Project Structure
```
moodsticker-y2k/
├── public/              # Frontend files
│   ├── views/          # HTML pages
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript
│   └── images/         # Static images
├── app/                # PHP Backend
│   ├── controllers/    # MVC Controllers
│   ├── models/         # Data models
│   ├── views/          # PHP views
│   ├── core/           # Core classes
│   └── config/         # Configuration
├── api/                # REST API
├── storage/            # Generated files
│   ├── stickers/       # Generated sticker images
│   └── database.sqlite # SQLite database
└── router.php          # Request router
```

## 🚀 Local Setup

### Prerequisites
- PHP 8.1+ with GD extension
- SQLite support
- Web server (or PHP built-in server)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/moodsticker-y2k.git
cd moodsticker-y2k
```

2. **Set up the database**
```bash
php setup-database.php
```

3. **Start the server**
```bash
php -S localhost:8000 -t public router.php
```

4. **Open in browser**
```
http://localhost:8000/views/landing.html
```

## 🌐 API Endpoints

### Moods
- `GET /api/moods` - Get all moods
- `GET /api/moods/{id}` - Get specific mood
- `GET /api/moods/random` - Get random mood

### Stickers
- `GET /api/stickers` - Get all stickers
- `GET /api/stickers/{id}` - Get specific sticker
- `POST /api/stickers/generate` - Generate new sticker
- `POST /api/stickers/{id}/download` - Track download
- `GET /api/gallery` - Get gallery with sorting

### NFTs (Demo)
- `POST /api/nft/mint` - Initiate NFT minting
- `GET /api/nft/{id}` - Get NFT details

## 📊 Database Schema

### Tables
- `moods` - Mood types and properties
- `stickers` - Generated stickers
- `nft_mints` - NFT minting records
- `gallery_stats` - View/share statistics

## 🎓 Course Requirements Met

✅ **PHP** - Server-side programming throughout  
✅ **MVC Architecture** - Clean separation of concerns  
✅ **REST API** - JSON endpoints with proper HTTP methods  
✅ **Database** - SQLite with relationships and indexes  
✅ **Data Structures** - Arrays, hash tables, objects  
✅ **Sorting Algorithms** - QuickSort and MergeSort  

## 👩‍💻 Author

**Jacqueline Robinson**  
Mohawk College - Computer Science  
Winter 2025

## 📝 License

This project was created as an academic assignment for COMP-10260 (Server Side Web Programming) at Mohawk College.

## 🙏 Acknowledgments

- Y2K aesthetic inspiration from early 2000s web design
- PHP GD library for image generation
- SQLite for lightweight database solution
