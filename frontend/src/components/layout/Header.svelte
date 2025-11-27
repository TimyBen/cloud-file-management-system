<script lang="ts">
  export let user: { email?: string; display_name?: string; role?: string } | null = null;
</script>

<header
  class="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3
         text-slate-100 backdrop-blur-md"
>
  <div class="flex items-center gap-2 md:hidden">
    <span class="text-xs tracking-[0.2em] uppercase text-slate-400">CloudBox</span>
  </div>

  <div class="flex-1" />

  <div class="flex items-center gap-3">
    {#if user}
      <div class="flex items-center gap-2 text-xs">
        <div
          class="flex h-7 w-7 items-center justify-center rounded-full border border-slate-500/70
                 bg-slate-900 text-[0.7rem]"
        >
          {#if user.display_name}
            {user.display_name.charAt(0).toUpperCase()}
          {:else}
            {user.email?.charAt(0).toUpperCase() ?? 'U'}
          {/if}
        </div>
        <div class="flex flex-col">
          <span class="font-medium">
            {user.display_name ?? user.email ?? 'User'}
          </span>
          <span class="text-[0.65rem] text-slate-400">
            {user.role ?? 'user'}
          </span>
        </div>
      </div>
    {/if}

    <form method="POST" action="/auth/logout">
      <button
        type="submit"
        class="rounded-full border border-slate-700 px-3 py-1 text-[0.7rem] text-slate-200
               hover:bg-slate-800 transition-colors"
      >
        Logout
      </button>
    </form>
  </div>
</header>
