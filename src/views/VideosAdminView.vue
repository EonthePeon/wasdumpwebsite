<template>
  <div class="container py-4">
    <h2 class="mb-4">Videos Admin</h2>
    <div v-if="!isDev" class="alert alert-info">
      This tool only works locally (<code>npm run dev</code>) — nothing to see here on the live site.
    </div>
    <cVideosAdmin v-else />
  </div>
</template>

<script setup>
import cVideosAdmin from '@/components/GameCompetition/cVideosAdmin.vue'

const isDev = import.meta.env.DEV
</script>
