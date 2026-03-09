# State Management Documentation

How state is managed in the World Cup betting app using React Hook Form.

## Latest Update: Live Standings State Flow

- `GroupStageSection.tsx` uses `useWatch({ name: "predictions.groupStage" })` to subscribe to group scores.
- Standings are derived state (computed with `useMemo`) from watched form values.
- No separate standings state is stored in React; standings are recalculated from form data.
- This keeps a single source of truth: React Hook Form values.

### Current Implementation Pattern

1. User changes a score input in group stage.
2. React Hook Form updates `predictions.groupStage`.
3. `useWatch` receives updated values.
4. `calculateGroupStandings(...)` recalculates that group table.
5. `calculateThirdPlaceStandings(...)` recalculates the combined third-place table.
6. UI rerenders with updated ordering/stats.

---

## State Management Overview

### Minimal Global State

**Phase 1** uses a simple, localized approach:

- **Server state:** MongoDB (tournaments, bets, solutions)
- **Form state:** React Hook Form (all user inputs)
- **Auth state:** AuthContext (`AuthProvider`, `useAuth`)
- **UI state:** React useState (loading, errors, messages)

No Redux/Zustand is used. Context is used only for shared authentication state.

### AuthContext Flow

Authentication state is shared globally through `src/context/AuthContext.tsx`:

- `AuthProvider` wraps the app in `src/app/layout.tsx`
- `useAuth()` exposes `authUser`, `isAuthLoading`, `refreshAuth`
- `Header.tsx` and `BetForm.tsx` consume the same auth state
- `refreshAuth()` fetches `/api/auth/me` and updates context state

---

## 1. React Hook Form Basics

### Initialization

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const {
  register, // Connect inputs to form
  handleSubmit, // Form submission handler
  watch, // Observe field values
  formState, // Form state (errors, validity, etc.)
  getValues, // Get current values
  setValue, // Set values programmatically
  reset, // Reset form to defaults
} = useForm({
  resolver: zodResolver(betValidationSchema),
  defaultValues: {
    /* ... */
  },
});
```

### Key Concepts

**Uncontrolled inputs:** Unlike traditional React forms, inputs are not controlled by state.

```typescript
// ❌ Traditional (causes re-renders)
const [name, setName] = useState('');
<input value={name} onChange={e => setName(e.target.value)} />

// ✅ React Hook Form (no re-renders)
<input {...register('name')} />
```

**Benefits:**

- Better performance (especially with 100+ inputs)
- Less boilerplate code
- Built-in validation

---

## 2. Registering Inputs

### Basic Registration

```typescript
<input {...register('userName')} />
```

Expands to:

```typescript
<input
  name="userName"
  ref={/* internal ref */}
  onChange={/* internal handler */}
  onBlur={/* internal handler */}
/>
```

### Registration with Options

```typescript
<input
  type="number"
  {...register('groupStage.A.0.predictedHomeGoals', {
    valueAsNumber: true,  // Convert string to number
    min: 0,               // Validation
    required: true
  })}
/>
```

### Dynamic Field Names

```typescript
{tournament.groups.map((group, groupIndex) =>
  group.fixtures.map((fixture, fixtureIndex) => (
    <input
      {...register(
        `groupStage.${group.groupName}.${fixtureIndex}.predictedHomeGoals`
      )}
    />
  ))
)}
```

**Result:** 72 inputs all registered with unique paths like:

- `groupStage.A.0.predictedHomeGoals`
- `groupStage.A.1.predictedHomeGoals`
- `groupStage.B.0.predictedHomeGoals`
- etc.

---

## 3. Watching Values

### Watch Specific Field

```typescript
const userName = watch('userName');

// Use in component
<p>Hello, {userName}!</p>
```

### Watch Multiple Fields

```typescript
const [homeGoals, awayGoals] = watch([
  "groupStage.A.0.predictedHomeGoals",
  "groupStage.A.0.predictedAwayGoals",
]);

// Show predicted result
const result =
  homeGoals > awayGoals
    ? "Home win"
    : homeGoals < awayGoals
      ? "Away win"
      : "Draw";
```

### Watch Entire Object

```typescript
const groupStageData = watch('groupStage');

// Use for conditional rendering
{isGroupStageComplete(groupStageData) && (
  <KnockoutSection />
)}
```

### Watch All Fields

```typescript
const allValues = watch();

useEffect(() => {
  console.log("Form changed:", allValues);
  // Auto-save draft, etc.
}, [allValues]);
```

**Performance note:** Watching causes re-renders on every change. Use sparingly.

---

## 4. Form State

### Accessing Form State

```typescript
const { formState } = useForm();

console.log(formState.errors); // Validation errors
console.log(formState.isDirty); // True if any field changed
console.log(formState.isValid); // True if no errors
console.log(formState.isSubmitting); // True during submit
console.log(formState.touchedFields); // Fields user interacted with
```

### Using Form State in UI

```typescript
<button
  type="submit"
  disabled={!formState.isValid || formState.isSubmitting}
>
  {formState.isSubmitting ? 'Saving...' : 'Save Bet'}
