export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
  return `Hace ${Math.floor(days / 365)} años`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    completed: 'bg-green-500',
    success: 'bg-green-500',
    pending: 'bg-yellow-500',
    building: 'bg-blue-500',
    deploying: 'bg-blue-500',
    failed: 'bg-red-500',
    suspended: 'bg-red-500',
    cancelled: 'bg-gray-500',
    expired: 'bg-gray-500',
    issued: 'bg-green-500',
    open: 'bg-blue-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
}
