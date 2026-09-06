import { ref, watch } from 'vue'

const STORAGE_KEY = 'game-competition.current-player'
const currentPlayerId = ref(localStorage.getItem(STORAGE_KEY) || '')

watch(currentPlayerId, (id) => localStorage.setItem(STORAGE_KEY, id))

// Replaces login: just remembers who's clicking "add" right now.
export function useCurrentPlayer() {
  return { currentPlayerId }
}
