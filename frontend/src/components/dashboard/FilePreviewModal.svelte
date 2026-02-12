<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let file: any = null;
  export let apiBase = 'http://localhost:3000';

  // ─────────── Derived metadata ───────────
  $: mime = file?.mime_type || file?.mimeType || file?.file_type || '';
  $: fileName = file?.filename ?? file?.name ?? 'Unknown file';

  $: isImage = (mime || '').startsWith('image/');
  $: isVideo = (mime || '').startsWith('video/');
  $: isAudio = (mime || '').startsWith('audio/');
  $: isPdf = mime === 'application/pdf' || (mime || '').toLowerCase().includes('pdf');
  $: isText = (mime || '').startsWith('text/') || mime === 'application/json';

  // ─────────── Signed URL state ───────────
  let signedUrl = '';
  let signedFilename = '';
  let loadingUrl = false;
  let urlError = '';

  let lastFetchedId: string | null = null;

  // Fetch signed url when modal opens (only when file id changes)
  $: if (open && file?.id && file.id !== lastFetchedId) {
    fetchSignedUrl(file.id);
  }

  async function fetchSignedUrl(id: string) {
    lastFetchedId = id;
    loadingUrl = true;
    urlError = '';
    signedUrl = '';
    signedFilename = '';

    try {
      const res = await fetch(`${apiBase}/files/download/${encodeURIComponent(id)}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Failed to get download url (${res.status}) ${txt}`);
      }

      const data = await res.json();
      signedUrl = data.downloadUrl || '';
      signedFilename = data.filename || fileName;
    } catch (e: any) {
      console.error(e);
      urlError = 'Could not load preview/download link.';
    } finally {
      loadingUrl = false;
    }
  }

  // reset when closed
  $: if (!open) {
    signedUrl = '';
    signedFilename = '';
    loadingUrl = false;
    urlError = '';
    lastFetchedId = null;
    renaming = false;
    shareMessage = '';
    sharing = false;
  }

  // ─────────── Actions ───────────
  const close = () => dispatch('close');

  async function downloadFile() {
    if (!browser || !file?.id) return;

    try {
      const res = await fetch(`${apiBase}/files/download/${encodeURIComponent(file.id)}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Download failed (${res.status}) ${t}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      dispatch('download', { file });
    } catch (err) {
      console.error(err);
      alert('Could not download file.');
    }
  }
  
  // ─────────── Share ───────────
  let shareMessage = '';
  let sharing = false;

  const buildShareUrl = () => {
    const origin = browser ? window.location.origin : apiBase;
    return `${origin}/share/${encodeURIComponent(file.id)}`;
  };

  const handleShare = async () => {
    if (!file) return;
    sharing = true;
    shareMessage = '';

    const url = buildShareUrl();

    try {
      if (browser && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        shareMessage = 'Link copied to clipboard';
      } else {
        shareMessage = url;
      }
      dispatch('share', { file, url });
    } catch {
      shareMessage = url;
    } finally {
      sharing = false;
    }
  };

  // ─────────── Rename ───────────
  let renaming = false;
  let newName = '';

  $: if (open && file && !renaming) {
    newName = fileName;
  }

  const startRename = () => {
    renaming = true;
    newName = fileName;
  };

  const cancelRename = () => {
    renaming = false;
    newName = fileName;
  };

  const submitRename = () => {
    const trimmed = (newName || '').trim();
    if (!trimmed) return cancelRename();
    dispatch('rename', { file, newName: trimmed });
    renaming = false;
  };

  // ─────────── Delete ───────────
  const handleDelete = () => {
    if (!file) return;
    const ok = confirm(`Delete "${fileName}"? This action cannot be undone.`);
    if (ok) dispatch('delete', { file });
  };
</script>

{#if open && file}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click|self={close}
  >
    <div class="relative w-full max-w-3xl max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-950/95 shadow-xl flex flex-col">
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div class="min-w-0">
          {#if !renaming}
            <p class="truncate text-sm font-semibold text-slate-50">{fileName}</p>
          {:else}
            <div class="flex items-center gap-2">
              <input
                bind:value={newName}
                class="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
              />
              <button
                type="button"
                class="rounded-md bg-cyan-600 px-2 py-1 text-[0.7rem] text-white"
                on:click|stopPropagation={submitRename}
              >
                Save
              </button>
              <button
                type="button"
                class="rounded-md border border-slate-600 px-2 py-1 text-[0.7rem] text-slate-200"
                on:click|stopPropagation={cancelRename}
              >
                Cancel
              </button>
            </div>
          {/if}

          <p class="text-[0.7rem] text-slate-400">{mime || 'Unknown type'}</p>

          {#if shareMessage}
            <p class="mt-1 text-[0.65rem] text-cyan-300">{shareMessage}</p>
          {/if}
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="rounded-full border border-slate-700 px-3 py-1.5 text-[0.7rem] text-slate-100 disabled:opacity-60"
            on:click|stopPropagation={downloadFile}
            disabled={!signedUrl || loadingUrl}
          >
            {loadingUrl ? 'Preparing…' : 'Download'}
          </button>

          <button
            type="button"
            class="rounded-full border border-slate-700 px-3 py-1.5 text-[0.7rem] text-slate-100 disabled:opacity-60"
            on:click|stopPropagation={handleShare}
            disabled={sharing}
          >
            {sharing ? 'Copying…' : 'Share link'}
          </button>

          {#if !renaming}
            <button
              type="button"
              class="rounded-full border border-slate-700 px-3 py-1.5 text-[0.7rem] text-slate-100"
              on:click|stopPropagation={startRename}
            >
              Rename
            </button>
          {/if}

          <button
            type="button"
            class="rounded-full border border-red-700 px-3 py-1.5 text-[0.7rem] text-red-200"
            on:click|stopPropagation={handleDelete}
          >
            Delete
          </button>

          <button
            type="button"
            class="rounded-full border border-slate-700 px-2.5 py-1 text-[0.7rem] text-slate-200"
            on:click|stopPropagation={close}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden px-4 py-3">
        {#if loadingUrl}
          <p class="text-sm text-slate-400">Loading preview…</p>
        {:else if urlError}
          <p class="text-sm text-red-400">{urlError}</p>
        {:else if signedUrl}
          {#if isImage}
            <img src={signedUrl} alt={fileName} class="mx-auto max-h-[70vh] rounded-lg object-contain" />
          {:else if isPdf}
            <iframe src={signedUrl} title={`Preview: ${fileName}`} class="h-[70vh] w-full rounded-lg border border-slate-800"></iframe>
          {:else if isVideo}
            <video src={signedUrl} controls class="mx-auto max-h-[70vh] w-full rounded-lg">
              <track kind="captions" src="" srclang="en" label="English" default />
            </video>
          {:else if isAudio}
            <audio src={signedUrl} controls class="w-full"></audio>
          {:else if isText}
            <iframe src={signedUrl} title={`Preview: ${fileName}`} class="h-[70vh] w-full rounded-lg border border-slate-800"></iframe>
          {:else}
            <div class="text-center text-slate-300">
              No inline preview available.
              <div class="mt-2">
                <button
                  type="button"
                  class="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-100"
                  on:click|stopPropagation={downloadFile}
                >
                  Download instead
                </button>
              </div>
            </div>
          {/if}
        {:else}
          <p class="text-sm text-slate-400">No preview URL.</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
