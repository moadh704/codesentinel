<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="section-title">New Security Scan</h1>
      <p class="text-text-dim mt-1">Analyze your code for vulnerabilities using AI</p>
    </div>

    <div class="card max-w-4xl">
      <form @submit.prevent="handleScan" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-text-dim mb-1.5">Title (optional)</label>
          <input 
            v-model="title" 
            type="text" 
            class="input" 
            placeholder="e.g. User authentication module"
          />
        </div>

        <!-- Language & Provider Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Language -->
          <div>
            <label class="block text-sm font-medium text-text-dim mb-1.5">Language</label>
            <select v-model="language" class="input" required>
              <option value="">Select language...</option>
              <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
            </select>
          </div>

          <!-- Provider -->
          <div>
            <label class="block text-sm font-medium text-text-dim mb-1.5">AI Provider</label>
            <select v-model="provider" class="input" required>
              <option value="">Select provider...</option>
              <option value="claude">Claude (Anthropic)</option>
              <option value="gpt4">GPT-4o (OpenAI)</option>
              <option value="groq">Groq (Llama 3.3 - Free & Fast)</option>
              <option value="gemini">Gemini 1.5 Pro (Google)</option>
            </select>
          </div>
        </div>

        <!-- Code Editor -->
        <div>
          <label class="block text-sm font-medium text-text-dim mb-1.5">Source Code</label>
          <textarea 
            v-model="code" 
            class="input font-mono text-sm h-[380px] resize-y min-h-[280px] leading-relaxed" 
            placeholder="Paste your code here..."
            required
          ></textarea>
          <p class="text-xs text-text-muted mt-1.5">We never store or share your code outside of this scan.</p>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button 
            type="submit" 
            class="btn btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            :disabled="loading || !code || !language || !provider"
          >
            <span v-if="!loading">Scan with AI</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing with {{ getProviderName(provider) }}...
            </span>
          </button>
        </div>
      </form>
    </div>

    <!-- Info -->
    <div class="mt-6 text-xs text-text-muted max-w-2xl">
      Your code is sent securely to the selected AI provider for analysis. Results are stored only in your account.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useScansStore } from '@/stores/scans';
import { useUiStore } from '@/stores/ui';

const router = useRouter();
const scansStore = useScansStore();

const title = ref('');
const language = ref('');
const provider = ref('');
const code = ref('');
const loading = ref(false);

const languages = [
  'JavaScript', 
  'TypeScript', 
  'Python', 
  'PHP', 
  'Go', 
  'Java', 
  'Ruby', 
  'C/C++'
];

function getProviderName(p) {
  if (p === 'claude') return 'Claude';
  if (p === 'gpt4') return 'GPT-4o';
  if (p === 'groq') return 'Groq (Llama)';
  if (p === 'gemini') return 'Gemini';
  return p;
}

async function handleScan() {
  if (!code.value || !language.value || !provider.value) return;

  loading.value = true;
  const uiStore = useUiStore();

  try {
    const result = await scansStore.createScan({
      title: title.value || null,
      language: language.value,
      provider: provider.value,
      code: code.value,
    });

    uiStore.addToast('Scan completed successfully!', 'success');
    router.push(`/scan/${result.scan.id}`);
  } catch (err) {
    const message = err.response?.data?.error || 'Scan failed. Please try again.';
    uiStore.addToast(message, 'error');
  } finally {
    loading.value = false;
  }
}
</script>