<template>
  <div
    class="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none w-[min(100vw-2rem,22rem)]"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-xl backdrop-blur-sm text-sm"
        :class="panelClass(toast.type)"
        role="status"
      >
        <div
          class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          :class="iconWrapClass(toast.type)"
        >
          <component :is="iconFor(toast.type)" class="w-4 h-4 stroke-[2.25]" :size="16" />
        </div>

        <div class="flex-1 min-w-0 pt-0.5">
          <div v-if="toast.title" class="font-medium text-text-primary mb-0.5">
            {{ toast.title }}
          </div>
          <div class="text-text-dim leading-snug break-words">
            {{ toast.message }}
          </div>
        </div>

        <button
          type="button"
          class="flex-shrink-0 p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          aria-label="Dismiss"
          @click="removeToast(toast.id)"
        >
          <X class="w-4 h-4" :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUiStore } from '@/stores/ui';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

const uiStore = useUiStore();
const toasts = computed(() => uiStore.toasts);

function iconFor(type) {
  if (type === 'success') return CheckCircle2;
  if (type === 'error') return XCircle;
  if (type === 'warning') return AlertTriangle;
  return Info;
}

function panelClass(type) {
  switch (type) {
    case 'success':
      return 'bg-card/95 border-success/30';
    case 'error':
      return 'bg-card/95 border-danger/30';
    case 'warning':
      return 'bg-card/95 border-warning/30';
    default:
      return 'bg-card/95 border-white/10';
  }
}

function iconWrapClass(type) {
  switch (type) {
    case 'success':
      return 'bg-success/15 text-success';
    case 'error':
      return 'bg-danger/15 text-danger';
    case 'warning':
      return 'bg-warning/15 text-warning';
    default:
      return 'bg-primary/15 text-primary';
  }
}

function removeToast(id) {
  uiStore.removeToast(id);
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px) scale(0.96);
}
.toast-move {
  transition: transform 0.28s ease;
}
</style>
