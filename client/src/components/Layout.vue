<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- Sidebar -->
    <div
      :class="[
        'border-r border-white/10 bg-card transition-all duration-300 flex-shrink-0',
        sidebarCollapsed ? 'w-[4.5rem]' : 'w-64',
      ]"
    >
      <div class="h-full flex flex-col">
        <!-- Logo -->
        <div
          :class="[
            'flex items-center border-b border-white/10 min-h-[4.25rem]',
            sidebarCollapsed ? 'justify-center px-2 py-4' : 'gap-3 px-5 py-5',
          ]"
        >
          <img
            src="/codesentinel-logo.svg"
            alt="CodeSentinel"
            class="w-10 h-10 flex-shrink-0"
          />
          <span
            v-if="!sidebarCollapsed"
            class="font-heading font-semibold tracking-tight text-base"
          >
            CodeSentinel
          </span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-2 space-y-1 overflow-y-auto">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :title="item.label"
            :class="[
              'flex items-center rounded-lg text-sm transition-colors',
              sidebarCollapsed
                ? 'justify-center px-0 py-3.5'
                : 'gap-3.5 px-4 py-3.5',
              isActive(item.to)
                ? 'bg-card-hover text-primary'
                : 'text-text-dim hover:bg-card-hover hover:text-text-primary',
            ]"
          >
            <component
              :is="item.icon"
              class="w-6 h-6 flex-shrink-0 stroke-[2]"
              :size="24"
            />
            <span v-if="!sidebarCollapsed" class="font-medium">{{ item.label }}</span>
          </router-link>
        </nav>

        <!-- Bottom -->
        <div class="p-2 border-t border-white/10 space-y-1">
          <button
            type="button"
            @click="logout"
            title="Logout"
            :class="[
              'flex items-center w-full rounded-lg text-sm text-text-dim hover:text-danger hover:bg-card-hover transition-colors',
              sidebarCollapsed ? 'justify-center px-0 py-3.5' : 'gap-3.5 px-4 py-3',
            ]"
          >
            <LogOut class="w-6 h-6 flex-shrink-0 stroke-[2]" :size="24" />
            <span v-if="!sidebarCollapsed">Logout</span>
          </button>
          <button
            type="button"
            @click="toggleSidebar"
            :title="sidebarCollapsed ? 'Expand' : 'Collapse'"
            :class="[
              'flex items-center w-full rounded-lg text-sm text-text-dim hover:text-text-primary hover:bg-card-hover transition-colors',
              sidebarCollapsed ? 'justify-center px-0 py-3.5' : 'gap-3.5 px-4 py-3',
            ]"
          >
            <PanelLeftClose
              v-if="!sidebarCollapsed"
              class="w-6 h-6 flex-shrink-0 stroke-[2]"
              :size="24"
            />
            <PanelLeftOpen
              v-else
              class="w-6 h-6 flex-shrink-0 stroke-[2]"
              :size="24"
            />
            <span v-if="!sidebarCollapsed">Collapse</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- Top bar -->
      <header class="h-14 border-b border-white/10 flex items-center px-6 bg-card z-10 flex-shrink-0">
        <div class="flex-1 flex items-center gap-4">
          <button
            type="button"
            @click="toggleSidebar"
            class="lg:hidden p-2 rounded-lg hover:bg-card-hover text-text-dim"
            title="Toggle menu"
          >
            <Menu class="w-6 h-6 stroke-[2]" :size="24" />
          </button>
          <div class="text-sm text-text-dim">AI Security Code Reviewer</div>
        </div>

        <div class="flex items-center gap-4">
          <router-link to="/settings" class="text-sm hover:text-primary">Settings</router-link>
          <button type="button" @click="logout" class="text-sm text-danger hover:opacity-80">
            Logout
          </button>
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
import {
  Home,
  Plus,
  History,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from 'lucide-vue-next';

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
  if (to === '/') {
    return route.path === '/' || route.path.startsWith('/scan/');
  }
  return route.path === to || route.path.startsWith(to + '/');
}

function toggleSidebar() {
  uiStore.toggleSidebar();
}

async function logout() {
  authStore.logout();
  router.push('/login');
}
</script>