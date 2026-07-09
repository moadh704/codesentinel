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
          class="btn btn-ghost text-danger border-danger/30 hover:bg-danger/10 flex items-center gap-2 px-5"
        >
          <span>Delete Scan</span>
        </button>
      </div>
    </div>

    <!-- Severity Summary -->
    <div class="flex flex-wrap gap-3 mb-8">
      <div 
        v-for="(count, severity) in severityCounts" 
        :key="severity"
        class="px-4 py-2.5 rounded-2xl border text-sm flex items-center gap-3"
        :class="getSeverityBorder(severity)"
      >
        <span class="font-mono text-[10px] uppercase tracking-widest">{{ severity }}</span>
        <span class="font-semibold text-2xl tabular-nums">{{ count }}</span>
      </div>
      <div class="px-4 py-2.5 rounded-2xl border border-white/10 text-sm flex items-center gap-3">
        <span class="font-mono text-[10px] uppercase tracking-widest">Total</span>
        <span class="font-semibold text-2xl tabular-nums">{{ vulnerabilities.length }}</span>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 mb-8">
      <button 
        v-for="tab in filterTabs" 
        :key="tab"
        @click="activeFilter = tab"
        class="px-5 py-2 text-sm font-medium rounded-full transition-all border"
        :class="activeFilter === tab 
          ? 'border-primary bg-primary/10 text-primary' 
          : 'border-white/10 text-text-dim hover:text-white hover:border-white/30'"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Vulnerabilities -->
    <div v-if="highlightedVulns.length > 0" class="space-y-6">
      <div 
        v-for="(vuln, index) in highlightedVulns" 
        :key="index"
        class="card border-l-4 overflow-hidden"
        :class="getSeverityBorderLeft(vuln.severity)"
      >
        <div class="px-7 pt-6 pb-5">
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="badge" :class="getSeverityClass(vuln.severity)">{{ vuln.severity }}</span>
                <span class="badge bg-white/5 text-text-dim border-white/10">{{ vuln.type }}</span>
                <span v-if="vuln.line_number" class="text-xs text-text-muted font-mono">Line {{ vuln.line_number }}</span>
              </div>
              <h3 class="font-semibold text-2xl tracking-[-0.5px]">{{ vuln.title }}</h3>
            </div>
          </div>

          <!-- Description -->
          <p class="text-text-dim leading-relaxed mb-6">{{ vuln.description }}</p>

          <!-- Vulnerable Code -->
          <div v-if="vuln.vulnerable_code" class="mb-2">
            <div class="flex items-center justify-between mb-2 px-1">
              <div class="text-xs uppercase tracking-widest text-text-dim font-medium">Vulnerable Code</div>
              <button 
                @click="copyToClipboard(vuln.vulnerable_code)"
                class="text-xs flex items-center gap-1.5 text-text-dim hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <div v-if="vuln.highlightedVulnerable" class="shiki-code" v-html="vuln.highlightedVulnerable"></div>
            <pre v-else class="text-sm font-mono overflow-x-auto p-5 rounded-2xl bg-black/60 border border-white/10"><code>{{ vuln.vulnerable_code }}</code></pre>
          </div>

          <!-- Recommended Fix -->
          <div v-if="vuln.fix_suggestion" class="px-7 py-5 border-t border-white/10 bg-[#0A0B0D] -mx-7 -mb-5 mt-4">
            <div class="flex items-center justify-between mb-3 px-1">
              <div class="text-xs uppercase tracking-widest text-success font-medium">Recommended Fix</div>
              <button 
                @click="copyToClipboard(vuln.fix_suggestion)"
                class="text-xs flex items-center gap-1.5 text-success/70 hover:text-success transition-colors"
              >
                Copy
              </button>
            </div>
            <div v-if="vuln.highlightedFix" class="shiki-code" v-html="vuln.highlightedFix"></div>
            <pre v-else class="text-sm font-mono overflow-x-auto p-5 rounded-2xl bg-black/60 border border-success/20"><code>{{ vuln.fix_suggestion }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 text-text-dim">
      No vulnerabilities found matching the current filter.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScansStore } from '@/stores/scans';
import { useUiStore } from '@/stores/ui';
import { useCodeHighlight } from '@/composables/useCodeHighlight';

