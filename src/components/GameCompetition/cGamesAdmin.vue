<template>
  <div>
    <div class="row g-2 mb-3 align-items-center">
      <div class="col-md-3">
        <input v-model="searchTerm" type="text" class="form-control" placeholder="Search games..." />
      </div>
      <div class="col-md-3">
        <select v-model="filterSystemId" class="form-select">
          <option value="">All Consoles</option>
          <option v-for="c in gc.consoles.value" :key="c.systemId" :value="c.systemId">{{ c.system }}</option>
        </select>
      </div>
      <div class="col-md-3 form-check">
        <input id="show-finished" v-model="showFinished" type="checkbox" class="form-check-input" />
        <label for="show-finished" class="form-check-label">Show Finished</label>
      </div>
      <div class="col-md-3 form-check">
        <input id="show-archived" v-model="showArchived" type="checkbox" class="form-check-input" />
        <label for="show-archived" class="form-check-label">Show Archived</label>
      </div>
    </div>

    <table class="table table-dark table-sm">
      <thead><tr><th>Game</th><th>Console</th><th>Added By</th><th>Finished</th><th></th></tr></thead>
      <tbody>
        <tr v-for="g in sortedGames" :key="g.gameId">
          <td>{{ g.game }}</td>
          <td>{{ gc.consoleName(g.systemId) }}</td>
          <td>{{ gc.playerName(g.userId) }}</td>
          <td>
            <input type="checkbox" :checked="g.finished" @change="toggleFinished(g)" />
          </td>
          <td class="text-end">
            <button v-if="!g.archive" class="btn btn-sm btn-outline-danger" @click="confirmArchive(g)">Archive</button>
            <button v-else class="btn btn-sm btn-outline-secondary" @click="unarchive(g)">Unarchive</button>
          </td>
        </tr>
      </tbody>
    </table>

    <cModal v-if="showAddModal" title="Add Game" @close="showAddModal = false">
      <div class="mb-2">
        <input v-model="newGame.game" type="text" class="form-control" placeholder="Game name" />
      </div>
      <div class="mb-3">
        <select v-model="newGame.systemId" class="form-select">
          <option value="">Console...</option>
          <option v-for="c in gc.consoles.value" :key="c.systemId" :value="c.systemId">{{ c.system }}</option>
        </select>
      </div>
      <button class="btn btn-primary" :disabled="!canAdd" @click="add">Add Game</button>
    </cModal>

    <cModal v-if="pendingArchive" :title="`Archive ${pendingArchive.game}?`" @close="pendingArchive = null">
      <p class="text-muted">It'll be hidden from the pick list — you can still view/undo it under "Show Archived".</p>
      <button class="btn btn-secondary me-2" @click="pendingArchive = null">Cancel</button>
      <button class="btn btn-danger" @click="archive">Archive</button>
    </cModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'
import { useCurrentPlayer } from '@/composables/useCurrentPlayer'
import cModal from './cModal.vue'

const gc = useGameCompetition()
const { currentPlayerId } = useCurrentPlayer()

const searchTerm = ref('')
const filterSystemId = ref('')
const showFinished = ref(false)
const showArchived = ref(false)
const showAddModal = ref(false)
const pendingArchive = ref(null)
const newGame = ref({ game: '', systemId: '' })

const sortedGames = computed(() =>
  gc.games.value
    .filter((g) => !!g.archive === showArchived.value)
    .filter((g) => showFinished.value || !g.finished)
    .filter((g) => !filterSystemId.value || g.systemId === filterSystemId.value)
    .filter((g) => g.game.toLowerCase().includes(searchTerm.value.trim().toLowerCase()))
    .sort((a, b) => gc.consoleName(a.systemId).localeCompare(gc.consoleName(b.systemId)) || a.game.localeCompare(b.game))
)

const canAdd = computed(() => newGame.value.game.trim() && newGame.value.systemId && currentPlayerId.value)

function openAddModal() {
  newGame.value = { game: '', systemId: filterSystemId.value }
  showAddModal.value = true
}
defineExpose({ openAddModal })

function add() {
  const record = {
    gameId: crypto.randomUUID(),
    game: newGame.value.game.trim(),
    systemId: newGame.value.systemId,
    userId: currentPlayerId.value,
    finished: false,
    archive: false,
  }
  gc.saveGames([...gc.games.value, record])
  showAddModal.value = false
}

function toggleFinished(g) {
  gc.saveGames(gc.games.value.map((x) => (x.gameId === g.gameId ? { ...x, finished: !x.finished } : x)))
}

function confirmArchive(g) {
  pendingArchive.value = g
}

function archive() {
  gc.saveGames(gc.games.value.map((x) => (x.gameId === pendingArchive.value.gameId ? { ...x, archive: true } : x)))
  pendingArchive.value = null
}

function unarchive(g) {
  gc.saveGames(gc.games.value.map((x) => (x.gameId === g.gameId ? { ...x, archive: false } : x)))
}
</script>
