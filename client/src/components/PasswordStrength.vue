<template>
  <div class="mt-1.5">
    <div class="flex gap-1 mb-1">
      <div 
        v-for="i in 4" 
        :key="i"
        class="h-1 flex-1 rounded-full transition-all"
        :class="getStrengthColor(i)"
      />
    </div>
    <p class="text-xs" :class="getTextColor()">
      {{ getStrengthText() }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  password: {
    type: String,
    default: '',
  },
});

const strength = computed(() => {
  const pwd = props.password;
  if (!pwd) return 0;

  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  return Math.min(Math.floor(score / 1.5), 4);
});

function getStrengthColor(level) {
  if (strength.value >= level) {
    if (strength.value <= 1) return 'bg-danger';
    if (strength.value === 2) return 'bg-warning';
    return 'bg-success';
  }
  return 'bg-white/10';
}

function getStrengthText() {
  if (!props.password) return 'Enter a password';
  if (strength.value <= 1) return 'Weak';
  if (strength.value === 2) return 'Fair';
  if (strength.value === 3) return 'Good';
  return 'Strong';
}

function getTextColor() {
  if (strength.value <= 1) return 'text-danger';
  if (strength.value === 2) return 'text-warning';
  return 'text-success';
}
</script>