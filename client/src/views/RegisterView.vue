<template>
  <div class="min-h-screen flex">
    <!-- Left Panel -->
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
          Start shipping<br>secure code today.
        </h1>
        <p class="text-lg text-text-dim">
          Join developers who catch vulnerabilities before they reach production.
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

        <h2 class="font-heading text-3xl font-semibold tracking-tight mb-2">Create your account</h2>
        <p class="text-text-dim mb-8">Get started with CodeSentinel for free</p>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-text-dim mb-1.5">Full name</label>
            <input v-model="name" type="text" class="input" placeholder="Alex Rivera" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-dim mb-1.5">Work email</label>
            <input v-model="email" type="email" class="input" placeholder="you@company.com" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-dim mb-1.5">Password</label>
            <input 
              v-model="password" 
              type="password" 
              class="input" 
              placeholder="Create a strong password" 
              required 
              minlength="8"
            />
            <PasswordStrength :password="password" />
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-full mt-2" 
            :disabled="loading || password.length < 8"
          >
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <p class="text-center text-sm text-text-dim mt-8">
          Already have an account?
          <router-link to="/login" class="text-primary hover:underline font-medium">Sign in</router-link>
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
import PasswordStrength from '@/components/PasswordStrength.vue';

const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

async function handleRegister() {
  if (!name.value || !email.value || password.value.length < 8) return;

  loading.value = true;
  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    router.push('/');
  } catch (err) {
    const message = err.response?.data?.error || 'Registration failed';
    alert(message);
  } finally {
    loading.value = false;
  }
}
</script>