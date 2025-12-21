<script lang="ts">
  import { onMount } from 'svelte';

  let users = [];
  let events = [];

  onMount(() => {
    const socket = new WebSocket('ws://localhost:3000/collab');

    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'presence') users = msg.users;
      if (msg.type === 'event') events = [msg.event, ...events];
    };
  });
</script>

<h1 class="text-xl font-semibold">Realtime Collaboration</h1>

<div class="mt-4">
  <h2 class="font-medium">Active users</h2>
  {#each users as u}
    <div>{u.name} — {u.status}</div>
  {/each}
</div>

<div class="mt-6">
  <h2 class="font-medium">Activity</h2>
  {#each events as e}
    <div class="text-sm text-gray-600">
      {e.actor} {e.type}
    </div>
  {/each}
</div>
