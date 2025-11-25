<script lang="ts">
  import { page } from '$app/stores';

  let open = true;

  const links = [
    { name: "Home", path: "/dashboard" },
    { name: "Files", path: "/dashboard/files" },
    { name: "Share", path: "/dashboard/share" },
    { name: "Logs", path: "/dashboard/logs" },
    { name: "Collaboration", path: "/dashboard/collaborate" },
    { name: "Settings", path: "/settings" }
  ];
</script>

<aside
  class="bg-white border-r border-gray-200 h-screen transition-all duration-300 overflow-hidden"
  style={`width: ${open ? "240px" : "70px"}`}
>
  <div class="flex items-center justify-between p-4">
    <div class="font-bold text-xl text-blue-600">{open ? "CloudStore AI" : "CS"}</div>
    <button class="p-1 rounded-md hover:bg-gray-100" on:click={() => (open = !open)}>
      {#if open}⟨{:else}⟩{/if}
    </button>
  </div>

  <nav class="p-4 space-y-2">
    {#each links as link}
      { /* Use $page (auto-subscribed store) and optional chaining to be SSR-safe */ }
      <a
        href={link.path}
        class="block px-3 py-2 rounded-lg transition-colors hover:bg-blue-50 hover:text-blue-600"
        class:bg-blue-100={$page?.url?.pathname?.startsWith(link.path)}
        class:text-blue-700={$page?.url?.pathname?.startsWith(link.path)}
        class:font-medium={$page?.url?.pathname?.startsWith(link.path)}
        title={open ? "" : link.name}
      >
        {#if open}
          {link.name}
        {:else}
          {link.name[0]}
        {/if}
      </a>
    {/each}
  </nav>
</aside>

<style>
  /* small helper to make the inline class:bg-* syntax behave visually for older Tailwind setups */
  :global(.bg-blue-100) { background-color: #ebf8ff; }
  :global(.text-blue-700) { color: #1d4ed8; }
</style>
