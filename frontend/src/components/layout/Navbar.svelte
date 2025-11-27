<script lang="ts">
	import { auth, clearAuth } from '$lib/stores/auth';

	let user;
	$: user = $auth?.user;

	async function logout() {
		clearAuth();

		await fetch('/auth/logout', { method: 'POST' });

		window.location.href = '/auth/login';
	}
</script>

<nav class="w-full bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center">
	<div class="text-gray-600 text-sm pl-12 font-serif font-bold">
		Welcome, {user?.display_name || user?.email}
	</div>

	<div class="flex items-center gap-4">
		<button
			class="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
			on:click={logout}
		>
			Logout
		</button>
	</div>
</nav>
