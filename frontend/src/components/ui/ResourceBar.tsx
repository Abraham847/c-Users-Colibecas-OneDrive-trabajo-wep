import { cn } from '../../utils/cn';

interface ResourceBarProps {
  label: string;
  used: number;
  total: number;
  unit?: string;
  color?: string;
}

export default function ResourceBar({ label, used, total, unit = 'GB', color }: ResourceBarProps) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const getColor = () => {
    if (color) return color;
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-primary-500';
  };

  const formatValue = (val: number) => {
    if (unit === 'GB') return (val / (1024 * 1024 * 1024)).toFixed(1);
    return val.toFixed(0);
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">
          {formatValue(used)} / {formatValue(total)} {unit}
        </span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
