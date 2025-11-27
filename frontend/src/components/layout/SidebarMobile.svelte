<script lang="ts">
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth';

	import {
		Home,
		Folder,
		Share2,
		FileClock,
		Users,
		Settings,
		Cloud
	} from 'lucide-svelte';

	export let open = false;

	let user;
	$: user = $auth?.user;

	const links = [
		{ name: 'Home', path: '/dashboard', icon: Home },
		{ name: 'Files', path: '/dashboard/files', icon: Folder },
		{ name: 'Share', path: '/dashboard/share', icon: Share2 },
		{ name: 'Collaboration', path: '/dashboard/collaborate', icon: Users },
		{ name: 'Logs', path: '/dashboard/logs', icon: FileClock, adminOnly: true },
		{ name: 'Settings', path: '/settings', icon: Settings }
	];

	function active(path: string) {
		return $page.url.pathname.startsWith(path);
	}
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/40 z-40"
		on:click={() => (open = false)}
	></div>
{/if}

<!-- Drawer -->
<aside
	class="
		fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200
		z-50 p-4 flex flex-col
		transition-transform duration-500
	"
	class:-translate-x-full={!open}
>
	<div class="flex items-center gap-2 mb-4 font-bold text-blue-600 text-xl">
        <div class="flex items-end justify-between gap-1 pt-1 pl-14">
            <Cloud size="30" />
		    <span>CloudStore</span>
        </div>
	</div>

	<nav class="space-y-2">
		{#each links as link}
			{#if !link.adminOnly || user?.role === 'admin'}
				<a
					href={link.path}
					class="
						flex items-center gap-3 px-3 py-2 rounded-md
						text-gray-700 hover:bg-blue-50 hover:text-blue-600
					"
					class:bg-blue-100={active(link.path)}
					on:click={() => (open = false)}
				>
					<link.icon size="20" />
					<span>{link.name}</span>
				</a>
			{/if}
		{/each}
	</nav>
</aside>
