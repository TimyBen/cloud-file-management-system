<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { FileItem } from '$lib/types';

  let files: FileItem[] = [];

  onMount(async () => {
    files = await api.getFiles({ limit: 5, sort: 'recent' });
  });
</script>

<div class="p-4 rounded-xl bg-[#0f1726] border border-[#16202a]">
  <div class="text-lg font-semibold mb-3">Recent Files</div>
  <ul class="space-y-3 text-slate-300">
    {#if files.length === 0}
      <li class="text-slate-400">No files yet</li>
    {:else}
      {#each files as f}
        <li class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-[#071224] flex items-center justify-center">📄</div>
          <div>
            <div class="font-medium">{f.name}</div>
            <div class="text-xs text-slate-400">{f.size} · {f.modifiedAgo}</div>
          </div>
        </li>
      {/each}
    {/if}
  </ul>
</div>
