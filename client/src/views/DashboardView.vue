<template>
  <div class="p-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="section-title">Dashboard</h1>
        <p class="text-text-dim mt-1">Overview of your security scans</p>
      </div>
      <router-link 
        to="/scan/new" 
        class="btn btn-primary flex items-center gap-2"
      >
        <span>New Scan</span>
      </router-link>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div class="card">
        <div class="text-text-dim text-sm mb-1">Total Scans</div>
        <div class="text-4xl font-semibold tracking-tighter">
          <CountUp :end="stats.totalScans" />
        </div>
      </div>

      <div class="card">
        <div class="text-text-dim text-sm mb-1">Issues Found</div>
        <div class="text-4xl font-semibold tracking-tighter">
          <CountUp :end="stats.totalIssues" />
        </div>
      </div>

      <div class="card">
        <div class="text-text-dim text-sm mb-1">Critical Issues</div>
        <div class="text-4xl font-semibold tracking-tighter text-danger">
          <CountUp :end="stats.severityBreakdown.critical" />
        </div>
      </div>

      <div class="card">
        <div class="text-text-dim text-sm mb-1">High Issues</div>
        <div class="text-4xl font-semibold tracking-tighter text-warning">
          <CountUp :end="stats.severityBreakdown.high" />
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-8">
      <!-- Scans Over Time -->
      <div class="card lg:col-span-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">Scans (Last 7 Days)</h3>
        </div>
        <apexchart 
          v-if="barChartOptions"
          type="bar" 
          height="280"
          :options="barChartOptions" 
          :series="barChartSeries" 
        />
      </div>

      <!-- Severity Breakdown -->
      <div class="card lg:col-span-2">
        <h3 class="font-semibold mb-4">Severity Breakdown</h3>
        <apexchart 
          v-if="pieChartOptions"
          type="pie" 
          height="280"
          :options="pieChartOptions" 
          :series="pieChartSeries" 
        />
      </div>
    </div>

    <!-- Recent Scans -->
    <div class="card">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-semibold">Recent Scans</h3>
        <router-link to="/history" class="text-sm text-primary hover:underline">View all →</router-link>
      </div>

      <div v-if="recentScans.length > 0" class="divide-y divide-white/5">
        <div 
          v-for="scan in recentScans" 
          :key="scan.id"
          class="flex items-center justify-between py-4 px-1 hover:bg-card-hover -mx-1 px-4 rounded-lg cursor-pointer transition-colors"
          @click="goToScan(scan.id)"
        >
          <div class="flex items-center gap-4">
            <div>
              <div class="font-medium">{{ scan.title || 'Untitled Scan' }}</div>
              <div class="text-xs text-text-dim mt-0.5">
                {{ scan.language }} • {{ scan.provider.toUpperCase() }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-sm">{{ scan.total_issues }} issues</div>
              <div class="text-xs text-text-dim">{{ formatDate(scan.created_at) }}</div>
            </div>

            <div class="flex gap-1.5">
              <span v-if="scan.critical_count > 0" class="badge severity-critical">{{ scan.critical_count }}C</span>
              <span v-if="scan.high_count > 0" class="badge severity-high">{{ scan.high_count }}H</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="py-8 text-center text-text-dim">
        No scans yet. <router-link to="/scan/new" class="text-primary hover:underline">Start your first scan →</router-link>
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
  return [{
    name: 'Scans',
    data: data.map(d => d.count)
  }];
});

const barChartOptions = computed(() => {
  const data = scansStore.dashboardStats?.scansPerDay || [];
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      foreColor: '#9CA0A8',
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '55%',
      }
    },
    colors: ['#7C5CFF'],
    xaxis: {
      categories: data.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#9CA0A8' } }
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.06)',
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: 'dark',
    }
  };
});

const pieChartSeries = computed(() => {
  const b = stats.value.severityBreakdown;
  return [b.critical, b.high, b.medium, b.low];
});

const pieChartOptions = computed(() => ({
  chart: {
    type: 'pie',
  },
  labels: ['Critical', 'High', 'Medium', 'Low'],
  colors: ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E'],
  legend: {
    position: 'bottom',
    fontSize: '13px',
    markers: { size: 6 },
  },
  dataLabels: {
    enabled: true,
    style: { fontSize: '12px' }
  },
  tooltip: {
    theme: 'dark',
  }
}));

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

function goToScan(id) {
  router.push(`/scan/${id}`);
}

onMounted(async () => {
  await scansStore.fetchDashboard();
});
</script>

<style scoped>
.apexcharts-canvas {
  margin: 0 auto;
}
</style>