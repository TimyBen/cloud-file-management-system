<script lang="ts">
	let theme = localStorage.getItem('theme') || 'light';

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.classList.toggle('dark');
		localStorage.setItem('theme', theme);
	}
</script>

<section>
	<h1 class="text-2xl font-semibold mb-4">Settings</h1>

	<div class="bg-white p-6 rounded-lg shadow">
		<h2 class="text-lg font-medium mb-2">Appearance</h2>
		<p class="text-sm text-gray-500 mb-4">Switch between light and dark mode.</p>
		<button
			class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
			on:click={toggleTheme}
		>
			Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
		</button>
	</div>
</section>
