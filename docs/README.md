# World Cup Betting Site Documentation

Welcome to the documentation for the 2026 World Cup betting website.

---

## Documentation Structure

```
docs/
├── architecture.md           # High-level system overview
├── backend/
│   ├── api-routes.md        # All API endpoints explained
│   ├── database-models.md   # MongoDB schemas and relationships
│   └── scoring-system.md    # How bet scoring works
└── frontend/
    ├── components.md        # React component architecture
    ├── form-logic.md        # How the dynamic bet form works
    └── state-management.md  # React Hook Form patterns
```

---

## Quick Start

### For Understanding the Architecture

1. Read [**architecture.md**](./architecture.md) — How NextJS unifies frontend/backend
2. Read [**backend/database-models.md**](./backend/database-models.md) — What data is stored

### For Working with the API

1. Read [**backend/api-routes.md**](./backend/api-routes.md) — All endpoints and examples
2. Read [**backend/scoring-system.md**](./backend/scoring-system.md) — How scoring works

### For Working with the Frontend

1. Read [**frontend/components.md**](./frontend/components.md) — Component structure
2. Read [**frontend/form-logic.md**](./frontend/form-logic.md) — Conditional rendering logic
3. Read [**frontend/state-management.md**](./frontend/state-management.md) — React Hook Form

---

## Project Overview

**Tech Stack:**

- **Framework:** Next.js 14 (App Router)
- **Database:** MongoDB + Mongoose
- **Frontend:** React + TypeScript
- **Form Handling:** React Hook Form + Zod
- **Styling:** Tailwind CSS

**Core Features (Phase 1):**

- ✅ User can submit predictions for all tournament matches
- ✅ Dynamic form (knockout unlocks after group stage)
- ✅ Admin can set actual results (solution)
- ✅ Automatic scoring system (points for accuracy)

**Coming (Phase 2):**

- 🔜 User authentication (register/login)
- 🔜 Protected routes with JWT
- 🔜 Admin dashboard UI
- 🔜 Leaderboard ranking

### Phase 2 Rollout (Tiny Steps)

We will implement Phase 2 in very small steps, pausing after each step for review:

1. Add auth validation schemas (`register`, `login`)
2. Add `POST /api/auth/register`
3. Add `POST /api/auth/login` (username + password)
4. Add `POST /api/auth/logout`
5. Add `GET /api/auth/me`
6. Add auth helpers (hash/verify password, sign/verify JWT, cookie config)
7. Add route guards (`requireUser`, `requireAdmin`)
8. Protect `/api/bets` and bind bets to `userId`
9. Add unique index on bets (`userId` + `tournamentId`)
10. Protect `/api/admin/*` with admin role check
11. Add minimal `login` and `register` pages
12. Make form submit flow session-aware

### Legacy Bets Policy (Phase 1 → Phase 2)

- Existing anonymous bets (without `userId`) are kept as legacy data.
- New/updated bets in Phase 2 require authentication and are stored with `userId`.
- No automatic backfill of old bets in this phase.

---

## Key Concepts

### 1. Single Server Architecture

NextJS runs **one server** (localhost:3000) that handles:

- Frontend page rendering (`src/app/page.tsx`)
- Backend API routes (`src/app/api/*/route.ts`)
- Database connections (MongoDB)

**No separate Express server needed.**

---

### 2. Collections (Database)

| Collection    | Purpose                                 | Count |
| ------------- | --------------------------------------- | ----- |
| `tournaments` | Tournament structure (groups, fixtures) | 1     |
| `bets`        | User predictions                        | Many  |
| `solutions`   | Actual tournament results               | 1     |
| `users`       | User accounts (Phase 2)                 | Many  |

---

### 3. Data Flow (Submitting a Bet)

```
User fills form
    ↓
BetForm.tsx calls fetch("/api/bets")
    ↓
NextJS routes to src/app/api/bets/route.ts
    ↓
Validates with Zod schema
    ↓
Saves to MongoDB (Bet collection)
    ↓
Returns success response
    ↓
User sees confirmation
```

---

### 4. Scoring System

**Group Stage:**

- 3 points for correct result (Win/Draw/Loss)
- +1 bonus for exact score

**Knockout:**

- 5 points for correct winner

