import { ref, computed, onMounted, onUnmounted } from 'vue'

const DEFAULT_CITIES = [
  { label: 'Houston', tz: 'America/Chicago' },
  { label: 'Sydney', tz: 'Australia/Sydney' },
  { label: 'Salzburg', tz: 'Europe/Vienna' },
]

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage blocked (private window) - the page still works, it just won't remember
  }
}

// Wall-clock parts of an instant in a zone. Intl handles DST for us.
function partsOf(date, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date)
  const get = (type) => Number(parts.find((p) => p.type === type).value)
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute'), second: get('second') }
}

function offsetMs(date, tz) {
  const p = partsOf(date, tz)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUtc - Math.floor(date.getTime() / 1000) * 1000
}

// The instant when a zone's wall clock reads hour:minute on the given date.
// Run twice so a DST jump between the guess and the answer still lands correctly.
function zonedTimeToUtc({ year, month, day }, hour, minute, tz) {
  const guess = Date.UTC(year, month - 1, day, hour, minute)
  const first = guess - offsetMs(new Date(guess), tz)
  return new Date(guess - offsetMs(new Date(first), tz))
}

// Next time (from `now`) that tz's clock reads "HH:mm".
export function nextOccurrence(timeStr, tz, now) {
  const [hour, minute] = timeStr.split(':').map(Number)
  const today = partsOf(now, tz)
  const candidate = zonedTimeToUtc(today, hour, minute, tz)
  if (candidate > now) return candidate
  const tomorrow = new Date(Date.UTC(today.year, today.month - 1, today.day + 1))
  return zonedTimeToUtc(
    { year: tomorrow.getUTCFullYear(), month: tomorrow.getUTCMonth() + 1, day: tomorrow.getUTCDate() },
    hour,
    minute,
    tz,
  )
}

export function periodOf(date, tz) {
  const { hour } = partsOf(date, tz)
  if (hour >= 6 && hour < 18) return 'day'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

export function formatTime(date, tz, withSeconds = false) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
  }).format(date)
}

export function formatDay(date, tz) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }).format(date)
}

export function zoneAbbreviation(date, tz) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')
  return part?.value ?? ''
}

export function isValidZone(tz) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

export function allZones() {
  return typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : DEFAULT_CITIES.map((c) => c.tz)
}

export function labelFromZone(tz) {
  return tz.split('/').pop().replace(/_/g, ' ')
}

export function useWorldClock() {
  const cities = ref(load('when.cities', DEFAULT_CITIES))
  const playTime = ref(load('when.playTime', '20:00'))
  const referenceTz = ref(load('when.referenceTz', DEFAULT_CITIES[0].tz))
  const now = ref(new Date())
  let timer = null

  onMounted(() => {
    timer = setInterval(() => (now.value = new Date()), 1000)
  })
  onUnmounted(() => clearInterval(timer))

  // If the reference city was removed, fall back to the first one.
  const activeReferenceTz = computed(() =>
    cities.value.some((c) => c.tz === referenceTz.value) ? referenceTz.value : cities.value[0]?.tz,
  )

  const playInstant = computed(() =>
    activeReferenceTz.value && playTime.value ? nextOccurrence(playTime.value, activeReferenceTz.value, now.value) : null,
  )

  const rows = computed(() =>
    cities.value.map((city) => ({
      ...city,
      nowTime: formatTime(now.value, city.tz, true),
      nowDay: formatDay(now.value, city.tz),
      nowPeriod: periodOf(now.value, city.tz),
      nowZone: zoneAbbreviation(now.value, city.tz),
      playTime: playInstant.value ? formatTime(playInstant.value, city.tz) : '',
      playDay: playInstant.value ? formatDay(playInstant.value, city.tz) : '',
      playPeriod: playInstant.value ? periodOf(playInstant.value, city.tz) : 'day',
      playZone: playInstant.value ? zoneAbbreviation(playInstant.value, city.tz) : '',
    })),
  )

  function persist() {
    save('when.cities', cities.value)
    save('when.playTime', playTime.value)
    save('when.referenceTz', referenceTz.value)
  }

  function addCity(label, tz) {
    cities.value = [...cities.value, { label: label.trim() || labelFromZone(tz), tz }]
    persist()
  }

  function removeCity(index) {
    cities.value = cities.value.filter((_, i) => i !== index)
    persist()
  }

  function setPlayTime(value) {
    playTime.value = value
    persist()
  }

  function setReferenceTz(value) {
    referenceTz.value = value
    persist()
  }

  return { rows, cities, playTime, activeReferenceTz, playInstant, addCity, removeCity, setPlayTime, setReferenceTz }
}
