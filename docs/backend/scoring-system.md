# Scoring System Documentation

The scoring system compares user predictions (Bet) against actual results (Solution) to calculate points.

---

## Overview

**Entry Point:** `src/lib/scoring/calculateScore.ts`

**Scoring Files:**

- `calculateScore.ts` - Main orchestrator
- `groupStageScoringRules.ts` - Group stage logic
- `knockoutScoringRules.ts` - Knockout stage logic
- `comparePredictions.ts` - Helper utilities

---

## Scoring Rules

### Group Stage

Each match can earn **3-4 points:**

| Outcome            | Points   | Description                                     |
| ------------------ | -------- | ----------------------------------------------- |
| **Exact score**    | 3 points | Correct home goals AND away goals               |
| **Correct result** | 1 point  | Correct winner (or draw) even if score is wrong |
| **Bonus**          | +1 point | Only when exact score is predicted (total = 4)  |

#### Examples

**Match: Mexico 2-1 USA**

| Prediction  | Points | Reason                         |
| ----------- | ------ | ------------------------------ |
| MEX 2-1 USA | 4      | Exact score (3) + bonus (1)    |
| MEX 3-1 USA | 1      | Correct winner, wrong score    |
| MEX 1-1 USA | 0      | Wrong result (predicted draw)  |
| USA 2-1 MEX | 0      | Wrong winner                   |
| USA 1-2 MEX | 1      | Correct winner, goals reversed |

**Match: Brazil 1-1 Argentina (Draw)**

| Prediction  | Points | Reason                             |
| ----------- | ------ | ---------------------------------- |
| BRA 1-1 ARG | 4      | Exact score + bonus                |
| BRA 0-0 ARG | 1      | Correct result (draw), wrong score |
| BRA 2-1 ARG | 0      | Predicted winner, actual draw      |

### Knockout Stage

Each correct team prediction earns **1 point** per round:

| Round              | Teams | Points Each | Max Points    |
| ------------------ | ----- | ----------- | ------------- |
| Round of 16        | 16    | 1 point     | 16 points     |
| Quarterfinals      | 8     | 1 point     | 8 points      |
| Semifinals         | 4     | 1 point     | 4 points      |
| Final              | 2     | 1 point     | 2 points      |
| Champion           | 1     | 1 point     | 1 point       |
| Bronze Winner      | 1     | 1 point     | 1 point       |
| **Total Knockout** | —     | —           | **32 points** |

#### Examples

**User Prediction vs. Actual Result:**

```
User predicts:
- Round of 16: ["BRA", "FRA", "GER", "NED", "ENG", "ARG", "ESP", "URY", "BEL", "SWE", "ITA", "POR", "JPN", "AUS", "MEX", "KOR"]
- Champion: BRA
- Bronze Winner: NED

Actual Result:
- Round of 16: ["BRA", "FRA", "GER", "NED", "ENG", "ARG", "ESP", "URY", "BEL", "CRO", "ITA", "POR", "JPN", "AUS", "MEX", "KOR"]
- Champion: FRA
- Bronze Winner: NED

Scoring:
- R16: 15 correct (CRO was actual, user predicted SWE) = 15 points
- Champion: FRA was actual, user predicted BRA = 0 points
- Bronze: NED was correct = 1 point
- Total: 16 points
```

---

## Code Walkthrough

### 1. Main Orchestrator

**File:** `src/lib/scoring/calculateScore.ts`

```typescript
export function calculateScore(bet: IBet, solution: ISolution): number {
  let totalScore = 0;

  // Score group stage
  for (const groupName in bet.groupStage) {
    const userGroupMatches = bet.groupStage[groupName];
    const solutionGroupMatches = solution.groupStage[groupName];

    for (let i = 0; i < userGroupMatches.length; i++) {
      const points = groupStageScoringRules(
        userGroupMatches[i],
        solutionGroupMatches[i],
      );
      totalScore += points;
    }
  }

  // Score knockout rounds
  const knockoutRounds: KnockoutRound[] = [
    "roundOf32",
    "roundOf16",
    "quarterFinals",
    "semiFinals",
    "final",
  ];

  for (const round of knockoutRounds) {
    const userPredictions = bet.knockout[round];
    const actualResults = solution.knockout[round];

    for (let i = 0; i < userPredictions.length; i++) {
      const points = knockoutScoringRules(userPredictions[i], actualResults[i]);
      totalScore += points;
    }
  }

  return totalScore;
}
```

