<script lang="ts">
  export let file;

  function formatBytes(size: number) {
    if (!size) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let i = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  }
</script>

<div class="bg-white p-4 rounded shadow flex justify-between items-center">
  <div>
    <div class="font-medium">{file.name}</div>
    <div class="text-xs text-gray-500">{file.mime} · {formatBytes(file.size)}</div>
  </div>

  <div class="space-x-2">
    <button on:click={() => dispatch('preview', file)} class="text-blue-600 text-sm">
      Preview
    </button>
  </div>
</div>
