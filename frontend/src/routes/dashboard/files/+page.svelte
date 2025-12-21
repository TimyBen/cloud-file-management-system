<script lang="ts">
  import { enhance } from '$app/forms';
  import FileCard from '$components/dashboard/FileCard.svelte';

  export let data;

  let files = data.files ?? [];
</script>

<section class="space-y-6">
  <h1 class="text-2xl font-semibold">Files</h1>

  <!-- Upload -->
  <form
    method="POST"
    action="?/upload"
    enctype="multipart/form-data"
    use:enhance={({ result }) => {
      if (result.type === 'success' && result.data?.file) {
        files = [result.data.file, ...files];
      }
    }}
    class="p-4 bg-white rounded shadow space-y-3"
  >
    <input type="file" name="file" required />
    <button class="px-4 py-2 bg-blue-600 text-white rounded">
      Upload
    </button>
  </form>

  <!-- Files list -->
  {#if files.length === 0}
    <p class="text-gray-500">No files yet</p>
  {:else}
    <div class="space-y-3">
      {#each files as file (file.id)}
        <form
          method="POST"
          action="?/delete"
          use:enhance={({ result }) => {
            if (result.type === 'success') {
              files = files.filter(f => f.id !== file.id);
            }
          }}
        >
          <input type="hidden" name="id" value={file.id} />
          <FileCard {file} />
        </form>
      {/each}
    </div>
  {/if}
</section>
