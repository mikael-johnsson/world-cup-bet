# API Routes Documentation

All API routes are in `src/app/api/` and follow NextJS App Router conventions.

## Phase 2: Authentication (Current)

Phase 2 adds authentication and role-based access control:

- **Auth routes:** `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Protected routes:** `/api/bets` requires authentication; bets are tied to `userId`
- **Admin routes:** `/api/admin/*` requires admin role
- **Legacy data:** Phase 1 anonymous bets remain as read-only historical data
- **Token storage:** HttpOnly cookies with 7-day expiration
- **Login method:** Username-based (not email)

---

## Authentication Routes

### 1. POST /api/auth/register

**Purpose:** Create a new user account.

**Request Body**

```json
{
  "username": "micke_bets",
  "email": "micke@example.com",
  "firstName": "Michael",
  "lastName": "Anderson",
  "password": "securePassword123"
}
```

**Validation Rules**

- `username`: 3–30 characters, alphanumeric + underscore
- `email`: Valid email format (must be unique)
- `firstName` / `lastName`: Required, string
- `password`: 6+ characters (hashed with bcrypt)

**Response (Success - 201)**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "username": "micke_bets",
  "email": "micke@example.com",
  "firstName": "Michael",
  "lastName": "Anderson",
  "role": "user"
}
```

**Code Location**

`src/app/api/auth/register/route.ts`

---

### 2. POST /api/auth/login

**Purpose:** Authenticate a user and create a session.

**Request Body**

```json
{
  "username": "micke_bets",
  "password": "securePassword123"
}
```

**Response (Success - 200)**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "username": "micke_bets",
  "role": "user"
}
```

**Notes:**

- Sets `auth_token` HttpOnly cookie (7-day expiration)
- Password hash is verified but not returned
- User object does not expose password or sensitive fields

**Code Location**

`src/app/api/auth/login/route.ts`

---

### 3. POST /api/auth/logout

**Purpose:** Clear the user session by removing the auth cookie.

**Response (Success - 200)**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Code Location**

`src/app/api/auth/logout/route.ts`

---

### 4. GET /api/auth/me

**Purpose:** Retrieve the current authenticated user's identity.

**Response (Success - 200)**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "username": "micke_bets",
  "role": "user"
}
```

**Response (Error - 401 Not Authenticated)**

```json
{
  "error": "Not authenticated"
}
```

**Code Location**

`src/app/api/auth/me/route.ts`

---

## Bets API (Protected)

### 5. POST /api/bets

**Purpose:** Create or update a user's bet predictions.

**Authentication:** Required (HttpOnly cookie)

**Request Body**

```json
{
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
          {
            "matchId": "match_2",
            "predictedHomeGoals": 1,
            "predictedAwayGoals": 1
          }
        ]
      }
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
        "SWE",
        "ITA",
        "POR",
        "JPN",
        "AUS",
        "MEX",
        "KOR"
      ],
      "quarterfinals": ["BRA", "FRA", "GER", "NED", "ENG", "ARG", "ESP", "URY"],
      "semifinals": ["BRA", "FRA", "GER", "NED"],
      "final": ["BRA", "FRA"],
      "champion": "BRA",
      "bronze": "NED"
    }
  }
}
```

**Knockout Progression Explained**

The 2026 World Cup has **48 teams** (12 groups of 4). The knockout progression stores advancing teams per round:

- **roundOf16** (16 teams): Top 2 from each group (24 teams) + best 8 third-place teams = 32 teams qualify. User predicts which 16 advance to Round of 16
- **quarterfinals** (8 teams): User predicts which 8 Round of 16 teams advance to QF
- **semifinals** (4 teams): User predicts which 4 QF teams advance to SF
- **final** (2 teams): User predicts the final matchup
- **champion**: User predicts the tournament winner
- **bronze**: User predicts the bronze medal winner team code

**Validation Rules**

- `roundOf16`: Exactly 16 team codes (3-letter codes like "BRA", "FRA", "GER")
- `quarterfinals`: Exactly 8 team codes
- `semifinals`: Exactly 4 team codes
- `final`: Exactly 2 team codes
- `champion`: Non-empty team code
- `bronze`: Non-empty team code for bronze winner

**Response (Success - 201 or 200)**

```json
{
  "success": true,
  "betId": "670f5678901234abcdef5678",
  "message": "Bet created successfully"
}
```

**Response (Error - 401 Not Authenticated)**

```json
{
  "error": "Authentication required"
}
```

**Key Behavior Changes**

- Bets are now tied to the authenticated user's `userId`
- Unique constraint: one bet per user per tournament (enforced at DB level)
- Updating an existing bet: Finds by `{userId, tournamentId}` and updates predictions

**Code Location**

`src/app/api/bets/route.ts` → `POST` handler

---

### 6. GET /api/bets?tournamentId=TOURNAMENT_ID

**Purpose:** Retrieve the authenticated user's bet for a tournament.

**Authentication:** Required (HttpOnly cookie)

**Query Parameters**

- `tournamentId` (required): Tournament's MongoDB ObjectId

**Response (Success - 200)**

```json
{
  "_id": "670f5678901234abcdef5678",
  "userId": "507f1f77bcf86cd799439011",
  "tournamentId": "670f1234567890abcdef1234",
  "predictions": { ... },
  "scoring": {
    "groupStageScore": 15,
    "knockoutScore": 8,
    "totalScore": 23,
    "lastCalculated": "2025-01-15T10:30:00.000Z"
  },
  "createdAt": "2025-01-10T14:20:00.000Z",
  "submittedAt": "2025-01-10T14:20:00.000Z"
}
```

**Response (Error - 401 Not Authenticated)**

```json
{
  "error": "Authentication required"
}
```

**Response (Error - 404 Bet Not Found)**

```json
{
  "error": "Bet not found"
}
```

**Key Behavior Changes (Phase 2)**

- Gets only the authenticated user's bet (filters by `userId`)
- Requires `tournamentId` query parameter

**Code Location**

`src/app/api/bets/route.ts` → `GET` handler

---

## Admin Routes (Protected)

### 7. POST /api/admin/solution

**Purpose:** Admin sets the actual tournament results (solution). Supports progressive/partial submissions as tournament progresses.

**Authentication:** Required (HttpOnly cookie)

**Authorization:** Admin role

**Request Body (Full Solution Example)**

```json
{
  "tournamentId": "670f1234567890abcdef1234",
  "predictions": {
    "groupStage": [
      {
        "groupName": "Group A",
        "matches": [
          {
            "matchId": "match_1",
            "predictedHomeGoals": 2,
            "predictedAwayGoals": 1
          }
        ]
      }
    ],
    "knockout": {
      "roundOf16": [
        "BRA",
        "ARG",
        "GER",
        "FRA",
        "ESP",
        "ENG",
        "NED",
        "POR",
        "ITA",
        "BEL",
        "URU",
        "COL",
        "MEX",
        "CRO",
        "DEN",
        "SUI"
      ],
      "quarterfinals": ["BRA", "ARG", "GER", "FRA", "ESP", "ENG", "NED", "POR"],
      "semifinals": ["BRA", "ARG", "GER", "FRA"],
      "final": ["BRA", "ARG"],
      "champion": "ARG",
      "bronze": "FRA"
    }
  }
}
```

**Request Body (Partial Solution - Group Stage Only)**

```json
{
  "tournamentId": "670f1234567890abcdef1234",
  "predictions": {
    "groupStage": [
      {
        "groupName": "Group A",
        "matches": [
          {
            "matchId": "match_1",
            "predictedHomeGoals": 2,
            "predictedAwayGoals": 1
          }
        ]
      }
    ],
    "knockout": {}
  }
}
```

**Response (Success - 201 or 200)**

```json
{
  "success": true,
  "solutionId": "670f9012345678abcdef9012",
  "message": "Solution updated successfully",
  "scoredCount": 12
}
```

**Response (Error - 401 Not Authenticated)**

```json
{
  "error": "Authentication required"
}
```

**Response (Error - 403 Forbidden)**

```json
{
  "error": "Admin access required"
}
```

**Key Features**

- **Progressive Updates:** Supports partial solutions - admin can submit results incrementally as tournament progresses
- **Complete Overwrite:** Each POST replaces the previous solution entirely (not a merge)
- **Auto-Scoring:** Automatically recalculates all bet scores after saving solution
- **Optional Fields:**
  - `groupStage` can be omitted or contain partial groups
  - `knockout` fields (`roundOf16`, `quarterfinals`, `semifinals`, `final`, `champion`, `bronze`) are all optional
  - Allows submitting just group stage results early in tournament, adding knockout later
- **Response includes `scoredCount`:** Number of bets that were automatically rescored

**Validation**

- Uses `solutionPredictionsSchema` (allows optional knockout fields)
- When fields are provided, they must meet validation rules (e.g., `roundOf16` must have exactly 16 teams)

**Code Location**

`src/app/api/admin/solution/route.ts`

---

### 8. POST /api/admin/score-all

**Purpose:** Calculate scores for all bets by comparing them to the solution.

**Authentication:** Required (HttpOnly cookie)

**Authorization:** Admin role

**Request Body**

```json
{
  "tournamentId": "670f1234567890abcdef1234"
}
```

**Response (Success - 200)**

```json
{
  "success": true,
  "message": "Scored 5 bets successfully",
  "scoredCount": 5
}
```

**Response (Error - 401 Not Authenticated)**

```json
{
  "error": "Authentication required"
}
```

**Response (Error - 403 Forbidden)**

```json
{
  "error": "Admin access required"
}
```

**Response (Error - 404 Solution Not Found)**

```json
{
  "error": "Solution not found. Please set the solution first."
}
```

**Code Location**

`src/app/api/admin/score-all/route.ts`

---

## Public Routes

### 9. GET /api/leaderboard

**Purpose:** Retrieve top-scoring bets with usernames for a tournament, filtered by group.

**Authentication:** Not required (public endpoint)

**Query Parameters**

- `tournamentId` (required): Tournament's MongoDB ObjectId
- `limit` (optional): Maximum number of entries to return (default: 10, max: 100)

**Response (Success - 200)**

```json
{
  "group": "default",
  "leaderboard": [
    {
      "rank": 1,
      "username": "micke_bets",
      "totalScore": 45,
      "groupStageScore": 28,
      "knockoutScore": 17
    },
    {
      "rank": 2,
      "username": "john_doe",
      "totalScore": 42,
      "groupStageScore": 26,
      "knockoutScore": 16
    }
  ]
}
```

**Response (Error - 400 Missing tournamentId)**

```json
{
  "error": "tournamentId is required"
}
```

**Response (Error - 500 Server Error)**

```json
{
  "error": "Failed to fetch leaderboard"
}
```

**Key Implementation Details**

- Group filtering behavior:
  - Authenticated user: uses the current user's `group`
  - Guest user: defaults to `"default"`
- Returns `group` in response so frontend can show which leaderboard is active
- Returns only bets belonging to users in the resolved group
- Ranks by `scoring.totalScore` descending, then `submittedAt` ascending for consistent tie-breaking
- Uses user lookup from `users` collection to resolve usernames and group members
- Returns "Unknown" as username fallback if user record not found
- Empty leaderboard `[]` if no scored bets exist
- Does NOT trigger scoring calculation (read-only operation)

**Code Location**

`src/app/api/leaderboard/route.ts`

---

### 10. GET /api/user/group

**Purpose:** Retrieve the authenticated user's current group.

**Authentication:** Required (HttpOnly cookie)

**Query Parameters:** None

**Response (Success - 200)**

```json
{
  "group": "friends-2026"
}
```

**Response (Error - 401 Not Authenticated)**

```json
{
  "error": "Authentication required"
}
```

**Code Location**

`src/app/api/user/group/route.ts`

---

### 11. PUT /api/user/group

**Purpose:** Update the authenticated user's group.

**Authentication:** Required (HttpOnly cookie)

**Request Body**

```json
{
  "group": "friends-2026"
}
```

**Validation Rules**

- `group`: required string
- Trimmed and normalized to lowercase
- Max length: 30
- Allowed chars: letters, numbers, spaces, dashes (`^[a-z0-9 -]+$`)

**Response (Success - 200)**

```json
{
  "success": true,
  "message": "Group updated successfully",
  "group": "friends-2026"
}
```

**Response (Error - 401 Not Authenticated)**

```json
{
  "error": "Authentication required"
}
```

**Code Location**

`src/app/api/user/group/route.ts`

---

### 12. GET /api/groups

**Purpose:** Retrieve all unique groups currently used by users.

**Authentication:** Not required (public endpoint)

**Query Parameters:** None

**Response (Success - 200)**

```json
{
  "groups": ["default", "friends-2026", "office-pool"]
}
```

**Key Details**

- Reads distinct values from `User.group`
- Returns groups sorted alphabetically
- Used by frontend `ChooseGroup` form

**Code Location**

`src/app/api/groups/route.ts`

---

### 13. GET /api/config/betting-deadline

**Purpose:** Retrieve betting deadline configuration and status.

**Authentication:** Not required (public endpoint)

**Query Parameters:** None

**Response (Success - 200)**

```json
{
  "deadline": "2026-06-11T21:00:00.000Z",
  "isPassed": false
}
```

**Response (Error - 500 Server Error)**

```json
{
  "error": "Failed to retrieve deadline configuration"
}
```

**Key Details**

- Returns betting deadline as ISO 8601 string
- `isPassed` boolean indicates if current time is after deadline
- Used by frontend to determine button state and display deadline to users
- Environment variable: `BETTING_DEADLINE` (format: `2026-06-11T21:00:00+02:00`)
- No authentication required (public information)

**Code Location**

`src/app/api/config/betting-deadline/route.ts`

---

### 14. GET /api/solutions

**Purpose:** Retrieve the current solution (actual tournament results) for a tournament.

**Authentication:** Not required (public endpoint)

**Query Parameters**

- `tournamentId` (required): Tournament's MongoDB ObjectId

**Response (Success - 200)**

```json
{
  "success": true,
  "solution": {
    "_id": "670f9012345678abcdef9012",
    "tournamentId": "670f1234567890abcdef1234",
    "predictions": {
      "groupStage": [
        {
          "groupName": "Group A",
          "matches": [
            {
              "matchId": "match_1",
              "predictedHomeGoals": 2,
              "predictedAwayGoals": 1
            }
          ]
        }
      ],
      "knockout": {
        "roundOf16": [
          "BRA",
          "ARG",
          "GER",
          "FRA",
          "ESP",
          "ENG",
          "NED",
          "POR",
          "ITA",
          "BEL",
          "URU",
          "COL",
          "MEX",
          "CRO",
          "DEN",
          "SUI"
        ],
        "quarterfinals": [
          "BRA",
          "ARG",
          "GER",
          "FRA",
          "ESP",
          "ENG",
          "NED",
          "POR"
        ],
        "semifinals": ["BRA", "ARG", "GER", "FRA"],
        "final": ["BRA", "ARG"],
        "champion": "ARG",
        "bronze": "FRA"
      }
    },
    "createdAt": "2026-06-11T22:00:00.000Z"
  }
}
```

**Response (Error - 400 Missing tournamentId)**

```json
{
  "error": "tournamentId is required"
}
```

**Response (Error - 404 Solution Not Found)**

```json
{
  "error": "Solution not found"
}
```

**Key Details**

- Public endpoint accessible to all users (no authentication required)
- Used by frontend to display actual results alongside user predictions
- Solution may contain partial data (e.g., only group stage early in tournament)
- Supports progressive tournament result disclosure
- Returns 404 if no solution exists yet for the tournament

**Code Location**

`src/app/api/solutions/route.ts`

---

## Validation Schemas

All requests are validated using Zod schemas in `src/lib/validationSchemas.ts`:

- `registerSchema` → Username, email, firstName, lastName, password validation for `/api/auth/register`
- `loginSchema` → Username and password validation for `/api/auth/login`
- `betSchema` → Bet structure validation for `/api/bets` POST
- `betPredictionsSchema` → User bet predictions (requires all knockout fields) for `/api/bets` POST
- `solutionPredictionsSchema` → Solution structure validation (allows optional knockout fields) for `/api/admin/solution` POST
- `optionalKnockoutProgressionSchema` → Knockout predictions with all fields optional for progressive updates
- `optionalGroupStageGroupSchema` → Group stage predictions with optional matches array for partial solutions

**Key Difference: Bet vs Solution Schemas**

- **User bets** (`betPredictionsSchema`): Requires complete predictions including all knockout fields
- **Admin solutions** (`solutionPredictionsSchema`): All knockout fields optional, groupStage optional, supports partial data

**Example Validation Error**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 3,
      "type": "string",
      "path": ["username"],
      "message": "String must contain at least 3 character(s)"
    }
  ]
}
```

---

## Authentication & Authorization Flow

### Protected Route Guard Pattern

Routes that require authentication use the `requireUser()` guard:

```typescript
import { requireUser } from "@/lib/authGuards";

export async function POST(request: NextRequest) {
  const auth = requireUser(request);
  if (!auth.isAuthenticated) {
    return auth.response; // 401 JSON response
  }

  const { userId } = auth.payload;
  // ... rest of handler
}
```

Routes that require admin use the `requireAdmin()` guard:

```typescript
import { requireAdmin } from "@/lib/authGuards";

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.isAuthorized) {
    return auth.response; // 401 or 403 JSON response
  }

  const { userId, role } = auth.payload;
  // ... rest of handler
}
```

---

## Error Handling Pattern

All routes follow this structure:

```typescript
export async function POST(request: NextRequest) {
  try {
    // Authentication check (if needed)
    const auth = requireUser(request);
    if (!auth.isAuthenticated) {
      return auth.response;
    }

    await connectDB();
    const body = await request.json();

    // Validate with Zod
    const validated = schema.parse(body);

    // Business logic...

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
```

---

## Database Connection

All routes call `await connectDB()` from `src/lib/db.ts`:

- Reuses existing Mongoose connection if available
- Creates new connection if needed
- Uses connection pooling automatically

---

## Testing Workflow

1. **Start server:** `npm run dev`
2. **Register user:** `POST /api/auth/register` (creates user account)
3. **Log in:** `POST /api/auth/login` (receives auth_token cookie)
4. **Check session:** `GET /api/auth/me` (verify logged-in user)
5. **Submit bet:** `POST /api/bets` (with auth cookie)
6. **Get bet:** `GET /api/bets?tournamentId=...` (with auth cookie)
7. **Admin: Set solution:** `POST /api/admin/solution` (admin user only)
8. **Admin: Score bets:** `POST /api/admin/score-all` (admin user only)
9. **Log out:** `POST /api/auth/logout` (clears cookie)

---

## Frontend Pages

- **`/login`** – Login form (username + password)
- **`/register`** – Registration form (username, email, name, password)
- **`/`** (home) – Bet form (requires auth; prompts to log in if not authenticated)

---

## Related Documentation

- [Database Models](./database-models.md) - Schema definitions
- [Scoring System](./scoring-system.md) - How points are calculated
- [Architecture Overview](../architecture.md) - How API routes fit in