**Logic:**

1. Loop through all 12 groups
2. For each group, loop through all 6 matches
3. Call `groupStageScoringRules()` for each match
4. Call `calculateKnockoutScore()` with entire knockout progression object
5. Return total score

---

### 2. Group Stage Scoring

**File:** `src/lib/scoring/groupStageScoringRules.ts`

```typescript
export function groupStageScoringRules(
  userPrediction: {
    homeTeam: string;
    awayTeam: string;
    predictedHomeGoals: number;
    predictedAwayGoals: number;
  },
  actualResult: {
    homeTeam: string;
    awayTeam: string;
    homeGoals: number;
    awayGoals: number;
  },
): number {
  let points = 0;

  // Check exact score
  if (
    userPrediction.predictedHomeGoals === actualResult.homeGoals &&
    userPrediction.predictedAwayGoals === actualResult.awayGoals
  ) {
    points += 3; // Exact score
    points += 1; // Bonus
    return points; // Early return (total = 4)
  }

  // Check correct result (winner or draw)
  const predictedResult = determineMatchResult(
    userPrediction.predictedHomeGoals,
    userPrediction.predictedAwayGoals,
  );

  const actualResultOutcome = determineMatchResult(
    actualResult.homeGoals,
    actualResult.awayGoals,
  );

  if (predictedResult === actualResultOutcome) {
    points += 1; // Correct result
  }

  return points;
}
```

**Helper function:**

```typescript
function determineMatchResult(
  homeGoals: number,
  awayGoals: number,
): "home" | "away" | "draw" {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
}
```

---

### 3. Knockout Scoring (Progression-Based)

**File:** `src/lib/scoring/knockoutScoringRules.ts`

```typescript
export function calculateKnockoutScore(
  prediction: KnockoutProgression,
  solution: KnockoutProgression,
): number {
  let score = 0;

  // Score Round of 16 (16 teams selected correctly)
  prediction.roundOf16.forEach((team) => {
    if (solution.roundOf16.includes(team)) {
      score += 1;
    }
  });

  // Score Quarterfinals (8 teams)
  prediction.quarterfinals.forEach((team) => {
    if (solution.quarterfinals.includes(team)) {
      score += 1;
    }
  });

  // Score Semifinals (4 teams)
  prediction.semifinals.forEach((team) => {
    if (solution.semifinals.includes(team)) {
      score += 1;
    }
  });

  // Score Final (2 teams)
  prediction.final.forEach((team) => {
    if (solution.final.includes(team)) {
      score += 1;
    }
  });

  // Score Champion (1 point)
  if (prediction.champion === solution.champion) {
    score += 1;
  }

  // Score Bronze Medal (1 point for correct winner)
  if (prediction.bronze === solution.bronze) {
    score += 1;
  }

  return score;
}
```

**Logic:**

- For each round (R16, QF, SF, Final), check each predicted team against actual advancing teams
- Award 1 point for each correct team
- Award 1 point for correct champion prediction
- Award 1 point for correct bronze medal winner
- Maximum knockout score: 32 points (16+8+4+2+1+1)

---

### 4. Helper Utilities

**File:** `src/lib/scoring/comparePredictions.ts`

```typescript
export function isExactScore(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
): boolean {
  return predictedHome === actualHome && predictedAway === actualAway;
}

export function isCorrectResult(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
): boolean {
  const predictedOutcome = getMatchResult(predictedHome, predictedAway);
  const actualOutcome = getMatchResult(actualHome, actualAway);
  return predictedOutcome === actualOutcome;
}

function getMatchResult(
  homeGoals: number,
  awayGoals: number,
): "home" | "away" | "draw" {
  if (homeGoals > awayGoals) return "home";
  if (homeGoals < awayGoals) return "away";
  return "draw";
}
```

**Currently:** Not used directly in scoring rules but available for future enhancements.

