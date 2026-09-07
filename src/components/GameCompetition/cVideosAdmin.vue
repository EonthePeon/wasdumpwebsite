<template>
  <div>
    <div class="mb-4">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="mb-0">Selected ({{ selected.length }})</h5>
        <button class="btn btn-success btn-sm" :disabled="!selected.length" @click="save">Save Selected</button>
      </div>
      <div v-if="!selected.length" class="text-muted small">Nothing featured yet — pick some from the list below.</div>
      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-items-center gap-3 p-2 border rounded" v-for="(v, idx) in selected" :key="v.videoId">
          <img :src="v.thumbnail" style="width: 100px" />
          <span class="flex-grow-1 small">{{ v.title }}</span>
          <button class="btn btn-sm btn-outline-secondary" :disabled="idx === 0" @click="move(idx, -1)">↑</button>
          <button class="btn btn-sm btn-outline-secondary" :disabled="idx === selected.length - 1" @click="move(idx, 1)">↓</button>
          <button class="btn btn-sm btn-outline-danger" @click="deselect(v.videoId)">Remove</button>
        </div>
      </div>
    </div>

    <button class="btn btn-primary mb-3" :disabled="loading" @click="fetchRecent">
      {{ loading ? 'Fetching...' : 'Fetch Recent Uploads' }}
    </button>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="candidates.length" class="row g-3">
      <div class="col-md-4" v-for="v in candidates" :key="v.videoId">
        <div class="card h-100" :class="{ 'border-success': isSelected(v.videoId) }">
          <img :src="v.thumbnail" class="card-img-top" />
          <div class="card-body">
            <div class="form-check">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="isSelected(v.videoId)"
                @change="toggle(v)"
              />
              <label class="form-check-label small">{{ v.title }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(false)
const error = ref('')
const candidates = ref([])
const selected = ref([]) // ordered [{videoId, title, thumbnail, date}]

const videoIdFromUrl = (url) => url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1]
const isSelected = (videoId) => selected.value.some((v) => v.videoId === videoId)

onMounted(async () => {
  const current = await fetch(`/videos.json?t=${Date.now()}`).then((r) => (r.ok ? r.json() : []))
  selected.value = current
    .map((v) => ({ videoId: videoIdFromUrl(v.url), title: v.title, thumbnail: v.thumbnail, date: v.date }))
    .filter((v) => v.videoId)
})

async function fetchRecent() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/youtube-recent')
    const data = await res.json()
    if (!data.ok) {
      error.value = data.error
      return
    }
    candidates.value = data.videos
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function toggle(video) {
  if (isSelected(video.videoId)) {
    deselect(video.videoId)
  } else {
    selected.value = [...selected.value, video]
  }
}

function deselect(videoId) {
  selected.value = selected.value.filter((v) => v.videoId !== videoId)
}

function move(idx, delta) {
  const target = idx + delta
  if (target < 0 || target >= selected.value.length) return
  const next = [...selected.value]
  ;[next[idx], next[target]] = [next[target], next[idx]]
  selected.value = next
}

async function save() {
  const data = selected.value.map((v) => ({
    url: `https://youtu.be/${v.videoId}`,
    title: v.title,
    date: v.date,
    thumbnail: v.thumbnail,
  }))
  try {
    const res = await fetch('/api/save-videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json().catch(() => null)
    if (!res.ok || !result?.ok) throw new Error(result?.error || `HTTP ${res.status}`)
  } catch (e) {
    alert(`Save failed: ${e.message}\n\nIs "npm run dev" still running?`)
  }
}
</script>
