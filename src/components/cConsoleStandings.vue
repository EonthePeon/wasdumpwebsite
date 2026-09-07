<template>
  <div class="row g-3">
    <div v-for="c in consolesPlayed" :key="c.consoleName" :class="colClass">
      <div class="p-3 border border-secondary rounded bg-console-card h-100 d-flex flex-column">
        <div class="mb-2">
          <span class="d-block text-muted small text-uppercase mb-1 fw-bold">{{ c.consoleName }}</span>
          <span v-if="c.playerWins.length" class="badge bg-warning text-dark">
            <i class="bi bi-trophy-fill me-1"></i>Winner: {{ c.playerWins[0].player }}
          </span>
        </div>

        <ul class="list-unstyled mb-0 small">
          <li v-for="win in c.playerWins" :key="win.player" class="d-flex justify-content-between mb-1">
            <span :class="win.player === c.playerWins[0].player ? 'fw-bold text-light' : 'text-muted'">{{ win.player }}</span>
            <span :class="win.player === c.playerWins[0].player ? 'fw-bold text-light' : 'text-muted'">{{ win.wins }}</span>
          </li>
        </ul>

        <div class="mt-3">
          <button
            class="btn btn-sm btn-outline-secondary w-100 text-start d-flex justify-content-between align-items-center"
            type="button"
            @click="toggleGames(c.consoleName)"
          >
            <span><i class="bi bi-collection-play me-2"></i>Game List</span>
            <i class="bi" :class="isOpen(c.consoleName) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </button>

          <div class="games-list-dropdown mt-2" v-if="isOpen(c.consoleName)">
            <div class="table-responsive">
              <table class="table table-sm table-dark table-hover mb-0" style="font-size: 0.8rem">
                <thead>
                  <tr><th>Game</th><th>Winner</th><th>Scores</th></tr>
                </thead>
                <tbody>
                  <tr v-for="game in gamesByConsole(c.consoleName)" :key="game.gameName">
                    <td>{{ game.gameName }}</td>
                    <td class="text-primary">{{ game.winner }}</td>
                    <td>
                      <div v-for="score in game.scores" :key="score.player" class="x-small">
                        {{ score.player }}: {{ score.points }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  consolesPlayed: { type: Array, required: true },
  gamesPlayed: { type: Array, required: true },
})

const openConsoles = ref(new Set())

function toggleGames(name) {
  const next = new Set(openConsoles.value)
  next.has(name) ? next.delete(name) : next.add(name)
  openConsoles.value = next
}
const isOpen = (name) => openConsoles.value.has(name)
const gamesByConsole = (name) => props.gamesPlayed.filter((g) => g.console === name)

const colClass = computed(() => {
  const n = props.consolesPlayed.length
  if (n === 1) return 'col-12'
  if (n === 2) return 'col-md-6'
  if (n === 3) return 'col-md-4'
  return 'col-md-3 col-sm-6'
})
</script>

<style scoped>
.bg-console-card { background-color: #1e1e1e; }
.x-small { font-size: 0.75rem; }
</style>
