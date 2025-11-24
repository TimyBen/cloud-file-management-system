<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { StorageUsageResponse } from '$lib/types';

  let usage: StorageUsageResponse | null = null;

  onMount(async () => {
    usage = await api.getStorageUsage();
  });
</script>

<div class="p-4 rounded-xl bg-[#0f1726] border border-[#16202a]">
  <div class="text-xl font-semibold mb-4">Storage Usage</div>

  {#if usage}
    <div class="flex items-center gap-6">
      <div class="w-48 h-48 rounded-full bg-[#071224] flex items-center justify-center">
        <!-- Simple donut using SVG segments -->
        <svg width="140" height="140" viewBox="0 0 36 36">
          <circle r="16" cx="18" cy="18" fill="none" stroke="#0b1720" stroke-width="6"></circle>
          <!-- draw top layer (combined percent as stroke-dasharray) -->
          <circle r="16" cx="18" cy="18" fill="none" stroke="#0ea5e9" stroke-width="6"
                  stroke-dasharray="{usage.percent},100" transform="rotate(-90 18 18)"></circle>
        </svg>
      </div>

      <div class="text-slate-300">
        {#each usage.breakdown as item}
          <div class="mb-2"><strong>{item.label}</strong> — {item.size} GB</div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="text-slate-400">Loading storage usage...</div>
  {/if}
</div>
