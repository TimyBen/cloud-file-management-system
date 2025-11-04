<script lang="ts">
  import { onMount } from "svelte";

  let stats = { files: 0, users: 0, shares: 0 };

  onMount(() => {
    // Later integrate /api/files/stats
  });
</script>

<section>
  <h1 class="text-2xl font-semibold mb-4">Dashboard Overview</h1>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="p-4 bg-white shadow rounded-lg">
      <div class="text-gray-500 text-sm">Files</div>
      <div class="text-3xl font-bold">{stats.files}</div>
    </div>
    <div class="p-4 bg-white shadow rounded-lg">
      <div class="text-gray-500 text-sm">Users</div>
      <div class="text-3xl font-bold">{stats.users}</div>
    </div>
    <div class="p-4 bg-white shadow rounded-lg">
      <div class="text-gray-500 text-sm">Shares</div>
      <div class="text-3xl font-bold">{stats.shares}</div>
    </div>
  </div>
</section>
