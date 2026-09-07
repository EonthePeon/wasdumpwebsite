<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
    <div class="container">
      <RouterLink class="navbar-brand py-0" to="/">
        <span class="text-white">WAS</span><span class="text-warning">DUMP</span>
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ path: '/', hash: '#About' }">
              <i class="bi bi-info-circle me-2"></i>About
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ path: '/', hash: '#Schedule' }">
              <i class="bi bi-calendar-event me-2"></i>Schedule
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ path: '/', hash: '#RecentVideos' }">
              <i class="bi bi-camera-video me-2"></i>Videos
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ path: '/', hash: '#PassAndPlay' }">
              <i class="bi bi-award me-2"></i>Pass
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ path: '/', hash: '#RetroRaces' }">
              <i class="bi bi-controller me-2"></i>Races
            </RouterLink>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="navigateToBossTracker">
              <i class="bi bi-trophy me-2"></i>Bosses
            </a>
          </li>
          <li class="nav-item dropdown" v-if="isDev">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-gear me-2"></i>Admin
            </a>
            <ul class="dropdown-menu dropdown-menu-dark">
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'CompetitionTimer' }">Timer</RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'GameCompetitionAdmin' }">Competitions</RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'VideosAdmin' }">Videos</RouterLink>
              </li>
            </ul>
          </li>
        </ul>
        <div class="d-flex align-items-center">
          <a
            href="https://www.youtube.com/@WASDump"
            target="_blank"
            class="nav-link text-danger fs-4 me-3"
            title="YouTube"
          >
            <i class="bi bi-youtube"></i>
          </a>
          <a
            href="https://www.twitch.tv/wasdump"
            target="_blank"
            class="nav-link text-primary fs-4"
            title="Twitch"
          >
            <i class="bi bi-twitch"></i>
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'cHeader',
  data() {
    return { isDev: import.meta.env.DEV }
  },
  methods: {
    navigateToBossTracker() {
      this.$router.push({ name: 'BossTracker' })
    },
  },
}
</script>

<style scoped></style>
