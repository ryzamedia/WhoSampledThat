# 🎵 Who Sampled That?

<div align="center">
  <img src="src/assets/who sampled that logo small.png" alt="Who Sampled That Logo" width="200"/>
  
  **The Ultimate Music Party Game**
  
  *Test your music knowledge by identifying original samples and the songs that use them!*

  [![Build and Deploy](https://github.com/AIXR-VRA/WhoSampledThat/actions/workflows/deploy.yml/badge.svg)](https://github.com/AIXR-VRA/WhoSampledThat/actions/workflows/deploy.yml)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
  [![Stars](https://img.shields.io/github/stars/AIXR-VRA/WhoSampledThat?style=social)](https://github.com/AIXR-VRA/WhoSampledThat/stargazers)
  [![Forks](https://img.shields.io/github/forks/AIXR-VRA/WhoSampledThat?style=social)](https://github.com/AIXR-VRA/WhoSampledThat/network/members)
</div>

## 🎮 About the Game

"Who Sampled That?" is the perfect party game for music lovers! Gather your friends and compete to see who has the best music knowledge. Challenge each other to identify:
- **Original Sample**: The source track that was sampled
- **New Track**: The modern song that uses the sample
- **Artist Names**: Who performed each track

Perfect for game nights, parties, or hanging out with friends, players compete in multiple rounds, earning points for correctly guessing the artist, track name, and identifying the sample connection. The game features a beautiful retro-inspired UI with animated musical notes, YouTube integration for audio playback, and a comprehensive tutorial system for new players.

## ✨ Features

### 🎯 Core Gameplay
- **Multi-Round Competition**: Progress through multiple tracks with increasing difficulty
- **Point System**: Earn points for correctly identifying artists, tracks, and samples
- **Real-Time Scoring**: Live score updates as players make correct guesses
- **Persistent Game State**: Resume games where you left off using local storage

### 🎵 Audio Experience
- **YouTube Integration**: High-quality audio playback directly from YouTube
- **Custom Audio Controls**: Play, pause, and restart tracks with precision
- **Waveform Visualizer**: Animated waveform display during playback
- **Round Start Jingle**: Custom audio cue to begin each round (toggleable)
- **Auto-Play Feature**: Automatically start playing the original sample

### 🎨 User Interface
- **Retro-Futuristic Design**: Neon-styled UI with animated floating musical notes
- **Mobile Responsive**: Fully optimized for desktop, tablet, and mobile devices
- **Reveal System**: Hide/show track information with blur effects
- **Tutorial System**: Interactive guided tour for first-time users
- **Dark Theme**: Modern dark interface with colorful accents

### ⚙️ Customization
- **Game Settings**: Toggle jingle and auto-play features
- **Player Management**: Add/remove players dynamically
- **Round Navigation**: Jump between rounds freely
- **Score Reset**: Start fresh games while maintaining player roster

## 🚀 Live Demo

🔗 **[Play Now](http://whosampledthat.com/)** - *Live production deployment*

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS 4.1.10** - Utility-first CSS framework

### UI Components & Libraries
- **@headlessui/react** - Unstyled, accessible UI components
- **Lucide React** - Beautiful, customizable icons
- **Driver.js** - Interactive tutorial system
- **React YouTube** - YouTube player integration

### Build & Development
- **GitHub Actions** - Automated testing and build pipeline
- **Vite** - Fast build tool and development server

## 📦 Installation & Setup

### Prerequisites
- **Node.js 18+** (with npm)
- **Git**

### Local Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173` to see the game in action!

### Available Scripts

```bash
# Development
npm run dev          # Start Vite development server
npm run preview      # Preview production build locally

# Building
npm run build        # Build for production
npm run lint         # Run ESLint for code quality

# Deployment (requires Cloudflare setup)
npx wrangler publish # Deploy to Cloudflare Workers
```

## 🎮 How to Play

### Game Setup
1. **Add Players**: Enter player names to join the game
2. **Start Game**: Begin with your roster of players
3. **Tutorial**: First-time users get an interactive tutorial

### During Each Round
1. **Listen**: Play the original sample to hear the source material
2. **Guess**: Identify the new artist and song that used the sample
3. **Reveal**: Play the new song, then reveal the answers on both players
4. **Score**: Award points for correct guesses:
   - 🎤 **New artist** (1 point)
   - 🎵 **New song** (1 point)
   - 🎼 **Sample bonus** for naming the original sample (1 point)
   Tap a selected category again to undo; the round subtotal shows 0–3.

### Game Controls
- **Play/Pause**: Control audio playback
- **Replay**: Restart the track or sample
- **Reveal**: Show/hide track information
- **Navigation**: Move between rounds freely

### Scoring System
- Each correct identification earns **1 point**
- Maximum **3 points per round** per player
- Scores persist across rounds and browser sessions
- Real-time score updates as points are awarded



## 📁 Project Structure

```
WhoSampledThat/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── InfoDropdown.tsx
│   │   ├── SettingsDropdown.tsx
│   │   └── WaveformPlayer.tsx
│   ├── contexts/           # React Context providers
│   │   └── GameContext.tsx
│   ├── data/              # Game data and track lists
│   │   └── tracklist.json
│   ├── lib/               # Utility functions and storage
│   │   ├── gameStorage.ts
│   │   └── tutorial.ts
│   ├── pages/             # Main game screens
│   │   ├── GameRound.tsx
│   │   └── GameSetup.tsx
│   └── assets/            # Static assets
├── public/                # Public static files
├── .github/workflows/     # CI/CD configurations
└── package.json          # Dependencies and scripts
```

## 🎵 Adding New Tracks

To add new tracks to the game, edit `src/data/tracklist.json`:

```json
{
  "originalSample": {
    "artist": "Original Artist Name",
    "trackName": "Original Track Name",
    "youtubeVideoId": "YouTube_Video_ID",
    "startTime": 30,
    "duration": 15
  },
  "newSong": {
    "artist": "Sampling Artist Name", 
    "trackName": "New Track Name",
    "youtubeVideoId": "YouTube_Video_ID",
    "startTime": 45,
    "duration": 20
  }
}
```

### Track Configuration
- **`youtubeVideoId`**: Extract from YouTube URL (e.g., `dQw4w9WgXcQ`)
- **`startTime`**: When to start playback (seconds)
- **`duration`**: How long to play (seconds) - optional

## 🖼️ Dynamic Share Image Generation

The game features a sophisticated Open Graph (OG) image generation system that creates custom share images for social media platforms when players share their scores.

### How It Works

#### 1. Share URL Generation
When players share their scores, the game generates a unique share URL in the format:
```
https://whosampledthat.com/share/{shareId}
```

The `shareId` is a URL-safe base64 encoded string containing player scores in a compact format:
```
Format: "name1:score1,name2:score2,name3:score3"
Example: "Alice:15,Bob:12,Charlie:8" → encoded → "QWxpY2U6MTUsQm9iOjEyLENoYXJsaWU6OA"
```

#### 2. Dynamic Meta Tag Injection
When a share URL is accessed:
- The Cloudflare Worker intercepts the request
- Decodes the share ID to extract player scores
- Dynamically generates Open Graph and Twitter Card meta tags
- Injects custom meta tags with player-specific content into the HTML

#### 3. Custom Image Generation
The system generates unique OG images at `/api/share-image/{shareId}`:
- **Base Image**: Uses `social-share-card-base-square.png` (1080x1080px)
- **Dynamic Overlay**: Top 3 players with scores overlaid using `workers-og` library
- **Format**: Square format (1080x1080) for optimal social media compatibility
- **Caching**: Generated images are cached for 1 hour to improve performance

#### 4. Technical Implementation

**Share ID Encoding/Decoding:**
```javascript
// Encode scores to share ID
const scoreString = players.map(p => `${p.name}:${p.score}`).join(',');
const shareId = btoa(scoreString).replace(/\+/g, '-').replace(/\//g, '_');

// Decode share ID back to scores
const decoded = atob(shareId.replace(/-/g, '+').replace(/_/g, '/'));
```

**Dynamic Meta Tags:**
```html
<!-- Generated for each share -->
<meta property="og:title" content="Who Sampled That? - Game Results! 🎵">
<meta property="og:description" content="🥇 Alice: 15 pts | 🥈 Bob: 12 pts | 🥉 Charlie: 8 pts">
<meta property="og:image" content="https://whosampledthat.com/api/share-image/{shareId}">
<meta property="og:image:width" content="1080">
<meta property="og:image:height" content="1080">
```

**Image Generation Process:**
1. **Base Image Loading**: Fetches the square base image from assets
2. **JSX Component Creation**: Builds a React-like component with scores overlay
3. **Image Rendering**: Uses `workers-og` to render the component as PNG
4. **Error Handling**: Falls back to base image if generation fails

#### 5. Performance & Reliability Features

- **Caching Strategy**: Generated images cached for 1 hour, share pages for 5 minutes
- **Error Handling**: Graceful fallbacks to original homepage if share ID is invalid
- **Format Optimization**: Square images work best across all social platforms
- **Compression**: Efficient base64 encoding keeps share URLs short

### Social Media Integration

The generated images work seamlessly with:
- **Facebook**: Displays custom image with player scores
- **Twitter**: Rich media cards with game results
- **Discord**: Embedded previews with leaderboard
- **LinkedIn**: Professional sharing with results
- **WhatsApp**: Preview images in chat

### File Structure for OG Generation

```
WhoSampledThat/
├── src/worker.js              # Main worker with OG generation logic
├── public/
│   └── social-share-card-base-square.png  # Base image template
└── wrangler.toml             # Cloudflare Workers configuration
```

This system enables rich social sharing experiences, allowing players to showcase their music knowledge with visually appealing, automatically generated scoreboard images.

## 💻 Development Highlights

This project showcases modern web development practices and technologies:

### Technical Architecture
- **Component-Based Design**: Modular React components with TypeScript
- **State Management**: Context API with persistent local storage
- **Performance Optimization**: Vite for fast builds and development
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Code Quality Standards
- **TypeScript** for type safety and better developer experience
- **ESLint** for consistent code quality and style
- **Modern React Patterns**: Hooks, Context, and functional components
- **Accessibility**: ARIA-compliant components with HeadlessUI

### Production Features
- **Automated CI/CD**: GitHub Actions deployment pipeline
- **Edge Computing**: Cloudflare Workers for global performance
- **Progressive Enhancement**: Works offline with cached assets
- **Error Handling**: Graceful fallbacks for audio playback issues

## 🤝 Contributing

We welcome contributions from the community! Whether you're a developer, musician, or just passionate about the game, there are many ways to help:

### 🎵 Easy Ways to Contribute
- **Add new tracks** to `src/data/tracklist.json`
- **Report bugs** or suggest features via GitHub Issues
- **Improve documentation** and help others get started
- **Share the game** with fellow music lovers

### 🔧 Developer Contributions
- **Bug fixes** and **feature implementations**
- **UI/UX improvements** and **accessibility enhancements**
- **Performance optimizations** and **code quality improvements**
- **Testing** and **documentation** updates

### Getting Started
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/WhoSampledThat.git`
3. **Install dependencies**: `npm install`
4. **Start developing**: `npm run dev` (runs locally at `http://localhost:5173`)
5. **Test your changes** thoroughly in your local environment
6. **Submit a pull request**

For detailed contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).

**Security**: Please review our [Security Policy](SECURITY.md) before contributing.

### 🌟 Community & Support

- **⭐ Star the project** if you find it useful
- **🐛 Report bugs** via [GitHub Issues](https://github.com/AIXR-VRA/WhoSampledThat/issues)
- **💡 Request features** or discuss ideas
- **🤝 Join discussions** and help other contributors

### 🎯 Roadmap & Future Features

We're always looking to improve! Here are some features we'd love help with:

- [ ] **Spotify Integration** - Expand beyond YouTube for broader music catalog
- [ ] **Multiplayer Online** - Real-time competitive gameplay
- [ ] **Custom Playlists** - Let users create their own track collections
- [ ] **Advanced Scoring** - More sophisticated point systems
- [ ] **Mobile App** - Native iOS/Android versions
- [ ] **Accessibility** - Better screen reader and keyboard navigation support
- [ ] **Offline Mode** - Play without internet connection
- [ ] **Social Features** - Share scores and compete with friends

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

This means you can freely use, modify, and distribute this project, even for commercial purposes!

### Open Source Benefits
- ✅ **Free to use** for personal and commercial projects
- ✅ **Modify and customize** to fit your needs
- ✅ **Learn from the code** and improve your skills
- ✅ **Contribute back** to help the community
- ✅ **No restrictions** on distribution or usage

## 🎤 Acknowledgments

- **YouTube** for providing the audio content platform
- **Cloudflare Workers** for reliable edge deployment
- **React & Vite** communities for excellent development tools
- **Music artists** whose samples make this game possible
- **Open source community** for inspiration and contributions
- **All contributors** who help make this project better

---

<div align="center">
  <strong>Made with ❤️ for music lovers everywhere</strong>
  
  <p>🌟 <strong>Open Source</strong> • 🤝 <strong>Community Driven</strong> • 🎵 <strong>Music Powered</strong></p>
  
  <br><br>
  
  **[🎮 Play Live Game](http://whosampledthat.com/)** | **[📱 Mobile Optimized](http://whosampledthat.com/)** | **[🤝 Contribute on GitHub](https://github.com/AIXR-VRA/WhoSampledThat)**
  
  <br>
  
  🌟 **Star us on GitHub** | 🍴 **Fork and contribute** | 📢 **Share with friends**
</div>

### Reliability and festive accents

The original logo, typography, dark glass styling, and screen layouts are preserved.
Seasonal decorations follow the visitor’s local date automatically, with no theme picker.
Christmas runs 15 November–30 December, New Year 31 December–5 January, and
Halloween 15–31 October. Candy canes, snowflakes and musical notes fall behind
the game at Christmas, with seasonal lights and colours. Settings → Background
motion pauses the decorations; reduced-motion preferences produce a still backdrop.

Use Node.js 24 or newer. Run `npm test`, `npm run lint`, and `npm run build` before
deploying. Regression coverage includes atomic scoring, replay, saved game validation,
season boundaries, the original game screens, playback timing, and safe results links.
If YouTube blocks or removes an embedded video, the game offers a YouTube link and
lets players continue to the next round. Shared results never replace the recipient's
saved game.
