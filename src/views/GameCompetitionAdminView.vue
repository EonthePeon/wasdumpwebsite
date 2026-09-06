<template>
  <div class="container py-4">
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <h2 class="mb-0">Game Competition Admin</h2>
      <div class="d-flex align-items-center gap-2">
        <label class="mb-0">Editing as:</label>
        <select v-model="currentPlayerId" class="form-select" style="width: auto">
          <option value="">Select player...</option>
          <option v-for="p in gc.players.value" :key="p.userId" :value="p.userId">{{ p.name }}</option>
        </select>
        <button
          v-if="tab === 'games'"
          class="btn btn-primary"
          :disabled="!currentPlayerId"
          @click="gamesAdmin?.openAddModal()"
        >
          Add Game
        </button>
      </div>
    </div>

    <div v-if="!gc.isDev" class="alert alert-info">
      Editing only works in dev mode (<code>npm run dev</code>) — this page is read-only on the live site.
    </div>

    <ul class="nav nav-tabs mb-4">
      <li class="nav-item" v-for="t in tabs" :key="t.id">
        <button class="nav-link" :class="{ active: tab === t.id }" @click="tab = t.id">{{ t.label }}</button>
      </li>
    </ul>

    <cCompetitionStart v-if="tab === 'start'" />
    <cCompetitionEnd v-else-if="tab === 'end'" />
    <cGamesAdmin v-else-if="tab === 'games'" ref="gamesAdmin" />
    <cConsolesAdmin v-else-if="tab === 'consoles'" />
    <cYearAdmin v-else-if="tab === 'years'" />
    <cTimerImageAdmin v-else-if="tab === 'timer-image'" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'
import { useCurrentPlayer } from '@/composables/useCurrentPlayer'
import cCompetitionStart from '@/components/GameCompetition/cCompetitionStart.vue'
import cCompetitionEnd from '@/components/GameCompetition/cCompetitionEnd.vue'
import cGamesAdmin from '@/components/GameCompetition/cGamesAdmin.vue'
import cConsolesAdmin from '@/components/GameCompetition/cConsolesAdmin.vue'
import cYearAdmin from '@/components/GameCompetition/cYearAdmin.vue'
import cTimerImageAdmin from '@/components/GameCompetition/cTimerImageAdmin.vue'

const gc = useGameCompetition()
const { currentPlayerId } = useCurrentPlayer()
const tab = ref('start')
const gamesAdmin = ref(null)

const tabs = [
  { id: 'start', label: 'Start Competition' },
  { id: 'end', label: 'End Competition' },
  { id: 'games', label: 'Games' },
  { id: 'consoles', label: 'Consoles' },
  { id: 'years', label: 'Years' },
  { id: 'timer-image', label: 'Timer Image' },
]

// Default to the End Competition tab when one's already running.
onMounted(async () => {
  await gc.loadAll()
  if (gc.currentCompetition.value) tab.value = 'end'
})
</script>
