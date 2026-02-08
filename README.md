# Codenames - AI Spymaster Edition 🤖

Play Codenames online with friends, featuring an AI Spymaster powered by Ollama!

![Codenames](https://img.shields.io/badge/Game-Codenames-blue) ![Ollama](https://img.shields.io/badge/AI-Ollama-green) ![Supabase](https://img.shields.io/badge/Backend-Supabase-orange)

## Features

- 🎮 **Multiplayer** - Play with friends via shared game links
- 🤖 **AI Spymaster** - Ollama generates clever clues for your team
- ⚡ **Real-time Sync** - Instant updates across all players
- 🎯 **Classic Rules** - Authentic Codenames gameplay
- 🌙 **Dark Theme** - Beautiful, modern UI

## Quick Start

### Prerequisites

- [Docker](https://docker.com) & Docker Compose
- [Node.js](https://nodejs.org) v18+
- [Ollama](https://ollama.ai) with `llama3` model

### 1. Start the Backend

```bash
# Start Supabase + Ollama
docker compose up -d

# Pull the AI model (first time only)
docker exec codenames-ollama ollama pull llama3
```

### 2. Start the Frontend

```bash
npm install
npm run dev
```

### 3. Play!

1. Open http://localhost:5173
2. Click "Create New Game"
3. Share the link with your friend
4. Click "Get Clue" to have the AI generate a clue
5. Find your team's agents!

## Game Rules

- **Red Team** has 9 agents, **Blue Team** has 8
- AI Spymaster gives a one-word clue + number
- Click cards to guess - match the clue!
- Avoid the **Assassin** (instant loss!)
- First team to find all agents wins

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime |
| AI | Ollama (llama3) |
| Styling | Custom CSS |

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

```env
VITE_SUPABASE_URL=http://localhost:3001
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3
```

## License

MIT
