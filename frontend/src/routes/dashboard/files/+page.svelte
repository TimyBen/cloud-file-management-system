<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { enhance } from '$app/forms';

	import FileCard from '$components/dashboard/FileCard.svelte';
	import FilePreviewModal from '$components/dashboard/FilePreviewModal.svelte';

	import { files } from '$lib/stores/files';
	import { searchQuery, filteredFiles } from '$lib/stores/search';

	export let data;

	const API_BASE = 'http://localhost:3000';

	let currentSearch = '';
	let isLoading = false;

	let previewOpen = false;
	let previewFile: any = null;

	let unsubscribeFiles: () => void;
	let unsubscribeSearch: () => void;

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
		uploadItems = uploadItems.filter(
			(u) => u.status === 'uploading' || u.status === 'queued' || u.status === 'error'
		);
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

	// XHR upload with cookie auth (no Authorization header)
	function uploadOneXHR(opts: {
		file: File;
		mode: 'new' | 'update';
		onProgress: (pct: number) => void;
	}): Promise<any> {
		const { file, mode, onProgress } = opts;

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const url = `${API_BASE}/files/upload?mode=${encodeURIComponent(mode)}`;

			xhr.open('POST', url, true);

			// This is the cookie-auth equivalent of credentials:'include' for XHR
			xhr.withCredentials = true;

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
			form.append('file', file); // backend expects "file"
			xhr.send(form);
		});
	}

	async function startUpload() {
		const list = selectedFiles;
		if (!list || list.length === 0) return;

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
					mode,
					onProgress: (pct) => updateUploadItem(item.id, { progress: pct })
				});

				const serverFile = res?.file ?? res;
				if (serverFile) files.addFile(serverFile);

				updateUploadItem(item.id, { status: 'done', progress: 100, message: 'Uploaded' });
			} catch (err: any) {
				updateUploadItem(item.id, {
					status: 'error',
					message: err?.message || 'Upload failed'
				});
			}
		}

		selectedFiles = [];
		picking = false;

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
		if (data?.files && data.files.length > 0) {
			files.setFiles(data.files);
		}

		unsubscribeSearch = searchQuery.subscribe((query) => {
			currentSearch = query;
		});

		unsubscribeFiles = files.subscribe((store) => {
			isLoading = store.isLoading;
		});

		// NOTE: make sure files.loadFiles() also uses credentials:'include' internally.
		if (files.shouldFetch()) {
			files.loadFiles().catch((err) => console.error('Failed to load files:', err));
		}
	});

	onDestroy(() => {
		unsubscribeFiles?.();
		unsubscribeSearch?.();
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
		return filesArray.reduce((sum, file) => sum + (Number(file?.file_size) || 0), 0);
	}

	const openPreviewModal = (file: any) => {
		previewFile = file;
		previewOpen = true;
	};

	const closePreviewModal = () => {
		previewOpen = false;
		previewFile = null;
	};

	// Your modal now handles download via /files/download/:id (cookie auth),
	// so this can just be a signal/log.
	const handleDownload = (event: CustomEvent<{ file: any }>) => {
		const { file } = event.detail;
		console.log('Download requested for', file?.id);
	};

	// SHARE (cookie auth)
	const handleShare = async (
		event: CustomEvent<{
			file: any;
			sharedWithEmail: string;
			permission: 'read' | 'write' | 'comment';
		}>
	) => {
		const { file, sharedWithEmail, permission } = event.detail;

		if (!file?.id) return;

		if (!sharedWithEmail?.trim()) {
			alert('Please enter an email to share with.');
			return;
		}

		try {
			const res = await fetch(`${API_BASE}/shares`, {
				// ✅ fixed URL
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fileId: file.id,
					sharedWithEmail,
					permission
				})
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				throw new Error(data?.message || 'Failed to share file');
			}

			files.updateFile(file.id, {
				shared: true
			});

			if (previewFile && previewFile.id === file.id) {
				previewFile = {
					...previewFile,
					shared: true
				};
			}
		} catch (err: any) {
			console.error(err);
			alert(err.message || 'Could not share file.');
		}
	};

	// RENAME (cookie auth)
	const handleRename = async (event: CustomEvent<{ file: any; newName: string }>) => {
		const { file, newName } = event.detail;
		if (!file?.id || !newName?.trim()) return;

		try {
			const res = await fetch(`${API_BASE}/files/${encodeURIComponent(file.id)}`, {
				method: 'PATCH',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filename: newName.trim() })
			});

			if (!res.ok) throw new Error('Failed to rename file');

			files.updateFile(file.id, { filename: newName.trim() });

			if (previewFile && previewFile.id === file.id) {
				previewFile = { ...previewFile, filename: newName.trim() };
			}
		} catch (err) {
			console.error(err);
			alert('Could not rename file. Please try again.');
		}
	};

	// DELETE (cookie auth)
	const handleDelete = async (event: CustomEvent<{ file: any }>) => {
		const { file } = event.detail;
		if (!file?.id) return;

		if (!confirm(`Are you sure you want to delete "${file.filename}"?`)) return;

		try {
			const res = await fetch(`${API_BASE}/files/${encodeURIComponent(file.id)}`, {
				method: 'DELETE',
				credentials: 'include'
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.message || 'Failed to delete file');
			}

			files.removeFile(file.id);

			if (previewFile && previewFile.id === file.id) closePreviewModal();
		} catch (err: any) {
			console.error('Delete error:', err);
			alert(`Could not delete file: ${err.message}`);
		}
	};

	$: showSearchIndicator = currentSearch.trim() && $filteredFiles.length > 0;
