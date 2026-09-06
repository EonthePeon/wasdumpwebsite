<template>
  <div class="modal-backdrop-custom" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">{{ title }}</h5>
        <button class="btn-close btn-close-white" @click="$emit('close')"></button>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({ title: String })
defineEmits(['close'])
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-box {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
}
</style>
