# Sprint Planning: Knockout Rework v1

## Overview

This document outlines the sprinted roadmap to convert the knockout phase from a **match-based model** (old) to a **progression-based model** (new). The new model stores advancing teams per round, includes a bronze medal flow with semifinal losers, and uses simple scoring (1 point per correct team per round).

**Goal:** Ship incrementally with zero breaking changes to existing bets. Legacy data remains readable through compatibility layers.

---

## Sprint 1 — Date Display + Type Boundary Cleanup

**Goal:** Normalize fixture date typing and improve readability. Rendering behavior unchanged.

### Tasks

1. **Normalize fixture date typing** in entry points
   - `src/app/page.tsx:25` — Tournament data entry point
   - `src/types/index.ts:10` — Shared tournament model type boundary
   - Ensure all dates parse consistently (ISO strings → Date objects)

2. **Format match dates in group UI**
   - `src/components/GroupStageSection.tsx:214` — Add locale-aware date formatting
   - Display human-readable match times (e.g., "2026-03-15 14:30 UTC")
   - Maintain existing UI structure; only improve readability

### Why This Sprint First?

- Foundation for later work (ensure predictable date handling)
- Zero risk; read-only rendering improvements
- Prepares models for next sprint's data contract changes

---

## Sprint 2 — New Progression Data Contract (Non-Breaking)

**Goal:** Introduce progression-based prediction types. Preserve legacy data compatibility.

### Tasks

1. **Add progression-based prediction types**
   - `src/types/index.ts:56` — Add `KnockoutProgression` type
   - Structure: `{ roundOf16: string[], quarterfinals: string[], semifinals: string[], final: string[], champion: string, bronze: { finalist1: string, finalist2: string, winner: string } }`

2. **Extend validation schema**
   - `src/lib/validationSchemas.ts:14` — Accept new progression payload
   - "New" bets use progression model; "old" legacy read path still works
   - No deletion of legacy fields yet

3. **Add model version/shape compatibility**
   - `src/models/Bet.ts:3` — Version field + schema flexibility
   - `src/models/Solution.ts:3` — Version field for solution model
   - Ensure old & new payloads can coexist without errors

### Why This Sprint?

- Data layer ready for UI swap without breaking existing bets
- No new behavior yet; just schema preparation
- Minimal API/scoring changes needed

---

## Sprint 3 — Replace Knockout UI with Progression Picks

**Goal:** Replace match-winner knockout UI with selectable team cards per round.

### Tasks

1. **Rebuild knockout UI component**
   - `src/components/KnockoutSection.tsx:111` — Replace match-based rendering
   - New: Show team cards grouped by round (Round of 16 → Quarterfinals → Semifinals → Final)
   - Users click team cards to select/advance them
   - Render eligible teams based on previous round selections

2. **Wire progression state in form**
   - `src/components/BetForm.tsx:56` — Update knockout default values
   - Derive eligible teams from group stage predictions (group winners/runners-up for Round of 16)
   - Derive eligible teams from previous round selections (e.g., QF winners → SF)

3. **Add bronze medal flow in UI**
   - After user picks Final teams, show semifinal losers as bronze matchup
   - User picks 2 semifinal losers → user picks bronze winner
   - Simple dropdowns or card selection for bronze finalists

### Why This Sprint?

- New knockout experience ships to users
- Eligibility logic validates user selections
- Bronze flow completes the knockout structure

---

## Sprint 4 — API + Scoring Adaptation for Progression

**Goal:** Update backend to handle progression predictions. Adapt scoring engine.

### Tasks

1. **Update API validation and persistence**
   - `src/app/api/bets/route.ts:23` — Validate incoming progression payload
   - `src/app/api/bets/route.ts:30` — Persist progression fields correctly
   - Ensure backward compatibility (accept legacy format or auto-upgrade)

2. **Adapt scoring engine**
   - `src/lib/scoring/calculateScore.ts:40` — Route knockout scoring to progression scorer
   - `src/lib/scoring/knockoutScoringRules.ts:17` — Rewrite rules from match-based → progression-based
   - Scoring: 1 point per correct team per round (16 teams in R16 = 16 possible points, etc.)
   - Bronze: 1 point for correct semifinal losers + 1 point for correct bronze winner

