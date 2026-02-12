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

  // Normalize differences between backend/frontend naming
  $: mime = (file?.file_type || file?.mime_type || file?.mimeType || file?.mimetype || '').toLowerCase();
  $: displayName = file?.filename ?? file?.name ?? 'Untitled';
  $: size = file?.file_size ?? file?.size ?? 0;

  function openPreview() {
    dispatch('preview');
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPreview();
    }
  }

  function typeLabel(m: string) {
    if (!m) return 'FILE';
    if (m.includes('image')) return 'IMG';
    if (m.includes('pdf')) return 'PDF';
    if (m.includes('audio')) return 'AUD';
    if (m.includes('video')) return 'VID';
    return 'FILE';
  }
</script>

<!-- Accessible clickable card (no a11y warnings) -->
<button
  type="button"
  class="
    w-full
    flex flex-wrap items-center justify-between gap-2
    rounded-lg border
    px-3 py-2.5 text-xs
    transition-colors
    cursor-pointer select-none
    focus:outline-none focus:ring-2 focus:ring-offset-2
  "
  style="
    background-color: hsl(var(--card));
    border-color: hsl(var(--border));
    color: hsl(var(--foreground));
  "
  on:click={openPreview}
  on:keydown={onKeyDown}
  aria-label={`Preview ${displayName}`}
>
  <div class="flex min-w-0 items-center gap-3">
    <div
      class="flex h-8 w-8 items-center justify-center rounded-md text-[0.65rem]"
      style="
        background-color: hsl(var(--muted));
        color: hsl(var(--foreground));
        border: 1px solid hsl(var(--border));
      "
      aria-hidden="true"
    >
      {typeLabel(mime)}
    </div>

    <div class="min-w-0 text-left">
      <p class="truncate text-[0.78rem]" style="color: hsl(var(--foreground))">
        {displayName}
      </p>
      <p class="text-[0.68rem]" style="color: hsl(var(--muted-foreground))">
        {formatBytes(size)} · {mime || 'Unknown type'}
      </p>
    </div>
  </div>
</button>

<style>
  /* hover/active states that respect dark/light tokens */
  button:hover {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }

  button:active {
    opacity: 0.95;
  }
</style>
