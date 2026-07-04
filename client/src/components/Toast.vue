<template>
  <div 
    v-if="toasts.length > 0"
    class="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
  >
    <div 
      v-for="toast in toasts" 
      :key="toast.id"
      class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm max-w-sm"
      :class="getToastClasses(toast.type)"
    >
      <div class="flex-1">
        {{ toast.message }}
      </div>
      <button 
        @click="removeToast(toast.id)"
        class="text-text-dim hover:text-text-primary transition-colors"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/ui';
import { computed } from 'vue';

const uiStore = useUiStore();
const toasts = computed(() => uiStore.toasts);

function getToastClasses(type) {
  switch (type) {
    case 'success':
      return 'bg-success/10 border-success/30 text-success';
    case 'error':
      return 'bg-danger/10 border-danger/30 text-danger';
    case 'warning':
      return 'bg-warning/10 border-warning/30 text-warning';
    default:
      return 'bg-card border-white/10 text-text-primary';
  }
}

function removeToast(id) {
  uiStore.toasts = uiStore.toasts.filter(t => t.id !== id);
}
</script>