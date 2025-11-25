<script lang="ts">
	import { user, clearAuth } from "$lib/stores/auth";
	import { goto } from "$app/navigation";

	function logout() {
		clearAuth();
		goto("/auth/logout");
	}
</script>

<header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
	<div class="text-lg font-semibold">Dashboard</div>

	<div class="flex items-center space-x-4">
		{#if $user}
			<span class="text-gray-700">{$user.email}</span>
			<button
				class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
				on:click={logout}
			>
				Logout
			</button>
		{/if}
	</div>
</header>
