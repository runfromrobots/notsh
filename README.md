# SOS — Island Survival Fog-of-War Game

A turn-based island survival game where two factions of plane crash survivors explore a hidden map, gather resources, and race to escape—either by signaling for rescue or reaching the departure point first.

## Overview

**Gameplay**: Players take turns revealing tiles and moving across a procedurally generated island, collecting logs and avoiding (or confronting) rival faction survivors. Win by spelling "SOS" with logs to trigger a rescue, then escape via the departure point.

**Tech Stack**:
- **Frontend**: React 18 + TypeScript + Canvas (low-res 2D grid rendering)
- **Backend**: Next.js API Routes
- **Database**: Supabase (Postgres + realtime subscriptions)
- **Deployment**: Vercel (auto-deploy on push to main)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/runfromrobots/notsh
cd notsh
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── game/              # Game view pages
│   └── api/               # API routes
├── components/            # React components
│   ├── GameCanvas.tsx     # Grid rendering
│   ├── PlayerInfo.tsx     # Player stats display
│   └── ...
├── lib/                   # Shared utilities
│   ├── types.ts          # TypeScript interfaces
│   ├── constants.ts      # Game configuration
│   ├── gameLogic.ts      # Core game mechanics
│   ├── mapGenerator.ts   # Procedural map generation
│   └── supabase.ts       # Database setup
├── public/               # Static assets
└── package.json          # Dependencies
```

## Game Mechanics

### Turn System
- Each player gets a fixed **reveal budget** (default: 6 moves) per turn
- Weather can randomly reduce the budget
- Moves are either:
  - **Reveal**: Uncover adjacent tile (costs 1 budget)
  - **Backtrack**: Return to previous position using 1 log

### Resources
- **Logs**: Found in jungle tiles, carry max 1 at a time
- Used for backtracking or contributing to the SOS signal

### Win Conditions
1. **Signal Rescue**: Spell "SOS" with 3 logs (any faction)
   - Triggers rescue event
   - All players race to reach departure point
   - First to reach after rescue triggered wins
   - Others are "left behind"

2. **Encounters**: Meeting a rival faction player triggers:
   - 40% chance: Elimination
   - 30% chance: Faction switch
   - 30% chance: Standoff (both escape)

### Fog of War
- Tiles are hidden until revealed
- Only your faction sees revealed tiles
- No global minimap—must explore to learn the island

## API Routes (To Be Implemented)

```
POST   /api/games           # Create new game
GET    /api/games/:id       # Get game state
POST   /api/games/:id/join  # Join existing game
POST   /api/games/:id/move  # Submit player move
GET    /api/games/:id/updates # Subscribe to real-time updates
```

## Database Schema (To Be Implemented)

```
tables:
  - games       (game state, turn tracking, SOS progress)
  - players     (faction, position, inventory, status)
  - tiles       (map grid, log placement, fog of war)
  - moves       (turn history)
  - encounters  (player interactions)
```

## Development Roadmap

### v0.1 (Current)
- [ ] Project initialization and structure
- [ ] Map generation with seeded RNG
- [ ] Game canvas and tile rendering
- [ ] Basic UI and player info display

### v0.2 (Next)
- [ ] Supabase database setup and migrations
- [ ] API routes for game actions
- [ ] Player authentication
- [ ] Real-time game state updates

### v0.3
- [ ] Turn system and move processing
- [ ] Encounter mini-game (rock-paper-scissors)
- [ ] SOS building and rescue trigger
- [ ] Win/lose conditions

### v1.0
- [ ] Polish and bug fixes
- [ ] Art assets (low-res 8-bit tiles)
- [ ] Audio/notifications
- [ ] Mobile responsiveness
- [ ] Deployment to Vercel

## Deployment

### Vercel Setup
1. Push to GitHub (`main` branch)
2. Connect repo to Vercel
3. Add environment variables in Vercel settings
4. Auto-deploy on push

### Local Development
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run start    # Start production server
```

## Contributing

Built with Claude Code. See [how-this-site-was-made.md](../how-this-site-was-made.md) for development notes.

## License

Private project.

## Notes

- Map uses seeded random generation for consistent/testable maps in v1
- Turn-based design supports async multi-day play
- Designed as browser-first, no native app
- Realtime Supabase subscriptions notify players of moves and events