</button>
```

### Error Display

```typescript
{formState.errors.userName && (
  <span className="text-red-500">
    {formState.errors.userName.message}
  </span>
)}

{formState.errors.groupStage?.A?.[0]?.predictedHomeGoals && (
  <span className="text-red-500">
    Must be a positive number
  </span>
)}
```

---

## 5. Validation

### Zod Integration

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { betValidationSchema } from "@/lib/validationSchemas";

const { register, handleSubmit } = useForm({
  resolver: zodResolver(betValidationSchema),
});
```

### Validation Schema

**File:** `src/lib/validationSchemas.ts`

```typescript
export const betValidationSchema = z.object({
  userName: z.string().min(1, "Name is required"),
  tournamentId: z.string().min(1),
  groupStage: z.record(
    z.array(
      z.object({
        homeTeam: z.string(),
        awayTeam: z.string(),
        predictedHomeGoals: z.number().int().min(0, "Goals must be >= 0"),
        predictedAwayGoals: z.number().int().min(0, "Goals must be >= 0"),
      }),
    ),
  ),
  knockout: z.object({
    roundOf32: z
      .array(
        z.object({
          match: z.number(),
          predictedWinnerCode: z.string().length(3, "Use 3-letter code"),
        }),
      )
      .length(16, "Round of 32 must have 16 matches"),
  }),
});
```

### Validation Modes

```typescript
useForm({
  mode: "onSubmit", // Default - validate on submit
  mode: "onBlur", // Validate when field loses focus
  mode: "onChange", // Validate on every keystroke
  mode: "onTouched", // Validate after field is touched
  mode: "all", // Validate on blur and change
});
```

**Recommendation for this app:** `onSubmit` (default) to avoid performance issues with 100+ inputs.

---

## 6. Form Submission

### handleSubmit Wrapper

```typescript
const onSubmit = async (data: any) => {
  console.log('Valid data:', data);
  // API call...
};

<form onSubmit={handleSubmit(onSubmit)}>
  {/* inputs */}
</form>
```

**How it works:**

1. User clicks submit
2. `handleSubmit` validates all fields
3. If validation fails, errors set in `formState.errors`
4. If validation passes, `onSubmit` called with data

### Error Handling in Submit

```typescript
const onSubmit = async (data: any) => {
  try {
    const response = await fetch("/api/bets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save bet");
    }

    const result = await response.json();
    alert("Bet saved!");
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

---

## 7. Programmatic Updates

### Set Single Value

```typescript
setValue("userName", "Micke");
setValue("groupStage.A.0.predictedHomeGoals", 2);
```

### Set Multiple Values

```typescript
setValue("knockout.final.0.predictedWinnerCode", "BRA", {
  shouldValidate: true, // Trigger validation
  shouldDirty: true, // Mark as dirty
  shouldTouch: true, // Mark as touched
});
```

### Get Values

```typescript
// Get single value
const userName = getValues("userName");

// Get all values
const allData = getValues();

// Get nested values
const groupA = getValues("groupStage.A");
```

### Reset Form

```typescript
// Reset to default values
reset();

// Reset to specific values
reset({
  userName: "New User",
  groupStage: {
    /* ... */
  },
});

// Reset specific field
reset(
  { userName: "Micke" },
  {
    keepValues: true, // Keep other values
    keepErrors: true, // Keep existing errors
  },
);
```

---

## 8. Conditional Logic

### Show/Hide Sections Based on Values

```typescript
const groupStageData = watch('groupStage');

const isGroupStageComplete = (): boolean => {
  if (!groupStageData) return false;

  for (const groupName in groupStageData) {
    const matches = groupStageData[groupName];

    if (!matches || matches.length !== 6) return false;

    for (const match of matches) {
      if (
        match.predictedHomeGoals === '' ||
        match.predictedAwayGoals === ''
      ) {
        return false;
      }
    }
  }

  return true;
};

return (
  <form>
    <GroupStageSection />

    {isGroupStageComplete() && (
      <KnockoutSection />
    )}
  </form>
);
```

### Enable/Disable Submit

```typescript
<button
  type="submit"
  disabled={!isGroupStageComplete() || formState.isSubmitting}
>
  Save Bet
</button>
```

---

## 9. Default Values Strategy

### Why Set Default Values?

```typescript
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
```

**Benefits:**

1. Form knows expected structure
2. Prevents undefined errors
3. Enables proper validation
4. TypeScript inferrence works better

### Dynamic Default Values

```typescript
const createGroupStageDefaults = (tournament: ITournament) => {
  const defaults: any = {};

  tournament.groups.forEach((group) => {
    defaults[group.groupName] = group.fixtures.map((fixture) => ({
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      predictedHomeGoals: "",
      predictedAwayGoals: "",
    }));
  });

  return defaults;
};

const { register } = useForm({
  defaultValues: {
    groupStage: createGroupStageDefaults(tournament),
  },
});
```

---

## 10. Advanced Patterns

### Field Arrays (Alternative Approach)

**Current:** Using `register()` with dynamic names

**Alternative:** `useFieldArray` hook

```typescript
const { fields, append, remove } = useFieldArray({
  control,
  name: 'groupStage.A'
});

