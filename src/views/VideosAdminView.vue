<template>
  <div class="container py-4">
    <h2 class="mb-4">Videos Admin</h2>
    <div v-if="!isDev" class="alert alert-info">
      Editing only works in dev mode (<code>npm run dev</code>) — this page is read-only on the live site.
    </div>
    <cVideosAdmin />
  </div>
</template>

<script setup>
import cVideosAdmin from '@/components/GameCompetition/cVideosAdmin.vue'

const isDev = import.meta.env.DEV
</script>
