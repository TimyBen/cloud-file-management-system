<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  let activity: { message: string; timeAgo: string }[] = [];

  onMount(async () => {
    activity = await api.getRecentActivity();
  });
</script>

<div class="p-4 rounded-xl bg-[#0f1726] border border-[#16202a]">
  <div class="text-lg font-semibold mb-3">Recent Activity</div>
  <ul class="space-y-3 text-slate-300">
    {#if activity.length === 0}
      <li class="text-slate-400">No recent activity</li>
    {:else}
      {#each activity as a}
        <li>
          <div class="font-medium">{a.message}</div>
          <div class="text-xs text-slate-400">{a.timeAgo}</div>
        </li>
      {/each}
    {/if}
  </ul>
</div>
