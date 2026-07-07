<template>
  <div class="max-w-7xl mx-auto px-8 py-10">
    <!-- Header -->
    <div class="flex items-end justify-between mb-10">
      <div>
        <h1 class="text-5xl font-heading font-semibold tracking-[-2px]">History</h1>
        <p class="text-text-dim mt-2 text-lg">All your previous security scans</p>
      </div>
      <router-link to="/scan/new" class="btn btn-primary px-8 py-3">New Scan</router-link>
    </div>

    <!-- Filters -->
    <div class="flex flex-col lg:flex-row gap-4 mb-8">
      <div class="flex-1">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search scans by title..." 
          class="input w-full py-3 text-base"
        />
      </div>
      
      <div class="flex gap-3">
        <select v-model="languageFilter" class="input py-3 w-48">
          <option value="">All Languages</option>
          <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
        </select>

        <select v-model="providerFilter" class="input py-3 w-48">
          <option value="">All Providers</option>
          <option value="claude">Claude</option>
          <option value="gpt4">GPT-4o</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden p-0 border border-white/10">
      <table class="w-full">
        <thead>
          <tr class="border-b border-white/10 bg-card-hover">
            <th class="text-left px-8 py-5 text-sm font-medium text-text-dim">Title</th>
            <th class="text-left px-8 py-5 text-sm font-medium text-text-dim">Language</th>
            <th class="text-left px-8 py-5 text-sm font-medium text-text-dim">Provider</th>
            <th class="text-center px-8 py-5 text-sm font-medium text-text-dim">Issues</th>
            <th class="text-center px-8 py-5 text-sm font-medium text-text-dim">Critical</th>
            <th class="text-left px-8 py-5 text-sm font-medium text-text-dim">Date</th>
            <th class="w-24"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10 text-sm">
          <tr 
            v-for="scan in filteredScans" 
            :key="scan.id"
            @click="viewScan(scan.id)"
            class="group hover:bg-card-hover transition-colors cursor-pointer"
          >
            <td class="px-8 py-5 font-medium">{{ scan.title || 'Untitled Scan' }}</td>
            <td class="px-8 py-5 text-text-dim">{{ scan.language }}</td>
            <td class="px-8 py-5">
              <span class="inline-block px-3 py-0.5 rounded-full text-xs font-mono bg-white/5 border border-white/10">
                {{ scan.provider.toUpperCase() }}
              </span>
            </td>
            <td class="px-8 py-5 text-center font-mono text-text-dim">{{ scan.total_issues || 0 }}</td>
            <td class="px-8 py-5 text-center">
              <span v-if="scan.critical_count > 0" class="badge severity-critical text-xs px-2.5 py-0.5">
                {{ scan.critical_count }}
              </span>
              <span v-else class="text-text-muted">—</span>
            </td>
            <td class="px-8 py-5 text-text-dim">{{ formatDate(scan.created_at) }}</td>
            <td class="px-8 py-5 text-right">
              <button 
                @click.stop="deleteScan(scan.id)"
                class="opacity-0 group-hover:opacity-100 text-danger hover:text-white px-4 py-1.5 text-xs transition-all rounded-lg hover:bg-danger/10"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredScans.length === 0" class="py-16 text-center">
        <div class="text-6xl mb-4 opacity-20">📭</div>
        <div class="text-xl font-medium mb-2">No scans found</div>
        <p class="text-text-dim">Try adjusting your filters or create your first scan.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScansStore } from '@/stores/scans';
import { useUiStore } from '@/stores/ui';

const router = useRouter();
const scansStore = useScansStore();
const uiStore = useUiStore();

const searchQuery = ref('');
const languageFilter = ref('');
const providerFilter = ref('');

const languages = ['JavaScript', 'TypeScript', 'Python', 'PHP', 'Go', 'Java', 'Ruby', 'C/C++'];

const filteredScans = computed(() => {
  return scansStore.scans.filter(scan => {
    const matchesSearch = !searchQuery.value || 
      (scan.title || '').toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesLanguage = !languageFilter.value || scan.language === languageFilter.value;
    const matchesProvider = !providerFilter.value || scan.provider === providerFilter.value;
    return matchesSearch && matchesLanguage && matchesProvider;
  });
});

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });
}

function viewScan(id) {
  router.push(`/scan/${id}`);
}

async function deleteScan(id) {
  if (!confirm('Delete this scan permanently?')) return;
  try {
    await scansStore.deleteScan(id);
    uiStore.addToast('Scan deleted successfully', 'success');
    await scansStore.fetchScans();
  } catch (err) {
    uiStore.addToast('Failed to delete scan', 'error');
  }
}

onMounted(async () => {
  await scansStore.fetchScans();
});
</script>