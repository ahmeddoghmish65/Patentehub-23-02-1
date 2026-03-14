import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';

interface ProfileSecurityProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordMsg: string;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onChangePassword: () => void;
  fieldClass: string;
  SectionHeader: React.FC<{ icon: string; label: string }>;
}

export const ProfileSecurity = React.memo(function ProfileSecurity({
  currentPassword,
  newPassword,
  confirmPassword,
  passwordMsg,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onChangePassword,
  fieldClass,
  SectionHeader,
}: ProfileSecurityProps) {
  const { t } = useTranslation();

  const resolveMsg = (key: string) => {
    const map: Record<string, string> = {
      password_required: t('profile.password_required'),
      password_short: t('profile.password_short'),
      password_mismatch_long: t('profile.password_mismatch_long'),
      wrong_password: t('profile.wrong_password'),
      error_occurred: t('profile.error_occurred'),
      password_changed: t('profile.password_changed'),
    };
    return map[key] ?? key;
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-surface-100 space-y-3">
      <SectionHeader icon="security" label={t('profile.change_password')} />

      <div>
        <label className="text-[11px] text-surface-400 font-medium mb-1 block">
          {t('profile.current_password')}
        </label>
        <input
          type="password"
          dir="ltr"
          className={cn(fieldClass, 'text-left')}
          value={currentPassword}
          onChange={e => onCurrentPasswordChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-surface-400 font-medium mb-1 block">
            {t('profile.new_password')}
          </label>
          <input
            type="password"
            dir="ltr"
            className={cn(fieldClass, 'text-left')}
            value={newPassword}
            onChange={e => onNewPasswordChange(e.target.value)}
            placeholder={t('profile.password_min')}
          />
        </div>
        <div>
          <label className="text-[11px] text-surface-400 font-medium mb-1 block">
            {t('profile.confirm_password')}
          </label>
          <input
            type="password"
            dir="ltr"
            className={cn(
              fieldClass,
              'text-left',
              confirmPassword && newPassword !== confirmPassword ? 'border-danger-400' : '',
            )}
            value={confirmPassword}
            onChange={e => onConfirmPasswordChange(e.target.value)}
          />
        </div>
      </div>

      {confirmPassword && newPassword !== confirmPassword && (
        <p className="text-[11px] text-danger-500">{t('profile.password_mismatch')}</p>
      )}

      {passwordMsg && (
        <p className={cn('text-xs', passwordMsg === 'password_changed' ? 'text-success-600' : 'text-danger-500')}>
          {resolveMsg(passwordMsg)}
        </p>
      )}

      <Button size="sm" onClick={onChangePassword} disabled={!currentPassword || !newPassword}>
        {t('profile.change_btn')}
      </Button>
    </div>
  );
});
