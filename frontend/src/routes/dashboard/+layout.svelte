<script lang="ts">
	import { onMount } from 'svelte';
	import Sidebar from '$components/layout/Sidebar.svelte';
	import Navbar from '$components/layout/Navbar.svelte';
	import { loadAuth } from '$lib/stores/auth';

	onMount(() => {
		try {
			loadAuth();
			console.log('[layout] loadAuth run');
		} catch (e) {
			console.warn(e);
		}
	});
</script>

<div class="flex h-screen bg-gray-50">
	<Sidebar />
	<div class="flex flex-col flex-1 overflow-hidden">
		<Navbar />
		<main class="p-6 overflow-y-auto"><slot /></main>
	</div>
</div>
