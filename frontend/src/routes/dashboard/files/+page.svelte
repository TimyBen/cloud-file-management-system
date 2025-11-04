<script lang="ts">
	import { onMount } from 'svelte';
	import { apiFetch } from '$lib/api';

	let files: any[] = [];
	let loading = true;

	onMount(async () => {
		try {
			const res = await apiFetch('/files');
			files = res.files || [];
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	});

	async function handleUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const form = new FormData();
		form.append('file', file);

		await fetch(`${import.meta.env.VITE_API_URL}/files`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			body: form
		});
		window.location.reload();
	}
</script>

<section>
	<h1 class="text-2xl font-semibold mb-4">Files</h1>

	<div class="mb-4">
		<label class="block text-sm font-medium mb-1">Upload a file</label>
		<input
			type="file"
			on:change={handleUpload}
			class="border border-gray-300 rounded-md p-2 w-full"
		/>
	</div>

	{#if loading}
		<p>Loading files...</p>
	{:else if files.length === 0}
		<p>No files found.</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each files as f}
				<div class="p-4 bg-white rounded-lg shadow">
					<p class="font-medium">{f.filename}</p>
					<p class="text-sm text-gray-500">{f.size} bytes</p>
					<a
						href={`${import.meta.env.VITE_API_URL}/files/${f.id}/download`}
						class="text-blue-600 text-sm mt-2 inline-block hover:underline"
						>Download</a
					>
				</div>
			{/each}
		</div>
	{/if}
</section>
