<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { getStorageItem } from '../lib/storage';
import { getCleanDomain } from '../lib/blocking';
import { browser } from 'wxt/browser';

let theme = $state('forest');
let colorScheme = $state('system');
let fontFamily = $state('karla');
let bypassDuration = $state(5);
let systemDarkMode = $state(false);
let mediaQuery: MediaQueryList;

function handleSystemThemeChange(e: MediaQueryListEvent | MediaQueryList) {
  systemDarkMode = e.matches;
}

const effectiveDarkMode = $derived(
  colorScheme === 'system' ? systemDarkMode : colorScheme === 'dark',
);

$effect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute(
    'data-dark',
    effectiveDarkMode.toString(),
  );

  const fonts: Record<string, string> = {
    karla: '"Karla", sans-serif',
    fraunces: '"Fraunces", serif',
    mono: '"JetBrains Mono", monospace',
    system: 'system-ui, sans-serif',
  };
  document.documentElement.style.setProperty(
    '--font-main',
    fonts[fontFamily] || fonts.karla,
  );
});

let destinationUrl = $state('');
const cleanDomain = $derived(
  destinationUrl ? getCleanDomain(destinationUrl) : '',
);

let countdown = $state(15);
let timerInterval: any;

let inputPhrase = $state('');
const targetPhrase = 'I choose to bypass my focus right now.';
const phraseMatches = $derived(inputPhrase.trim() === targetPhrase);

