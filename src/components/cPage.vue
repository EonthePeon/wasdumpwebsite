<template>
  <div class="c-page">
    <div id="About" class="section-anchor"><cAbout /></div>
    <div id="Schedule" class="section-anchor"><cSchedule /></div>
    <div id="RecentVideos" class="section-anchor"><cVods /></div>
    <div id="PassAndPlay" class="section-anchor"><cBossTrackerWidget /></div>
    <div id="RetroRaces" class="section-anchor"><cRetro /></div>
  </div>
</template>

<script>
import cAbout from './cAbout.vue'
import cBossTrackerWidget from './cBossTrackerWidget.vue'
import cRetro from './cRetro.vue'
import cSchedule from './cSchedule.vue'
import cVods from './cVods.vue'

export default {
  name: 'cPage',
  components: {
    cAbout,
    cBossTrackerWidget,
    cRetro,
    cSchedule,
    cVods,
  },
}
</script>

<style scoped></style>
