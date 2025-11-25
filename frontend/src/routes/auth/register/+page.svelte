<script lang="ts">
	import { onMount } from 'svelte';
	import { setAuth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let display_name = '';
	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	onMount(() => {
		console.log('[UI] register page mounted');
	});

	// dynamic importer that resolves the register function regardless of how api exports it
	async function getRegisterFn() {
		try {
			const mod = await import('$lib/api');
			// try common shapes: named export, default.api, api, or default itself
			return (
				mod.register ??
				mod.default?.register ??
				mod.api?.register ??
				mod.default ??
				mod
			);
		} catch (err: any) {
			console.error('[UI] dynamic import $lib/api failed', err);
			throw new Error('Failed to load API client: ' + (err?.message ?? err));
		}
	}

	async function handleRegister() {
		loading = true;
		error = '';
		console.log('[UI] handleRegister called');

		try {
			const registerFn = await getRegisterFn();
			if (!registerFn || typeof registerFn !== 'function') {
				throw new Error('register function not found in $lib/api');
			}

			let res;

			// try a few calling conventions, just like your login logic
			try {
				// e.g. register(email, password, display_name)
				res = await registerFn(email, password, display_name);
			} catch {
				try {
					// e.g. register({ email, password, display_name })
					res = await registerFn({ email, password, display_name });
				} catch {
					// e.g. register({ email, password, display_name, role: 'user' })
					res = await registerFn({ email, password, display_name, role: 'user' });
				}
			}

			console.log('[UI] register response', res);

			// pick token from common fields
			const token = res?.token ?? res?.access_token ?? res?.accessToken;
			const user = res?.user ?? res;

			if (!token) throw new Error('Register response missing token');

			setAuth(token, user);

			if (browser) {
				await new Promise((r) => setTimeout(r, 50));
			}

			goto('/auth/login');
		} catch (err: any) {
			console.error('[UI] register failed', err);
			error = err?.message ?? 'Registration failed';
		} finally {
			loading = false;
		}
	}
</script>

<!-- TOP BRAND SECTION -->
<section class="flex flex-col items-center justify-center text-center p-6 bg-slate-950 text-slate-50">
	<a
		href="/"
		class="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent"
	>
		CloudStore AI
	</a>
	<p class="text-slate-300 max-w-lg text-sm">
		Create an account to start managing your files securely.
	</p>
</section>

<!-- REGISTER CARD -->
<div class="min-h-screen flex items-center justify-center bg-slate-950 px-4">
	<form
		on:submit|preventDefault={handleRegister}
		class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/70 space-y-4"
		id="register-form"
	>
		<h1 class="text-xl font-semibold text-center text-slate-50">Create account</h1>

		{#if error}
			<p class="rounded-md bg-red-500/10 border border-red-500/40 px-3 py-2 text-xs text-red-200">
				{error}
			</p>
		{/if}

		<!-- NAME -->
		<div class="space-y-1 text-xs">
			<label class="block text-slate-200">Display name</label>
			<input
				type="text"
				bind:value={display_name}
				placeholder="Your name"
				required
				class="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs
					   text-slate-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
			/>
		</div>

		<!-- EMAIL -->
		<div class="space-y-1 text-xs">
			<label class="block text-slate-200">Email</label>
			<input
				type="email"
				bind:value={email}
				placeholder="you@example.com"
				required
				class="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs
					   text-slate-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
			/>
		</div>

		<!-- PASSWORD -->
		<div class="space-y-1 text-xs">
			<label class="block text-slate-200">Password</label>
			<input
				type="password"
				bind:value={password}
				placeholder="••••••••"
				minlength="6"
				required
				class="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs
					   text-slate-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
			/>
		</div>

		<!-- SUBMIT -->
		<button
			type="submit"
			class="w-full rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400
				   py-2 text-xs font-medium text-white shadow-lg shadow-indigo-900/50
				   hover:from-indigo-400 hover:to-cyan-300 transition-colors disabled:opacity-50"
			disabled={loading}
		>
			{loading ? 'Creating account...' : 'Create account'}
		</button>

		<p class="text-center text-[0.7rem] text-slate-400">
			Already have an account?
			<a href="/auth/login" class="text-cyan-300 hover:text-cyan-200">Sign in</a>
		</p>
	</form>
</div>
