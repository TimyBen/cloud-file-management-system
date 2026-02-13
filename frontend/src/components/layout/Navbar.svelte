<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { auth, clearAuth } from '$lib/stores/auth';
  import ThemeToggle from '$components/ui/ThemeToggle.svelte';

  import {
    searchQuery,
    performSearchDebounced,
    clearSearch,
    showSearchResults,
    filteredFiles,
    folderResults,
    activeResultIndex,
    navigateResults,
    getActiveItem,
    openSearchDropdown,
    closeSearchDropdown
  } from '$lib/stores/search';

  let user;
  $: user = $auth?.user;

  let searchWrap: HTMLDivElement | null = null;

  function handleDocClick(e: MouseEvent) {
    if (!searchWrap) return;
    const t = e.target as Node;
    if (!searchWrap.contains(t)) closeSearchDropdown();
  }

  onMount(() => {
    if (!browser) return;
    document.addEventListener('click', handleDocClick, true);
  });

  onDestroy(() => {
    if (!browser) return;
    document.removeEventListener('click', handleDocClick, true);
  });

  async function logout() {
    clearAuth();
    await fetch('/auth/logout', { method: 'POST' });
    window.location.href = '/auth/login';
  }

  function onInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    searchQuery.set(value);
    performSearchDebounced(value);
    openSearchDropdown();
  }

  function onFocus() {
    openSearchDropdown();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      clearSearch();
      closeSearchDropdown();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openSearchDropdown();
      navigateResults('down');
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      openSearchDropdown();
      navigateResults('up');
      return;
    }

    if (e.key === 'Enter') {
      const item = getActiveItem();
      if (!item) return;

      if (item.kind === 'folder') {
        const next = item.folder.endsWith('/') ? item.folder : `${item.folder}/`;
        searchQuery.set(next);
        performSearchDebounced(next, 0);
        openSearchDropdown();
        return;
      }

      if (item.kind === 'file') {
        // Keep your current architecture: go to files page
        window.location.href = '/dashboard/files';
        closeSearchDropdown();
        return;
      }
    }
  }

  function onClearClick() {
    clearSearch();
    closeSearchDropdown();
  }

  function formatBytes(bytes: number | string | null | undefined) {
    if (bytes === null || bytes === undefined) return '0 B';
    const n = typeof bytes === 'string' ? Number.parseInt(bytes, 10) : bytes;
    if (!n || n <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(n) / Math.log(k));
    const num = n / Math.pow(k, i);
    return `${num.toFixed(num >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  }
</script>

<nav
  class="w-full border-b px-4 sm:px-6 py-4 sm:py-5 flex flex-row gap-5 sm:flex-row sm:items-center sm:justify-center"
  style="background-color: hsl(var(--card)); border-color: hsl(var(--border));"
>
  <!-- Top row on mobile: Welcome + Right actions -->
  <div class="flex pl-10 w-full items-center justify-between gap-3 sm:hidden">
    <div
      class="text-m font-serif font-bold truncate"
      style="color: hsl(var(--foreground))"
      title={user?.display_name || user?.email}
    >
      Welcome, {user?.display_name || user?.email}
    </div>

     <!-- Search -->
    <div class="flex-1 w-full sm:max-w-2xl sm:mx-8">
      <!-- IMPORTANT: do NOT attach DOM listeners on SSR. We only stop propagation here. -->
      <div class="relative" bind:this={searchWrap} on:click|stopPropagation>
        <input
          type="text"
          placeholder="Search files and folders..."
          value={$searchQuery}
          on:input={onInput}
          on:keydown={onKeyDown}
          on:focus={onFocus}
          class="w-full px-4 py-2 pl-10 pr-9 rounded-md border text-sm"
          style="
            background-color: hsl(var(--background));
            border-color: hsl(var(--border));
            color: hsl(var(--foreground));
          "
          autocomplete="off"
        />

        <!-- Search icon -->
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style="color: hsl(var(--muted-foreground))"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {#if $searchQuery}
          <button
            type="button"
            on:click={onClearClick}
            class="absolute right-2 top-1/2 -translate-y-1/2 text-lg px-1 rounded"
            style="color: hsl(var(--muted-foreground))"
            aria-label="Clear search"
          >
            ×
          </button>
        {/if}

        <!-- Dropdown -->
        {#if $showSearchResults && $searchQuery.trim()}
          <div
            class="absolute left-0 right-0 mt-2 rounded-lg border shadow-lg overflow-hidden z-50"
            style="background-color: hsl(var(--card)); border-color: hsl(var(--border))"
            role="listbox"
            aria-label="Search results"
          >
            <!-- Header line -->
            <div
              class="px-3 py-2 text-xs flex items-center justify-between border-b"
              style="border-color: hsl(var(--border)); color: hsl(var(--muted-foreground))"
            >
              <span>
                {#if $filteredFiles.length + $folderResults.length > 0}
                  Results for "<span style="color: hsl(var(--foreground))">{$searchQuery}</span>"
                {:else}
                  No results for "<span style="color: hsl(var(--foreground))">{$searchQuery}</span>"
                {/if}
              </span>

              <button
                type="button"
                class="text-xs px-2 py-1 rounded"
                style="border: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground))"
                on:click={onClearClick}
              >
                Clear
              </button>
            </div>

            <div class="max-h-[340px] overflow-auto">
              {#if $folderResults.length > 0}
                <div
                  class="px-3 pt-2 pb-1 text-[0.7rem] uppercase tracking-wide"
                  style="color: hsl(var(--muted-foreground))"
                >
                  Folders
                </div>

                {#each $folderResults as fr, i (fr.folder)}
                  <button
                    type="button"
                    role="option"
                    aria-selected={$activeResultIndex === i}
                    class="w-full text-left px-3 py-2 flex items-center justify-between hover:opacity-90"
                    style="
                      background-color: {($activeResultIndex === i) ? 'hsl(var(--accent))' : 'transparent'};
                      color: hsl(var(--foreground));
                    "
                    on:click={() => {
                      const next = fr.folder.endsWith('/') ? fr.folder : `${fr.folder}/`;
                      searchQuery.set(next);
                      performSearchDebounced(next, 0);
                      openSearchDropdown();
                    }}
                  >
                    <div class="min-w-0 flex items-center gap-2">
                      <span style="color: hsl(var(--muted-foreground))">📁</span>
                      <span class="truncate">{fr.folder}</span>
                    </div>
                    <span class="text-xs shrink-0" style="color: hsl(var(--muted-foreground))">
                      {fr.count}
                    </span>
                  </button>
                {/each}
              {/if}

              {#if $filteredFiles.length > 0}
                <div
                  class="px-3 pt-2 pb-1 text-[0.7rem] uppercase tracking-wide"
                  style="color: hsl(var(--muted-foreground))"
                >
                  Files
                </div>

                {#each $filteredFiles as f, j (f.id)}
                  {@const idx = j + $folderResults.length}
                  <button
                    type="button"
                    role="option"
                    aria-selected={$activeResultIndex === idx}
                    class="w-full text-left px-3 py-2 flex items-start justify-between hover:opacity-90"
                    style="
                      background-color: {($activeResultIndex === idx) ? 'hsl(var(--accent))' : 'transparent'};
                      color: hsl(var(--foreground));
                    "
                    on:click={() => {
                      window.location.href = '/dashboard/files';
                      closeSearchDropdown();
                    }}
                  >
                    <div class="min-w-0">
                      <div class="text-sm truncate">{f.filename}</div>
                      <div class="text-xs mt-0.5" style="color: hsl(var(--muted-foreground))">
                        {f.file_type || f.mime_type || 'Unknown type'} • {formatBytes(f.file_size)}
                      </div>
                    </div>

                    <span class="text-xs shrink-0" style="color: hsl(var(--muted-foreground))">→</span>
                  </button>
                {/each}
              {/if}

              {#if $filteredFiles.length === 0 && $folderResults.length === 0}
                <div class="px-3 py-4 text-sm" style="color: hsl(var(--muted-foreground))">
                  Try searching by filename, type, or a folder path.
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <ThemeToggle />
      <button
        type="button"
        class="px-3 py-1 text-sm rounded-md"
        style="background-color: hsl(0, 84%, 60%); color: hsl(0, 0%, 100%);"
        on:click={logout}
      >
        Logout
      </button>
    </div>
  </div>

  <!-- Desktop left -->
  <div
    class="hidden sm:block text-sm pl-0 sm:pl-12 font-serif font-bold min-w-[200px] truncate"
    style="color: hsl(var(--foreground))"
    title={user?.display_name || user?.email}
  >
    Welcome, {user?.display_name || user?.email}
  </div>



  <!-- Desktop right -->
  <div class="hidden sm:flex items-center gap-4 min-w-[150px] justify-end shrink-0">
    <ThemeToggle />
    <button
      type="button"
      class="px-3 py-1 text-sm rounded-md"
      style="background-color: hsl(0, 84%, 60%); color: hsl(0, 0%, 100%);"
      on:click={logout}
    >
      Logout
    </button>
  </div>
</nav>
