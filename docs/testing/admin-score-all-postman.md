# Admin API Testing: Solution + Score-All (Postman)

This guide shows how to test the admin scoring flow using Postman:

1. POST a tournament solution
2. POST to score all bets

---

## Prerequisites

- App is running locally (`npm run dev`)
- MongoDB is running and connected
- You have:
  - one **admin** user account
  - a valid `tournamentId`
  - at least one submitted bet in the same tournament (otherwise score-all returns 0)

---

## Endpoints Used

- `POST /api/auth/login`
- `POST /api/admin/solution`
- `POST /api/admin/score-all`
- (Optional verify) `GET /api/leaderboard?tournamentId=...`

Base URL (local):

`http://localhost:3000`

---

## Step 1: Log In as Admin

### Request

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "username": "YOUR_ADMIN_USERNAME",
  "password": "YOUR_ADMIN_PASSWORD"
}
```

### Expected

- Status: `200`
- Response includes admin identity (userId, username, role)
- Postman cookie jar now contains `auth_token` for `localhost`

> Important: Keep using the same Postman workspace/session so the auth cookie is sent automatically to admin routes.

---

## Step 2: POST Tournament Solution

### Request

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/admin/solution`
- **Headers:**
  - `Content-Type: application/json`
- **Body:** full solution document with quoted keys (replace `tournamentId`)

