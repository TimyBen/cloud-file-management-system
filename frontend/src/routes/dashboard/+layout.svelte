<script lang="ts">
  import { onMount } from 'svelte';
  import { Menu, X } from 'lucide-svelte';

  import SidebarMobile from '$components/layout/SidebarMobile.svelte';
  import SidebarDesktop from '$components/layout/SidebarDesktop.svelte';
  import Navbar from '$components/layout/Navbar.svelte';

  import { auth, loadAuth } from '$lib/stores/auth';

  export let data;

  let mobileOpen = false;

  onMount(() => {
    loadAuth();

    if (data?.token && data?.user) {
      auth.set({
        token: data.token,
        user: data.user
      });
      localStorage.setItem('auth.token', data.token);
      localStorage.setItem('auth.user', JSON.stringify(data.user));
    }
  });
</script>

<div class="mobile-sidebar">
  <SidebarMobile bind:open={mobileOpen} />
</div>

<button
  class="mobile-toggle fixed top-7 left-4 z-50 bg-white p-2 rounded-md shadow flex items-center justify-center"
  on:click={() => (mobileOpen = !mobileOpen)}
>
  <span class="relative w-7 h-7">
    <Menu
      size="24"
      class={
        "absolute inset-0 m-auto transition-all duration-600 " +
        (mobileOpen ? "opacity-0 scale-75" : "opacity-100 scale-100")
      }
    />
    <X
      size="24"
      class={
        "absolute inset-0 m-auto transition-all duration-500 " +
        (!mobileOpen ? "opacity-0 scale-75" : "opacity-100 scale-100")
      }
    />
  </span>
</button>

<div class="flex h-screen bg-gray-50">
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
