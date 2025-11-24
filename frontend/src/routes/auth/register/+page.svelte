<script lang="ts">
  import { api } from '$lib/api';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let name = '';
  let email = '';
  let password = '';
  let error = '';

  async function submit(e: Event) {
    e.preventDefault();
    error = '';
    try {
      const res = await api.register({ name, email, password });
      // if register returns token+user, set auth
      if (res.token) {
        auth.setToken(res.token);
        auth.setUser(res.user);
        goto('/dashboard');
      } else {
        // maybe server requires login after register
        goto('/auth/login');
      }
    } catch (err: any) {
      error = err?.message ?? 'Registration failed';
    }
  }
</script>

<div class="max-w-md mx-auto mt-16">
  <div class="bg-[#0f1726] p-8 rounded-xl border border-[#16202a]">
    <h1 class="text-3xl font-extrabold mb-2">Create an account</h1>
    <p class="text-slate-400 mb-4">Sign up to start using CloudStore AI</p>

    <form on:submit|preventDefault={submit} class="space-y-4">
      <div>
        <label class="block text-sm text-slate-300">Full name</label>
        <input class="w-full px-3 py-2 rounded-md bg-[#071224] border border-[#16202a]" bind:value={name} required />
      </div>

      <div>
        <label class="block text-sm text-slate-300">Email</label>
        <input class="w-full px-3 py-2 rounded-md bg-[#071224] border border-[#16202a]" bind:value={email} type="email" required />
      </div>

      <div>
        <label class="block text-sm text-slate-300">Password</label>
        <input class="w-full px-3 py-2 rounded-md bg-[#071224] border border-[#16202a]" bind:value={password} type="password" required />
      </div>

      {#if error}
        <div class="text-red-400">{error}</div>
      {/if}

      <button class="w-full py-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white">Create account</button>

      <div class="text-center text-slate-400 text-sm">
        Already have an account? <a class="text-blue-400" href="/auth/login">Sign in</a>
      </div>
    </form>
  </div>
</div>
