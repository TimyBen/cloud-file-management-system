<script lang="ts">
	import './layout.css';
	import '../app.css';

	import { onMount } from 'svelte';
	import { loadAuth } from '$lib/stores/auth';

	onMount(() => {
		// Restore session from localStorage after hydration
		loadAuth();
	});
</script>

<slot />
