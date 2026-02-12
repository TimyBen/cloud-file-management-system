<script lang="ts">
  import { uploadQueue } from '$lib/stores/upload';

  const fmtSize = (n: number) => {
    if (!n || n <= 0) return '0 B';
    const k = 1024;
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(n) / Math.log(k));
    const v = n / Math.pow(k, i);
    return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const fmtSpeed = (bps?: number) => {
    if (!bps || bps <= 0) return '';
    return `${fmtSize(bps)}/s`;
  };

  const fmtEta = (sec?: number) => {
    if (sec === undefined || sec === null || !Number.isFinite(sec)) return '';
    if (sec < 60) return `${Math.max(1, Math.round(sec))}s`;
    const m = Math.round(sec / 60);
    return `${m}m`;
  };

  $: state = $uploadQueue;
  $: items = state.items;
  $: open = state.open;

  $: uploadingCount = items.filter(i => i.status === 'uploading' || i.status === 'queued').length;
  $: doneCount = items.filter(i => i.status === 'done').length;
  $: errorCount = items.filter(i => i.status === 'error').length;

  function toggle() {
    uploadQueue.toggle();
  }

  function close() {
    uploadQueue.close();
  }

  function clearFinished() {
    uploadQueue.clearFinished();
  }

  function cancel(id: string) {
    uploadQueue.cancel(id);
  }
</script>

{#if items.length > 0}
  <div class="fixed bottom-5 right-5 z-[9999] w-[360px] max-w-[92vw]">
    <div
      class="rounded-xl border shadow-lg overflow-hidden"
      style="
        background-color: hsl(var(--card));
        border-color: hsl(var(--border));
        color: hsl(var(--foreground));
      "
    >
      <!-- Header -->
      <button
        type="button"
        class="w-full px-3 py-2 flex items-center justify-between"
        on:click={toggle}
        style="background-color: hsl(var(--card))"
      >
        <div class="text-sm font-semibold">
          Uploads
          <span class="text-xs" style="color: hsl(var(--muted-foreground))">
            • {uploadingCount} active
            {#if doneCount} • {doneCount} done{/if}
            {#if errorCount} • {errorCount} failed{/if}
          </span>
        </div>
        <div class="text-xs" style="color: hsl(var(--muted-foreground))">
          {#if open}▾{:else}▴{/if}
        </div>
      </button>

      {#if open}
        <!-- Body -->
        <div class="max-h-[320px] overflow-auto px-3 py-2 space-y-2">
          {#each items as it (it.id)}
            <div class="rounded-lg border p-2"
              style="border-color: hsl(var(--border)); background-color: hsl(var(--background))"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-sm font-medium truncate">{it.name}</div>
                  <div class="text-xs mt-0.5" style="color: hsl(var(--muted-foreground))">
                    {fmtSize(it.size)}
                    {#if it.status === 'uploading'}
                      {#if it.speedBps} • {fmtSpeed(it.speedBps)}{/if}
                      {#if it.etaSec} • {fmtEta(it.etaSec)} left{/if}
                    {/if}
                    {#if it.status === 'done'} • Done{/if}
                    {#if it.status === 'error'} • Failed{/if}
                    {#if it.status === 'canceled'} • Canceled{/if}
                  </div>
                </div>

                <div class="shrink-0 flex items-center gap-2">
                  {#if it.status === 'uploading' || it.status === 'queued'}
                    <button
                      type="button"
                      class="text-xs px-2 py-1 rounded border"
                      style="border-color: hsl(var(--border))"
                      on:click={() => cancel(it.id)}
                    >
                      Cancel
                    </button>
                  {/if}
                </div>
              </div>

              <!-- Progress bar -->
              <div class="mt-2 h-2 w-full rounded-full overflow-hidden"
                style="background-color: hsl(var(--muted))"
              >
                <div
                  class="h-full transition-all"
                  style="
                    width: {Math.max(0, Math.min(100, it.progress))}%;
                    background-color: {it.status === 'error' ? 'hsl(0 84% 60%)' : it.status === 'done' ? 'hsl(142 76% 36%)' : 'hsl(var(--primary))'};
                  "
                ></div>
              </div>

              {#if it.error}
                <div class="mt-1 text-xs" style="color: hsl(0 84% 60%)">
                  {it.error}
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Footer -->
        <div class="px-3 py-2 border-t flex items-center justify-between"
          style="border-color: hsl(var(--border))"
        >
          <button
            type="button"
            class="text-xs px-2 py-1 rounded border"
            style="border-color: hsl(var(--border))"
            on:click={clearFinished}
          >
            Clear finished
          </button>
          <button
            type="button"
            class="text-xs px-2 py-1 rounded border"
            style="border-color: hsl(var(--border))"
            on:click={close}
          >
            Close
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
