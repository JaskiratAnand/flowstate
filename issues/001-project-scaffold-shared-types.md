## Parent PRD
`docs/PRD.md`

## What to build
Initialize the WXT project with Svelte and Tailwind CSS. Create the fundamental `lib/types.ts` file that defines all shared interfaces (`TimerConfig`, `TimerState`, `Task`, `DailyArchive`, `Stats`, `UserPreferences`).

## Acceptance criteria
- [ ] WXT project initialized successfully.
- [ ] Tailwind CSS configured.
- [ ] Svelte support enabled.
- [ ] `lib/types.ts` contains all necessary interfaces defined in the PRD.

## Blocked by
None - can start immediately

## User stories addressed
Sets the foundation for all stories.

## Implementation Workflow (TDD)
While this slice focuses on scaffolding and types, ensure that the build tool (Vitest/Jest) is set up so that TDD can be effectively used in subsequent logic slices.