<template>
  <div class="c-retro container mt-5 mb-5">
    <h2 class="mb-4 text-center text-primary"><i class="bi bi-joystick me-2"></i>Retro Races</h2>

    <div v-if="localResults" class="animate-fade-in">
      <div class="current-year-section mb-5">
        <h3 class="mb-4 text-secondary border-bottom border-secondary pb-2">
          <i class="bi bi-calendar-event me-2"></i>Current Year
        </h3>

        <div class="row g-4 mb-4">
          <div class="col-lg-8">
            <div class="card h-100 shadow-sm border-primary border-opacity-25">
              <div class="card-header bg-dark">
                <h4 class="mb-0">
                  <i class="bi bi-trophy me-2 text-warning"></i>Current Standings
                </h4>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-dark">
                      <tr>
                        <th class="ps-4">Rank</th>
                        <th>Player</th>
                        <th class="text-center">Points</th>
                        <th class="text-center">Wins</th>
                        <th class="text-center pe-4">Bonus</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="standing in localResults.finalStandings ||
                        localResults.finalstandings"
                        :key="standing.player"
                      >
                        <td class="ps-4 fw-bold text-secondary">
                          #{{ standing.rank || standing.Rank }}
                        </td>
                        <td class="fw-bold">{{ standing.player || standing.Player }}</td>
                        <td class="text-center fw-bold text-primary">
                          {{ standing.totalPoints ?? standing.totalpoints }}
                        </td>
                        <td class="text-center">{{ standing.totalWins ?? standing.totalwins }}</td>
                        <td class="text-center pe-4">
                          {{ standing.bonusCount ?? standing.bonuscount }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="px-4 pb-3">
                  <cScoreChart :games-played="localResults.gamesPlayed" />
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4" v-if="currentCompetition">
            <div class="card shadow-sm border-secondary h-100">
              <div class="card-header bg-transparent border-bottom border-secondary">
                <h4 class="mb-0 text-secondary"><i class="bi bi-flag me-2"></i>Current Race</h4>
              </div>
              <div class="card-body d-flex flex-column justify-content-center text-center">
                <h5 class="display-6 text-white mb-2">{{ currentCompetition.GameName }}</h5>
                <h6 class="card-subtitle mb-4 text-muted text-uppercase letter-spacing-2">
                  {{ currentCompetition.System }}
                </h6>

                <div
                  class="p-3 bg-black bg-opacity-25 rounded mb-3 border border-secondary border-opacity-25"
                >
                  <p class="card-text fst-italic text-light mb-0">
                    "{{ currentCompetition.Goal }}"
                  </p>
                </div>

                <p class="card-text mt-auto">
                  <small class="text-muted"
                    ><i class="bi bi-calendar3 me-1"></i>Date:
                    {{ currentCompetition.CompetionDateString }}</small
                  >
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="row mt-4"
          v-if="localResults.consolesPlayed && localResults.consolesPlayed.length"
        >
          <div class="col-12">
            <div class="card border-secondary">
              <div
                class="card-header cursor-pointer d-flex justify-content-between align-items-center bg-dark"
                @click="showConsoles = !showConsoles"
                role="button"
              >
                <h5 class="mb-0 text-white">
                  <i class="bi bi-hdd-network me-2"></i>Console Standings
                </h5>
                <i class="bi" :class="showConsoles ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
              <div class="card-body bg-darker" v-if="showConsoles">
                <cConsoleStandings
                  :consoles-played="localResults.consolesPlayed"
                  :games-played="localResults.gamesPlayed"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-4" v-if="localResults.gamesPlayed && localResults.gamesPlayed.length">
          <div class="col-12">
            <div class="card border-secondary">
              <div
                class="card-header cursor-pointer d-flex justify-content-between align-items-center bg-dark"
                @click="showGames = !showGames"
                role="button"
              >
                <h5 class="mb-0 text-white">
                  <i class="bi bi-collection-play me-2"></i>Games History
                </h5>
                <i class="bi" :class="showGames ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
              <div class="card-body p-0" v-if="showGames">
                <div class="table-responsive" style="max-height: 500px; overflow-y: auto">
                  <table class="table table-hover table-sm mb-0">
                    <thead class="table-dark sticky-top">
                      <tr>
                        <th class="ps-3">Game</th>
                        <th>Console</th>
                        <th>Date</th>
                        <th>Winner</th>
                        <th class="pe-3">Scores</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="game in localResults.gamesPlayed"
                        :key="game.gameName + game.competionDate"
                      >
                        <td class="ps-3 fw-medium text-light">{{ game.gameName }}</td>
                        <td>
                          <span class="badge bg-secondary text-dark bg-opacity-75">{{
                            game.console
                          }}</span>
                        </td>
                        <td class="small text-muted">{{ game.competionDate }}</td>
                        <td class="text-primary">{{ game.winner }}</td>
                        <td class="pe-3">
                          <ul class="list-inline mb-0 small">
                            <li
                              class="list-inline-item text-nowrap"
                              v-for="score in game.scores"
                              :key="score.player + score.points"
                            >
                              <span class="text-muted">{{ score.player }}:</span>
                              <span class="text-white">{{ score.points }}</span>
                            </li>
                          </ul>
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
      <div class="card border-secondary shadow-sm">
        <div
          class="card-header cursor-pointer d-flex justify-content-between align-items-center bg-dark"
          @click="showPastYears = !showPastYears"
          role="button"
        >
          <h5 class="mb-0 text-white"><i class="bi bi-archive me-2"></i>Previous Years</h5>
          <i class="bi" :class="showPastYears ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </div>
        <div class="card-body bg-darker" v-if="showPastYears">
          <cRetroYears />
        </div>
      </div>
    </div>
    <div v-else class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading standings data...</p>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'
import cRetroYears from './cRetroYears.vue'
import cConsoleStandings from './cConsoleStandings.vue'
import cScoreChart from './cScoreChart.vue'

export default {
  name: 'cRetro',
  components: {
    cRetroYears,
    cConsoleStandings,
    cScoreChart,
  },
  setup() {
    const gc = useGameCompetition()
    const showConsoles = ref(false)
    const showGames = ref(false)
    const showPastYears = ref(false)

    onMounted(() => gc.loadAll())

    // Current-year standings/games, computed live from competitions.json — no more hand-copied JSON snapshots.
    const localResults = computed(() => {
      if (!gc.activeYear.value) return null
      return gc.getEndOfYearResults(gc.activeYear.value.yearId)
    })

    const currentCompetition = computed(() => {
      const c = gc.currentCompetition.value
      if (!c) return null
      return {
        GameName: gc.gameName(c.gameId),
        System: gc.consoleName(c.systemId),
        Goal: c.goal,
        CompetionDateString: new Date(c.competionDate).toLocaleDateString('en-US'),
      }
    })

    return {
      localResults,
      showConsoles,
      showGames,
      showPastYears,
      currentCompetition,
    }
  },
}
</script>

