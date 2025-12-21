<!-- $components/ui/ThemeToggle.svelte -->
<script lang="ts">
  import { theme } from '$lib/stores/theme';

  let isToggling = false;

  function handleToggle() {
    if (isToggling) return;

    isToggling = true;
    theme.toggle();

    // Reset toggling state after animation
    setTimeout(() => {
      isToggling = false;
    }, 300); // Match this with your CSS transition duration
  }
</script>

<button
  on:click={handleToggle}
  class="theme-toggle px-2.5 py-2 rounded-tl-xl rounded-br-xl
         bg-black/5 dark:bg-white/5
         hover:bg-black/10 dark:hover:bg-white/10
         transition-all duration-300 text-xl "
  aria-label="Toggle theme"
  disabled={isToggling}
>
  {#if $theme === 'dark'}
    <span class="sun-icon">🌞</span>
  {:else}
    <span class="moon-icon">🌙</span>
  {/if}
</button>