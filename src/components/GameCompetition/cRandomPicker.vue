<template>
  <div>
    <div class="row g-2">
      <div
        class="col-6 col-md-3 picker-tile"
        :class="{ 'picker-tile-selected': tile.selected, 'picker-tile-flash': isShuffling }"
        v-for="tile in tiles"
        :key="tile.id"
        v-show="tile.selected || !settled"
      >
        {{ tile.name }}
      </div>
    </div>
    <button class="btn btn-primary mt-3" :disabled="running" @click="run">
      {{ running ? 'Picking...' : 'Spin' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ options: { type: Array, required: true } })
const emit = defineEmits(['picked'])

const tiles = ref(props.options.map((o) => ({ ...o, selected: false })))
const isShuffling = ref(false)
const settled = ref(false)
const running = ref(false)

// Quick shuffle animation, then settle on a random tile — same feel as the old spin-the-wheel picker.
function run() {
  running.value = true
  settled.value = false
  tiles.value = props.options.map((o) => ({ ...o, selected: false }))
  isShuffling.value = true

  let ticks = 0
  const shuffleInterval = setInterval(() => {
    tiles.value.forEach((t) => (t.selected = false))
    tiles.value[Math.floor(Math.random() * tiles.value.length)].selected = true
    ticks++
    if (ticks > 12) {
      clearInterval(shuffleInterval)
      isShuffling.value = false
      settled.value = true
      running.value = false
      const picked = tiles.value.find((t) => t.selected)
      emit('picked', picked)
    }
  }, 150)
}
</script>

<style scoped>
.picker-tile {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  margin-bottom: 0.5rem;
}
.picker-tile-flash { background: #222; color: #fff; }
.picker-tile-selected { background: lightgreen; color: #000; }
</style>
