<script lang="ts">
  export let form;
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
    method="POST"
    class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/70 space-y-4"
  >
    <h1 class="text-xl font-semibold text-center text-slate-50">Sign In</h1>

    {#if form?.error}
      <p class="rounded-md bg-red-500/10 border border-red-500/40 px-3 py-2 text-xs text-red-200">
        {form.error}
      </p>
    {/if}

    <!-- EMAIL -->
    <div class="space-y-1 text-xs">
      <label class="block text-slate-200">Email</label>
      <input
        type="email"
        name="email"
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
        name="password"
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
             hover:from-indigo-400 hover:to-cyan-300 transition-colors"
    >
      Login
    </button>

    <p class="text-center text-[0.7rem] text-slate-400">
      Don't have an account?
      <a href="/auth/register" class="text-cyan-300 hover:text-cyan-200">Create one</a>
    </p>
  </form>
</div>
