export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export function severityClass(severity) {
  const map = {
    critical: 'bg-danger/10 text-danger border border-danger/20',
    high: 'bg-warning/10 text-warning border border-warning/20',
    medium: 'bg-info/10 text-info border border-info/20',
    low: 'bg-success/10 text-success border border-success/20',
    info: 'bg-white/5 text-text-dim border border-white/10',
  };
  return map[severity] || map.info;
}

export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}
