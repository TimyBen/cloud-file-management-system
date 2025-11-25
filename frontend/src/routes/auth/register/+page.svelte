<script lang="ts">
	import { apiFetch } from "$lib/api";
	import { setAuth } from "$lib/stores/auth";
	import { goto } from "$app/navigation";

	let email = "";
	let password = "";
	let error = "";
	let loading = false;

	async function register() {
		loading = true;
		error = "";

		try {
			const res = await apiFetch("/auth/register", {
				method: "POST",
				body: JSON.stringify({ email, password })
			});

			setAuth(res.token, res.user);
			goto("/dashboard");
		} catch (e) {
			error = "Registration failed.";
		}

		loading = false;
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
	<form on:submit|preventDefault={register} class="bg-white p-8 shadow rounded-lg w-96 space-y-4">
		<h1 class="text-xl font-semibold text-center">Create Account</h1>

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
			{loading ? "Creating account..." : "Register"}
		</button>

		<p class="text-center text-sm">
			Already have an account? <a href="/auth/login" class="text-blue-600">Login</a>
		</p>
	</form>
</div>
