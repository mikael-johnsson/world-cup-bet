# Database Models Documentation

All models use Mongoose ODM to interact with MongoDB.

---

## Model Files

- `src/models/Tournament.ts` - Tournament structure and matches
- `src/models/Bet.ts` - User predictions
- `src/models/Solution.ts` - Admin actual results
- `src/models/User.ts` - User accounts (Phase 2)

---

## 1. Tournament Model

**Collection:** `tournaments`

### Purpose

Stores the World Cup 2026 structure:

- 12 groups with 4 teams each
- 72 group stage matches
- 32 knockout matches (16 + 8 + 4 + 2 + 1 + 1)

### Schema

```typescript
interface ITournament {
  name: string;
  year: number;
  groups: {
    groupName: string;
    teams: string[];
    fixtures: {
      homeTeam: string;
      awayTeam: string;
    }[];
  }[];
  knockout: {
    roundOf32: { match: number }[]; // 16 matches
    roundOf16: { match: number }[]; // 8 matches
    quarterFinals: { match: number }[]; // 4 matches
    semiFinals: { match: number }[]; // 2 matches
    final: { match: number }[]; // 1 match
    bronzeMatch: { match: number }[]; // 1 match
    ;
  };
}
```

### Mongoose Schema Details

```typescript
const TournamentSchema = new Schema<ITournament>({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  groups: [
    {
      groupName: { type: String, required: true },
      teams: [{ type: String, required: true }],
      fixtures: [
        {
          homeTeam: { type: String, required: true },
          awayTeam: { type: String, required: true },
        },
      ],
    },
  ],
  knockout: {
    roundOf32: [{ match: Number }],
    roundOf16: [{ match: Number }],
    quarterFinals: [{ match: Number }],
    semiFinals: [{ match: Number }],
    final: [{ match: Number }],
  },
});
```

### Example Document

```json
{
  "_id": "670f1234567890abcdef1234",
  "name": "FIFA World Cup",
  "year": 2026,
  "groups": [
    {
      "groupName": "A",
      "teams": ["MEX", "USA", "CAN", "CRC"],
      "fixtures": [
        { "homeTeam": "MEX", "awayTeam": "USA" },
        { "homeTeam": "MEX", "awayTeam": "CAN" },
        { "homeTeam": "MEX", "awayTeam": "CRC" },
        { "homeTeam": "USA", "awayTeam": "CAN" },
        { "homeTeam": "USA", "awayTeam": "CRC" },
        { "homeTeam": "CAN", "awayTeam": "CRC" }
      ]
    }
    // ... groups B-L
  ],
  "knockout": {
    "roundOf32": [
      { "match": 1 },
      { "match": 2 }
      // ... 16 total
    ],
    "roundOf16": [
      { "match": 1 }
      // ... 8 total
    ],
    "quarterFinals": [
      { "match": 1 },
      { "match": 2 },
      { "match": 3 },
      { "match": 4 }
    ],
    "semiFinals": [{ "match": 1 }, { "match": 2 }],
    "final": [{ "match": 1 }]
  }
}
```

### Auto-Seeding

On first page load, `src/lib/seedTournament.ts` checks if a tournament exists:

- If not: Creates one with full structure
- If exists: Skips seeding

**Location:** `src/app/page.tsx` calls `seedTournament()` before rendering.

---

## 2. Bet Model

**Collection:** `bets`

### Purpose

Stores a user's predictions for all matches and knockout winners.

### Schema

```typescript
interface IBet {
  userId: string; // Phase 2: User who made this bet
  tournamentId: ObjectId;
  predictions: {
    groupStage: {
      groupName: string;
      matches: {
        matchId: string;
        predictedHomeGoals: number;
        predictedAwayGoals: number;
      }[];
    }[];
    knockout: {
      roundOf16: string[]; // 16 team codes
      quarterfinals: string[]; // 8 team codes
      semifinals: string[]; // 4 team codes
      final: string[]; // 2 team codes
      champion: string; // Winner team code
      bronze: {
        finalist1: string; // Semifinal loser 1
        finalist2: string; // Semifinal loser 2
        winner: string; // Bronze medal winner
      };
    };
  };
  scoring: {
    groupStageScore: number;
    knockoutScore: number;
    totalScore: number;
    lastCalculated?: Date;
  };
  submittedAt: Date;
  createdAt: Date;
}
```

