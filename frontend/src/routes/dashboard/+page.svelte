<script lang="ts">
  import type { PageData } from './$types';
  import FileCard from '$components/dashboard/FileCard.svelte';
  import FilePreviewModal from '$components/dashboard/FilePreviewModal.svelte';

  export let data: PageData;

  const formatBytes = (bytes: number | string | null | undefined) => {
    if (bytes === null || bytes === undefined) return '0 B';
    const n = typeof bytes === 'string' ? Number.parseInt(bytes, 10) : bytes;
    if (!n || n <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(n) / Math.log(k));
    const num = n / Math.pow(k, i);
    return `${num.toFixed(num >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  };

  const API_BASE = 'http://localhost:3000';

  let previewOpen = false;
  let previewFile: any = null;

  const openPreviewModal = (file: any) => {
    previewFile = file;
    previewOpen = true;
  };

  const closePreviewModal = () => {
    previewOpen = false;
    previewFile = null;
  };

  // --- Action handlers from modal events ---

  const handleDownload = (event: CustomEvent<{ file: any }>) => {
    const { file } = event.detail;
    // You already have direct <a> download, so this is optional.
    // Could be used for logging / analytics.
    console.log('Download requested for', file.id);
  };

  const handleShare = (event: CustomEvent<{ file: any; url: string }>) => {
    const { file, url } = event.detail;
    console.log('Share link for', file.id, url);
    // could show a toast
  };

  const handleRename = async (event: CustomEvent<{ file: any; newName: string }>) => {
    const { file, newName } = event.detail;

    try {
      const res = await fetch(`${API_BASE}/files/${encodeURIComponent(file.id)}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: newName })
      });

      if (!res.ok) throw new Error('Failed to rename file');

      // update local data without full reload
      file.filename = newName;
      if (previewFile && previewFile.id === file.id) {
        previewFile = { ...previewFile, filename: newName };
      }
    } catch (err) {
      console.error(err);
      alert('Could not rename file. Please try again.');
    }
  };

  const handleDelete = async (event: CustomEvent<{ file: any }>) => {
    const { file } = event.detail;

    try {
      const res = await fetch(`${API_BASE}/files/${encodeURIComponent(file.id)}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete file');

      // remove from local list
      data.files = data.files.filter((f) => f.id !== file.id);
      data.stats.files = data.stats.files - 1;

      if (previewFile && previewFile.id === file.id) {
        closePreviewModal();
      }
    } catch (err) {
      console.error(err);
      alert('Could not delete file. Please try again.');
    }
  };
</script>

<section class="px-4 py-4 md:px-6 md:py-6 text-slate-50">
  <div class="mb-5 flex items-center justify-between">
    <div>
      <h1 class="text-lg font-semibold md:text-xl">Dashboard</h1>
      <p class="text-[0.75rem] text-slate-400">Files overview</p>
    </div>
  </div>

  <div class="space-y-5 text-xs">
    <!-- Stats cards -->
    <div class="grid gap-3 md:grid-cols-3">
      <div class="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
        <p class="text-[0.7rem] text-slate-400">Files</p>
        <p class="mt-1 text-2xl font-semibold text-slate-50">
          {data.stats.files}
        </p>
      </div>

      <div class="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
        <p class="text-[0.7rem] text-slate-400">Shares</p>
        <p class="mt-1 text-2xl font-semibold text-slate-50">
          {data.stats.shares}
        </p>
      </div>

      <div class="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
        <p class="text-[0.7rem] text-slate-400">Logs</p>
        <p class="mt-1 text-2xl font-semibold text-slate-50">
          {data.stats.logs}
        </p>
      </div>
    </div>

    <!-- Files list -->
    <div class="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-50">Your files</h2>
        <p class="text-[0.7rem] flex text-slate-400">
          Total size: {formatBytes(data.stats.totalSize)}
        </p>
      </div>

      {#if data.files.length === 0}
        <p class="text-[0.75rem] text-slate-400">
          No files found. Go to the <a
            href="/dashboard/files"
            class="text-cyan-300 hover:text-cyan-200">Files</a
          >
          page to upload.
        </p>
      {:else}
        <div class="grid gap-3">
          {#each data.files as f (f.id)}
            <FileCard
              file={f}
              on:preview={() => openPreviewModal(f)}
            />
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Preview modal with full actions -->
  <FilePreviewModal
    bind:open={previewOpen}
    file={previewFile}
    apiBase={API_BASE}
    on:close={closePreviewModal}
    on:download={handleDownload}
    on:share={handleShare}
    on:rename={handleRename}
    on:delete={handleDelete}
  />
</section>
