<script>
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Topbar from '$lib/components/Topbar.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
  import FilesGrid from '$lib/components/FilesGrid.svelte';

  let page = 'dashboard'; // toggle 'dashboard' / 'files' for demo
</script>

<div class="min-h-screen flex bg-[#0f1a26] text-slate-200">
  <Sidebar bind:page />
  <div class="flex-1 flex flex-col">
    <Topbar />
    <main class="p-6 flex-1 overflow-auto">
      {#if page === 'dashboard'}
        <Dashboard />
      {:else}
        <FilesGrid />
      {/if}
    </main>
  </div>
</div>
