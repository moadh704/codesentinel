<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div
        v-if="dialog.open"
        class="fixed inset-0 z-[70] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        @keydown.esc.prevent="onCancel"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
          @click="onCancel"
        />

        <!-- Panel -->
        <div
          class="relative w-full max-w-md rounded-2xl border border-white/10 bg-card shadow-2xl overflow-hidden"
        >
          <div class="px-6 pt-6 pb-2 flex items-start gap-4">
            <div
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
              :class="
                dialog.variant === 'danger'
                  ? 'bg-danger/15 text-danger'
                  : 'bg-primary/15 text-primary'
              "
            >
              <AlertTriangle
                v-if="dialog.variant === 'danger'"
                class="w-5 h-5 stroke-[2]"
                :size="20"
              />
              <HelpCircle v-else class="w-5 h-5 stroke-[2]" :size="20" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-heading text-lg font-semibold tracking-tight text-text-primary">
                {{ dialog.title }}
              </h3>
              <p class="mt-2 text-sm text-text-dim leading-relaxed">
                {{ dialog.message }}
              </p>
            </div>
          </div>

          <div class="px-6 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              class="btn btn-ghost w-full sm:w-auto"
              :disabled="dialog.loading"
              @click="onCancel"
            >
              {{ dialog.cancelText }}
            </button>
            <button
              type="button"
              class="btn w-full sm:w-auto"
              :class="dialog.variant === 'danger' ? 'btn-danger' : 'btn-primary'"
              :disabled="dialog.loading"
              @click="onConfirm"
            >
              <span v-if="dialog.loading" class="inline-flex items-center gap-2">
                <span
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
                Working…
              </span>
              <span v-else>{{ dialog.confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onUnmounted } from 'vue';
import { useUiStore } from '@/stores/ui';
import { AlertTriangle, HelpCircle } from 'lucide-vue-next';

const uiStore = useUiStore();
const dialog = computed(() => uiStore.confirmDialog);

function onCancel() {
  if (dialog.value.loading) return;
  uiStore.resolveConfirm(false);
}

function onConfirm() {
  if (dialog.value.loading) return;
  uiStore.resolveConfirm(true);
}

// Lock body scroll while open
watch(
  () => dialog.value.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : '';
  }
);

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.2s ease;
}
.confirm-enter-active .relative,
.confirm-leave-active .relative {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}
.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
.confirm-enter-from .relative,
.confirm-leave-to .relative {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
