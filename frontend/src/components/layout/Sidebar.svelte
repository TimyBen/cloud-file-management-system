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

  // helper to compute classes so we avoid invalid class: directives with hyphens
  function linkClasses(path: string) {
    const isActive = !!($page?.url?.pathname?.startsWith(path));
    return [
      "block px-3 py-2 rounded-lg transition-colors hover:bg-blue-50 hover:text-blue-600",
      isActive ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"
    ].join(" ");
  }
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
    <!-- SSR-safe: optional chaining on $page inside the helper -->
    {#each links as link}
      <a
        href={link.path}
        class={linkClasses(link.path)}
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
  /* small helper colors in case your Tailwind config isn't yet loaded during SSR */
  :global(.bg-blue-100) { background-color: #ebf8ff; }
  :global(.text-blue-700) { color: #1d4ed8; }
</style>
