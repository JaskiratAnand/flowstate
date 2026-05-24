<script lang="ts">
let {
  checked,
  onchange,
  disabled = false,
  'aria-label': ariaLabel = '',
  isLoaded = true,
} = $props<{
  checked: boolean;
  onchange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  isLoaded?: boolean;
}>();

function handleClick() {
  if (disabled) return;
  onchange(!checked);
}
</script>

<button
  type="button"
  class="w-12 h-6 rounded-full p-1 relative flex items-center focus:outline-none cursor-pointer {isLoaded ? 'transition-all duration-300' : ''} {checked
    ? 'bg-accent/20 border border-accent/20'
    : 'bg-bg-secondary border border-border'} {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
  onclick={handleClick}
  aria-label={ariaLabel}
  disabled={disabled}
>
  <div
    class="w-4 h-4 rounded-full shadow-(--shadow-ambient)
           {isLoaded ? 'transition-all duration-300' : ''}
           {checked
      ? 'bg-accent translate-x-5.5'
      : 'bg-text-tertiary translate-x-0'}"
  ></div>
</button>
