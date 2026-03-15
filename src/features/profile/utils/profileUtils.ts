import type { ExamReadinessLevel } from '@/infrastructure/database/services/examReadinessService';

// ─── Text direction helper ─────────────────────────────────────────────────────

export function getTextDir(text: string): 'rtl' | 'ltr' {
  return /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';
}

// ─── Exam readiness level styles ─────────────────────────────────────────────

export const LEVEL_STYLE: Record<ExamReadinessLevel, { bg: string; text: string; bar: string; badge: string }> = {
  not_ready:  { bg: 'bg-red-50',     text: 'text-red-600',     bar: 'bg-red-400',     badge: 'bg-red-100 text-red-600' },
  beginner:   { bg: 'bg-orange-50',  text: 'text-orange-600',  bar: 'bg-orange-400',  badge: 'bg-orange-100 text-orange-600' },
  developing: { bg: 'bg-yellow-50',  text: 'text-yellow-600',  bar: 'bg-yellow-400',  badge: 'bg-yellow-100 text-yellow-700' },
  ready:      { bg: 'bg-green-50',   text: 'text-green-600',   bar: 'bg-green-500',   badge: 'bg-green-100 text-green-700' },
  excellent:  { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
};

// ─── Italian provinces ────────────────────────────────────────────────────────

export const ITALIAN_PROVINCES = [
  'Agrigento','Alessandria','Ancona','Aosta','Arezzo','Ascoli Piceno','Asti','Avellino','Bari','Barletta-Andria-Trani',
  'Belluno','Benevento','Bergamo','Biella','Bologna','Bolzano','Brescia','Brindisi','Cagliari','Caltanissetta',
  'Campobasso','Caserta','Catania','Catanzaro','Chieti','Como','Cosenza','Cremona','Crotone','Cuneo',
  'Enna','Fermo','Ferrara','Firenze','Foggia','Forlì-Cesena','Frosinone','Genova','Gorizia','Grosseto',
  'Imperia','Isernia','La Spezia',"L'Aquila",'Latina','Lecce','Lecco','Livorno','Lodi','Lucca',
  'Macerata','Mantova','Massa-Carrara','Matera','Messina','Milano','Modena','Monza e Brianza','Napoli','Novara',
  'Nuoro','Oristano','Padova','Palermo','Parma','Pavia','Perugia','Pesaro e Urbino','Pescara','Piacenza',
  'Pisa','Pistoia','Pordenone','Potenza','Prato','Ragusa','Ravenna','Reggio Calabria','Reggio Emilia','Rieti',
  'Rimini','Roma','Rovigo','Salerno','Sassari','Savona','Siena','Siracusa','Sondrio','Sud Sardegna',
  'Taranto','Teramo','Terni','Torino','Trapani','Trento','Treviso','Trieste','Udine','Varese',
  'Venezia','Verbano-Cusio-Ossola','Vercelli','Verona','Vibo Valentia','Vicenza','Viterbo',
];

// ─── Country codes ────────────────────────────────────────────────────────────

export const COUNTRY_CODES = [
  { code: '+39',  country: '🇮🇹 إيطاليا' },  { code: '+966', country: '🇸🇦 السعودية' },
  { code: '+20',  country: '🇪🇬 مصر' },       { code: '+962', country: '🇯🇴 الأردن' },
  { code: '+961', country: '🇱🇧 لبنان' },     { code: '+964', country: '🇮🇶 العراق' },
  { code: '+963', country: '🇸🇾 سوريا' },     { code: '+970', country: '🇵🇸 فلسطين' },
  { code: '+212', country: '🇲🇦 المغرب' },    { code: '+213', country: '🇩🇿 الجزائر' },
  { code: '+216', country: '🇹🇳 تونس' },      { code: '+218', country: '🇱🇾 ليبيا' },
  { code: '+971', country: '🇦🇪 الإمارات' },  { code: '+974', country: '🇶🇦 قطر' },
  { code: '+968', country: '🇴🇲 عمان' },      { code: '+973', country: '🇧🇭 البحرين' },
  { code: '+965', country: '🇰🇼 الكويت' },    { code: '+967', country: '🇾🇪 اليمن' },
  { code: '+249', country: '🇸🇩 السودان' },   { code: '+90',  country: '🇹🇷 تركيا' },
  { code: '+49',  country: '🇩🇪 ألمانيا' },   { code: '+33',  country: '🇫🇷 فرنسا' },
  { code: '+44',  country: '🇬🇧 بريطانيا' },  { code: '+34',  country: '🇪🇸 إسبانيا' },
  { code: '+1',   country: '🇺🇸 أمريكا' },
];

// ─── Change-cooldown helper ───────────────────────────────────────────────────

export const DAYS_60_MS = 60 * 24 * 60 * 60 * 1000;

export function getDaysLeftOnCooldown(changeDate: string | undefined): number | null {
  if (!changeDate) return null;
  const diff = Date.now() - new Date(changeDate).getTime();
  if (diff >= DAYS_60_MS) return null;
  return Math.ceil((DAYS_60_MS - diff) / (24 * 60 * 60 * 1000));
}
