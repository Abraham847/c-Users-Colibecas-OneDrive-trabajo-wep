import { cn } from '../../utils/cn';
import { getStatusColor } from '../../utils/format';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const labels: Record<string, string> = {
    active: 'Activo', pending: 'Pendiente', completed: 'Completado', failed: 'Fallido',
    building: 'Construyendo', deploying: 'Desplegando', success: 'Éxito',
    suspended: 'Suspendido', cancelled: 'Cancelado', expired: 'Expirado',
    issued: 'Emitido', open: 'Abierto', resolved: 'Resuelto', closed: 'Cerrado',
    transferring: 'Transfiriendo', past_due: 'Vencido', trialing: 'Prueba',
    creating: 'Creando', deleting: 'Eliminando', disabled: 'Deshabilitado',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'md' ? 'px-3 py-1 text-sm' : 'px-4 py-1.5 text-sm'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', getStatusColor(status))} />
      {labels[status] || status}
    </span>
  );
}
