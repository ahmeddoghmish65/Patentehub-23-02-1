/**
 * AuthPage — handles login, registration, and password reset.
 * Uses React Hook Form + Zod for validation and sonner for notifications.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/i18n';
import { toast } from '@/lib/toast';
import { ROUTES } from '@/constants';
import {
  loginSchema, registerSchema, resetEmailSchema, resetCodeSchema, resetPasswordSchema,
  type LoginFormValues, type RegisterFormValues,
  type ResetEmailFormValues, type ResetCodeFormValues, type ResetPasswordFormValues,
} from '@/lib/validations/auth.schemas';

interface AuthPageProps {
  mode: 'login' | 'register' | 'reset-password';
}

export function AuthPage({ mode }: AuthPageProps) {
  const { error, clearError } = useAuthStore();
  const { t, dir } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ROUTES.DASHBOARD;

  return (
    <div className="min-h-screen flex" dir={dir}>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <button onClick={() => navigate(ROUTES.LANDING)} className="flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="directions_car" size={22} className="text-white" filled />
            </div>
            <span className="text-xl font-bold text-surface-900 group-hover:text-primary-600 transition-colors">Patente Hub</span>
          </button>

          <h1 className="text-2xl font-bold text-surface-900 mb-2">
            {mode === 'reset-password' ? t('auth.reset_title') : mode === 'login' ? t('auth.login_title') : t('auth.register_title')}
          </h1>
          <p className="text-surface-500 mb-6 text-sm">
            {mode === 'reset-password' ? t('auth.reset_desc') : mode === 'login' ? t('auth.login_desc') : t('auth.register_desc')}
          </p>

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <Icon name="error" size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {mode === 'login' && <LoginForm onSuccess={() => navigate(from, { replace: true })} navigate={navigate} />}
          {mode === 'register' && <RegisterForm onSuccess={() => navigate(ROUTES.DASHBOARD, { replace: true })} navigate={navigate} />}
          {mode === 'reset-password' && <ResetPasswordFlow onSuccess={() => navigate(ROUTES.LOGIN)} navigate={navigate} />}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="relative text-center max-w-lg">
          <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-white/30">
            <Icon name="school" size={48} className="text-white" filled />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{t('auth.side_title')}</h2>
          <p className="text-primary-100 text-lg leading-relaxed">{t('auth.side_desc')}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onSuccess, navigate }: { onSuccess: () => void; navigate: ReturnType<typeof useNavigate> }) {
  const { login, isLoading, clearError, confirmationEmailSent } = useAuthStore();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    clearError();
    const success = await login(values.email, values.password);
    if (success) onSuccess();
  };

  if (confirmationEmailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <Icon name="mark_email_read" size={36} className="text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-surface-900">تحقق من بريدك الإلكتروني</h2>
        <p className="text-sm text-surface-500 leading-relaxed">
          يرجى فتح بريدك الإلكتروني والضغط على رابط التفعيل أولاً، ثم عُد وسجّل الدخول.
        </p>
        <Button fullWidth size="lg" onClick={() => clearError()}>
          حاول مرة أخرى
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label={t('auth.email')} type="email" placeholder={t('auth.placeholder_email')} icon="email" dir="ltr" className="text-left" {...register('email')} error={errors.email?.message} />
      <div className="relative">
        <Input label={t('auth.password')} type={showPassword ? 'text' : 'password'} placeholder={t('auth.placeholder_password')} icon="lock" dir="ltr" className="text-left" {...register('password')} error={errors.password?.message} />
        <button type="button" className="absolute left-3 top-9 text-surface-400 hover:text-surface-600" onClick={() => setShowPassword(v => !v)}>
          <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
        </button>
      </div>
      <Button type="submit" fullWidth size="lg" loading={isLoading}>{t('auth.login_btn')}</Button>
      <div className="text-center space-y-2">
        <button type="button" className="block w-full text-sm text-primary-600 hover:text-primary-700" onClick={() => { clearError(); navigate(ROUTES.RESET_PASSWORD); }}>
          {t('auth.forgot_password')}
        </button>
        <p className="text-surface-500 text-sm">
          {t('auth.no_account')}
          <button type="button" className="text-primary-600 font-semibold hover:text-primary-700 mx-1" onClick={() => { clearError(); navigate(ROUTES.REGISTER); }}>{t('auth.sign_up_now')}</button>
        </p>
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-surface-400 pt-1">
        <button type="button" className="hover:text-primary-600 transition-colors" onClick={() => navigate(ROUTES.PRIVACY_POLICY)}>{t('auth.privacy_link')}</button>
        <span>·</span>
        <button type="button" className="hover:text-primary-600 transition-colors" onClick={() => navigate(ROUTES.TERMS_OF_SERVICE)}>{t('auth.terms_link')}</button>
        <span>·</span>
        <button type="button" className="hover:text-primary-600 transition-colors" onClick={() => navigate(ROUTES.CONTACT)}>{t('auth.contact_link')}</button>
      </div>
    </form>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess, navigate }: { onSuccess: () => void; navigate: ReturnType<typeof useNavigate> }) {
  const { register: doRegister, checkUsername, isLoading, clearError, confirmationEmailSent } = useAuthStore();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const usernameValue = watch('username') ?? '';

  useEffect(() => {
    if (!usernameValue.trim() || usernameValue.length < 3) { setUsernameStatus('idle'); setUsernameSuggestions([]); return; }
    setUsernameStatus('checking');
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    usernameTimer.current = setTimeout(async () => {
      const result = await checkUsername(usernameValue);
      setUsernameStatus(result.available ? 'available' : 'taken');
      setUsernameSuggestions(result.suggestions ?? []);
    }, 600);
    return () => { if (usernameTimer.current) clearTimeout(usernameTimer.current); };
  }, [usernameValue, checkUsername]);

  const onSubmit = async (values: RegisterFormValues) => {
    clearError();
    if (values.username && usernameStatus === 'taken') { toast.error(t('auth.err_username_taken')); return; }
    if (values.username && usernameStatus === 'checking') { toast.error(t('auth.err_username_checking')); return; }
    const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;
    const success = await doRegister(values.email, values.password, fullName, values.username || undefined);
    if (success) { toast.success('مرحباً بك في Patente Hub!', 'تم إنشاء حسابك بنجاح'); onSuccess(); }
  };

  if (confirmationEmailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <Icon name="mark_email_read" size={36} className="text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-surface-900">تحقق من بريدك الإلكتروني</h2>
        <p className="text-sm text-surface-500 leading-relaxed">
          تم إنشاء حسابك بنجاح! أرسلنا رابط التأكيد إلى بريدك الإلكتروني.
          يرجى فتح البريد والضغط على رابط التفعيل ثم تسجيل الدخول.
        </p>
        <Button fullWidth size="lg" onClick={() => { clearError(); navigate(ROUTES.LOGIN); }}>
          الذهاب إلى تسجيل الدخول
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label={t('auth.first_name')} placeholder={t('auth.placeholder_first_name')} icon="person" {...register('firstName')} error={errors.firstName?.message} />
        <Input label={t('auth.last_name')} placeholder={t('auth.placeholder_last_name')} {...register('lastName')} error={errors.lastName?.message} />
      </div>
      <div>
        <Input label={t('auth.username')} placeholder={t('auth.placeholder_username')} icon="alternate_email" dir="ltr" className="text-left"
          {...register('username', { onChange: e => setValue('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '')) })}
          error={errors.username?.message} />
        {usernameValue.trim().length >= 3 && (
          <div className="mt-1">
            {usernameStatus === 'checking' && <p className="text-xs text-surface-400 flex items-center gap-1"><span className="inline-block w-3 h-3 border-2 border-surface-300 border-t-primary-500 rounded-full animate-spin" />{t('auth.username_checking')}</p>}
            {usernameStatus === 'available' && <p className="text-xs text-green-600 flex items-center gap-1"><Icon name="check_circle" size={14} filled /> {t('auth.username_available')}</p>}
            {usernameStatus === 'taken' && (
              <div>
                <p className="text-xs text-danger-600 flex items-center gap-1 mb-1"><Icon name="cancel" size={14} filled /> {t('auth.username_taken')}</p>
                {usernameSuggestions.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-surface-400">{t('auth.username_suggestions')}</span>
                    {usernameSuggestions.map(s => (
                      <button key={s} type="button" className="text-[10px] bg-primary-50 text-primary-600 border border-primary-200 px-2 py-0.5 rounded-full hover:bg-primary-100 transition-colors font-mono" onClick={() => setValue('username', s)}>@{s}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <p className="text-[10px] text-surface-400 mt-1">{t('auth.username_hint')}</p>
      </div>
      <Input label={`${t('auth.email')} *`} type="email" placeholder={t('auth.placeholder_email')} icon="email" dir="ltr" className="text-left" {...register('email')} error={errors.email?.message} />
      <div className="relative">
        <Input label={`${t('auth.password')} *`} type={showPassword ? 'text' : 'password'} placeholder={t('auth.placeholder_password_min')} icon="lock" dir="ltr" className="text-left" {...register('password')} error={errors.password?.message} />
        <button type="button" className="absolute left-3 top-9 text-surface-400 hover:text-surface-600" onClick={() => setShowPassword(v => !v)}>
          <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
        </button>
      </div>
      <Input label={t('auth.confirm_password')} type="password" placeholder={t('auth.placeholder_confirm_password')} icon="lock" dir="ltr" className="text-left" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
      <Button type="submit" fullWidth size="lg" loading={isLoading}>{t('auth.register_btn')}</Button>
      <p className="text-center text-surface-500 text-sm">
        {t('auth.have_account')}
        <button type="button" className="text-primary-600 font-semibold hover:text-primary-700 mx-1" onClick={() => { clearError(); navigate(ROUTES.LOGIN); }}>{t('auth.sign_in')}</button>
      </p>
      <p className="text-center text-surface-400 text-xs leading-relaxed">
        {t('auth.by_registering')}{' '}
        <button type="button" className="text-primary-600 hover:underline" onClick={() => navigate(ROUTES.TERMS_OF_SERVICE)}>{t('auth.terms')}</button>
        {' '}{t('auth.and')}{' '}
        <button type="button" className="text-primary-600 hover:underline" onClick={() => navigate(ROUTES.PRIVACY_POLICY)}>{t('auth.privacy')}</button>
      </p>
    </form>
  );
}

// ─── Reset Password Flow ──────────────────────────────────────────────────────

type ResetStep = 'email' | 'code' | 'newpass' | 'done';

function ResetPasswordFlow({ onSuccess, navigate }: { onSuccess: () => void; navigate: ReturnType<typeof useNavigate> }) {
  const { resetPassword, clearError } = useAuthStore();
  const { t } = useTranslation();
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const emailForm = useForm<ResetEmailFormValues>({ resolver: zodResolver(resetEmailSchema) });
  const codeForm = useForm<ResetCodeFormValues>({ resolver: zodResolver(resetCodeSchema) });
  const passwordForm = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const handleEmailSubmit = async (values: ResetEmailFormValues) => {
    clearError();
    const { getDB } = await import('@/db/database');
    const db = await getDB();
    const all = await db.getAll('users');
    const found = all.find((u: { email: string }) => u.email.toLowerCase() === values.email.toLowerCase());
    if (!found) { emailForm.setError('email', { message: t('auth.err_email_not_found') }); return; }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem(`reset_code_${values.email}`, JSON.stringify({ code, expiry: Date.now() + 600000 }));
    setGeneratedCode(code);
    setEmail(values.email);
    setStep('code');
  };

  const handleCodeSubmit = (values: ResetCodeFormValues) => {
    clearError();
    try {
      const stored = JSON.parse(localStorage.getItem(`reset_code_${email}`) ?? '{}');
      if (!stored.code) { codeForm.setError('code', { message: t('auth.err_code_expired') }); return; }
      if (Date.now() > stored.expiry) { localStorage.removeItem(`reset_code_${email}`); codeForm.setError('code', { message: t('auth.err_code_expired_10') }); return; }
      if (values.code !== stored.code) { codeForm.setError('code', { message: t('auth.err_code_wrong') }); return; }
    } catch { codeForm.setError('code', { message: t('auth.err_verify') }); return; }
    setStep('newpass');
  };

  const handlePasswordSubmit = async (values: ResetPasswordFormValues) => {
    clearError();
    const ok = await resetPassword(email, values.newPassword);
    if (ok) { localStorage.removeItem(`reset_code_${email}`); setStep('done'); }
    else { passwordForm.setError('newPassword', { message: t('auth.err_try_again') }); }
  };

  const stepIndex = ['email', 'code', 'newpass'].indexOf(step);

  return (
    <div className="space-y-4">
      {step !== 'done' && (
        <div className="flex items-center justify-center gap-2 mb-4">
          {['email', 'code', 'newpass'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? 'bg-primary-500 text-white' : stepIndex > i || step === 'done' ? 'bg-success-500 text-white' : 'bg-surface-200 text-surface-500'}`}>
                {stepIndex > i || step === 'done' ? '✓' : i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${stepIndex > i ? 'bg-success-500' : 'bg-surface-200'}`} />}
            </div>
          ))}
        </div>
      )}

      {step === 'email' && (
        <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
          <p className="text-sm text-surface-600 text-center">{t('auth.enter_email')}</p>
          <Input label={t('auth.email')} type="email" placeholder={t('auth.placeholder_email')} icon="email" dir="ltr" className="text-left" {...emailForm.register('email')} error={emailForm.formState.errors.email?.message} />
          <Button type="submit" fullWidth size="lg">{t('auth.send_code')}</Button>
          <p className="text-center text-surface-500 text-sm">{t('auth.remember_password')}<button type="button" className="text-primary-600 font-semibold mx-1" onClick={() => navigate(ROUTES.LOGIN)}>{t('auth.sign_in')}</button></p>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={codeForm.handleSubmit(handleCodeSubmit)} className="space-y-4">
          <div className="bg-primary-50 rounded-xl p-5 border border-primary-100 text-center">
            <Icon name="lock_clock" size={32} className="text-primary-500 mx-auto mb-2" filled />
            <p className="text-sm text-primary-700 font-bold mb-1">{t('auth.your_code')}</p>
            <div className="text-3xl font-mono font-black text-primary-700 tracking-[0.3em] bg-white rounded-xl py-3 px-4 border-2 border-primary-200 inline-block mt-1 select-all">{generatedCode}</div>
            <p className="text-[11px] text-primary-400 mt-2">{t('auth.code_valid')}</p>
          </div>
          <Input label={t('auth.enter_code')} placeholder={t('auth.placeholder_code')} icon="pin" dir="ltr" className="text-left text-center tracking-widest" {...codeForm.register('code')} error={codeForm.formState.errors.code?.message} />
          <Button type="submit" fullWidth size="lg">{t('auth.verify_continue')}</Button>
          <p className="text-center text-surface-500 text-sm">{t('auth.remember_password')}<button type="button" className="text-primary-600 font-semibold mx-1" onClick={() => navigate(ROUTES.LOGIN)}>{t('auth.sign_in')}</button></p>
        </form>
      )}

      {step === 'newpass' && (
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
          <p className="text-sm text-surface-600 text-center">{t('auth.enter_new_password')}</p>
          <Input label={t('auth.new_password')} type="password" placeholder={t('auth.placeholder_new_password')} icon="lock" dir="ltr" className="text-left" {...passwordForm.register('newPassword')} error={passwordForm.formState.errors.newPassword?.message} />
          <Input label={t('auth.confirm_new_password')} type="password" placeholder={t('auth.placeholder_confirm_new_password')} icon="lock" dir="ltr" className="text-left" {...passwordForm.register('confirmNewPassword')} error={passwordForm.formState.errors.confirmNewPassword?.message} />
          <Button type="submit" fullWidth size="lg">{t('auth.set_new_password')}</Button>
          <p className="text-center text-surface-500 text-sm">{t('auth.remember_password')}<button type="button" className="text-primary-600 font-semibold mx-1" onClick={() => navigate(ROUTES.LOGIN)}>{t('auth.sign_in')}</button></p>
        </form>
      )}

      {step === 'done' && (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-success-50 rounded-full flex items-center justify-center">
            <Icon name="check_circle" size={48} className="text-success-500" filled />
          </div>
          <h3 className="text-lg font-bold text-surface-900">{t('auth.done_title')}</h3>
          <p className="text-sm text-surface-500">{t('auth.done_desc')}</p>
          <Button fullWidth onClick={onSuccess}>{t('auth.login_btn')}</Button>
        </div>
      )}
    </div>
  );
}