```json
{
  "tournamentId": "YOUR_TOURNAMENT_ID",
  "predictions": {
    "groupStage": [
      {
        "groupName": "Group A",
        "matches": [
          { "matchId": "A1", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "A2", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "A3", "predictedHomeGoals": 3, "predictedAwayGoals": 0 },
          { "matchId": "A4", "predictedHomeGoals": 2, "predictedAwayGoals": 2 },
          { "matchId": "A5", "predictedHomeGoals": 1, "predictedAwayGoals": 0 },
          { "matchId": "A6", "predictedHomeGoals": 2, "predictedAwayGoals": 1 }
        ]
      },
      {
        "groupName": "Group B",
        "matches": [
          { "matchId": "B1", "predictedHomeGoals": 3, "predictedAwayGoals": 0 },
          { "matchId": "B2", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "B3", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "B4", "predictedHomeGoals": 0, "predictedAwayGoals": 3 },
          { "matchId": "B5", "predictedHomeGoals": 2, "predictedAwayGoals": 0 },
          { "matchId": "B6", "predictedHomeGoals": 1, "predictedAwayGoals": 2 }
        ]
      },
      {
        "groupName": "Group C",
        "matches": [
          { "matchId": "C1", "predictedHomeGoals": 3, "predictedAwayGoals": 1 },
          { "matchId": "C2", "predictedHomeGoals": 2, "predictedAwayGoals": 0 },
          { "matchId": "C3", "predictedHomeGoals": 2, "predictedAwayGoals": 2 },
          { "matchId": "C4", "predictedHomeGoals": 1, "predictedAwayGoals": 3 },
          { "matchId": "C5", "predictedHomeGoals": 1, "predictedAwayGoals": 0 },
          { "matchId": "C6", "predictedHomeGoals": 2, "predictedAwayGoals": 1 }
        ]
      },
      {
        "groupName": "Group D",
        "matches": [
          { "matchId": "D1", "predictedHomeGoals": 2, "predictedAwayGoals": 0 },
          { "matchId": "D2", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "D3", "predictedHomeGoals": 3, "predictedAwayGoals": 1 },
          { "matchId": "D4", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "D5", "predictedHomeGoals": 0, "predictedAwayGoals": 2 },
          { "matchId": "D6", "predictedHomeGoals": 1, "predictedAwayGoals": 0 }
        ]
      },
      {
        "groupName": "Group E",
        "matches": [
          { "matchId": "E1", "predictedHomeGoals": 3, "predictedAwayGoals": 0 },
          { "matchId": "E2", "predictedHomeGoals": 2, "predictedAwayGoals": 2 },
          { "matchId": "E3", "predictedHomeGoals": 1, "predictedAwayGoals": 0 },
          { "matchId": "E4", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "E5", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "E6", "predictedHomeGoals": 2, "predictedAwayGoals": 0 }
        ]
      },
      {
        "groupName": "Group F",
        "matches": [
          { "matchId": "F1", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "F2", "predictedHomeGoals": 1, "predictedAwayGoals": 0 },
          { "matchId": "F3", "predictedHomeGoals": 3, "predictedAwayGoals": 2 },
          { "matchId": "F4", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "F5", "predictedHomeGoals": 2, "predictedAwayGoals": 0 },
          { "matchId": "F6", "predictedHomeGoals": 0, "predictedAwayGoals": 1 }
        ]
      },
      {
        "groupName": "Group G",
        "matches": [
          { "matchId": "G1", "predictedHomeGoals": 3, "predictedAwayGoals": 1 },
          { "matchId": "G2", "predictedHomeGoals": 2, "predictedAwayGoals": 0 },
          { "matchId": "G3", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "G4", "predictedHomeGoals": 2, "predictedAwayGoals": 2 },
          { "matchId": "G5", "predictedHomeGoals": 1, "predictedAwayGoals": 0 },
          { "matchId": "G6", "predictedHomeGoals": 2, "predictedAwayGoals": 1 }
        ]
      },
      {
        "groupName": "Group H",
        "matches": [
          { "matchId": "H1", "predictedHomeGoals": 2, "predictedAwayGoals": 0 },
          { "matchId": "H2", "predictedHomeGoals": 1, "predictedAwayGoals": 2 },
          { "matchId": "H3", "predictedHomeGoals": 3, "predictedAwayGoals": 1 },
          { "matchId": "H4", "predictedHomeGoals": 1, "predictedAwayGoals": 0 },
          { "matchId": "H5", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "H6", "predictedHomeGoals": 0, "predictedAwayGoals": 2 }
        ]
      },
      {
        "groupName": "Group I",
        "matches": [
          { "matchId": "I1", "predictedHomeGoals": 3, "predictedAwayGoals": 0 },
          { "matchId": "I2", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "I3", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "I4", "predictedHomeGoals": 1, "predictedAwayGoals": 2 },
          { "matchId": "I5", "predictedHomeGoals": 2, "predictedAwayGoals": 0 },
          { "matchId": "I6", "predictedHomeGoals": 1, "predictedAwayGoals": 0 }
        ]
      },
      {
        "groupName": "Group J",
        "matches": [
          { "matchId": "J1", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "J2", "predictedHomeGoals": 3, "predictedAwayGoals": 0 },
          { "matchId": "J3", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "J4", "predictedHomeGoals": 2, "predictedAwayGoals": 0 },
          { "matchId": "J5", "predictedHomeGoals": 0, "predictedAwayGoals": 2 },
          { "matchId": "J6", "predictedHomeGoals": 1, "predictedAwayGoals": 1 }
        ]
      },
      {
        "groupName": "Group K",
        "matches": [
          { "matchId": "K1", "predictedHomeGoals": 3, "predictedAwayGoals": 1 },
          { "matchId": "K2", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "K3", "predictedHomeGoals": 1, "predictedAwayGoals": 0 },
          { "matchId": "K4", "predictedHomeGoals": 2, "predictedAwayGoals": 2 },
          { "matchId": "K5", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "K6", "predictedHomeGoals": 2, "predictedAwayGoals": 0 }
        ]
      },
      {
        "groupName": "Group L",
        "matches": [
          { "matchId": "L1", "predictedHomeGoals": 2, "predictedAwayGoals": 0 },
          { "matchId": "L2", "predictedHomeGoals": 1, "predictedAwayGoals": 2 },
          { "matchId": "L3", "predictedHomeGoals": 3, "predictedAwayGoals": 1 },
          { "matchId": "L4", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "L5", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "L6", "predictedHomeGoals": 0, "predictedAwayGoals": 1 }
        ]
      }
    ],
    "knockout": {
      "roundOf16": [
        "BRA",
        "ARG",
        "FRA",
        "ENG",
        "ESP",
        "GER",
        "NED",
        "POR",
        "BEL",
        "URU",
        "COL",
        "ITA",
        "JPN",
        "USA",
        "MEX",
        "SEN"
      ],
      "quarterfinals": ["BRA", "ARG", "FRA", "ENG", "ESP", "GER", "NED", "POR"],
      "semifinals": ["BRA", "ARG", "FRA", "ENG"],
      "final": ["BRA", "ARG"],
      "champion": "ARG",
      "bronze": "FRA"
    }
  }
}
```

