# Planning during development

## Plan: OpenAI Chatbot Integration

Implement an authenticated chatbot flow embedded on the home page using a new protected Next.js API route that calls your OpenAI custom agent through the OpenAI SDK, with non-streaming responses and no database persistence in v1. This approach reuses the existing auth guard, API response style, and frontend state patterns so the first version is simple, testable, and easy for a junior developer to extend.

### Steps

1. Phase 1: Backend contract and configuration
2. Define the API contract for POST /api/chat with request shape `{ message: string }` and response shape `{ success: true, reply: string }` plus standardized error payloads. Include validation limits such as min length 1 and max length around 2000.
3. Add OpenAI environment variables in .env.local and document them in README/docs: OPENAI_API_KEY and one identifier for your custom agent/workflow such as OPENAI_AGENT_ID.
4. Install the official SDK dependency openai and verify the project still builds.

5. Phase 2: Backend implementation for /api/chat
6. Add a Zod schema for chat input in src/lib/validationSchemas.ts to keep validation conventions consistent.
7. Create src/app/api/chat/route.ts using existing route patterns.
8. Authenticate with requireUser(request) from src/lib/authGuards.ts.
9. Parse and validate request body with the new schema.
10. Call OpenAI SDK server-side with your custom agent identifier and user message.
11. Return JSON using existing success/error style and HTTP status codes: 401 unauthenticated, 400 validation, 500 provider/server failures.
12. Implement defensive error mapping for OpenAI errors and log technical details server-side.
13. Keep v1 stateless with no MongoDB chat persistence.

14. Phase 3: Frontend chat UI embedded on home page
15. Create a client component at src/components/ChatPanel.tsx with message list rendering, text input, and send button.
16. Implement submit flow: append optimistic user message, call POST /api/chat, append assistant reply on success, append error bubble on failure.
17. Disable input/button while pending to prevent duplicate submissions.
18. Reuse existing UX patterns and keep styling in Tailwind.
19. Integrate ChatPanel into src/app/page.tsx while preserving Bet + Leaderboard usability on desktop and mobile.

20. Phase 4: Auth-aware behavior and usability polish
21. Gate chat UI with useAuth() from src/context/AuthContext.tsx.
22. Show loading state while auth resolves.
23. If not logged in, show compact login/register prompt instead of chat input.
24. Add trim-before-submit, optional max character count, and auto-scroll on new messages.
25. Ensure accessibility basics: Enter submit, labels, readable status text.

26. Phase 5: Documentation updates
27. Update .github/docs/backend/api-routes.md with new /api/chat endpoint contract, auth requirement, and sample responses.
28. Update .github/docs/frontend/components.md and/or .github/docs/frontend/state-management.md with chat component responsibilities and local state flow.
29. Add architecture note in .github/docs/architecture.md if needed.

30. Phase 6: Verification
31. Logged-out POST /api/chat returns 401.
32. Logged-in valid message returns 200 plus reply.
33. Empty message returns 400.
34. Simulated provider failure returns controlled 500 error payload.
35. UI verification: user can type, click Send, and see assistant response bubble.
36. Pending state disables controls and prevents duplicate sends.
37. Embedded layout works on mobile and desktop.
38. Existing auth and betting flow still work.
39. Run lint/build checks to confirm no regressions.

### Relevant files

1. src/app/api/chat/route.ts for new protected chat endpoint.
2. src/lib/validationSchemas.ts for chat schema.
3. src/components/ChatPanel.tsx for new chat UI.
4. src/app/page.tsx for embedding the chat component.
5. src/context/AuthContext.tsx for auth gating behavior.
6. .github/docs/backend/api-routes.md for backend docs.
7. .github/docs/frontend/components.md for frontend component docs.
8. .github/docs/frontend/state-management.md for state flow docs.
9. .env.local for OpenAI configuration.

### Decisions

1. Included scope: chat on home page, non-streaming response, auth required, no persistence in v1.
2. Excluded scope: streaming responses, MongoDB chat history, multi-thread conversation management, admin analytics/moderation.

---

## Plan: Group as Its Own Model (Password Required for Create and Join)

Refactor the current user-level group string into a dedicated Group model with password-protected create/join flows. Keep the existing leaderboard behavior (users only see their own group leaderboard), auto-assign new users to a built-in default group, and ship this in very small, low-risk steps.

### Tiny implementation slices

1. Slice 1: Finalize response contract before coding
2. Decide and document one JSON shape for group responses used by frontend and backend (for example include groupId and name).
3. Keep old response keys only if needed during transition.

#### Step 1 output: API contract to implement in later slices

Use one shared GroupSummary shape across routes:

```json
{
  "id": "groupObjectId",
  "name": "Friends 2026"
}
```

Route contracts:

1. GET /api/groups

Success 200:

```json
{
  "groups": [
    { "id": "...", "name": "default" },
    { "id": "...", "name": "Friends 2026" }
  ]
}
```

2. GET /api/user/group

Success 200:

```json
{
  "group": { "id": "...", "name": "default" }
}
```

3. PUT /api/user/group

