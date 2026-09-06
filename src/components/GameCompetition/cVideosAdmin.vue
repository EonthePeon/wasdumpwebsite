<template>
  <div>
    <button class="btn btn-primary mb-3" :disabled="loading" @click="fetchRecent">
      {{ loading ? 'Fetching...' : 'Fetch Recent Uploads' }}
    </button>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="candidates.length" class="mb-3">
      <button class="btn btn-success mb-3" @click="save">Save Selected ({{ selectedIds.size }})</button>
      <div class="row g-3">
        <div class="col-md-4" v-for="v in candidates" :key="v.videoId">
          <div class="card h-100" :class="{ 'border-success': selectedIds.has(v.videoId) }">
            <img :src="v.thumbnail" class="card-img-top" />
            <div class="card-body">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :checked="selectedIds.has(v.videoId)"
                  @change="toggle(v.videoId)"
                />
                <label class="form-check-label small">{{ v.title }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const error = ref('')
const candidates = ref([])
const selectedIds = ref(new Set())

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

    // Pre-check whatever's already featured, matched by video id in its url.
    const current = await fetch(`/videos.json?t=${Date.now()}`).then((r) => (r.ok ? r.json() : []))
    const currentIds = current.map((v) => v.url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1]).filter(Boolean)
    selectedIds.value = new Set(data.videos.map((v) => v.videoId).filter((id) => currentIds.includes(id)))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function toggle(videoId) {
  const next = new Set(selectedIds.value)
  next.has(videoId) ? next.delete(videoId) : next.add(videoId)
  selectedIds.value = next
}

async function save() {
  const selected = candidates.value
    .filter((v) => selectedIds.value.has(v.videoId))
    .map((v) => ({
      url: `https://youtu.be/${v.videoId}`,
      title: v.title,
      date: v.date,
      thumbnail: v.thumbnail,
    }))
  await fetch('/api/save-videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(selected),
  })
}
</script>
