<template>
  <div class="c-retro-years">
    <div v-if="pastYears.length === 0" class="text-center text-muted fst-italic py-5">
      <i class="bi bi-archive fs-1 d-block mb-2"></i>
      No previous years found.
    </div>

    <div class="accordion shadow-sm" id="pastYearsAccordion" v-else>
      <div
        class="accordion-item bg-dark border-secondary year-highlight mb-3"
        v-for="year in pastYears"
        :key="year.yearNumber"
      >
        <h2 class="accordion-header" :id="'headingYear' + year.yearNumber">
          <button
            class="accordion-button collapsed bg-gradient-year text-white border-bottom border-secondary shadow-lg"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="'#collapseYear' + year.yearNumber"
            aria-expanded="false"
            :aria-controls="'collapseYear' + year.yearNumber"
          >
            <span class="fs-2 me-auto retro-year-title">
              <i class="bi bi-calendar3 me-2"></i>Year {{ year.yearNumber }}
            </span>
            <span class="badge bg-warning text-dark ms-3 fs-5 px-4 py-2 rounded-pill shadow">
              <i class="bi bi-trophy-fill me-1"></i>
              <template v-if="year.yearWinner.includes(',')">
                Winners: {{ year.yearWinner }}
              </template>
              <template v-else>
                Winner: {{ year.yearWinner }}
              </template>
            </span>
          </button>
        </h2>

        <div
          :id="'collapseYear' + year.yearNumber"
          class="accordion-collapse collapse"
          :aria-labelledby="'headingYear' + year.yearNumber"
          data-bs-parent="#pastYearsAccordion"
        >
          <div class="accordion-body p-4 bg-darker">
            <div class="mb-5">
              <h5 class="text-secondary border-bottom border-secondary pb-2 mb-3">
                <i class="bi bi-list-ol me-2"></i>Final Standings
              </h5>
              <div class="table-responsive bg-dark rounded border border-secondary shadow mb-4">
                <table class="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th class="ps-4">Rank</th>
                      <th>Player</th>
                      <th class="text-center">Points</th>
                      <th class="text-center">Wins</th>
                      <th class="text-center pe-4">Bonus</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="standing in year.finalStandings" :key="standing.player">
                      <td
                        class="ps-4 fw-bold"
                        :class="standing.rank === 1 ? 'text-warning' : 'text-secondary'"
                      >
                        #{{ standing.rank }}
                        <i
                          v-if="standing.rank === 1"
                          class="bi bi-star-fill text-warning ms-1 small"
                        ></i>
                      </td>
                      <td
                        class="fw-bold"
                        :class="standing.rank === 1 ? 'text-warning' : 'text-light'"
                      >
                        {{ standing.player }}
                      </td>
                      <td class="text-center fw-bold text-primary">{{ standing.totalPoints }}</td>
                      <td class="text-center text-success">{{ standing.totalWins }}</td>
                      <td class="text-center pe-4 text-info">{{ standing.bonusCount }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mb-5">
              <cScoreChart :games-played="year.gamesPlayed" />
            </div>

            <div class="mb-2">
              <h5 class="text-secondary border-bottom border-secondary pb-2 mb-3">
                <i class="bi bi-controller me-2"></i>Winner by Console
              </h5>
              <cConsoleStandings :consoles-played="year.consolesPlayed" :games-played="year.gamesPlayed" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'
import cConsoleStandings from './cConsoleStandings.vue'
import cScoreChart from './cScoreChart.vue'

export default {
  name: 'cRetroYears',
  components: { cConsoleStandings, cScoreChart },
  setup() {
    const gc = useGameCompetition()

    onMounted(() => gc.loadAll())

    // yearNumber here is the actual year label (e.g. "2025"), reused as-is from years.json.
    // yearWinner already comes back comma-joined for ties from getEndOfYearResults.
    const pastYears = computed(() => {
      return gc.years.value
        .filter((y) => !y.isActive)
        .map((y) => ({ yearNumber: y.year, ...gc.getEndOfYearResults(y.yearId) }))
        .filter((y) => y.finalStandings.length > 0)
        .sort((a, b) => b.yearNumber - a.yearNumber)
    })

    return { pastYears }
  },
}
</script>

<style scoped>
.c-retro-years {
  padding: 1rem;
  overflow-x: hidden;
}
.bg-darker {
  background-color: #121212;
}

@media (max-width: 767.98px) {
  .accordion-button {
    flex-direction: column;
    align-items: flex-start;
  }
  .badge {
    margin-top: 0.5rem;
    margin-left: 0 !important;
  }
}
</style>
