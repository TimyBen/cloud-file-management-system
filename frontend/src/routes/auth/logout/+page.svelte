<script lang="ts">
	import { clearAuth } from "$lib/stores/auth";
	import { goto } from "$app/navigation";

	clearAuth();
	goto("/auth/login");
</script>

<p>Logging out...</p>
