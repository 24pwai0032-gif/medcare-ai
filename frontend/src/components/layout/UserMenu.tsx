import { CircleUser, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/authContext';

export function useSignOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return () => {
    logout();
    navigate('/', { replace: true });
  };
}

/** Avatar button with the account details and Sign out (mobile top bar). */
export function UserMenu() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const signOut = useSignOut();
  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('account.menu')}>
          <CircleUser className="size-6" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block font-semibold">{user.full_name}</span>
          <span className="block text-muted-foreground" dir="ltr">
            {user.email}
          </span>
          <span className="block text-muted-foreground">{t(`roles.${user.role}`)}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut className="rtl:-scale-x-100" aria-hidden="true" />
          {t('actions.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Name, role and Sign out, for the desktop sidebar. */
export function SidebarAccount() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const signOut = useSignOut();
  if (!user) return null;
  return (
    <div className="flex items-center gap-3">
      <CircleUser className="size-8 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">{t(`roles.${user.role}`)}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={signOut} aria-label={t('actions.signOut')}>
        <LogOut className="size-5 rtl:-scale-x-100" aria-hidden="true" />
      </Button>
    </div>
  );
}
