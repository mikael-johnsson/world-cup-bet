# Plan: Leaderboard Next to BetForm

DRAFT — We’ll keep scoring as an admin-triggered write flow and add a lightweight read-only leaderboard flow for page render. The leaderboard will read persisted scores from bets, map each bet’s userId to a username from users, and return top results for one tournament. UI will stay simple: add a new left-column leaderboard component and keep BetForm on the right. This avoids heavy recalculation on normal page loads and preserves your admin authorization boundary for scoring.

## Steps

1. Confirm leaderboard response contract in src/app/api/leaderboard/route.ts: [{ rank, username, totalScore, groupStageScore, knockoutScore }].
2. Create the new GET route in src/app/api/leaderboard/route.ts with tournamentId (required) and limit (optional, default small like 10).
3. In that route, query top bets from Bet.ts by tournamentId, sorted by scoring.totalScore desc, filtered to authenticated-era bets (userId present).
4. In the same route, query matching users from User.ts and build a userId -> username map (manual join, since Bet.userId is string).
5. Compose final leaderboard rows with fallback name "Unknown" if a user record is missing.
6. Add stable tie-breaking in query/transform (e.g., totalScore desc, then submittedAt asc) to avoid rank jitter.
7. Add a minimal client component src/components/Leaderboard.tsx that fetches /api/leaderboard?tournamentId=..., with loading/empty/error states.
8. Keep Leaderboard read-only (no scoring call, no admin requirement), and do not call score-all from page render.
9. Update page.tsx layout to two columns: left Leaderboard, right BetForm; keep mobile stacked.
10. Pass tournamentId from page to Leaderboard exactly like BetForm to scope rankings per tournament.
11. Add a small refresh action in Leaderboard (button) to re-fetch manually after score updates (optional but low cost).
12. Update docs in components.md and api-routes.md with the new leaderboard endpoint and component data flow.

## Verification

- Run app and confirm page shows Leaderboard left + BetForm right.
- Hit GET /api/leaderboard?tournamentId=<id> and validate shape/order.
- Confirm no scoring writes happen on normal page load.
- Trigger admin scoring via route.ts, refresh leaderboard, verify ranking updates.
- Validate empty and missing-user cases render safely.

## Decisions

- Keep score-all admin-only; do not run on user page render.
- Use persisted scores from bets, not on-demand recalculation.
- Use manual user lookup (current Bet.userId string model) instead of populate for now.
