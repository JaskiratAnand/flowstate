<script lang="ts">
import { browser } from 'wxt/browser';
import { onMount, onDestroy } from 'svelte';
import { fade } from 'svelte/transition';

const version = browser.runtime.getManifest().version;

let card1Open = $state(false);
let card2Open = $state(false);
let card3Open = $state(false);
let card4Open = $state(false);

let showScrollHint = $state(true);
let scrollContainer: HTMLElement | null = null;

function handleScroll(e: Event) {
  const target = e.currentTarget as HTMLElement;
  if (target.scrollTop > 10) {
    showScrollHint = false;
  } else {
    showScrollHint = true;
  }
}

onMount(() => {
  scrollContainer = document.querySelector('.tab-content');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll);
    // Set initial state in case the container is already scrolled
    if (scrollContainer.scrollTop > 10) {
      showScrollHint = false;
    }
  }
});

onDestroy(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll);
  }
});
</script>

<div
    class="flex flex-col items-center pt-4 pb-12 text-center min-h-full w-full"
>
    <div
        class="w-20 h-20 rounded-3xl bg-surface shadow-(--shadow-ambient) flex items-center justify-center mb-8 animate-in fade-in zoom-in duration-500"
    >
        <svg
            class="w-10 h-10 text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
            />
        </svg>
    </div>

    <h2 class="text-2xl font-bold text-text-primary mb-2">FlowState</h2>
    <p class="text-text-tertiary text-sm tracking-widest uppercase mb-4">
        Version {version}
    </p>

    <div class="space-y-4 max-w-xs w-full">
        <p class="text-text-secondary leading-relaxed">
            A tactile, sensory-focused Pomodoro and Todo extension designed to
            bring analog warmth to your digital workflow.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-2 mt-2">
            <a
                href="https://github.com/JaskiratAnand/flowstate"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface shadow-(--shadow-ambient) text-text-secondary hover:text-accent transition-all active:shadow-(--shadow-pressed) active:scale-95"
            >
                <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path
                        d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
                    ></path>
                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
                <span class="text-xs font-medium">GitHub Repository</span>
            </a>
        </div>

        <div class="pt-4 flex flex-col items-center gap-3">
            <div>
                <p
                    class="text-xs text-text-tertiary uppercase tracking-widest mb-1"
                >
                    Developed by
                </p>
                <p class="text-lg font-semibold text-text-primary">
                    Jaskirat Anand
                </p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-2 mt-2">
                <a
                    href="https://github.com/JaskiratAnand"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface shadow-(--shadow-ambient) text-text-secondary hover:text-accent transition-all active:shadow-(--shadow-pressed) active:scale-95"
                >
                    <svg
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path
                            d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                        ></path>
                    </svg>
                    <span class="text-xs font-medium">@JaskiratAnand</span>
                </a>
            </div>
        </div>

        <!-- Separator Line -->
        <div class="w-1/3 border-t border-border mt-8 mb-6 mx-auto"></div>

        <!-- How it works Title -->
        <p
            class="text-xs font-semibold uppercase tracking-widest text-text-tertiary"
        >
            How it works
        </p>

        <!-- Accordion Cards -->
        <div class="space-y-4 w-full text-left pt-2 pb-6">
            <!-- Card 1: What is Pomodoro? -->
            <div
                class="w-full bg-surface rounded-2xl border border-border/5 transition-all duration-300 {card1Open
                    ? 'shadow-(--shadow-pressed)'
                    : 'shadow-(--shadow-ambient)'}"
            >
                <button
                    type="button"
                    class="w-full flex items-center justify-between p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-2xl cursor-pointer"
                    onclick={() => (card1Open = !card1Open)}
                    aria-expanded={card1Open}
                    aria-controls="card-pomodoro-content"
                >
                    <div class="flex items-center gap-3">
                        <svg
                            class="w-5 h-5 text-accent"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <circle cx="12" cy="13" r="7" />
                            <path d="M12 6V3" />
                            <path d="M12 6c-1.5-1.5-3-1-3.5 0" />
                            <path d="M12 6c1.5-1.5 3-1 3.5 0" />
                        </svg>
                        <span class="font-medium text-text-primary text-sm"
                            >What is Pomodoro?</span
                        >
                    </div>
                    <svg
                        class="w-4 h-4 text-text-tertiary transition-transform duration-300 {card1Open
                            ? 'rotate-180'
                            : ''}"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div
                    id="card-pomodoro-content"
                    class="grid transition-[grid-template-rows] duration-300 ease-in-out accordion-content"
                    style="grid-template-rows: {card1Open ? '1fr' : '0fr'};"
                    aria-hidden={!card1Open}
                >
                    <div class="overflow-hidden min-h-0">
                        <div
                            class="px-4 pb-4 pt-1 text-sm text-text-secondary leading-relaxed space-y-3"
                        >
                            <p>
                                The Pomodoro Technique is a simple way to work
                                with more focus and less stress. You choose one
                                thing to work on, set a timer, and give it your
                                full attention until the bell rings — then you
                                rest. That's it.
                            </p>
                            <p>
                                It was invented by Francesco Cirillo in the late
                                1980s, named after the tomato-shaped kitchen
                                timer he used as a student. The idea is that
                                working in short, intentional bursts helps you
                                stay sharp without burning out.
                            </p>
                            <p>
                                FlowState brings that same rhythm to your
                                browser — calm, unhurried, and distraction-free.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 2: Timer Modes -->
            <div
                class="w-full bg-surface rounded-2xl border border-border/5 transition-all duration-300 {card2Open
                    ? 'shadow-(--shadow-pressed)'
                    : 'shadow-(--shadow-ambient)'}"
            >
                <button
                    type="button"
                    class="w-full flex items-center justify-between p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-2xl cursor-pointer"
                    onclick={() => (card2Open = !card2Open)}
                    aria-expanded={card2Open}
                    aria-controls="card-modes-content"
                >
                    <div class="flex items-center gap-3">
                        <svg
                            class="w-5 h-5 text-accent"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span class="font-medium text-text-primary text-sm"
                            >Timer Modes</span
                        >
                    </div>
                    <svg
                        class="w-4 h-4 text-text-tertiary transition-transform duration-300 {card2Open
                            ? 'rotate-180'
                            : ''}"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div
                    id="card-modes-content"
                    class="grid transition-[grid-template-rows] duration-300 ease-in-out accordion-content"
                    style="grid-template-rows: {card2Open ? '1fr' : '0fr'};"
                    aria-hidden={!card2Open}
                >
                    <div class="overflow-hidden min-h-0">
                        <div
                            class="px-4 pb-4 pt-1 text-sm text-text-secondary leading-relaxed space-y-3"
                        >
                            <p>
                                FlowState has three timer modes, each for a
                                different part of your rhythm:
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Focus</span
                                > — Your main work session. Use this when you want
                                to dig in and do one thing without distraction. The
                                default is 25 minutes, but you can adjust it in Settings.
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Short Break</span
                                > — A brief pause between focus sessions. Step away,
                                breathe, stretch. Typically 5 minutes.
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Long Break</span
                                > — A fuller rest after completing a set of focus
                                sessions. Take a walk, make a drink. Typically 15–30
                                minutes.
                            </p>
                            <p>
                                The durations shown in Settings are yours to
                                customise — there's no single right answer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 3: Task List -->
            <div
                class="w-full bg-surface rounded-2xl border border-border/5 transition-all duration-300 {card3Open
                    ? 'shadow-(--shadow-pressed)'
                    : 'shadow-(--shadow-ambient)'}"
            >
                <button
                    type="button"
                    class="w-full flex items-center justify-between p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-2xl cursor-pointer"
                    onclick={() => (card3Open = !card3Open)}
                    aria-expanded={card3Open}
                    aria-controls="card-tasks-content"
                >
                    <div class="flex items-center gap-3">
                        <svg
                            class="w-5 h-5 text-accent"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                        </svg>
                        <span class="font-medium text-text-primary text-sm"
                            >Task List</span
                        >
                    </div>
                    <svg
                        class="w-4 h-4 text-text-tertiary transition-transform duration-300 {card3Open
                            ? 'rotate-180'
                            : ''}"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div
                    id="card-tasks-content"
                    class="grid transition-[grid-template-rows] duration-300 ease-in-out accordion-content"
                    style="grid-template-rows: {card3Open ? '1fr' : '0fr'};"
                    aria-hidden={!card3Open}
                >
                    <div class="overflow-hidden min-h-0">
                        <div
                            class="px-4 pb-4 pt-1 text-sm text-text-secondary leading-relaxed space-y-3"
                        >
                            <p>
                                The Tasks tab is where you decide what you're
                                working on before you start the clock.
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Add a task</span
                                > — Tap the input field, type what you want to accomplish,
                                and press Enter or the add button.
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Complete a task</span
                                > — Tap the checkbox next to a task when you're done.
                                Completed tasks are visually marked and can be cleared
                                out to keep your list tidy.
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Task Priorities</span
                                > — Organize your tasks using a traffic light system. Tap the status indicator circle next to any task to cycle through priorities: Red (High), Yellow (Medium), Green (Low), and None. By default, High Priority tasks automatically float to the top of your list to keep you focused on what matters most (this behavior can be toggled in Settings).
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Delete a task</span
                                > — Swipe or tap the remove button to discard a task
                                you no longer need.
                            </p>
                            <p>
                                A good habit: pick one task from your list
                                before starting a Focus session. It keeps you
                                anchored to a single intention and makes the
                                timer feel more purposeful.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 4: Focus Shield -->
            <div
                class="w-full bg-surface rounded-2xl border border-border/5 transition-all duration-300 {card4Open
                    ? 'shadow-(--shadow-pressed)'
                    : 'shadow-(--shadow-ambient)'}"
            >
                <button
                    type="button"
                    class="w-full flex items-center justify-between p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-2xl cursor-pointer"
                    onclick={() => (card4Open = !card4Open)}
                    aria-expanded={card4Open}
                    aria-controls="card-shield-content"
                >
                    <div class="flex items-center gap-3">
                        <svg
                            class="w-5 h-5 text-accent"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                            />
                        </svg>
                        <span class="font-medium text-text-primary text-sm"
                            >Focus Shield</span
                        >
                    </div>
                    <svg
                        class="w-4 h-4 text-text-tertiary transition-transform duration-300 {card4Open
                            ? 'rotate-180'
                            : ''}"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div
                    id="card-shield-content"
                    class="grid transition-[grid-template-rows] duration-300 ease-in-out accordion-content"
                    style="grid-template-rows: {card4Open ? '1fr' : '0fr'};"
                    aria-hidden={!card4Open}
                >
                    <div class="overflow-hidden min-h-0">
                        <div
                            class="px-4 pb-4 pt-1 text-sm text-text-secondary leading-relaxed space-y-3"
                        >
                            <p>
                                Focus Shield is a website blocker designed to
                                protect your attention from digital noise.
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Blocklist</span
                                > — Add specific websites you want to restrict during work
                                (e.g. social media, news). When you try to visit them,
                                they will be replaced with a breathing exercise to
                                ground you.
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Allowlist</span
                                > — Block the entire internet except for a few specific websites you explicitly allow. Perfect for deep, uncompromised focus.
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Which to use?</span
                                > — Use Blocklist for daily maintenance and preventing habitual distractions. Use Allowlist for intense, deep work sessions where you only need a handful of tools.
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Bypass Durations</span
                                > — Sometimes you need quick access. You can grant
                                yourself a short, temporary bypass after completing
                                a deep breath.
                            </p>
                            <p>
                                <span class="text-text-primary font-semibold"
                                    >Strict Mode</span
                                > — By default, blocks only apply during active Focus
                                sessions. Enabling Strict Mode keeps distractions
                                blocked even when your timer is idle or on a break.
                            </p>
                            <p>
                                To configure your shield, go to <span
                                    class="text-text-primary font-semibold"
                                    >Settings</span
                                >, tap
                                <span class="text-text-primary font-semibold"
                                    >Configure Blocker</span
                                >, and add the websites you'd like to filter
                                out.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{#if showScrollHint}
    <div
        transition:fade={{ duration: 200 }}
        class="fixed bottom-22 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-border shadow-(--shadow-ambient) text-text-secondary text-[10px] font-semibold uppercase tracking-wider pointer-events-none transition-all duration-300"
        style="background-color: var(--surface-raised);"
        aria-hidden="true"
    >
        <span>Scroll</span>
        <svg
            class="w-3.5 h-3.5 text-accent animate-bounce"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
        >
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    </div>
{/if}

<style>
    .accordion-content {
        transition: grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    @media (prefers-reduced-motion: reduce) {
        .accordion-content {
            transition: none !important;
        }
    }
</style>
