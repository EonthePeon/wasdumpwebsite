import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import D20View from '@/View/D20View.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/roll',
      name: 'roll',
      component: D20View,
    },
    {
      path: '/boss-tracker',
      name: 'BossTracker',
      component: () => import('@/views/BossTrackerView.vue'),
    },
  ],
  // Add this to handle scrolling to hash links and fixing navbar overlap
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 70, // <-- Adjust this number to match your fixed navbar height
      }
    }
    // Scroll to top by default if there's no hash
    return { top: 0 }
  },
})

export default router
