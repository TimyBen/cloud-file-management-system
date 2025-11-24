<script>
  import { goto } from '$app/navigation';
  import { invalidate } from '$app/navigation';

  let email = '';
  let password = '';
  let remember = false;
  let error = '';
  let loading = false;

  async function signIn(e) {
    e.preventDefault();
    error = '';
    loading = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, remember })
      });

      const data = await res.json();

      if (!res.ok) {
        error = data?.message ?? 'Login failed';
        loading = false;
        return;
      }

      // data contains: user, fileUrl (the local path you uploaded), etc.
      // The server sets an HttpOnly cookie for auth; no token on client-side is needed.
      console.log('login success', data);

      // optionally store non-sensitive user info in a store or call a loader
      // then redirect:
      await invalidate(); // reload session data if you use load() to fetch user
      goto('/dashboard');
    } catch (err) {
      console.error(err);
      error = 'Network error';
    } finally {
      loading = false;
    }
  }
</script>

<!-- (keep the rest of your markup identical) -->
<form on:submit|pre<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let remember = false;
  let error = '';
  let loading = false;

  async function signIn(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember })
      });

      const payload = await res.json();

      if (!res.ok) {
        error = payload?.message ?? 'Login failed';
        loading = false;
        return;
      }

      // server sets HttpOnly cookie; invalidate root data/loaders if necessary
      await invalidate();
      goto('/dashboard');
    } catch (err) {
      console.error(err);
      error = 'Network error';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#081029] to-[#1b3b9e] p-6">
  <div class="max-w-4xl w-full bg-[#0b1720] rounded-2xl overflow-hidden shadow-xl grid grid-cols-2">
    <div class="p-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">☁️</div>
        <div class="text-2xl font-bold">CloudStore AI</div>
      </div>

      <h2 class="text-3xl font-extrabold mb-2">Welcome back</h2>
      <p class="text-slate-400 mb-6">Sign in to your account to continue</p>

      <form on:submit|preventDefault={signIn} class="space-y-4">
        {#if error}
          <div class="text-sm text-red-400">{error}</div>
        {/if}

        <div>
          <label class="text-sm text-slate-300">Email</label>
          <input bind:value={email} type="email" required class="w-full mt-2 px-4 py-2 rounded-full bg-[#071224] border border-[#16202a] text-slate-200" />
        </div>

        <div>
          <label class="text-sm text-slate-300">Password</label>
          <input bind:value={password} type="password" required class="w-full mt-2 px-4 py-2 rounded-full bg-[#071224] border border-[#16202a] text-slate-200" />
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 text-slate-300">
            <input type="checkbox" bind:checked={remember} class="accent-blue-600" /> Remember me
          </label>
          <a class="text-sm text-blue-400 hover:underline" href="/auth/forgot">Forgot password?</a>
        </div>

        <button type="submit" class="w-full py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold" disabled={loading}>
          {#if loading}Signing in...{:else}Sign In{/if}
        </button>

        <div class="text-center text-sm text-slate-400">Don't have an account? <a class="text-blue-400 hover:underline" href="/auth/register">Sign up</a></div>
      </form>
    </div>

    <div class="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex flex-col items-center justify-center text-center text-white">
      <div class="w-40 h-40 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-6">
        <div class="text-4xl">☁️</div>
      </div>
      <h3 class="text-2xl font-bold mb-2">Secure Cloud Storage</h3>
      <p class="text-slate-100/90">Store, share, and collaborate on your files with AI-powered insights</p>
    </div>
  </div>
</div>
ventDefault={signIn} class="space-y-4">
  {#if error}
    <div class="text-sm text-red-400">{error}</div>
  {/if}

  <div>
    <label class="text-sm text-slate-300">Email</label>
    <input bind:value={email} type="email" required class="w-full mt-2 px-4 py-2 rounded-full bg-[#071224] border border-[#16202a] text-slate-200" />
  </div>

  <div>
    <label class="text-sm text-slate-300">Password</label>
    <input bind:value={password} type="password" required class="w-full mt-2 px-4 py-2 rounded-full bg-[#071224] border border-[#16202a] text-slate-200" />
  </div>

  <div class="flex items-center justify-between">
    <label class="flex items-center gap-2 text-slate-300">
      <input type="checkbox" bind:checked={remember} class="accent-blue-600" /> Remember me
    </label>
    <a class="text-sm text-blue-400 hover:underline" href="/auth/forgot">Forgot password?</a>
  </div>

  <button type="submit" class="w-full py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold" disabled={loading}>
    {#if loading}Signing in...{:else}Sign In{/if}
  </button>
</form>
