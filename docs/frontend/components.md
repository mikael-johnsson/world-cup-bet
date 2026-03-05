# Components Documentation

All React components are in `src/components/` and use TypeScript + Tailwind CSS.

## Latest Update: Live Standings (Phase 1.5)

- `GroupStageSection.tsx` now renders a two-column layout on large screens:
  - Left: match score inputs
  - Right: live standings table for that group
- On mobile, the layout stacks vertically (fixtures first, standings below).
- Standings table headers: `Pos`, `Team`, `Pld`, `GF`, `GA`, `GD`, `Pts`.
- Rows 1 and 2 in each group table use `bg-green-100` to show qualifying teams.
- Row 3 in each group table use `bg-yellow-100` to show team is in third place standings.
- A new bottom table, **Best Third-Placed Teams**, is rendered after all groups.
- Rows 1 through 8 in the third placed teams standings use `bg-green-100` to show qualifying teams.

### New Supporting Utility

- `src/lib/standings/calculateGroupStandings.ts`
  - `calculateGroupStandings(group, prediction)`
  - `calculateThirdPlaceStandings(groups, predictions)`

### Current Sorting Rules

Standings are sorted by:

1. Most `Pts`
2. Biggest `GD`
3. Most `GF`
4. Alphabetically by team name

---

## Component Tree

```
page.tsx (Server Component)
    ├── Leaderboard.tsx (Client Component)
    └── BetForm.tsx (Client Component)
        ├── GroupStageSection.tsx
        └── KnockoutSection.tsx
```

---

## 1. BetForm.tsx

**Type:** Client Component (`"use client"`)

**Purpose:** Main form container that orchestrates the entire betting experience with group stage and progression-based knockout predictions.

### Props

```typescript
interface BetFormProps {
  tournamentId: string;
  tournamentData: any; // Full tournament document with groups and teams
}
```

Receives the tournament structure from `page.tsx`.

### Key Features

1. **React Hook Form Integration**
   - Manages 72 group stage inputs + knockout predictions
   - Provides validation and error handling
   - Tracks form state (dirty, touched, valid)

2. **Group Stage Completion Detection**
   - Watches `predictions.groupStage` for all predictions filled (>= 0 goals)
   - Uses `every()` to validate all 72 matches are complete

3. **Automatic Advancing Teams Calculation**
   - Calls `deriveAdvancingTeams()` to calculate 32 advancing teams:
     - Top 2 from each of 12 groups = 24 teams
     - Best 8 third-place teams = 8 teams
   - Teams ranked by goal difference, then goals scored

4. **Knockout Section Conditional Rendering**
   - Only appears when group stage is 100% filled
   - Only appears when exactly 32 advancing teams are calculated
   - Passes advancing teams to KnockoutSection component

5. **Authentication Check**

- Uses `useAuth()` from `AuthContext`
- Calls `refreshAuth()` via effect to sync latest auth state
- Shows login/register prompt if not authenticated

6. **Form Submission**
   - Sends POST to `/api/bets` with full predictions
   - Updates existing bet or creates new one (per user + tournament)
   - Shows success/error messages

### Code Structure

