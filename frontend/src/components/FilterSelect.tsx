import { Label } from '@/components/ui/label';

const selectClass =
  'h-12 w-full cursor-pointer rounded-xl border border-input bg-surface px-3.5 text-base text-foreground shadow-soft transition-[border-color,box-shadow] hover:border-primary/60 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none';

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

/** A labelled native select: works with keyboards, screen readers and mobile pickers out of the box. */
export function FilterSelect({ id, label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select id={id} className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Reads and writes one search param, dropping it when empty. */
export function setParam(params: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(params);
  if (value) next.set(key, value);
  else next.delete(key);
  return next;
}