{fields.map((field, index) => (
  <div key={field.id}>
    <input {...register(`groupStage.A.${index}.predictedHomeGoals`)} />
    <button onClick={() => remove(index)}>Remove</button>
  </div>
))}
```

**When to use:**

- Dynamic lists (add/remove items)
- Reordering items

**Not needed for this app:** Match count is fixed.

### Form Context

**For deeply nested components:**

```typescript
import { FormProvider, useFormContext } from 'react-hook-form';

// In parent
const methods = useForm();

<FormProvider {...methods}>
  <NestedComponent />
</FormProvider>

// In child (no need to pass register as prop)
const NestedComponent = () => {
  const { register } = useFormContext();

  return <input {...register('field')} />;
};
```

**Not needed for this app:** Only 2 levels of nesting, passing props is simpler.

---

## 11. Performance Optimization

### Avoid Unnecessary Watches

```typescript
// ❌ Bad - re-renders on every keystroke
const allValues = watch();

useEffect(() => {
  console.log("Form changed");
}, [allValues]);

// ✅ Good - only watch what you need
const userName = watch("userName");

useEffect(() => {
  console.log("Name changed:", userName);
}, [userName]);
```

### Memoize Computed Values

```typescript
const isComplete = useMemo(() => {
  return isGroupStageComplete(watch("groupStage"));
}, [watch("groupStage")]);
```

### Debounce Auto-save

```typescript
import { debounce } from "lodash";

const autoSave = useMemo(
  () =>
    debounce((data) => {
      localStorage.setItem("draft", JSON.stringify(data));
    }, 1000),
  [],
);

useEffect(() => {
  const subscription = watch((data) => {
    autoSave(data);
  });

  return () => subscription.unsubscribe();
}, [watch, autoSave]);
```

---

## 12. Local UI State (useState)

### Loading State

```typescript
const [submitting, setSubmitting] = useState(false);

const onSubmit = async (data: any) => {
  setSubmitting(true);
  try {
    await fetch("/api/bets", {
      /* ... */
    });
  } finally {
    setSubmitting(false);
  }
};
```

### Success/Error Messages

```typescript
const [message, setMessage] = useState<{
  type: 'success' | 'error';
  text: string;
} | null>(null);

const onSubmit = async (data: any) => {
  try {
    // ...
    setMessage({ type: 'success', text: 'Bet saved!' });
  } catch (error) {
    setMessage({ type: 'error', text: error.message });
  }
};

// Render
{message && (
  <div className={message.type === 'success' ? 'text-green-500' : 'text-red-500'}>
    {message.text}
  </div>
)}
```

### Modal/Dialog State

```typescript
const [showConfirmation, setShowConfirmation] = useState(false);

const handleSubmitClick = () => {
  setShowConfirmation(true);
};

const confirmSubmit = () => {
  handleSubmit(onSubmit)();
  setShowConfirmation(false);
};
```

---

## 13. TypeScript Integration

### Type-safe Form Data

```typescript
import { IBet } from "@/types";

const { register, handleSubmit } = useForm<IBet>({
  resolver: zodResolver(betValidationSchema),
});

const onSubmit = (data: IBet) => {
  // data is fully typed
  console.log(data.userName); // ✓ TypeScript knows this exists
};
```

### Type-safe Field Names

```typescript
type FormFields = keyof IBet;

const fieldName: FormFields = "userName"; // ✓ Valid
const invalid: FormFields = "wrongField"; // ✗ TypeScript error
```

---

## 14. Common Patterns

### Read-only Preview

```typescript
const formData = watch();

<div className="border p-4 mt-4">
  <h3>Preview</h3>
  <p>Name: {formData.userName}</p>
  <p>Group A Match 1: {formData.groupStage?.A?.[0]?.predictedHomeGoals} -
     {formData.groupStage?.A?.[0]?.predictedAwayGoals}</p>
</div>
```

### Clear Form

```typescript
<button onClick={() => reset()}>
  Clear All Predictions
</button>
```

### Copy from Another Bet

```typescript
const loadExistingBet = async () => {
  const response = await fetch("/api/bets?userName=Micke");
  const { bet } = await response.json();

  reset({
    userName: "", // Clear name
    tournamentId: bet.tournamentId,
    groupStage: bet.groupStage, // Copy predictions
    knockout: bet.knockout,
  });
};
```

---

## State Flow Diagram

```
User Interaction
    ↓
Input Field (registered with React Hook Form)
    ↓
Form State Updated (internal, no re-render)
    ↓
watch() observes changes (causes re-render if used)
    ↓
Validation runs (based on mode)
    ↓
formState.errors updated
    ↓
UI reflects errors
    ↓
User submits
    ↓
handleSubmit validates
    ↓
If valid: onSubmit() called
    ↓
API request
    ↓
useState updates (loading, message)
    ↓
UI feedback
```

---

## Related Documentation

- [Components](./components.md) - Where state is used
- [Form Logic](./form-logic.md) - Conditional rendering based on state
- [API Routes](../backend/api-routes.md) - Where form data goes
