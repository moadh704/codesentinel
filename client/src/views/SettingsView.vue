<template>
  <div class="p-8 max-w-3xl mx-auto">
    <h1 class="section-title mb-8">Settings</h1>

    <div class="space-y-10">
      <!-- Profile -->
      <div class="card">
        <h2 class="font-semibold mb-5">Profile</h2>

        <div class="space-y-6">
          <div>
            <label class="block text-sm text-text-dim mb-1.5">Name</label>
            <input v-model="name" class="input" />
          </div>

          <div>
            <label class="block text-sm text-text-dim mb-1.5">Email</label>
            <input :value="user?.email" class="input bg-card/50" disabled />
          </div>

          <button @click="updateProfile" class="btn btn-primary">Update Profile</button>
        </div>
      </div>

      <!-- API Keys -->
      <div class="card">
        <h2 class="font-semibold mb-2">AI Provider API Keys</h2>
        <p class="text-sm text-text-dim mb-5">
          Keys are saved in this browser and sent with each scan you run (authenticated).
          They are not written to the database. Server
          <code class="text-xs bg-white/5 px-1.5 py-0.5 rounded">.env</code>
          keys are used as a fallback if a field is empty.
        </p>

        <div class="space-y-5">
          <div>
            <label class="block text-sm text-text-dim mb-1.5">DeepSeek <span class="text-primary text-xs">(recommended)</span></label>
            <input
              v-model="apiKeys.deepseek"
              type="password"
              class="input"
              placeholder="sk-..."
              autocomplete="off"
            />
          </div>
          <div>
            <label class="block text-sm text-text-dim mb-1.5">Anthropic (Claude)</label>
            <input
              v-model="apiKeys.claude"
              type="password"
              class="input"
              placeholder="sk-ant-..."
              autocomplete="off"
            />
          </div>
          <div>
            <label class="block text-sm text-text-dim mb-1.5">OpenAI (GPT-4o)</label>
            <input
              v-model="apiKeys.gpt4"
              type="password"
              class="input"
              placeholder="sk-..."
              autocomplete="off"
            />
          </div>
          <div>
            <label class="block text-sm text-text-dim mb-1.5">Google (Gemini)</label>
            <input
              v-model="apiKeys.gemini"
              type="password"
              class="input"
              placeholder="AIza..."
              autocomplete="off"
            />
          </div>
          <div>
            <label class="block text-sm text-text-dim mb-1.5">Groq</label>
            <input
              v-model="apiKeys.groq"
              type="password"
              class="input"
              placeholder="gsk_..."
              autocomplete="off"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mt-5">
          <button @click="saveApiKeys" class="btn btn-primary">Save API Keys</button>
          <button type="button" @click="clearApiKeys" class="btn btn-ghost">Clear all</button>
        </div>
      </div>

      <!-- Appearance -->
      <div class="card">
        <h2 class="font-semibold mb-5">Appearance</h2>

        <div class="flex gap-4">
          <button
            v-for="t in ['dark', 'dim', 'light']"
            :key="t"
            @click="setTheme(t)"
            class="px-5 py-2 rounded-lg border transition-all flex-1"
            :class="uiStore.theme === t ? 'border-primary bg-primary/10' : 'border-white/10 hover:bg-card-hover'"
          >
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { loadApiKeys, saveApiKeys as persistApiKeys } from '@/lib/apiKeys';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();

const name = ref(authStore.user?.name || '');
const apiKeys = ref(loadApiKeys());

const user = computed(() => authStore.user);

function setTheme(theme) {
  uiStore.setTheme(theme);
}

async function updateProfile() {
  uiStore.addToast(
    'Profile name is set when you register. Full profile editing will come in a later update.',
    'info',
    { title: 'Not available yet' }
  );
}

function saveApiKeys() {
  persistApiKeys(apiKeys.value);
  apiKeys.value = loadApiKeys();
  uiStore.addToast(
    'Keys are used when you run a scan with the matching provider.',
    'success',
    { title: 'API keys saved' }
  );
}

async function clearApiKeys() {
  const ok = await uiStore.confirm({
    title: 'Clear all API keys?',
    message: 'This removes keys stored in this browser. Server .env keys are not affected.',
    confirmText: 'Clear keys',
    cancelText: 'Cancel',
    variant: 'danger',
  });
  if (!ok) return;
  persistApiKeys({
    deepseek: '',
    claude: '',
    gpt4: '',
    gemini: '',
    groq: '',
  });
  apiKeys.value = loadApiKeys();
  uiStore.addToast('Browser API keys cleared.', 'success', { title: 'Cleared' });
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }
});
</script>
