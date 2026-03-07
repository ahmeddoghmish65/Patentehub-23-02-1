import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useDataStore } from '@/store';
import { ROUTES } from '@/constants';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { verifyPassword, hashPassword, getDB } from '@/db/database';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useTranslation } from '@/i18n';

function getTextDir(text: string): 'rtl' | 'ltr' {
  return /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';
}

const ITALIAN_PROVINCES = [
  'Agrigento','Alessandria','Ancona','Aosta','Arezzo','Ascoli Piceno','Asti','Avellino','Bari','Barletta-Andria-Trani',
  'Belluno','Benevento','Bergamo','Biella','Bologna','Bolzano','Brescia','Brindisi','Cagliari','Caltanissetta',
  'Campobasso','Caserta','Catania','Catanzaro','Chieti','Como','Cosenza','Cremona','Crotone','Cuneo',
  'Enna','Fermo','Ferrara','Firenze','Foggia','Forlì-Cesena','Frosinone','Genova','Gorizia','Grosseto',
  'Imperia','Isernia','La Spezia','L\'Aquila','Latina','Lecce','Lecco','Livorno','Lodi','Lucca',
  'Macerata','Mantova','Massa-Carrara','Matera','Messina','Milano','Modena','Monza e Brianza','Napoli','Novara',
  'Nuoro','Oristano','Padova','Palermo','Parma','Pavia','Perugia','Pesaro e Urbino','Pescara','Piacenza',
  'Pisa','Pistoia','Pordenone','Potenza','Prato','Ragusa','Ravenna','Reggio Calabria','Reggio Emilia','Rieti',
  'Rimini','Roma','Rovigo','Salerno','Sassari','Savona','Siena','Siracusa','Sondrio','Sud Sardegna',
  'Taranto','Teramo','Terni','Torino','Trapani','Trento','Treviso','Trieste','Udine','Varese',
  'Venezia','Verbano-Cusio-Ossola','Vercelli','Verona','Vibo Valentia','Vicenza','Viterbo'
];

