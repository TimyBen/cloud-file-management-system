<script>
  export let title = "Dashboard";
</script>

<header class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-semibold text-gray-800">{title}</h1>
  <slot />
</header>
