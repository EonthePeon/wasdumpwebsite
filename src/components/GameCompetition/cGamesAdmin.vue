<template>
  <div>
    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <select v-model="filterSystemId" class="form-select">
          <option value="">All Consoles</option>
          <option v-for="c in gc.consoles.value" :key="c.systemId" :value="c.systemId">{{ c.system }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <input v-model="newGame.game" type="text" class="form-control" placeholder="New game name" />
      </div>
      <div class="col-md-3">
        <select v-model="newGame.systemId" class="form-select">
          <option value="">Console...</option>
          <option v-for="c in gc.consoles.value" :key="c.systemId" :value="c.systemId">{{ c.system }}</option>
        </select>
      </div>
      <div class="col-md-2">
        <select v-model="newGame.userId" class="form-select">
          <option value="">Added by...</option>
          <option v-for="p in gc.players.value" :key="p.userId" :value="p.userId">{{ p.name }}</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary mb-3" :disabled="!canAdd" @click="add">Add Game</button>

    <table class="table table-dark table-sm">
      <thead><tr><th>Game</th><th>Console</th><th>Added By</th><th>Finished</th><th></th></tr></thead>
      <tbody>
        <tr v-for="g in filteredGames" :key="g.gameId">
          <td>{{ g.game }}</td>
          <td>{{ gc.consoleName(g.systemId) }}</td>
          <td>{{ gc.playerName(g.userId) }}</td>
          <td>
            <input type="checkbox" :checked="g.finished" @change="toggleFinished(g)" />
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger" @click="archive(g)">Archive</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'

const gc = useGameCompetition()
const filterSystemId = ref('')
const newGame = ref({ game: '', systemId: '', userId: '' })

const filteredGames = computed(() =>
  gc.games.value
    .filter((g) => !g.archive)
    .filter((g) => !filterSystemId.value || g.systemId === filterSystemId.value)
)

const canAdd = computed(() => newGame.value.game.trim() && newGame.value.systemId && newGame.value.userId)

function add() {
  const record = {
    gameId: crypto.randomUUID(),
    game: newGame.value.game.trim(),
    systemId: newGame.value.systemId,
    userId: newGame.value.userId,
    finished: false,
    archive: false,
  }
  gc.saveGames([...gc.games.value, record])
  newGame.value = { game: '', systemId: newGame.value.systemId, userId: newGame.value.userId }
}

function toggleFinished(g) {
  gc.saveGames(gc.games.value.map((x) => (x.gameId === g.gameId ? { ...x, finished: !x.finished } : x)))
}

function archive(g) {
  gc.saveGames(gc.games.value.map((x) => (x.gameId === g.gameId ? { ...x, archive: true } : x)))
}
</script>
