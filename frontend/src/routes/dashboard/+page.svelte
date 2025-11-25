<script lang="ts">
	import { onMount } from 'svelte';
	import { listFiles, fileDownloadUrl } from '$lib/api';
	import FileCard from '$components/dashboard/FileCard.svelte';

	let files: Array<any> = [];
	let loading = true;
	let error: string | null = null;

	// Demo fallback file (local path you uploaded)
	const DEMO_FILE = {
		id: 'demo-thesis',
		name: 'UNDERGRADUATE THESIS - CHIBUIKE TIMOTHY BENEDICT - FINAL.pdf',
		size: 0,
		mime: 'application/pdf',
		url: '/mnt/data/UNDERGRADUATE THESIS- CHIBUIKE TIMOTHY BENEDICT-FINAL.pdf',
		createdAt: new Date().toISOString()
	};

	onMount(async () => {
		loading = true;
		error = null;

		try {
			try {
				const res = await listFiles();
				files = Array.isArray(res) ? res : (res.items ?? []);
				if (!Array.isArray(files)) files = [];
			} catch (e) {
				console.warn('[dashboard] listFiles failed, using demo file', e);
				files = [DEMO_FILE];
			}
		} catch (e) {
			console.error('[dashboard] unexpected error', e);
			error = String(e?.message ?? e);
		} finally {
			loading = false;
		}
	});

	function downloadUrl(f: any) {
		return f?.url ? f.url : fileDownloadUrl(f?.id ?? f);
	}

	function openDemo() {
		window.open(DEMO_FILE.url, '_blank');
	}
</script>

<section class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold">Dashboard</h1>
		<div class="text-sm text-gray-500">Files overview</div>
	</div>

	{#if loading}
		<div class="text-gray-600">Loading...</div>
	{:else if error}
		<div class="text-red-600">Error: {error}</div>
	{:else}
		<div class="space-y-6">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="p-6 bg-white rounded shadow">
					<div class="text-sm text-gray-500">Files</div>
					<div class="text-3xl font-bold">{files.length}</div>
				</div>

				<div class="p-6 bg-white rounded shadow">
					<div class="text-sm text-gray-500">Shares</div>
					<div class="text-3xl font-bold">—</div>
				</div>

				<div class="p-6 bg-white rounded shadow">
					<div class="text-sm text-gray-500">Logs</div>
					<div class="text-3xl font-bold">—</div>
				</div>
			</div>

			<div>
				<h2 class="text-lg font-medium mb-3">Your files</h2>

				{#if files.length === 0}
					<div class="p-6 bg-white rounded shadow text-gray-600">
						No files found. Try uploading, or preview the demo file:
						<div class="mt-3">
							<button class="px-4 py-2 bg-blue-600 text-white rounded" on:click={openDemo}>
								Preview Demo Thesis
							</button>
						</div>
					</div>
				{:else}
					<div class="grid gap-4">
						{#each files as f (f.id ?? f.name)}
							<div>
								<!-- pass prop correctly and wire preview to open URL -->
								<FileCard file={f} on:preview={() => window.open(downloadUrl(f), '_blank')} />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</section>
