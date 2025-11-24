<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { StatsResponse } from '$lib/types';

  let stats: StatsResponse | null = null;

  async function load() {
    stats = await api.getStats();
  }

  onMount(() => { load(); });
</script>

{#if stats}
  <div class="grid grid-cols-4 gap-4">
    <div class="p-4 rounded-xl bg-[#0f1726] border border-[#16202a]">
      <div class="text-slate-400 text-sm">Storage Used</div>
      <div class="text-2xl font-bold">{stats.storage.used} GB</div>
      <div class="text-xs text-slate-400">of {stats.storage.total} GB</div>
    </div>

    <div class="p-4 rounded-xl bg-[#0f1726] border border-[#16202a]">
      <div class="text-slate-400 text-sm">Total Files</div>
      <div class="text-2xl font-bold">{stats.totalFiles}</div>
      <div class="text-xs text-slate-400">Across all folders</div>
    </div>

    <div class="p-4 rounded-xl bg-[#0f1726] border border-[#16202a]">
      <div class="text-slate-400 text-sm">Shared Items</div>
      <div class="text-2xl font-bold">{stats.sharedItems}</div>
      <div class="text-xs text-slate-400">With {stats.sharedWith} people</div>
    </div>

    <div class="p-4 rounded-xl bg-[#0f1726] border border-[#16202a]">
      <div class="text-slate-400 text-sm">Activity Today</div>
      <div class="text-2xl font-bold">{stats.activityToday}</div>
      <div class="text-xs text-slate-400">Actions performed</div>
    </div>
  </div>
{:else}
  <div class="text-slate-400">Loading stats...</div>
{/if}
