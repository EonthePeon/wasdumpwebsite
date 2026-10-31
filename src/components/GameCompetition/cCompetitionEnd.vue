<template>
  <div v-if="!competitions.length" class="text-muted">No competition currently in progress.</div>

  <div v-else>
    <div v-if="competitions.length > 1" class="mb-4">
      <div class="text-muted small mb-2">{{ competitions.length }} games in progress — finish one at a time:</div>
      <div class="d-flex flex-wrap gap-2">
        <button
          v-for="c in competitions"
          :key="c.competitionId"
          class="btn btn-sm"
          :class="c.competitionId === competition.competitionId ? 'btn-primary' : 'btn-outline-secondary'"
          @click="selectedId = c.competitionId"
        >
          {{ gc.gameName(c.gameId) }} ({{ gc.consoleName(c.systemId) }})
        </button>
      </div>
    </div>

    <h5>{{ gc.gameName(competition.gameId) }} — {{ gc.consoleName(competition.systemId) }}</h5>
    <p class="text-muted">"{{ competition.goal }}"</p>

    <div class="d-flex flex-column gap-2 mb-3">
      <div class="d-flex align-items-center gap-3" v-for="player in playerRows" :key="player.userId">
        <span class="flex-grow-1">{{ player.name }}</span>
        <select v-model.number="player.place" class="form-select form-select-sm" style="width: 90px">
          <option :value="0">—</option>
          <option v-for="n in competition.playerCount" :key="n" :value="n">{{ n }}</option>
        </select>
        <input v-model.number="player.bonusPoints" type="number" min="0" class="form-control form-control-sm" style="width: 90px" placeholder="Bonus" />
      </div>
    </div>

    <div v-if="placeError" class="alert alert-danger py-2">{{ placeError }}</div>
    <p class="text-muted small">Leave everyone at "—" to end it without recording any results.</p>
    <button class="btn btn-success" :disabled="!!placeError" @click="finish">End {{ gc.gameName(competition.gameId) }}</button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'

const gc = useGameCompetition()
const competitions = computed(() => gc.activeCompetitions.value)
const selectedId = ref('')

// Falls back to the first one in progress, including after the selected game is finished.
const competition = computed(
  () => competitions.value.find((c) => c.competitionId === selectedId.value) ?? competitions.value[0]
)

const playerRows = ref([])

// Only reset the form when switching games, not when some other competition changes.
watch(() => competition.value?.competitionId, () => {
  playerRows.value = gc.players.value.map((p) => ({ userId: p.userId, name: p.name, place: 0, bonusPoints: 0 }))
}, { immediate: true })

const placeError = computed(() => {
  const placed = playerRows.value.map((p) => p.place).filter((p) => p > 0)
  if (new Set(placed).size !== placed.length) return 'Places must be unique.'
  return ''
})

function finish() {
  const results = playerRows.value
    .filter((p) => p.place > 0)
    .map((p) => ({ userId: p.userId, place: p.place, bonusPoints: p.bonusPoints || 0 }))

  const updated = gc.competitions.value.map((c) =>
    c.competitionId === competition.value.competitionId ? { ...c, active: false, complete: true, results } : c
  )

  // Mark the game finished so it can't be picked again this year, matching the old EndCompetition behavior.
  const games = gc.games.value.map((g) =>
    g.gameId === competition.value.gameId ? { ...g, finished: true } : g
  )

  gc.saveCompetitions(updated)
  gc.saveGames(games)
}
</script>
