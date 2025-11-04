<script lang="ts">
	import { onMount } from 'svelte';
	import { apiFetch } from '$lib/api';

	let sessions: any[] = [];
	let loading = true;

	onMount(async () => {
		try {
			const res = await apiFetch('/collaborate/sessions');
			sessions = res.sessions || [];
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	});
</script>

<section>
	<h1 class="text-2xl font-semibold mb-4">Collaboration Sessions</h1>

	{#if loading}
		<p>Loading sessions...</p>
	{:else if sessions.length === 0}
		<p>No collaboration sessions found.</p>
	{:else}
		<ul class="space-y-3">
			{#each sessions as s}
				<li class="bg-white shadow rounded-lg p-4 flex justify-between items-center">
					<div>
						<p class="font-medium">{s.name}</p>
						<p class="text-sm text-gray-500">Active users: {s.participants.length}</p>
					</div>
					<a
						href={`/dashboard/collaborate/${s.id}`}
						class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
						>Join</a
					>
				</li>
			{/each}
		</ul>
	{/if}
</section>
