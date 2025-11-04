<script lang="ts">
  import { setAuth } from "$lib/stores/auth";
  import { apiFetch } from "$lib/api";

  let email = "";
  let password = "";
  let error = "";

  async function handleLogin() {
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setAuth(res.token, res.user);
      window.location.href = "/dashboard";
    } catch (err) {
      error = "Invalid credentials or network error.";
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
  <form
    class="bg-white p-8 rounded-lg shadow-md w-96 space-y-4"
    on:submit|preventDefault={handleLogin}
  >
    <h1 class="text-xl font-semibold text-center">Sign In</h1>
    {#if error}<p class="text-sm text-red-600">{error}</p>{/if}

    <div>
      <label class="block text-sm font-medium mb-1">Email</label>
      <input
        type="email"
        bind:value={email}
        class="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Password</label>
      <input
        type="password"
        bind:value={password}
        class="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>

    <button
      type="submit"
      class="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
    >
      Login
    </button>
  </form>
</div>
