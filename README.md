# World Cup Bet

A prediction game for the 2026 FIFA World Cup. Players predict the score of every group-stage match and pick which teams advance through the knockout rounds. Predictions are scored against the official results and ranked on a leaderboard, per group of friends.

This README covers the technical side of the app.

## Tech stack

| Area         | Choice                                                                     |
| ------------ | -------------------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router), React 19, TypeScript                              |
| Database     | MongoDB via Mongoose 9                                                     |
| Forms        | React Hook Form with Zod validation (`@hookform/resolvers`)                |
| Styling      | Tailwind CSS 4                                                             |
| AI assistant | OpenAI Agents SDK (`@openai/agents`)                                       |
| Tooling      | ESLint 9, React Compiler (`babel-plugin-react-compiler`), Vercel Analytics |

## Architecture

Frontend and backend live in a single Next.js project and run as one server. Pages and components are in `src/app` and `src/components`; the backend is a set of route handlers in `src/app/api/*/route.ts`. Types and Zod schemas are shared between both sides, so there is no separate API server or CORS setup.

```
src/
├── app/
│   ├── page.tsx, layout.tsx, login/, register/   # Pages
│   └── api/                                      # Route handlers (backend)
├── components/                                   # BetForm, GroupStageSection, KnockoutSection,
│                                                 # Leaderboard, ChatPanel, GroupManagement, ...
├── context/                                      # Client-side React context
├── lib/
│   ├── db.ts                                     # Cached Mongoose connection
│   ├── seedTournament.ts                         # Tournament data (groups, teams, fixtures)
│   ├── validationSchemas.ts                      # Zod schemas shared by client and server
│   ├── deriveAdvancingTeams.ts                   # Predicted group results -> 32 advancing teams
│   ├── standings/calculateGroupStandings.ts      # Group tables from predicted scores
│   ├── scoring/                                  # Scoring rules
│   ├── deadlineUtils.ts                          # Betting deadline checks
│   ├── aiAgent.ts                                # Chat assistant workflow
│   └── services/oddsService.ts                   # External odds fetch
├── models/                                       # Mongoose models
└── types/index.ts                                # Shared TypeScript types
```

### Request flow

```
BetForm (React Hook Form + Zod)
   └─ fetch POST /api/bets
         └─ route handler: validate with Zod, check deadline, connectDB()
               └─ Mongoose upsert into MongoDB
```

Route handlers call `connectDB()` from `src/lib/db.ts`. The connection promise is cached on `global`, so hot reloads in development and repeated serverless invocations reuse one connection instead of opening a new one per request.

## Data model

