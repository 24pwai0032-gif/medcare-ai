import { Languages, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

/** Shows the language you can switch to, in that language. */
export function LanguageToggle({ className, showIcon = true }: { className?: string; showIcon?: boolean }) {
  const { t, i18n } = useTranslation();
  const next = i18n.language === 'ur' ? 'en' : 'ur';
  return (
    <Button variant="ghost" className={cn('px-3', className)} onClick={() => void i18n.changeLanguage(next)}>
      {showIcon ? <Languages className="size-4" aria-hidden="true" /> : null}
      <span className="sr-only">{t('language.switchTo')}: </span>
      {/* System font, so English visitors never download the Nastaliq font just for this label. */}
      <span lang={next} className="font-system leading-none">
        {t(`language.${next}`)}
      </span>
    </Button>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { resolved, toggle } = useTheme();
  const toDark = resolved !== 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggle}
      aria-label={toDark ? t('theme.toDark') : t('theme.toLight')}
    >
      {toDark ? <Moon className="size-5" aria-hidden="true" /> : <Sun className="size-5" aria-hidden="true" />}
    </Button>
  );
}
