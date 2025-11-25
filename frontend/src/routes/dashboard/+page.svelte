<script lang="ts">
	import { apiFetch } from "$lib/api";
	import { onMount } from "svelte";

	let stats = { files: 0, shares: 0, logs: 0 };

	onMount(async () => {
		try {
			// Call your backend endpoints
			const res = await apiFetch("/stats");
			stats = res;
		} catch (e) {
			console.log("Stats fetch failed, using defaults");
		}
	});
</script>

<h1 class="text-2xl font-semibold mb-6">Dashboard Overview</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
	<div class="p-6 bg-white shadow rounded-lg">
		<div class="text-gray-500">Files</div>
		<div class="text-3xl font-bold">{stats.files}</div>
	</div>

	<div class="p-6 bg-white shadow rounded-lg">
		<div class="text-gray-500">Shares</div>
		<div class="text-3xl font-bold">{stats.shares}</div>
	</div>

	<div class="p-6 bg-white shadow rounded-lg">
		<div class="text-gray-500">Logs</div>
		<div class="text-3xl font-bold">{stats.logs}</div>
	</div>
</div>
