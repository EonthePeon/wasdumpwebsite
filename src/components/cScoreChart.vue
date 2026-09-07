<template>
  <div class="mt-3">
    <button class="btn btn-info btn-sm" @click="showChart = !showChart">
      {{ showChart ? 'Hide' : 'Show' }} Chart
    </button>
    <div v-show="showChart" class="mt-3">
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

// Chart.js is ~200KB - only pull it in once someone actually clicks "Show Chart".
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
