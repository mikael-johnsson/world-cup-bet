# GroupManagement Component Documentation

**File:** `src/components/GroupManagement.tsx`

**Type:** Client Component (`"use client"`)

**Purpose:** Provides UI for users to create a new betting group with a password or join an existing group by selecting from a dropdown and entering the password. Integrates with the auth context and updates the user's group membership.

---

## Props

```typescript
interface GroupManagementProps {
  onGroupUpdated?: () => void; // Optional callback after successful group change
}
```

---

## Component Features

### 1. Two Interaction Modes

The component switches between two views based on user intent:

#### **Mode A: Create New Group**

- **Input fields:**
  - Group name input (max 50 characters, supports Unicode/accented characters)
  - Password input (min 6 characters, required)
- **Behavior:**
  - Allows user to create a brand new group
  - If group name doesn't exist yet in database, the backend creates it with the provided password
  - On success, user is automatically added to the new group
  - Form clears on success

#### **Mode B: Join Existing Group**

- **Input fields:**
  - Group dropdown (populated from `GET /api/groups`)
  - Password input (required to verify membership)
- **Behavior:**
  - Lists all available groups from the database
  - User selects a group and enters its password
  - Backend verifies password before allowing join
  - On success, user is added to the group's membership
  - Form clears on success
  - Shows specific error if password is wrong (403 error)

### 2. Form State Management

Uses React Hook Form for:

- **Validation:**
  - Group name: Required, max 50 characters
  - Password: Required, min 6 characters
- **Error display:** Shows validation errors below each field
- **Submission state:** Disables submit button while request is in flight
- **Loading spinner:** Shows during API call

### 3. API Integration

**Create Group Request:**

```json
PUT /api/user/group
{
  "groupName": "Friends 2026",
  "password": "secret-password"
}
```

**Join Group Request:**

```json
PUT /api/user/group
{
  "groupName": "Friends 2026",
  "password": "correct-password"
}
```

**Success Response (both create and join):**

```json
{
  "success": true,
  "action": "created",
  "group": {
    "id": "507f1f77bcf86cd799439033",
    "name": "Friends 2026"
  }
}
```

**Error Responses:**

- **401:** User not authenticated
- **403:** Invalid password for existing group
- **400:** Validation error (name too long, password too short, etc)

### 4. Tab/Mode Switching

- **Buttons:** Two tabs to switch between "Create" and "Join" modes
- **Active state styling:** Current mode highlighted with dark background
- **Content swaps:** Form fields change based on selected mode

### 5. Groups Dropdown (Join Mode)

- **Data source:** Fetches from `GET /api/groups` on component mount
- **Format:** Displays group names in alphabetical order
- **Option structure:** Each option is a group name (backend returns both id and name)
- **Loading:** Shows spinner while groups are being fetched
- **Fallback:** Shows message if no groups are available

### 6. Success/Error Feedback

- **Success message:** Green toast or inline message confirming group created/joined
- **Error message:** Red toast showing specific error (wrong password, validation error, etc)
- **Auto-clear:** Messages disappear after 4-5 seconds or on new interaction
- **Password-specific error:** Special message if 403 error (wrong password)

### 7. Post-Success Behavior

After successful create or join:

1. User's group membership is updated server-side
2. Form fields are cleared
3. Optional `onGroupUpdated()` callback is invoked
4. Auth context is refreshed (if needed) to reflect new group
5. Parent component can refresh UI (e.g., leaderboard re-filters by new group)

---

## Code Structure

