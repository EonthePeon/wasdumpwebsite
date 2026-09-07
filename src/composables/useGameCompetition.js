import { ref, computed } from 'vue'

const consoles = ref([])
const players = ref([])
const games = ref([])
const years = ref([])
const competitions = ref([])
const loaded = ref(false)

const FILES = ['consoles', 'players', 'games', 'years', 'competitions']
const REFS = { consoles, players, games, years, competitions }

export function useGameCompetition() {
  const isDev = import.meta.env.DEV

  async function loadAll() {
    if (loaded.value) return
    await Promise.all(FILES.map(async (file) => {
      try {
        const res = await fetch(`/game-competition/${file}.json?t=${Date.now()}`)
        REFS[file].value = res.ok ? await res.json() : []
      } catch (e) {
        console.warn(`GameCompetition: could not load ${file}.json`, e)
        REFS[file].value = []
      }
    }))
    loaded.value = true
  }

  // Persists one file back to disk via the dev-only vite save endpoint.
  // No-ops in production — there's no server to receive the write.
  // On failure, rolls back the optimistic update and alerts loudly — a save
  // that silently fails looks identical to one that worked, which is how
  // results have gotten lost before.
  async function save(file, data) {
    if (!isDev) return
    const previous = REFS[file].value
    REFS[file].value = data
    try {
      const res = await fetch(`/api/save-data/${file}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json().catch(() => null)
      if (!res.ok || !result?.ok) {
        throw new Error(result?.error || `HTTP ${res.status}`)
      }
    } catch (e) {
      REFS[file].value = previous
      console.error(`GameCompetition: save ${file} failed`, e)
      alert(`Failed to save — your change was NOT saved.\n\n${file}.json: ${e.message}\n\nIs "npm run dev" still running?`)
    }
  }

  const saveConsoles = (data) => save('consoles', data)
  const saveGames = (data) => save('games', data)
  const saveYears = (data) => save('years', data)
  const saveCompetitions = (data) => save('competitions', data)

  const consoleName = (systemId) => consoles.value.find((c) => c.systemId === systemId)?.system ?? ''
  const gameName = (gameId) => games.value.find((g) => g.gameId === gameId)?.game ?? ''
  const playerName = (userId) => players.value.find((p) => p.userId === userId)?.name ?? ''

  const activeYear = computed(() => years.value.find((y) => y.isActive))

  const currentCompetition = computed(() =>
    competitions.value.find((c) => c.active && !c.complete)
  )

  // Ported from CompetitionService.CalculateScore
  function calculateScore(playerCount, place, bonus) {
    return playerCount - place + (bonus ?? 0)
  }

  // Ported from CompetitionService.GetEndOfYearResults
  function getEndOfYearResults(yearId) {
    const yearCompetitions = competitions.value.filter((c) => c.yearId === yearId && c.complete)

    const gamesPlayed = []
    const consoleWins = new Map() // consoleName -> Map(playerName -> wins)
    const consoleGameCounts = new Map()
    const playerTotals = new Map() // playerName -> { player, totalPoints, totalWins, bonusCount }

    for (const comp of yearCompetitions) {
      const console_ = consoleName(comp.systemId)
      consoleGameCounts.set(console_, (consoleGameCounts.get(console_) ?? 0) + 1)

      const scores = comp.results.map((r) => ({
        player: playerName(r.userId),
        points: calculateScore(comp.playerCount, r.place, r.bonusPoints),
        gotBonus: (r.bonusPoints ?? 0) > 0,
        place: r.place,
      }))

      for (const s of scores) {
        if (!playerTotals.has(s.player)) {
          playerTotals.set(s.player, { player: s.player, totalPoints: 0, totalWins: 0, bonusCount: 0 })
        }
        const standing = playerTotals.get(s.player)
        standing.totalPoints += s.points
        if (s.gotBonus) standing.bonusCount += 1
        if (s.place === 1) {
          standing.totalWins += 1
          if (!consoleWins.has(console_)) consoleWins.set(console_, new Map())
          const winsMap = consoleWins.get(console_)
          winsMap.set(s.player, (winsMap.get(s.player) ?? 0) + 1)
        }
      }

      const winner = scores.find((s) => s.place === 1)?.player ?? ''
      gamesPlayed.push({
        gameName: gameName(comp.gameId),
        console: console_,
        competionDate: new Date(comp.competionDate).toLocaleDateString('en-US'),
        winner,
        scores: [...scores].sort((a, b) => b.points - a.points),
      })
    }

    const consolesPlayed = [...consoleGameCounts.entries()].map(([name, count]) => ({
      consoleName: name,
      gamesPlayedCount: count,
      playerWins: [...(consoleWins.get(name) ?? new Map()).entries()]
        .map(([player, wins]) => ({ player, wins }))
        .sort((a, b) => b.wins - a.wins || a.player.localeCompare(b.player)),
    }))

    const finalStandings = [...playerTotals.values()].sort(
      (a, b) => b.totalPoints - a.totalPoints || b.totalWins - a.totalWins || a.player.localeCompare(b.player)
    )

    // Dense rank: ties share a rank, next rank continues from distinct-value count.
    let rank = 0
    let prevPoints = null
    finalStandings.forEach((p, i) => {
      if (p.totalPoints !== prevPoints) {
        rank = i + 1
        prevPoints = p.totalPoints
      }
      p.rank = rank
    })

    // All players tied for 1st, comma-joined — not just the first one alphabetically.
    const yearWinner = finalStandings
      .filter((p) => p.rank === 1)
      .map((p) => p.player)
      .join(', ')

    return {
      consolesPlayed,
      gamesPlayed: gamesPlayed.sort((a, b) => new Date(b.competionDate) - new Date(a.competionDate)),
      finalStandings,
      yearWinner,
    }
  }

  // Ported from CompetitionService.GetResults — current-year standings only.
  const standings = computed(() => {
    if (!activeYear.value) return []
    const results = getEndOfYearResults(activeYear.value.yearId)
    return results.finalStandings
  })

  return {
    consoles, players, games, years, competitions, loaded, isDev,
    loadAll, saveConsoles, saveGames, saveYears, saveCompetitions,
    consoleName, gameName, playerName,
    activeYear, currentCompetition, standings,
    calculateScore, getEndOfYearResults,
  }
}
