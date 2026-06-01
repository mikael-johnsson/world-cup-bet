# World Cup Bet

## Purpose

World Cup Bet is a lightweight Next.js application that lets users submit match predictions (bets), compare them with official solutions, and view leaderboards and group standings. It's built as a learning project focused on simple, readable TypeScript and server-driven UI.

## How it works

- Users register and log in to submit predictions for tournament matches.
- Passwords are hashed and can never be retrieved once entered.
- Predictions are stored and scored against official solutions; scoring rules live in `src/lib/scoring`.
- The app exposes several server API routes under `src/app/api` for bets, solutions, leaderboard, groups, and auth.
- Frontend pages and components render current standings, group-stage tables, knockout brackets, and comparison views.

## Tech stack

- Next.js (App Router) with TypeScript
- Tailwind CSS and PostCSS for styling
- Server-side API routes (inside `src/app/api/`)
- Project layout and helpers in `src/lib/` (DB, auth, scoring, services)

## How to Clone / Deploy

Prerequisites

- Node.js (16+ recommended)
- npm or yarn

Clone

```bash
git clone https://github.com/<your-org>/world-cup-bet.git
cd world-cup-bet
```

Install

```bash
npm install
# or
yarn install
```

Local development

```bash
npm run dev
# or
yarn dev

# Open http://localhost:3000
```

Build & Production

```bash
npm run build
npm start
```

## Environment variables

Create a `.env.local` file and provide any necessary environment variables. Check `src/lib/db.ts` and `src/lib/auth.ts` for variables the app expects (database connection, session secret, etc.).

## API routes

Server API endpoints are implemented under `src/app/api`. Notable routes:

- `api/bets/` — submit and fetch bets
- `api/solutions/` — submit official solutions (admin)
- `api/leaderboard/` — computed leaderboard
- `api/auth/` — login, logout, register, and `me`

## Contributing

Contributions are welcome. Open an issue or PR describing the change. Keep changes small and focused — this repo is intended as a learning project.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Mikael Johnsson

SPDX-License-Identifier: MIT
