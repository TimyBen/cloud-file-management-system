<script lang="ts">
	import { apiFetch } from '$lib/api';
	import { onMount } from 'svelte';

	let shared: any[] = [];
	let loading = true;

	onMount(async () => {
		try {
			const res = await apiFetch('/share');
			shared = res.shared || [];
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	});
</script>

<section>
	<h1 class="text-2xl font-semibold mb-4">Shared Files</h1>

	{#if loading}
		<p>Loading...</p>
	{:else if shared.length === 0}
		<p>No shared files yet.</p>
	{:else}
		<table class="min-w-full bg-white rounded-lg shadow">
			<thead>
				<tr class="border-b bg-gray-50 text-left">
					<th class="p-3">File</th>
					<th class="p-3">Shared With</th>
					<th class="p-3">Date</th>
				</tr>
			</thead>
			<tbody>
				{#each shared as s}
					<tr class="border-b">
						<td class="p-3">{s.filename}</td>
						<td class="p-3">{s.sharedWith}</td>
						<td class="p-3">{new Date(s.sharedAt).toLocaleString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</section>
