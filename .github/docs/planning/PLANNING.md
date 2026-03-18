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
