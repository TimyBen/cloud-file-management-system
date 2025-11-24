<script lang="ts">
  import Sidebar from '$components/layout/Sidebar.svelte';
  import Navbar from '$components/layout/Navbar.svelte';
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import type { LayoutLoad } from './$types';

  // fetch user on client mount if token exists
  onMount(() => {
    auth.initFromStorage();
  });
</script>

<div class="min-h-screen flex bg-[#0f1a26] text-slate-200">
  <Sidebar />
  <div class="flex-1 flex flex-col">
    <Navbar />
    <main class="p-6 flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</div>
