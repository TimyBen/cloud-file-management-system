<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let file: any = null;
  export let apiBase = 'http://localhost:3000';

  $: mime = file?.mimeType || file?.file_type || '';
  $: fileName = file?.filename ?? file?.name ?? 'Unknown file';

  $: fileUrl = file
    ? `${apiBase}/files/download/${encodeURIComponent(file.id)}`
    : '';

  $: isImage = mime?.startsWith('image/');
  $: isVideo = mime?.startsWith('video/');
  $: isAudio = mime?.startsWith('audio/');
  $: isPdf = mime === 'application/pdf' || mime?.includes('pdf');
  $: isText = mime?.startsWith('text/') || mime === 'application/json';

  let renaming = false;
  let newName = '';

  $: if (open && file && !renaming) {
    newName = fileName;
  }

  const close = () => {
    dispatch('close');
  };

  const handleDownload = () => {
    // Let parent know, but we also keep the <a> link for default behavior
    dispatch('download', { file });
  };

  const handleDelete = async () => {
    if (!file) return;
    const ok = confirm(`Delete "${fileName}"? This action cannot be undone.`);
    if (!ok) return;
    dispatch('delete', { file });
  };

  const handleRename = () => {
    if (!file) return;
    renaming = true;
    newName = fileName;
  };

  const submitRename = () => {
    if (!file || !newName.trim()) {
      renaming = false;
      return;
    }
    dispatch('rename', {
      file,
      newName: newName.trim()
    });
    renaming = false;
  };

  const cancelRename = () => {
    renaming = false;
    newName = fileName;
  };

  let shareMessage = '';
  let sharing = false;

  const buildShareUrl = () => {
    // Adjust to your real share route if needed
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : apiBase;
    return `${origin}/share/${encodeURIComponent(file.id)}`;
  };

  const handleShare = async () => {
    if (!file) return;
    const url = buildShareUrl();
    sharing = true;
    shareMessage = '';

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        shareMessage = 'Link copied to clipboard';
      } else {
        shareMessage = url;
      }
      dispatch('share', { file, url });
    } catch (e) {
      shareMessage = url; // fallback to just showing the URL
    } finally {
      sharing = false;
    }
  };
</script>

{#if open && file}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-label="File preview"
    on:click|self={close}
  >
    <!-- Modal -->
    <div
      class="
        relative w-full max-w-3xl
        max-h-[90vh]
        rounded-2xl border border-slate-800 bg-slate-950/95
        shadow-xl
        flex flex-col
      "
    >
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div class="min-w-0">
          {#if !renaming}
            <p class="truncate text-sm font-semibold text-slate-50">
              {fileName}
            </p>
          {:else}
            <div class="flex items-center gap-2">
              <input
                bind:value={newName}
                class="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="button"
                class="rounded-md bg-cyan-600 px-2 py-1 text-[0.7rem] text-white hover:bg-cyan-500"
                on:click={submitRename}
              >
                Save
              </button>
              <button
                type="button"
                class="rounded-md border border-slate-600 px-2 py-1 text-[0.7rem] text-slate-200 hover:bg-slate-800"
                on:click={cancelRename}
              >
                Cancel
              </button>
            </div>
          {/if}
          <p class="text-[0.7rem] text-slate-400">
            {mime || 'Unknown type'}
          </p>
          {#if shareMessage}
            <p class="mt-1 text-[0.65rem] text-cyan-300">
              {shareMessage}
            </p>
          {/if}
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <!-- Download -->
          <a
            href={fileUrl}
            class="rounded-full border border-slate-700 px-3 py-1.5 text-[0.7rem] text-slate-100 hover:bg-slate-800"
            target="_blank"
            rel="noreferrer"
            on:click|stopPropagation={handleDownload}
          >
            Download
          </a>

          <!-- Share -->
          <button
            type="button"
            class="rounded-full border border-slate-700 px-3 py-1.5 text-[0.7rem] text-slate-100 hover:bg-slate-800 disabled:opacity-60"
            on:click|stopPropagation={handleShare}
            disabled={sharing}
          >
            {sharing ? 'Copying…' : 'Share link'}
          </button>

          <!-- Rename -->
          {#if !renaming}
            <button
              type="button"
              class="rounded-full border border-slate-700 px-3 py-1.5 text-[0.7rem] text-slate-100 hover:bg-slate-800"
              on:click|stopPropagation={handleRename}
            >
              Rename
            </button>
          {/if}

          <!-- Delete -->
          <button
            type="button"
            class="rounded-full border border-red-700 px-3 py-1.5 text-[0.7rem] text-red-200 hover:bg-red-900/70"
            on:click|stopPropagation={handleDelete}
          >
            Delete
          </button>

          <!-- Close -->
          <button
            type="button"
            class="rounded-full border border-slate-700 px-2.5 py-1 text-[0.7rem] text-slate-200 hover:bg-slate-800"
            on:click|stopPropagation={close}
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden px-4 py-3">
        <!-- Image -->
        {#if isImage}
          <div class="flex h-full items-center justify-center">
            <img
              src={fileUrl}
              alt={fileName}
              class="max-h-[70vh] max-w-full rounded-lg object-contain"
            />
          </div>

        <!-- PDF -->
        {:else if isPdf}
          <div class="h-[70vh]">
            <iframe
              src={fileUrl}
              class="h-full w-full rounded-lg border border-slate-800"
            >
            </iframe>
          </div>

        <!-- Video -->
        {:else if isVideo}
          <div class="flex h-full items-center justify-center">
            <video
              src={fileUrl}
              controls
              class="max-h-[70vh] w-full rounded-lg"
            />
          </div>

        <!-- Audio -->
        {:else if isAudio}
          <div class="flex h-full flex-col items-center justify-center gap-4">
            <p class="text-sm text-slate-200">
              Audio preview
            </p>
            <audio
              src={fileUrl}
              controls
              class="w-full"
            />
          </div>

        <!-- Text / JSON -->
        {:else if isText}
          <iframe
            src={fileUrl}
            class="h-[70vh] w-full rounded-lg border border-slate-800 bg-slate-950 text-left"
          >
          </iframe>

        <!-- Fallback -->
        {:else}
          <div class="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p class="text-sm text-slate-100">
              No inline preview available for this file type.
            </p>
            <p class="text-[0.75rem] text-slate-400">
              You can download the file and open it with an appropriate app.
            </p>
            <a
              href={fileUrl}
              class="rounded-full border border-slate-700 px-4 py-1.5 text-[0.75rem] text-slate-100 hover:bg-slate-800"
              target="_blank"
              rel="noreferrer"
            >
              Download file
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