3. **Ensure admin score-all path works**
   - `src/app/api/admin/score-all/route.ts:60` — Test with both old & new bet shapes
   - Legacy bets still score correctly (using old logic)
   - New bets score with progression logic

### Why This Sprint?

- Scoring fairness ensured (old & new bets handle separately)
- API ready for real user data
- Admin tooling remains functional

---

## Sprint 5 — Documentation and Rollout Hardening

**Goal:** Document changes and ensure smooth transition for developers.

### Tasks

1. **Update API documentation**
   - `docs/backend/api-routes.md` — Document new `POST /api/bets` payload shape
   - Show example: old vs. new progression structure
   - Explain backward-compatibility handling

2. **Update data model documentation**
   - `docs/backend/database-models.md` — Document Bet schema version field
   - Document KnockoutProgression structure
   - Explain why Solution model also versioned

3. **Update scoring documentation**
   - `docs/backend/scoring-system.md` — Explain progression-based scoring
   - Show point breakdown: Group Stage + Round of 16 + QF + SF + Final + Bronze
   - Example: "User predicted all 16 R16 teams correctly = 16 points"

4. **Update frontend behavior docs**
   - `docs/frontend/components.md` — Document new KnockoutSection behavior
   - Explain team eligibility derivation
   - Document bronze flow logic

5. **Update form logic docs**
   - `docs/frontend/form-logic.md` — Explain progression state wiring in BetForm
   - Show how group stage → R16 eligible teams flow works
   - Document conditional rendering logic

6. **Add legacy compatibility notes**
   - `docs/README.md` — Add section: "Knockout Model Migration"
   - Explain coexistence of old & new data
   - Show sample payloads for both shapes
   - Timeline: Old bets readable until [date]; new bets default to progression

### Why This Sprint?

- Team knowledge preserved for future work
- Rollout transparent to users and developers
- Reduces confusion during transition period

---

## Data Shapes: Old vs. New

### Old Knockout Model (Match-Based)

```typescript
knockout: [
  {
    round: "roundOf32",
    matches: [
      { matchId: "m1", predictedWinnerCode: "ENG" },
      { matchId: "m2", predictedWinnerCode: "FRA" },
    ],
  },
];
```

### New Knockout Model (Progression-Based)

```typescript
knockout: {
  roundOf16: ["ENG", "FRA", "GER", ...],      // 16 teams
  quarterfinals: ["ENG", "FRA", "GER", ...],  // 8 teams
  semifinals: ["ENG", "FRA", "GER", ...],     // 4 teams
  final: ["ENG", "FRA"],                      // 2 teams
  champion: "ENG",                            // 1 team
  bronze: {
    finalist1: "GER",                         // SF loser 1
    finalist2: "NED",                         // SF loser 2
    winner: "GER"                             // Bronze winner
  }
}
```

---

## Rollout Timeline

- **Sprint 1:** 1-2 days (type cleanup, low risk)
- **Sprint 2:** 1-2 days (schema prep, no UI changes)
- **Sprint 3:** 2-3 days (UI rebuild, testing)
- **Sprint 4:** 2-3 days (API, scoring engine)
- **Sprint 5:** 1-2 days (docs, cleanup)

**Total:** ~1-2 weeks of focused work

---

## Risk Mitigation

1. **No breaking changes** — Old bets remain readable through compatibility layer
2. **Gradual rollout** — Can merge sprints independently for staged review
3. **Backward-compatible API** — Old payloads still accepted; new ones preferred
4. **Schema versioning** — Bets table includes `version` field to distinguish old/new
5. **Scoring isolation** — Old bets score with old logic; new bets with new logic

---

## Success Criteria

- [ ] Round of 16 teams correctly derived from group stage
- [ ] Users can predict all 4 knockout rounds
- [ ] Bronze flow captures semifinal losers + bronze winner
- [ ] Scoring: 1 point per correct team per round
- [ ] Admin score-all works with old & new bets
- [ ] No existing bet data lost or corrupted
- [ ] Documentation reflects new model
