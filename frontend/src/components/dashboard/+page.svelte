<script lang="ts">
  import StatsCards from '$components/dashboard/StatsCards.svelte';
  import StorageUsage from '$components/dashboard/StorageUsage.svelte';
  import WeeklyActivity from '$components/dashboard/WeeklyActivity.svelte';
  import RecentFiles from '$components/dashboard/RecentFiles.svelte';
  import RecentActivity from '$components/dashboard/RecentActivity.svelte';
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-4xl font-extrabold">CloudStore AI</h1>
    <h2 class="text-3xl font-extrabold">Dashboard</h2>
    <p class="text-slate-400">Welcome back! Here's your storage overview</p>
  </div>

  <StatsCards />

  <div class="grid grid-cols-2 gap-4">
    <StorageUsage />
    <WeeklyActivity />
  </div>

  <div class="grid grid-cols-2 gap-4">
    <RecentFiles />
    <RecentActivity />
  </div>
</div>
