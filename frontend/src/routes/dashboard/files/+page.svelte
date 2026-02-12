<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { enhance } from '$app/forms';
  import FileCard from '$components/dashboard/FileCard.svelte';
  import FilePreviewModal from '$components/dashboard/FilePreviewModal.svelte';
  import { files } from '$lib/stores/files';
  import { searchQuery, filteredFiles, formatFileSize } from '$lib/stores/search';
  import { auth } from '$lib/stores/auth';

  export let data;

  let currentSearch = '';
  let isLoading = false;
  let previewOpen = false;
  let previewFile: any = null;
  let unsubscribeFiles: () => void;
  let unsubscribeSearch: () => void;
  let authToken = '';

  const API_BASE = 'http://localhost:3000';

  // ---------- Upload UI state ----------
  let selectedFiles: File[] = [];
  let picking = false;

  type UploadStatus = 'queued' | 'uploading' | 'done' | 'error';
  type UploadItem = {
    id: string;
    name: string;
    size: number;
    progress: number; // 0..100
    status: UploadStatus;
    message?: string;
  };

  let uploadToastOpen = false;
  let uploadItems: UploadItem[] = [];

  const genId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  function getToken() {
    return auth.getToken?.() || localStorage.getItem('auth.token') || '';
  }

  function filenameExists(name: string) {
    const list = $files?.files || [];
    return list.some((f: any) => (f?.filename || '').toLowerCase() === name.toLowerCase());
  }

  function addUploadItem(file: File): UploadItem {
    const item: UploadItem = {
      id: genId(),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'queued'
    };
    uploadItems = [item, ...uploadItems];
    uploadToastOpen = true;
    return item;
  }

  function updateUploadItem(id: string, patch: Partial<UploadItem>) {
    uploadItems = uploadItems.map((u) => (u.id === id ? { ...u, ...patch } : u));
  }

  function clearFinishedUploads() {
    uploadItems = uploadItems.filter((u) => u.status === 'uploading' || u.status === 'queued' || u.status === 'error');
    if (uploadItems.length === 0) uploadToastOpen = false;
  }

  function closeToast() {
    uploadToastOpen = false;
  }

  function formatBytes(bytes: number) {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const num = bytes / Math.pow(k, i);
    return `${num.toFixed(num >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  }

  // XHR upload so we can track progress
  function uploadOneXHR(opts: {
    file: File;
    token: string;
    mode: 'new' | 'update';
    onProgress: (pct: number) => void;
  }): Promise<any> {
    const { file, token, mode, onProgress } = opts;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${API_BASE}/files/upload?mode=${encodeURIComponent(mode)}`;

      xhr.open('POST', url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress(pct);
      };

      xhr.onload = () => {
        try {
          const ok = xhr.status >= 200 && xhr.status < 300;
          const json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
          if (!ok) {
            reject(new Error(json?.message || `Upload failed (${xhr.status})`));
            return;
          }
          resolve(json);
        } catch (e: any) {
          reject(new Error(e?.message || 'Upload failed (bad response)'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));

      const form = new FormData();
      // IMPORTANT: backend expects field name "file"
      form.append('file', file);

      xhr.send(form);
    });
  }

  // Upload button click handler (single/multi auto)
  async function startUpload() {
    const list = selectedFiles;
    if (!list || list.length === 0) return;

    const token = getToken();
    authToken = token;

    if (!token) {
      alert('Missing auth token. Please log in again.');
      return;
    }

    // Upload sequentially so duplicate decision can be per-file
    for (const f of list) {
      const item = addUploadItem(f);

      let mode: 'new' | 'update' = 'new';

      if (filenameExists(f.name)) {
        const ok = confirm(
          `"${f.name}" already exists.\n\nOK = Update (new version)\nCancel = Save as a new file (auto becomes "name (2).ext")`
        );
        mode = ok ? 'update' : 'new';
      }

      try {
        updateUploadItem(item.id, { status: 'uploading', progress: 0 });

        const res = await uploadOneXHR({
          file: f,
          token,
          mode,
          onProgress: (pct) => updateUploadItem(item.id, { progress: pct })
        });

        // Your service returns: { message, file }
        const serverFile = res?.file ?? res;

        if (serverFile) {
          files.addFile(serverFile);
        }

        updateUploadItem(item.id, { status: 'done', progress: 100, message: 'Uploaded' });
      } catch (err: any) {
        updateUploadItem(item.id, {
          status: 'error',
          message: err?.message || 'Upload failed'
        });
      }
    }

    // reset selection
    selectedFiles = [];
    picking = false;

    // Auto-collapse toast after a bit if nothing is uploading and no errors
    setTimeout(() => {
      const stillBusy = uploadItems.some((u) => u.status === 'uploading' || u.status === 'queued');
      const hasError = uploadItems.some((u) => u.status === 'error');
      if (!stillBusy && !hasError) uploadToastOpen = false;
    }, 1200);
  }

  function onPickFiles(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const list = input.files ? Array.from(input.files) : [];
    selectedFiles = list;
    picking = list.length > 0;
  }

  // ---------- Existing page logic ----------
  onMount(() => {
    authToken = getToken();
    console.log(authToken);

    if (data?.files && data.files.length > 0) {
      console.log('📁 Caching files from files page');
      files.setFiles(data.files);
    }

    unsubscribeSearch = searchQuery.subscribe((query) => {
      currentSearch = query;
    });

    unsubscribeFiles = files.subscribe((store) => {
      isLoading = store.isLoading;
    });

    if (files.shouldFetch()) {
      console.log('📁 Loading files from API (cache stale)');
      files.loadFiles().catch((err) => {
        console.error('Failed to load files:', err);
      });
    }
  });

  onDestroy(() => {
    if (unsubscribeFiles) unsubscribeFiles();
    if (unsubscribeSearch) unsubscribeSearch();
  });

  const filesToDisplay =
    currentSearch.trim() && $filteredFiles.length > 0 ? $filteredFiles : $files.files;

  function formatFileCount(count: number): string {
    if (count === 0) return 'No files';
    if (count === 1) return '1 file';
    return `${count} files`;
  }

  function calculateTotalSize(filesArray: any[]): number {
    if (!Array.isArray(filesArray)) return 0;
    return filesArray.reduce((sum, file) => sum + (file.file_size || 0), 0);
  }

  const openPreviewModal = (file: any) => {
    previewFile = file;
    previewOpen = true;
  };

  const closePreviewModal = () => {
    previewOpen = false;
    previewFile = null;
  };

  const handleDownload = (event: CustomEvent<{ file: any }>) => {
    const { file } = event.detail;
    console.log('Download requested for', file.id);

    const downloadUrl = `${API_BASE}/files/${file.id}`;
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleShare = async (event: CustomEvent<{ file: any; url: string }>) => {
    const { file, url } = event.detail;
    console.log('Share link for', file.id, url);

    try {
      const res = await fetch(`${API_BASE}/files/${encodeURIComponent(file.id)}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ share: true })
      });

      if (!res.ok) throw new Error('Failed to share file');

      const data = await res.json();

      files.updateFile(file.id, {
        shared: true,
        share_url: data.share_url || url
      });

      if (previewFile && previewFile.id === file.id) {
        previewFile = {
          ...previewFile,
          shared: true,
          share_url: data.share_url || url
        };
      }
    } catch (err) {
      console.error(err);
      alert('Could not share file. Please try again.');
    }
  };

  const handleRename = async (event: CustomEvent<{ file: any; newName: string }>) => {
    const { file, newName } = event.detail;

    try {
      const res = await fetch(`${API_BASE}/files/${encodeURIComponent(file.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ filename: newName })
      });

      if (!res.ok) throw new Error('Failed to rename file');

      files.updateFile(file.id, { filename: newName });

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
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete file');
      }

      files.removeFile(file.id);

      if (previewFile && previewFile.id === file.id) {
        closePreviewModal();
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Could not delete file: ${err.message}`);
    }
  };

  let showSearchIndicator = false;
  $: showSearchIndicator = currentSearch.trim() && $filteredFiles.length > 0;
</script>

<section class="space-y-6 p-4 md:p-6">
  <!-- Search Status Indicator -->
  {#if showSearchIndicator}
    <div
      class="mb-4 p-3 rounded-lg border flex items-center justify-between"
      style="border-color: hsl(var(--border)); background-color: hsl(var(--card))"
    >
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" style="color: hsl(var(--primary))" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span class="text-sm" style="color: hsl(var(--foreground))">
          Showing {$filteredFiles.length} results for "<span class="font-medium">{currentSearch}</span>"
        </span>
      </div>
      <button
        on:click={() => searchQuery.set('')}
        class="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        style="color: hsl(var(--muted-foreground))"
      >
        Clear search
      </button>
    </div>
  {/if}

  <!-- Header with search status -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl md:text-3xl font-bold" style="color: hsl(var(--foreground))">
        {#if showSearchIndicator}
          Search Results
        {:else}
          Your Files
        {/if}
      </h1>
      <p class="text-sm mt-1" style="color: hsl(var(--muted-foreground))">
        {#if isLoading}
          Loading files...
        {:else if currentSearch.trim()}
          {#if $filteredFiles.length > 0}
            {$filteredFiles.length} of {$files.files?.length || 0} files match your search
          {:else}
            No files found for "{currentSearch}"
          {/if}
        {:else}
          {formatFileCount($files.files?.length || 0)}
          {#if $files.files?.length > 0}
            • {formatFileSize(calculateTotalSize($files.files))} total
          {/if}
        {/if}
      </p>
    </div>

    <!-- Clear search button -->
    {#if currentSearch.trim()}
      <button
        on:click={() => searchQuery.set('')}
        class="px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2"
        style="background-color: hsl(var(--muted)); color: hsl(var(--foreground))"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Clear search
      </button>
    {/if}
  </div>

  <!-- Upload section (KEEP STYLE, but behavior is JS + progress) -->
  <div
    class="p-4 md:p-6 rounded-xl border shadow-sm space-y-3"
    style="background-color: hsl(var(--card)); border-color: hsl(var(--border))"
  >
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div class="flex-1">
        <input
          type="file"
          name="file"
          multiple
          on:change={onPickFiles}
          class="w-full text-sm"
          style="color: hsl(var(--muted-foreground))"
        />

        <p class="text-xs mt-2" style="color: hsl(var(--muted-foreground))">
          Max file size: 100MB. Supported formats: Images, Documents, Videos
        </p>

        {#if picking}
          <p class="text-xs mt-1" style="color: hsl(var(--muted-foreground))">
            Selected: <span style="color: hsl(var(--foreground))">{selectedFiles.length}</span>
            file{selectedFiles.length === 1 ? '' : 's'}
          </p>
        {/if}
      </div>

      <button
        type="button"
        on:click={startUpload}
        disabled={!picking}
        class="px-6 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground));"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload File
      </button>
    </div>
  </div>

  <!-- Files list -->
  {#if isLoading}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-3" style="color: hsl(var(--muted-foreground))">Loading your files...</p>
    </div>
  {:else if filesToDisplay.length === 0}
    <div class="text-center py-12 md:py-16">
      {#if currentSearch.trim()}
        <div class="max-w-md mx-auto">
          <svg class="w-16 h-16 mx-auto" style="color: hsl(var(--muted-foreground))" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium" style="color: hsl(var(--foreground))">No matching files</h3>
          <p class="mt-2 text-sm" style="color: hsl(var(--muted-foreground))">
            No files found for "{currentSearch}". Try different keywords.
          </p>
          <button
            on:click={() => searchQuery.set('')}
            class="mt-4 px-4 py-2 text-sm text-white rounded-lg transition-colors"
            style="background-color: hsl(var(--primary))"
          >
            View all files
          </button>
        </div>
      {:else}
        <div class="max-w-md mx-auto">
          <svg class="w-16 h-16 mx-auto" style="color: hsl(var(--muted-foreground))" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium" style="color: hsl(var(--foreground))">No files yet</h3>
          <p class="mt-2 text-sm" style="color: hsl(var(--muted-foreground))">
            Upload your first file to get started.
          </p>
        </div>
      {/if}
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {#each filesToDisplay as file (file.id)}
        <div class="group relative">
          <form
            method="POST"
            action="?/delete"
            use:enhance={({ result }) => {
              if (result.type === 'success') {
                files.removeFile(file.id);
              }
            }}
          >
            <input type="hidden" name="id" value={file.id} />
            <FileCard {file} on:preview={() => openPreviewModal(file)} />
          </form>

          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              type="button"
              on:click={() => openPreviewModal(file)}
              class="p-1.5 rounded-md shadow-sm transition-colors"
              style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))"
              title="Preview"
            >
              <svg class="w-4 h-4" style="color: hsl(var(--muted-foreground))" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            {#if file.share_url}
              <button
                type="button"
                on:click={() => window.open(file.share_url, '_blank')}
                class="p-1.5 rounded-md shadow-sm transition-colors"
                style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))"
                title="Open share link"
              >
                <svg class="w-4 h-4" style="color: hsl(142, 76%, 36%)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-6 pt-4 border-t" style="border-color: hsl(var(--border))">
      <div class="flex flex-wrap items-center justify-between gap-4 text-sm" style="color: hsl(var(--muted-foreground))">
        <div class="flex items-center gap-4">
          <span>Showing: {filesToDisplay.length} file{filesToDisplay.length !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{formatFileSize(calculateTotalSize(filesToDisplay))}</span>
          {#if showSearchIndicator}
            <span>•</span>
            <span style="color: hsl(var(--primary))">Search results</span>
            <span>•</span>
            <span>{$files.files?.length || 0} total files</span>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</section>

<FilePreviewModal
  bind:open={previewOpen}
  file={previewFile}
  apiBase={API_BASE}
  authToken={authToken}
  on:close={closePreviewModal}
  on:download={handleDownload}
  on:share={handleShare}
  on:rename={handleRename}
  on:delete={handleDelete}
/>

<!-- Bottom-right upload queue toast (Google Drive style) -->
{#if uploadToastOpen}
  <div class="fixed bottom-4 right-4 z-50 w-[340px] max-w-[90vw]">
    <div
      class="rounded-xl border shadow-lg overflow-hidden"
      style="background-color: hsl(var(--card)); border-color: hsl(var(--border))"
    >
      <div class="px-4 py-3 flex items-center justify-between border-b" style="border-color: hsl(var(--border))">
        <div class="text-sm font-semibold" style="color: hsl(var(--foreground))">
          Uploads
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="text-xs px-2 py-1 rounded"
            style="border: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground))"
            on:click={clearFinishedUploads}
          >
            Clear
          </button>
          <button
            type="button"
            class="text-xs px-2 py-1 rounded"
            style="border: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground))"
            on:click={closeToast}
          >
            ✕
          </button>
        </div>
      </div>

      <div class="max-h-[280px] overflow-auto">
        {#each uploadItems as u (u.id)}
          <div class="px-4 py-3 border-b" style="border-color: hsl(var(--border))">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="text-sm truncate" style="color: hsl(var(--foreground))">
                  {u.name}
                </div>
                <div class="text-xs" style="color: hsl(var(--muted-foreground))">
                  {formatBytes(u.size)}
                  {#if u.status === 'uploading'} • Uploading…{/if}
                  {#if u.status === 'done'} • Done{/if}
                  {#if u.status === 'error'} • Error{/if}
                </div>
              </div>

              <div class="text-xs shrink-0" style="color: hsl(var(--muted-foreground))">
                {#if u.status === 'uploading' || u.status === 'done'}
                  {u.progress}%
                {/if}
              </div>
            </div>

            <div class="mt-2 h-2 rounded-full overflow-hidden" style="background-color: hsl(var(--muted))">
              <div
                class="h-full"
                style="
                  width: {Math.min(100, Math.max(0, u.progress))}%;
                  background-color: {u.status === 'error' ? 'hsl(0 84% 60%)' : 'hsl(var(--primary))'};
                  transition: width 150ms linear;
                "
              />
            </div>

            {#if u.message}
              <div class="mt-1 text-xs" style="color: {u.status === 'error' ? 'hsl(0 84% 60%)' : 'hsl(var(--muted-foreground))'}">
                {u.message}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  /* keep your existing hover behavior */
  .group:hover .opacity-0 {
    opacity: 1 !important;
    transition: opacity 0.2s ease;
  }

  /* --- Upload input theme consistency --- */
input[type="file"] {
  color: hsl(var(--muted-foreground));
}

/* The "Choose File" button part */
input[type="file"]::file-selector-button {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  border: 1px solid hsl(var(--border));
  padding: 10px 16px;
  border-radius: 12px;
  margin-right: 14px;
  cursor: pointer;
  transition: opacity 150ms ease;
}

  input[type="file"]::file-selector-button:hover {
    opacity: 0.9;
  }

  /* Safari fallback */
  input[type="file"]::-webkit-file-upload-button {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
    border: 1px solid hsl(var(--border));
    padding: 10px 16px;
    border-radius: 12px;
    margin-right: 14px;
    cursor: pointer;
    transition: opacity 150ms ease;
  }

  input[type="file"]::-webkit-file-upload-button:hover {
    opacity: 0.9;
  }

  form {
    transition: all 0.2s ease;
  }
</style>
