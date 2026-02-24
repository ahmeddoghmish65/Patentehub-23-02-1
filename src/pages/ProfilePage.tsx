import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { verifyPassword, hashPassword, getDB } from '@/db/database';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
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

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, logout, updateSettings, updateProfile, mistakes, loadMistakes } = useAuthStore();
  
  const [showEditPage, setShowEditPage] = useState(false);
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
  const [profileForm, setProfileForm] = useState({
    birthDate: '', country: 'Italia', province: '', gender: '',
    phoneCode: '+39', phone: '', italianLevel: '',
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadMistakes(); }, [loadMistakes]);

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
    if (file.size > 5 * 1024 * 1024) { alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت'); return; }
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
        setSaveMsg(`❌ لا يمكن تغيير الاسم إلا بعد ${daysLeft} يوم`); return;
      }
    }
    // 60-day cooldown for username
    if (editForm.username && editForm.username !== user.username && u.usernameChangeDate) {
      const diff = now.getTime() - new Date(u.usernameChangeDate).getTime();
      if (diff < DAYS_60) {
        const daysLeft = Math.ceil((DAYS_60 - diff) / (24 * 60 * 60 * 1000));
        setSaveMsg(`❌ لا يمكن تغيير اسم المستخدم إلا بعد ${daysLeft} يوم`); return;
      }
    }
    // Phone validation
    const rawPhone = editForm.phone.replace(/\D/g, '');
    if (editForm.phone && (rawPhone.length < 7 || rawPhone.length > 15)) {
      setPhoneError('رقم الهاتف غير صالح (7-15 رقم)'); return;
    }
    setPhoneError('');
    // Username uniqueness check
    if (editForm.username && editForm.username !== user.username) {
      if (usernameStatus === 'taken') { setSaveMsg('❌ اسم المستخدم مأخوذ'); return; }
      if (!/^[a-zA-Z0-9_.]{3,20}$/.test(editForm.username)) { setSaveMsg('❌ اسم المستخدم: 3-20 حرف إنجليزي أو رقم أو _ أو .'); return; }
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
    setSaveMsg('✓ تم حفظ التعديلات بنجاح');
    setTimeout(() => { setSaveMsg(''); setShowEditPage(false); window.location.reload(); }, 1500);
  };

  const handleChangePassword = async () => {
    setPasswordMsg('');
    if (!currentPassword) { setPasswordMsg('يرجى إدخال كلمة المرور الحالية'); return; }
    if (!newPassword || newPassword.length < 6) { setPasswordMsg('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg('كلمة المرور الجديدة وتأكيدها غير متطابقين'); return; }
    const db = await getDB();
    const fullUser = await db.get('users', user.id);
    if (!fullUser) { setPasswordMsg('حدث خطأ'); return; }
    const isValid = await verifyPassword(currentPassword, fullUser.password);
    if (!isValid) { setPasswordMsg('كلمة المرور الحالية غير صحيحة'); return; }
    fullUser.password = await hashPassword(newPassword);
    await db.put('users', fullUser);
    setPasswordMsg('✓ تم تغيير كلمة المرور بنجاح');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const onEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت'); return; }
    const reader = new FileReader();
    reader.onload = () => { updateProfile({ avatar: reader.result as string }); };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const { birthDate, province, gender, phoneCode, phone, italianLevel } = profileForm;
    if (!birthDate || !province || !gender || !phone || !italianLevel) {
      alert('يرجى ملء جميع الحقول المطلوبة'); return;
    }
    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length < 7 || rawPhone.length > 15) {
      setProfilePhoneError('رقم الهاتف غير صالح (7-15 رقم)'); return;
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
    { value: 'ar' as const, label: 'العربية فقط', icon: '🇸🇦' },
    { value: 'it' as const, label: 'Solo italiano', icon: '🇮🇹' },
    { value: 'both' as const, label: 'العربية + الإيطالية', icon: '🌐' },
  ];

  const allBadges = [
    { id: 'newcomer', name: 'عضو جديد', icon: 'waving_hand', color: 'bg-blue-500' },
    { id: 'quiz_master', name: 'خبير الاختبارات', icon: 'quiz', color: 'bg-purple-500' },
    { id: 'perfect_score', name: 'علامة كاملة', icon: 'star', color: 'bg-yellow-500' },
    { id: 'week_streak', name: 'أسبوع متواصل', icon: 'local_fire_department', color: 'bg-orange-500' },
    { id: 'level_5', name: 'المستوى 5', icon: 'military_tech', color: 'bg-green-500' },
  ];

  // ==================== EDIT PAGE (not overlay - inline page) ====================
  if (showEditPage) {
    return (
      <div className="max-w-lg mx-auto space-y-5 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setShowEditPage(false)} className="flex items-center gap-2 text-surface-500 hover:text-primary-600">
            <Icon name="arrow_forward" size={22} />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <h2 className="text-lg font-bold text-surface-900">تعديل الحساب</h2>
          <div className="w-16" />
        </div>

        {/* Avatar */}
        <div className="text-center">
          <input type="file" ref={editFileRef} className="hidden" accept="image/*" onChange={onEditFileChange} />
          <div className="relative inline-block">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">{user.name.charAt(0)}</span>
              </div>
            )}
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-600"
              onClick={() => editFileRef.current?.click()}>
              <Icon name="camera_alt" size={16} />
            </button>
            {user.avatar && (
              <button className="absolute -top-2 -left-2 w-7 h-7 bg-danger-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-danger-600 border-2 border-white"
                onClick={handleDeleteAvatar}>
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
          <p className="text-xs text-surface-400 mt-3">اضغط على الكاميرا لتغيير الصورة</p>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-5 border border-surface-100">
          <h3 className="text-sm font-bold text-surface-800 mb-4 flex items-center gap-2">
            <Icon name="person" size={18} className="text-primary-500" /> المعلومات الشخصية
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-surface-500 mb-1 block">الاسم الأول</label>
                <input className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm" value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-surface-500 mb-1 block">اسم العائلة</label>
                <input className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm" value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            {(() => {
              if (!changeDates.name) return null;
              const diff = Date.now() - new Date(changeDates.name).getTime();
              const DAYS_60 = 60 * 24 * 60 * 60 * 1000;
              if (diff >= DAYS_60) return null;
              const daysLeft = Math.ceil((DAYS_60 - diff) / (24 * 60 * 60 * 1000));
              return <p className="text-[11px] text-warning-600 bg-warning-50 rounded-lg px-3 py-1.5 flex items-center gap-1"><Icon name="schedule" size={12} /> يمكن تغيير الاسم بعد {daysLeft} يوم</p>;
            })()}
            <div>
              <label className="text-xs text-surface-500 mb-1 block">اسم المستخدم</label>
              <div className="relative">
                <input
                  className={cn('w-full border rounded-xl px-3 py-2.5 text-sm pr-9', usernameStatus === 'taken' ? 'border-danger-400 bg-danger-50' : usernameStatus === 'ok' ? 'border-success-400' : 'border-surface-200')}
                  dir="ltr"
                  value={editForm.username}
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
                  }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <Icon name="refresh" size={16} className="text-surface-400 animate-spin" />}
                  {usernameStatus === 'ok' && <Icon name="check_circle" size={16} className="text-success-500" filled />}
                  {usernameStatus === 'taken' && <Icon name="cancel" size={16} className="text-danger-500" filled />}
                  {usernameStatus === 'invalid' && <Icon name="error" size={16} className="text-warning-500" filled />}
                </span>
              </div>
              {usernameStatus === 'taken' && <p className="text-[11px] text-danger-500 mt-0.5">اسم المستخدم مأخوذ</p>}
              {usernameStatus === 'invalid' && <p className="text-[11px] text-warning-500 mt-0.5">3-20 حرف: حروف إنجليزية، أرقام، _ أو .</p>}
              {usernameStatus === 'ok' && <p className="text-[11px] text-success-500 mt-0.5">اسم المستخدم متاح ✓</p>}
              {(() => {
                if (!changeDates.username) return null;
                const diff = Date.now() - new Date(changeDates.username).getTime();
                const DAYS_60 = 60 * 24 * 60 * 60 * 1000;
                if (diff >= DAYS_60) return null;
                const daysLeft = Math.ceil((DAYS_60 - diff) / (24 * 60 * 60 * 1000));
                return <p className="text-[11px] text-warning-600 bg-warning-50 rounded-lg px-3 py-1.5 flex items-center gap-1 mt-0.5"><Icon name="schedule" size={12} /> يمكن تغيير اليوزرنيم بعد {daysLeft} يوم</p>;
              })()}
            </div>
            <div>
              <label className="text-xs text-surface-500 mb-1 block">نبذة عني</label>
              <textarea className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm resize-none" rows={2} value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} maxLength={150} placeholder="اكتب نبذة عنك..." />
              <span className="text-[10px] text-surface-400">{editForm.bio.length}/150</span>
            </div>
            <div>
              <label className="text-xs text-surface-500 mb-1 block">تاريخ الميلاد</label>
              <input type="date" className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm block" style={{ boxSizing: 'border-box' }} value={editForm.birthDate} onChange={e => setEditForm(f => ({ ...f, birthDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-surface-500 mb-1 block">الجنس</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: 'male', label: 'ذكر ♂️' }, { value: 'female', label: 'أنثى ♀️' }].map(g => (
                  <button key={g.value} className={cn('py-2.5 rounded-xl border-2 text-sm font-medium', editForm.gender === g.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-600')}
                    onClick={() => setEditForm(f => ({ ...f, gender: g.value }))}>{g.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-5 border border-surface-100">
          <h3 className="text-sm font-bold text-surface-800 mb-4 flex items-center gap-2">
            <Icon name="contact_mail" size={18} className="text-primary-500" /> معلومات الاتصال
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-surface-500 mb-1 block">البريد الإلكتروني</label>
              <input type="email" dir="ltr" className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-left" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-surface-500 mb-1 block">رقم الهاتف</label>
              <div className="flex gap-2">
                <select className="w-28 border border-surface-200 rounded-xl px-2 py-2.5 text-sm shrink-0" value={editForm.phoneCode} onChange={e => setEditForm(f => ({ ...f, phoneCode: e.target.value }))}>
                  {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.country.split(' ')[0]} {c.code}</option>)}
                </select>
                <input type="tel" dir="ltr" className={cn('flex-1 border rounded-xl px-3 py-2.5 text-sm text-left', phoneError ? 'border-danger-400 bg-danger-50' : 'border-surface-200')}
                  value={editForm.phone}
                  onChange={e => {
                    const val = e.target.value;
                    setEditForm(f => ({ ...f, phone: val }));
                    const raw = val.replace(/\D/g, '');
                    if (val && (raw.length < 7 || raw.length > 15)) setPhoneError('رقم غير صالح (7-15 رقم)');
                    else setPhoneError('');
                  }}
                  placeholder="1234567890" />
              </div>
              {phoneError && <p className="text-[11px] text-danger-500 mt-0.5">{phoneError}</p>}
            </div>
            <div>
              <label className="text-xs text-surface-500 mb-1 block">المحافظة (Provincia)</label>
              <select className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm" value={editForm.province} onChange={e => setEditForm(f => ({ ...f, province: e.target.value }))}>
                <option value="">اختر المحافظة</option>
                {ITALIAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-surface-500 mb-1 block">مستوى الإيطالية</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: 'weak', label: 'ضعيف' }, { value: 'good', label: 'جيد' }, { value: 'very_good', label: 'جيد جداً' }, { value: 'native', label: 'أنا إيطالي' }].map(l => (
                  <button key={l.value} className={cn('py-2 rounded-xl border-2 text-xs font-medium', editForm.italianLevel === l.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-600')}
                    onClick={() => setEditForm(f => ({ ...f, italianLevel: l.value }))}>{l.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl p-5 border border-surface-100">
          <h3 className="text-sm font-bold text-surface-800 mb-4 flex items-center gap-2">
            <Icon name="lock" size={18} className="text-primary-500" /> الخصوصية
          </h3>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm text-surface-700">إخفاء إحصائياتي</p>
              <p className="text-xs text-surface-400">لن يتمكن الآخرون من رؤية إحصائياتك</p>
            </div>
            <button
              className={cn('w-12 h-6 rounded-full transition-colors relative', editForm.privacyHideStats ? 'bg-primary-500' : 'bg-surface-200')}
              onClick={() => setEditForm(f => ({ ...f, privacyHideStats: !f.privacyHideStats }))}
            >
              <div className={cn('w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all', editForm.privacyHideStats ? 'left-0.5' : 'left-6')} />
            </button>
          </label>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl p-5 border border-surface-100">
          <h3 className="text-sm font-bold text-surface-800 mb-4 flex items-center gap-2">
            <Icon name="security" size={18} className="text-primary-500" /> تغيير كلمة المرور
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-surface-500 mb-1 block">كلمة المرور الحالية</label>
              <input type="password" dir="ltr" className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-left" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-surface-500 mb-1 block">كلمة المرور الجديدة</label>
              <input type="password" dir="ltr" className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-left" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="6 أحرف على الأقل" />
            </div>
            <div>
              <label className="text-xs text-surface-500 mb-1 block">تأكيد كلمة المرور الجديدة</label>
              <input type="password" dir="ltr" className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-left" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-danger-500">❌ كلمة المرور غير متطابقة</p>}
            {passwordMsg && <p className={cn('text-xs', passwordMsg.includes('✓') ? 'text-success-600' : 'text-danger-500')}>{passwordMsg}</p>}
            <Button size="sm" onClick={handleChangePassword} disabled={!currentPassword || !newPassword}>تغيير كلمة المرور</Button>
          </div>
        </div>

        {/* Save */}
        {saveMsg && (
          <div className={cn('rounded-xl p-3 text-center text-sm font-medium', saveMsg.includes('✓') ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600')}>
            {saveMsg}
          </div>
        )}
        <Button fullWidth size="lg" onClick={handleSaveEdit}>
          <Icon name="save" size={20} className="ml-2" /> حفظ جميع التعديلات
        </Button>
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
                onClick={handleDeleteAvatar} title="حذف الصورة">
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
              <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">المستوى {progress.level}</span>
              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">{progress.xp} XP</span>
              {!user.profileComplete && (
                <button className="text-xs bg-warning-50 text-warning-600 px-2 py-0.5 rounded-full font-medium animate-pulse" onClick={() => setShowCompleteProfile(true)}>
                  ⚠️ أكمل بياناتك
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'اختبارات', value: String(progress.totalQuizzes), icon: 'quiz', color: 'text-blue-500' },
            { label: 'الدقة', value: `${accuracy}%`, icon: 'check_circle', color: 'text-green-500' },
            { label: 'السلسلة', value: `${progress.currentStreak}`, icon: 'local_fire_department', color: 'text-orange-500' },
            { label: 'الجاهزية', value: `${progress.examReadiness}%`, icon: 'verified', color: 'text-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-50 rounded-xl p-2.5 text-center">
              <Icon name={stat.icon} size={18} className={cn(stat.color, 'mb-0.5')} filled />
              <p className="text-base font-bold text-surface-900">{stat.value}</p>
              <p className="text-[10px] text-surface-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-xl p-5 border border-surface-100">
        <h2 className="font-bold text-surface-900 mb-2 flex items-center gap-2"><Icon name="translate" size={20} className="text-primary-500" /> لغة عرض المحتوى</h2>
        <p className="text-xs text-surface-400 mb-4">تؤثر فقط على عرض المحتوى في الدروس والأسئلة والإشارات والقاموس</p>
        <div className="grid grid-cols-3 gap-2">
          {languageOptions.map(opt => (
            <button key={opt.value} className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all', settings.language === opt.value ? 'border-primary-500 bg-primary-50' : 'border-surface-100 hover:border-surface-200')} onClick={() => updateSettings({ language: opt.value })}>
              <span className="text-xl">{opt.icon}</span>
              <span className={cn('text-xs font-medium', settings.language === opt.value ? 'text-primary-700' : 'text-surface-600')}>{opt.label}</span>
              {settings.language === opt.value && <Icon name="check_circle" size={16} className="text-primary-500" filled />}
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Exam Readiness */}
      <div className="bg-white rounded-xl p-5 border border-surface-100">
        <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
          <Icon name="trending_up" size={20} className="text-primary-500" /> التقدم والإحصائيات
        </h2>

        {/* Exam Readiness */}
        <div className="bg-surface-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon name="verified" size={18} className="text-primary-500" filled />
              <span className="text-sm font-semibold text-surface-800">جاهزية الامتحان</span>
            </div>
            <span className={cn('text-lg font-bold', progress.examReadiness >= 70 ? 'text-success-500' : progress.examReadiness >= 40 ? 'text-warning-500' : 'text-danger-500')}>{progress.examReadiness}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 mb-1.5">
            <div className={cn('rounded-full h-2.5 transition-all duration-700', progress.examReadiness >= 70 ? 'bg-success-500' : progress.examReadiness >= 40 ? 'bg-warning-500' : 'bg-danger-500')} style={{ width: `${progress.examReadiness}%` }} />
          </div>
          <p className="text-xs text-surface-500">{progress.examReadiness >= 70 ? '🎉 أنت جاهز للامتحان!' : progress.examReadiness >= 40 ? '📚 تقدم جيد، واصل الدراسة' : '🚀 ابدأ بحل الاختبارات'}</p>
        </div>

        {/* Answer Distribution Chart */}
        {totalAnswers > 0 ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-surface-500">توزيع الإجابات</span>
              <span className="text-xs font-semibold text-surface-700">{totalAnswers} إجمالي</span>
            </div>
            <div className="w-full bg-danger-100 rounded-full h-2.5 overflow-hidden flex mb-2">
              <div className="h-full bg-success-500 rounded-full transition-all duration-700" style={{ width: `${accuracy}%` }} title={`صحيح: ${progress.correctAnswers}`} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success-500 inline-block" /><span className="text-surface-600">صحيح <strong className="text-success-600">{progress.correctAnswers}</strong></span></span>
              <span className="text-surface-500 font-semibold">{accuracy}% دقة</span>
              <span className="flex items-center gap-1"><span className="text-surface-600">خاطئ <strong className="text-danger-500">{progress.wrongAnswers}</strong></span><span className="w-2.5 h-2.5 rounded-full bg-danger-400 inline-block" /></span>
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-surface-50 rounded-xl p-4 text-center">
            <Icon name="quiz" size={28} className="text-surface-300 mx-auto mb-2" />
            <p className="text-sm text-surface-400">لم تحل اختبارات بعد</p>
          </div>
        )}

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'إجمالي الاختبارات', value: progress.totalQuizzes, icon: 'quiz', color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'السلسلة الحالية', value: `${progress.currentStreak} يوم`, icon: 'local_fire_department', color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'النقاط (XP)', value: progress.xp, icon: 'stars', color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'الدروس المكتملة', value: progress.completedLessons.length, icon: 'school', color: 'text-green-500', bg: 'bg-green-50' },
          ].map((m, i) => (
            <div key={i} className={cn('rounded-xl p-3 flex items-center gap-3', m.bg)}>
              <Icon name={m.icon} size={22} className={m.color} filled />
              <div>
                <p className="text-base font-bold text-surface-900">{m.value}</p>
                <p className="text-[10px] text-surface-500">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl p-5 border border-surface-100">
        <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2"><Icon name="emoji_events" size={20} className="text-orange-500" /> الإنجازات ({progress.badges.length}/{allBadges.length})</h2>
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
          <h2 className="font-bold text-surface-900 flex items-center gap-2"><Icon name="manage_accounts" size={20} className="text-surface-500" /> إدارة الحساب</h2>
        </div>

        {/* Edit Account */}
        <button className="w-full px-5 py-4 flex items-center gap-3 hover:bg-surface-50 transition-colors border-b border-surface-50 group" onClick={openEditPage}>
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors shrink-0">
            <Icon name="edit" size={18} className="text-primary-500" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold text-surface-800">تعديل بيانات الحساب</p>
            <p className="text-xs text-surface-400">الاسم، الصورة، البريد، كلمة المرور، الخصوصية...</p>
          </div>
          <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors" />
        </button>

        {/* Admin Panel */}
        {isAdmin && (
          <button className="w-full px-5 py-4 flex items-center gap-3 hover:bg-primary-50 transition-colors border-b border-surface-50 group" onClick={() => onNavigate('admin')}>
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon name="admin_panel_settings" size={18} className="text-primary-600" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-semibold text-surface-800">لوحة التحكم</p>
              <p className="text-xs text-surface-400">إدارة المحتوى والمستخدمين</p>
            </div>
            <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors" />
          </button>
        )}

        {/* Account Info */}
        <div className="px-5 py-3 space-y-1">
          <div className="flex justify-between text-sm py-1.5 border-b border-surface-50"><span className="text-surface-500">تاريخ التسجيل</span><span className="text-surface-700">{new Date(user.createdAt).toLocaleDateString('ar')}</span></div>
          <div className="flex justify-between text-sm py-1.5 border-b border-surface-50"><span className="text-surface-500">آخر دخول</span><span className="text-surface-700">{new Date(user.lastLogin).toLocaleDateString('ar')}</span></div>
          <div className="flex justify-between text-sm py-1.5"><span className="text-surface-500">نوع الحساب</span><span className="text-primary-600 font-medium">{user.role === 'admin' ? 'مسؤول' : user.role === 'manager' ? 'مدير' : 'مستخدم'}</span></div>
        </div>

        {!user.profileComplete && (
          <div className="px-5 pb-3">
            <button className="w-full bg-warning-50 text-warning-700 rounded-lg py-2.5 text-sm font-medium border border-warning-200 hover:bg-warning-100" onClick={() => setShowCompleteProfile(true)}>
              ⚠️ أكمل بياناتك الشخصية
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="px-5 py-4 border-t border-surface-100">
          <button className="w-full flex items-center justify-center gap-2 bg-danger-50 text-danger-600 rounded-xl py-3 text-sm font-semibold hover:bg-danger-100 transition-colors border border-danger-100" onClick={handleLogout}>
            <Icon name="logout" size={18} />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Profile Completion Modal */}
      {showCompleteProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
                <Icon name="person_add" size={32} className="text-primary-500" filled />
              </div>
              <h3 className="text-lg font-bold text-surface-900">أكمل بياناتك الشخصية</h3>
              <p className="text-sm text-surface-500 mt-1">لاستمرار استخدام جميع ميزات التطبيق</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">تاريخ الميلاد *</label>
                <input type="date" className="w-full border border-surface-200 rounded-xl p-3 text-sm block" style={{ boxSizing: 'border-box' }} value={profileForm.birthDate} onChange={e => setProfileForm(p => ({ ...p, birthDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">الدولة *</label>
                <select className="w-full border border-surface-200 rounded-xl p-3 text-sm bg-surface-50" disabled>
                  <option>🇮🇹 Italia (إيطاليا)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">المحافظة *</label>
                <select className="w-full border border-surface-200 rounded-xl p-3 text-sm" value={profileForm.province} onChange={e => setProfileForm(p => ({ ...p, province: e.target.value }))}>
                  <option value="">اختر المحافظة</option>
                  {ITALIAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">الجنس *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ value: 'male', label: 'ذكر ♂️' }, { value: 'female', label: 'أنثى ♀️' }].map(g => (
                    <button key={g.value} className={cn('p-3 rounded-xl border-2 text-sm font-medium', profileForm.gender === g.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-600')} onClick={() => setProfileForm(p => ({ ...p, gender: g.value }))}>{g.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">رقم الهاتف *</label>
                <div className="flex gap-2">
                  <select className="w-28 border border-surface-200 rounded-xl p-3 text-sm shrink-0" value={profileForm.phoneCode} onChange={e => setProfileForm(p => ({ ...p, phoneCode: e.target.value }))}>
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.country.split(' ')[0]} {c.code}</option>)}
                  </select>
                  <input type="tel" dir="ltr" className={cn('flex-1 border rounded-xl p-3 text-sm text-left', profilePhoneError ? 'border-danger-400 bg-danger-50' : 'border-surface-200')}
                    placeholder="1234567890"
                    value={profileForm.phone}
                    onChange={e => {
                      const val = e.target.value;
                      setProfileForm(p => ({ ...p, phone: val }));
                      const raw = val.replace(/\D/g, '');
                      if (val && (raw.length < 7 || raw.length > 15)) setProfilePhoneError('رقم غير صالح (7-15 رقم)');
                      else setProfilePhoneError('');
                    }} />
                </div>
                {profilePhoneError && <p className="text-[11px] text-danger-500 mt-0.5">{profilePhoneError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">مستوى الإيطالية *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ value: 'weak', label: 'ضعيف' }, { value: 'good', label: 'جيد' }, { value: 'very_good', label: 'جيد جداً' }, { value: 'native', label: 'أنا إيطالي' }].map(l => (
                    <button key={l.value} className={cn('p-2.5 rounded-xl border-2 text-xs font-medium', profileForm.italianLevel === l.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 text-surface-600')} onClick={() => setProfileForm(p => ({ ...p, italianLevel: l.value }))}>{l.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button fullWidth variant="ghost" onClick={() => setShowCompleteProfile(false)}>لاحقاً</Button>
              <Button fullWidth onClick={handleSaveProfile}>حفظ البيانات</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
