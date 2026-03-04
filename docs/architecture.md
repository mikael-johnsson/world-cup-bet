# Architecture Overview

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** MongoDB + Mongoose
- **Frontend:** React with TypeScript
- **Form Handling:** React Hook Form + Zod validation
- **Styling:** Tailwind CSS
- **Authentication:** (Phase 2) JWT + bcrypt

---

## How NextJS Unifies Frontend & Backend

### Single Server Architecture

```
npm run dev → Starts one server on localhost:3000

NextJS Server (Port 3000)
├── Frontend (React Components)
│   └── Handles UI rendering
│   └── Client-side interactions
│
└── Backend (API Routes)
    └── Handles database operations
    └── Business logic
    └── MongoDB connections
```

### Request Flow

1. **User visits `localhost:3000`**
   - NextJS serves `src/app/page.tsx` (React component)
   - Browser renders the betting form

2. **User submits form**
   - Frontend calls `fetch("/api/bets", { method: "POST" })`
   - NextJS routes to `src/app/api/bets/route.ts`
   - Backend saves to MongoDB
   - Returns response to frontend

3. **No separate server needed**
   - Unlike Vite + Express (2 servers), NextJS handles both in one process
   - No CORS configuration required
   - Shared TypeScript types between frontend/backend

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Main betting form page
│   ├── layout.tsx                  # Root layout
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
│   ├── seedTournament.ts          # Auto-seed tournament data
│   ├── validationSchemas.ts      # Zod schemas
│   └── scoring/                   # Scoring logic
│       ├── calculateScore.ts
│       ├── groupStageScoringRules.ts
│       └── knockoutScoringRules.ts
│
├── models/                        # Mongoose schemas
│   ├── Tournament.ts
│   ├── Bet.ts
│   ├── Solution.ts
│   └── User.ts (Phase 2)
│
└── types/
    └── index.ts                   # Shared TypeScript interfaces
```

---

## Data Flow Example: Submitting a Bet

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │ 1. User fills form
       │ 2. Clicks "Save Bet"
       ↓
┌─────────────────────┐
│  BetForm.tsx        │
│  onSubmit()         │
└──────┬──────────────┘
       │ 3. fetch("/api/bets", { method: POST })
       ↓
┌─────────────────────┐
│  NextJS Server      │
│  Routes request to: │
│  api/bets/route.ts  │
└──────┬──────────────┘
       │ 4. Validates with Zod
       │ 5. Connects to MongoDB
       ↓
┌─────────────────────┐
│  MongoDB            │
│  bets collection    │
└──────┬──────────────┘
       │ 6. Saves/updates bet
       │ 7. Returns success
       ↓
┌─────────────────────┐
│  NextJS Server      │
│  Sends response     │
└──────┬──────────────┘
       │ 8. { success: true, betId: "..." }
       ↓
┌─────────────────────┐
│  Browser            │
│  Shows confirmation │
└─────────────────────┘
```

---

## Key NextJS Features Used

| Feature               | Location                 | Purpose                       |
| --------------------- | ------------------------ | ----------------------------- |
| **App Router**        | `src/app/`               | File-based routing            |
| **API Routes**        | `src/app/api/*/route.ts` | Backend endpoints             |
| **Server Components** | `page.tsx`               | Default server-side rendering |
| **Client Components** | `"use client"`           | Interactive forms with hooks  |
| **TypeScript**        | All files                | Type safety across stack      |

---

## Related Documentation

- [Backend API Routes](./backend/api-routes.md)
- [Database Models](./backend/database-models.md)
- [Frontend Components](./frontend/components.md)
- [Scoring System](./backend/scoring-system.md)
