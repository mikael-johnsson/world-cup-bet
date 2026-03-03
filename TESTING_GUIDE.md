# World Cup Betting Website - Setup & Testing Guide

## ✅ Phase 1: MVP Core - COMPLETE

### Project Overview

- **Frontend**: NextJS with TypeScript, React Hook Form, Tailwind CSS
- **Backend**: NextJS API Routes
- **Database**: MongoDB with Mongoose
- **Core Features**: Bet form with dynamic knockout predictions, admin scoring system

---

## 🚀 Getting Started

### Prerequisites

1. **MongoDB** - Install and run MongoDB locally

   ```bash
   # macOS with Homebrew
   brew install mongodb-community
   brew services start mongodb-community

   # Or run MongoDB Docker container
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Node.js** - Version 18+ already installed

### Installation & Setup

1. **Start MongoDB** (if not already running)

   ```bash
   # Check if MongoDB is running on localhost:27017
   ```

2. **Install dependencies** (already done)

   ```bash
   npm install
   ```

3. **Configure environment** (.env.local already created)

   ```
   MONGODB_URI=mongodb://localhost:27017/world-cup-bet
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Visit: `http://localhost:3000`

---

## 🧪 Testing the Application

### **Test 1: Verify Tournament Data Seeding**

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. The page should load and display "2026 FIFA World Cup Betting"
4. You should see all 12 groups with their matches

**What's happening:**

- The page auto-seeds the tournament data on first load
- MongoDB stores the tournament with 72 group stage matches and 16 round of 32 matches

### **Test 2: Submit a Bet (Happy Path)**

1. **Fill the Group Stage Form:**
   - Scroll through all 12 groups
   - For each match, enter predicted scores (e.g., 2-1, 0-0, etc.)
   - Fill in at least a few matches in each group

2. **Knockout Section Appears:**
   - After filling group stage, the "Knockout Stage Predictions" section should appear
   - Select predicted winners for each Round of 16 match

3. **Submit the Bet:**
   - Click "Submit Bet" button
   - You should see: `"Bet created successfully (ID: xxx)"`
   - This saves your bet to the database

4. **Update an Existing Bet:**
   - Change some scores and click "Submit Bet" again
   - Should see: `"Bet updated successfully (ID: xxx)"` with the SAME ID

This validates:

- ✅ Form validation works
- ✅ API is receiving data correctly
- ✅ Create/update logic on backend works
- ✅ MongoDB is persisting data

---

## 🔧 API Testing (Using curl or Postman)

### Get Current Bet

```bash
curl "http://localhost:3000/api/bets?tournamentId=ID_FROM_RESPONSE" \
  -H "Content-Type: application/json"
```

### Set Solution (Admin)

```bash
curl -X POST "http://localhost:3000/api/admin/solution" \
  -H "Content-Type: application/json" \
  -d '{
    "tournamentId": "TOURNAMENT_ID",
    "predictions": {
      "groupStage": [
        {
          "groupName": "Group A",
          "matches": [
            {"matchId": "A1", "predictedHomeGoals": 2, "predictedAwayGoals": 1},
            {"matchId": "A2", "predictedHomeGoals": 1, "predictedAwayGoals": 0},
            {"matchId": "A3", "predictedHomeGoals": 0, "predictedAwayGoals": 1},
            {"matchId": "A4", "predictedHomeGoals": 1, "predictedAwayGoals": 1},
            {"matchId": "A5", "predictedHomeGoals": 2, "predictedAwayGoals": 0},
            {"matchId": "A6", "predictedHomeGoals": 3, "predictedAwayGoals": 1}
          ]
        }
        // ... repeat for Groups B-L
      ],
      "knockout": [
        {
          "round": "roundOf16",
          "matches": [
            {"matchId": "R16_1", "predictedWinnerCode": "USA"},
            {"matchId": "R16_2", "predictedWinnerCode": "ENG"},
            // ... etc for all 16 matches
          ]
        }
      ]
    }
  }'
```

### Calculate Scores (Admin)

```bash
curl -X POST "http://localhost:3000/api/admin/score-all" \
  -H "Content-Type: application/json" \
  -d '{"tournamentId": "TOURNAMENT_ID"}'
```

This will:

1. Compare all user bets against the solution
2. Calculate scores (3 points per correct match, +1 for exact score in groups; 5 points per correct knockout winner)
3. Update each bet's `totalScore` field

---

## 📊 Database Structure (MongoDB)

### Collections Created:

1. **tournaments** - Tournament structure (groups, fixtures, matches)
2. **bets** - User predictions and scores
3. **solutions** - Admin-set actual tournament results
4. **users** - (Empty for Phase 1, will use in Phase 2)

