<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- Sidebar -->
    <div 
      :class="['border-r border-white/10 bg-card transition-all duration-300', 
               sidebarCollapsed ? 'w-16' : 'w-64']"
    >
      <div class="h-full flex flex-col">
        <!-- Logo -->
        <div class="p-5 flex items-center gap-3 border-b border-white/10">
          <img 
            src="/codesentinel-logo.svg" 
            alt="CodeSentinel" 
            class="w-8 h-8 flex-shrink-0"
          />
          <span v-if="!sidebarCollapsed" class="font-heading font-semibold tracking-tight">CodeSentinel</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <router-link 
            v-for="item in navItems" 
            :key="item.to" 
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-card-hover text-sm transition-colors"
            :class="{ 'bg-card-hover text-primary': isActive(item.to) }"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span v-if="!sidebarCollapsed">{{ item.label }}</span>
          </router-link>
        </nav>

        <!-- Bottom -->
        <div class="p-4 border-t border-white/10">
          <button @click="toggleSidebar" class="flex items-center gap-3 px-4 py-2 w-full text-sm text-text-dim hover:text-text-primary transition-colors">
            <span class="w-5 h-5">☰</span>
            <span v-if="!sidebarCollapsed">Collapse</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="h-14 border-b border-white/10 flex items-center px-6 bg-card z-10 flex-shrink-0">
        <div class="flex-1 flex items-center gap-4">
          <button @click="toggleSidebar" class="lg:hidden text-xl">☰</button>
          <div class="text-sm text-text-dim">AI Security Code Reviewer</div>
        </div>

        <div class="flex items-center gap-4">
          <router-link to="/settings" class="text-sm hover:text-primary">Settings</router-link>
          <button @click="logout" class="text-sm text-danger hover:text-danger/80">Logout</button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { Home, Plus, History, Settings, LogOut } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUiStore();

const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed);

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/scan/new', label: 'New Scan', icon: Plus },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function isActive(to) {
  return route.path === to || (to === '/' && route.path.startsWith('/scan/'));
}

function toggleSidebar() {
  uiStore.toggleSidebar();
}

async function logout() {
  authStore.logout();
  router.push('/login');
}
</script>