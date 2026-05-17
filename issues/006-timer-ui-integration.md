## Parent PRD
`docs/PRD.md`

## What to build
Implement `Timer.svelte` and `TimerConfig.svelte`. Connect them to read reactivity from storage and send start/pause/reset messages to the background worker.

## Acceptance criteria
- [ ] Timer UI displays minutes and seconds clearly.
- [ ] UI accurately reflects running, paused, and break states.
- [ ] Buttons send correct messages to the background script.
- [ ] Config UI allows setting work and break durations and persists them.

## Blocked by
- Blocked by `issues/004-background-service-worker.md`
- Blocked by `issues/005-base-ui-shell-theming.md`

## User stories addressed
- User stories 1, 2, 3, 10, 11, 12, 13, 14, 15