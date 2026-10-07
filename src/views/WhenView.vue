<template>
  <div class="container py-4">
    <h2 class="mb-1">When</h2>
    <p class="text-muted">What time it is for everyone, and when we're playing.</p>

    <div class="card border-secondary mb-4">
      <div class="card-body d-flex flex-wrap align-items-center gap-3">
        <label for="play-time" class="mb-0 fw-bold">We're playing at</label>
        <input
          id="play-time"
          type="time"
          class="form-control"
          style="width: auto"
          :value="playTime"
          @input="setPlayTime($event.target.value)"
        />
        <label for="play-zone" class="mb-0">in</label>
        <select
          id="play-zone"
          class="form-select"
          style="width: auto"
          :value="activeReferenceTz"
          @change="setReferenceTz($event.target.value)"
        >
          <option v-for="c in cities" :key="c.label + c.tz" :value="c.tz">{{ c.label }}</option>
        </select>
        <span v-if="nextLabel" class="text-muted small">next: {{ nextLabel }}</span>
      </div>
    </div>

    <div class="d-flex flex-wrap gap-2 mb-3 small">
      <span class="legend period-day"><i class="bi bi-sun-fill me-1"></i>Day 6am–6pm</span>
      <span class="legend period-evening"><i class="bi bi-sunset-fill me-1"></i>Evening 6pm–10pm</span>
      <span class="legend period-night"><i class="bi bi-moon-stars-fill me-1"></i>Night 10pm–6am</span>
    </div>

    <div v-if="!rows.length" class="text-muted mb-4">No cities yet — add one below.</div>

    <div class="d-flex flex-column gap-3 mb-4">
      <div v-for="(row, i) in rows" :key="row.label + row.tz" class="city">
        <div class="city-header">
          <div>
            <span class="fw-bold fs-5">{{ row.label }}</span>
            <small class="text-muted ms-2">{{ row.tz }}</small>
          </div>
          <button class="btn btn-sm btn-outline-danger" :aria-label="`Remove ${row.label}`" @click="removeCity(i)">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="slot" :class="`period-${row.nowPeriod}`">
          <div class="slot-label">Now</div>
          <div class="slot-time"><i class="bi me-2" :class="ICONS[row.nowPeriod]"></i>{{ row.nowTime }}</div>
          <div class="slot-sub">{{ row.nowDay }} · {{ row.nowZone }}</div>
        </div>

        <div class="slot" :class="`period-${row.playPeriod}`">
          <div class="slot-label">When we play</div>
          <div class="slot-time"><i class="bi me-2" :class="ICONS[row.playPeriod]"></i>{{ row.playTime }}</div>
          <div class="slot-sub">{{ row.playDay }} · {{ row.playZone }}</div>
        </div>
      </div>
    </div>

    <div class="card border-secondary">
      <div class="card-body">
        <h5 class="card-title">Add a city</h5>
        <div class="row g-2">
          <div class="col-md-4">
            <input v-model="newLabel" type="text" class="form-control" placeholder="Label (optional), e.g. Tokyo" />
          </div>
          <div class="col-md-5">
            <input
              v-model="newTz"
              type="text"
              class="form-control"
              list="zone-list"
              placeholder="Time zone, e.g. Asia/Tokyo"
              @keyup.enter="add"
            />
            <datalist id="zone-list">
              <option v-for="z in zones" :key="z" :value="z" />
            </datalist>
          </div>
          <div class="col-md-3">
            <button class="btn btn-primary w-100" :disabled="!resolvedTz" @click="add">Add</button>
          </div>
        </div>
        <div class="small text-muted mt-2">
          Zones are named after a big city in them — Houston is <code>America/Chicago</code>, Salzburg is
          <code>Europe/Vienna</code>. Daylight saving is handled automatically.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  useWorldClock,
  allZones,
  isValidZone,
  labelFromZone,
  formatDay,
  formatTime,
} from '@/composables/useWorldClock'

const { rows, cities, playTime, activeReferenceTz, playInstant, addCity, removeCity, setPlayTime, setReferenceTz } =
  useWorldClock()

const ICONS = { day: 'bi-sun-fill', evening: 'bi-sunset-fill', night: 'bi-moon-stars-fill' }
const zones = allZones()
const newLabel = ref('')
const newTz = ref('')

// Accepts a full zone ("Asia/Tokyo") or just its city name ("Tokyo").
const resolvedTz = computed(() => {
  const input = newTz.value.trim()
  if (!input) return ''
  if (isValidZone(input)) return input
  return zones.find((z) => labelFromZone(z).toLowerCase() === input.toLowerCase()) ?? ''
})

const nextLabel = computed(() =>
  playInstant.value
    ? `${formatDay(playInstant.value, activeReferenceTz.value)}, ${formatTime(playInstant.value, activeReferenceTz.value)}`
    : '',
)

function add() {
  if (!resolvedTz.value) return
  addCity(newLabel.value, resolvedTz.value)
  newLabel.value = ''
  newTz.value = ''
}
</script>

<style scoped>
.city {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.city-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.slot {
  border-radius: 12px;
  padding: 0.9rem 1rem;
}
.slot-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.75;
}
.slot-time {
  font-size: clamp(1.05rem, 4.6vw, 1.6rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.slot-sub {
  font-size: 0.8rem;
  opacity: 0.85;
}
.legend {
  border-radius: 999px;
  padding: 0.2rem 0.75rem;
}
.period-day {
  background: linear-gradient(135deg, #ffe082, #ffb300);
  color: #3b2a00;
}
.period-evening {
  background: linear-gradient(135deg, #ff8a65, #7e57c2);
  color: #fff;
}
.period-night {
  background: linear-gradient(135deg, #0d1233, #243b83);
  color: #e8ecff;
}
</style>
