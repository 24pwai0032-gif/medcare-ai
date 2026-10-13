import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Each module keeps one colour everywhere it appears (index.css `--tone-*`). */
export type Tone = 'indigo' | 'violet' | 'rose' | 'emerald' | 'amber' | 'cyan';

const TONES: Record<Tone, string> = {
  indigo: 'bg-tone-indigo text-tone-indigo-foreground',
  violet: 'bg-tone-violet text-tone-violet-foreground',
  rose: 'bg-tone-rose text-tone-rose-foreground',
  emerald: 'bg-tone-emerald text-tone-emerald-foreground',
  amber: 'bg-tone-amber text-tone-amber-foreground',
  cyan: 'bg-tone-cyan text-tone-cyan-foreground',
};

const SIZES = {
  sm: 'size-9 rounded-lg [&_svg]:size-[1.125rem]',
  md: 'size-11 rounded-xl [&_svg]:size-5',
  lg: 'size-12 rounded-xl [&_svg]:size-6',
};

/** A module's icon on its colour. Decorative: the module's name is always written next to it. */
export function IconChip({
  icon: Icon,
  tone,
  size = 'md',
  className,
}: {
  icon: LucideIcon;
  tone: Tone;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cn('inline-flex shrink-0 items-center justify-center', TONES[tone], SIZES[size], className)}>
      <Icon />
    </span>
  );
}
