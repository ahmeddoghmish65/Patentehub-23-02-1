import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocaleNavigate } from '@/shared/hooks/useLocaleNavigate';
import { useAuthStore, useDataStore } from '@/store';
import { ROUTES } from '@/shared/constants';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { saveCompleteProfile } from './services/profileService';
import { useProfile } from './hooks/useProfile';
import { useUpdateProfile } from './hooks/useUpdateProfile';
import { useExamReadiness } from './hooks/useExamReadiness';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileStats } from './components/ProfileStats';
import { ProfileExamReadiness } from './components/ProfileExamReadiness';
import { ProfileEditForm } from './components/ProfileEditForm';
import { ProvinceSelect, PhoneCodeSelect } from './components/ProfileLocationSelect';
import type { ActiveStatView, CompleteProfileForm } from './types/profile.types';

const DEFAULT_COMPLETE_FORM: CompleteProfileForm = {
  birthDate: '', country: 'Italia', province: '',
  gender: '', phoneCode: '+39', phone: '', italianLevel: '',
};

const BADGE_DEFS = (t: (k: string) => string) => [
  { id: 'newcomer',     name: t('profile.badge_newcomer'),    desc: t('profile.badge_newcomer_desc'),    icon: 'waving_hand',          color: 'bg-blue-500' },
  { id: 'quiz_master',  name: t('profile.badge_quiz_master'), desc: t('profile.badge_quiz_master_desc'), icon: 'quiz',                 color: 'bg-purple-500' },
  { id: 'perfect_score',name: t('profile.badge_perfect'),     desc: t('profile.badge_perfect_desc'),     icon: 'star',                 color: 'bg-yellow-500' },
  { id: 'week_streak',  name: t('profile.badge_week_streak'), desc: t('profile.badge_week_streak_desc'), icon: 'local_fire_department', color: 'bg-orange-500' },
  { id: 'level_5',      name: t('profile.badge_level5'),      desc: t('profile.badge_level5_desc'),      icon: 'military_tech',        color: 'bg-green-500' },
];

