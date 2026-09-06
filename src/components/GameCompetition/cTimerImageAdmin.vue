<template>
  <div>
    <p class="text-muted">This is the background image shown while the competition timer counts down.</p>
    <img :src="previewSrc" class="mb-3 d-block" style="max-width: 400px; border-radius: 8px" />
    <div>
      <input ref="fileInput" type="file" accept="image/*" class="form-control mb-2" style="max-width: 400px" @change="onPick" />
      <button class="btn btn-primary" :disabled="!file || uploading" @click="upload">
        {{ uploading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>
    <div v-if="message" class="alert alert-success mt-3" style="max-width: 400px">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const cacheBust = ref(Date.now())
const previewSrc = ref(`/assets/images/game.jpg?t=${cacheBust.value}`)
const file = ref(null)
const uploading = ref(false)
const message = ref('')

function onPick(e) {
  file.value = e.target.files[0] || null
  message.value = ''
  if (file.value) previewSrc.value = URL.createObjectURL(file.value)
}

async function upload() {
  uploading.value = true
  message.value = ''
  try {
    await fetch('/api/upload-timer-image', { method: 'POST', body: file.value })
    message.value = 'Image updated.'
    previewSrc.value = `/assets/images/game.jpg?t=${Date.now()}`
    file.value = null
  } finally {
    uploading.value = false
  }
}
</script>
