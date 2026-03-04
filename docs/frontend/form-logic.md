# Form Logic Documentation

How the dynamic betting form works, including conditional rendering, dependent fields, and user flow.

## Latest Update: Standings-Driven Group UX

- Group stage defaults use `predictedHomeGoals: 0` and `predictedAwayGoals: 0`.
- Because of that, every group standings table is populated immediately on first render.
- As users edit score inputs, standings recalculate live for that group.
- Each group card now includes both fixtures and a standings table in the same section.
- A bottom table combines all third-placed teams, reusing the same stats and sort rules.

### Current Group Stage Data Path

- Form path: `predictions.groupStage[groupIdx].matches[fixtureIdx]`
- Fields:
  - `predictedHomeGoals`
  - `predictedAwayGoals`

### Current Standings Rules

- Win: `3` points to winner, `0` to loser
- Draw: `1` point to each team
- Ordering: `Pts` → `GD` → `GF` → alphabetical by team name

---

## Form Flow Overview

```
1. Page loads
   ↓
2. Tournament auto-seeds (if needed)
   ↓
3. BetForm initializes with empty state
   ↓
4. User fills group stage predictions (72 matches)
   ↓
5. Knockout section appears when complete
   ↓
6. User fills knockout predictions (31 matches)
   ↓
7. User submits bet
   ↓
8. API validates and saves to MongoDB
   ↓
9. Confirmation shown to user
```

---

## 1. Form Initialization

### Server Component Loads Tournament

**File:** `src/app/page.tsx`

```typescript
export default async function Home() {
  await connectDB();

  // Auto-seed tournament if doesn't exist
  await seedTournament();

  // Fetch tournament
  const tournament = await Tournament.findOne({ year: 2026 }).lean();

  return (
    <main>
      <h1>World Cup 2026 Betting</h1>
      <BetForm tournament={tournament} />
    </main>
  );
}
```

**Key points:**

- Server-side data fetching (no loading state needed)
- Tournament seeded before form renders
- `.lean()` converts Mongoose doc to plain object (required for client components)

### BetForm Default Values

**File:** `src/components/BetForm.tsx`

```typescript
const { register, handleSubmit, watch } = useForm({
  resolver: zodResolver(betValidationSchema),
  defaultValues: {
    userName: "",
    tournamentId: tournament._id,
    groupStage: {
      A: Array(6).fill({
        homeTeam: "",
        awayTeam: "",
        predictedHomeGoals: "",
        predictedAwayGoals: "",
      }),
      // ... groups B-L
    },
    knockout: {
      roundOf32: Array(16).fill({ match: 0, predictedWinnerCode: "" }),
      roundOf16: Array(8).fill({ match: 0, predictedWinnerCode: "" }),
      quarterFinals: Array(4).fill({ match: 0, predictedWinnerCode: "" }),
      semiFinals: Array(2).fill({ match: 0, predictedWinnerCode: "" }),
      final: [{ match: 1, predictedWinnerCode: "" }],
    },
  },
});
```

**Why default values?**

- Pre-populates form structure
- Ensures correct data shape
- Prevents undefined errors

---

## 2. Group Stage Section

### Rendering All Matches

**File:** `src/components/GroupStageSection.tsx`

```typescript
{tournament.groups.map((group, groupIndex) => (
  <div key={group.groupName}>
    <h3>Group {group.groupName}</h3>

    {group.fixtures.map((fixture, fixtureIndex) => (
      <div key={fixtureIndex}>
        <span>{fixture.homeTeam}</span>

        <input
          type="number"
          min="0"
          {...register(
            `groupStage.${group.groupName}.${fixtureIndex}.predictedHomeGoals`,
            { valueAsNumber: true }
          )}
        />

        <span>-</span>

        <input
          type="number"
          min="0"
          {...register(
            `groupStage.${group.groupName}.${fixtureIndex}.predictedAwayGoals`,
            { valueAsNumber: true }
          )}
        />

        <span>{fixture.awayTeam}</span>
      </div>
    ))}
  </div>
))}
```

### Field Naming Convention

