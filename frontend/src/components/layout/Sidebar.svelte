<script lang="ts">
  import { page } from "$app/stores";
  import { sidebarOpen } from "$lib/stores/ui";
  import { browser } from "$app/environment";
  import { onMount, onDestroy } from "svelte";

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Files", path: "/dashboard/files" },
    { name: "Share", path: "/dashboard/share" },
    { name: "Logs", path: "/dashboard/logs" },
    { name: "Collaborate", path: "/dashboard/collaborate" },
    { name: "Settings", path: "/settings" }
  ];

  function closeSidebar() {
    sidebarOpen.set(false);
  }

  let isMobile = false;
  if (browser) {
    const checkMobile = () => (isMobile = window.innerWidth < 768);
    onMount(() => {
      checkMobile();
      window.addEventListener("resize", checkMobile);
    });
    onDestroy(() => window.removeEventListener("resize", checkMobile));
  }

  function isActive(path: string, current: string) {
    if (path === "/dashboard") return current === "/dashboard";
    return current.startsWith(path);
  }
</script>

{#if $sidebarOpen && isMobile}
  <div
    class="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden transition-opacity duration-300"
    on:click={closeSidebar}
  />
{/if}

<aside
  class="fixed md:static z-30 inset-y-0 left-0 transform transition-transform duration-300
  w-64 bg-[color:theme('colors.surface-light')] dark:bg-[color:theme('colors.surface-dark')]
  border-r border-[color:theme('colors.border-light')] dark:border-[color:theme('colors.border-dark')] flex flex-col"
  class:translate-x-0={$sidebarOpen || !isMobile}
  class:-translate-x-full={!$sidebarOpen && isMobile}
>
  <div class="p-4 text-xl font-semibold text-[color:theme('colors.primary-default')] border-b border-[color:theme('colors.border-light')] dark:border-[color:theme('colors.border-dark')]">
    CloudStore AI
  </div>

  <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
    {#each navLinks as link}
      <a
        href={link.path}
        on:click={closeSidebar}
        class="block px-3 py-2 rounded-lg font-medium transition-colors duration-200
          {isActive(link.path, $page.url.pathname)
            ? 'bg-blue-400 text-blue-700 dark:bg-primary-dark dark:text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-border-dark'}"
      >
        {link.name}
      </a>
    {/each}
  </nav>

  <div class="p-4 border-t border-[color:theme('colors.border-light')] dark:border-[color:theme('colors.border-dark')] text-xs text-[color:theme('colors.text-light')] dark:text-[color:theme('colors.text-dark')]">
    © {new Date().getFullYear()} CloudStore AI
  </div>
</aside>
