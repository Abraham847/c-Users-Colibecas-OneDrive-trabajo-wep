import { cn } from '../../utils/cn';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subvalue?: string;
  trend?: 'up' | 'down';
  color?: string;
}

export default function StatsCard({ icon: Icon, label, value, subvalue, trend, color }: StatsCardProps) {
  return (
    <div className="card-hover group">
      <div className="flex items-start justify-between">
        <div className={cn('p-3 rounded-xl', color || 'bg-primary-500/10')}>
          <Icon size={22} className={color ? 'text-white' : 'text-primary-400'} />
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-sm', trend === 'up' ? 'text-green-400' : 'text-red-400')}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400 mt-0.5">{label}</p>
        {subvalue && <p className="text-xs text-gray-500 mt-1">{subvalue}</p>}
      </div>
    </div>
  );
}