| Model        | Purpose                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Tournament` | Groups, teams and fixtures (each with a `matchId`). Seeded from `src/lib/seedTournament.ts`.                                              |
| `Bet`        | One user's predictions plus a persisted `scoring` object. Unique index on `(userId, tournamentId)` gives one bet per user per tournament. |
| `Solution`   | The official results, in the same shape as a bet's predictions (plus `roundOf32`).                                                        |
| `User`       | Player account, with a reference to a group.                                                                                              |
| `Group`      | A named private league. The leaderboard is filtered per group.                                                                            |

A bet's `predictions` has two parts:

- `groupStage`: per group, a list of `{ matchId, predictedHomeGoals, predictedAwayGoals }`.
- `knockout`: arrays of team codes for `roundOf16` (16), `quarterfinals` (8), `semifinals` (4) and `final` (2), plus `champion` and `bronze`.

## Prediction form logic

- The form is a single React Hook Form instance validated by `betSchema` (Zod) in `src/lib/validationSchemas.ts`. The same schema validates the request body on the server. Some schemas have "optional" variants so partial knockout arrays are accepted (for example for an admin solution that is still being filled in).
- `calculateGroupStandings` builds each group table from the predicted scores. It sorts by points, goal difference, goals for, then team name.
- `deriveAdvancingTeams` works out which 32 teams advance: the top two of each of the 12 groups, plus the 8 best third-placed teams ranked by goal difference, then goals scored. The knockout section uses this to limit what the user can pick.
- Once the betting deadline has passed the form is read-only. The deadline comes from `NEXT_PUBLIC_BETTING_DEADLINE` and is checked on the server in `POST /api/bets` (`src/lib/deadlineUtils.ts`) as well as in the UI.

## Scoring

Scoring is plain functions in `src/lib/scoring/`. `calculateBetScore` is the entry point. It sums a group-stage score and a knockout score and returns `{ groupStageScore, knockoutScore, totalScore }`.

**Group stage** (per match, matched by `matchId`):

| Outcome                        | Points |
| ------------------------------ | ------ |
| Exact score                    | 4      |
| Correct result (win/draw/loss) | 3      |
| Otherwise                      | 0      |

**Knockout** (per predicted team that is in the official set for that round):

| Round         | Points per correct team |
| ------------- | ----------------------- |
| Round of 16   | 1                       |
| Quarterfinals | 1                       |
| Semifinals    | 2                       |
| Final         | 3                       |
| Champion      | 5                       |
| Bronze winner | 5                       |

Knockout scoring tolerates a partial `Solution`: rounds that have no official result yet score nothing, so scores can be recalculated as the tournament progresses.

Scores are not computed on read. An admin triggers `POST /api/admin/score-all`, which loads the tournament and solution, scores every bet and saves the result in each bet's `scoring` field. The leaderboard only reads these stored values.

## API routes

All routes are in `src/app/api`.

| Route                     | Purpose                                                                          |
| ------------------------- | -------------------------------------------------------------------------------- |
| `bets`                    | Save and fetch the current user's bet                                            |
| `solutions`               | Fetch the official solution                                                      |
| `admin/solution`          | Admin: save the official solution                                                |
| `admin/score-all`         | Admin: score every bet against the solution and persist the result               |
| `leaderboard`             | Ranked entries for a tournament, filtered to a group (`limit` 1-100, default 10) |
| `groups`, `user/group`    | Create, join and look up groups                                                  |
| `config/betting-deadline` | Expose the configured deadline                                                   |
| `chat`                    | Chat assistant (see below)                                                       |

Request bodies are parsed with Zod; invalid input returns a 400 with details, and unexpected errors return a 500.

## Chat assistant

`src/lib/aiAgent.ts` uses the OpenAI Agents SDK to run a small multi-agent workflow:

1. A **Classifier** agent (structured output via a Zod enum) decides whether the question is about betting advice or about using the site.
2. A **Betting Helper** answers football and betting questions.
3. A **Website Use Helper** answers how-to questions, using file search over an OpenAI vector store.

`POST /api/chat` validates the message and returns a single plain-text reply. The UI is `ChatPanel.tsx`.

## Odds

`src/lib/services/oddsService.ts` fetches odds from the URL in `NEXT_PUBLIC_ODDS_BASE_URL`. If the variable is missing it logs and returns nothing.

## Getting started

Prerequisites: Node.js 20+ and a MongoDB instance (local or Atlas).

```bash
git clone https://github.com/mikael-johnsson/world-cup-bet.git
cd world-cup-bet
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # run the production build
npm run lint       # ESLint
```

### Environment variables

Create `.env.local`:

| Variable                       | Required | Used for                                                                    |
| ------------------------------ | -------- | --------------------------------------------------------------------------- |
| `MONGODB_URI`                  | Yes      | MongoDB connection string (`src/lib/db.ts`)                                 |
| `NEXT_PUBLIC_BETTING_DEADLINE` | Yes      | ISO date after which bets are locked                                        |
| `DEFAULT_GROUP_PASSWORD`       | Yes      | Password for the auto-created default group                                 |
| `OPENAI_API_KEY`               | For chat | Read by the OpenAI SDK                                                      |
| `OPENAI_WORKFLOW_ID`           | For chat | Workflow id (must start with `wf_`); `OPENAI_AGENT_ID` is a legacy fallback |
| `NEXT_PUBLIC_ODDS_BASE_URL`    | Optional | Odds endpoint                                                               |

## More documentation

Longer notes live in `.github/docs/`: architecture, API routes, database models, scoring, and frontend form logic and state management. Some of these pre-date the current scoring rules, so treat the code in `src/lib/scoring` as the source of truth.

## License

MIT. See [LICENSE](LICENSE). Copyright (c) 2026 Mikael Johnsson
