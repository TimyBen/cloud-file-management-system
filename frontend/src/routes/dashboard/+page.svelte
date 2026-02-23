<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	import FileCard from '$components/dashboard/FileCard.svelte';
	import FilePreviewModal from '$components/dashboard/FilePreviewModal.svelte';

	import { files } from '$lib/stores/files';
	import { searchQuery, filteredFiles } from '$lib/stores/search';

	export let data: PageData;

	onMount(() => {
		if (data?.files && Array.isArray(data.files) && data.files.length > 0) {
			console.log('📁 Caching files from landing page');
			files.setFiles(data.files);
		}
	});

	let currentSearch = '';
	$: currentSearch = $searchQuery || '';

	// ALWAYS guard store arrays
	$: allFilesList = Array.isArray($files?.files) ? $files.files : [];
	$: filteredList = Array.isArray($filteredFiles) ? $filteredFiles : [];

	// Reactive display list
	$: filesToDisplay = currentSearch.trim() && filteredList.length > 0 ? filteredList : allFilesList;

	const calculateStats = (filesArray: any[]) => {
		if (!Array.isArray(filesArray)) {
			return { files: 0, shares: 0, totalSize: 0 };
		}

		return {
			files: filesArray.length,
			shares: filesArray.filter((f) => f?.shared === true || f?.share_url).length,
			totalSize: filesArray.reduce((sum, f) => sum + (Number(f?.file_size) || 0), 0)
		};
	};

	$: currentStats = calculateStats(filesToDisplay);
	$: allStats = calculateStats(allFilesList);

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

	const handleDownload = (event: CustomEvent<{ file: any }>) => {
		const { file } = event.detail;
		console.log('Download requested for', file?.id);
	};

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

	const handleDelete = async (event: CustomEvent<{ file: any }>) => {
		const { file } = event.detail;
		if (!file?.id) return;

		if (!confirm(`Are you sure you want to delete "${file.filename}"?`)) return;

		try {
			const res = await fetch(`${API_BASE}/files/${encodeURIComponent(file.id)}`, {
				method: 'DELETE',
				mode: 'cors',
				credentials: 'include'
			});

			if (!res.ok) throw new Error('Failed to delete file');

			files.removeFile(file.id);

			if (previewFile && previewFile.id === file.id) closePreviewModal();
		} catch (err) {
			console.error(err);
			alert('Could not delete file. Please try again.');
		}
	};

	// Search indicator
	$: showSearchIndicator = currentSearch.trim().length > 0 && filteredList.length > 0;
</script>

