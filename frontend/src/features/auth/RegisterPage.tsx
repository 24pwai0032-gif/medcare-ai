import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useSearchParams } from 'react-router';
import { Field, PasswordInput } from '@/components/Field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/feedback';
import { Input } from '@/components/ui/input';
import { RadioCard, RadioGroup } from '@/components/ui/radio-group';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useAuth } from './authContext';
import { AuthCard, ServerError, useFieldError } from './AuthCard';
import { destinationAfterLogin } from './redirects';
import { registerSchema, type RegisterValues } from './schemas';

export default function RegisterPage() {
  const { t } = useTranslation('auth');
  useDocumentTitle(t('register.title'));
  const { user, register: createAccount } = useAuth();
  const [params] = useSearchParams();
  const fieldError = useFieldError();
  const [serverError, setServerError] = useState<unknown>(null);
  const { register, control, handleSubmit, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', role: 'patient', pmdc: '' },
  });
  const role = useWatch({ control, name: 'role' });

  if (user) return <Navigate to={destinationAfterLogin(user.role, params.get('next'))} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await createAccount({
        full_name: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
        pmdc: values.role === 'doctor' ? values.pmdc : undefined,
      });
    } catch (error) {
      setServerError(error);
    }
  });

  return (
    <AuthCard title={t('register.title')} description={t('register.description')}>
      <ServerError error={serverError} />
      <form noValidate onSubmit={onSubmit} className="space-y-5">
        <Field id="reg-name" label={t('register.fullName')} error={fieldError(formState.errors.fullName?.message)}>
          {(c) => <Input autoComplete="name" {...c} {...register('fullName')} />}
        </Field>
        <Field id="reg-email" label={t('register.email')} error={fieldError(formState.errors.email?.message)}>
          {(c) => <Input type="email" autoComplete="email" inputMode="email" dir="ltr" {...c} {...register('email')} />}
        </Field>
        <Field
          id="reg-password"
          label={t('register.password')}
          hint={t('register.passwordHint')}
          error={fieldError(formState.errors.password?.message)}
        >
          {(c) => <PasswordInput autoComplete="new-password" dir="ltr" {...c} {...register('password')} />}
        </Field>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-semibold">{t('register.role')}</legend>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="sm:grid-cols-2">
                <RadioCard id="reg-role-patient" value="patient" description={t('register.patientHint')}>
                  {t('register.patient')}
                </RadioCard>
                <RadioCard id="reg-role-doctor" value="doctor" description={t('register.doctorHint')}>
                  {t('register.doctor')}
                </RadioCard>
              </RadioGroup>
            )}
          />
        </fieldset>
        {role === 'doctor' ? (
          <Field
            id="reg-pmdc"
            label={t('register.pmdc')}
            hint={t('register.pmdcHint')}
            error={fieldError(formState.errors.pmdc?.message)}
          >
            {(c) => <Input dir="ltr" {...c} {...register('pmdc')} />}
          </Field>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting} aria-busy={formState.isSubmitting}>
          {formState.isSubmitting ? <Spinner className="size-4" /> : null}
          {formState.isSubmitting ? t('register.submitting') : t('register.submit')}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        {t('register.haveAccount')}{' '}
        <Link to="/login" className="font-semibold text-primary underline underline-offset-2 hover:no-underline">
          {t('register.signIn')}
        </Link>
      </p>
    </AuthCard>
  );
}