Request for both create and join:

```json
{
  "groupName": "Friends 2026",
  "password": "secret123"
}
```

Success 200:

```json
{
  "success": true,
  "action": "created_or_joined",
  "group": { "id": "...", "name": "Friends 2026" },
  "message": "Group selected"
}
```

Invalid password 403:

```json
{
  "error": "Invalid group password"
}
```

4. GET /api/leaderboard

Success 200 response keeps the existing leaderboard array and upgrades group from string to GroupSummary:

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "micke",
      "totalScore": 42,
      "groupStageScore": 30,
      "knockoutScore": 12
    }
  ],
  "group": { "id": "...", "name": "default" }
}
```

Compatibility window (temporary):

1. During migration, routes may also include legacy string key for frontend safety:

```json
{
  "group": { "id": "...", "name": "default" },
  "groupNameLegacy": "default"
}
```

2. Remove groupNameLegacy after frontend is fully switched to the object contract.

3. Slice 2: Add Group model file only
4. Create `src/models/Group.ts` with fields for `name`, `passwordHash`, and timestamps.
5. Add unique index on `name`.
6. Do not connect it to routes yet.

7. Slice 3: Add default group bootstrap helper
8. Add a helper in `src/lib` that ensures a `default` group exists (idempotent).
9. Return the default group document from the helper for reuse in routes.

10. Slice 4: Update validation schemas only
11. In `src/lib/validationSchemas.ts`, add separate schemas for:
12. Create group payload: `groupName + password`
13. Join group payload: `groupName + password`
14. Apply relaxed name rules (compared to current strict lowercase regex), but keep trim and max length.

15. Slice 5: Update User model relation only
16. In `src/models/User.ts`, replace `group: string` with a reference field (for example `groupId`).
17. Update TypeScript interface accordingly.
18. Keep route logic unchanged in this slice to reduce risk.

19. Slice 6: Register route uses default group reference
20. Update `src/app/api/auth/register/route.ts` to call default group helper.
21. Save new users with default group reference.
22. Keep register response stable unless frontend needs new shape.

23. Slice 7: Refactor GET /api/groups
24. Update `src/app/api/groups/route.ts` to read from Group model (not `User.distinct("group")`).
25. Keep output predictable and sorted for dropdown rendering.

26. Slice 8: Refactor GET /api/user/group
27. Update `src/app/api/user/group/route.ts` GET to read user group reference and return group info.
28. Add safe fallback for users not yet migrated (temporary).

29. Slice 9: Refactor PUT /api/user/group into create/join logic
30. If group does not exist: create group with hashed password, assign user.
31. If group exists: verify password, then assign user.
32. Return clear error on wrong password (4xx).
33. Keep route single-purpose and readable with explicit branches.

34. Slice 10: Refactor leaderboard filtering
35. Update `src/app/api/leaderboard/route.ts` to resolve users by group reference.
36. Preserve displayed group name in response so existing heading behavior remains clear.
37. Preserve guest default-group behavior.

38. Slice 11: Frontend GroupManagement create flow
39. In `src/components/GroupManagement.tsx`, add password input for create form.
40. Send `groupName + password` payload.
41. Handle create success and validation errors with clear messages.

42. Slice 12: Frontend GroupManagement join flow
43. Add password input for join form as well.
44. Send `groupName + password` when joining existing group.
45. Show distinct error for invalid password.

46. Slice 13: Leaderboard component contract alignment
47. In `src/components/Leaderboard.tsx`, verify the group display logic still works with updated API response.
48. Keep fallback behavior for safety.

49. Slice 14: One-time migration script
50. Add a migration utility/script to:
51. Create Group documents from old distinct user group strings.
52. Map each user to new group reference.
53. Handle legacy data safely and log summary counts.

54. Slice 15: Remove temporary fallback code
55. After migration is confirmed, remove compatibility reads of old user group string.
56. Keep codebase on one source of truth only.

57. Slice 16: Update docs immediately after code slices
58. Update:
59. `.github/docs/backend/database-models.md`
60. `.github/docs/backend/api-routes.md`
61. `.github/docs/frontend/components.md`
62. `.github/docs/frontend/form-logic.md`
63. Focus each update on what changed and why.

64. Slice 17: Verification checklist
65. Verify register assigns default group reference.
66. Verify create group requires password and succeeds.
67. Verify join existing group requires correct password.
68. Verify wrong password returns controlled client error.
69. Verify `/api/groups` returns expected list.
70. Verify leaderboard remains group-isolated.
71. Run lint + build before merge.

### Suggested execution order for small PRs

1. PR A: Slices 2-6 (model + helper + validation + register wiring).
2. PR B: Slices 7-10 (API refactor + leaderboard).
3. PR C: Slices 11-13 (frontend create/join/password UX).
4. PR D: Slices 14-15 (migration + cleanup).
5. PR E: Slices 16-17 (docs + final verification pass).

### Decisions captured for this plan

1. Password is required for both creating and joining a group.
2. New users should be auto-assigned to built-in `default` group.
3. Group naming should be relaxed versus the current strict lowercase rules.
