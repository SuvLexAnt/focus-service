# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm start            # Start dev server and open browser (http://localhost:5173)
npm run dev          # Start dev server without auto-opening
npm run build        # Type check and build for production (tsc && vite build)
npm run preview      # Preview production build locally
```

**Requirements:** Node.js 18+

## Docker

```bash
# Development (local build)
npm run docker:up        # Build and run with Docker Compose (http://localhost:3000)
npm run docker:down      # Stop and remove container
npm run docker:build     # Build Docker image only

# Production (from Docker Hub)
npm run docker:prod      # Pull and run from Docker Hub (http://localhost:3000)
npm run docker:prod:down # Stop production container

# Publishing
npm run docker:push      # Build, tag, and push to Docker Hub
```

**Requirements:** Docker

**Files:**
- `docker-compose.yml` — local build (for development)
- `docker-compose.prod.yml` — pulls from Docker Hub (for production/users)

The Docker setup uses a multi-stage build (Node.js for build, nginx for serving) and serves the app on port 3000.

## Architecture

This is a React 18 + TypeScript meditation web app built with Vite. It presents a 10-day meditation program with practice tracking.

### Key Data Flow

1. **Content source:** `public/meditation-program.md` (Markdown file with all 10 days of practices)
2. **Parser:** `src/utils/parser.ts` parses Markdown into `Day[]` and `Practice[]` objects using regex
3. **State:** `src/hooks/useProgress.ts` manages progress state with LocalStorage persistence
4. **Storage:** `src/utils/storage.ts` handles LocalStorage (key: `meditation-data`)

### Core Types (src/types/meditation.ts)

- `Day` — day number, title, goal, practices array
- `Practice` — id, title, duration, instructions (whatToDo, focusOn, dontFocusOn), isMain flag
- `ProgressState` — nested object: `{ [dayId]: { [practiceId]: boolean } }`
- `MeditationData` — startDate, currentDay, progress

### Component Structure

- `App.tsx` — main orchestrator, fetches/parses content, manages selected day state
- `DaySelector/` — 10-day grid, shows progress bars, locks future days
- `PracticeCard/` — expandable card with checkbox, shows practice details
- `Checkbox/` — custom checkbox triggering success animations
- `SuccessAnimation/` — 5 random animations (confetti, ripple, sparkle, pulse, check bounce)
- `StartDateModal/` — first-run modal for date selection

### Progression System

Days unlock sequentially: completing all practices in day N unlocks day N+1. Progress persists via LocalStorage.

## Styling

- CSS Modules for component isolation
- CSS variables in `src/index.css` define color palette and typography
- Font: Inter (Google Fonts)
- Mobile-first responsive design

## Editing Meditation Content

Edit `public/meditation-program.md` following this format:

```markdown
## День N: Title

**Цель дня:** Goal description

### Практика M: Practice Title (X минут) [— основная практика]

**Что делать:** Instructions
**На чём фокусироваться:** Focus points
**На чём НЕ фокусироваться:** What to avoid
```

The parser extracts duration from title and marks "основная практика" with a badge.

## Testing

```bash
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

Uses Vitest with React Testing Library. TypeScript strict mode is enabled.

## Analytics

**Provider:** [Vercel Analytics](https://vercel.com/docs/analytics)

**Package:** `@vercel/analytics`

**Integration point:** `src/App.tsx` — `<Analytics />` component from `@vercel/analytics/react`

Analytics is automatically enabled when deployed to Vercel. No configuration required.

**To remove analytics:**
1. Uninstall package: `npm uninstall @vercel/analytics`
2. Remove import and `<Analytics />` component from `src/App.tsx`
3. Update this documentation