### Expected

- Status: `200` or `201`
- Example response:

```json
{
  "success": true,
  "solutionId": "...",
  "message": "Solution created successfully"
}
```

---

## Step 3: POST Score-All

### Request

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/admin/score-all`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "tournamentId": "YOUR_TOURNAMENT_ID"
}
```

### Expected

- Status: `200`
- Example response:

```json
{
  "success": true,
  "message": "Scored 5 bets successfully",
  "scoredCount": 5
}
```

If no bets exist yet, expected:

```json
{
  "success": true,
  "message": "No bets to score",
  "scoredCount": 0
}
```

---

## Step 4 (Optional): Verify Scores Were Persisted

### Option A: Leaderboard API

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/leaderboard?tournamentId=YOUR_TOURNAMENT_ID`

You should see ranked entries with:

- `rank`
- `username`
- `groupStageScore`
- `knockoutScore`
- `totalScore`

### Option B: Database Check

Inspect `bets` collection for this tournament and verify each scored bet has:

```json
"scoring": {
  "groupStageScore": 0,
  "knockoutScore": 0,
  "totalScore": 0,
  "lastCalculated": "2026-03-05T..."
}
```

(Values will vary based on predictions vs solution.)

---

## Common Errors

### 401 / 403 on admin routes

- You are not logged in as admin
- Cookie not being sent from Postman
- Fix: log in again with admin account and retry in same session

### 404 "Tournament not found"

- `tournamentId` is invalid or not in DB

### 404 "Solution not found"

- You called score-all before posting solution

### 400 "tournamentId is required"

- Request body is missing `"tournamentId"`

---

## Minimal Quick Test (Fast Path)

1. `POST /api/auth/login` as admin
2. `POST /api/admin/solution` with a valid `"tournamentId"`
3. `POST /api/admin/score-all` with same `"tournamentId"`
4. `GET /api/leaderboard?tournamentId=...` to verify ranking output

---

## Copy/Paste Request Set (Shortest Version)

Use these directly in Postman with **Body → raw → JSON**.

### 1) Admin Login

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`

```json
{
  "username": "YOUR_ADMIN_USERNAME",
  "password": "YOUR_ADMIN_PASSWORD"
}
```

### 2) Create/Update Solution

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/admin/solution`

```json
{
  "tournamentId": "YOUR_TOURNAMENT_ID",
  "predictions": {
    "groupStage": [
      {
        "groupName": "Group A",
        "matches": [
          { "matchId": "A1", "predictedHomeGoals": 1, "predictedAwayGoals": 0 },
          { "matchId": "A2", "predictedHomeGoals": 1, "predictedAwayGoals": 1 },
          { "matchId": "A3", "predictedHomeGoals": 2, "predictedAwayGoals": 0 },
          { "matchId": "A4", "predictedHomeGoals": 0, "predictedAwayGoals": 1 },
          { "matchId": "A5", "predictedHomeGoals": 2, "predictedAwayGoals": 1 },
          { "matchId": "A6", "predictedHomeGoals": 1, "predictedAwayGoals": 1 }
        ]
      }
    ],
    "knockout": {
      "roundOf16": [
        "BRA",
        "ARG",
        "FRA",
        "ENG",
        "ESP",
        "GER",
        "NED",
        "POR",
        "BEL",
        "URU",
        "COL",
        "ITA",
        "JPN",
        "USA",
        "MEX",
        "SEN"
      ],
      "quarterfinals": ["BRA", "ARG", "FRA", "ENG", "ESP", "GER", "NED", "POR"],
      "semifinals": ["BRA", "ARG", "FRA", "ENG"],
      "final": ["BRA", "ARG"],
      "champion": "ARG",
      "bronze": "FRA"
    }
  }
}
```

### 3) Score All Bets

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/admin/score-all`

```json
{
  "tournamentId": "YOUR_TOURNAMENT_ID"
}
```

### 4) Verify Leaderboard (Optional)

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/leaderboard?tournamentId=YOUR_TOURNAMENT_ID`

### Notes

- Keep all requests in the same Postman session so the `auth_token` cookie is reused.
- The short solution payload above is only useful if your validator accepts partial `groupStage`; if validation fails, use the full payload in Step 2.