### View Data in MongoDB:

```bash
# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use world-cup-bet database
use world-cup-bet

# Show collections
show collections

# View tournament
db.tournaments.findOne()

# View bets
db.bets.find()

# View solutions
db.solutions.find()

# Count bets
db.bets.countDocuments()
```

---

## 🔍 Scoring System (Implemented)

### Group Stage Scoring:

- **3 points**: Correct match result (W/D/L)
- **+1 bonus**: Exact score prediction

Example:

- Predict: USA 2-1 Mexico, Actual: USA 2-1 Mexico → 3 + 1 = **4 points**
- Predict: USA 1-1 Mexico, Actual: USA 2-1 Mexico → 0 points

### Knockout Scoring:

- **5 points**: Correct winner prediction

Example:

- Predict: USA wins, Actual: USA wins → **5 points**
- Predict: USA wins, Actual: England wins → 0 points

---

## ✨ Key Features Implemented

| Feature                         | Status | Notes                                       |
| ------------------------------- | ------ | ------------------------------------------- |
| Tournament Data Schema          | ✅     | 12 groups, 72 group matches, 16 R16 matches |
| Dynamic Form (Group → Knockout) | ✅     | Knockout only shows when group stage filled |
| Bet Submission (Create)         | ✅     | POST /api/bets                              |
| Bet Update                      | ✅     | Same endpoint, updates if bet exists        |
| Scoring Logic                   | ✅     | Group & knockout calculations ready         |
| Admin Solution API              | ✅     | POST /api/admin/solution                    |
| Score All Bets                  | ✅     | POST /api/admin/score-all                   |
| Frontend Validation             | ✅     | Zod schemas on form inputs                  |

---

## 🐛 If It Doesn't Work

1. **MongoDB Connection Error?**
   - Verify MongoDB is running: `mongosh`
   - Check .env.local has correct MONGODB_URI
   - Ensure port 27017 is available

2. **Components Not Showing?**
   - Clear cache: `rm -rf .next`
   - Restart dev server: `npm run dev`
   - Restart VS Code TypeScript server (Cmd+Shift+P → "TypeScript: Restart TS Server")

3. **Form Not Validating?**
   - Check browser console for errors (F12)
   - Verify all fields have numeric values for group stage

4. **Scoring Not Working?**
   - Make sure solution is set first via `/api/admin/solution`
   - Then run `/api/admin/score-all`
   - Check database to verify `bets[].scoring.totalScore` is updated

---

## 📝 Next Steps (Phase 2)

1. **Add User Authentication**
   - Register endpoint (POST /api/auth/register)
   - Login endpoint (POST /api/auth/login)
   - JWT token generation & verification
   - Protect bet API with user ID

2. **Add Admin Dashboard**
   - Simple UI to set solution and run scoring
   - View leaderboard of all bets with scores

3. **Add Betting Restrictions**
   - Lock form after group stage matches start
   - Only allow updates before tournament starts
   - Show tournament schedule

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx (main form page)
│   └── api/
│       ├── bets/route.ts (create/update bet, get current bet)
│       └── admin/
│           ├── solution/route.ts (set solution)
│           └── score-all/route.ts (calculate all scores)
├── components/
│   ├── BetForm.tsx (main form with state)
│   ├── GroupStageSection.tsx (group matches)
│   └── KnockoutSection.tsx (knockout predictions)
├── lib/
│   ├── db.ts (MongoDB connection)
│   ├── validationSchemas.ts (Zod schemas)
│   ├── seedTournament.ts (tournament seeding)
│   └── scoring/
│       ├── calculateScore.ts (main scoring orchestrator)
│       ├── groupStageScoringRules.ts (group logic)
│       ├── knockoutScoringRules.ts (knockout logic)
│       └── comparePredictions.ts (utilities)
├── models/
│   ├── Tournament.ts (Mongoose schema)
│   ├── Bet.ts (Mongoose schema)
│   ├── Solution.ts (Mongoose schema)
│   └── User.ts (Mongoose schema - Phase 2)
└── types/
    └── index.ts (TypeScript interfaces)
```

---

## 🎓 Learning Points (as a junior developer)

1. **API Routes**: How NextJS handles backend API through `/app/api`
2. **React Hook Form**: Using `useWatch()` for dependent form fields
3. **Mongoose**: Defining schemas and connecting to MongoDB
4. **Zod Validation**: TypeScript-first schema validation
5. **Scoring Logic**: How to compare predictions against actual results
6. **Type Safety**: Using TypeScript interfaces for data structures

---

**Ready to test? Start the dev server with `npm run dev` and visit http://localhost:3000!**
