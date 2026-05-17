## Parent PRD
`docs/PRD.md`

## What to build
Implement the pure logic modules: `lib/timer.ts` (state machine), `lib/stats.ts` (aggregations), and `lib/archive.ts` (daily rollover). These must be pure TypeScript files with zero browser API dependencies.

## Acceptance criteria
- [ ] `lib/timer.ts` correctly handles state transitions (idle -> running -> paused -> break).
- [ ] `lib/stats.ts` correctly increments streaks and counts, resetting streak appropriately if a day is missed.
- [ ] `lib/archive.ts` correctly separates completed vs. incomplete tasks for the daily rollover.

## Blocked by
- Blocked by `issues/001-project-scaffold-shared-types.md`

## User stories addressed
- User stories 7, 8, 9, 22, 23, 26, 27, 28, 29, 30, 31, 32

## Implementation Workflow (TDD)
**MANDATORY:** You must use the TDD RED -> GREEN -> REFACTOR loop.
1. Write ONE failing test for a single behavior (e.g., "Timer transitions from idle to running").
2. Write the minimal code to pass that test.
3. Refactor.
4. Repeat.
DO NOT write all tests upfront ("horizontal slicing"). Focus tests on the public interface of the module.