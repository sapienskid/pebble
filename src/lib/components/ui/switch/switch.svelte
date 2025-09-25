<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let ariaLabel: string = 'Toggle';

  const dispatch = createEventDispatcher();

  function toggle() {
    if (disabled) return;
    // Notify parent of the desired new state. Parent is responsible for updating the value.
    dispatch('change', !checked);
  }

  function onKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  }
</script>

<!-- Accessible switch: role=switch, aria-checked reflects the controlled checked prop. -->
<button
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={ariaLabel}
  class="inline-flex items-center p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
  on:click={toggle}
  on:keydown={onKeydown}
  disabled={disabled}
>
  <span class="sr-only">{ariaLabel}</span>
  <span class="relative inline-block w-12 h-6 transition-colors duration-200 ease-in-out rounded-full"
    class:bg-primary={checked}
    class:bg-slate-300={!checked}
  >
    <span
      class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out"
      style="transform: translateX({checked ? '24px' : '0px'});"
    ></span>
  </span>
</button>

