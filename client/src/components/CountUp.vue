<template>
  <span>{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  end: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    default: 1200,
  },
});

const displayValue = ref(0);

function animateCount() {
  const start = 0;
  const end = props.end;
  const duration = props.duration;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    displayValue.value = Math.floor(start + (end - start) * ease);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      displayValue.value = end;
    }
  }

  requestAnimationFrame(update);
}

watch(() => props.end, () => {
  displayValue.value = 0;
  animateCount();
});

onMounted(() => {
  if (props.end > 0) {
    animateCount();
  }
});
</script>