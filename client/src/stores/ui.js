import { defineStore } from 'pinia';

let toastId = 1;

export const useUiStore = defineStore('ui', {
  state: () => ({
    sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === '1',
    theme: localStorage.getItem('theme') || 'dark',
    toasts: [],
    confirmDialog: {
      open: false,
      title: '',
      message: '',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger', // danger | primary
      loading: false,
      resolve: null,
    },
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed ? '1' : '0');
    },

    setTheme(theme) {
      this.theme = theme;
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    },

    /**
     * @param {string} message
     * @param {'success'|'error'|'warning'|'info'} type
     * @param {{ title?: string, duration?: number }} [options]
     */
    addToast(message, type = 'info', options = {}) {
      const duration = options.duration ?? (type === 'error' ? 5000 : 3500);
      const id = toastId++;
      this.toasts.push({
        id,
        message,
        type,
        title: options.title || null,
      });
      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }
      return id;
    },

    removeToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },

    /**
     * Promise-based confirm. Resolves true/false.
     * @param {{ title?: string, message: string, confirmText?: string, cancelText?: string, variant?: 'danger'|'primary' }} opts
     */
    confirm(opts) {
      return new Promise((resolve) => {
        this.confirmDialog = {
          open: true,
          title: opts.title || 'Confirm',
          message: opts.message || '',
          confirmText: opts.confirmText || 'Confirm',
          cancelText: opts.cancelText || 'Cancel',
          variant: opts.variant || 'danger',
          loading: false,
          resolve,
        };
      });
    },

    resolveConfirm(result) {
      const resolve = this.confirmDialog.resolve;
      this.confirmDialog.open = false;
      this.confirmDialog.loading = false;
      this.confirmDialog.resolve = null;
      if (typeof resolve === 'function') resolve(result);
    },
  },
});
