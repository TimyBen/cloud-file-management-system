<script lang="ts">
  import type { PageData } from './$types';
  import FileCard from '$components/dashboard/FileCard.svelte';
  import FilePreviewModal from '$components/dashboard/FilePreviewModal.svelte';
  import ThemeToggle from '$components/ui/ThemeToggle.svelte';
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

  // Calculate total size from files array
  const calculateTotalSize = (files: any[]) => {
    if (!Array.isArray(files)) return 0;
    return files.reduce((sum, f) => sum + (Number(f.file_size) || 0), 0);
  };

  // Calculate shares count from files array
  const calculateShares = (files: any[]) => {
    if (!Array.isArray(files)) return 0;
    return files.filter(f => f.shared === true || f.share_url).length;
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
    console.log('Download requested for', file.id);
  };

  const handleShare = (event: CustomEvent<{ file: any; url: string }>) => {
    const { file, url } = event.detail;
    console.log('Share link for', file.id, url);

    // Update file in data array
    const fileIndex = data.files.findIndex(f => f.id === file.id);
    if (fileIndex !== -1) {
      data.files[fileIndex] = { ...data.files[fileIndex], shared: true, share_url: url };
      // Recalculate stats
      data.stats.shares = calculateShares(data.files);
    }
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

      // Update file in data array
      const fileIndex = data.files.findIndex(f => f.id === file.id);
      if (fileIndex !== -1) {
        data.files[fileIndex] = { ...data.files[fileIndex], filename: newName };
      }

      // Update preview if open
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

    if (!confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/files/${encodeURIComponent(file.id)}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete file');

      // Remove from local list
      data.files = data.files.filter((f) => f.id !== file.id);

      // Update stats
      data.stats.files = data.files.length;
      data.stats.shares = calculateShares(data.files);
      data.stats.totalSize = calculateTotalSize(data.files);

      if (previewFile && previewFile.id === file.id) {
        closePreviewModal();
      }
    } catch (err) {
      console.error(err);
      alert('Could not delete file. Please try again.');
    }
  };
</script>

<section
  class="px-4 py-4 md:px-6 md:py-6"
  style="color: hsl(var(--foreground))"
>
  <!-- Compact Stats Grid - Labels above numbers -->
  <div class="grid grid-cols-3 gap-3 mb-6">
    <!-- Total Files -->
    <div
      class="rounded-lg border p-3 text-center"
      style="
        border-color: hsl(var(--border));
        background-color: hsl(var(--card));
      "
    >
      <p class="text-xs font-medium mb-1" style="color: hsl(var(--muted-foreground))">
        Total Files
      </p>
      <p class="text-xl font-bold" style="color: hsl(var(--foreground))">
        {data.stats.files}
      </p>
      <div class="mt-1 flex justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: hsl(var(--primary))">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      </div>
    </div>

    <!-- Shared Files -->
    <div
      class="rounded-lg border p-3 text-center"
      style="
        border-color: hsl(var(--border));
        background-color: hsl(var(--card));
      "
    >
      <p class="text-xs font-medium mb-1" style="color: hsl(var(--muted-foreground))">
        Shared Files
      </p>
      <p class="text-xl font-bold" style="color: hsl(var(--foreground))">
        {data.stats.shares}
      </p>
      <div class="mt-1 flex justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: hsl(142, 76%, 36%)">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </div>
    </div>

    <!-- Storage Used -->
    <div
      class="rounded-lg border p-3 text-center"
      style="
        border-color: hsl(var(--border));
        background-color: hsl(var(--card));
      "
    >
      <p class="text-xs font-medium mb-1" style="color: hsl(var(--muted-foreground))">
        Storage Used
      </p>
      <p class="text-xl font-bold" style="color: hsl(var(--foreground))">
        {formatBytes(data.stats.totalSize)}
      </p>
      <div class="mt-1 flex justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: hsl(217, 91%, 60%)">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      </div>
    </div>
  </div>

  <!-- Recent Files Section -->
  <div
    class="rounded-lg border"
    style="
      border-color: hsl(var(--border));
      background-color: hsl(var(--card));
    "
  >
    <!-- Header -->
    <div class="p-4 border-b flex items-center justify-between" style="border-color: hsl(var(--border))">
      <div>
        <h2 class="text-base font-semibold" style="color: hsl(var(--foreground))">
          Recent Files
        </h2>
        <p class="text-xs mt-0.5" style="color: hsl(var(--muted-foreground))">
          {data.files.length} files • {formatBytes(data.stats.totalSize)} used
        </p>
      </div>
      {#if data.files.length > 0}
        <a
          href="/dashboard/files"
          class="px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1.5"
          style="
            background-color: hsl(var(--accent));
            color: hsl(var(--accent-foreground));
          "
          on:mouseenter={(e) => e.currentTarget.style.opacity = '0.9'}
          on:mouseleave={(e) => e.currentTarget.style.opacity = '1'}
        >
          View All
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      {/if}
    </div>

    <!-- Files List -->
    <div class="p-4">
      {#if data.files.length === 0}
        <div class="text-center py-6">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
               style="background-color: hsl(var(--muted) / 0.3)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: hsl(var(--muted-foreground))">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-sm font-medium mb-1.5" style="color: hsl(var(--foreground))">
            No files yet
          </h3>
          <p class="text-xs mb-3" style="color: hsl(var(--muted-foreground))">
            Upload your first file to get started
          </p>
          <a
            href="/dashboard/files"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors"
            style="
              background-color: hsl(var(--primary));
              color: hsl(var(--primary-foreground));
            "
            on:mouseenter={(e) => e.currentTarget.style.opacity = '0.9'}
            on:mouseleave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Upload Files
          </a>
        </div>
      {:else}
        <div class="space-y-2">
          {#each data.files.slice(0, 6) as f (f.id)}
            <FileCard
              file={f}
              on:preview={() => openPreviewModal(f)}
            />
          {/each}
        </div>

        {#if data.files.length > 6}
          <div class="mt-4 pt-3 border-t text-center"
               style="border-color: hsl(var(--border))">
            <a
              href="/dashboard/files"
              class="inline-flex items-center gap-1 text-xs hover:underline"
              style="color: hsl(var(--primary))"
            >
              View all {data.files.length} files
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <!-- Status Indicators -->
  <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
    <div class="flex items-center gap-1.5 p-2.5 rounded-md"
         style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))">
      <div class="w-1.5 h-1.5 rounded-full" style="background-color: hsl(var(--primary))"></div>
      <span style="color: hsl(var(--muted-foreground))">Online</span>
    </div>
    <div class="flex items-center gap-1.5 p-2.5 rounded-md"
         style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: hsl(142, 76%, 36%)">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span style="color: hsl(var(--muted-foreground))">Synced</span>
    </div>
    <div class="flex items-center gap-1.5 p-2.5 rounded-md"
         style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: hsl(217, 91%, 60%)">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span style="color: hsl(var(--muted-foreground))">Secure</span>
    </div>
    <div class="flex items-center gap-1.5 p-2.5 rounded-md"
         style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color: hsl(173, 80%, 40%)">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span style="color: hsl(var(--muted-foreground))">Fast</span>
    </div>
  </div>
</section>

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