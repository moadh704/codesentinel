<template>
  <div 
    class="animate-pulse bg-white/5 rounded"
    :class="{
      'h-4 w-full': variant === 'text',
      'h-8 w-24': variant === 'title',
      'h-20 w-full': variant === 'card',
      'h-10 w-full': variant === 'input',
    }"
  ></div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'text', // text | title | card | input
  },
});
</script>