---

## Maximum Possible Score

### Group Stage

- 12 groups × 6 matches = 72 matches
- Max points per match = 4
- **Max group stage score = 288 points**

### Knockout Stage

- Round of 16: max 16 points
- Quarterfinals: max 8 points
- Semifinals: max 4 points
- Final: max 2 points
- Champion: max 1 point
- Bronze Winner: max 1 point
- **Max knockout score = 32 points**

### Total Maximum

**288 + 32 = 320 points**

---

## Scoring Trigger

### API Endpoint

`POST /api/admin/score-all`

**Request:**

```json
{
  "tournamentId": "670f1234567890abcdef1234"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Scoring completed",
  "results": [
    { "userName": "Micke", "score": 42 },
    { "userName": "Anna", "score": 38 }
  ]
}
```

### Code Flow

**File:** `src/app/api/admin/score-all/route.ts`

```typescript
export async function POST(req: Request) {
  try {
    await connectDB();
    const { tournamentId } = await req.json();

    // 1. Get solution
    const solution = await Solution.findOne({ tournamentId });
    if (!solution) {
      return NextResponse.json(
        { success: false, error: "Solution not found" },
        { status: 404 },
      );
    }

    // 2. Get all bets
    const bets = await Bet.find({ tournamentId });

    // 3. Calculate scores
    const results = [];
    for (const bet of bets) {
      const score = calculateScore(bet, solution);

      // 4. Update bet document
      bet.score = score;
      await bet.save();

      results.push({ userName: bet.userName, score });
    }

    return NextResponse.json({
      success: true,
      message: "Scoring completed",
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
```

---

## Testing Scenarios

### Scenario 1: Perfect Group Stage Match

**Setup:**

- User predicts: MEX 2-1 USA
- Actual result: MEX 2-1 USA

**Calculation:**

```typescript
predictedHomeGoals === homeGoals // 2 === 2 ✓
predictedAwayGoals === awayGoals // 1 === 1 ✓
→ Exact score: 3 points
→ Bonus: 1 point
→ Total: 4 points
```

### Scenario 2: Correct Winner, Wrong Score

**Setup:**

- User predicts: BRA 3-0 ARG
- Actual result: BRA 1-0 ARG

**Calculation:**

```typescript
Exact score check: false
Predicted result: 'home' (3 > 0)
Actual result: 'home' (1 > 0)
→ Correct result: 1 point
→ No bonus
→ Total: 1 point
```

### Scenario 3: Predicted Draw, Actual Win

**Setup:**

- User predicts: GER 1-1 FRA
- Actual result: GER 2-1 FRA

**Calculation:**

```typescript
Exact score check: false
Predicted result: 'draw' (1 === 1)
Actual result: 'home' (2 > 1)
→ Wrong result: 0 points
```

### Scenario 4: Knockout Match

**Setup:**

- User predicts: Spain wins
- Actual result: Spain wins

**Calculation:**

```typescript
predictedWinnerCode === winner // 'ESP' === 'ESP' ✓
→ Correct winner: 5 points
```

---

## Edge Cases

### Missing Predictions

**Current behavior:** If user hasn't predicted a match, the loop still runs but may cause errors.

**Future improvement (Phase 2):**

- Enforce complete predictions before submission
- Or skip unpredicted matches (0 points)

### Partial Solution

**Current behavior:** If admin hasn't set results for all matches, scoring fails.

**Recommended flow:**

- Admin sets results progressively (e.g., after group stage)
- Trigger scoring multiple times as results are added

---

## Future Enhancements (Phase 2+)

1. **Top Scorer Points**
   - Predict tournament's top scorer
   - +10 points if correct

2. **Tiebreaker**
   - Sort users by score, then by submission time

3. **Live Scoring**
   - Auto-update scores as matches finish
   - WebSocket or polling for real-time updates

4. **Historical Tracking**
   - Store score breakdown per match
   - Show user which predictions were correct

---

## Related Documentation

- [API Routes](./api-routes.md) - `/api/admin/score-all` endpoint
- [Database Models](./database-models.md) - Bet and Solution structures
- [Architecture Overview](../architecture.md) - Where scoring fits in
