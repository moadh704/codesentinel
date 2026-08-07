<template>
  <div class="min-h-screen bg-background text-text-primary font-body">
    <Layout v-if="isAuthenticated">
      <router-view />
    </Layout>
    <router-view v-else />
    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Layout from '@/components/Layout.vue';
import Toast from '@/components/Toast.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

onMounted(() => {
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
});
</script>