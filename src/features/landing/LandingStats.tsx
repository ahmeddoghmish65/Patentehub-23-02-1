import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';

interface Stat {
  value: string;
  label: string;
  icon: string;
  colorfrom: string;
  colorto: string;
}

interface LandingStatsProps {
  stats: Stat[];
}

export function LandingStats({ stats }: LandingStatsProps) {
  return (
    <section className="bg-white py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center group">
              <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 shadow-sm', s.colorfrom, s.colorto)}>
                <Icon name={s.icon} size={26} className="text-white" filled />
              </div>
              <p className="text-3xl font-black text-surface-900">{s.value}</p>
              <p className="text-sm text-surface-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
