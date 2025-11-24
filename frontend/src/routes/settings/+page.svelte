<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/api';

  let name = $auth.user?.name ?? '';
  let email = $auth.user?.email ?? '';
  let busy = false;
  let message = '';

  async function save() {
    busy = true;
    message = '';
    try {
      const updated = await api.updateProfile({ name, email });
      auth.setUser(updated);
      message = 'Profile updated';
    } catch (err: any) {
      message = err?.message ?? 'Failed to update';
    } finally {
      busy = false;
    }
  }
</script>

<div class="max-w-2xl">
  <h1 class="text-3xl font-extrabold mb-4">Settings</h1>

  <div class="bg-[#0f1726] p-6 rounded-xl border border-[#16202a]">
    <div class="space-y-4">
      <div>
        <label class="block text-sm text-slate-300">Name</label>
        <input class="w-full px-3 py-2 rounded-md bg-[#071224] border border-[#16202a]" bind:value={name} />
      </div>

      <div>
        <label class="block text-sm text-slate-300">Email</label>
        <input class="w-full px-3 py-2 rounded-md bg-[#071224] border border-[#16202a]" bind:value={email} type="email" />
      </div>

      <div class="flex items-center gap-3">
        <button class="px-4 py-2 rounded-md bg-blue-600 text-white" on:click|preventDefault={save} disabled={busy}>Save</button>
        {#if message}
          <div class="text-slate-300">{message}</div>
        {/if}
      </div>
    </div>
  </div>
</div>
