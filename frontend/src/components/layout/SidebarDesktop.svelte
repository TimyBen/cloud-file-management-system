<script lang="ts">
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth';
	import {
		Home, Folder, Share2, FileClock, Users, Settings, Cloud, ChevronLeft
	} from 'lucide-svelte';

	let open = true;
	let user;
	$: user = $auth?.user;

	const links = [
		{ name: "Home", path: "/dashboard", icon: Home },
		{ name: "Files", path: "/dashboard/files", icon: Folder },
		{ name: "Share", path: "/dashboard/share", icon: Share2 },
		{ name: "Collaboration", path: "/dashboard/collaborate", icon: Users },
		{ name: "Logs", path: "/dashboard/logs", icon: FileClock, adminOnly: true },
		{ name: "Settings", path: "/settings", icon: Settings }
	];

	function isActive(path: string) {
		return $page.url.pathname.startsWith(path);
	}
</script>

<aside
	class="
		h-screen bg-white border-r border-gray-200
		transition-all duration-300 overflow-hidden flex flex-col
	"
	class:w-60={open}
	class:w-[72px]={!open}
>
	<div class="flex items-center justify-between p-4 border-b border-gray-100">
		<div class="flex items-center gap-2 font-bold text-blue-600 text-xl">
			<Cloud size="22" />
			{#if open}<span>CloudStore</span>{/if}
		</div>

		<button
			class="p-1 rounded-md hover:bg-gray-100"
			on:click={() => (open = !open)}
		>
			<ChevronLeft
				size="20"
				class={"transition-transform " + (!open ? "rotate-180" : "")}
			/>
		</button>
	</div>

	<nav class="p-4 space-y-2">
		{#each links as link}
			{#if !link.adminOnly || user?.role === 'admin'}
				<a
					href={link.path}
					class="
						flex items-center gap-3 px-3 py-2 rounded-md
						text-gray-700 hover:bg-blue-50 hover:text-blue-600
					"
					class:bg-blue-100={isActive(link.path)}
					class:text-blue-700={isActive(link.path)}
				>
					<link.icon size="20" />
					{#if open}<span>{link.name}</span>{/if}
				</a>
			{/if}
		{/each}
	</nav>
</aside>