**Pattern:** `groupStage.{groupName}.{fixtureIndex}.{fieldName}`

**Examples:**

- `groupStage.A.0.predictedHomeGoals` → Group A, 1st match, home goals
- `groupStage.L.5.predictedAwayGoals` → Group L, 6th match, away goals

**Why this structure?**

- Matches backend data model exactly
- Easy to iterate through when calculating scores
- Natural grouping for validation

### Hidden Fields

Each fixture also registers team names:

```typescript
<input
  type="hidden"
  value={fixture.homeTeam}
  {...register(`groupStage.${group.groupName}.${fixtureIndex}.homeTeam`)}
/>

<input
  type="hidden"
  value={fixture.awayTeam}
  {...register(`groupStage.${group.groupName}.${fixtureIndex}.awayTeam`)}
/>
```

**Purpose:** Backend needs to know which teams the predictions are for.

---

## 3. Conditional Knockout Rendering (Progression-Based)

### Watching Group Stage Completion

**File:** `src/components/BetForm.tsx`

```typescript
// Watch group stage predictions
const groupStageWatch = useWatch({
  control: methods.control,
  name: "predictions.groupStage",
});

// Check if ALL group stage matches have predictions
const isGroupStageFilled =
  groupStageWatch &&
  groupStageWatch.every((group) =>
    group.matches.every(
      (match) => match.predictedHomeGoals >= 0 && match.predictedAwayGoals >= 0,
    ),
  );

// Calculate 32 advancing teams from predictions
const advancingTeams = useMemo(() => {
  if (!isGroupStageFilled || !groupStageWatch) return [];
  return deriveAdvancingTeams(groupStageWatch, tournamentData.groups);
}, [isGroupStageFilled, groupStageWatch, tournamentData.groups]);
```

**Key logic:**

- Validates all 72 group matches have predictions (>= 0 goals)
- Calls `deriveAdvancingTeams()` helper which:
  - Calculates standings for each group (goal difference, goals scored)
  - Identifies top 2 teams from each group (24 teams)
  - Identifies best 8 third-place teams (8 teams)
  - Returns combined 32 advancing teams

### Conditional Rendering

```typescript
return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <GroupStageSection groups={tournamentData.groups} />

    {/* Knockout appears only when:
        1. All group matches are filled, AND
        2. 32 advancing teams were derived */}
    {isGroupStageFilled && advancingTeams.length === 32 && (
      <KnockoutSection
        advancingTeams={advancingTeams}
        allTeams={teamMap}
      />
    )}

    <button type="submit" disabled={isSubmitting || !isGroupStageFilled}>
      Submit Bet
    </button>
  </form>
);
```

---

## 4. Knockout Section (Progression-Based)

### Staged Progression Rendering

**File:** `src/components/KnockoutSection.tsx`

The knockout section renders in stages:

```typescript
export default function KnockoutSection({
  advancingTeams,
  allTeams,
}: KnockoutSectionProps) {
  const { control } = useFormContext<BetInput>();
  const knockoutPredictions = useWatch({
    control,
    name: "predictions.knockout",
  });

  return (
    <div>
      {/* Stage 1: User selects 16 of 32 advancing teams */}
      <RoundOf32Section
        advancingTeams={advancingTeams}
        allTeams={allTeams}
        selectedTeams={knockoutPredictions?.roundOf16 || []}
      />

      {/* Stage 2: Only show R16 if user selected exactly 16 teams */}
      {knockoutPredictions?.roundOf16?.length === 16 && (
        <ProgressionRound
          roundName="Round of 16"
          nextRoundFieldName="predictions.knockout.quarterfinals"
          eligibleTeams={knockoutPredictions.roundOf16}
          selectCount={8}
          allTeams={allTeams}
        />
      )}

      {/* Stage 3: Only show QF if user selected exactly 8 teams */}
      {knockoutPredictions?.quarterfinals?.length === 8 && (
        <ProgressionRound
          roundName="Quarterfinals"
          nextRoundFieldName="predictions.knockout.semifinals"
          eligibleTeams={knockoutPredictions.quarterfinals}
          selectCount={4}
          allTeams={allTeams}
        />
      )}

      {/* Stage 4: Only show SF if user selected exactly 4 teams */}
      {knockoutPredictions?.semifinals?.length === 4 && (
        <ProgressionRound
          roundName="Semifinals"
          nextRoundFieldName="predictions.knockout.final"
          eligibleTeams={knockoutPredictions.semifinals}
          selectCount={2}
          allTeams={allTeams}
        />
      )}

      {/* Stage 5: Final + Bronze (only show if 2 teams selected for SF) */}
      {knockoutPredictions?.final?.length === 2 && (
        <>
          <FinalSection {...} />
          <BronzeSection {...} />
        </>
      )}
    </div>
  );
}
```

