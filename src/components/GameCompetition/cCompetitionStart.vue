<template>
  <div v-if="gc.currentCompetition.value" class="alert alert-warning">
    A competition is already in progress ({{ gc.gameName(gc.currentCompetition.value.gameId) }}) — end it before starting a new one.
  </div>

  <div v-else>
    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <input v-model="date" type="date" class="form-control" />
      </div>
      <div class="col-md-2">
        <input v-model.number="playerCount" type="number" min="2" class="form-control" placeholder="Players" />
      </div>
      <div class="col-md-7">
        <input v-model="goal" type="text" class="form-control" placeholder="Goal" />
      </div>
    </div>

    <div v-if="!systemId" class="mb-4">
      <h6>Pick a console</h6>
      <cRandomPicker :options="consoleOptions" @picked="onSystemPicked" />
    </div>

    <div v-else-if="!gameId" class="mb-4">
      <h6>Pick a game ({{ gc.consoleName(systemId) }})</h6>
      <cRandomPicker :options="gameOptions" @picked="onGamePicked" />
    </div>

    <div v-else class="mb-4">
      <p>
        <strong>{{ gc.consoleName(systemId) }}</strong> — <strong>{{ gc.gameName(gameId) }}</strong>
        <button class="btn btn-sm btn-link" @click="systemId = ''; gameId = ''">reset</button>
      </p>
      <button class="btn btn-success" :disabled="!canStart" @click="start">Start Competition</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'
import cRandomPicker from './cRandomPicker.vue'

const gc = useGameCompetition()

// Retro Races streams on Sundays - default to the next one, never today.
function nextSunday() {
  const d = new Date()
  const daysUntil = (7 - d.getDay()) % 7 || 7
  d.setDate(d.getDate() + daysUntil)
  return d.toISOString().split('T')[0]
}
const date = ref(nextSunday())
const playerCount = ref(gc.players.value.length || 2)
const goal = ref('')
const systemId = ref('')
const gameId = ref('')

const consoleOptions = computed(() =>
  gc.consoles.value
    .filter((c) => gc.games.value.some((g) => g.systemId === c.systemId && !g.finished && !g.archive))
    .map((c) => ({ id: c.systemId, name: c.system }))
)

const gameOptions = computed(() =>
  gc.games.value
    .filter((g) => g.systemId === systemId.value && !g.finished && !g.archive)
    .map((g) => ({ id: g.gameId, name: g.game }))
)

function onSystemPicked(tile) { systemId.value = tile.id }
function onGamePicked(tile) { gameId.value = tile.id }

const canStart = computed(() => systemId.value && gameId.value && playerCount.value >= 2 && date.value && goal.value.trim())

function start() {
  const competition = {
    competitionId: crypto.randomUUID(),
    systemId: systemId.value,
    gameId: gameId.value,
    playerCount: playerCount.value,
    competionDate: new Date(date.value).toISOString(),
    active: true,
    complete: false,
    goal: goal.value.trim(),
    yearId: gc.activeYear.value?.yearId ?? null,
    results: [],
  }
  gc.saveCompetitions([...gc.competitions.value, competition])
  systemId.value = ''
  gameId.value = ''
  goal.value = ''
}
</script>
