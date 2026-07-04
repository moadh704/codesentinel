<template>
  <div class="max-w-5xl mx-auto p-8">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="section-title">{{ scan?.title || 'Scan Results' }}</h1>
          <span class="badge" :class="getStatusBadge(scan?.status)">{{ scan?.status }}</span>
        </div>
        <div class="flex items-center gap-4 text-sm text-text-dim mt-1">
          <span>{{ scan?.language }}</span>
          <span>•</span>
          <span class="capitalize">{{ scan?.provider }}</span>
          <span>•</span>
          <span>{{ formatDate(scan?.created_at) }}</span>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="exportToPDF" class="btn btn-ghost flex items-center gap-2">
          Export PDF
        </button>
        <button @click="deleteScan" class="btn btn-ghost text-danger border-danger/30 hover:bg-danger/10 flex items-center gap-2">
          Delete Scan
        </button>
      </div>
    </div>

    <!-- Severity Summary -->
    <div class="flex flex-wrap gap-3 mb-8">
      <div 
        v-for="(count, severity) in severityCounts" 
        :key="severity"
        class="px-4 py-2 rounded-lg border text-sm flex items-center gap-2"
        :class="getSeverityBorder(severity)"
      >
        <span class="font-mono text-xs uppercase tracking-wider">{{ severity }}</span>
        <span class="font-semibold text-lg">{{ count }}</span>
      </div>
      <div class="px-4 py-2 rounded-lg border border-white/10 text-sm flex items-center gap-2">
        <span class="font-mono text-xs uppercase tracking-wider">Total</span>
        <span class="font-semibold text-lg">{{ vulnerabilities.length }}</span>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-1 mb-6 border-b border-white/10">
      <button 
        v-for="tab in filterTabs" 
        :key="tab"
        @click="activeFilter = tab"
        class="px-5 py-2 text-sm font-medium border-b-2 transition-all"
        :class="activeFilter === tab 
          ? 'border-primary text-primary' 
          : 'border-transparent text-text-dim hover:text-text-primary'"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Vulnerabilities -->
    <div v-if="filteredVulnerabilities.length > 0" class="space-y-5">
      <div 
        v-for="(vuln, index) in filteredVulnerabilities" 
        :key="index"
        class="card border-l-4"
        :class="getSeverityBorderLeft(vuln.severity)"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <span class="badge" :class="getSeverityClass(vuln.severity)">{{ vuln.severity }}</span>
              <span class="badge bg-white/5 text-text-dim border-white/10">{{ vuln.type }}</span>
              <span v-if="vuln.line_number" class="text-xs text-text-muted font-mono">Line {{ vuln.line_number }}</span>
            </div>
            <h3 class="font-semibold text-lg tracking-tight">{{ vuln.title }}</h3>
          </div>
        </div>

        <!-- Description -->
        <p class="text-text-dim mb-5 leading-relaxed">{{ vuln.description }}</p>

        <!-- Vulnerable Code -->
        <div v-if="vuln.vulnerable_code" class="mb-4">
          <div class="text-xs uppercase tracking-wider text-text-muted mb-1.5 font-medium">Vulnerable Code</div>
          <pre class="bg-[#0A0B0D] border border-white/10 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ vuln.vulnerable_code }}</code></pre>
        </div>

        <!-- Fix Suggestion -->
        <div v-if="vuln.fix_suggestion">
          <div class="text-xs uppercase tracking-wider text-success mb-1.5 font-medium">Recommended Fix</div>
          <pre class="bg-[#0A0B0D] border border-success/20 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ vuln.fix_suggestion }}</code></pre>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-text-dim">
      No vulnerabilities found matching the current filter.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScansStore } from '@/stores/scans';

const route = useRoute();
const router = useRouter();
const scansStore = useScansStore();

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
  if (s === 'critical') return 'border-danger/30 text-danger';
  if (s === 'high') return 'border-warning/30 text-warning';
  if (s === 'medium') return 'border-info/30 text-info';
  return 'border-success/30 text-success';
}

function getSeverityBorderLeft(severity) {
  const s = severity?.toLowerCase();
  if (s === 'critical') return 'border-l-danger';
  if (s === 'high') return 'border-l-warning';
  if (s === 'medium') return 'border-l-info';
  return 'border-l-success';
}

function getStatusBadge(status) {
  if (status === 'completed') return 'bg-success/10 text-success border-success/20';
  if (status === 'failed') return 'bg-danger/10 text-danger border-danger/20';
  return 'bg-warning/10 text-warning border-warning/20';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}

async function deleteScan() {
  if (!confirm('Are you sure you want to delete this scan?')) return;
  
  try {
    await scansStore.deleteScan?.(route.params.id); // assuming we add delete to store later
    router.push('/history');
  } catch (e) {
    alert('Failed to delete scan');
  }
}

function exportToPDF() {
  // Placeholder - full implementation in next steps
  alert('PDF export will be implemented in the next step with full formatting.');
  // TODO: Use pdfmake to generate nice report
}

onMounted(async () => {
  const scanId = route.params.id;
  if (scanId) {
    await scansStore.fetchScanById(scanId);
  }
});
</script>