### Form Field Structure

**New progression-based structure:**

```typescript
// Old (match-based):
knockout: {
  roundOf32: [{ match: 1, predictedWinnerCode: "BRA" }, ...],
  roundOf16: [{ match: 1, predictedWinnerCode: "FRA" }, ...],
}

// New (progression-based):
knockout: {
  roundOf16: ["BRA", "FRA", "GER", ...],        // 16 teams
  quarterfinals: ["BRA", "FRA", "GER", ...],    // 8 teams
  semifinals: ["BRA", "FRA", "GER", ...],       // 4 teams
  final: ["BRA", "FRA"],                        // 2 teams
  champion: "BRA",                              // 1 team
  bronze: {
    finalist1: "GER",
    finalist2: "NED",
    winner: "NED"
  }
}
```

### Team Eligibility Logic

Each round shows **only teams from the previous round**:

```typescript
// R16 section shows all 32 advancing teams
// User selects 16, stores in roundOf16

// QF section shows the 16 selected in R16
// User selects 8, stores in quarterfinals

// SF section shows the 8 selected in QF
// User selects 4, stores in semifinals

// Final section shows the 4 selected in SF
// User selects 2, stores in final

// Champion: shows 2 finalists, user picks 1
// Bronze: shows 2 SF losers, user picks winner
```

---

## 5. Form Submission

### onSubmit Handler

**File:** `src/components/BetForm.tsx`

```typescript
const [submitting, setSubmitting] = useState(false);
const [submitMessage, setSubmitMessage] = useState("");

const onSubmit = async (data: any) => {
  setSubmitting(true);
  setSubmitMessage("");

  try {
    const response = await fetch("/api/bets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      setSubmitMessage("Bet saved successfully!");
    } else {
      setSubmitMessage(`Error: ${result.error}`);
    }
  } catch (error) {
    setSubmitMessage(`Failed to save: ${error.message}`);
  } finally {
    setSubmitting(false);
  }
};
```

### Submit Button State

```typescript
<button
  type="submit"
  disabled={submitting || !formState.isValid}
  className={`
    px-6 py-2 rounded
    ${submitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}
    text-white
  `}
>
  {submitting ? 'Saving...' : 'Save Bet'}
</button>
```

**Features:**

- Disabled while submitting
- Disabled if form is invalid
- Visual feedback (loading text)

---

## 6. Validation

### Zod Schema

**File:** `src/lib/validationSchemas.ts`

```typescript
const knockoutMatchSchema = z.object({
  match: z.number().int().positive(),
  predictedWinnerCode: z.string().min(3).max(3),
});

const betValidationSchema = z.object({
  userName: z.string().min(1, "Name is required"),
  tournamentId: z.string().min(1),
  groupStage: z.record(
    z.array(
      z.object({
        homeTeam: z.string(),
        awayTeam: z.string(),
        predictedHomeGoals: z.number().int().min(0),
        predictedAwayGoals: z.number().int().min(0),
      }),
    ),
  ),
  knockout: z.object({
    roundOf32: z.array(knockoutMatchSchema).length(16),
    roundOf16: z.array(knockoutMatchSchema).length(8),
    quarterFinals: z.array(knockoutMatchSchema).length(4),
    semiFinals: z.array(knockoutMatchSchema).length(2),
    final: z.array(knockoutMatchSchema).length(1),
  }),
});
```

### Validation Triggers

**Default mode:** Validates on submit

