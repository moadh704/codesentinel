<template>
  <div class="max-w-4xl mx-auto px-8 py-10">
    <div class="mb-10">
      <h1 class="text-5xl font-heading font-semibold tracking-[-2px]">New Security Scan</h1>
      <p class="text-text-dim mt-3 text-lg">Analyze your code for vulnerabilities using AI</p>
    </div>

    <div class="card p-9">
      <form @submit.prevent="handleScan" class="space-y-8">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-text-dim mb-2">Title <span class="text-text-muted">(optional)</span></label>
          <input 
            v-model="title" 
            type="text" 
            class="input py-3.5 text-base" 
            placeholder="e.g. User authentication module review"
          />
        </div>

        <!-- Language & Provider -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-text-dim mb-2">Programming Language</label>
            <select v-model="language" class="input py-3.5 text-base" required>
              <option value="">Select language...</option>
              <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-dim mb-2">AI Provider</label>
            <select v-model="provider" class="input py-3.5 text-base" required>
              <option value="">Choose AI model...</option>
              <option value="claude">Claude (Anthropic) — Recommended</option>
              <option value="gpt4">GPT-4o (OpenAI)</option>
              <option value="gemini">Gemini 1.5 Pro (Google)</option>
            </select>
          </div>
        </div>

        <!-- Code Editor -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-text-dim">Source Code</label>
            <span class="text-xs text-text-muted">We never store your code</span>
          </div>
          <textarea 
            v-model="code" 
            class="input font-mono text-sm h-[420px] resize-y leading-relaxed p-6" 
            placeholder="Paste your source code here..."
            required
          ></textarea>
        </div>

        <!-- Submit -->
        <div class="pt-4">
          <button 
            type="submit" 
            class="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-70"
            :disabled="loading || !code || !language || !provider"
          >
            <span v-if="!loading">Analyze with AI</span>
            <span v-else class="flex items-center gap-3">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing with {{ getProviderName(provider) }}...
            </span>
          </button>
        </div>
      </form>
    </div>

    <p class="text-center text-xs text-text-muted mt-6">
      Your code is sent securely to the selected provider. Results are private to your account.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useScansStore } from '@/stores/scans';
import { useUiStore } from '@/stores/ui';

const router = useRouter();
const scansStore = useScansStore();
const uiStore = useUiStore();

const title = ref('');
const language = ref('');
const provider = ref('');
const code = ref('');
const loading = ref(false);

const languages = [
  'JavaScript', 'TypeScript', 'Python', 'PHP', 'Go', 'Java', 'Ruby', 'C/C++'
];

function getProviderName(p) {
  if (p === 'claude') return 'Claude';
  if (p === 'gpt4') return 'GPT-4o';
  if (p === 'gemini') return 'Gemini';
  return p;
}

async function handleScan() {
  if (!code.value || !language.value || !provider.value) return;

  loading.value = true;

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