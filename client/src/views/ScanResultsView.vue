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
          <CodeBlock :code="vuln.vulnerable_code" :language="scan?.language" />
        </div>

        <!-- Fix Suggestion -->
        <div v-if="vuln.fix_suggestion" class="mt-4 pt-4 border-t border-white/10">
          <div class="flex items-center gap-2 mb-2">
            <div class="text-xs uppercase tracking-wider text-success font-medium">Recommended Fix</div>
            <div class="flex-1 h-px bg-success/20"></div>
          </div>
          <CodeBlock :code="vuln.fix_suggestion" :language="scan?.language" />
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-text-dim">
      No vulnerabilities found matching the current filter.
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal 
      v-model="showDeleteModal"
      title="Delete Scan"
      confirm-text="Delete"
      confirm-class="bg-danger text-white hover:bg-danger/90"
      @confirm="confirmDelete"
    >
      <p>Are you sure you want to delete this scan? This action cannot be undone.</p>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScansStore } from '@/stores/scans';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import CodeBlock from '@/components/CodeBlock.vue';
import Modal from '@/components/Modal.vue';
import { useUiStore } from '@/stores/ui';

// Register fonts for pdfmake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const route = useRoute();
const router = useRouter();
const scansStore = useScansStore();
const uiStore = useUiStore();

const activeFilter = ref('All');

const filterTabs = ['All', 'Critical', 'High', 'Medium', 'Low'];

// Modal state
const showDeleteModal = ref(false);

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
  showDeleteModal.value = true;
}

async function confirmDelete() {
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
    alert('No data to export.');
    return;
  }

  const docDefinition = {
    content: [
      // Header
      {
        text: 'CodeSentinel Security Report',
        style: 'header',
        margin: [0, 0, 0, 10]
      },
      {
        text: scan.value.title || 'Untitled Scan',
        style: 'title',
        margin: [0, 0, 0, 20]
      },

      // Meta info
      {
        columns: [
          { text: `Language: ${scan.value.language}`, style: 'meta' },
          { text: `Provider: ${scan.value.provider.toUpperCase()}`, style: 'meta' },
          { text: `Date: ${formatDate(scan.value.created_at)}`, style: 'meta' }
        ],
        margin: [0, 0, 0, 20]
      },

      // Summary
      {
        text: 'Summary',
        style: 'sectionHeader',
        margin: [0, 10, 0, 8]
      },
      {
        text: `Total Issues: ${vulnerabilities.value.length}`,
        margin: [0, 0, 0, 4]
      },
      {
        text: `Critical: ${severityCounts.value.critical}  |  High: ${severityCounts.value.high}  |  Medium: ${severityCounts.value.medium}  |  Low: ${severityCounts.value.low}`,
        margin: [0, 0, 0, 20]
      },

      // Vulnerabilities
      {
        text: 'Vulnerabilities',
        style: 'sectionHeader',
        margin: [0, 10, 0, 10]
      },

      ...vulnerabilities.value.map((vuln, index) => {
        const content = [
          {
            text: `${index + 1}. ${vuln.title}`,
            style: 'vulnTitle',
            margin: [0, 8, 0, 4]
          },
          {
            text: `Severity: ${vuln.severity}   |   Type: ${vuln.type}   ${vuln.line_number ? `| Line: ${vuln.line_number}` : ''}`,
            style: 'meta',
            margin: [0, 0, 0, 6]
          },
          {
            text: vuln.description,
            margin: [0, 0, 0, 8]
          }
        ];

        if (vuln.vulnerable_code) {
          content.push({
            text: 'Vulnerable Code:',
            style: 'codeLabel',
            margin: [0, 4, 0, 2]
          });
          content.push({
            text: vuln.vulnerable_code,
            style: 'code',
            margin: [0, 0, 0, 8]
          });
        }

        if (vuln.fix_suggestion) {
          content.push({
            text: 'Recommended Fix:',
            style: 'codeLabel',
            margin: [0, 4, 0, 2]
          });
          content.push({
            text: vuln.fix_suggestion,
            style: 'code',
            margin: [0, 0, 0, 12]
          });
        }

        return content;
      }).flat()
    ],

    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: '#7C5CFF'
      },
      title: {
        fontSize: 14,
        bold: true
      },
      sectionHeader: {
        fontSize: 13,
        bold: true,
        color: '#E6E7EA'
      },
      vulnTitle: {
        fontSize: 11,
        bold: true
      },
      meta: {
        fontSize: 9,
        color: '#9CA0A8'
      },
      codeLabel: {
        fontSize: 9,
        bold: true,
        color: '#22C55E'
      },
      code: {
        fontSize: 8,
        font: 'Courier',
        color: '#E6E7EA',
        background: '#111214'
      }
    },

    defaultStyle: {
      font: 'Helvetica',
      fontSize: 10,
      color: '#E6E7EA'
    }
  };

  pdfMake.createPdf(docDefinition).download(`codesentinel-report-${scan.value.id}.pdf`);
}

onMounted(async () => {
  const scanId = route.params.id;
  if (scanId) {
    await scansStore.fetchScanById(scanId);
  }
});
</script>