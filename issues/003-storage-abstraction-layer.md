## Parent PRD
`docs/PRD.md`

## What to build
Implement `lib/storage.ts`. Create strongly-typed wrappers around `chrome.storage.local` keyed against a central constants object.

## Acceptance criteria
- [ ] `lib/storage.ts` provides typed `get<T>` and `set<T>` helpers.
- [ ] Storage keys map exactly to the schema specified in the PRD.

## Blocked by
- Blocked by `issues/001-project-scaffold-shared-types.md`

## User stories addressed
- User stories 24, 31, 35

## Implementation Workflow (TDD)
**MANDATORY:** You must use the TDD RED -> GREEN -> REFACTOR loop.
Use mocked storage interfaces (e.g., `wxt/testing` or `jest-chrome`) to test the abstraction. Write one test for getting/setting a typed object, implement it, and repeat.