```typescript
'use client';

import { useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { betSchema, BetInput } from '@/lib/validationSchemas';
import { deriveAdvancingTeams } from '@/lib/deriveAdvancingTeams';
import { useAuth } from '@/context/AuthContext';

export default function BetForm({ tournamentId, tournamentData }: BetFormProps) {
  const { authUser, isAuthLoading, refreshAuth } = useAuth();

  // 1. Refresh auth status on mount
  useEffect(() => {
    refreshAuth();
  }, []);

  // 2. Initialize form with progression-based knockout structure
  const methods = useForm<BetInput>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      tournamentId,
      predictions: {
        groupStage: tournamentData.groups.map(group => ({
          groupName: group.name,
          matches: group.fixtures.map(fixture => ({
            matchId: fixture.matchId,
            predictedHomeGoals: 0,
            predictedAwayGoals: 0,
          })),
        })),
        knockout: {
          roundOf16: [],           // 16 advancing teams
          quarterfinals: [],       // 8 advancing teams
          semifinals: [],          // 4 advancing teams
          final: [],               // 2 finalists
          champion: "",            // 1 champion
          bronze: "",              // Bronze winner team code
        },
      },
    },
  });

  // 3. Watch group stage and detect completion
  const groupStageWatch = useWatch({
    control: methods.control,
    name: 'predictions.groupStage',
  });

  const isGroupStageFilled = groupStageWatch?.every(group =>
    group.matches.every(m => m.predictedHomeGoals >= 0 && m.predictedAwayGoals >= 0),
  );

  // 4. Calculate advancing teams (top 2 from each group + best 8 third-place)
  const advancingTeams = useMemo(() => {
    if (!isGroupStageFilled) return [];
    return deriveAdvancingTeams(groupStageWatch, tournamentData.groups);
  }, [isGroupStageFilled, groupStageWatch, tournamentData.groups]);

  // 5. Create team name lookup map
  const teamMap = useMemo(() => {
    const map = new Map<string, string>();
    tournamentData.groups.forEach(group =>
      group.teams.forEach(team =>
        map.set(team.code, team.name || team.code),
      ),
    );
    return map;
  }, [tournamentData.groups]);

  // 6. Handle submission
  const onSubmit = async (data: BetInput) => {
    const response = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    // Handle response...
  };

  // 7. Render form sections
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <h1>World Cup Bet Form</h1>

        <GroupStageSection groups={tournamentData.groups} />

        {/* Knockout appears only when group stage is complete */}
        {isGroupStageFilled && advancingTeams.length === 32 && (
          <KnockoutSection advancingTeams={advancingTeams} allTeams={teamMap} />
        )}

        <button type="submit" disabled={!isGroupStageFilled}>Save Bet</button>
      </form>
    </FormProvider>
  );
}
```

### State Management

**React Hook Form manages:**

- All input values (group stage + knockout predictions)
- Validation errors
- Form dirty/touched state
- Submission state

**useState for:**

- Loading/error messages
- Submission feedback

**Auth state source:**

- `AuthContext` via `useAuth()`

### Validation

Uses Zod schema from `src/lib/validationSchemas.ts`:

```typescript
resolver: zodResolver(betValidationSchema);
```

### Styling

Tailwind CSS classes for responsive design:

```jsx
<div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
  {/* Form content */}
</div>
```

---

## 2. GroupStageSection.tsx

**Type:** Client Component (used inside BetForm)

**Purpose:** Renders all 12 groups with 6 matches each (72 total inputs).

### Props

```typescript
interface GroupStageSectionProps {
  tournament: ITournament;
  register: UseFormRegister<any>;
}
```

### Code Structure

