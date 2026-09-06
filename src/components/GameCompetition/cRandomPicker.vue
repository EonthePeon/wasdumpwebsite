<template>
  <div class="wheel-wrap">
    <div class="wheel-pointer">▼</div>
    <div v-if="winnerName" class="wheel-winner-flash">{{ winnerName }}</div>
    <div ref="wheelEl" class="wheel" :style="wheelStyle">
      <svg viewBox="0 0 200 200">
        <g v-for="(opt, i) in options" :key="opt.id">
          <path :d="slicePath(i)" :fill="sliceColor(i)" />
          <text :transform="labelTransform(i)" text-anchor="middle" class="wheel-label" :font-size="labelFontSize">{{ opt.name }}</text>
        </g>
      </svg>
    </div>
    <button class="btn btn-primary mt-3" :disabled="spinning || options.length === 0" @click="spin">
      {{ spinning ? 'Spinning...' : 'Spin' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ options: { type: Array, required: true } })
const emit = defineEmits(['picked'])

const wheelEl = ref(null)
const rotation = ref(0)
const spinning = ref(false)
const spinDuration = ref(0)
const winnerName = ref('')

const wheelStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg)`,
  transitionDuration: `${spinDuration.value}ms`,
  transitionTimingFunction: 'cubic-bezier(0.1, 0.65, 0.1, 1)', // fast start, long slow-down
}))

const palette = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#7c3aed', '#00d4ff', '#ff9f43', '#2ecc71', '#e84393']
const sliceColor = (i) => palette[i % palette.length]
const sliceAngle = () => 360 / props.options.length

// Smaller slices (more options) need smaller text to fit without overlapping.
const labelFontSize = computed(() => Math.max(4, Math.min(12, sliceAngle() * 0.35)))

function polar(radius, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: 100 + radius * Math.cos(a), y: 100 + radius * Math.sin(a) }
}

function slicePath(i) {
  const angle = sliceAngle()
  const start = polar(95, i * angle)
  const end = polar(95, (i + 1) * angle)
  const largeArc = angle > 180 ? 1 : 0
  return `M100,100 L${start.x},${start.y} A95,95 0 ${largeArc} 1 ${end.x},${end.y} Z`
}

function labelTransform(i) {
  const mid = i * sliceAngle() + sliceAngle() / 2
  const p = polar(65, mid)
  // Radial orientation (runs along the slice); flip 180 on the bottom half so it isn't upside-down.
  let rot = mid - 90
  if (mid > 90 && mid < 270) rot += 180
  return `translate(${p.x}, ${p.y}) rotate(${rot})`
}

let spinToken = 0
function spin() {
  if (spinning.value || props.options.length === 0) return
  spinning.value = true
  winnerName.value = ''

  const targetIndex = Math.floor(Math.random() * props.options.length)
  const angle = sliceAngle()
  const jitter = (Math.random() - 0.5) * angle * 0.6
  const targetAngle = targetIndex * angle + angle / 2 + jitter

  // Pointer is fixed at the top (0deg) — rotate the wheel so targetAngle lands there.
  const currentMod = rotation.value % 360
  let delta = (360 - targetAngle - currentMod) % 360
  if (delta < 0) delta += 360

  const extraSpins = 6 + Math.floor(Math.random() * 4) // 6-9 full turns for a good spin-up
  spinDuration.value = 10000 + Math.random() * 10000 // 10-20s
  rotation.value += delta + extraSpins * 360

  const token = ++spinToken
  const onEnd = () => {
    if (token !== spinToken) return
    wheelEl.value.removeEventListener('transitionend', onEnd)
    spinning.value = false
    winnerName.value = props.options[targetIndex].name
    emit('picked', props.options[targetIndex])
  }
  wheelEl.value.addEventListener('transitionend', onEnd)
}
</script>

<style scoped>
.wheel-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.wheel {
  width: min(520px, 90vw);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
}
.wheel-pointer {
  font-size: 1.5rem;
  color: #ffe66d;
  margin-bottom: -0.5rem;
  z-index: 1;
}
.wheel-label {
  fill: #111;
  font-weight: bold;
}
.wheel-winner-flash {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffe66d;
  animation: winner-flash 0.5s ease-in-out 4;
}
@keyframes winner-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}
</style>