```typescript
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGroupSchema, joinGroupSchema } from "@/lib/validationSchemas";
import { useAuth } from "@/context/AuthContext";

export default function GroupManagement({
  onGroupUpdated,
}: GroupManagementProps) {
  const { authUser, refreshAuth } = useAuth();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch available groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("/api/groups");
        const data = await res.json();
        setGroups(data.groups || []);
      } catch (error) {
        setMessage({
          type: "error",
          text: "Failed to load groups",
        });
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Create mode form
  const createForm = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { groupName: "", password: "" },
  });

  // Join mode form
  const joinForm = useForm({
    resolver: zodResolver(joinGroupSchema),
    defaultValues: { groupName: "", password: "" },
  });

  const handleSubmit = async (data: {
    groupName: string;
    password: string;
  }) => {
    try {
      const response = await fetch("/api/user/group", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();

        if (response.status === 403) {
          setMessage({
            type: "error",
            text: "Incorrect password for this group",
          });
        } else {
          setMessage({
            type: "error",
            text: error.error || "Failed to update group",
          });
        }
        return;
      }

      const result = await response.json();

      setMessage({
        type: "success",
        text: `${
          result.action === "created" ? "Group created" : "Joined group"
        } successfully!`,
      });

      // Clear forms
      createForm.reset();
      joinForm.reset();

      // Refresh auth if needed
      if (refreshAuth) {
        await refreshAuth();
      }

      // Call optional callback
      onGroupUpdated?.();

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    }
  };

  if (!authUser) {
    return <p>Please login to manage groups</p>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Betting Group</h2>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("create")}
          className={`flex-1 py-2 rounded ${
            mode === "create"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Create
        </button>
        <button
          onClick={() => setMode("join")}
          className={`flex-1 py-2 rounded ${
            mode === "join"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Join
        </button>
      </div>

      {/* Create mode form */}
      {mode === "create" && (
        <form
          onSubmit={createForm.handleSubmit((data) =>
            handleSubmit(data)
          )}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g., Friends 2026"
              maxLength="50"
              {...createForm.register("groupName")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {createForm.formState.errors.groupName && (
              <p className="text-red-600 text-sm mt-1">
                {createForm.formState.errors.groupName.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Min 6 characters"
              {...createForm.register("password")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {createForm.formState.errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {createForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={createForm.formState.isSubmitting}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {createForm.formState.isSubmitting ? "Creating..." : "Create Group"}
          </button>
        </form>
      )}

      {/* Join mode form */}
      {mode === "join" && (
        <form
          onSubmit={joinForm.handleSubmit((data) =>
            handleSubmit(data)
          )}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Group
            </label>
            {groupsLoading ? (
              <p className="text-gray-500">Loading groups...</p>
            ) : (
              <select
                {...joinForm.register("groupName")}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}
            {joinForm.formState.errors.groupName && (
              <p className="text-red-600 text-sm mt-1">
                {joinForm.formState.errors.groupName.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Group password"
              {...joinForm.register("password")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {joinForm.formState.errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {joinForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={joinForm.formState.isSubmitting}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {joinForm.formState.isSubmitting ? "Joining..." : "Join Group"}
          </button>
        </form>
      )}

      {/* Feedback messages */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
```

---

## Validation

Uses schemas from `src/lib/validationSchemas.ts`:

```typescript
export const createGroupSchema = z.object({
  groupName: groupNameSchema, // max 50, Unicode-aware pattern
  password: groupPasswordSchema, // min 6, max 100
});

export const joinGroupSchema = z.object({
  groupName: groupNameSchema,
  password: groupPasswordSchema,
});
```

---

## Usage Example

**On the homepage or modal:**

```tsx
import GroupManagement from "@/components/GroupManagement";

export default function HomePage() {
  const handleGroupUpdated = () => {
    console.log("Group was updated, refresh leaderboard");
    // Re-fetch leaderboard or trigger parent update
  };

  return (
    <div>
      <GroupManagement onGroupUpdated={handleGroupUpdated} />
    </div>
  );
}
```

---

## Related Files

- **API route:** `src/app/api/user/group/route.ts` (PUT handler)
- **Schemas:** `src/lib/validationSchemas.ts` (createGroupSchema, joinGroupSchema)
- **Auth context:** `src/context/AuthContext.tsx` (useAuth hook)
- **Groups endpoint:** `src/app/api/groups/route.ts` (GET list of groups)