**Can configure:**

```typescript
useForm({
  mode: "onBlur", // Validate when user leaves field
  // or
  mode: "onChange", // Validate on every keystroke (not recommended for large forms)
});
```

### Error Display

```typescript
{formState.errors.userName && (
  <p className="text-red-500 text-sm mt-1">
    {formState.errors.userName.message}
  </p>
)}
```

---

## 7. Data Transformation

### Form Data → API Payload

React Hook Form automatically creates nested object:

```javascript
// Form data
{
  userName: "Micke",
  tournamentId: "670f1234...",
  groupStage: {
    A: [
      { homeTeam: "MEX", awayTeam: "USA", predictedHomeGoals: 2, predictedAwayGoals: 1 },
      // ... 5 more matches
    ],
    B: [...],
    // ... groups C-L
  },
  knockout: {
    roundOf32: [
      { match: 1, predictedWinnerCode: "BRA" },
      // ... 15 more
    ],
    // ... other rounds
  }
}
```

**No transformation needed** — structure matches backend schema exactly.

---

## 8. User Experience Flow

### Happy Path

1. User visits page
2. Sees 12 group sections
3. Fills predictions for each match (can do one group at a time)
4. After all 72 matches filled, knockout section appears
5. Fills knockout predictions
6. Clicks "Save Bet"
7. Sees success message

### Error Scenarios

**Scenario 1: Missing fields**

- User tries to submit without filling all fields
- Validation errors appear next to empty inputs
- Form doesn't submit

**Scenario 2: Invalid values**

- User enters negative goals
- Zod validation catches it
- Error message: "Goals must be >= 0"

**Scenario 3: Network error**

- API request fails
- Error message displayed
- User can retry

---

## 9. Advanced Features (Future)

### Auto-save Draft

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    const currentData = getValues(); // Get all form data
    localStorage.setItem("draft-bet", JSON.stringify(currentData));
  }, 5000); // Save every 5 seconds

  return () => clearTimeout(timer);
}, [watch()]); // Re-run when form changes
```

### Restore Draft

```typescript
useEffect(() => {
  const draft = localStorage.getItem("draft-bet");
  if (draft) {
    const data = JSON.parse(draft);
    reset(data); // Populate form with draft
  }
}, []);
```

### Progress Indicator

```typescript
const calculateProgress = (): number => {
  let filled = 0;
  const total = 72 + 31; // Group + knockout matches

  // Count filled group matches
  for (const groupName in groupStageData) {
    groupStageData[groupName].forEach(match => {
      if (match.predictedHomeGoals !== '' && match.predictedAwayGoals !== '') {
        filled++;
      }
    });
  }

  // Count filled knockout matches
  // ... similar logic

  return Math.round((filled / total) * 100);
};

// Render
<div className="mb-4">
  <div className="bg-gray-200 h-2 rounded">
    <div
      className="bg-blue-500 h-2 rounded"
      style={{ width: `${calculateProgress()}%` }}
    />
  </div>
  <p className="text-sm text-gray-600 mt-1">
    {calculateProgress()}% complete
  </p>
</div>
```

---

## 10. Performance Considerations

### Why React Hook Form?

**Problem with useState:**

```typescript
// This would cause 100+ re-renders!
const [matches, setMatches] = useState({});

const handleChange = (group, index, field, value) => {
  setMatches({
    ...matches,
    [group]: {
      ...matches[group],
      [index]: {
        ...matches[group][index],
        [field]: value,
      },
    },
  });
}; // Re-renders entire form on EVERY keystroke
```

**React Hook Form solution:**

- Uncontrolled inputs (not tied to state)
- Only re-renders when needed (validation, submission)
- Efficient for large forms

### Memoization

If performance issues arise:

```typescript
const GroupStageSection = React.memo(({ tournament, register }) => {
  // Component code
});
```

Prevents unnecessary re-renders when props haven't changed.

---

## Related Documentation

- [Components](./components.md) - Component architecture
- [State Management](./state-management.md) - React Hook Form patterns
- [API Routes](../backend/api-routes.md) - Where form data goes
