<script lang="ts">
  import { auth, clearAuth } from '$lib/stores/auth';
  import ThemeToggle from '$components/ui/ThemeToggle.svelte';

  let user;
  let searchQuery = '';
  $: user = $auth?.user;

  async function logout() {
    clearAuth();
    await fetch('/auth/logout', { method: 'POST' });
    window.location.href = '/auth/login';
  }

  function handleSearch() {
    // Dispatch search event that can be listened to by child pages
    const event = new CustomEvent('navSearch', {
      detail: { query: searchQuery }
    });
    window.dispatchEvent(event);

    // Or navigate to search results page
    // if (searchQuery.trim()) {
    //   window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    // }
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<nav
  class="w-full border-b px-6 py-5 flex justify-between items-center"
  style="
    background-color: hsl(var(--card));
    border-color: hsl(var(--border));
  "
>
  <!-- Left side: Welcome message -->
  <div
    class="text-sm pl-12 font-serif font-bold min-w-[200px]"
    style="color: hsl(var(--foreground))"
  >
    Welcome, {user?.display_name || user?.email}
  </div>

  <!-- Center: Search bar -->
  <div class="flex-1 max-w-2xl mx-8">
    <div class="relative">
      <input
        type="text"
        placeholder="Search in CloudStore..."
        bind:value={searchQuery}
        on:keypress={handleKeyPress}
        class="w-full px-4 py-2 pl-10 rounded-md border text-sm"
        style="
          background-color: hsl(var(--background));
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
        "
      />
      <!-- Search icon -->
      <svg
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
        style="color: hsl(var(--muted-foreground))"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>
      <!-- Clear search button (only shows when there's text) -->
      {#if searchQuery}
        <button
          on:click={() => searchQuery = ''}
          class="absolute right-3 top-1/2 transform -translate-y-1/2"
          style="color: hsl(var(--muted-foreground))"
        >
          ×
        </button>
      {/if}
    </div>
  </div>

  <!-- Right side: Theme toggle and logout -->
  <div class="flex items-center gap-4 min-w-[150px] justify-end">
    <!-- Theme Toggle -->
    <ThemeToggle />

    <!-- Logout Button -->
    <button
      class="px-3 py-1 text-sm rounded-md transition-colors"
      style="
        background-color: hsl(0, 84%, 60%);
        color: hsl(0, 0%, 100%);
      "
      on:mouseenter={(e) => e.currentTarget.style.backgroundColor = 'hsl(0, 84%, 50%)'}
      on:mouseleave={(e) => e.currentTarget.style.backgroundColor = 'hsl(0, 84%, 60%)'}
      on:click={logout}
    >
      Logout
    </button>
  </div>
</nav>