</script>

<section class="space-y-6 p-4 md:p-6">
	<!-- Search Status Indicator -->
	{#if showSearchIndicator}
		<div
			class="mb-4 flex items-center justify-between rounded-lg border p-3"
			style="border-color: hsl(var(--border)); background-color: hsl(var(--card))"
		>
			<div class="flex items-center gap-2">
				<svg
					class="h-4 w-4"
					style="color: hsl(var(--primary))"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<span class="text-sm" style="color: hsl(var(--foreground))">
					Showing {$filteredFiles.length} results for "<span class="font-medium"
						>{currentSearch}</span
					>"
				</span>
			</div>
			<button
				on:click={() => searchQuery.set('')}
				class="rounded px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
				style="color: hsl(var(--muted-foreground))"
			>
				Clear search
			</button>
		</div>
	{/if}

	<!-- Header -->
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<h1 class="text-2xl font-bold md:text-3xl" style="color: hsl(var(--foreground))">
				{#if showSearchIndicator}Search Results{:else}Your Files{/if}
			</h1>
			<p class="mt-1 text-sm" style="color: hsl(var(--muted-foreground))">
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
						• {formatBytes(calculateTotalSize($files.files))} total
					{/if}
				{/if}
			</p>
		</div>

		{#if currentSearch.trim()}
			<button
				on:click={() => searchQuery.set('')}
				class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors"
				style="background-color: hsl(var(--muted)); color: hsl(var(--foreground))"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
				Clear search
			</button>
		{/if}
	</div>

	<!-- Upload section -->
	<div
		class="space-y-3 rounded-xl border p-4 shadow-sm md:p-6"
		style="background-color: hsl(var(--card)); border-color: hsl(var(--border))"
	>
		<div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
			<div class="flex-1">
				<input
					type="file"
					name="file"
					multiple
					on:change={onPickFiles}
					class="w-full text-sm"
					style="color: hsl(var(--muted-foreground))"
				/>
				<p class="mt-2 text-xs" style="color: hsl(var(--muted-foreground))">
					Max file size: 100MB. Supported formats: Images, Documents, Videos
				</p>
				{#if picking}
					<p class="mt-1 text-xs" style="color: hsl(var(--muted-foreground))">
						Selected: <span style="color: hsl(var(--foreground))">{selectedFiles.length}</span>
						file{selectedFiles.length === 1 ? '' : 's'}
					</p>
				{/if}
			</div>

			<button
				type="button"
				on:click={startUpload}
				disabled={!picking}
				class="flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
				style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground));"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/>
				</svg>
				Upload File
			</button>
		</div>
	</div>

	<!-- Files list -->
	{#if isLoading}
		<div class="py-12 text-center">
			<div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
			<p class="mt-3" style="color: hsl(var(--muted-foreground))">Loading your files...</p>
		</div>
	{:else if filesToDisplay.length === 0}
		<div class="py-12 text-center md:py-16">
			<div class="mx-auto max-w-md">
				<svg
					class="mx-auto h-16 w-16"
					style="color: hsl(var(--muted-foreground))"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<h3 class="mt-4 text-lg font-medium" style="color: hsl(var(--foreground))">
					{#if currentSearch.trim()}No matching files{:else}No files yet{/if}
				</h3>
				<p class="mt-2 text-sm" style="color: hsl(var(--muted-foreground))">
					{#if currentSearch.trim()}No files found for "{currentSearch}". Try different keywords.{:else}Upload
						your first file to get started.{/if}
				</p>
			</div>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filesToDisplay as file (file.id)}
				<div class="group relative">
					<form
						method="POST"
						action="?/delete"
						use:enhance={({ result }) => {
							if (result.type === 'success') files.removeFile(file.id);
						}}
					>
						<input type="hidden" name="id" value={file.id} />
						<FileCard {file} on:preview={() => openPreviewModal(file)} />
					</form>

					<div
						class="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
					>
						<button
							type="button"
							on:click={() => openPreviewModal(file)}
							class="rounded-md p-1.5 shadow-sm transition-colors"
							style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))"
							title="Preview"
						>
							<svg
								class="h-4 w-4"
								style="color: hsl(var(--muted-foreground))"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						</button>

						{#if file.share_url}
							<button
								type="button"
								on:click={() => window.open(file.share_url, '_blank')}
								class="rounded-md p-1.5 shadow-sm transition-colors"
								style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))"
								title="Open share link"
							>
								<svg
									class="h-4 w-4"
									style="color: hsl(142, 76%, 36%)"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
									/>
								</svg>
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-6 border-t pt-4" style="border-color: hsl(var(--border))">
			<div
				class="flex flex-wrap items-center justify-between gap-4 text-sm"
				style="color: hsl(var(--muted-foreground))"
			>
				<div class="flex items-center gap-4">
					<span>Showing: {filesToDisplay.length} file{filesToDisplay.length !== 1 ? 's' : ''}</span>
					<span>•</span>
					<span>{formatBytes(calculateTotalSize(filesToDisplay))}</span>
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
	on:close={closePreviewModal}
	on:download={handleDownload}
	on:share={handleShare}
	on:rename={handleRename}
	on:delete={handleDelete}
/>

{#if uploadToastOpen}
	<div class="fixed right-4 bottom-4 z-50 w-[340px] max-w-[90vw]">
		<div
			class="overflow-hidden rounded-xl border shadow-lg"
			style="background-color: hsl(var(--card)); border-color: hsl(var(--border))"
		>
			<div
				class="flex items-center justify-between border-b px-4 py-3"
				style="border-color: hsl(var(--border))"
			>
				<div class="text-sm font-semibold" style="color: hsl(var(--foreground))">Uploads</div>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="rounded px-2 py-1 text-xs"
						style="border: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground))"
						on:click={clearFinishedUploads}
					>
						Clear
					</button>
					<button
						type="button"
						class="rounded px-2 py-1 text-xs"
						style="border: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground))"
						on:click={closeToast}
					>
						✕
					</button>
				</div>
			</div>

			<div class="max-h-[280px] overflow-auto">
				{#each uploadItems as u (u.id)}
					<div class="border-b px-4 py-3" style="border-color: hsl(var(--border))">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								<div class="truncate text-sm" style="color: hsl(var(--foreground))">{u.name}</div>
								<div class="text-xs" style="color: hsl(var(--muted-foreground))">
									{formatBytes(u.size)}
									{#if u.status === 'uploading'}
										• Uploading…{/if}
									{#if u.status === 'done'}
										• Done{/if}
									{#if u.status === 'error'}
										• Error{/if}
								</div>
							</div>

							<div class="shrink-0 text-xs" style="color: hsl(var(--muted-foreground))">
								{#if u.status === 'uploading' || u.status === 'done'}{u.progress}%{/if}
							</div>
						</div>

						<div
							class="mt-2 h-2 overflow-hidden rounded-full"
							style="background-color: hsl(var(--muted))"
						>
							<div
								class="h-full"
								style="
                  width: {Math.min(100, Math.max(0, u.progress))}%;
                  background-color: {u.status === 'error'
									? 'hsl(0 84% 60%)'
									: 'hsl(var(--primary))'};
                  transition: width 150ms linear;
                "
							/>
						</div>

						{#if u.message}
							<div
								class="mt-1 text-xs"
								style="color: {u.status === 'error'
									? 'hsl(0 84% 60%)'
									: 'hsl(var(--muted-foreground))'}"
							>
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
	.group:hover .opacity-0 {
		opacity: 1 !important;
		transition: opacity 0.2s ease;
	}

	input[type='file'] {
		color: hsl(var(--muted-foreground));
	}

	input[type='file']::file-selector-button {
		background-color: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
		border: 1px solid hsl(var(--border));
		padding: 10px 16px;
		border-radius: 12px;
		margin-right: 14px;
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	input[type='file']::file-selector-button:hover {
		opacity: 0.9;
	}

	input[type='file']::-webkit-file-upload-button {
		background-color: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
		border: 1px solid hsl(var(--border));
		padding: 10px 16px;
		border-radius: 12px;
		margin-right: 14px;
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	input[type='file']::-webkit-file-upload-button:hover {
		opacity: 0.9;
	}

	form {
		transition: all 0.2s ease;
	}
</style>
