import { Phone, ShieldCheck } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { IconChip } from '@/components/IconChip';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const telLink = 'font-bold text-primary underline underline-offset-2 hover:no-underline';

/** The required notice on every AI result, in the PDF and on the landing page. */
export function Disclaimer({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <aside
      aria-label={t('disclaimer.label')}
      className={cn('flex gap-4 rounded-2xl border bg-surface p-4 text-sm shadow-card', className)}
    >
      <IconChip icon={ShieldCheck} tone="cyan" size="sm" />
      <div className="space-y-1">
        <p className="font-semibold">{t('disclaimer.notDiagnosis')}</p>
        <p className="text-muted-foreground">{t('disclaimer.doctorReview')}</p>
        <p className="text-muted-foreground">
          <Trans
            t={t}
            i18nKey="disclaimer.emergency"
            components={{
              rescue: <a href="tel:1122" className={telLink} />,
              edhi: <a href="tel:115" className={telLink} />,
            }}
          />
        </p>
      </div>
    </aside>
  );
}

/** Large call buttons. The number is visible text, so it can be dialled by hand if tel: links don't work. */
export function EmergencyCallButtons({ className }: { className?: string }) {
  const { t } = useTranslation();
  const call = [
    { href: 'tel:1122', label: t('emergencyNumbers.callRescue'), service: t('emergencyNumbers.rescueService') },
    { href: 'tel:115', label: t('emergencyNumbers.callEdhi'), service: t('emergencyNumbers.edhiService') },
  ];
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {call.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(buttonVariants({ variant: 'emergency', size: 'lg' }), 'h-auto min-h-14 flex-col gap-0 py-2')}
        >
          <span className="inline-flex items-center gap-2 text-lg">
            <Phone className="size-5" aria-hidden="true" />
            {item.label}
          </span>{' '}
          <span className="text-sm font-medium">{item.service}</span>
        </a>
      ))}
    </div>
  );
}
