<template>
  <div class="min-h-screen bg-background text-text-primary">
    <Layout v-if="isAuthenticated">
      <router-view />
    </Layout>
    <router-view v-else />
    <Toast />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Layout from '@/components/Layout.vue';
import Toast from '@/components/Toast.vue';

const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>