const COUNTRY_CODES = [
  { code: '+39', country: '🇮🇹 إيطاليا' }, { code: '+966', country: '🇸🇦 السعودية' },
  { code: '+20', country: '🇪🇬 مصر' }, { code: '+962', country: '🇯🇴 الأردن' },
  { code: '+961', country: '🇱🇧 لبنان' }, { code: '+964', country: '🇮🇶 العراق' },
  { code: '+963', country: '🇸🇾 سوريا' }, { code: '+970', country: '🇵🇸 فلسطين' },
  { code: '+212', country: '🇲🇦 المغرب' }, { code: '+213', country: '🇩🇿 الجزائر' },
  { code: '+216', country: '🇹🇳 تونس' }, { code: '+218', country: '🇱🇾 ليبيا' },
  { code: '+971', country: '🇦🇪 الإمارات' }, { code: '+974', country: '🇶🇦 قطر' },
  { code: '+968', country: '🇴🇲 عمان' }, { code: '+973', country: '🇧🇭 البحرين' },
  { code: '+965', country: '🇰🇼 الكويت' }, { code: '+967', country: '🇾🇪 اليمن' },
  { code: '+249', country: '🇸🇩 السودان' }, { code: '+90', country: '🇹🇷 تركيا' },
  { code: '+49', country: '🇩🇪 ألمانيا' }, { code: '+33', country: '🇫🇷 فرنسا' },
  { code: '+44', country: '🇬🇧 بريطانيا' }, { code: '+34', country: '🇪🇸 إسبانيا' },
  { code: '+1', country: '🇺🇸 أمريكا' },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { t, uiLang, setUiLang } = useTranslation();
  const { user, logout, updateSettings, updateProfile } = useAuthStore();
  const { posts, loadPosts } = useDataStore();

  const [showEditPage, setShowEditPage] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', username: '', bio: '',
    email: '', phone: '', phoneCode: '+39',
    gender: '', birthDate: '', province: '', italianLevel: '',
    privacyHideStats: false,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'ok' | 'taken' | 'invalid'>('idle');
  const [phoneError, setPhoneError] = useState('');
  const [profilePhoneError, setProfilePhoneError] = useState('');
  
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [profileForm, setProfileForm] = useState({
    birthDate: '', country: 'Italia', province: '', gender: '',
    phoneCode: '+39', phone: '', italianLevel: '',
  });

  // Stats modal
  const [activeStatView, setActiveStatView] = useState<null | 'posts' | 'quizzes' | 'followers' | 'following'>(null);
  const [followersList, setFollowersList] = useState<{ id: string; name: string; avatar?: string; username?: string }[]>([]);
  const [followingList, setFollowingList] = useState<{ id: string; name: string; avatar?: string; username?: string }[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  // My current following IDs (for follow/unfollow in lists)
  const [myFollowing, setMyFollowing] = useState<string[]>(() => {
    if (!user) return [];
    try { return JSON.parse(localStorage.getItem(`following_${user.id}`) || '[]'); } catch { return []; }
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  useEffect(() => {
    if (!user) return;
    getDB().then(db => db.getAll('users')).then(all => {
      // Followers: users who have current user in their localStorage following list
      const followers = all.filter(u => {
        const f = localStorage.getItem(`following_${u.id}`);
        if (!f) return false;
        try { return (JSON.parse(f) as string[]).includes(user.id); } catch { return false; }
      });
      setFollowerCount(followers.length);
      setFollowersList(followers.map(u => ({ id: u.id, name: u.name, avatar: u.avatar, username: u.username })));
      // Following: users that current user follows (from localStorage)
      const myFollowingRaw = localStorage.getItem(`following_${user.id}`);
      const myFollowingIds: string[] = myFollowingRaw ? (() => { try { return JSON.parse(myFollowingRaw); } catch { return []; } })() : [];
      setFollowingCount(myFollowingIds.length);
      const followingUsers = all.filter(u => myFollowingIds.includes(u.id));
      setFollowingList(followingUsers.map(u => ({ id: u.id, name: u.name, avatar: u.avatar, username: u.username })));
    });
  }, [user?.id]);

  const toggleFollowUser = (targetId: string, targetName: string, targetAvatar?: string, targetUsername?: string) => {
    if (!user) return;
    const raw = localStorage.getItem(`following_${user.id}`);
    let arr: string[] = raw ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : [];
    const isFollowing = arr.includes(targetId);
    if (isFollowing) {
      arr = arr.filter(id => id !== targetId);
    } else {
      arr = [...arr, targetId];
    }
    localStorage.setItem(`following_${user.id}`, JSON.stringify(arr));
    setMyFollowing(arr);
    setFollowingCount(arr.length);
    if (!isFollowing) {
      setFollowingList(prev => prev.find(u => u.id === targetId) ? prev : [...prev, { id: targetId, name: targetName, avatar: targetAvatar, username: targetUsername }]);
    } else {
      setFollowingList(prev => prev.filter(u => u.id !== targetId));
    }
  };

  if (!user) return null;

  const { progress, settings } = user;
  const totalAnswers = progress.correctAnswers + progress.wrongAnswers;
  const accuracy = totalAnswers > 0 ? Math.round((progress.correctAnswers / totalAnswers) * 100) : 0;
  const isAdmin = user.role === 'admin' || user.role === 'manager';
  const storedBio = user.bio || localStorage.getItem(`bio_${user.id}`) || '';

  const handleLogout = async () => { await logout(); onNavigate('landing'); };

  const handleAvatarChange = () => { fileRef.current?.click(); };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert(t('profile.photo_too_large')); return; }
    const reader = new FileReader();
    reader.onload = () => { updateProfile({ avatar: reader.result as string }); };
    reader.readAsDataURL(file);
  };
  const handleDeleteAvatar = () => { updateProfile({ avatar: '' }); };

  const [changeDates, setChangeDates] = useState<{ name?: string; username?: string }>({});

  const openEditPage = async () => {
    const nameParts = user.name.split(' ');
    setEditForm({
      firstName: user.firstName || nameParts[0] || '',
      lastName: user.lastName || nameParts.slice(1).join(' ') || '',
      username: user.username || '',
      bio: storedBio,
      email: user.email,
      phone: user.phone || '',
      phoneCode: user.phoneCode || '+39',
      gender: user.gender || '',
      birthDate: user.birthDate || '',
      province: user.province || '',
      italianLevel: user.italianLevel || '',
      privacyHideStats: user.privacyHideStats || false,
    });
    // Load cooldown dates
    const db = await getDB();
    const u = await db.get('users', user.id);
    setChangeDates({ name: u?.nameChangeDate, username: u?.usernameChangeDate });
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setPasswordMsg(''); setSaveMsg('');
    setShowEditPage(true);
  };

  const handleSaveEdit = async () => {
    setSaveMsg('');
    const db = await getDB();
    const u = await db.get('users', user.id);
    if (!u) return;
    const now = new Date();
    const DAYS_60 = 60 * 24 * 60 * 60 * 1000;

    // 60-day cooldown for name
    const newFullName = `${editForm.firstName} ${editForm.lastName}`.trim();
    if (newFullName !== user.name && u.nameChangeDate) {
      const diff = now.getTime() - new Date(u.nameChangeDate).getTime();
      if (diff < DAYS_60) {
        const daysLeft = Math.ceil((DAYS_60 - diff) / (24 * 60 * 60 * 1000));
        setSaveMsg(`${t('profile.name_cooldown')} ${daysLeft} ${t('profile.name_cooldown_days')}`); return;
      }
    }
    // 60-day cooldown for username
    if (editForm.username && editForm.username !== user.username && u.usernameChangeDate) {
      const diff = now.getTime() - new Date(u.usernameChangeDate).getTime();
      if (diff < DAYS_60) {
        const daysLeft = Math.ceil((DAYS_60 - diff) / (24 * 60 * 60 * 1000));
        setSaveMsg(`${t('profile.username_cooldown')} ${daysLeft} ${t('profile.username_cooldown_days')}`); return;
      }
    }
    // Phone validation
    const rawPhone = editForm.phone.replace(/\D/g, '');
    if (editForm.phone && (rawPhone.length < 7 || rawPhone.length > 15)) {
      setPhoneError(t('profile.phone_invalid_long')); return;
    }
    setPhoneError('');
    // Username uniqueness check
    if (editForm.username && editForm.username !== user.username) {
      if (usernameStatus === 'taken') { setSaveMsg(`❌ ${t('profile.username_taken')}`); return; }
      if (!/^[a-zA-Z0-9_.]{3,20}$/.test(editForm.username)) { setSaveMsg(`❌ ${t('profile.username_invalid')}`); return; }
    }
    if (newFullName !== user.name) u.nameChangeDate = now.toISOString();
    if (editForm.username && editForm.username !== user.username) u.usernameChangeDate = now.toISOString();
    u.firstName = editForm.firstName;
    u.lastName = editForm.lastName;
    u.name = newFullName;
    u.username = editForm.username;
    u.bio = editForm.bio;
    u.phone = editForm.phone;
    u.phoneCode = editForm.phoneCode;
    u.gender = editForm.gender;
    u.birthDate = editForm.birthDate;
    u.province = editForm.province;
    u.italianLevel = editForm.italianLevel;
    u.privacyHideStats = editForm.privacyHideStats;
    if (editForm.email !== user.email) u.email = editForm.email;
    // Auto-complete profile if all required fields are present
    if (editForm.birthDate && editForm.province && editForm.gender && editForm.phone && editForm.italianLevel) {
      u.profileComplete = true;
    }
    localStorage.setItem(`bio_${user.id}`, editForm.bio);
    await db.put('users', u);
    setSaveMsg(t('profile.changes_saved'));
    setTimeout(() => { setSaveMsg(''); setShowEditPage(false); window.location.reload(); }, 1500);
  };

  const handleChangePassword = async () => {
    setPasswordMsg('');
    if (!currentPassword) { setPasswordMsg(t('profile.password_required')); return; }
    if (!newPassword || newPassword.length < 6) { setPasswordMsg(t('profile.password_short')); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg(t('profile.password_mismatch_long')); return; }
    const db = await getDB();
    const fullUser = await db.get('users', user.id);
    if (!fullUser) { setPasswordMsg(t('profile.error_occurred')); return; }
    const isValid = await verifyPassword(currentPassword, fullUser.password);
    if (!isValid) { setPasswordMsg(t('profile.wrong_password')); return; }
    fullUser.password = await hashPassword(newPassword);
    await db.put('users', fullUser);
    setPasswordMsg(t('profile.password_changed'));
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const onEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert(t('profile.photo_too_large')); return; }
    const reader = new FileReader();
    reader.onload = () => { updateProfile({ avatar: reader.result as string }); };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const { birthDate, province, gender, phoneCode, phone, italianLevel } = profileForm;
    if (!birthDate || !province || !gender || !phone || !italianLevel) {
      alert(t('profile.fill_required')); return;
    }
    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length < 7 || rawPhone.length > 15) {
      setProfilePhoneError(t('profile.phone_invalid_long')); return;
    }
    setProfilePhoneError('');
    const db = await getDB();
    const u = await db.get('users', user.id);
    if (u) {
      u.birthDate = birthDate; u.country = 'Italia'; u.province = province;
      u.gender = gender; u.phoneCode = phoneCode; u.phone = phone;
      u.italianLevel = italianLevel; u.profileComplete = true;
      await db.put('users', u);
    }
    setShowCompleteProfile(false);
    window.location.reload();
  };

  const languageOptions = [
    { value: 'ar' as const, label: uiLang === 'it' ? 'Solo arabo' : 'العربية فقط' },
    { value: 'it' as const, label: 'Solo italiano' },
    { value: 'both' as const, label: 'العربية + Italiano' },
  ];

  const allBadges = [
    { id: 'newcomer', name: t('profile.badge_newcomer'), icon: 'waving_hand', color: 'bg-blue-500' },
    { id: 'quiz_master', name: t('profile.badge_quiz_master'), icon: 'quiz', color: 'bg-purple-500' },
    { id: 'perfect_score', name: t('profile.badge_perfect'), icon: 'star', color: 'bg-yellow-500' },
    { id: 'week_streak', name: t('profile.badge_week_streak'), icon: 'local_fire_department', color: 'bg-orange-500' },
    { id: 'level_5', name: t('profile.badge_level5'), icon: 'military_tech', color: 'bg-green-500' },
  ];

  // ==================== EDIT PAGE (not overlay - inline page) ====================
  if (showEditPage) {
    const fieldClass = 'w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 transition-colors';
    return (
      <div className="max-w-lg mx-auto pb-6">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-surface-50 -mx-1 px-1 pb-3 pt-1">
          <div className="bg-white rounded-2xl border border-surface-100 px-4 py-3 flex items-center gap-3 shadow-sm">
            <button onClick={() => setShowEditPage(false)}
              className="w-9 h-9 rounded-xl bg-surface-100 hover:bg-surface-200 flex items-center justify-center transition-colors shrink-0">
              <Icon name="arrow_forward" size={20} className="text-surface-600 ltr:rotate-180" />
            </button>
            <h2 className="text-base font-bold text-surface-900 flex-1">{t('profile.edit_title')}</h2>
            {saveMsg && (
              <span className={cn('text-xs font-semibold px-3 py-1 rounded-lg', saveMsg.includes('✓') ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600')}>
                {saveMsg}
              </span>
            )}
            <Button size="sm" onClick={handleSaveEdit} className="shrink-0">
              <Icon name="save" size={15} className="ml-1" /> {t('profile.save')}
            </Button>
          </div>
        </div>

        <input type="file" ref={editFileRef} className="hidden" accept="image/*" onChange={onEditFileChange} />

        {/* Avatar banner */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 flex items-center gap-4 mb-4">
          <div className="relative shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl" />
            ) : (
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border-4 border-white/30 shadow-xl">
                <span className="text-3xl font-black text-white">{user.name.charAt(0)}</span>
              </div>
            )}
            <button
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-surface-50 transition-colors"
              onClick={() => editFileRef.current?.click()}>
              <Icon name="camera_alt" size={14} className="text-primary-600" />
            </button>
            {user.avatar && (
              <button
                className="absolute -top-1 -left-1 w-6 h-6 bg-danger-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:bg-danger-600 transition-colors"
                onClick={handleDeleteAvatar}>
                <Icon name="close" size={12} className="text-white" />
              </button>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-base truncate">{user.name}</p>
            {user.username && <p className="text-white/70 text-sm">@{user.username}</p>}
            <p className="text-white/60 text-xs mt-1">{t('profile.tap_camera')}</p>
          </div>
        </div>

        {/* Section helper */}
        {(() => {
          const SectionHeader = ({ icon, label }: { icon: string; label: string }) => (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon name={icon} size={15} className="text-primary-500" />
              </div>
              <h3 className="text-sm font-bold text-surface-800">{label}</h3>
            </div>
          );
          return (
            <div className="space-y-3">
              {/* Personal info */}
              <div className="bg-white rounded-2xl p-4 border border-surface-100 space-y-3">
                <SectionHeader icon="person" label={t('profile.personal_info')} />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.first_name')}</label>
                    <input className={fieldClass} value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.last_name')}</label>
                    <input className={fieldClass} value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
                  </div>
                </div>
                {(() => {
                  if (!changeDates.name) return null;
                  const diff = Date.now() - new Date(changeDates.name).getTime();
                  const DAYS_60 = 60 * 24 * 60 * 60 * 1000;
                  if (diff >= DAYS_60) return null;
                  const daysLeft = Math.ceil((DAYS_60 - diff) / (24 * 60 * 60 * 1000));
                  return <p className="text-[11px] text-warning-600 bg-warning-50 rounded-lg px-3 py-1.5 flex items-center gap-1"><Icon name="schedule" size={12} /> {t('profile.name_cooldown')} {daysLeft} {t('profile.name_cooldown_days')}</p>;
                })()}

                <div>
                  <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.username_label')}</label>
                  <div className="relative">
                    <input
                      className={cn(fieldClass, 'pl-8', usernameStatus === 'taken' ? 'border-danger-400 bg-danger-50' : usernameStatus === 'ok' ? 'border-success-400' : '')}
                      dir="ltr" value={editForm.username}
                      onChange={async e => {
                        const val = e.target.value;
                        setEditForm(f => ({ ...f, username: val }));
                        if (!val || val === user.username) { setUsernameStatus('idle'); return; }
                        if (!/^[a-zA-Z0-9_.]{3,20}$/.test(val)) { setUsernameStatus('invalid'); return; }
                        setUsernameStatus('checking');
                        const db2 = await getDB();
                        const all = await db2.getAll('users');
                        const taken = all.some(u => u.id !== user.id && (u.username || '').toLowerCase() === val.toLowerCase());
                        setUsernameStatus(taken ? 'taken' : 'ok');
                      }} />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && <Icon name="refresh" size={15} className="text-surface-400 animate-spin" />}
                      {usernameStatus === 'ok' && <Icon name="check_circle" size={15} className="text-success-500" filled />}
                      {usernameStatus === 'taken' && <Icon name="cancel" size={15} className="text-danger-500" filled />}
                      {usernameStatus === 'invalid' && <Icon name="error" size={15} className="text-warning-500" filled />}
                    </span>
                  </div>
                  {usernameStatus === 'taken' && <p className="text-[11px] text-danger-500 mt-1">{t('profile.username_taken')}</p>}
                  {usernameStatus === 'invalid' && <p className="text-[11px] text-warning-500 mt-1">{t('profile.username_invalid')}</p>}
                  {usernameStatus === 'ok' && <p className="text-[11px] text-success-500 mt-1">{t('profile.username_available')}</p>}
                  {(() => {
                    if (!changeDates.username) return null;
                    const diff = Date.now() - new Date(changeDates.username).getTime();
                    const DAYS_60 = 60 * 24 * 60 * 60 * 1000;
                    if (diff >= DAYS_60) return null;
                    const daysLeft = Math.ceil((DAYS_60 - diff) / (24 * 60 * 60 * 1000));
                    return <p className="text-[11px] text-warning-600 bg-warning-50 rounded-lg px-3 py-1.5 flex items-center gap-1 mt-1"><Icon name="schedule" size={12} /> {t('profile.username_cooldown')} {daysLeft} {t('profile.username_cooldown_days')}</p>;
                  })()}
                </div>

                <div>
                  <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.bio_label')}</label>
                  <textarea className={cn(fieldClass, 'resize-none')} rows={2} value={editForm.bio}
                    onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} maxLength={150} placeholder={t('profile.bio_placeholder')} />
                  <span className="text-[10px] text-surface-400">{editForm.bio.length}/150</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.birth_date')}</label>
                    <input type="date" className={fieldClass} style={{ boxSizing: 'border-box' }} value={editForm.birthDate}
                      onChange={e => setEditForm(f => ({ ...f, birthDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.gender')}</label>
                    <div className="flex gap-1.5 h-[42px]">
                      {[{ value: 'male', label: t('profile.male') }, { value: 'female', label: t('profile.female') }].map(g => (
                        <button key={g.value}
                          className={cn('flex-1 rounded-xl border-2 text-xs font-semibold transition-all',
                            editForm.gender === g.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-500 hover:border-surface-300')}
                          onClick={() => setEditForm(f => ({ ...f, gender: g.value }))}>{g.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-2xl p-4 border border-surface-100 space-y-3">
                <SectionHeader icon="contact_mail" label={t('profile.contact_info')} />

                <div>
                  <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.email_label')}</label>
                  <input type="email" dir="ltr" className={cn(fieldClass, 'text-left')} value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </div>

                <div>
                  <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.phone_label')}</label>
                  <div className="flex gap-2">
                    <select className="w-28 border border-surface-200 rounded-xl px-2 py-2.5 text-sm shrink-0 focus:outline-none focus:border-primary-400" value={editForm.phoneCode} onChange={e => setEditForm(f => ({ ...f, phoneCode: e.target.value }))}>
                      {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.country.split(' ')[0]} {c.code}</option>)}
                    </select>
                    <input type="tel" dir="ltr"
                      className={cn(fieldClass, 'flex-1 text-left', phoneError ? 'border-danger-400 bg-danger-50' : '')}
                      value={editForm.phone}
                      onChange={e => {
                        const val = e.target.value;
                        setEditForm(f => ({ ...f, phone: val }));
                        const raw = val.replace(/\D/g, '');
                        if (val && (raw.length < 7 || raw.length > 15)) setPhoneError(t('profile.phone_invalid'));
                        else setPhoneError('');
                      }}
                      placeholder="1234567890" />
                  </div>
                  {phoneError && <p className="text-[11px] text-danger-500 mt-1">{phoneError}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.province_label')}</label>
                    <select className={fieldClass} value={editForm.province} onChange={e => setEditForm(f => ({ ...f, province: e.target.value }))}>
                      <option value="">{t('profile.select_province')}</option>
                      {ITALIAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.italian_level')}</label>
                    <select className={fieldClass} value={editForm.italianLevel} onChange={e => setEditForm(f => ({ ...f, italianLevel: e.target.value }))}>
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
                    className={cn('w-11 h-6 rounded-full transition-colors relative shrink-0', editForm.privacyHideStats ? 'bg-primary-500' : 'bg-surface-200')}
                    onClick={() => setEditForm(f => ({ ...f, privacyHideStats: !f.privacyHideStats }))}>
                    <div className={cn('w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute top-[3px] transition-all w-[18px] h-[18px]', editForm.privacyHideStats ? 'left-[3px]' : 'left-[23px]')} />
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="bg-white rounded-2xl p-4 border border-surface-100 space-y-3">
                <SectionHeader icon="security" label={t('profile.change_password')} />
                <div>
                  <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.current_password')}</label>
                  <input type="password" dir="ltr" className={cn(fieldClass, 'text-left')} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.new_password')}</label>
                    <input type="password" dir="ltr" className={cn(fieldClass, 'text-left')} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('profile.password_min')} />
                  </div>
                  <div>
                    <label className="text-[11px] text-surface-400 font-medium mb-1 block">{t('profile.confirm_password')}</label>
                    <input type="password" dir="ltr" className={cn(fieldClass, 'text-left', confirmPassword && newPassword !== confirmPassword ? 'border-danger-400' : '')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                {confirmPassword && newPassword !== confirmPassword && <p className="text-[11px] text-danger-500">{t('profile.password_mismatch')}</p>}
                {passwordMsg && <p className={cn('text-xs', passwordMsg.includes('✓') ? 'text-success-600' : 'text-danger-500')}>{passwordMsg}</p>}
                <Button size="sm" onClick={handleChangePassword} disabled={!currentPassword || !newPassword}>{t('profile.change_btn')}</Button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ==================== MAIN PROFILE PAGE ====================
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-5 border border-surface-100">
        <div className="flex items-start gap-4">
          <div className="relative group shrink-0">
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={onFileChange} />
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg cursor-pointer" onClick={handleAvatarChange} />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer" onClick={handleAvatarChange}>
                <span className="text-2xl font-bold text-white">{user.name.charAt(0)}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarChange}>
              <Icon name="camera_alt" size={22} className="text-white" />
            </div>
            {user.avatar && (
              <button className="absolute -top-1 -left-1 w-6 h-6 bg-danger-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-danger-600"
                onClick={handleDeleteAvatar} title={t('profile.delete_avatar')}>
                <Icon name="close" size={14} className="text-white" />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold text-surface-900">{user.name}</h1>
              {user.verified && <VerifiedBadge size="md" tooltip />}
            </div>
            {user.username && (
              <p className="text-sm text-primary-500 font-medium mb-0.5">@{user.username}</p>
            )}
            <p className="text-xs text-surface-400">{user.email}</p>
            {storedBio && <p className="text-sm text-surface-600 mt-1 line-clamp-2">{storedBio}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">{t('profile.level_label')} {progress.level}</span>
              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">{progress.xp} XP</span>
              {!user.profileComplete && (
                <button className="text-xs bg-warning-50 text-warning-600 px-2 py-0.5 rounded-full font-medium animate-pulse" onClick={() => setShowCompleteProfile(true)}>
                  {t('profile.complete_badge')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Social Stats */}
        {(() => {
          const myPosts = posts.filter(p => p.userId === user.id && p.type === 'post').length;
          const myQuizzes = posts.filter(p => p.userId === user.id && p.type === 'quiz').length;
          const statsItems: { label: string; value: number; view: 'posts' | 'quizzes' | 'followers' | 'following' }[] = [
            { label: t('profile.posts_stat'), value: myPosts, view: 'posts' },
            { label: t('profile.questions_stat'), value: myQuizzes, view: 'quizzes' },
            { label: t('profile.followers_stat'), value: followerCount, view: 'followers' },
            { label: t('profile.following_stat'), value: followingCount, view: 'following' },
          ];
          return (
            <div className="grid grid-cols-4 gap-1.5 mt-4 border-t border-surface-50 pt-4">
              {statsItems.map((s) => (
                <button key={s.view} className="text-center py-1 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer" onClick={() => setActiveStatView(s.view)}>
                  <p className="text-lg font-black text-surface-900 leading-tight">{s.value}</p>
                  <p className="text-[11px] text-primary-500 font-medium">{s.label}</p>
                </button>
              ))}
            </div>
          );
        })()}

        {/* Stats Modal */}
        {activeStatView && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setActiveStatView(null)}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-surface-100 shrink-0">
                <h3 className="font-bold text-surface-900">
                  {activeStatView === 'posts' ? t('profile.my_posts') : activeStatView === 'quizzes' ? t('profile.my_quizzes') : activeStatView === 'followers' ? t('profile.followers_modal') : t('profile.following_modal')}
                </h3>
                <button className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400" onClick={() => setActiveStatView(null)}>
                  <Icon name="close" size={18} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {activeStatView === 'posts' && (() => {
                  const myPosts = posts.filter(p => p.userId === user.id && p.type === 'post');
                  return myPosts.length === 0 ? (
                    <div className="p-8 text-center text-surface-400"><Icon name="forum" size={36} className="mx-auto mb-2 opacity-30" /><p>{t('profile.no_posts')}</p></div>
                  ) : (
                    <div className="divide-y divide-surface-50">
                      {myPosts.map(p => (
                        <div key={p.id} className="p-4 cursor-pointer hover:bg-surface-50 transition-colors"
                          onClick={() => { setActiveStatView(null); onNavigate('community', { openPostId: p.id }); }}>
                          <p dir={getTextDir(p.content)} className="text-sm text-surface-800 line-clamp-3">{p.content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><Icon name="favorite" size={11} /> {p.likesCount}</span>
                            <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><Icon name="chat_bubble" size={11} /> {p.commentsCount}</span>
                            <span className="text-[10px] text-surface-400 mr-auto">{new Date(p.createdAt).toLocaleDateString('ar')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {activeStatView === 'quizzes' && (() => {
                  const myQuizzes = posts.filter(p => p.userId === user.id && p.type === 'quiz');
                  return myQuizzes.length === 0 ? (
                    <div className="p-8 text-center text-surface-400"><Icon name="quiz" size={36} className="mx-auto mb-2 opacity-30" /><p>{t('profile.no_quizzes')}</p></div>
                  ) : (
                    <div className="divide-y divide-surface-50">
                      {myQuizzes.map(p => (
                        <div key={p.id} className="p-4 cursor-pointer hover:bg-surface-50 transition-colors"
                          onClick={() => { setActiveStatView(null); onNavigate('community', { openPostId: p.id }); }}>
                          <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 rounded-full mb-1 inline-block">{t('community.quiz_badge')}</span>
                          <p dir={getTextDir(p.content || p.quizQuestion)} className="text-sm text-surface-800 line-clamp-3">{p.content || p.quizQuestion}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><Icon name="chat_bubble" size={11} /> {p.commentsCount}</span>
                            <span className="text-[10px] text-surface-400 mr-auto">{new Date(p.createdAt).toLocaleDateString('ar')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {activeStatView === 'followers' && (
                  followersList.length === 0 ? (
                    <div className="p-8 text-center text-surface-400"><Icon name="people" size={36} className="mx-auto mb-2 opacity-30" /><p>{t('profile.no_followers')}</p></div>
                  ) : (
                    <div className="divide-y divide-surface-50">
                      {followersList.map(u => (
                        <div key={u.id} className="p-4 flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="font-bold text-primary-700">{u.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-surface-800 truncate">{u.name}</p>
                            {u.username && <p className="text-xs text-primary-500">@{u.username}</p>}
                          </div>
                          <button
                            onClick={() => toggleFollowUser(u.id, u.name, u.avatar, u.username)}
                            className={cn('shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all',
                              myFollowing.includes(u.id)
                                ? 'bg-surface-100 text-surface-600 hover:bg-danger-50 hover:text-danger-600 border border-surface-200'
                                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm')}>
                            {myFollowing.includes(u.id) ? t('profile.following_btn') : t('profile.follow_btn')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}
                {activeStatView === 'following' && (
                  followingList.length === 0 ? (
                    <div className="p-8 text-center text-surface-400"><Icon name="person_add" size={36} className="mx-auto mb-2 opacity-30" /><p>{t('profile.no_following')}</p></div>
                  ) : (
                    <div className="divide-y divide-surface-50">
                      {followingList.map(u => (
                        <div key={u.id} className="p-4 flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="font-bold text-primary-700">{u.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-surface-800 truncate">{u.name}</p>
                            {u.username && <p className="text-xs text-primary-500">@{u.username}</p>}
                          </div>
                          <button
                            onClick={() => toggleFollowUser(u.id, u.name, u.avatar, u.username)}
                            className={cn('shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all',
                              myFollowing.includes(u.id)
                                ? 'bg-surface-100 text-surface-600 hover:bg-danger-50 hover:text-danger-600 border border-surface-200'
                                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm')}>
                            {myFollowing.includes(u.id) ? t('profile.following_btn') : t('profile.follow_btn')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress & Exam Readiness */}
      <div className="bg-white rounded-xl p-5 border border-surface-100">
        <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
          <Icon name="trending_up" size={20} className="text-primary-500" /> {t('profile.progress_stats')}
        </h2>

        {/* Exam Readiness - Redesigned */}
        {(() => {
          const readinessColor = progress.examReadiness >= 70 ? '#22c55e' : progress.examReadiness >= 40 ? '#f59e0b' : '#6366f1';
          const readinessBg = progress.examReadiness >= 70 ? 'bg-success-50 text-success-700 border-success-200' : progress.examReadiness >= 40 ? 'bg-warning-50 text-warning-700 border-warning-200' : 'bg-primary-50 text-primary-700 border-primary-200';
          const readinessLabel = progress.examReadiness >= 70 ? t('profile.ready') : progress.examReadiness >= 40 ? t('profile.almost_ready') : t('profile.need_more');
          const r = 40;
          const circumference = 2 * Math.PI * r;
          return (
            <div className="bg-surface-50 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-5">
                {/* Circular ring with % inside */}
                <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
                  <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
                    <circle cx="50" cy="50" r={r} fill="none"
                      stroke={readinessColor} strokeWidth="9"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - progress.examReadiness / 100)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.7s ease' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-surface-900 leading-none">{progress.examReadiness}%</span>
                  </div>
                </div>
                {/* Info panel */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon name="verified" size={17} style={{ color: readinessColor }} filled />
                    <span className="text-sm font-bold text-surface-900">{t('profile.exam_readiness')}</span>
                  </div>
                  <span className={cn('inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border mb-3', readinessBg)}>
                    {readinessLabel}
                  </span>
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${progress.examReadiness}%`, backgroundColor: readinessColor }} />
                  </div>
                  <p className="text-[10px] text-surface-400 mt-1.5">{progress.examReadiness} {t('profile.of_100')}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Answer Distribution */}
        {totalAnswers > 0 ? (
          <div className="mb-4 bg-surface-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-surface-800">{t('profile.answer_dist')}</span>
              <span className="text-xs font-semibold bg-white text-surface-600 px-2.5 py-0.5 rounded-full border border-surface-200">{totalAnswers} {t('profile.total_label')}</span>
            </div>
            <div className="w-full bg-danger-100 rounded-full h-2.5 overflow-hidden flex mb-3">
              <div className="h-full bg-success-500 rounded-full transition-all duration-700" style={{ width: `${accuracy}%` }} title={`${t('profile.correct_label')}: ${progress.correctAnswers}`} />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-success-500 inline-block" />
                <span className="text-xs text-surface-600">{t('profile.correct_label')} <strong className="text-success-600">{progress.correctAnswers}</strong></span>
              </div>
              <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">{accuracy}% {t('profile.total_label')}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-surface-600">{t('profile.wrong_label')} <strong className="text-danger-500">{progress.wrongAnswers}</strong></span>
                <span className="w-3 h-3 rounded-full bg-danger-400 inline-block" />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-surface-50 rounded-xl p-4 text-center">
            <Icon name="quiz" size={28} className="text-surface-300 mx-auto mb-2" />
            <p className="text-sm text-surface-400">{t('profile.no_quizzes_label')}</p>
          </div>
        )}

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('profile.total_quizzes'), value: progress.totalQuizzes, icon: 'quiz', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: t('profile.current_streak'), value: `${progress.currentStreak} ${t('profile.streak_days')}`, icon: 'local_fire_department', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
            { label: t('profile.xp_points'), value: progress.xp, icon: 'stars', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: t('profile.completed_lessons_label'), value: progress.completedLessons.length, icon: 'school', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { label: t('profile.best_streak'), value: `${progress.bestStreak} ${t('profile.streak_days')}`, icon: 'emoji_events', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
            { label: t('profile.learning_days'), value: progress.totalStudyDays || 0, icon: 'calendar_month', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
          ].map((m, i) => (
            <div key={i} className={cn('rounded-xl p-3.5 border flex items-center gap-3', m.bg, m.border)}>
              <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0 shadow-sm">
                <Icon name={m.icon} size={22} className={m.color} filled />
              </div>
              <div>
                <p className="text-xl font-black text-surface-900 leading-none mb-0.5">{m.value}</p>
                <p className="text-[10px] text-surface-500">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl p-5 border border-surface-100">
        <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2"><Icon name="emoji_events" size={20} className="text-orange-500" /> {t('profile.achievements')} ({progress.badges.length}/{allBadges.length})</h2>
        <div className="grid grid-cols-5 gap-2">
          {allBadges.map(badge => {
            const isEarned = progress.badges.includes(badge.id);
            return (
              <div key={badge.id} className={cn('rounded-xl p-2 text-center', isEarned ? 'opacity-100' : 'opacity-30')}>
                <div className={cn('w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-1', isEarned ? badge.color : 'bg-surface-200')}>
                  <Icon name={badge.icon} size={20} className={isEarned ? 'text-white' : 'text-surface-400'} filled />
                </div>
                <p className="text-[10px] font-semibold text-surface-700 leading-tight">{badge.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-white rounded-xl border border-surface-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100">
          <h2 className="font-bold text-surface-900 flex items-center gap-2"><Icon name="manage_accounts" size={20} className="text-surface-500" /> {t('profile.account_management')}</h2>
        </div>

        {/* Edit Account */}
        <button className="w-full px-5 py-4 flex items-center gap-3 hover:bg-surface-50 transition-colors border-b border-surface-50 group" onClick={openEditPage}>
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors shrink-0">
            <Icon name="edit" size={18} className="text-primary-500" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold text-surface-800">{t('profile.edit_account_btn')}</p>
            <p className="text-xs text-surface-400">{t('profile.edit_account_desc')}</p>
          </div>
          <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors ltr:rotate-180" />
        </button>

        {/* Translation */}
        <button className="w-full px-5 py-4 flex items-center gap-3 hover:bg-surface-50 transition-colors border-b border-surface-50 group" onClick={() => setShowTranslation(true)}>
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors shrink-0">
            <Icon name="language" size={18} className="text-primary-500" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold text-surface-800">{t('profile.translation_btn')}</p>
            <p className="text-xs text-surface-400">{t('profile.translation_btn_desc')}</p>
          </div>
          <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors ltr:rotate-180" />
        </button>

        {/* Admin Panel */}
        {isAdmin && (
          <button className="w-full px-5 py-4 flex items-center gap-3 hover:bg-primary-50 transition-colors border-b border-surface-50 group" onClick={() => onNavigate('admin')}>
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon name="admin_panel_settings" size={18} className="text-primary-600" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-semibold text-surface-800">{t('profile.admin_panel')}</p>
              <p className="text-xs text-surface-400">{t('profile.admin_desc')}</p>
            </div>
            <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors ltr:rotate-180" />
          </button>
        )}

        {/* Account Info */}
        <div className="px-5 py-3 space-y-1">
          <div className="flex justify-between text-sm py-1.5 border-b border-surface-50"><span className="text-surface-500">{t('profile.join_date')}</span><span className="text-surface-700">{new Date(user.createdAt).toLocaleDateString(uiLang === 'it' ? 'it' : 'ar')}</span></div>
          <div className="flex justify-between text-sm py-1.5 border-b border-surface-50"><span className="text-surface-500">{t('profile.last_login')}</span><span className="text-surface-700">{new Date(user.lastLogin).toLocaleDateString('ar')}</span></div>
          <div className="flex justify-between text-sm py-1.5"><span className="text-surface-500">{t('profile.account_type')}</span><span className="text-primary-600 font-medium">{user.role === 'admin' ? t('profile.role_admin') : user.role === 'manager' ? t('profile.role_manager') : t('profile.role_user')}</span></div>
        </div>

        {!user.profileComplete && (
          <div className="px-5 pb-3">
            <button className="w-full bg-warning-50 text-warning-700 rounded-lg py-2.5 text-sm font-medium border border-warning-200 hover:bg-warning-100" onClick={() => setShowCompleteProfile(true)}>
              {t('profile.complete_profile_btn')}
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="px-5 py-4 border-t border-surface-100">
          <button className="w-full flex items-center justify-center gap-2 bg-danger-50 text-danger-600 rounded-xl py-3 text-sm font-semibold hover:bg-danger-100 transition-colors border border-danger-100" onClick={handleLogout}>
            <Icon name="logout" size={18} />
            {t('profile.logout')}
          </button>
        </div>
      </div>

      {/* Translation Modal */}
      {showTranslation && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowTranslation(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
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
                <div className="grid grid-cols-2 gap-2">
                  {(['ar', 'it'] as const).map(l => (
                    <button key={l} className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all', uiLang === l ? 'border-primary-500 bg-primary-50' : 'border-surface-100 hover:border-surface-200')} onClick={() => setUiLang(l)}>
                      {l === 'ar' && <span className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-600">ع</span>}
                      {l === 'it' && <span className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600" dir="ltr">IT</span>}
                      <span className={cn('text-xs font-medium text-center', uiLang === l ? 'text-primary-700' : 'text-surface-600')}>{t(`profile.ui_lang_${l}`)}</span>
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
                    <button key={opt.value} className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all', settings.language === opt.value ? 'border-primary-500 bg-primary-50' : 'border-surface-100 hover:border-surface-200')} onClick={() => updateSettings({ language: opt.value })}>
                      {opt.value === 'ar' && <span className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-600">ع</span>}
                      {opt.value === 'it' && <span className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600" dir="ltr">IT</span>}
                      {opt.value === 'both' && <Icon name="translate" size={24} className={settings.language === opt.value ? 'text-primary-600' : 'text-surface-500'} />}
                      <span className={cn('text-xs font-medium text-center leading-tight', settings.language === opt.value ? 'text-primary-700' : 'text-surface-600')}>{opt.label}</span>
                      {settings.language === opt.value && <Icon name="check_circle" size={16} className="text-primary-500" filled />}
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
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-md max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
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
              {/* Progress steps */}
              <div className="flex items-center gap-1.5 mt-4">
                {[profileForm.birthDate, profileForm.province, profileForm.gender, profileForm.phone, profileForm.italianLevel].map((v, i) => (
                  <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all', v ? 'bg-white' : 'bg-white/30')} />
                ))}
              </div>
              <p className="text-white/60 text-[10px] mt-1.5">
                {[profileForm.birthDate, profileForm.province, profileForm.gender, profileForm.phone, profileForm.italianLevel].filter(Boolean).length} / 5 {t('profile.completed_of')}
              </p>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4 flex-1">
              {/* Row: birthdate + gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-surface-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                    <Icon name="cake" size={12} /> {t('profile.birth_date')}
                  </label>
                  <input type="date" className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400" style={{ boxSizing: 'border-box' }}
                    value={profileForm.birthDate} onChange={e => setProfileForm(p => ({ ...p, birthDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[11px] text-surface-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                    <Icon name="wc" size={12} /> {t('profile.gender')}
                  </label>
                  <div className="flex gap-1.5 h-[42px]">
                    {[{ value: 'male', label: t('profile.male'), icon: '♂' }, { value: 'female', label: t('profile.female'), icon: '♀' }].map(g => (
                      <button key={g.value}
                        className={cn('flex-1 rounded-xl border-2 text-xs font-bold transition-all',
                          profileForm.gender === g.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-500 hover:border-surface-300')}
                        onClick={() => setProfileForm(p => ({ ...p, gender: g.value }))}>
                        <span className="mr-0.5">{g.icon}</span> {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Province */}
              <div>
                <label className="text-[11px] text-surface-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                  <Icon name="location_on" size={12} /> 🇮🇹 {t('profile.province_label')}
                </label>
                <select className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                  value={profileForm.province} onChange={e => setProfileForm(p => ({ ...p, province: e.target.value }))}>
                  <option value="">{t('profile.select_city')}</option>
                  {ITALIAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="text-[11px] text-surface-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                  <Icon name="phone" size={12} /> {t('profile.phone_label')}
                </label>
                <div className="flex gap-2">
                  <select className="w-28 border border-surface-200 rounded-xl px-2 py-2.5 text-sm shrink-0 focus:outline-none focus:border-primary-400"
                    value={profileForm.phoneCode} onChange={e => setProfileForm(p => ({ ...p, phoneCode: e.target.value }))}>
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.country.split(' ')[0]} {c.code}</option>)}
                  </select>
                  <input type="tel" dir="ltr"
                    className={cn('flex-1 border rounded-xl px-3 py-2.5 text-sm text-left focus:outline-none focus:border-primary-400',
                      profilePhoneError ? 'border-danger-400 bg-danger-50' : 'border-surface-200')}
                    placeholder="1234567890" value={profileForm.phone}
                    onChange={e => {
                      const val = e.target.value;
                      setProfileForm(p => ({ ...p, phone: val }));
                      const raw = val.replace(/\D/g, '');
                      if (val && (raw.length < 7 || raw.length > 15)) setProfilePhoneError(t('profile.phone_invalid'));
                      else setProfilePhoneError('');
                    }} />
                </div>
                {profilePhoneError && <p className="text-[11px] text-danger-500 mt-1">{profilePhoneError}</p>}
              </div>

              {/* Italian level */}
              <div>
                <label className="text-[11px] text-surface-500 font-semibold mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                  <Icon name="translate" size={12} /> {t('profile.italian_level')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'weak', label: t('profile.level_beginner'), desc: t('profile.level_beginner_desc'), icon: '🌱' },
                    { value: 'good', label: t('profile.level_medium'), desc: t('profile.level_medium_desc'), icon: '📖' },
                    { value: 'very_good', label: t('profile.level_advanced'), desc: t('profile.level_advanced_desc'), icon: '🎯' },
                    { value: 'native', label: t('profile.level_native'), desc: t('profile.level_native_desc'), icon: '🇮🇹' },
                  ].map(l => (
                    <button key={l.value}
                      className={cn('p-2.5 rounded-xl border-2 text-right transition-all',
                        profileForm.italianLevel === l.value ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300')}
                      onClick={() => setProfileForm(p => ({ ...p, italianLevel: l.value }))}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{l.icon}</span>
                        <div>
                          <p className={cn('text-xs font-bold', profileForm.italianLevel === l.value ? 'text-primary-700' : 'text-surface-700')}>{l.label}</p>
                          <p className="text-[9px] text-surface-400">{l.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-6 pt-2 flex gap-3 shrink-0 border-t border-surface-50">
              <button className="px-4 py-2.5 text-sm text-surface-400 hover:text-surface-600 transition-colors" onClick={() => setShowCompleteProfile(false)}>
                {t('profile.later')}
              </button>
              <Button fullWidth onClick={handleSaveProfile}>
                <Icon name="check_circle" size={16} className="ml-1.5" /> {t('profile.save_data')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
