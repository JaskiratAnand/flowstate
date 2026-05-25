<script lang="ts">
import TimerConfig from './TimerConfig.svelte';
import type { TimerConfig as ConfigType } from '../lib/types';

let { initialConfig } = $props<{ initialConfig: ConfigType }>();

// Declare reactive state
let config = $state<ConfigType>({
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
});

// Initialize from props reactively to avoid state_referenced_locally compiler warnings
$effect.pre(() => {
  config.workDuration = initialConfig.workDuration;
  config.shortBreakDuration = initialConfig.shortBreakDuration;
  config.longBreakDuration = initialConfig.longBreakDuration;
});

// Sync changes back to the initialConfig object for test assertions
$effect(() => {
  initialConfig.workDuration = config.workDuration;
  initialConfig.shortBreakDuration = config.shortBreakDuration;
  initialConfig.longBreakDuration = config.longBreakDuration;
});
</script>

<TimerConfig bind:config />
