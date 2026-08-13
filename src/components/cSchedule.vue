<template>
  <div class="c-schedule container mt-4">
    <h2 class="mb-4 text-center">Stream Schedule</h2>
    <div class="row justify-content-center">
      <!-- Sorted Schedule Cards -->
      <div v-for="day in sortedSchedule" :key="day.name" class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header text-center fw-bold">
            {{ day.name }}
          </div>
          <div
            class="card-body d-flex flex-column align-items-center justify-content-center text-center"
          >
            <h5 class="card-title">{{ day.game }}</h5>
            <p class="card-text mb-1">
              <i class="bi bi-calendar-event me-2 text-primary"></i>Every {{ day.name }}
            </p>
            <p class="card-text"><i class="bi bi-clock me-2 text-secondary"></i>{{ day.time }}</p>
          </div>
        </div>
      </div>

      <!-- Baldur's Pass Flexible Card -->
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header text-center fw-bold">Flexible</div>
          <div
            class="card-body d-flex flex-column align-items-center justify-content-center text-center"
          >
            <h5 class="card-title">Baldur's Pass</h5>
            <p class="card-text mb-1">
              <i class="bi bi-calendar-event me-2 text-primary"></i>Scheduled flexibly as time
              permits.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'cSchedule',
  data() {
    return {
      scheduleItems: [
        {
          name: 'Sunday',
          dayIndex: 0,
          game: 'Retro Races',
          time: '8:00 PM CST',
        },
        {
          name: 'Tuesday',
          dayIndex: 2,
          game: 'Big Walk',
          time: 'Around 8:00 PM CST',
        },
      ],
    }
  },
  computed: {
    sortedSchedule() {
      const today = new Date().getDay()
      return [...this.scheduleItems].sort((a, b) => {
        // Calculate days from today (0-6)
        // (dayIndex - today + 7) % 7 gives the number of days into the future
        const diffA = (a.dayIndex - today + 7) % 7
        const diffB = (b.dayIndex - today + 7) % 7
        return diffA - diffB
      })
    },
  },
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}
</style>
