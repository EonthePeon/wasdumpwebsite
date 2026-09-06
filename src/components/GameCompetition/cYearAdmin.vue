<template>
  <div class="card mb-4">
    <div class="card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div>
        <div class="gc-section-label mb-1">ACTIVE YEAR</div>
        <h3 class="fw-bold mb-0">{{ gc.activeYear.value?.year ?? '—' }}</h3>
      </div>
      <button class="btn btn-warning" :disabled="!gc.activeYear.value" @click="endYear">End Year</button>
    </div>
  </div>

  <div v-if="justEndedResults" class="mb-4">
    <cEndOfYearResults :results="justEndedResults" />
  </div>

  <h5 class="mb-3">Past Years</h5>
  <div v-for="y in pastYears" :key="y.yearId" class="mb-2">
    <button class="btn btn-sm btn-outline-light" @click="toggleView(y.yearId)">
      {{ y.year }} {{ viewingId === y.yearId ? '▲' : '▼' }}
    </button>
    <div v-if="viewingId === y.yearId" class="mt-3">
      <cEndOfYearResults :results="gc.getEndOfYearResults(y.yearId)" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'
import cEndOfYearResults from './cEndOfYearResults.vue'

const gc = useGameCompetition()
const viewingId = ref('')
const justEndedResults = ref(null)

const pastYears = computed(() => gc.years.value.filter((y) => !y.isActive))

function toggleView(yearId) {
  viewingId.value = viewingId.value === yearId ? '' : yearId
}

// Ported from CompetitionService.EndCurrentYear: deactivate, roll to next year, archive that year's games.
function endYear() {
  const year = gc.activeYear.value
  if (!year) return

  justEndedResults.value = gc.getEndOfYearResults(year.yearId)

  const nextYearNumber = (parseInt(year.year, 10) || new Date().getFullYear()) + 1
  const newYear = { yearId: crypto.randomUUID(), year: String(nextYearNumber), isActive: true }
  const updatedYears = gc.years.value.map((y) => (y.yearId === year.yearId ? { ...y, isActive: false } : y))
  gc.saveYears([...updatedYears, newYear])

  const playedGameIds = new Set(
    gc.competitions.value.filter((c) => c.yearId === year.yearId).map((c) => c.gameId)
  )
  gc.saveGames(gc.games.value.map((g) => (playedGameIds.has(g.gameId) ? { ...g, archive: true } : g)))
}
</script>
