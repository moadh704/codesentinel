<template>
  <div class="max-w-7xl mx-auto px-8 py-10">
    <!-- Header -->
    <div class="flex items-end justify-between mb-10">
      <div>
        <h1 class="text-5xl font-heading font-semibold tracking-[-2px]">Dashboard</h1>
        <p class="text-text-dim mt-2 text-lg">Overview of your security posture</p>
      </div>
      <router-link to="/scan/new" class="btn btn-primary px-8 py-3 text-base">
        New Security Scan
      </router-link>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
      <div class="card p-7">
        <div class="text-sm text-text-dim tracking-wider">TOTAL SCANS</div>
        <div class="text-6xl font-semibold tracking-tighter mt-3">
          <CountUp :end="stats.totalScans" />
        </div>
      </div>
      <div class="card p-7">
        <div class="text-sm text-text-dim tracking-wider">ISSUES FOUND</div>
        <div class="text-6xl font-semibold tracking-tighter mt-3">
          <CountUp :end="stats.totalIssues" />
        </div>
      </div>
      <div class="card p-7 border-danger/20">
        <div class="text-sm text-danger tracking-wider">CRITICAL</div>
        <div class="text-6xl font-semibold tracking-tighter mt-3 text-danger">
          <CountUp :end="stats.severityBreakdown.critical" />
        </div>
      </div>
      <div class="card p-7 border-warning/20">
        <div class="text-sm text-warning tracking-wider">HIGH</div>
        <div class="text-6xl font-semibold tracking-tighter mt-3 text-warning">
          <CountUp :end="stats.severityBreakdown.high" />
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-10">
      <div class="card lg:col-span-3 p-7">
        <div class="font-medium mb-6 flex items-center justify-between">
          <span>Scans over time</span>
          <span class="text-xs text-text-muted">Last 7 days</span>
        </div>
        <apexchart 
          v-if="barChartOptions"
          type="bar" 
          height="260"
          :options="barChartOptions" 
          :series="barChartSeries" 
        />
      </div>

      <div class="card lg:col-span-2 p-7">
        <div class="font-medium mb-6">Severity Distribution</div>
        <apexchart 
          v-if="pieChartOptions"
          type="donut" 
          height="260"
          :options="pieChartOptions" 
          :series="pieChartSeries" 
        />
      </div>
    </div>

    <!-- Recent Scans -->
    <div class="card">
      <div class="flex items-center justify-between px-7 pt-7 pb-5">
        <div class="font-medium">Recent Scans</div>
        <router-link to="/history" class="text-sm text-primary hover:underline">View all →</router-link>
      </div>

      <div v-if="recentScans.length > 0" class="divide-y divide-white/10">
        <div 
          v-for="scan in recentScans" 
          :key="scan.id"
          @click="goToScan(scan.id)"
          class="flex items-center justify-between px-7 py-5 hover:bg-card-hover transition-colors cursor-pointer"
        >
          <div>
            <div class="font-medium">{{ scan.title || 'Untitled Scan' }}</div>
            <div class="text-sm text-text-dim mt-0.5">{{ scan.language }} • {{ scan.provider.toUpperCase() }}</div>
          </div>
          <div class="flex items-center gap-6 text-sm">
            <div class="text-right">
              <div>{{ scan.total_issues }} issues</div>
              <div class="text-xs text-text-muted">{{ formatDate(scan.created_at) }}</div>
            </div>
            <div class="flex gap-2">
              <span v-if="scan.critical_count > 0" class="badge severity-critical text-xs">{{ scan.critical_count }}C</span>
              <span v-if="scan.high_count > 0" class="badge severity-high text-xs">{{ scan.high_count }}H</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="px-7 py-12 text-center text-text-dim">
        No scans yet. <router-link to="/scan/new" class="text-primary">Start your first scan →</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScansStore } from '@/stores/scans';
import CountUp from '@/components/CountUp.vue';

const router = useRouter();
const scansStore = useScansStore();

const stats = computed(() => scansStore.dashboardStats?.stats || {
  totalScans: 0,
  totalIssues: 0,
  severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 }
});

const recentScans = computed(() => scansStore.dashboardStats?.recentScans || []);

const barChartSeries = computed(() => {
  const data = scansStore.dashboardStats?.scansPerDay || [];
  return [{ name: 'Scans', data: data.map(d => d.count) }];
});

const barChartOptions = computed(() => {
  const data = scansStore.dashboardStats?.scansPerDay || [];
  return {
    chart: { type: 'bar', toolbar: { show: false }, foreColor: '#9CA0A8' },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
    colors: ['#7C5CFF'],
    xaxis: {
      categories: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: { borderColor: 'rgba(255,255,255,0.06)' },
    tooltip: { theme: 'dark' }
  };
});

const pieChartSeries = computed(() => {
  const b = stats.value.severityBreakdown;
  return [b.critical, b.high, b.medium, b.low];
});

const pieChartOptions = computed(() => ({
  chart: { type: 'donut' },
  labels: ['Critical', 'High', 'Medium', 'Low'],
  colors: ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E'],
  legend: { position: 'bottom', fontSize: '13px' },
  dataLabels: { enabled: true },
  tooltip: { theme: 'dark' }
}));

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function goToScan(id) {
  router.push(`/scan/${id}`);
}

onMounted(async () => {
  await scansStore.fetchDashboard();
});
</script>