```typescript
export default function GroupStageSection({
  tournament,
  register
}: GroupStageSectionProps) {
  return (
    <div className="space-y-6">
      <h2>Group Stage Predictions</h2>

      {tournament.groups.map((group, groupIndex) => (
        <div key={group.groupName} className="border p-4">
          <h3>Group {group.groupName}</h3>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {group.teams.map(team => (
              <div key={team} className="text-center bg-gray-100 p-2">
                {team}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {group.fixtures.map((fixture, fixtureIndex) => (
              <div key={fixtureIndex} className="flex items-center gap-4">
                <span>{fixture.homeTeam}</span>

                <input
                  type="number"
                  min="0"
                  {...register(
                    `groupStage.${group.groupName}.${fixtureIndex}.predictedHomeGoals`
                  )}
                  className="w-16 border p-1"
                />

                <span>-</span>

                <input
                  type="number"
                  min="0"
                  {...register(
                    `groupStage.${group.groupName}.${fixtureIndex}.predictedAwayGoals`
                  )}
                  className="w-16 border p-1"
                />

                <span>{fixture.awayTeam}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Features

1. **Dynamic Rendering**
   - Maps over `tournament.groups` array
   - No hardcoded values

2. **Team Display**
   - Shows 4 teams at top of each group
   - Helps users remember who's in the group

3. **Match Inputs**
   - 2 number inputs per match (home/away goals)
   - Min value = 0
   - Connected to React Hook Form via `register()`

4. **Nested Field Names**
   - Example: `groupStage.A.0.predictedHomeGoals`
   - Group A, first fixture, home team goals

---

## 3. KnockoutSection.tsx

**Type:** Client Component (used inside BetForm)

**Purpose:** Render progression-based knockout predictions where users select advancing teams per round.

### Props

```typescript
interface KnockoutSectionProps {
  advancingTeams: string[]; // 32 teams that advanced from group stage
  allTeams: Map<string, string>; // team code → team name mapping
}
```

### How It Works

The knockout section is **staged**:

1. **Round of 32** — Show all 32 advancing teams; user selects 16 for R16
2. **Round of 16** — Show selected 16 teams; user picks 8 for QF
3. **Quarterfinals** — Show 8 teams; user picks 4 for SF
4. **Semifinals** — Show 4 teams; user picks 2 for Final
5. **Final** — Show 2 finalists; user picks champion
6. **Bronze** — Show semifinal losers; user picks bronze winner

Each round only appears when the previous round is complete.

### Code Structure

```typescript
export default function KnockoutSection({
  advancingTeams,
  allTeams
}: KnockoutSectionProps) {
  const { control } = useFormContext<BetInput>();
  const knockoutPredictions = useWatch({
    control,
    name: "predictions.knockout",
  });

  return (
    <div className="space-y-8">
      <h2>Knockout Stage Predictions</h2>

      {/* Round of 32 - Starting point */}
      <RoundOf32Section
        advancingTeams={advancingTeams}
        allTeams={allTeams}
        selectedTeams={knockoutPredictions?.roundOf16 || []}
      />

      {/* Round of 16 - if 16 selected */}
      {knockoutPredictions?.roundOf16?.length === 16 && (
        <ProgressionRound
          roundName="Round of 16"
          nextRoundFieldName="predictions.knockout.quarterfinals"
          eligibleTeams={knockoutPredictions.roundOf16}
          selectCount={8}
          allTeams={allTeams}
        />
      )}

      {/* Similar for QF, SF, Final, Bronze ... */}
    </div>
  );
}
```

### Key Features

1. **Staged Progression**
   - Each round conditionally renders based on previous completion
   - Checkboxes for team selection (R32→R16→QF→SF)
   - Radio buttons for final selection (Final→Bronze)
   - Visual feedback on progress (e.g., "Selected: 16/16")

2. **Team Eligibility**
   - Only teams that advanced from previous round are shown
   - Makes predictions consistent and realistic
   - R32 starts with 32 advancing teams (24 group winners + 8 best 3rd place)

3. **Team Display**
   - Uses `allTeams` Map to show team names alongside codes
   - Reads from left-hand prop passed from BetForm
   - Example: "BRA (Brazil)" instead of just "BRA"

4. **Bronze Medal Flow**
   - After semifinals are selected, shows the 2 semifinal losers
   - User picks the bronze medal winner via radio buttons
   - BronzeSection automatically derives losers from final selections

### Sub-Components

#### RoundOf32Section

- **Purpose:** Starting point for knockout - displays all 32 advancing teams
- **Input Type:** Checkboxes
- **Expected Output:** 16 selected teams in `predictions.knockout.roundOf16`
- **Validation:** Must select exactly 16 teams to proceed
- **Features:**
  - Shows all 32 team names with codes
  - "Select/Deselect All" button for convenience
  - Progress indicator: "Selected: X/16"

#### ProgressionRound

- **Purpose:** Generic component for R16, QF, SF filtering
- **Props:**
  ```typescript
  interface ProgressionRoundProps {
    roundName: "Round of 16" | "Quarterfinals" | "Semifinals";
    nextRoundFieldName:
      | "predictions.knockout.quarterfinals"
      | "predictions.knockout.semifinals"
      | "predictions.knockout.final";
    eligibleTeams: string[]; // teams from previous round
    selectCount: 8 | 4 | 2; // number to select for next round
    allTeams: Map<string, string>;
  }
  ```
- **Input Type:** Checkboxes
- **Conditional Rendering:** Only shows when previous round has correct number of teams
- **Example Flow:**
  - Shows 16 teams from R16
  - User selects 8 for quarterfinals
  - QF only appears when R16 has exactly 16 teams
  - QF shows 8 teams; user selects 4 for SF
  - SF shows 4 teams; user selects 2 for Final

#### FinalSection

- **Purpose:** Championship match prediction
- **Input Type:** Radio buttons
- **Expected Output:** Champion code in `predictions.knockout.champion`
- **Features:**
  - Shows exactly 2 finalist teams
  - Only renders when SF has exactly 2 teams
  - User picks which of the 2 wins the tournament
  - Saves finalist names to `predictions.knockout.final` array

#### BronzeSection

- **Purpose:** Bronze medal (3rd place) match prediction
- **Input Type:** Radio button group
- **Expected Output:**
  ```typescript
  bronze: string; // user's bronze winner team code
  ```
- **How It Works:**
  1. Watches `predictions.knockout.final` (the 2 finalists)
  2. Derives 2 semifinal losers (the teams that lost in SF but weren't finalists)
  3. Displays the two eligible bronze teams
  4. User selects which one wins the bronze medal via radio buttons
  5. Saves selection to `predictions.knockout.bronze`
- **Example:**

  ```
  Semifinals: [TeamA, TeamB, TeamC, TeamD]
  Final (user selects): [TeamA, TeamB]

  Semifinal Losers: TeamC, TeamD
  Bronze Match: TeamC vs TeamD
  User picks: TeamC

  Result: bronze = "TeamC"
  ```

- **Features:**
  - Automatically derives bronze participants from semifinal results
  - Only renders when final has exactly 2 teams
  - Simple radio button UI with clear team names
  - Counts toward total knockout score (1 point if correct)

---

## 4. Leaderboard.tsx

**Type:** Client Component (`"use client"`)

**Purpose:** Display top-scoring bets with usernames, providing visibility into tournament rankings.

### Props

```typescript
interface LeaderboardProps {
  tournamentId: string;
  limit?: number; // Default: 10
}
```

### Key Features

1. **Public Data Fetching**
   - Calls `GET /api/leaderboard?tournamentId=...&limit=...`
   - No authentication required (public read-only endpoint)
   - Auto-fetches on mount and when props change

2. **Loading State**
   - Shows animated spinner during initial fetch
   - Prevents layout shift with consistent container sizing

3. **Error Handling**
   - Displays error message with retry button
   - Logs errors to console for debugging
   - Red-themed error state for visibility

4. **Empty State**
   - Shows helpful message when no scored bets exist
   - Guides users to check back after admin scoring

5. **Leaderboard Table**
   - Columns: Rank, Username, Group Stage Score, Knockout Score, Total Score
   - Rank badge with styled circle background
   - Hover effect on rows for interactivity
   - Responsive table with horizontal scroll on small screens

6. **Manual Refresh**
   - Refresh button at bottom to re-fetch after admin scoring updates
   - Updates leaderboard without page reload

### Code Structure

```typescript
"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalScore: number;
  groupStageScore: number;
  knockoutScore: number;
}

