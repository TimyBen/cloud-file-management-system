<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';

  export let user: any = null;
</script>

<div class="min-h-screen bg-slate-950 text-slate-50 flex">
  <Sidebar />

  <div class="flex min-h-screen flex-1 flex-col">
    <Header {user} />
    <main class="flex-1 px-4 py-4 md:px-6 md:py-5">
      <slot />
    </main>
  </div>
</div>
