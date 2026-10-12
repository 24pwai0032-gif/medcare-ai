import { zodResolver } from '@hookform/resolvers/zod';
import { Clock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useSearchParams } from 'react-router';
import { Field, PasswordInput } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { Alert, Spinner } from '@/components/ui/feedback';
import { Input } from '@/components/ui/input';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useAuth } from './authContext';
import { AuthCard, ServerError, SlowServerNote, useFieldError } from './AuthCard';
import { destinationAfterLogin } from './redirects';
import { loginSchema, type LoginValues } from './schemas';

export default function LoginPage() {
  const { t } = useTranslation('auth');
  useDocumentTitle(t('login.title'));
  const { user, login } = useAuth();
  const [params] = useSearchParams();
  const fieldError = useFieldError();
  const [serverError, setServerError] = useState<unknown>(null);
  const { register, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Signing in sets the user; this redirect then sends them on (to `next` when it is safe).
  if (user) return <Navigate to={destinationAfterLogin(user.role, params.get('next'))} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values);
    } catch (error) {
      setServerError(error);
    }
  });

  const next = params.get('next');
  const registerLink = next ? `/register?next=${encodeURIComponent(next)}` : '/register';

  return (
    <AuthCard title={t('login.title')} description={t('login.description')}>
      {params.get('expired') ? (
        <Alert variant="warning" role="status">
          <Clock aria-hidden="true" />
          <p>{t('login.expired')}</p>
        </Alert>
      ) : null}
      <ServerError error={serverError} />
      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <Field id="login-email" label={t('login.email')} error={fieldError(formState.errors.email?.message)}>
          {(control) => <Input type="email" autoComplete="email" inputMode="email" dir="ltr" {...control} {...register('email')} />}
        </Field>
        <Field id="login-password" label={t('login.password')} error={fieldError(formState.errors.password?.message)}>
          {(control) => <PasswordInput autoComplete="current-password" dir="ltr" {...control} {...register('password')} />}
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting} aria-busy={formState.isSubmitting}>
          {formState.isSubmitting ? <Spinner className="size-4" /> : null}
          {formState.isSubmitting ? t('login.submitting') : t('login.submit')}
        </Button>
        {formState.isSubmitting ? <SlowServerNote /> : null}
      </form>
      <p className="text-sm text-muted-foreground">
        {t('login.noAccount')}{' '}
        <Link to={registerLink} className="font-semibold text-primary underline underline-offset-2 hover:no-underline">
          {t('login.createAccount')}
        </Link>
      </p>
    </AuthCard>
  );
}
