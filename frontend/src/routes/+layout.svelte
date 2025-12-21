<script lang="ts">
	import './layout.css';
	import '../app.css';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import { loadAuth } from '$lib/stores/auth';

	theme.load();
	onMount(() => {
		// Restore session from localStorage after hydration
		loadAuth();
	});
</script>

<slot />