const route = useRoute();
const router = useRouter();
const scansStore = useScansStore();
const uiStore = useUiStore();

const activeFilter = ref('All');
const filterTabs = ['All', 'Critical', 'High', 'Medium', 'Low'];

const scan = computed(() => scansStore.currentScan);
const vulnerabilities = computed(() => scansStore.currentVulnerabilities || []);

const highlightedVulns = ref([]);

const { highlightCode } = await useCodeHighlight();

watch(vulnerabilities, async (newVulns) => {
  if (!newVulns.length) {
    highlightedVulns.value = [];
    return;
  }

  const lang = scan.value?.language || 'JavaScript';

  highlightedVulns.value = await Promise.all(
    newVulns.map(async (vuln) => {
      return {
        ...vuln,
        highlightedVulnerable: vuln.vulnerable_code 
          ? highlightCode(vuln.vulnerable_code, lang) 
          : '',
        highlightedFix: vuln.fix_suggestion 
          ? highlightCode(vuln.fix_suggestion, lang) 
          : '',
      };
    })
  );
}, { immediate: true });

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
    await scansStore.deleteScan?.(route.params.id);
    uiStore.addToast('Scan deleted successfully', 'success');
    router.push('/history');
  } catch (e) {
    uiStore.addToast('Failed to delete scan', 'error');
  }
}

function exportToPDF() {
  if (!scan.value || !vulnerabilities.value.length) {
    uiStore.addToast('No data available to export', 'warning');
    return;
  }

  const docDefinition = {
    content: [
      { text: 'CodeSentinel - Security Scan Report', style: 'header' },
      { text: `Generated on ${new Date().toLocaleDateString()}`, style: 'subheader' },
      { text: '\n' },
      { text: 'Scan Details', style: 'sectionHeader' },
      {
        table: {
          body: [
            ['Title', scan.value.title || 'Untitled Scan'],
            ['Language', scan.value.language],
            ['Provider', scan.value.provider.toUpperCase()],
            ['Date', formatDate(scan.value.created_at)],
            ['Total Issues', vulnerabilities.value.length.toString()],
          ]
        },
        layout: 'noBorders'
      },
      { text: '\nVulnerabilities', style: 'sectionHeader' },
      ...vulnerabilities.value.map((v, index) => ([
        { text: `${index + 1}. ${v.title}`, style: 'vulnTitle' },
        { text: `Severity: ${v.severity}  |  Type: ${v.type}  |  Line: ${v.line_number || 'N/A'}`, style: 'vulnMeta' },
        { text: v.description, style: 'bodyText' },
        v.vulnerable_code ? { text: 'Vulnerable Code:', style: 'codeLabel' } : {},
        v.vulnerable_code ? { text: v.vulnerable_code, style: 'code' } : {},
        v.fix_suggestion ? { text: 'Recommended Fix:', style: 'codeLabel' } : {},
        v.fix_suggestion ? { text: v.fix_suggestion, style: 'code' } : {},
        { text: '\n' }
      ])).flat(),
    ],
    styles: {
      header: { fontSize: 22, bold: true, color: '#7C5CFF', marginBottom: 8 },
      subheader: { fontSize: 11, color: '#9CA0A8' },
      sectionHeader: { fontSize: 14, bold: true, marginTop: 16, marginBottom: 8, color: '#E6E7EA' },
      vulnTitle: { fontSize: 13, bold: true, marginTop: 12 },
      vulnMeta: { fontSize: 10, color: '#9CA0A8', marginBottom: 4 },
      bodyText: { fontSize: 11, marginBottom: 6 },
      codeLabel: { fontSize: 10, bold: true, color: '#22C55E', marginTop: 6 },
      code: { fontSize: 9, font: 'Courier', color: '#E6E7EA', marginBottom: 8 }
    }
  };

  pdfMake.createPdf(docDefinition).download(`CodeSentinel_Report_${scan.value.id}.pdf`);
  uiStore.addToast('PDF report downloaded successfully', 'success');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  uiStore.addToast('Copied to clipboard', 'success');
}

onMounted(async () => {
  const scanId = route.params.id;
  if (scanId) {
    await scansStore.fetchScanById(scanId);
  }
});
</script>