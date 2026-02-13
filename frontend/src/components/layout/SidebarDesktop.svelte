<script lang="ts">
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth';
	import {
		Home, Folder, Share2, FileClock, Users, Settings, Cloud, ChevronLeft
	} from 'lucide-svelte';

	let open = true;
	let user;

	$: user = $auth?.user;
	// Make page URL reactive
	$: currentPath = $page.url.pathname;

	const links = [
		{ name: "Home", path: "/dashboard", icon: Home },
		{ name: "Files", path: "/dashboard/files", icon: Folder },
		{ name: "Share", path: "/dashboard/share", icon: Share2 },
		{ name: "Collaboration", path: "/dashboard/collaborate", icon: Users },
		{ name: "Logs", path: "/dashboard/logs", icon: FileClock, adminOnly: true },
		{ name: "Settings", path: "/settings", icon: Settings }
	];

	// Simple active check function
	function isActive(path: string) {
		return currentPath.startsWith(path);
	}
</script>

<aside
	class="
		h-screen border-r
		transition-all duration-300 overflow-hidden flex flex-col
	"
	class:w-60={open}
	class:w-[72px]={!open}
	style="
		background-color: hsl(var(--card));
		border-color: hsl(var(--border));
	"
>
	<div
		class="flex items-center justify-center pt-6 p-4 border-b"
		style="border-color: hsl(var(--border))"
	>

		<button
			class="p-1 rounded-md transition-colors"
			on:click={() => (open = !open)}
			style="
				color: hsl(var(--foreground));
			"
			on:mouseenter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--accent))'}
			on:mouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
		>
		<div
			class="flex items-center gap-2 font-bold text-xl"
			style="color: hsl(var(--primary))"
		>
			<Cloud size="22" />
			{#if open}<span>CloudStore</span>{/if}
		</div>


			<!-- <ChevronLeft
				size="20"
				class={"transition-transform " + (!open ? "rotate-180" : "")}
			/> -->
		</button>
	</div>

	<nav class="p-4 space-y-2">
		{#each links as link}
			{#if !link.adminOnly || user?.role === 'admin'}
				{@const active = isActive(link.path)}
				<a
					href={link.path}
					class="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200"
					class:font-semibold={active}
					style="
						color: {active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'};
						background-color: {active ? 'hsl(var(--primary) / 0.1)' : 'transparent'};
						border-left: {active ? '3px solid hsl(var(--primary))' : '3px solid transparent'};
						margin-left: {active ? '-3px' : '0'};
					"
					on:mouseenter={(e) => {
						if (!active) {
							e.currentTarget.style.backgroundColor = 'hsl(var(--accent))';
							e.currentTarget.style.color = 'hsl(var(--accent-foreground))';
						}
					}}
					on:mouseleave={(e) => {
						if (!active) {
							e.currentTarget.style.backgroundColor = 'transparent';
							e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
						}
					}}
				>
					<link.icon
						size="20"
						style="color: {active ? 'hsl(var(--primary))' : 'inherit'}"
					/>
					{#if open}<span>{link.name}</span>{/if}
				</a>
			{/if}
		{/each}
	</nav>
</aside>