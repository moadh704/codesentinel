<template>
  <div class="min-h-screen flex">
    <!-- Left Panel - Branding + Particles -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-[#0A0B0D] items-center justify-center overflow-hidden">
      <ParticleBackground />
      
      <div class="relative z-10 px-12 max-w-md">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span class="text-white font-bold text-xl">CS</span>
          </div>
          <span class="font-heading text-2xl font-semibold tracking-tight">CodeSentinel</span>
        </div>

        <h1 class="font-heading text-5xl font-semibold tracking-tighter leading-none mb-6">
          Secure code.<br>Confident releases.
        </h1>
        <p class="text-lg text-text-dim">
          AI-powered security reviews for modern teams.<br>
          Find vulnerabilities before they find you.
        </p>
      </div>
    </div>

    <!-- Right Panel - Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
      <div class="w-full max-w-md">
        <div class="lg:hidden mb-10 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span class="text-white font-bold">CS</span>
          </div>
          <span class="font-heading text-xl font-semibold">CodeSentinel</span>
        </div>

        <h2 class="font-heading text-3xl font-semibold tracking-tight mb-2">Welcome back</h2>
        <p class="text-text-dim mb-8">Sign in to continue to your dashboard</p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-text-dim mb-1.5">Email address</label>
            <input 
              v-model="email" 
              type="email" 
              class="input" 
              placeholder="you@company.com" 
              required 
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-dim mb-1.5">Password</label>
            <input 
              v-model="password" 
              type="password" 
              class="input" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-full mt-2" 
            :disabled="loading"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="text-center text-sm text-text-dim mt-8">
          Don't have an account?
          <router-link to="/register" class="text-primary hover:underline font-medium">Create one for free</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import ParticleBackground from '@/components/ParticleBackground.vue';

const email = ref('');
const password = ref('');
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

async function handleLogin() {
  if (!email.value || !password.value) return;

  loading.value = true;
  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });
    router.push('/');
  } catch (err) {
    const message = err.response?.data?.error || 'Login failed. Please try again.';
    alert(message);
  } finally {
    loading.value = false;
  }
}
</script>