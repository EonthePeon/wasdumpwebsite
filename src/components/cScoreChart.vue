<template>
  <div class="card border-secondary">
    <div
      class="card-header cursor-pointer d-flex justify-content-between align-items-center bg-dark"
      @click="showChart = !showChart"
      role="button"
    >
      <h5 class="mb-0 text-white"><i class="bi bi-graph-up me-2"></i>Score Progression</h5>
      <i class="bi" :class="showChart ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </div>
    <div class="card-body bg-darker" v-if="showChart">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({ gamesPlayed: { type: Array, required: true } })
const showChart = ref(false)
const chartCanvas = ref(null)
let chartInstance = null

// Chart.js is ~200KB - only pull it in once someone actually clicks the header.
async function buildChart() {
  const games = props.gamesPlayed
  if (!games?.length || !chartCanvas.value) return

  const { default: Chart } = await import('chart.js/auto')
  if (!chartCanvas.value) return // component may have unmounted while chart.js was loading

  const allDates = [...new Set(games.map((g) => g.competionDate))].sort((a, b) => new Date(a) - new Date(b))
  const players = [...new Set(games.flatMap((g) => g.scores.map((s) => s.player)))]

  const datasets = players.map((player, i) => {
    let running = 0
    const data = allDates.map((date) => {
      const pointsForDate = games
        .filter((g) => g.competionDate === date)
        .reduce((sum, g) => sum + (g.scores.find((s) => s.player === player)?.points ?? 0), 0)
      running += pointsForDate
      return running
    })
    return {
      label: `${player} Total`,
      data,
      fill: false,
      borderColor: `hsl(${(i * 137.5) % 360}, 70%, 60%)`,
      tension: 0,
    }
  })

  if (chartInstance) chartInstance.destroy()
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: { labels: allDates, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Cumulative Scores by Day' },
      },
      scales: {
        y: { ticks: { stepSize: 1, callback: (v) => (Number.isInteger(v) ? v : null) } },
      },
    },
  })
}

watch(() => props.gamesPlayed, () => {
  if (showChart.value) nextTick(buildChart)
})
watch(showChart, (val) => {
  if (val) nextTick(buildChart)
})
</script>

<style scoped>
.bg-darker { background-color: #121212; }
</style>
