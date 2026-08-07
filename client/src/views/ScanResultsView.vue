<template>
  <div class="max-w-6xl mx-auto px-8 py-10">
    <div v-if="loading" class="text-center py-20 text-text-dim">
      Loading scan results…
    </div>

    <div v-else-if="loadError" class="text-center py-20">
      <p class="text-danger mb-4">{{ loadError }}</p>
      <router-link to="/history" class="btn btn-primary">Back to history</router-link>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
        <div>
          <div class="flex items-center gap-4 flex-wrap">
            <h1 class="text-4xl font-heading font-semibold tracking-[-1.5px]">
              {{ scan?.title || 'Security Scan' }}
            </h1>
            <div
              class="px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-[1px] border"
              :class="getStatusBadge(scan?.status)"
            >
              {{ scan?.status || 'unknown' }}
            </div>
          </div>
          <div class="flex items-center gap-3 mt-3 text-sm text-text-dim flex-wrap">
            <span class="font-medium">{{ scan?.language || '—' }}</span>
            <span class="text-white/30">•</span>
            <span>{{ (scan?.provider || '').toUpperCase() }}</span>
            <span class="text-white/30">•</span>
            <span>{{ formatDate(scan?.created_at) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="exportReport"
            class="btn btn-ghost flex items-center gap-2 px-5"
          >
            <span>Export PDF</span>
          </button>
          <button
            type="button"
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
      <div class="flex gap-2 mb-8 flex-wrap">
        <button
          v-for="tab in filterTabs"
          :key="tab"
          type="button"
          @click="activeFilter = tab"
          class="px-5 py-2 text-sm font-medium rounded-full transition-all border"
          :class="
            activeFilter === tab
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-white/10 text-text-dim hover:text-white hover:border-white/30'
          "
        >
          {{ tab }}
        </button>
      </div>

      <!-- Vulnerabilities -->
      <div v-if="displayVulns.length > 0" class="space-y-6">
        <div
          v-for="(vuln, index) in displayVulns"
          :key="vuln.id || index"
          class="card border-l-4 overflow-hidden"
          :class="getSeverityBorderLeft(vuln.severity)"
        >
          <div class="px-7 pt-6 pb-5">
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center gap-3 mb-2 flex-wrap">
                  <span class="badge" :class="getSeverityClass(vuln.severity)">{{
                    vuln.severity
                  }}</span>
                  <span class="badge bg-white/5 text-text-dim border-white/10">{{
                    vuln.type || 'Unknown'
                  }}</span>
                  <span
                    v-if="vuln.line_number != null && vuln.line_number !== ''"
                    class="text-xs text-text-muted font-mono"
                  >
                    Line {{ vuln.line_number }}
                  </span>
                </div>
                <h3 class="font-semibold text-2xl tracking-[-0.5px]">
                  {{ vuln.title || 'Finding' }}
                </h3>
              </div>
            </div>

            <p class="text-text-dim leading-relaxed mb-6">
              {{ vuln.description || 'No description provided.' }}
            </p>

            <div v-if="vuln.vulnerable_code" class="mb-2">
              <div class="flex items-center justify-between mb-2 px-1">
                <div class="text-xs uppercase tracking-widest text-text-dim font-medium">
                  Vulnerable Code
                </div>
                <button
                  type="button"
                  @click="copyToClipboard(vuln.vulnerable_code)"
                  class="text-xs flex items-center gap-1.5 text-text-dim hover:text-white transition-colors"
                >
                  Copy
                </button>
              </div>
              <div
                v-if="vuln.highlightedVulnerable"
                class="shiki-code overflow-x-auto rounded-2xl border border-white/10"
                v-html="vuln.highlightedVulnerable"
              ></div>
              <pre
                v-else
                class="text-sm font-mono overflow-x-auto p-5 rounded-2xl bg-black/60 border border-white/10 whitespace-pre-wrap"
              ><code>{{ vuln.vulnerable_code }}</code></pre>
            </div>

            <div
              v-if="vuln.fix_suggestion"
              class="px-7 py-5 border-t border-white/10 bg-[#0A0B0D] -mx-7 -mb-5 mt-4"
            >
              <div class="flex items-center justify-between mb-3 px-1">
                <div class="text-xs uppercase tracking-widest text-success font-medium">
                  Recommended Fix
                </div>
                <button
                  type="button"
                  @click="copyToClipboard(vuln.fix_suggestion)"
                  class="text-xs flex items-center gap-1.5 text-success/70 hover:text-success transition-colors"
                >
                  Copy
                </button>
              </div>
              <div
                v-if="vuln.highlightedFix"
                class="shiki-code overflow-x-auto rounded-2xl border border-success/20"
                v-html="vuln.highlightedFix"
              ></div>
              <pre
                v-else
                class="text-sm font-mono overflow-x-auto p-5 rounded-2xl bg-black/60 border border-success/20 whitespace-pre-wrap"
              ><code>{{ vuln.fix_suggestion }}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 text-text-dim">
        No vulnerabilities found matching the current filter.
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScansStore } from '@/stores/scans';
import { useUiStore } from '@/stores/ui';
import { highlightCode } from '@/composables/useCodeHighlight';

const route = useRoute();
const router = useRouter();
const scansStore = useScansStore();
const uiStore = useUiStore();

const loading = ref(true);
const loadError = ref('');
const activeFilter = ref('All');
const filterTabs = ['All', 'Critical', 'High', 'Medium', 'Low', 'Info'];
const displayVulns = ref([]);
let highlightGeneration = 0;

const scan = computed(() => scansStore.currentScan);
const vulnerabilities = computed(() => scansStore.currentVulnerabilities || []);

const severityCounts = computed(() => {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  vulnerabilities.value.forEach((v) => {
    const sev = String(v.severity || '').toLowerCase();
    if (counts[sev] !== undefined) counts[sev]++;
  });
  return counts;
});

const filteredVulnerabilities = computed(() => {
  if (activeFilter.value === 'All') return vulnerabilities.value;
  return vulnerabilities.value.filter(
    (v) => String(v.severity || '').toLowerCase() === activeFilter.value.toLowerCase()
  );
});

async function rebuildDisplay() {
  const gen = ++highlightGeneration;
  const list = filteredVulnerabilities.value || [];
  const lang = scan.value?.language || 'JavaScript';

  // Show plain text immediately so the page never blanks while Shiki loads
  displayVulns.value = list.map((vuln) => ({
    ...vuln,
    highlightedVulnerable: '',
    highlightedFix: '',
  }));

  if (!list.length) return;

  try {
    const next = await Promise.all(
      list.map(async (vuln) => {
        const [highlightedVulnerable, highlightedFix] = await Promise.all([
          vuln.vulnerable_code
            ? highlightCode(vuln.vulnerable_code, lang)
            : Promise.resolve(''),
          vuln.fix_suggestion
            ? highlightCode(vuln.fix_suggestion, lang)
            : Promise.resolve(''),
        ]);
        return { ...vuln, highlightedVulnerable, highlightedFix };
      })
    );
    if (gen === highlightGeneration) {
      displayVulns.value = next;
    }
  } catch (err) {
    console.error('Highlight pass failed', err);
    // keep plain-text display already set
  }
}

watch([filteredVulnerabilities, () => scan.value?.language], () => {
  rebuildDisplay();
});

function getSeverityClass(severity) {
  const s = String(severity || '').toLowerCase();
  if (s === 'critical') return 'severity-critical';
  if (s === 'high') return 'severity-high';
  if (s === 'medium') return 'severity-medium';
  if (s === 'low') return 'severity-low';
  return 'severity-info';
}

function getSeverityBorder(severity) {
  const s = String(severity || '').toLowerCase();
  if (s === 'critical') return 'border-danger/30 text-danger';
  if (s === 'high') return 'border-warning/30 text-warning';
  if (s === 'medium') return 'border-info/30 text-info';
  if (s === 'info') return 'border-white/20 text-text-dim';
  return 'border-success/30 text-success';
}

function getSeverityBorderLeft(severity) {
  const s = String(severity || '').toLowerCase();
  if (s === 'critical') return 'border-l-danger';
  if (s === 'high') return 'border-l-warning';
  if (s === 'medium') return 'border-l-info';
  if (s === 'info') return 'border-l-white/30';
  return 'border-l-success';
}

function getStatusBadge(status) {
  if (status === 'completed') return 'bg-success/10 text-success border-success/20';
  if (status === 'failed') return 'bg-danger/10 text-danger border-danger/20';
  return 'bg-warning/10 text-warning border-warning/20';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return String(dateStr);
  }
}

