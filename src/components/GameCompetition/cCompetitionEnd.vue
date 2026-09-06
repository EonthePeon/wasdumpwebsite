<template>
  <div v-if="!competition" class="text-muted">No competition currently in progress.</div>

  <div v-else>
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
    <button class="btn btn-success" :disabled="!!placeError" @click="finish">End Competition</button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'

const gc = useGameCompetition()
const competition = computed(() => gc.currentCompetition.value)
const playerRows = ref([])

watch(competition, (c) => {
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

  // Archive the game so it can't be picked again this year, matching the old EndCompetition behavior.
  const games = gc.games.value.map((g) =>
    g.gameId === competition.value.gameId ? { ...g, finished: true } : g
  )

  gc.saveCompetitions(updated)
  gc.saveGames(games)
}
</script>