onMount(async () => {
  // 1. Resolve URL parameter
  const urlParam = new URLSearchParams(window.location.search).get('url');
  if (urlParam) {
    destinationUrl = decodeURIComponent(urlParam);
  }

  // 2. Load prefs and config
  const prefs = await getStorageItem('USER_PREFERENCES');
  if (prefs) {
    theme = prefs.theme;
    colorScheme = prefs.colorScheme;
    fontFamily = prefs.fontFamily;
  }

  const config = await getStorageItem('BLOCKING_CONFIG');
  if (config) {
    bypassDuration = config.bypassDuration;
  }

  // 3. System theme detection
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  handleSystemThemeChange(mediaQuery);
  mediaQuery.addEventListener('change', handleSystemThemeChange);

  // 4. Start breathing countdown
  timerInterval = setInterval(() => {
    if (countdown > 0) {
      countdown--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
});

onDestroy(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

const timeElapsed = $derived(15 - countdown);
const phase = $derived.by(() => {
  const cycleTime = timeElapsed % 12;
  if (cycleTime < 4) {
    return { name: 'inhale', text: 'Breathe In Slowly...', scale: 1.4 };
  } else if (cycleTime < 6) {
    return { name: 'hold', text: 'Hold...', scale: 1.4 };
  } else if (cycleTime < 10) {
    return { name: 'exhale', text: 'Breathe Out...', scale: 0.95 };
  } else {
    return { name: 'hold', text: 'Hold...', scale: 0.95 };
  }
});

async function handleBypass() {
  if (!phraseMatches || !cleanDomain) return;

  // Send bypass site request to background
  await browser.runtime.sendMessage({
    type: 'BYPASS_SITE',
    payload: { domain: cleanDomain },
  });

  // Wait a brief tick for storage listeners & rules to register
  setTimeout(() => {
    window.location.replace(destinationUrl);
  }, 150);
}

function returnToSafety() {
  try {
    window.close();
  } catch {
    // ignore
  }
  window.location.replace('https://google.com');
}

function handleKeyPress(e: KeyboardEvent) {
  if (e.key === 'Enter' && phraseMatches) {
    handleBypass();
  }
}
</script>

<main
    class="flex-1 flex flex-col items-center justify-center p-8 bg-bg-primary text-text-primary transition-colors duration-500 font-body relative h-full"
>
    <!-- Calm Background Elements -->
    <div
        class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(ellipse_at_center,var(--accent)_0%,transparent_70%)]"
    ></div>

    <div class="w-full max-w-md flex flex-col items-center text-center z-10">
        <!-- Category Nudge -->
        <span
            class="text-[10px] font-bold uppercase tracking-[0.25em] text-text-tertiary mb-8"
        >
            Focus Session in Progress
        </span>

        {#if countdown > 0}
            <!-- Breathing Guide View -->
            <div
                class="flex flex-col items-center justify-center h-80 w-full animate-in fade-in duration-500"
            >
                <!-- Circular Breathing Ring -->
                <div
                    class="w-44 h-44 rounded-full flex flex-col items-center justify-center bg-accent-soft border-2 border-accent/25 shadow-(--shadow-ambient) transition-transform duration-1000 ease-in-out"
                    style="transform: scale({phase.scale});"
                >
                    <span
                        class="text-4xl font-bold font-body text-text-primary tracking-tighter"
                        >{countdown}</span
                    >
                </div>

                <!-- Instruction text -->
                <p
                    class="mt-12 text-base font-semibold tracking-wide text-text-secondary h-8 flex items-center justify-center transition-all duration-300"
                >
                    {phase.text}
                </p>
                <span class="text-[10px] text-text-tertiary mt-2"
                    >Let the circle guide your breath</span
                >
            </div>
        {:else}
            <!-- Mindful Challenge View -->
            <div
                class="flex flex-col items-center w-full animate-in fade-in duration-700"
            >
                <h2 class="text-2xl font-heading text-text-primary mb-3">
                    Pause & Reflect
                </h2>

                {#if !cleanDomain}
                    <div
                        class="w-full p-4 mb-6 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-(--color-red) text-xs font-semibold rounded-2xl text-center"
                    >
                        ⚠️ This challenge cannot be bypassed because the
                        destination website is unknown.
                    </div>
                {/if}

                <p
                    class="text-xs text-text-secondary mb-6 leading-relaxed max-w-xs"
                >
                    You're attempting to visit <span
                        class="font-semibold text-text-primary font-mono bg-bg-secondary px-1.5 py-0.5 rounded border border-border"
                        >{cleanDomain || "a blocked site"}</span
                    >. To confirm this decision, type the mindful phrase below:
                </p>

                <!-- Mindful Phrase Box -->
                <div
                    class="w-full p-4 mb-6 bg-bg-secondary rounded-2xl border border-border shadow-(--shadow-pressed) flex flex-col items-center justify-center"
                >
                    <span
                        class="text-[8px] font-bold uppercase tracking-widest text-text-tertiary mb-2"
                        >Intentional Phrase</span
                    >
                    <span
                        class="text-sm font-semibold italic text-text-secondary select-none font-heading text-center"
                    >
                        "{targetPhrase}"
                    </span>
                </div>

                <!-- Input challenge -->
                <!-- svelte-ignore a11y_autofocus -->
                <input
                    type="text"
                    bind:value={inputPhrase}
                    onkeypress={handleKeyPress}
                    placeholder="Type the phrase to proceed..."
                    class="w-full p-4 text-center rounded-2xl bg-bg-secondary border border-border text-sm text-text-primary shadow-(--shadow-pressed) focus:outline-none focus:border-accent transition-all placeholder:text-text-tertiary/40 mb-6 font-medium"
                    autofocus
                />

                <!-- Buttons -->
                <div class="w-full space-y-3 flex flex-col items-center">
                    {#if phraseMatches && cleanDomain}
                        <button
                            type="button"
                            onclick={handleBypass}
                            class="w-full py-4 rounded-full bg-surface border border-border text-xs font-bold uppercase tracking-wider text-text-primary shadow-(--shadow-ambient) hover:scale-102 active:shadow-(--shadow-pressed) active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <svg
                                class="w-4 h-4 text-accent"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path
                                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                                />
                            </svg>
                            Bypass for {bypassDuration} Mins
                        </button>
                    {/if}

                    <button
                        type="button"
                        onclick={returnToSafety}
                        class="w-full py-4 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold uppercase tracking-wider text-accent shadow-(--shadow-ambient) hover:scale-102 active:shadow-(--shadow-pressed) active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        🌱 Return to Safety
                    </button>
                </div>
            </div>
        {/if}
    </div>
</main>
