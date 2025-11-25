<script lang="ts">
	import { setAuth } from "$lib/stores/auth";
	import { apiFetch } from "$lib/api";
	import { goto } from "$app/navigation";

	let email = "";
	let password = "";
	let error = "";
	let loading = false;

	async function login() {
		loading = true;
		error = "";

		try {
			const res = await apiFetch("/auth/login", {
				method: "POST",
				body: JSON.stringify({ email, password })
			});

			setAuth(res.token, res.user);
			goto("/dashboard");
		} catch (e) {
			error = "Invalid credentials.";
		}

		loading = false;
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<form on:submit|preventDefault={login} class="bg-white p-8 shadow rounded-lg w-96 space-y-4">
		<h1 class="text-xl font-semibold text-center">Sign In</h1>

		{#if error}
			<p class="text-red-600 text-sm">{error}</p>
		{/if}

		<input
			type="email"
			bind:value={email}
			placeholder="Email"
			class="w-full border rounded-md p-2"
		/>

		<input
			type="password"
			bind:value={password}
			placeholder="Password"
			class="w-full border rounded-md p-2"
		/>

		<button
			type="submit"
			class="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
			disabled={loading}
		>
			{loading ? "Signing in..." : "Login"}
		</button>

		<p class="text-center text-sm">
			Don't have an account? <a href="/auth/register" class="text-blue-600">Register</a>
		</p>
	</form>
</div>
