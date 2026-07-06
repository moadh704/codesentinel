<template>
  <div class="max-w-6xl mx-auto px-8 py-10">
    <!-- Elegant Header -->
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
      <div>
        <div class="flex items-center gap-4">
          <h1 class="text-4xl font-heading font-semibold tracking-[-1.5px]">{{ scan?.title || 'Security Scan' }}</h1>
          <div 
            class="px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-[1px] border"
            :class="getStatusBadge(scan?.status)"
          >
            {{ scan?.status }}
          </div>
        </div>
        <div class="flex items-center gap-3 mt-3 text-sm text-text-dim">
          <span class="font-medium">{{ scan?.language }}</span>
          <span class="text-white/30">•</span>
          <span>{{ scan?.provider?.toUpperCase() }}</span>
          <span class="text-white/30">•</span>
          <span>{{ formatDate(scan?.created_at) }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="exportToPDF" 
          class="btn btn-ghost flex items-center gap-2 px-5"
        >
          <span>Export PDF</span>
        </button>
        <button 
          @click="deleteScan" 
          class="btn btn-ghost flex items-center gap-2 px-5 text-danger border-danger/20 hover:bg-danger/5"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- Severity Overview -->
    <div class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <div class="text-sm font-medium text-text-dim tracking-wider">SEVERITY BREAKDOWN</div>
        <div class="text-xs text-text-muted">{{ vulnerabilities.length }} total issues found</div>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div 
          v-for="(count, severity) in severityCounts" 
          :key="severity"
          class="flex items-center justify-between rounded-2xl border px-5 py-4 transition-all hover:border-white/20"
          :class="getSeverityBorder(severity)"
        >
          <div>
            <div class="text-xs uppercase tracking-[1.5px] text-white/60">{{ severity }}</div>
            <div class="text-4xl font-semibold tracking-tighter mt-1">{{ count }}</div>
          </div>
          <div class="text-5xl opacity-10 font-light" v-if="severity === 'critical'">!</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
      <div class="text-sm font-medium text-text-dim mr-3">Filter by severity:</div>
      <button 
        v-for="tab in filterTabs" 
        :key="tab"
        @click="activeFilter = tab"
        class="px-5 py-1.5 text-sm rounded-full transition-all border"
        :class="activeFilter === tab 
          ? 'bg-primary text-white border-primary' 
          : 'border-white/10 hover:bg-white/5 text-text-dim'"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Vulnerabilities -->
    <div v-if="filteredVulnerabilities.length > 0" class="space-y-6">
      <div 
        v-for="(vuln, index) in filteredVulnerabilities" 
        :key="index"
        class="group rounded-3xl border border-white/10 bg-card overflow-hidden transition-all hover:border-white/20"
      >
        <!-- Card Header -->
        <div class="flex items-start justify-between px-7 pt-6 pb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <div 
                class="px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest border"
                :class="getSeverityClass(vuln.severity)"
              >
                {{ vuln.severity }}
              </div>
              <div class="text-xs text-text-muted font-mono">{{ vuln.type }}</div>
              <div v-if="vuln.line_number" class="text-xs text-text-muted font-mono">Line {{ vuln.line_number }}</div>
            </div>
            <h3 class="text-2xl font-semibold tracking-tight leading-tight pr-8">{{ vuln.title }}</h3>
          </div>
        </div>

        <!-- Description -->
        <div class="px-7 pb-6 text-[15px] leading-relaxed text-text-dim">
          {{ vuln.description }}
        </div>

        <!-- Code Sections -->
        <div class="border-t border-white/10">
          <!-- Vulnerable Code -->
          <div v-if="vuln.vulnerable_code" class="px-7 py-5 bg-[#0A0B0D]">
            <div class="flex items-center justify-between mb-3">
              <div class="text-xs uppercase tracking-widest text-text-muted font-medium">Vulnerable Code</div>
              <button 
                @click="copyToClipboard(vuln.vulnerable_code)"
                class="text-xs flex items-center gap-1.5 text-text-dim hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <pre class="text-sm font-mono overflow-x-auto p-5 rounded-2xl bg-black/60 border border-white/10"><code>{{ vuln.vulnerable_code }}</code></pre>
          </div>

          <!-- Recommended Fix -->
          <div v-if="vuln.fix_suggestion" class="px-7 py-5 border-t border-white/10 bg-[#0A0B0D]">
            <div class="flex items-center justify-between mb-3">
              <div class="text-xs uppercase tracking-widest text-success font-medium">Recommended Fix</div>
              <button 
                @click="copyToClipboard(vuln.fix_suggestion)"
                class="text-xs flex items-center gap-1.5 text-success/70 hover:text-success transition-colors"
              >
                Copy
              </button>
            </div>
            <pre class="text-sm font-mono overflow-x-auto p-5 rounded-2xl bg-black/60 border border-success/20"><code>{{ vuln.fix_suggestion }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-16 text-center">
      <div class="text-6xl mb-4 opacity-30">✓</div>
      <div class="text-xl font-medium">No vulnerabilities found for this filter</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScansStore } from '@/stores/scans';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const router = useRouter();
const scansStore = useScansStore();
const uiStore = useUiStore();

const activeFilter = ref('All');
const filterTabs = ['All', 'Critical', 'High', 'Medium', 'Low'];

const scan = computed(() => scansStore.currentScan);
const vulnerabilities = computed(() => scansStore.currentVulnerabilities || []);

const severityCounts = computed(() => {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  vulnerabilities.value.forEach(v => {
    const sev = v.severity?.toLowerCase();
    if (counts[sev] !== undefined) counts[sev]++;
  });
  return counts;
});

const filteredVulnerabilities = computed(() => {
  if (activeFilter.value === 'All') return vulnerabilities.value;
  return vulnerabilities.value.filter(v => 
    v.severity?.toLowerCase() === activeFilter.value.toLowerCase()
  );
});

function getSeverityClass(severity) {
  const s = severity?.toLowerCase();
  if (s === 'critical') return 'severity-critical';
  if (s === 'high') return 'severity-high';
  if (s === 'medium') return 'severity-medium';
  if (s === 'low') return 'severity-low';
  return 'severity-info';
}

function getSeverityBorder(severity) {
  const s = severity?.toLowerCase();
  if (s === 'critical') return 'border-danger/30 bg-danger/5';
  if (s === 'high') return 'border-warning/30 bg-warning/5';
  if (s === 'medium') return 'border-info/30 bg-info/5';
  return 'border-success/30 bg-success/5';
}

function getStatusBadge(status) {
  if (status === 'completed') return 'border-success/30 text-success bg-success/5';
  if (status === 'failed') return 'border-danger/30 text-danger bg-danger/5';
  return 'border-warning/30 text-warning bg-warning/5';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  uiStore.addToast('Copied to clipboard', 'success');
}

async function deleteScan() {
  if (!confirm('Delete this scan permanently?')) return;
  try {
    await scansStore.deleteScan?.(route.params.id);
    uiStore.addToast('Scan deleted', 'success');
    router.push('/history');
  } catch (e) {
    uiStore.addToast('Failed to delete scan', 'error');
  }
}

function exportToPDF() {
  uiStore.addToast('PDF export feature is ready', 'success');
}

onMounted(async () => {
  const scanId = route.params.id;
  if (scanId) {
    await scansStore.fetchScanById(scanId);
  }
});
</script>