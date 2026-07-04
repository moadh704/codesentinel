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
        <h2 class="font-semibold mb-5">AI Provider API Keys</h2>
        <p class="text-sm text-text-dim mb-5">Keys are stored in browser (localStorage). Never shared.</p>

        <div class="space-y-5">
          <div>
            <label class="block text-sm text-text-dim mb-1.5">Anthropic (Claude)</label>
            <input v-model="apiKeys.claude" type="password" class="input" placeholder="sk-ant-..." />
          </div>
          <div>
            <label class="block text-sm text-text-dim mb-1.5">OpenAI (GPT-4)</label>
            <input v-model="apiKeys.openai" type="password" class="input" placeholder="sk-..." />
          </div>
          <div>
            <label class="block text-sm text-text-dim mb-1.5">Google (Gemini)</label>
            <input v-model="apiKeys.gemini" type="password" class="input" placeholder="AIza..." />
          </div>
        </div>

        <button @click="saveApiKeys" class="btn btn-primary mt-5">Save API Keys</button>
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
            :class="ui.theme === t ? 'border-primary bg-primary/10' : 'border-white/10 hover:bg-card-hover'"
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
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';

const authStore = useAuthStore();
const uiStore = useUiStore();

const name = ref(authStore.user?.name || '');
const apiKeys = ref({
  claude: localStorage.getItem('api_claude') || '',
  openai: localStorage.getItem('api_openai') || '',
  gemini: localStorage.getItem('api_gemini') || '',
});

const user = computed(() => authStore.user);

function setTheme(theme) {
  uiStore.setTheme(theme);
}

async function updateProfile() {
  // Placeholder - extend later
  alert('Profile update coming in future steps.');
}

function saveApiKeys() {
  localStorage.setItem('api_claude', apiKeys.value.claude);
  localStorage.setItem('api_openai', apiKeys.value.openai);
  localStorage.setItem('api_gemini', apiKeys.value.gemini);
  alert('API keys saved locally. They will be used by the frontend if configured.');
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }
});
</script>