### Mongoose Schema Details

```typescript
const BetSchema = new Schema<IBet>(
  {
    userId: String, // Phase 2: will be required + indexed
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    predictions: {
      groupStage: [
        {
          groupName: { type: String, required: true },
          matches: [
            {
              matchId: { type: String, required: true },
              predictedHomeGoals: { type: Number, required: true },
              predictedAwayGoals: { type: Number, required: true },
            },
          ],
        },
      ],
      knockout: {
        roundOf16: { type: [String], required: true },
        quarterfinals: { type: [String], required: true },
        semifinals: { type: [String], required: true },
        final: { type: [String], required: true },
        champion: { type: String, required: true },
        bronze: {
          finalist1: { type: String, required: true },
          finalist2: { type: String, required: true },
          winner: { type: String, required: true },
        },
      },
    },
    scoring: {
      groupStageScore: { type: Number, default: 0 },
      knockoutScore: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      lastCalculated: Date,
    },
    submittedAt: Date,
  },
  { timestamps: true },
);

// Unique index on (userId, tournamentId) — one bet per user per tournament
BetSchema.index({ userId: 1, tournamentId: 1 }, { unique: true, sparse: true });
```

{ timestamps: true },
);

````

### Example Document

```json
{
  "_id": "670f5678901234abcdef5678",
  "userId": "507f1f77bcf86cd799439011",
  "tournamentId": "670f1234567890abcdef1234",
  "predictions": {
    "groupStage": [
      {
        "groupName": "A",
        "matches": [
          {
            "matchId": "match_1",
            "predictedHomeGoals": 2,
            "predictedAwayGoals": 1
          },
          // ... 5 more matches in group A
        ]
      },
      // ... groups B-L
    ],
    "knockout": {
      "roundOf16": ["BRA", "FRA", "GER", "NED", "ENG", "ARG", "ESP", "URY", "BEL", "SWE", "ITA", "POR", "JPN", "AUS", "MEX", "KOR"],
      "quarterfinals": ["BRA", "FRA", "GER", "NED", "ENG", "ARG", "ESP", "URY"],
      "semifinals": ["BRA", "FRA", "GER", "NED"],
      "final": ["BRA", "FRA"],
      "champion": "BRA",
      "bronze": {
        "finalist1": "GER",
        "finalist2": "NED",
        "winner": "NED"
      }
    }
  },
  "scoring": {
    "groupStageScore": 42,
    "knockoutScore": 18,
    "totalScore": 60,
    "lastCalculated": "2026-03-04T10:30:00.000Z"
  },
  "createdAt": "2026-01-15T10:00:00.000Z",
  "submittedAt": "2026-01-15T14:30:00.000Z"
}
````

### Unique Constraint

No unique index yet (Phase 1). In Phase 2, will enforce:

```typescript
BetSchema.index({ userName: 1, tournamentId: 1 }, { unique: true });
```

Currently handled in API logic: check if bet exists, then update instead of create.

---

## 3. Solution Model

**Collection:** `solutions`

### Purpose

Admin sets the actual tournament results (ground truth for scoring).

### Schema

```typescript
interface ISolution {
  tournamentId: ObjectId;
  predictions: {
    groupStage: {
      groupName: string;
      matches: {
        matchId: string;
        predictedHomeGoals: number;
        predictedAwayGoals: number;
      }[];
    }[];
    knockout: {
      roundOf16: string[]; // 16 actual advancing teams
      quarterfinals: string[]; // 8 actual advancing teams
      semifinals: string[]; // 4 actual advancing teams
      final: string[]; // 2 actual finalists
      champion: string; // Actual winner
      bronze: {
        finalist1: string; // Actual SF loser 1
        finalist2: string; // Actual SF loser 2
        winner: string; // Actual bronze winner
      };
    };
  };
  createdAt: Date;
}
```

### Differences from Bet Model

| Aspect             | Bet Model            | Solution Model                         |
| ------------------ | -------------------- | -------------------------------------- |
| User identifier    | `userId` required    | No user field                          |
| Group goals        | `predictedHomeGoals` | Predicted (will be actual after match) |
| Knockout roundOf16 | `roundOf16` array    | Same structure (actual teams)          |
| Purpose            | User's predictions   | Ground truth for scoring               |

### Example Document

```json
{
  "_id": "670f9012345678abcdef9012",
  "tournamentId": "670f1234567890abcdef1234",
  "predictions": {
    "groupStage": [
      {
        "groupName": "A",
        "matches": [
          {
            "matchId": "match_1",
            "predictedHomeGoals": 1,
            "predictedAwayGoals": 1
          }
          // ... 5 more matches
        ]
      }
      // ... groups B-L
    ],
    "knockout": {
      "roundOf16": [
        "BRA",
        "FRA",
        "GER",
        "NED",
        "ENG",
        "ARG",
        "ESP",
        "URY",
        "BEL",
        "CRO",
        "ITA",
        "POR",
        "JPN",
        "AUS",
        "MEX",
        "KOR"
      ],
      "quarterfinals": ["BRA", "FRA", "GER", "NED", "ENG", "ARG", "ESP", "CRO"],
      "semifinals": ["BRA", "FRA", "GER", "NED"],
      "final": ["BRA", "FRA"],
      "champion": "FRA",
      "bronze": {
        "finalist1": "GER",
        "finalist2": "NED",
        "winner": "NED"
      }
    }
  },
  "createdAt": "2026-03-04T10:00:00.000Z"
}
```

      // ... all matches
    ]

},
"knockout": {
"roundOf32": [
{ "match": 1, "winner": "BRA" },
// ... 15 more
],
"roundOf16": [
{ "match": 1, "winner": "ARG" },
// ... 7 more
],
"quarterFinals": [...],
"semiFinals": [...],
"final": [{ "match": 1, "winner": "ESP" }]
}
}

````

---

## 4. User Model (Phase 2)

**Collection:** `users`

### Purpose

Store user accounts for authentication and linking bets.

### Schema (Placeholder)

```typescript
interface IUser {
  userName: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt: Date;
}
````

