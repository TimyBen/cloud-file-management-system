<script lang="ts">
  import "../app.css";
  import Sidebar from "$components/layout/Sidebar.svelte";
  import Navbar from "$components/layout/Navbar.svelte";
</script>

<div class="flex h-screen bg-backgroundLight dark:bg-backgroundDark transition-colors duration-300">
  <Sidebar />
  <div class="flex flex-col flex-1 overflow-hidden">
    <Navbar />
    <main class="flex-1 overflow-y-auto p-6">
      <slot />
    </main>
  </div>
</div>