async function deleteScan() {
  const ok = await uiStore.confirm({
    title: 'Delete this scan?',
    message:
      'You will lose this report and all vulnerability details. This cannot be undone.',
    confirmText: 'Delete scan',
    cancelText: 'Cancel',
    variant: 'danger',
  });
  if (!ok) return;

  try {
    await scansStore.deleteScan?.(route.params.id);
    uiStore.addToast('Redirecting to your scan history.', 'success', {
      title: 'Scan deleted',
    });
    router.push('/history');
  } catch (e) {
    uiStore.addToast(
      e.response?.data?.error || 'Could not delete this scan. Try again.',
      'error',
      { title: 'Delete failed' }
    );
  }
}

/** Print-friendly export (pdfMake was referenced but never installed). */
function exportReport() {
  if (!scan.value) {
    uiStore.addToast('No scan loaded.', 'warning', { title: 'Nothing to export' });
    return;
  }
  if (!vulnerabilities.value.length) {
    uiStore.addToast('Run a scan with findings first, then export.', 'warning', {
      title: 'Nothing to export',
    });
    return;
  }

  try {
    const w = window.open('', '_blank');
    if (!w) {
      uiStore.addToast('Allow pop-ups to export the report.', 'warning', {
        title: 'Pop-up blocked',
      });
      return;
    }

    const rows = vulnerabilities.value
      .map((v, i) => {
        const code = v.vulnerable_code
          ? `<pre style="background:#111;color:#e6e7ea;padding:12px;border-radius:8px;overflow:auto;font-size:12px;">${escapeHtml(v.vulnerable_code)}</pre>`
          : '';
        const fix = v.fix_suggestion
          ? `<pre style="background:#0d1a12;color:#86efac;padding:12px;border-radius:8px;overflow:auto;font-size:12px;">${escapeHtml(v.fix_suggestion)}</pre>`
          : '';
        return `
          <section style="margin:24px 0;padding-bottom:16px;border-bottom:1px solid #333;">
            <h2 style="margin:0 0 8px;font-size:16px;">${i + 1}. ${escapeHtml(v.title || 'Finding')}</h2>
            <p style="color:#9ca0a8;font-size:12px;margin:0 0 8px;">
              Severity: ${escapeHtml(v.severity || '')} · Type: ${escapeHtml(v.type || '')} · Line: ${escapeHtml(String(v.line_number ?? 'N/A'))}
            </p>
            <p style="font-size:13px;line-height:1.5;">${escapeHtml(v.description || '')}</p>
            ${code ? `<h3 style="font-size:12px;color:#f87171;">Vulnerable code</h3>${code}` : ''}
            ${fix ? `<h3 style="font-size:12px;color:#4ade80;">Recommended fix</h3>${fix}` : ''}
          </section>`;
      })
      .join('');

    w.document.write(`<!DOCTYPE html><html><head><title>CodeSentinel Report</title>
      <style>body{font-family:system-ui,sans-serif;background:#0a0b0d;color:#e6e7ea;padding:32px;max-width:900px;margin:0 auto;}
      h1{color:#7c5cff;}</style></head><body>
      <h1>CodeSentinel — Security Scan Report</h1>
      <p style="color:#9ca0a8;">${escapeHtml(scan.value.title || 'Untitled')} · ${escapeHtml(scan.value.language || '')} · ${escapeHtml((scan.value.provider || '').toUpperCase())} · ${escapeHtml(formatDate(scan.value.created_at))}</p>
      <p>${vulnerabilities.value.length} issue(s)</p>
      ${rows}
      </body></html>`);
    w.document.close();
    setTimeout(() => {
      try {
        w.focus();
        w.print();
      } catch (_) {
        /* user can print manually */
      }
    }, 300);
    uiStore.addToast('Use the print dialog → Save as PDF.', 'success', {
      title: 'Export ready',
    });
  } catch (err) {
    console.error(err);
    uiStore.addToast('Could not open the export window.', 'error', {
      title: 'Export failed',
    });
  }
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => {
      uiStore.addToast('Snippet copied.', 'success', {
        title: 'Copied',
        duration: 2000,
      });
    },
    () => {
      uiStore.addToast('Could not copy to clipboard.', 'error', { title: 'Copy failed' });
    }
  );
}

onMounted(async () => {
  loading.value = true;
  loadError.value = '';
  const scanId = route.params.id;
  try {
    if (scanId) {
      await scansStore.fetchScanById(scanId);
      if (!scansStore.currentScan) {
        loadError.value = 'Scan not found.';
      }
    } else {
      loadError.value = 'Missing scan id.';
    }
  } catch (e) {
    console.error(e);
    loadError.value =
      e.response?.data?.error || e.message || 'Failed to load this scan.';
  } finally {
    loading.value = false;
    await rebuildDisplay();
  }
});
</script>
