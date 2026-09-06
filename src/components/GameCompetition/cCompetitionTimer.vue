<template>
  <div class="timer-page d-flex flex-column justify-content-center align-items-center">

    <!-- Timer running: show image + countdown -->
    <div v-if="timerRunning" class="timer-running text-center w-100">
      <div class="timer-image-wrap mb-4">
        <img src="/assets/images/game.jpg" alt="Competition Timer" class="timer-img" />
        <div class="timer-img-overlay"></div>
      </div>
      <div class="countdown-display">
        <p class="countdowntimer">{{ timerText }}</p>
      </div>
    </div>

    <!-- Pre-start: lights + button -->
    <div v-else class="timer-prestart text-center">
      <div class="mb-2 gc-section-label">COMPETITION TIMER</div>
      <h1 class="gc-gradient-text fw-bold mb-5" style="font-size: 2rem; letter-spacing: 3px">GET READY</h1>

      <div class="lights-row mb-5">
        <div v-for="light in lights" :key="light.id" class="light-slot">
          <span class="dot" :class="{ 'dot-on': light.isOn }"></span>
        </div>
      </div>

      <button
        v-if="!preTimerStarted"
        type="button"
        class="btn btn-primary btn-start"
        @click="startTimerProcess()"
      >
        <i class="bi bi-play-fill me-2"></i>Start Timer
      </button>

      <div v-if="preTimerStarted && !timerRunning" class="mt-4" style="color: var(--gc-text-muted); letter-spacing: 2px; font-size: 0.85rem">
        LAUNCHING...
      </div>
    </div>

  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'cCompetitionTimer',
  setup() {
    const lights = ref([1, 2, 3, 4, 5].map((id) => ({ id, isOn: false })))
    const preTimerStarted = ref(false)
    const timerRunning = ref(false)
    const timerText = ref('60:00')

    // Sequentially light up the 5 start-lights, then fire the run after a random delay
    function startTimerProcess() {
      preTimerStarted.value = true
      lights.value.forEach((light) => { light.isOn = false })

      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex < lights.value.length) {
          lights.value[currentIndex].isOn = true
          currentIndex++
        } else {
          clearInterval(interval)
          const randomDelay = Math.floor(Math.random() * 2500) + 500
          setTimeout(startRunning, randomDelay)
        }
      }, 1000)
    }

    function startRunning() {
      playSound()
      timerRunning.value = true
      let remainingTime = 3600
      const timerInterval = setInterval(() => {
        if (remainingTime > 0) {
          remainingTime--
          const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0')
          const seconds = (remainingTime % 60).toString().padStart(2, '0')
          timerText.value = `${minutes}:${seconds}`
        } else {
          clearInterval(timerInterval)
          timerRunning.value = false
          timerText.value = "TIME'S UP!"
          playSound()
        }
      }, 1000)
    }

    function playSound() {
      const audio = new Audio(timerRunning.value ? '/alerts/OhNo.mp3' : '/alerts/LetsGo.mp3')
      audio.play()
    }

    return { lights, preTimerStarted, timerRunning, timerText, startTimerProcess }
  },
}
</script>

<style scoped>
.timer-page {
  min-height: calc(100vh - 120px);
}

.timer-running { width: 100%; }

.timer-image-wrap {
  position: relative;
  width: 100%;
  max-width: 600px;
  aspect-ratio: 16 / 9;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--gc-border);
  box-shadow: 0 0 60px rgba(0, 212, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #181c2a;
}

.timer-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  margin: auto;
}

.timer-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(10, 14, 26, 0.8) 100%);
}

.countdown-display {
  margin-top: 1rem;
}

.countdowntimer {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(2.5rem, 8vw, 5rem);
  color: var(--gc-red, #ff4757);
  text-shadow: 0 0 30px rgba(255, 71, 87, 0.8), 0 0 60px rgba(255, 71, 87, 0.4);
  margin: 0;
  letter-spacing: 4px;
}

.timer-prestart { padding: 2rem 1rem; }

.lights-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.light-slot {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(60, 60, 80, 0.5);
  border: 3px solid rgba(255, 255, 255, 0.05);
  display: block;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.dot.dot-on {
  background: radial-gradient(circle at 35% 35%, #ff6b6b, #cc0000);
  border-color: rgba(255, 71, 87, 0.5);
  box-shadow: 0 0 30px rgba(255, 71, 87, 0.8), 0 0 60px rgba(255, 71, 87, 0.4);
}

.btn-start {
  font-size: 1.1rem;
  padding: 0.75rem 2.5rem;
  letter-spacing: 2px;
}

@media (max-width: 600px) {
  .dot { width: 55px; height: 55px; }
  .lights-row { gap: 14px; }
}
</style>