<section class="px-4 py-4 md:px-6 md:py-6" style="color: hsl(var(--foreground))">
	<!-- Compact Stats Grid -->
	<div class="mb-6 grid grid-cols-3 gap-3">
		<div
			class="rounded-lg border p-3 text-center"
			style="border-color: hsl(var(--border)); background-color: hsl(var(--card));"
		>
			<p class="mb-1 text-xs font-medium" style="color: hsl(var(--muted-foreground))">
				Total Files
			</p>
			<p class="text-xl font-bold" style="color: hsl(var(--foreground))">{currentStats.files}</p>
			<div class="mt-1 flex justify-center">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					style="color: hsl(var(--primary))"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
					/>
				</svg>
			</div>
		</div>

		<div
			class="rounded-lg border p-3 text-center"
			style="border-color: hsl(var(--border)); background-color: hsl(var(--card));"
		>
			<p class="mb-1 text-xs font-medium" style="color: hsl(var(--muted-foreground))">
				Shared Files
			</p>
			<p class="text-xl font-bold" style="color: hsl(var(--foreground))">{currentStats.shares}</p>
			<div class="mt-1 flex justify-center">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					style="color: hsl(142, 76%, 36%)"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
					/>
				</svg>
			</div>
		</div>

		<div
			class="rounded-lg border p-3 text-center"
			style="border-color: hsl(var(--border)); background-color: hsl(var(--card));"
		>
			<p class="mb-1 text-xs font-medium" style="color: hsl(var(--muted-foreground))">
				Storage Used
			</p>
			<p class="text-xl font-bold" style="color: hsl(var(--foreground))">
				{formatBytes(currentStats.totalSize)}
			</p>
			<div class="mt-1 flex justify-center">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					style="color: hsl(217, 91%, 60%)"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
					/>
				</svg>
			</div>
		</div>
	</div>

	<!-- Recent Files Section -->
	<div
		class="rounded-lg border"
		style="border-color: hsl(var(--border)); background-color: hsl(var(--card));"
	>
		<div
			class="flex items-center justify-between border-b p-4"
			style="border-color: hsl(var(--border))"
		>
			<div>
				<h2 class="text-base font-semibold" style="color: hsl(var(--foreground))">
					{#if showSearchIndicator}Search Results{:else}Recent Files{/if}
				</h2>

				<p class="mt-0.5 text-xs" style="color: hsl(var(--muted-foreground))">
					{#if showSearchIndicator}
						{filteredList.length} of {allFilesList.length} files match your search
					{:else}
						{currentStats.files} files • {formatBytes(currentStats.totalSize)} used
						{#if currentStats.files < allFilesList.length}
							<span class="ml-1">(of {formatBytes(allStats.totalSize)} total)</span>
						{/if}
					{/if}
				</p>
			</div>

			{#if filesToDisplay.length > 0}
				<a
					href="/dashboard/files"
					class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors"
					style="background-color: hsl(var(--accent)); color: hsl(var(--accent-foreground));"
				>
					View All
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</a>
			{/if}
		</div>

		<div class="p-4">
			{#if $files?.isLoading}
				<div class="py-6 text-center">
					<div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
					<p class="mt-2 text-sm" style="color: hsl(var(--muted-foreground))">Loading files...</p>
				</div>
			{:else if filesToDisplay.length === 0}
				<!-- empty state unchanged -->
				<div class="py-6 text-center">
					<div
						class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full"
						style="background-color: hsl(var(--muted) / 0.3)"
					>
						{#if currentSearch.trim()}
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								style="color: hsl(var(--muted-foreground))"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						{:else}
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								style="color: hsl(var(--muted-foreground))"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
								/>
							</svg>
						{/if}
					</div>

					<h3 class="mb-1.5 text-sm font-medium" style="color: hsl(var(--foreground))">
						{#if currentSearch.trim()}No matching files{:else}No files yet{/if}
					</h3>

					<p class="mb-3 text-xs" style="color: hsl(var(--muted-foreground))">
						{#if currentSearch.trim()}
							No files found for "{currentSearch}". Try different keywords.
						{:else}
							Upload your first file to get started
						{/if}
					</p>

					{#if currentSearch.trim()}
						<button
							on:click={() => searchQuery.set('')}
							class="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-colors"
							style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground));"
						>
							View all files
						</button>
					{:else}
						<a
							href="/dashboard/files"
							class="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-colors"
							style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground));"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
							</svg>
							Upload Files
						</a>
					{/if}
				</div>
			{:else}
				<div class="space-y-2">
					{#each filesToDisplay.slice(0, 6) as f (f.id)}
						<FileCard file={f} on:preview={() => openPreviewModal(f)} />
					{/each}
				</div>

				{#if filesToDisplay.length > 6}
					<div class="mt-4 border-t pt-3 text-center" style="border-color: hsl(var(--border))">
						<a
							href="/dashboard/files"
							class="inline-flex items-center gap-1 text-xs hover:underline"
							style="color: hsl(var(--primary))"
						>
							{#if showSearchIndicator}
								View all {filteredList.length} search results
							{:else}
								View all {filesToDisplay.length} files
							{/if}
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 8l4 4m0 0l-4 4m4-4H3"
								/>
							</svg>
						</a>
					</div>
				{/if}
			{/if}
		</div>
	</div>

	<!-- Status Indicators unchanged -->
	<div class="mt-4 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
		<div
			class="flex items-center gap-1.5 rounded-md p-2.5"
			style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))"
		>
			<div class="h-1.5 w-1.5 rounded-full" style="background-color: hsl(var(--primary))"></div>
			<span style="color: hsl(var(--muted-foreground))">Online</span>
		</div>
		<div
			class="flex items-center gap-1.5 rounded-md p-2.5"
			style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))"
		>
			<svg
				width="10"
				height="10"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				style="color: hsl(142, 76%, 36%)"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
			<span style="color: hsl(var(--muted-foreground))">Synced</span>
		</div>
		<div
			class="flex items-center gap-1.5 rounded-md p-2.5"
			style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))"
		>
			<svg
				width="10"
				height="10"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				style="color: hsl(217, 91%, 60%)"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
			<span style="color: hsl(var(--muted-foreground))">Secure</span>
		</div>
		<div
			class="flex items-center gap-1.5 rounded-md p-2.5"
			style="background-color: hsl(var(--card)); border: 1px solid hsl(var(--border))"
		>
			<svg
				width="10"
				height="10"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				style="color: hsl(173, 80%, 40%)"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 10V3L4 14h7v7l9-11h-7z"
				/>
			</svg>
			<span style="color: hsl(var(--muted-foreground))">Fast</span>
		</div>
	</div>
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