export default function Leaderboard({
  tournamentId,
  limit = 10,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [tournamentId, limit]);

  const fetchLeaderboard = async () => {
    const response = await fetch(
      `/api/leaderboard?tournamentId=${tournamentId}&limit=${limit}`,
    );
    const data = await response.json();
    setLeaderboard(data.leaderboard);
  };

  // Render loading, error, empty, or table state...
}
```

### State Management

- **leaderboard:** Array of ranked entries from API
- **isLoading:** Boolean flag for fetch in progress
- **error:** Error message string or null

### Data Flow

1. Component mounts → `useEffect` triggers `fetchLeaderboard()`
2. Fetch starts → `isLoading = true`
3. API returns data → `setLeaderboard(data.leaderboard)`
4. Fetch completes → `isLoading = false`
5. User clicks refresh → Manual `fetchLeaderboard()` call

### Styling

- Card container: `rounded-lg border border-gray-200 bg-white p-6`
- Table header: `bg-gray-50` with semibold text
- Rank badge: `rounded-full bg-blue-100 text-blue-700`
- Hover effect: `hover:bg-gray-50` on table rows
- Refresh button: `bg-blue-600 hover:bg-blue-700`

### Usage

Rendered on homepage alongside BetForm:

```tsx
// In page.tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-1">
    <Leaderboard tournamentId={tournamentData._id} limit={10} />
  </div>
  <div className="lg:col-span-2">
    <BetForm
      tournamentId={tournamentData._id}
      tournamentData={tournamentData}
    />
  </div>
