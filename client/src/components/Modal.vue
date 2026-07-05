<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click="handleBackdropClick"
      >
        <div 
          class="bg-card border border-white/10 rounded-lg w-full max-w-md shadow-xl"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 class="font-semibold text-lg">{{ title }}</h3>
            <button 
              @click="$emit('update:modelValue', false)"
              class="text-text-dim hover:text-text-primary transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 text-text-dim">
            <slot />
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
            <button 
              @click="$emit('update:modelValue', false)"
              class="btn btn-ghost"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="handleConfirm"
              class="btn"
              :class="confirmClass"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: 'Confirm Action',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  confirmClass: {
    type: String,
    default: 'btn-primary',
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

function handleConfirm() {
  emit('confirm');
  emit('update:modelValue', false);
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    emit('update:modelValue', false);
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-card,
.modal-leave-active .bg-card {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-card,
.modal-leave-to .bg-card {
  transform: scale(0.95);
}
</style>