export function ProfilePage() {
  const { navigate } = useLocaleNavigate();
  const rawNavigate = useNavigate();
  const { pathname } = useLocation();
  const { t, uiLang, setUiLang } = useTranslation();
  const { user, logout, updateSettings } = useAuthStore();
  const { posts, mistakes, questions, quizHistory, lessons } = useDataStore();

  // ─── hooks ──────────────────────────────────────────────────────────────────
  const {
    followerCount, followingCount,
    followersList, followingList,
    myFollowing, toggleFollowUser,
  } = useProfile();

  const {
    editForm, setEditForm,
    changeDates, usernameStatus, phoneError, saveMsg, setSaveMsg,
    openEditPage, handleUsernameChange, handlePhoneChange, handleSaveEdit,
  } = useUpdateProfile();

  const readiness = useExamReadiness({ quizHistory, mistakes, progress: user?.progress ?? {} as never, lessons, questions });

  // ─── local UI state ──────────────────────────────────────────────────────────
  const [showEditPage, setShowEditPage] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeStatView, setActiveStatView] = useState<ActiveStatView>(null);
  const [openBadgeId, setOpenBadgeId] = useState<string | null>(null);
  const [completeForm, setCompleteForm] = useState<CompleteProfileForm>(DEFAULT_COMPLETE_FORM);
  const [profilePhoneError, setProfilePhoneError] = useState('');

  const handleLogout = useCallback(async () => { await logout(); navigate(ROUTES.LANDING); }, [logout, navigate]);

  const handleOpenEditPage = useCallback(async () => {
    await openEditPage();
    setShowEditPage(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [openEditPage]);

  const handleSave = useCallback(async () => {
    const ok = await handleSaveEdit();
    if (ok) setTimeout(() => { setSaveMsg(''); setShowEditPage(false); window.location.reload(); }, 1500);
  }, [handleSaveEdit, setSaveMsg]);

  const handleSaveCompleteProfile = useCallback(async () => {
    if (!user) return;
    const { birthDate, province, gender, phone, italianLevel } = completeForm;
    if (!birthDate || !province || !gender || !phone || !italianLevel) {
      alert(t('profile.fill_required'));
      return;
    }
    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length < 7 || rawPhone.length > 15) {
      setProfilePhoneError(t('profile.phone_invalid_long'));
      return;
    }
    setProfilePhoneError('');
    const result = await saveCompleteProfile(user.id, completeForm);
    if (result.ok) { setShowCompleteProfile(false); window.location.reload(); }
  }, [user, completeForm, t]);

  if (!user) return null;

  const { progress, settings } = user;
  const storedBio = user.bio || localStorage.getItem(`bio_${user.id}`) || '';
  const isAdmin = user.role === 'admin' || user.role === 'manager';
  const postsCount   = posts.filter(p => p.userId === user.id && p.type === 'post').length;
  const quizzesCount = posts.filter(p => p.userId === user.id && p.type === 'quiz').length;
  const allBadges = BADGE_DEFS(t);

  const languageOptions = [
    { value: 'it'   as const, label: 'Solo italiano',         comingSoon: false },
    { value: 'both' as const, label: 'العربية + Italiano',    comingSoon: false },
    { value: 'en_it'as const, label: 'English + Italiano',    comingSoon: true  },
  ];

  const completedFields = [
    completeForm.birthDate, completeForm.province,
    completeForm.gender, completeForm.phone, completeForm.italianLevel,
  ].filter(Boolean).length;

  // ─── Edit page ────────────────────────────────────────────────────────────────
  if (showEditPage) {
    return (
      <ProfileEditForm
        user={user}
        editForm={editForm}
        setEditForm={setEditForm}
        changeDates={changeDates}
        usernameStatus={usernameStatus}
        phoneError={phoneError}
        saveMsg={saveMsg}
        onUsernameChange={handleUsernameChange}
        onPhoneChange={handlePhoneChange}
        onSave={handleSave}
        onBack={() => { setShowEditPage(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}
      />
    );
  }

  // ─── Main profile page ────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header: avatar, name, stats row */}
      <ProfileHeader
        user={user}
        followerCount={followerCount}
        followingCount={followingCount}
        postsCount={postsCount}
        quizzesCount={quizzesCount}
        onStatClick={setActiveStatView}
        onCompleteProfileClick={() => setShowCompleteProfile(true)}
        storedBio={storedBio}
      />

      {/* Stats modal */}
      <ProfileStats
        activeStatView={activeStatView}
        onClose={() => setActiveStatView(null)}
        posts={posts}
        userId={user.id}
        followersList={followersList}
        followingList={followingList}
        myFollowing={myFollowing}
        onToggleFollow={toggleFollowUser}
      />

      {/* Exam readiness + metrics */}
      <ProfileExamReadiness readiness={readiness} progress={progress} mistakes={mistakes} />

      {/* Badges */}
      <div className="bg-white dark:bg-surface-100 rounded-xl p-5 border border-surface-100">
        <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
          <Icon name="emoji_events" size={20} className="text-orange-500" />
          {t('profile.achievements')} ({progress.badges.length}/{allBadges.length})
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {allBadges.map(badge => {
            const isEarned = progress.badges.includes(badge.id);
            const isOpen = openBadgeId === badge.id;
            return (
              <button
                key={badge.id}
                onClick={() => setOpenBadgeId(isOpen ? null : badge.id)}
                className={cn(
                  'rounded-xl p-2 text-center transition-all duration-200 w-full',
                  isEarned ? 'opacity-100' : 'opacity-30',
                  isOpen ? 'bg-surface-50 ring-2 ring-primary-200 dark:ring-primary-800' : 'hover:bg-surface-50',
                )}
              >
                <div className={cn('w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-1', isEarned ? badge.color : 'bg-surface-200')}>
                  <Icon name={badge.icon} size={20} className={isEarned ? 'text-white' : 'text-surface-400'} filled />
                </div>
                <p className="text-[10px] font-semibold text-surface-700 leading-tight">{badge.name}</p>
              </button>
            );
          })}
        </div>
        {openBadgeId && (() => {
          const badge = allBadges.find(b => b.id === openBadgeId);
          if (!badge) return null;
          const isEarned = progress.badges.includes(badge.id);
          return (
            <div className={cn('mt-3 p-3 rounded-xl border flex items-start gap-3', isEarned ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800/50' : 'bg-surface-50 border-surface-100')}>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', isEarned ? badge.color : 'bg-surface-200')}>
                <Icon name={badge.icon} size={16} className={isEarned ? 'text-white' : 'text-surface-400'} filled />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-bold mb-0.5', isEarned ? 'text-primary-700 dark:text-primary-300' : 'text-surface-600')}>{badge.name}</p>
                <p className="text-[11px] text-surface-600 leading-relaxed">{badge.desc}</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Account Management */}
      <div className="bg-white dark:bg-surface-100 rounded-xl border border-surface-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100">
          <h2 className="font-bold text-surface-900 flex items-center gap-2">
            <Icon name="manage_accounts" size={20} className="text-surface-500" />
            {t('profile.account_management')}
          </h2>
        </div>

        <button className="w-full px-5 py-4 flex items-center gap-3 hover:bg-surface-50 dark:hover:bg-surface-200 transition-colors border-b border-surface-50 dark:border-surface-200 group" onClick={handleOpenEditPage}>
          <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors shrink-0">
            <Icon name="edit" size={18} className="text-primary-500" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold text-surface-800">{t('profile.edit_account_btn')}</p>
            <p className="text-xs text-surface-400">{t('profile.edit_account_desc')}</p>
          </div>
          <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors ltr:rotate-180" />
        </button>

        <button className="w-full px-5 py-4 flex items-center gap-3 hover:bg-surface-50 dark:hover:bg-surface-200 transition-colors border-b border-surface-50 dark:border-surface-200 group" onClick={() => setShowTranslation(true)}>
          <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors shrink-0">
            <Icon name="language" size={18} className="text-primary-500" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold text-surface-800">{t('profile.translation_btn')}</p>
            <p className="text-xs text-surface-400">{t('profile.translation_btn_desc')}</p>
          </div>
          <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors ltr:rotate-180" />
        </button>

        {/* Theme setting */}
        <div className="px-5 py-4 border-b border-surface-50 dark:border-surface-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Icon name="brightness_auto" size={18} className="text-primary-500" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-semibold text-surface-800">{t('profile.theme_btn')}</p>
              <p className="text-xs text-surface-400">{t('profile.theme_btn_desc')}</p>
            </div>
          </div>
          <ThemeToggle variant="full" className="w-full justify-center" />
        </div>

        {isAdmin && (
          <button className="w-full px-5 py-4 flex items-center gap-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors border-b border-surface-50 dark:border-surface-200 group" onClick={() => navigate(ROUTES.ADMIN)}>
            <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Icon name="admin_panel_settings" size={18} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-semibold text-surface-800">{t('profile.admin_panel')}</p>
              <p className="text-xs text-surface-400">{t('profile.admin_desc')}</p>
            </div>
            <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors ltr:rotate-180" />
          </button>
        )}

        <div className="px-5 py-3 space-y-1">
          <div className="flex justify-between text-sm py-1.5 border-b border-surface-50">
            <span className="text-surface-500">{t('profile.join_date')}</span>
            <span className="text-surface-700">{new Date(user.createdAt).toLocaleDateString(uiLang === 'it' ? 'it' : 'ar')}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5 border-b border-surface-50">
            <span className="text-surface-500">{t('profile.last_login')}</span>
            <span className="text-surface-700">{new Date(user.lastLogin).toLocaleDateString('ar')}</span>
          </div>
          <div className="flex justify-between text-sm py-1.5">
            <span className="text-surface-500">{t('profile.account_type')}</span>
            <span className="text-primary-600 font-medium">
              {user.role === 'admin' ? t('profile.role_admin') : user.role === 'manager' ? t('profile.role_manager') : t('profile.role_user')}
            </span>
          </div>
        </div>

        {!user.profileComplete && (
          <div className="px-5 pb-3">
            <button
              className="w-full bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400 rounded-lg py-2.5 text-sm font-medium border border-warning-200 dark:border-warning-800/40 hover:bg-warning-100 dark:hover:bg-warning-900/30"
              onClick={() => setShowCompleteProfile(true)}
            >
              {t('profile.complete_profile_btn')}
            </button>
          </div>
        )}

        <div className="px-5 py-4 border-t border-surface-100">
          <button
            className="w-full flex items-center justify-center gap-2 bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-500 rounded-xl py-3 text-sm font-semibold hover:bg-danger-50 dark:hover:bg-danger-500/20 transition-colors border border-danger-600/20 dark:border-danger-500/30"
            onClick={handleLogout}
          >
            <Icon name="logout" size={18} /> {t('profile.logout')}
          </button>
        </div>
      </div>

      {/* Translation Modal */}
      {showTranslation && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowTranslation(false)}>
          <div className="bg-white dark:bg-surface-100 rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
              <h3 className="font-bold text-surface-900 flex items-center gap-2">
                <Icon name="language" size={18} className="text-primary-500" />
                {t('profile.translation_btn')}
              </h3>
              <button className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors" onClick={() => setShowTranslation(false)}>
                <Icon name="close" size={18} className="text-surface-400" />
              </button>
            </div>
            <div className="p-4 space-y-5">
              {/* UI Language */}
              <div>
                <p className="text-sm font-semibold text-surface-800 mb-1 flex items-center gap-2">
                  <Icon name="language" size={15} className="text-primary-500" />
                  {t('profile.ui_language_label')}
                </p>
                <p className="text-xs text-surface-400 mb-3">{t('profile.ui_language_desc')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['ar', 'it', 'en'] as const).map(l => (
                    <button
                      key={l}
                      className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all', uiLang === l ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-surface-100 dark:border-surface-700 hover:border-surface-200 dark:hover:border-surface-600')}
                      onClick={() => {
                        setUiLang(l);
                        const pathWithoutLang = pathname.replace(`/${uiLang}`, '') || '';
                        rawNavigate(`/${l}${pathWithoutLang}`, { replace: true });
                      }}
                    >
                      {l === 'ar' && <span className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-lg font-bold text-orange-600 dark:text-orange-400">ع</span>}
                      {l === 'it' && <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400" dir="ltr">IT</span>}
                      {l === 'en' && <span className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400" dir="ltr">EN</span>}
                      <span className={cn('text-xs font-medium text-center', uiLang === l ? 'text-primary-700' : 'text-surface-600')}>
                        {t(`profile.ui_lang_${l}`)}
                      </span>
                      {uiLang === l && <Icon name="check_circle" size={16} className="text-primary-500" filled />}
                    </button>
                  ))}
                </div>
              </div>
              {/* Content Language */}
              <div>
                <p className="text-sm font-semibold text-surface-800 mb-1 flex items-center gap-2">
                  <Icon name="translate" size={15} className="text-primary-500" />
                  {t('profile.content_language')}
                </p>
                <p className="text-xs text-surface-400 mb-3">{t('profile.content_language_desc')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {languageOptions.map(opt => (
                    <button
                      key={opt.value}
                      disabled={opt.comingSoon}
                      className={cn(
                        'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                        opt.comingSoon ? 'border-surface-100 bg-surface-50 opacity-60 cursor-not-allowed'
                          : settings.language === opt.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : 'border-surface-100 hover:border-surface-200',
                      )}
                      onClick={() => !opt.comingSoon && updateSettings({ language: opt.value })}
                    >
                      {opt.comingSoon && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          {uiLang === 'it' ? 'Presto' : 'قريباً'}
                        </span>
                      )}
                      {opt.value === 'it'   && <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400" dir="ltr">IT</span>}
                      {opt.value === 'both' && <Icon name="translate" size={24} className={settings.language === opt.value ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500'} />}
                      {opt.value === 'en_it'&& <span className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-[10px] font-bold text-green-600 dark:text-green-400" dir="ltr">EN</span>}
                      <span className={cn('text-xs font-medium text-center leading-tight', settings.language === opt.value ? 'text-primary-700 dark:text-primary-300' : 'text-surface-600')}>
                        {opt.label}
                      </span>
                      {settings.language === opt.value && !opt.comingSoon && <Icon name="check_circle" size={16} className="text-primary-500" filled />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Modal */}
      {showCompleteProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-surface-100 w-full sm:rounded-2xl sm:max-w-md max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-6 sm:rounded-t-2xl shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Icon name="person_add" size={28} className="text-white" filled />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">{t('profile.complete_profile_title')}</h3>
                  <p className="text-white/70 text-xs mt-0.5">{t('profile.complete_profile_unlock')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4">
                {[completeForm.birthDate, completeForm.province, completeForm.gender, completeForm.phone, completeForm.italianLevel].map((v, i) => (
                  <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all', v ? 'bg-white' : 'bg-white/30')} />
                ))}
              </div>
              <p className="text-white/60 text-[10px] mt-1.5">{completedFields} / 5 {t('profile.completed_of')}</p>
            </div>

            <div className="p-5 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-surface-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                    <Icon name="cake" size={12} /> {t('profile.birth_date')}
                  </label>
                  <input
                    type="date"
                    className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 dark:bg-surface-100 dark:text-surface-900"
                    style={{ boxSizing: 'border-box' }}
                    value={completeForm.birthDate}
                    onChange={e => setCompleteForm(p => ({ ...p, birthDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-surface-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                    <Icon name="wc" size={12} /> {t('profile.gender')}
                  </label>
                  <div className="flex gap-1.5 h-[42px]">
                    {[{ value: 'male', label: t('profile.male'), icon: '♂' }, { value: 'female', label: t('profile.female'), icon: '♀' }].map(g => (
                      <button
                        key={g.value}
                        className={cn('flex-1 rounded-xl border-2 text-xs font-bold transition-all', completeForm.gender === g.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-500 hover:border-surface-300')}
                        onClick={() => setCompleteForm(p => ({ ...p, gender: g.value }))}
                      >
                        <span className="mr-0.5">{g.icon}</span> {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-surface-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                  <Icon name="location_on" size={12} /> 🇮🇹 {t('profile.province_label')}
                </label>
                <ProvinceSelect
                  className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  value={completeForm.province}
                  onChange={v => setCompleteForm(p => ({ ...p, province: v }))}
                  placeholder={t('profile.select_city')}
                />
              </div>

              <div>
                <label className="text-[11px] text-surface-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                  <Icon name="phone" size={12} /> {t('profile.phone_label')}
                </label>
                <div className="flex gap-2">
                  <PhoneCodeSelect
                    className="w-28 border border-surface-200 rounded-xl px-2 py-2.5 text-sm shrink-0 focus:outline-none focus:border-primary-400"
                    value={completeForm.phoneCode}
                    onChange={v => setCompleteForm(p => ({ ...p, phoneCode: v }))}
                  />
                  <input
                    type="tel"
                    dir="ltr"
                    className={cn('flex-1 border rounded-xl px-3 py-2.5 text-sm text-left focus:outline-none focus:border-primary-400 dark:bg-surface-100 dark:text-surface-900', profilePhoneError ? 'border-danger-400 bg-danger-50' : 'border-surface-200')}
                    placeholder="1234567890"
                    value={completeForm.phone}
                    onChange={e => {
                      const val = e.target.value;
                      setCompleteForm(p => ({ ...p, phone: val }));
                      const raw = val.replace(/\D/g, '');
                      setProfilePhoneError(val && (raw.length < 7 || raw.length > 15) ? t('profile.phone_invalid') : '');
                    }}
                  />
                </div>
                {profilePhoneError && <p className="text-[11px] text-danger-500 mt-1">{profilePhoneError}</p>}
              </div>

              <div>
                <label className="text-[11px] text-surface-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                  <Icon name="translate" size={12} /> {t('profile.italian_level')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'weak',      label: t('profile.level_beginner'), desc: t('profile.level_beginner_desc'), icon: '🌱' },
                    { value: 'good',      label: t('profile.level_medium'),   desc: t('profile.level_medium_desc'),   icon: '📖' },
                    { value: 'very_good', label: t('profile.level_advanced'), desc: t('profile.level_advanced_desc'), icon: '🎯' },
                    { value: 'native',    label: t('profile.level_native'),   desc: t('profile.level_native_desc'),   icon: '🇮🇹' },
                  ].map(l => (
                    <button
                      key={l.value}
                      className={cn('p-2.5 rounded-xl border-2 text-right transition-all', completeForm.italianLevel === l.value ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300')}
                      onClick={() => setCompleteForm(p => ({ ...p, italianLevel: l.value }))}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{l.icon}</span>
                        <div>
                          <p className={cn('text-xs font-bold', completeForm.italianLevel === l.value ? 'text-primary-700' : 'text-surface-700')}>{l.label}</p>
                          <p className="text-[9px] text-surface-400">{l.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-6 pt-2 flex gap-3 shrink-0 border-t border-surface-50">
              <button className="px-4 py-2.5 text-sm text-surface-400 hover:text-surface-600 transition-colors" onClick={() => setShowCompleteProfile(false)}>
                {t('profile.later')}
              </button>
              <Button fullWidth onClick={handleSaveCompleteProfile}>
                <Icon name="check_circle" size={16} className="ml-1.5" /> {t('profile.save_data')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