**Status:** Not implemented in Phase 1. Will be added with JWT authentication.

---

## Relationships

```
Tournament (1)
    ↓
    └─→ Bet (many) - via tournamentId
    └─→ Solution (1) - via tournamentId

User (1) -----→ Bet (many) - Phase 2
```

### Example Queries

**Get all bets for a tournament:**

```typescript
const bets = await Bet.find({ tournamentId: "670f1234567890abcdef1234" });
```

**Get solution for a tournament:**

```typescript
const solution = await Solution.findOne({
  tournamentId: "670f1234567890abcdef1234",
});
```

**Get tournament with all details:**

```typescript
const tournament = await Tournament.findById("670f1234567890abcdef1234");
```

---

## Database Connection

All models import and use the connection from `src/lib/db.ts`:

```typescript
import dbConnect from "@/lib/db";

await dbConnect(); // Ensures connection before queries
```

### Connection Pooling

Mongoose automatically pools connections:

- Reuses existing connection if available
- Creates new connection if needed
- Caches connection in global scope (NextJS development mode)

---

## Data Validation

### Two Layers

1. **Mongoose Schema Validation**
   - Type enforcement (String, Number, ObjectId)
   - Required fields
   - Built-in validators

2. **Zod Validation (API layer)**
   - In `src/lib/validationSchemas.ts`
   - Validates request bodies before database operations
   - Custom rules (e.g., goals >= 0)

---

## MongoDB Commands (for reference)

```bash
# Connect to MongoDB shell
mongosh

# Use database
use world-cup-bet

# View all tournaments
db.tournaments.find().pretty()

# View all bets
db.bets.find().pretty()

# View solutions
db.solutions.find().pretty()

# Count documents
db.bets.countDocuments()

# Delete all bets (for testing)
db.bets.deleteMany({})
```

---

## Related Documentation

- [API Routes](./api-routes.md) - How models are used in endpoints
- [Scoring System](./scoring-system.md) - How Bet and Solution are compared
- [Architecture Overview](../architecture.md) - Database in system context
