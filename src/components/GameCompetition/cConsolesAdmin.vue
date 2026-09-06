<template>
  <div>
    <div class="d-flex gap-2 mb-3">
      <input v-model="newName" type="text" class="form-control" placeholder="New console name" @keyup.enter="add" />
      <button class="btn btn-primary" :disabled="!newName.trim()" @click="add">Add Console</button>
    </div>

    <table class="table table-dark table-sm">
      <thead><tr><th>System</th><th>Games</th><th></th></tr></thead>
      <tbody>
        <tr v-for="c in gc.consoles.value" :key="c.systemId">
          <td>
            <input v-if="editingId === c.systemId" v-model="editName" class="form-control form-control-sm" />
            <span v-else>{{ c.system }}</span>
          </td>
          <td>{{ gameCount(c.systemId) }}</td>
          <td class="text-end">
            <button v-if="editingId === c.systemId" class="btn btn-sm btn-success me-1" @click="saveEdit">Save</button>
            <button v-if="editingId === c.systemId" class="btn btn-sm btn-secondary" @click="editingId = ''">Cancel</button>
            <button v-else class="btn btn-sm btn-outline-light" @click="startEdit(c)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameCompetition } from '@/composables/useGameCompetition'

const gc = useGameCompetition()
const newName = ref('')
const editingId = ref('')
const editName = ref('')

function gameCount(systemId) {
  return gc.games.value.filter((g) => g.systemId === systemId && !g.archive).length
}

function add() {
  const name = newName.value.trim()
  if (!name) return
  gc.saveConsoles([...gc.consoles.value, { systemId: crypto.randomUUID(), system: name }])
  newName.value = ''
}

function startEdit(c) {
  editingId.value = c.systemId
  editName.value = c.system
}

function saveEdit() {
  const updated = gc.consoles.value.map((c) =>
    c.systemId === editingId.value ? { ...c, system: editName.value.trim() } : c
  )
  gc.saveConsoles(updated)
  editingId.value = ''
}
</script>
