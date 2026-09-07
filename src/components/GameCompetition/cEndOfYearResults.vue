<template>
  <div v-if="results">
    <div v-if="results.yearWinner" class="winner-banner mb-4">
      <div class="winner-trophy">🏆</div>
      <div>
        <div class="gc-section-label mb-1">YEAR CHAMPION</div>
        <h2 class="fw-bold mb-0 gc-gradient-text">{{ results.yearWinner }}</h2>
      </div>
    </div>

    <section v-if="results.finalStandings?.length" class="mb-4">
      <div class="card">
        <div class="card-body p-4">
          <h5 class="card-title mb-4">Final Standings</h5>
          <div class="d-flex flex-column gap-2">
            <div class="standing-row" v-for="standing in results.finalStandings" :key="standing.player">
              <span class="standing-rank">
                <span v-if="standing.rank === 1">🥇</span>
                <span v-else-if="standing.rank === 2">🥈</span>
                <span v-else-if="standing.rank === 3">🥉</span>
                <span v-else class="text-muted">#{{ standing.rank }}</span>
              </span>
              <span class="standing-player">{{ standing.player }}</span>
              <div class="d-flex gap-3 align-items-center flex-wrap">
                <span class="standing-points">{{ standing.totalPoints }} <small>PTS</small></span>
                <span class="gc-stat-item text-center"><span class="label">Wins</span><span class="value">{{ standing.totalWins }}</span></span>
                <span class="gc-stat-item text-center"><span class="label">Bonus</span><span class="value">{{ standing.bonusCount }}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="results.consolesPlayed?.length" class="mb-4">
      <div class="card">
        <div class="card-body p-4">
          <h5 class="card-title mb-4">Consoles Played</h5>
          <div class="row g-3">
            <div class="col-12 col-sm-6 col-lg-4" v-for="c in results.consolesPlayed" :key="c.consoleName">
              <div class="result-card h-100">
                <div class="fw-bold mb-2">
                  {{ c.consoleName }}
                  <small class="ms-2">{{ c.gamesPlayedCount }} games</small>
                </div>
                <div class="d-flex flex-column gap-1">
                  <div class="d-flex justify-content-between" v-for="win in c.playerWins" :key="win.player">
                    <span>{{ win.player }}</span>
                    <span class="fw-bold">{{ win.wins }} <small>wins</small></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="results.gamesPlayed?.length" class="mb-4">
      <div class="card">
        <div class="card-body p-4">
          <h5 class="card-title mb-4">Games Played</h5>
          <div class="d-flex flex-column gap-2">
            <div class="result-card" v-for="game in results.gamesPlayed" :key="game.gameName + game.competionDate">
              <div class="d-flex flex-wrap gap-4 mb-2">
                <div class="gc-stat-item"><span class="label">Game</span><span class="value">{{ game.gameName }}</span></div>
                <div class="gc-stat-item"><span class="label">Console</span><span class="value">{{ game.console }}</span></div>
                <div class="gc-stat-item"><span class="label">Date</span><span class="value">{{ game.competionDate }}</span></div>
                <div class="gc-stat-item"><span class="label">Winner</span><span class="value">{{ game.winner }}</span></div>
              </div>
              <div class="d-flex flex-wrap gap-3 mt-2 pt-2 game-scores">
                <span v-for="score in game.scores" :key="score.player" class="gc-stat-badge">
                  {{ score.player }}: <strong>{{ score.points }}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-4">
      <div class="card">
        <div class="card-body p-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h5 class="card-title mb-0">Score Progression</h5>
            <button class="btn btn-info btn-sm" @click="showChart = !showChart">
              {{ showChart ? 'Hide' : 'Show' }} Chart
            </button>
          </div>
          <canvas ref="chartCanvas" v-show="showChart"></canvas>
          <div v-if="!showChart" class="text-center py-4 text-muted">
            <small>Click "Show" to reveal the score chart</small>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div v-else class="text-center py-5 text-muted">No results to display.</div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({ results: Object })
const showChart = ref(false)
const chartCanvas = ref(null)
let chartInstance = null

function buildChart() {
  const games = props.results?.gamesPlayed
  if (!games || !chartCanvas.value) return

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

watch(() => props.results, () => {
  if (showChart.value) nextTick(buildChart)
})
watch(showChart, (val) => {
  if (val) nextTick(buildChart)
})
</script>

<style scoped>
.winner-banner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(124, 58, 237, 0.08));
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 16px;
}
.winner-trophy { font-size: 3.5rem; line-height: 1; }
.standing-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}
.standing-rank { width: 2.5rem; text-align: center; }
.standing-player { flex: 1; font-weight: 600; }
.standing-points { font-weight: 700; }
.gc-stat-item { display: flex; flex-direction: column; font-size: 0.8rem; }
.gc-stat-item .label { color: var(--gc-text-muted, #888); text-transform: uppercase; font-size: 0.7rem; }
.gc-stat-item .value { font-weight: 600; }
.result-card {
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}
.game-scores { border-top: 1px solid rgba(255, 255, 255, 0.08); }
.gc-stat-badge {
  display: inline-flex;
  gap: 0.25rem;
  background: rgba(0, 212, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.85rem;
}
</style>
