import React, { useCallback } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import type { User as FullUser } from '@/shared/types';

type User = Omit<FullUser, 'password'>;
import { useAuthStore } from '@/store';
import type { ProfileEditForm as EditForm, UsernameStatus } from '../types/profile.types';
import { getDaysLeftOnCooldown } from '../utils/profileUtils';
import { ProfileAvatarUpload } from './ProfileAvatarUpload';
import { ProvinceSelect, PhoneCodeSelect } from './ProfileLocationSelect';
import { ProfileSecurity } from './ProfileSecurity';
import { usePasswordChange } from '../hooks/usePasswordChange';

const FIELD_CLASS =
  'w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 transition-colors';

const SectionHeader = ({ icon, label }: { icon: string; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
      <Icon name={icon} size={15} className="text-primary-500" />
    </div>
    <h3 className="text-sm font-bold text-surface-800">{label}</h3>
  </div>
);

interface ProfileEditFormProps {
  user: User;
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  changeDates: { name?: string; username?: string };
  usernameStatus: UsernameStatus;
  phoneError: string;
  saveMsg: string;
  onUsernameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onSave: () => void;
  onBack: () => void;
}

export const ProfileEditForm = React.memo(function ProfileEditForm({
  user,
  editForm,
  setEditForm,
  changeDates,
  usernameStatus,
  phoneError,
  saveMsg,
  onUsernameChange,
  onPhoneChange,
  onSave,
  onBack,
}: ProfileEditFormProps) {
  const { t } = useTranslation();
  const { updateProfile } = useAuthStore();

  const {
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    passwordMsg,
    handleChangePassword,
  } = usePasswordChange(user.id);

  const handleAvatarChange = useCallback(
    (dataUrl: string) => updateProfile({ avatar: dataUrl }),
    [updateProfile],
  );
  const handleAvatarDelete = useCallback(
    () => updateProfile({ avatar: '' }),
    [updateProfile],
  );

  const nameDaysLeft = getDaysLeftOnCooldown(changeDates.name);
  const usernameDaysLeft = getDaysLeftOnCooldown(changeDates.username);

  const resolveMsg = (key: string) => {
    const map: Record<string, string> = {
      saved: t('profile.changes_saved'),
      username_taken: `❌ ${t('profile.username_taken')}`,
      username_invalid: `❌ ${t('profile.username_invalid')}`,
      phone_invalid_long: t('profile.phone_invalid_long'),
    };
    if (key.startsWith('name_cooldown:')) {
      const days = key.split(':')[1];
      return `${t('profile.name_cooldown')} ${days} ${t('profile.name_cooldown_days')}`;
    }
    if (key.startsWith('username_cooldown:')) {
      const days = key.split(':')[1];
      return `${t('profile.username_cooldown')} ${days} ${t('profile.username_cooldown_days')}`;
    }
    return map[key] ?? key;
  };

  return (
    <div className="max-w-lg mx-auto pb-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-surface-50 -mx-1 px-1 pb-3 pt-1">
        <div className="bg-white rounded-2xl border border-surface-100 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-surface-100 hover:bg-surface-200 flex items-center justify-center transition-colors shrink-0"
          >
            <Icon name="arrow_forward" size={20} className="text-surface-600 ltr:rotate-180" />
          </button>
          <h2 className="text-base font-bold text-surface-900 flex-1">{t('profile.edit_title')}</h2>
          {saveMsg && (
            <span className={cn(
              'text-xs font-semibold px-3 py-1 rounded-lg',
              saveMsg === 'saved' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600',
            )}>
              {resolveMsg(saveMsg)}
            </span>
          )}
          <Button size="sm" onClick={onSave} className="shrink-0">
            <Icon name="save" size={15} className="ml-1" /> {t('profile.save')}
          </Button>
        </div>
      </div>

      {/* Avatar banner */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 flex items-center gap-4 mb-4">
        <ProfileAvatarUpload
          avatar={user.avatar}
          name={user.name}
          onAvatarChange={handleAvatarChange}
          onAvatarDelete={handleAvatarDelete}
          onFileTooLarge={() => alert(t('profile.photo_too_large'))}
          editVariant
        />
        <div className="min-w-0">
          <p className="text-white font-bold text-base truncate">{user.name}</p>
          {user.username && <p className="text-white/70 text-sm">@{user.username}</p>}
          <p className="text-white/60 text-xs mt-1">{t('profile.tap_camera')}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Personal info */}
        <div className="bg-white rounded-2xl p-4 border border-surface-100 space-y-3">
          <SectionHeader icon="person" label={t('profile.personal_info')} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.first_name')}</label>
              <input
                className={FIELD_CLASS}
                value={editForm.firstName}
                onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.last_name')}</label>
              <input
                className={FIELD_CLASS}
                value={editForm.lastName}
                onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
              />
            </div>
          </div>

          {nameDaysLeft !== null && (
            <p className="text-[11px] text-warning-600 bg-warning-50 rounded-lg px-3 py-1.5 flex items-center gap-1">
              <Icon name="schedule" size={12} />
              {t('profile.name_cooldown')} {nameDaysLeft} {t('profile.name_cooldown_days')}
            </p>
          )}

          {/* Username */}
          <div>
            <label className="text-[11px] text-surface-400 font-medium mb-1 block">
              {t('profile.username_label')}
            </label>
            <div className="relative">
              <input
                className={cn(
                  FIELD_CLASS, 'pl-8',
                  usernameStatus === 'taken'  ? 'border-danger-400 bg-danger-50'  : '',
                  usernameStatus === 'ok'     ? 'border-success-400'               : '',
                )}
                dir="ltr"
                value={editForm.username}
                onChange={e => onUsernameChange(e.target.value)}
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Icon name="refresh"      size={15} className="text-surface-400 animate-spin" />}
                {usernameStatus === 'ok'       && <Icon name="check_circle" size={15} className="text-success-500" filled />}
                {usernameStatus === 'taken'    && <Icon name="cancel"       size={15} className="text-danger-500"  filled />}
                {usernameStatus === 'invalid'  && <Icon name="error"        size={15} className="text-warning-500" filled />}
              </span>
            </div>
            {usernameStatus === 'taken'   && <p className="text-[11px] text-danger-500  mt-1">{t('profile.username_taken')}</p>}
            {usernameStatus === 'invalid' && <p className="text-[11px] text-warning-500 mt-1">{t('profile.username_invalid')}</p>}
            {usernameStatus === 'ok'      && <p className="text-[11px] text-success-500 mt-1">{t('profile.username_available')}</p>}
            {usernameDaysLeft !== null && (
              <p className="text-[11px] text-warning-600 bg-warning-50 rounded-lg px-3 py-1.5 flex items-center gap-1 mt-1">
                <Icon name="schedule" size={12} />
                {t('profile.username_cooldown')} {usernameDaysLeft} {t('profile.username_cooldown_days')}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.bio_label')}</label>
            <textarea
              className={cn(FIELD_CLASS, 'resize-none')}
              rows={2}
              value={editForm.bio}
              onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
              maxLength={150}
              placeholder={t('profile.bio_placeholder')}
            />
            <span className="text-[10px] text-surface-400">{editForm.bio.length}/150</span>
          </div>

          {/* Birth date + gender */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.birth_date')}</label>
              <input
                type="date"
                className={FIELD_CLASS}
                style={{ boxSizing: 'border-box' }}
                value={editForm.birthDate}
                onChange={e => setEditForm(f => ({ ...f, birthDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.gender')}</label>
              <div className="flex gap-1.5 h-[42px]">
                {[{ value: 'male', label: t('profile.male') }, { value: 'female', label: t('profile.female') }].map(g => (
                  <button
                    key={g.value}
                    className={cn(
                      'flex-1 rounded-xl border-2 text-xs font-semibold transition-all',
                      editForm.gender === g.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-surface-200 text-surface-500 hover:border-surface-300',
                    )}
                    onClick={() => setEditForm(f => ({ ...f, gender: g.value }))}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-2xl p-4 border border-surface-100 space-y-3">
          <SectionHeader icon="contact_mail" label={t('profile.contact_info')} />

          <div>
            <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.email_label')}</label>
            <input
              type="email"
              dir="ltr"
              className={cn(FIELD_CLASS, 'text-left')}
              value={editForm.email}
              onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.phone_label')}</label>
            <div className="flex gap-2">
              <PhoneCodeSelect
                className="w-28 border border-surface-200 rounded-xl px-2 py-2.5 text-sm shrink-0 focus:outline-none focus:border-primary-400"
                value={editForm.phoneCode}
                onChange={v => setEditForm(f => ({ ...f, phoneCode: v }))}
              />
              <input
                type="tel"
                dir="ltr"
                className={cn(FIELD_CLASS, 'flex-1 text-left', phoneError ? 'border-danger-400 bg-danger-50' : '')}
                value={editForm.phone}
                onChange={e => onPhoneChange(e.target.value)}
                placeholder="1234567890"
              />
            </div>
            {phoneError && (
              <p className="text-[11px] text-danger-500 mt-1">{t('profile.phone_invalid')}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.province_label')}</label>
              <ProvinceSelect
                className={FIELD_CLASS}
                value={editForm.province}
                onChange={v => setEditForm(f => ({ ...f, province: v }))}
                placeholder={t('profile.select_province')}
              />
            </div>
            <div>
              <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.italian_level')}</label>
              <select
                className={FIELD_CLASS}
                value={editForm.italianLevel}
                onChange={e => setEditForm(f => ({ ...f, italianLevel: e.target.value }))}
              >
                <option value="">{t('profile.select_level')}</option>
                <option value="weak">{t('profile.level_weak')}</option>
                <option value="good">{t('profile.level_good')}</option>
                <option value="very_good">{t('profile.level_very_good')}</option>
                <option value="native">{t('profile.level_native_edit')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl p-4 border border-surface-100">
          <SectionHeader icon="lock" label={t('profile.privacy_label')} />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-700 font-medium">{t('profile.hide_stats')}</p>
              <p className="text-xs text-surface-400 mt-0.5">{t('profile.hide_stats_desc')}</p>
            </div>
            <button
              className={cn(
                'w-11 h-6 rounded-full transition-colors relative shrink-0',
                editForm.privacyHideStats ? 'bg-primary-500' : 'bg-surface-200',
              )}
              onClick={() => setEditForm(f => ({ ...f, privacyHideStats: !f.privacyHideStats }))}
            >
              <div
                className={cn(
                  'rounded-full bg-white shadow-sm absolute top-[3px] transition-all w-[18px] h-[18px]',
                  editForm.privacyHideStats ? 'left-[3px]' : 'left-[23px]',
                )}
              />
            </button>
          </div>
        </div>

        {/* Password */}
        <ProfileSecurity
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          passwordMsg={passwordMsg}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onChangePassword={handleChangePassword}
          fieldClass={FIELD_CLASS}
          SectionHeader={SectionHeader}
        />
      </div>
    </div>
  );
});
