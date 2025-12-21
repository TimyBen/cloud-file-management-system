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
		class="fixed inset-0 z-40"
		style="background-color: rgba(0, 0, 0, 0.4)"
		on:click={() => (open = false)}
	></div>
{/if}

<!-- Drawer -->
<aside
	class="
		fixed top-0 left-0 h-screen w-64 border-r
		z-50 p-4 flex flex-col
		transition-transform duration-500
	"
	class:-translate-x-full={!open}
	style="
		background-color: hsl(var(--card));
		border-color: hsl(var(--border));
	"
>
	<div
		class="flex items-center gap-2 mb-4 font-bold text-xl"
		style="color: hsl(var(--primary))"
	>
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
						transition-colors
					"
					class:bg-blue-100={active(link.path)}
					style="
						color: hsl(var(--muted-foreground));
					"
					on:mouseenter={(e) => {
						if (!active(link.path)) {
							e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
							e.currentTarget.style.color = 'hsl(var(--accent-foreground))';
						}
					}}
					on:mouseleave={(e) => {
						if (!active(link.path)) {
							e.currentTarget.style.backgroundColor = 'transparent';
							e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
						}
					}}
					on:click={() => (open = false)}
				>
					<link.icon size="20" />
					<span>{link.name}</span>
				</a>
			{/if}
		{/each}
	</nav>
</aside>