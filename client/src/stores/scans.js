import { defineStore } from 'pinia';
import axios from '@/lib/axios';

export const useScansStore = defineStore('scans', {
  state: () => ({
    scans: [],
    currentScan: null,
    currentVulnerabilities: [],
    loading: false,
    dashboardStats: null,
  }),

  actions: {
    async fetchScans() {
      this.loading = true;
      try {
        const { data } = await axios.get('/api/scans');
        this.scans = data.scans || [];
      } finally {
        this.loading = false;
      }
    },

    async fetchDashboard() {
      const { data } = await axios.get('/api/dashboard');
      this.dashboardStats = data;
    },

    async createScan(payload) {
      this.loading = true;
      try {
        const { data } = await axios.post('/api/scan', payload);
        this.currentScan = data.scan;
        this.currentVulnerabilities = data.vulnerabilities || [];
        await this.fetchScans();
        return data;
      } finally {
        this.loading = false;
      }
    },

    async fetchScanById(id) {
      this.loading = true;
      try {
        const { data } = await axios.get(`/api/scans/${id}`);
        this.currentScan = data.scan;
        this.currentVulnerabilities = data.vulnerabilities || [];
        return data;
      } finally {
        this.loading = false;
      }
    },

    clearCurrentScan() {
      this.currentScan = null;
      this.currentVulnerabilities = [];
    },

    async deleteScan(id) {
      await axios.delete(`/api/scans/${id}`);
      this.scans = this.scans.filter(s => s.id !== id);
    },
  },
});