**Maximum:** 443 points (288 group + 155 knockout)

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Main betting form page
│   └── api/                        # Backend API routes
│       ├── bets/route.ts          # POST/GET user bets
│       └── admin/
│           ├── solution/route.ts   # POST admin solution
│           └── score-all/route.ts  # POST calculate scores
│
├── components/
│   ├── BetForm.tsx                # Main form container
│   ├── GroupStageSection.tsx     # Group matches input
│   └── KnockoutSection.tsx       # Knockout predictions
│
├── lib/
│   ├── db.ts                      # MongoDB connection
│   ├── seedTournament.ts          # Auto-seed tournament
│   ├── validationSchemas.ts      # Zod schemas
│   └── scoring/                   # Scoring logic
│
├── models/                        # Mongoose schemas
│   ├── Tournament.ts
│   ├── Bet.ts
│   ├── Solution.ts
│   └── User.ts
│
└── types/
    └── index.ts                   # Shared TypeScript types
```

---

## Common Tasks

### Start Development Server

```bash
npm run dev
```

Starts NextJS on `http://localhost:3000`

### View Database

```bash
mongosh
> use world-cup-bet
> db.tournaments.find()
> db.bets.find()
```

### Test API Endpoints

```bash
# Create a bet
curl -X POST http://localhost:3000/api/bets \
  -H "Content-Type: application/json" \
  -d '{"tournamentId": "...", "predictions": {...}}'

# Get a bet
curl http://localhost:3000/api/bets?tournamentId=...

# Set solution (admin)
curl -X POST http://localhost:3000/api/admin/solution \
  -d '{"tournamentId": "...", "predictions": {...}}'

# Score all bets
curl -X POST http://localhost:3000/api/admin/score-all \
  -d '{"tournamentId": "..."}'
```

---

## Development Workflow

1. **Make changes** to components or API routes
2. **NextJS hot-reloads** automatically
3. **Test in browser** (localhost:3000)
4. **Check MongoDB** for data persistence
5. **Iterate** 🔁

---

## Learning Path (For Junior Developers)

### Week 1: Understanding the Stack

- Read: [architecture.md](./architecture.md)
- Read: [backend/database-models.md](./backend/database-models.md)
- Explore: Look at `src/models/` files
- Task: Add a console.log in `src/app/api/bets/route.ts` and watch it in terminal

### Week 2: Frontend Deep Dive

- Read: [frontend/components.md](./frontend/components.md)
- Read: [frontend/state-management.md](./frontend/state-management.md)
- Explore: Modify `BetForm.tsx`, add a new input field
- Task: Make the "Save Bet" button change color when form is complete

### Week 3: Backend & Scoring

- Read: [backend/api-routes.md](./backend/api-routes.md)
- Read: [backend/scoring-system.md](./backend/scoring-system.md)
- Explore: Modify scoring rules (e.g., 4 points for correct result instead of 3)
- Task: Add a new API endpoint that returns the top 10 bets by score

### Week 4: Full Feature

- Task: Add a "Preview" section that shows user's predicted bracket before submitting
- Task: Add error handling (show error message if API call fails)

---

## Troubleshooting

### Form doesn't load

- Check: MongoDB running? (`brew services list`)
- Check: Tournament seeded? (Visit `/`, check terminal logs)
- Check: API route working? (Open browser DevTools → Network tab)

### Bet not saving

- Check: `POST /api/bets` response in Network tab
- Check: Validation errors in API response
- Check: MongoDB connection in `.env.local`

### Knockout section not showing

- Check: All group stage matches filled?
- Check: `isGroupStageComplete` logic in `BetForm.tsx`
- Check: Console for errors

---

## Next Steps (Phase 2)

When ready to add authentication:

1. Create `src/app/api/auth/register/route.ts`
2. Create `src/app/api/auth/login/route.ts`
3. Add JWT middleware to protect routes
4. Update `Bet` model to include `userId`
5. Create login/register UI pages

See main project README for Phase 2 checklist.

---

## Questions?

This documentation is iterative and will grow as the project evolves. If something isn't clear:

1. Check related documentation files (see links above)
2. Look at code examples in actual files
3. Ask GitHub Copilot specific questions (e.g., "Explain how watch() works in BetForm.tsx")

---

**Last Updated:** March 3, 2026  
**Project Phase:** Phase 1 (MVP Core) ✅ Complete
