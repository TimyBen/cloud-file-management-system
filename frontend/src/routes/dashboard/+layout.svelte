<script lang="ts">
  import { onMount } from 'svelte';
  import { Menu, X } from 'lucide-svelte';
  import SidebarMobile from '$components/layout/SidebarMobile.svelte';
  import SidebarDesktop from '$components/layout/SidebarDesktop.svelte';
  import Navbar from '$components/layout/Navbar.svelte';
  import { auth, loadAuth } from '$lib/stores/auth';
  import { theme } from '$lib/stores/theme';

  export let data;
  let mobileOpen = false;

  // Load theme and auth on mount
  onMount(() => {
    theme.load();

    if (data?.token && data?.user) {
      auth.set({
        token: data.token,
        user: data.user
      });

      localStorage.setItem('auth.token', data.token);
      localStorage.setItem('auth.user', JSON.stringify(data.user));
    } else {
      loadAuth();
    }
  });

</script>

<div class="mobile-sidebar">
  <SidebarMobile bind:open={mobileOpen} />
</div>

<button
  class="mobile-toggle fixed top-8 left-5 z-50 p-2 rounded-md shadow flex items-center justify-center"
  style="background-color: hsl(var(--card))"
  on:click={() => (mobileOpen = !mobileOpen)}
  on:mouseenter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
  on:mouseleave={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--card))'}
>
  <span class="relative w-8 h-8">
    <Menu
      size="24"
      class={
        "absolute inset-0 m-auto transition-all duration-600 " +
        (mobileOpen ? "opacity-0 scale-75" : "opacity-100 scale-100")
      }
      style="color: hsl(var(--foreground))"
    />
    <X
      size="24"
      class={
        "absolute inset-0 m-auto transition-all duration-500 " +
        (!mobileOpen ? "opacity-0 scale-75" : "opacity-100 scale-100")
      }
      style="color: hsl(var(--foreground))"
    />
  </span>
</button>

<div
  class="flex h-screen"
  style="background-color: hsl(var(--background))"
>
  <div class="desktop-sidebar">
    <SidebarDesktop />
  </div>

  <!-- MAIN CONTENT -->
  <div class="flex flex-col flex-1 overflow-hidden">
    <Navbar />
    <main class="p-4 lg:p-6 overflow-y-auto">
      <slot />
    </main>
  </div>
</div>