</div>
```

---

## Component Communication

### Parent → Child (Props)

```
BetForm.tsx
    ↓ (tournament data)
GroupStageSection.tsx

BetForm.tsx
    ↓ (tournament data + register function)
KnockoutSection.tsx
```

### Child → Parent (Form State)

All inputs connected to React Hook Form:

```typescript
register("groupStage.A.0.predictedHomeGoals");
```

Changes automatically update form state in BetForm.

---

## Styling Patterns

### Container

```jsx
<div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
```

- Max width: 1024px
- Centered horizontally
- Padding: 24px
- White background with shadow

### Form Layout

```jsx
<div className="space-y-6">
```

- Vertical spacing between sections

### Input Fields

```jsx
<input
  type="number"
  className="w-16 border border-gray-300 rounded p-1 text-center"
/>
```

- Fixed width for goals inputs
- Centered text
- Border with radius

### Buttons

```jsx
<button
  type="submit"
  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
>
  Save Bet
</button>
```

- Blue background
- White text
- Hover state

---

## Error Handling

### Validation Errors

React Hook Form + Zod automatically provides error messages:

```typescript
{formState.errors.userName && (
  <span className="text-red-500 text-sm">
    {formState.errors.userName.message}
  </span>
)}
```

### Submission Errors

```typescript
const [submitError, setSubmitError] = useState('');

const onSubmit = async (data) => {
  try {
    const response = await fetch('/api/bets', { ... });
    if (!response.ok) {
      setSubmitError('Failed to save bet');
    }
  } catch (error) {
    setSubmitError(error.message);
  }
};
```

---

## Accessibility

### Labels

All inputs have associated labels:

```jsx
<label htmlFor="userName">Your Name:</label>
<input id="userName" {...register('userName')} />
```

### ARIA Attributes

Error messages connected:

```jsx
<input
  aria-invalid={!!formState.errors.userName}
  aria-describedby="userName-error"
/>
<span id="userName-error">{formState.errors.userName?.message}</span>
```

---

## Performance Considerations

### Why React Hook Form?

- **No re-renders:** Inputs are uncontrolled (not using `value` prop)
- **Efficient:** 100+ inputs don't cause performance issues
- **Validation:** Only validates on blur/submit (configurable)

### Conditional Rendering

Knockout section only renders when needed:

```typescript
{isGroupStageComplete() && <KnockoutSection />}
```

Prevents unnecessary DOM creation on initial load.

---

## Testing

### Component Rendering

```typescript
import { render, screen } from '@testing-library/react';

test('renders all groups', () => {
  render(<BetForm tournament={mockTournament} />);
  expect(screen.getByText('Group A')).toBeInTheDocument();
  // ... test for groups B-L
});
```

### Form Submission

```typescript
import { fireEvent, waitFor } from '@testing-library/react';

test('submits bet on form submit', async () => {
  render(<BetForm tournament={mockTournament} />);

  // Fill form...
  fireEvent.click(screen.getByText('Save Bet'));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith('/api/bets', expect.any(Object));
  });
});
```

---

## Future Enhancements

1. **Loading States**
   - Show spinner during submission
   - Disable form while saving

2. **Auto-save**
   - Save draft every 30 seconds
   - Restore on page reload

3. **Visual Progress**
   - Progress bar showing completion %
   - "3 of 12 groups completed"

4. **Team Autocomplete**
   - Dropdown for knockout predictions
   - Prevents typos (e.g., "Brasil" vs "BRA")

---

## Related Documentation

- [Form Logic](./form-logic.md) - Detailed form behavior
- [State Management](./state-management.md) - React Hook Form patterns
- [Architecture Overview](../architecture.md) - Component role in system
