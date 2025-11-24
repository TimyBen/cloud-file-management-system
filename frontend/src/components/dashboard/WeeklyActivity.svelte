<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { api } from '$lib/api';
  let canvasEl: HTMLCanvasElement;
  let chart: Chart | null = null;

  onMount(async () => {
    const data = await api.getWeeklyActivity();
    if (!canvasEl) return;

    chart = new Chart(canvasEl.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Activity',
          data: data.values,
          borderRadius: 8,
          barThickness: 28
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8' } },
          y: { ticks: { color: '#94a3b8' } }
        }
      }
    });
  });

  // cleanup
  onDestroy(() => {
    chart?.destroy();
  });
</script>

<div class="p-4 rounded-xl bg-[#0f1726] border border-[#16202a]">
  <div class="text-xl font-semibold mb-4">Weekly Activity</div>
  <canvas bind:this={canvasEl} height="140"></canvas>
</div>
