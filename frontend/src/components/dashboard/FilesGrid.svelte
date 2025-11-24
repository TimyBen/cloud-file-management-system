<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { FileItem } from '$lib/types';
  let files: FileItem[] = [];
  let query = '';

  async function load() {
    files = await api.getFiles({ q: query });
  }

  onMount(load);
</script>

<div>
  <div class="mb-4 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-extrabold">Files</h1>
      <p class="text-slate-400">Manage and organize your files</p>
    </div>

    <div class="flex items-center gap-3">
      <input
        type="text"
        placeholder="Search files..."
        class="px-4 py-2 rounded-full bg-[#0b1720] border border-[#16202a] focus:outline-none"
        bind:value={query}
        on:keydown={() => { /* you may debounce */ }}
      />
      <button class="px-3 py-1 rounded-md bg-blue-600 text-white" on:click={load}>Search</button>
    </div>
  </div>

  <div class="grid grid-cols-3 gap-4">
    {#if files.length === 0}
      <div class="text-slate-400">No files found</div>
    {:else}
      {#each files as f}
        <div class="p-4 rounded-xl bg-[#0f1726] border border-[#16202a] flex items-center gap-3">
          <div class="w-12 h-12 rounded-md bg-[#071224] flex items-center justify-center text-2xl">
            {#if f.isDirectory}📁{:else if f.mime?.startsWith('image')}🖼️{:else if f.mime?.includes('pdf')}📄{:else}📎{/if}
          </div>
          <div>
            <div class="font-medium">{f.name}</div>
            <div class="text-xs text-slate-400">{f.size} · {f.modifiedAgo}</div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
