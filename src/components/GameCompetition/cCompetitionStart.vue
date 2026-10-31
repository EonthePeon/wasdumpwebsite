<template>
  <div>
    <div v-if="gc.activeCompetitions.value.length" class="alert alert-info py-2">
      In progress: {{ inProgressLabel }}. Finish them on the End Competition tab.
    </div>

    <div v-if="batchDone" class="alert alert-success">
      All {{ total }} game{{ total > 1 ? 's' : '' }} set up for {{ date }}.
      <button class="btn btn-sm btn-success ms-2" @click="startOver">Set up more</button>
    </div>

    <div v-else>
      <div class="row g-2 mb-3">
        <div class="col-md-2">
          <label class="form-label small mb-1">Number of games</label>
          <input v-model.number="numGames" type="number" min="1" :max="maxGames" class="form-control" :disabled="batchStarted" />
        </div>
        <div class="col-md-3">
          <label class="form-label small mb-1">Date (all games end then)</label>
          <input v-model="date" type="date" class="form-control" :disabled="batchStarted" />
        </div>
        <div class="col-md-2">
          <label class="form-label small mb-1">Players</label>
          <input v-model.number="playerCount" type="number" min="2" class="form-control" placeholder="Players" />
        </div>
        <div class="col-md-5">
          <label class="form-label small mb-1">Goal{{ total > 1 ? ` for game ${gameNumber}` : '' }}</label>
          <input v-model="goal" type="text" class="form-control" placeholder="Goal" />
        </div>
      </div>

      <h6 v-if="total > 1" class="text-warning">Game {{ gameNumber }} of {{ total }}</h6>

      <div v-if="!consoleOptions.length" class="alert alert-warning">
        No unfinished games left to pick from — add some on the Games tab.
      </div>

      <div v-else-if="!systemId" class="mb-4">
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
        <button class="btn btn-success" :disabled="!canSave" @click="save">{{ saveLabel }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'
import cRandomPicker from './cRandomPicker.vue'

const gc = useGameCompetition()

// Local date as YYYY-MM-DD (toISOString would shift it to UTC and can land on the wrong day).
const toDateInput = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Retro Races streams on Sundays - default to the next one, never today.
function nextSunday() {
  const d = new Date()
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7))
  return toDateInput(d)
}

// Resuming a half-finished set? Reuse its date so every game still ends together.
const existing = gc.activeCompetitions.value[0]
const date = ref(existing ? existing.competionDate.slice(0, 10) : nextSunday())
const numGames = ref(1)
const savedCount = ref(0)
const playerCount = ref(gc.players.value.length || 2)
const goal = ref('')
const systemId = ref('')
const gameId = ref('')

const total = computed(() => Math.max(1, Math.floor(Number(numGames.value)) || 1))
const gameNumber = computed(() => savedCount.value + 1)
const batchStarted = computed(() => savedCount.value > 0)
const batchDone = computed(() => batchStarted.value && savedCount.value >= total.value)

// A game already in progress can't be picked again.
const availableGames = computed(() => {
  const taken = new Set(gc.activeCompetitions.value.map((c) => c.gameId))
  return gc.games.value.filter((g) => !g.finished && !g.archive && !taken.has(g.gameId))
})
const maxGames = computed(() => availableGames.value.length + savedCount.value)

const consoleOptions = computed(() =>
  gc.consoles.value
    .filter((c) => availableGames.value.some((g) => g.systemId === c.systemId))
    .map((c) => ({ id: c.systemId, name: c.system }))
)
const gameOptions = computed(() =>
  availableGames.value
    .filter((g) => g.systemId === systemId.value)
    .map((g) => ({ id: g.gameId, name: g.game }))
)

const inProgressLabel = computed(() =>
  gc.activeCompetitions.value.map((c) => `${gc.gameName(c.gameId)} (${gc.consoleName(c.systemId)})`).join(', ')
)

const saveLabel = computed(() => {
  if (total.value === 1) return 'Start Competition'
  return gameNumber.value < total.value ? `Save game ${gameNumber.value} & pick next` : `Save game ${gameNumber.value}`
})

const canSave = computed(
  () => systemId.value && gameId.value && playerCount.value >= 2 && date.value && goal.value.trim() && total.value <= maxGames.value
)

function onSystemPicked(tile) { systemId.value = tile.id }
function onGamePicked(tile) { gameId.value = tile.id }

async function save() {
  const competition = {
    competitionId: crypto.randomUUID(),
    systemId: systemId.value,
    gameId: gameId.value,
    playerCount: playerCount.value,
    competionDate: `${date.value}T12:00:00`, // local noon, no Z - shows as the same day for everyone
    active: true,
    complete: false,
    goal: goal.value.trim(),
    yearId: gc.activeYear.value?.yearId ?? null,
    results: [],
  }
  await gc.saveCompetitions([...gc.competitions.value, competition])

  // A failed save rolls itself back and alerts - don't advance to the next game if it didn't stick.
  if (!gc.competitions.value.some((c) => c.competitionId === competition.competitionId)) return

  savedCount.value++
  systemId.value = ''
  gameId.value = ''
  goal.value = ''
}

function startOver() {
  savedCount.value = 0
  numGames.value = 1
}
</script>
