<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="section-title">Scan History</h1>
        <p class="text-text-dim mt-1">All your previous security scans</p>
      </div>
      <router-link to="/scan/new" class="btn btn-primary">New Scan</router-link>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search by title..." 
        class="input flex-1"
      />
      
      <select v-model="languageFilter" class="input w-full md:w-48">
        <option value="">All Languages</option>
        <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
      </select>

      <select v-model="providerFilter" class="input w-full md:w-48">
        <option value="">All Providers</option>
        <option value="claude">Claude</option>
        <option value="gpt4">GPT-4o</option>
        <option value="gemini">Gemini</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden p-0">
      <table class="w-full">
        <thead class="bg-card-hover border-b border-white/10">
          <tr>
            <th class="text-left px-6 py-4 text-sm font-medium text-text-dim">Title</th>
            <th class="text-left px-6 py-4 text-sm font-medium text-text-dim">Language</th>
            <th class="text-left px-6 py-4 text-sm font-medium text-text-dim">Provider</th>
            <th class="text-center px-6 py-4 text-sm font-medium text-text-dim">Issues</th>
            <th class="text-center px-6 py-4 text-sm font-medium text-text-dim">Critical</th>
            <th class="text-left px-6 py-4 text-sm font-medium text-text-dim">Date</th>
            <th class="text-right px-6 py-4 text-sm font-medium text-text-dim">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10">
          <tr 
            v-for="scan in filteredScans" 
            :key="scan.id"
            class="hover:bg-card-hover transition-colors cursor-pointer"
            @click="viewScan(scan.id)"
          >
            <td class="px-6 py-4 font-medium">{{ scan.title || 'Untitled Scan' }}</td>
            <td class="px-6 py-4 text-text-dim">{{ scan.language }}</td>
            <td class="px-6 py-4">
              <span class="badge bg-white/5 text-text-dim border-white/10">{{ scan.provider.toUpperCase() }}</span>
            </td>
            <td class="px-6 py-4 text-center font-mono">{{ scan.total_issues || 0 }}</td>
            <td class="px-6 py-4 text-center">
              <span v-if="scan.critical_count > 0" class="badge severity-critical">{{ scan.critical_count }}</span>
              <span v-else class="text-text-muted">—</span>
            </td>
            <td class="px-6 py-4 text-text-dim text-sm">{{ formatDate(scan.created_at) }}</td>
            <td class="px-6 py-4 text-right">
              <button 
                @click.stop="deleteScan(scan.id)"
                class="text-danger hover:text-danger/80 px-3 py-1 text-sm transition-colors"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredScans.length === 0" class="p-8 text-center text-text-dim">
        No scans found matching your filters.
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