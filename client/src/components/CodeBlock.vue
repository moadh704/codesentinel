<template>
  <div class="relative group">
    <pre 
      class="bg-[#0A0B0D] border border-white/10 p-4 rounded-lg overflow-x-auto text-sm font-mono"
      v-html="highlightedCode"
    ></pre>
    
    <!-- Copy Button -->
    <button 
      @click="copyToClipboard"
      class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity 
             px-2.5 py-1 text-xs bg-card border border-white/10 rounded hover:bg-card-hover"
    >
      {{ copied ? 'Copied!' : 'Copy' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { codeToHtml } from 'shiki';

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'javascript',
  },
});

const highlightedCode = ref('');
const copied = ref(false);

const languageMap = {
  'javascript': 'js',
  'typescript': 'ts',
  'python': 'python',
  'php': 'php',
  'go': 'go',
  'java': 'java',
  'ruby': 'ruby',
  'c++': 'cpp',
  'c': 'c',
};

async function highlight() {
  if (!props.code) {
    highlightedCode.value = '';
    return;
  }

  try {
    const lang = languageMap[props.language.toLowerCase()] || 'javascript';
    
    const html = await codeToHtml(props.code, {
      lang,
      theme: 'github-dark',
    });
    
    highlightedCode.value = html;
  } catch (error) {
    console.error('Shiki highlighting failed:', error);
    // Fallback to plain text
    highlightedCode.value = `<code>${props.code}</code>`;
  }
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

onMounted(() => {
  highlight();
});

watch(() => [props.code, props.language], () => {
  highlight();
});
</script>