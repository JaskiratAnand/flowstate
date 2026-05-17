<script lang="ts">
import { browser } from 'wxt/browser';
const version = browser.runtime.getManifest().version;
</script>

<div class="flex flex-col items-center justify-center pt-4 pb-12 text-center h-full">
    <div
        class="w-20 h-20 rounded-3xl bg-surface shadow-(--shadow-ambient) flex items-center justify-center mb-8"
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

    <div class="space-y-4 max-w-xs">
        <p class="text-text-secondary leading-relaxed">
            A tactile, sensory-focused Pomodoro and Todo extension designed to bring analog warmth to your digital workflow.
        </p>
        
        <div class="pt-4 border-t border-border/10">
            <p class="text-xs text-text-tertiary uppercase tracking-widest mb-1">Developed by</p>
            <p class="text-lg font-semibold text-text-primary">Jaskirat Anand</p>
            
            <a 
                href="https://github.com/JaskiratAnand" 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-surface shadow-(--shadow-ambient) text-text-secondary hover:text-accent transition-all active:shadow-(--shadow-pressed) active:scale-95"
            >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                <span class="text-sm font-medium">@JaskiratAnand</span>
            </a>
        </div>
    </div>
</div>
