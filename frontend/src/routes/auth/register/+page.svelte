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

	async function getRegisterFn() {
		try {
			const mod = await import('$lib/api');
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

			try {
				res = await registerFn(email, password, display_name);
			} catch {
				try {
					res = await registerFn({ email, password, display_name });
				} catch {
					res = await registerFn({ email, password, display_name, role: 'user' });
				}
			}

			console.log('[UI] register response', res);

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
<section
  class="flex flex-col items-center justify-center text-center p-6"
  style="
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  "
>
	<a
		href="/"
		class="text-3xl font-bold mb-2"
    style="
      background: linear-gradient(to right,
        hsl(var(--primary)),
        hsl(173, 80%, 40%)
      );
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    "
	>
		CloudStore AI
	</a>
	<p
    class="max-w-lg text-sm"
    style="color: hsl(var(--muted-foreground))"
  >
		Create an account to start managing your files securely.
	</p>
</section>

<!-- REGISTER CARD -->
<div
  class="min-h-screen flex items-center justify-center px-4"
  style="background-color: hsl(var(--background))"
>
	<form
		on:submit|preventDefault={handleRegister}
		class="w-full max-w-md rounded-2xl border p-6 shadow-xl space-y-4"
    style="
      border-color: hsl(var(--border));
      background-color: hsl(var(--card));
      box-shadow: 0 25px 50px -12px hsl(var(--foreground) / 0.1);
    "
		id="register-form"
	>
		<h1
      class="text-xl font-semibold text-center"
      style="color: hsl(var(--foreground))"
    >
      Create account
    </h1>

		{#if error}
			<p
        class="rounded-md border px-3 py-2 text-xs"
        style="
          background-color: hsl(0, 84%, 60% / 0.1);
          border-color: hsl(0, 84%, 60% / 0.4);
          color: hsl(0, 84%, 85%);
        "
      >
				{error}
			</p>
		{/if}

		<!-- NAME -->
		<div class="space-y-1 text-xs">
			<label
        class="block"
        style="color: hsl(var(--foreground))"
      >
        Display name
      </label>
			<input
				type="text"
				bind:value={display_name}
				placeholder="Your name"
				required
				class="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
        style="
          border-color: hsl(var(--input));
          background-color: hsl(var(--input));
          color: hsl(var(--foreground));
        "
        on:focus={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--ring))';
          e.currentTarget.style.boxShadow = '0 0 0 1px hsl(var(--ring))';
        }}
        on:blur={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--input))';
          e.currentTarget.style.boxShadow = 'none';
        }}
			/>
		</div>

		<!-- EMAIL -->
		<div class="space-y-1 text-xs">
			<label
        class="block"
        style="color: hsl(var(--foreground))"
      >
        Email
      </label>
			<input
				type="email"
				bind:value={email}
				placeholder="you@example.com"
				required
				class="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
        style="
          border-color: hsl(var(--input));
          background-color: hsl(var(--input));
          color: hsl(var(--foreground));
        "
        on:focus={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--ring))';
          e.currentTarget.style.boxShadow = '0 0 0 1px hsl(var(--ring))';
        }}
        on:blur={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--input))';
          e.currentTarget.style.boxShadow = 'none';
        }}
			/>
		</div>

		<!-- PASSWORD -->
		<div class="space-y-1 text-xs">
			<label
        class="block"
        style="color: hsl(var(--foreground))"
      >
        Password
      </label>
			<input
				type="password"
				bind:value={password}
				placeholder="••••••••"
				minlength="6"
				required
				class="w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
        style="
          border-color: hsl(var(--input));
          background-color: hsl(var(--input));
          color: hsl(var(--foreground));
        "
        on:focus={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--ring))';
          e.currentTarget.style.boxShadow = '0 0 0 1px hsl(var(--ring))';
        }}
        on:blur={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--input))';
          e.currentTarget.style.boxShadow = 'none';
        }}
			/>
		</div>

		<!-- SUBMIT -->
		<button
			type="submit"
			class="w-full rounded-full py-2 text-xs font-medium text-white transition-colors disabled:opacity-50"
      style="
        background: linear-gradient(135deg,
          hsl(var(--primary)),
          hsl(173, 80%, 40%)
        );
        box-shadow: 0 10px 15px -3px hsl(var(--primary) / 0.3);
      "
      on:mouseenter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = 'linear-gradient(135deg, hsl(var(--primary) / 0.9), hsl(173, 80%, 40% / 0.9))';
        }
      }}
      on:mouseleave={(e) => {
        if (!loading) {
          e.currentTarget.style.background = 'linear-gradient(135deg, hsl(var(--primary)), hsl(173, 80%, 40%))';
        }
      }}
			disabled={loading}
		>
			{loading ? 'Creating account...' : 'Create account'}
		</button>

		<p
      class="text-center text-[0.7rem]"
      style="color: hsl(var(--muted-foreground))"
    >
			Already have an account?
			<a
        href="/auth/login"
        class="hover:underline"
        style="color: hsl(173, 80%, 40%)"
        on:mouseenter={(e) => e.currentTarget.style.color = 'hsl(173, 80%, 50%)'}
        on:mouseleave={(e) => e.currentTarget.style.color = 'hsl(173, 80%, 40%)'}
      >
        Sign in
      </a>
		</p>
	</form>
</div>