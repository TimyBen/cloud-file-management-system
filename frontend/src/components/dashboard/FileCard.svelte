<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let file: any;

  const formatBytes = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return '0 B';

    const bytes = typeof value === 'string' ? Number.parseInt(value, 10) : value;
    if (!bytes || bytes <= 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const num = bytes / Math.pow(k, i);

    return `${num.toFixed(num >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  };
</script>

<!-- FULL CARD CLICKABLE -->
<article
  class="
    w-full
    flex flex-wrap items-center justify-between gap-2
    rounded-lg border border-slate-800 bg-slate-950/70
    px-3 py-2.5 text-xs
    transition-colors
    cursor-pointer select-none
    hover:bg-slate-900
    active:bg-slate-800
  "
  on:click={() => dispatch('preview')}
>
  <div class="flex min-w-0 items-center gap-3">
    <div
      class="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/80 text-[0.65rem]
             text-slate-100"
    >
      {#if file.mimeType?.includes('image')}
        IMG
      {:else if file.mimeType?.includes('pdf')}
        PDF
      {:else if file.mimeType?.includes('audio')}
        AUD
      {:else if file.mimeType?.includes('video')}
        VID
      {:else}
        FILE
      {/if}
    </div>

    <div class="min-w-0">
      <p class="truncate text-[0.78rem] text-slate-50">
        {file.filename ?? file.name}
      </p>
      <p class="text-[0.68rem] text-slate-400">
        {formatBytes(file.file_size)} · {file.mimeType}
      </p>
    </div>
  </div>
</article>
