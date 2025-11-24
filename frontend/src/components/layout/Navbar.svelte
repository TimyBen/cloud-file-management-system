<script lang="ts">
  import { user } from "$lib/stores/auth";
  import { sidebarOpen, theme } from "$lib/stores/ui";
  import { onMount } from "svelte";

  let currentUser: { email?: string } | null = null;

  onMount(() => {
    const unsub = user.subscribe((u) => (currentUser = u));
    return unsub;
  });

  function toggleSidebar() {
    sidebarOpen.update((v) => !v);
  }

  function toggleTheme() {
    theme.update((t) => (t === "light" ? "dark" : "light"));
  }
</script>

<header
  class="h-14 flex items-center justify-between px-4 md:px-6
         bg-surfaceLight dark:bg-surfaceDark
         border-b border-borderLight dark:border-borderDark
         transition-colors duration-300"
>
  <div class="flex items-center space-x-3">
    <button
      class="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      on:click={toggleSidebar}
      aria-label="Toggle menu"
    >
      ☰
    </button>
    <span class="text-lg p-4 font-semibold text-primaryDefault dark:text-primaryDark">
      CloudStore AI
    </span>
  </div>

  <div class="flex items-center space-x-4">
    <button
      on:click={toggleTheme}
      class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
      aria-label="Toggle theme"
    >
      {#if $theme === "dark"} 🌙 {:else} ☀️ {/if}
    </button>

    {#if currentUser}
     <button
        on:click={toggleTheme}
        class="p-2 rounded-md transition-transform duration-300 hover:scale-105 active:scale-95 hover:rotate-6 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle theme"
      >
        {#if $theme === "dark"} 🌙 {:else} ☀️ {/if}
      </button>

    {:else}
      <a href="/auth/login" class="text-primaryDefault dark:text-primaryDark hover:underline text-sm">
        Login
      </a>
    {/if}
  </div>
</header>
