<script lang="ts">
	import { onMount } from 'svelte';
	import { setAuth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	onMount(() => {
		console.log('[UI] login page mounted');
	});

	// dynamic importer for login function from $lib/api
	async function getLoginFn() {
		try {
			const mod = await import('$lib/api');
			return mod.login ?? mod.default?.login ?? mod.api?.login ?? mod.default ?? mod;
		} catch (err) {
			console.error('[UI] dynamic import $lib/api failed', err);
			throw new Error('Failed to load API client: ' + (err?.message ?? err));
		}
	}

	async function handleLogin() {
		loading = true;
		error = '';
		console.log('[UI] handleLogin called');

		try {
			const loginFn = await getLoginFn();
			if (!loginFn || typeof loginFn !== 'function') {
				throw new Error('login function not found in $lib/api');
			}

			let res;
			try {
				res = await loginFn(email, password);
			} catch (err) {
				res = await loginFn({ email, password });
			}

			console.log('[UI] login response', res);

			const token = res?.token ?? res?.access_token ?? res?.accessToken;
			const user = res?.user ?? res;

			if (!token) throw new Error('Login response missing token');

			setAuth(token, user);

			if (browser) await new Promise((r) => setTimeout(r, 50));

			goto('/dashboard');
		} catch (err) {
			console.error('[UI] login failed', err);
			error = err?.message ?? 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<!-- HERO TOP AREA -->
<section class="flex flex-col items-center justify-center text-center p-6 bg-slate-950 text-slate-50">
	<a href="/" class="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
		CloudStore AI
	</a>
	<p class="text-slate-300 max-w-lg text-sm">
		A modern AI-powered cloud file management platform.
	</p>
</section>

<!-- LOGIN WRAPPER -->
<div class="min-h-screen flex items-center justify-center bg-slate-950 px-4">
	<form
		on:submit|preventDefault={handleLogin}
		class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/70 space-y-4"
		id="login-form"
	>
		<h1 class="text-xl font-semibold text-center text-slate-50">Sign In</h1>

		{#if error}
			<p class="rounded-md bg-red-500/10 border border-red-500/40 px-3 py-2 text-xs text-red-200">
				{error}
			</p>
		{/if}

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
				required
				class="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs
					   text-slate-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
			/>
		</div>

		<!-- SUBMIT BUTTON -->
		<button
			type="submit"
			class="w-full rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400
				   py-2 text-xs font-medium text-white shadow-lg shadow-indigo-900/50
				   hover:from-indigo-400 hover:to-cyan-300 transition-colors disabled:opacity-50"
			disabled={loading}
		>
			{loading ? 'Signing in...' : 'Login'}
		</button>

		<p class="text-center text-[0.7rem] text-slate-400">
			Don't have an account?
			<a href="/auth/register" class="text-cyan-300 hover:text-cyan-200">Create one</a>
		</p>
	</form>
</div>
