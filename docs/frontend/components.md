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
    ↓
BetForm.tsx (Client Component)
    ├── GroupStageSection.tsx
    └── KnockoutSection.tsx
```

---

## 1. BetForm.tsx

**Type:** Client Component (`"use client"`)

**Purpose:** Main form container that orchestrates the entire betting experience.

### Props

```typescript
interface BetFormProps {
  tournament: ITournament;
}
```

Receives the seeded tournament structure from `page.tsx`.

### Key Features

1. **React Hook Form Integration**
   - Manages 100+ form inputs efficiently
   - Provides validation and error handling
   - Tracks form state (dirty, touched, etc.)

2. **Conditional Rendering**
   - Knockout section only appears after group stage is filled
   - Uses `watch()` to observe group stage completion

3. **Form Submission**
   - Sends POST request to `/api/bets`
   - Handles success/error states
   - Displays confirmation messages

### Code Structure

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { betValidationSchema } from '@/lib/validationSchemas';

export default function BetForm({ tournament }: BetFormProps) {
  // 1. Initialize form
  const { register, handleSubmit, watch, formState } = useForm({
    resolver: zodResolver(betValidationSchema),
    defaultValues: {
      userName: '',
      tournamentId: tournament._id,
      groupStage: {},
      knockout: {
        roundOf32: [],
        roundOf16: [],
        quarterFinals: [],
        semiFinals: [],
        final: []
      }
    }
  });

  // 2. Watch group stage to conditionally render knockout
  const groupStageData = watch('groupStage');

  // 3. Check if all group matches are predicted
  const isGroupStageComplete = () => {
    // Logic to verify all 72 matches have predictions
  };

  // 4. Handle form submission
  const onSubmit = async (data: any) => {
    const response = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    // Handle response...
  };

  // 5. Render form sections
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('userName')} />

      <GroupStageSection
        tournament={tournament}
        register={register}
      />

      {isGroupStageComplete() && (
        <KnockoutSection
          tournament={tournament}
          register={register}
        />
      )}

      <button type="submit">Save Bet</button>
    </form>
  );
}
```

### State Management

**No useState needed** — React Hook Form manages all state internally:

- Input values
- Validation errors
- Touched/dirty fields
- Form submission state

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

**Purpose:** Renders 5 knockout rounds with winner predictions.

### Props

```typescript
interface KnockoutSectionProps {
  tournament: ITournament;
  register: UseFormRegister<any>;
}
```

### Code Structure

```typescript
export default function KnockoutSection({
  tournament,
  register
}: KnockoutSectionProps) {
  const knockoutRounds = [
    { key: 'roundOf32', label: 'Round of 32', count: 16 },
    { key: 'roundOf16', label: 'Round of 16', count: 8 },
    { key: 'quarterFinals', label: 'Quarter Finals', count: 4 },
    { key: 'semiFinals', label: 'Semi Finals', count: 2 },
    { key: 'final', label: 'Final', count: 1 }
  ];

  return (
    <div className="border-t pt-6 mt-6">
      <h2>Knockout Stage Predictions</h2>
      <p className="text-sm text-gray-600 mb-4">
        Predict which team will win each knockout match
      </p>

      {knockoutRounds.map(round => (
        <div key={round.key} className="mb-6">
          <h3>{round.label}</h3>

          <div className="space-y-2">
            {Array.from({ length: round.count }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <label>Match {index + 1}:</label>

                <input
                  type="text"
                  placeholder="Team code (e.g., BRA)"
                  {...register(
                    `knockout.${round.key}.${index}.predictedWinnerCode`
                  )}
                  className="border p-2 uppercase"
                />
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

1. **Structured Rounds**
   - Array defines each round's metadata
   - Easy to add/remove rounds

2. **Dynamic Match Count**
   - Round of 32: 16 inputs
   - Round of 16: 8 inputs
   - Quarter Finals: 4 inputs
   - Semi Finals: 2 inputs
   - Final: 1 input

3. **Text Inputs**
   - Users enter team codes (e.g., "BRA", "ARG")
   - `uppercase` CSS class for consistency

4. **Hidden Field**
   - Each input also registers `match` number:
   ```typescript
   <input type="hidden" value={index + 1}
     {...register(`knockout.${round.key}.${index}.match`)} />
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
