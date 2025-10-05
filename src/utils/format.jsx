export function formatCurrency(n) {
  try {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(n) || 0);
  } catch { return String(n); }
}
export function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString(); 
}
