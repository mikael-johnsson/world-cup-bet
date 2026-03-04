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

**cURL Example**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "micke_bets",
    "email": "micke@example.com",
    "firstName": "Michael",
    "lastName": "Anderson",
    "password": "securePassword123"
  }'
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

**cURL Example**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "micke_bets",
    "password": "securePassword123"
  }'
```

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

**cURL Example**

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
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

**cURL Example**

```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
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
      "bronze": {
        "finalist1": "GER",
        "finalist2": "NED",
        "winner": "NED"
      }
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
- **bronze**: The two semifinal losers automatically play for bronze; user predicts the winner

**Validation Rules**

- `roundOf16`: Exactly 16 team codes (3-letter codes like "BRA", "FRA", "GER")
- `quarterfinals`: Exactly 8 team codes
- `semifinals`: Exactly 4 team codes
- `final`: Exactly 2 team codes
- `champion`: Non-empty team code
- `bronze`: Object with two semifinal losers and the predicted winner

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

**Key Behavior Changes (Phase 2)**

- Bets are now tied to the authenticated user's `userId`
- Unique constraint: one bet per user per tournament (enforced at DB level)
- Updating an existing bet: Finds by `{userId, tournamentId}` and updates predictions

**cURL Example**

```bash
curl -X POST http://localhost:3000/api/bets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "tournamentId": "670f1234567890abcdef1234",
    "predictions": { ... }
  }'
```

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

**cURL Example**

```bash
curl "http://localhost:3000/api/bets?tournamentId=670f1234567890abcdef1234" \
  -b cookies.txt
```

**Code Location**

`src/app/api/bets/route.ts` → `GET` handler

---

## Admin Routes (Protected)

### 7. POST /api/admin/solution

**Purpose:** Admin sets the actual tournament results (solution).

**Authentication:** Required (HttpOnly cookie)

**Authorization:** Admin role

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
          }
        ]
      }
    ],
    "knockout": [
      {
        "round": "roundOf32",
        "matches": [
          {
            "matchId": "ko_match_1",
            "predictedWinnerCode": "BRA"
          }
        ]
      }
    ]
  }
}
```

**Response (Success - 201 or 200)**

```json
{
  "success": true,
  "solutionId": "670f9012345678abcdef9012",
  "message": "Solution created successfully"
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

**cURL Example**

```bash
curl -X POST http://localhost:3000/api/admin/solution \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "tournamentId": "670f1234567890abcdef1234",
    "predictions": { ... }
  }'
```

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

**cURL Example**

```bash
curl -X POST http://localhost:3000/api/admin/score-all \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{ "tournamentId": "670f1234567890abcdef1234" }'
```

**Code Location**

`src/app/api/admin/score-all/route.ts`

---

## Validation Schemas

All requests are validated using Zod schemas in `src/lib/validationSchemas.ts`:

- `registerSchema` → Username, email, firstName, lastName, password validation for `/api/auth/register`
- `loginSchema` → Username and password validation for `/api/auth/login`
- `betSchema` → Bet structure validation for `/api/bets` POST
- `betPredictionsSchema` → Solution structure validation for `/api/admin/solution` POST

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

## Testing Workflow (Phase 2)

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
