import { useState } from 'react';
import { useLocaleNavigate } from '@/shared/hooks/useLocaleNavigate';
import { ROUTES } from '@/shared/constants';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/i18n';
import { PageMeta } from '@/shared/hooks/usePageMeta';

const sectionsAr = [
  { id: 'acceptance', title: 'قبول الشروط', icon: 'handshake' },
  { id: 'purpose', title: 'هدف التطبيق', icon: 'school' },
  { id: 'eligibility', title: 'شروط الأهلية', icon: 'person_check' },
  { id: 'account', title: 'قواعد الحساب', icon: 'manage_accounts' },
  { id: 'responsibilities', title: 'مسؤوليات المستخدم', icon: 'assignment' },
  { id: 'ip', title: 'الملكية الفكرية', icon: 'copyright' },
  { id: 'liability', title: 'حدود المسؤولية', icon: 'gavel' },
  { id: 'termination', title: 'إنهاء الوصول', icon: 'block' },
  { id: 'updates', title: 'تحديثات الشروط', icon: 'update' },
  { id: 'contact', title: 'معلومات الاتصال', icon: 'contact_mail' },
];

const sectionsIt = [
  { id: 'acceptance', title: 'Accettazione dei termini', icon: 'handshake' },
  { id: 'purpose', title: 'Scopo dell\'app', icon: 'school' },
  { id: 'eligibility', title: 'Requisiti di accesso', icon: 'person_check' },
  { id: 'account', title: 'Regole dell\'account', icon: 'manage_accounts' },
  { id: 'responsibilities', title: 'Responsabilità dell\'utente', icon: 'assignment' },
  { id: 'ip', title: 'Proprietà intellettuale', icon: 'copyright' },
  { id: 'liability', title: 'Limitazione di responsabilità', icon: 'gavel' },
  { id: 'termination', title: 'Chiusura dell\'account', icon: 'block' },
  { id: 'updates', title: 'Aggiornamento dei termini', icon: 'update' },
  { id: 'contact', title: 'Informazioni di contatto', icon: 'contact_mail' },
];

export function TermsOfServicePage() {
  const { navigate, goBack } = useLocaleNavigate();
  const [activeSection, setActiveSection] = useState('acceptance');
  const { uiLang } = useTranslation();
  const isIt = uiLang === 'it';
  const sections = isIt ? sectionsIt : sectionsAr;

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      <PageMeta
        title={isIt ? 'Termini di Servizio – Patente Hub' : 'شروط الخدمة – Patente Hub'}
        description={isIt
          ? 'Leggi i Termini di Servizio di Patente Hub. Condizioni d\'uso, responsabilità, proprietà intellettuale e regole dell\'account.'
          : 'اقرأ شروط الخدمة لتطبيق Patente Hub. شروط الاستخدام والمسؤوليات وقواعد الحساب.'}
        canonical={`https://patentehub.com/${uiLang}/terms-of-service`}
        noIndex={false}
      />
      <div className="min-h-screen bg-surface-50 animate-fade-in-up">
      <header className="sticky top-0 z-50 bg-white border-b border-surface-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button onClick={() => goBack(ROUTES.LANDING)} className="flex items-center gap-1.5 text-surface-500 hover:text-primary-600 transition-colors">
            <Icon name="arrow_forward" size={20} className="ltr:rotate-180" />
            <span className="text-sm font-medium">{isIt ? 'Indietro' : 'رجوع'}</span>
          </button>
          <h1 className="text-base font-bold text-surface-900">{isIt ? 'Termini di servizio' : 'شروط الاستخدام'}</h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
              <Icon name="directions_car" size={16} className="text-white" filled />
            </div>
            <span className="text-sm font-bold text-surface-900 hidden sm:block">Patente Hub</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-2xl p-8 text-center text-white mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
              <Icon name="gavel" size={32} className="text-white" filled />
            </div>
            <h1 className="text-3xl font-black mb-2">{isIt ? 'Termini di servizio' : 'شروط الاستخدام'}</h1>
            <p className="text-surface-300 text-sm">{isIt ? 'Ultimo aggiornamento: gennaio 2025 · Si prega di leggere prima dell\'uso' : 'آخر تحديث: يناير 2025 · يرجى القراءة قبل الاستخدام'}</p>
          </div>
        </div>

        <div className="bg-warning-50 border border-warning-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
          <Icon name="warning" size={20} className="text-warning-500 shrink-0 mt-0.5" filled />
          <p className="text-sm text-warning-700 leading-relaxed">
            {isIt
              ? <><strong>Importante:</strong> Utilizzando Patente Hub, confermi di aver letto questi termini e di accettarli. Se non sei d'accordo, ti preghiamo di interrompere l'utilizzo dell'app.</>
              : <><strong>مهم:</strong> باستخدامك لتطبيق Patente Hub، فإنك تؤكد قراءتك لهذه الشروط وموافقتك عليها. إذا كنت لا توافق، يرجى التوقف عن استخدام التطبيق.</>
            }
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-6">
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl p-4 border border-surface-100 shadow-sm sticky top-6">
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">{isIt ? 'Contenuto' : 'المحتويات'}</p>
              <nav className="space-y-0.5">
                {sections.map(section => (
                  <button key={section.id} onClick={() => scrollToSection(section.id)}
                    className={`w-full ${isIt ? 'text-left' : 'text-right'} flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all ${activeSection === section.id ? 'bg-surface-900 text-white font-semibold' : 'text-surface-500 hover:text-surface-800 hover:bg-surface-50'}`}>
                    <Icon name={section.icon} size={14} className={activeSection === section.id ? 'text-white' : 'text-surface-400'} />
                    <span className="leading-tight">{section.title}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-surface-100">
                <button onClick={() => navigate(ROUTES.CONTACT)} className="w-full flex items-center justify-center gap-1.5 text-xs bg-surface-800 text-white px-3 py-2 rounded-xl hover:bg-surface-900 transition-colors font-medium">
                  <Icon name="mail" size={14} />
                  {isIt ? 'Contattaci' : 'تواصل معنا'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-5">
            {isIt ? (
              <>
                <section id="acceptance" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="handshake" size={18} className="text-surface-600" filled /></span>
                    Accettazione dei termini
                  </h2>
                  <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
                    <p>Questo documento costituisce un accordo legalmente vincolante tra te e <strong className="text-surface-900">Patente Hub</strong>. Registrandoti o utilizzando l'app in qualsiasi modo, confermi:</p>
                    <ul className="space-y-2 ml-4">
                      {['Di aver letto e compreso integralmente questi termini', 'Di accettare di rispettare tutte le condizioni', 'Di avere almeno 16 anni, o di essere sotto la supervisione di un tutore', 'Di avere la capacità legale di stipulare questo accordo'].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-success-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"><Icon name="check" size={12} className="text-success-600" /></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section id="purpose" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="school" size={18} className="text-surface-600" filled /></span>
                    Scopo dell'app
                  </h2>
                  <p className="text-sm text-surface-600 leading-relaxed mb-4"><strong>Patente Hub</strong> è un'app educativa gratuita progettata per aiutare gli studenti a prepararsi all'esame della patente di guida italiana (Esame di Guida).</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: 'menu_book', title: 'Contenuto didattico', desc: 'Lezioni teoriche conformi al programma del MIT italiano' },
                      { icon: 'quiz', title: 'Quiz di allenamento', desc: 'Domande Vero/Falso che simulano l\'esame ufficiale italiano' },
                      { icon: 'traffic', title: 'Segnali stradali', desc: 'Libreria completa dei segnali con spiegazioni dettagliate' },
                      { icon: 'trending_up', title: 'Monitoraggio progressi', desc: 'Statistiche precise sulla preparazione all\'esame' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-xl p-3 border border-surface-100">
                        <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name={item.icon} size={18} className="text-primary-600" filled /></div>
                        <div><p className="text-sm font-semibold text-surface-800">{item.title}</p><p className="text-xs text-surface-500 leading-relaxed">{item.desc}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-danger-50 rounded-xl p-3 border border-danger-100">
                    <p className="text-xs text-danger-700 flex items-start gap-2">
                      <Icon name="warning" size={14} className="text-danger-500 shrink-0 mt-0.5" filled />
                      <span><strong>Avviso:</strong> L'app è solo uno strumento didattico di supporto. Non sostituisce la formazione pratica con un istruttore abilitato e non garantisce il superamento dell'esame ufficiale.</span>
                    </p>
                  </div>
                </section>

                <section id="eligibility" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="person_check" size={18} className="text-surface-600" filled /></span>
                    Requisiti di accesso
                  </h2>
                  <ul className="space-y-2 text-sm text-surface-600 mb-3">
                    {['Persone che hanno compiuto 16 anni', 'Chi desidera prepararsi all\'esame della patente italiana', 'Residenti in Italia o in paesi europei', 'Chi può accettare legalmente questi termini nel proprio paese'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2"><Icon name="check_circle" size={16} className="text-success-500" filled />{item}</li>
                    ))}
                  </ul>
                  <div className="bg-surface-50 rounded-xl p-3 border border-surface-100">
                    <p className="text-xs text-surface-500">Per i minori di 16 anni: è necessario il consenso esplicito di un genitore o tutore prima di creare un account.</p>
                  </div>
                </section>

                <section id="account" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="manage_accounts" size={18} className="text-surface-600" filled /></span>
                    Regole dell'account
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-surface-800 text-sm mb-2">Creando un account, ti impegni a:</h3>
                      <ul className="space-y-2 text-sm text-surface-600">
                        {['Fornire informazioni veritiere e accurate durante la registrazione', 'Mantenere aggiornate le informazioni personali', 'Mantenere la riservatezza della password e non condividerla', 'Comunicarci immediatamente in caso di accesso non autorizzato', 'Non creare più di un account per la stessa persona'].map((item, i) => (
                          <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 mt-2" />{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-danger-50 rounded-xl p-4 border border-danger-100">
                      <h3 className="font-semibold text-danger-800 text-sm mb-2 flex items-center gap-2"><Icon name="cancel" size={16} className="text-danger-500" filled />Vietato assolutamente:</h3>
                      <ul className="space-y-1.5 text-sm text-danger-700">
                        {['Condividere il tuo account con altri', 'Creare account falsi o anonimi', 'Impersonare altri utenti', 'Vendere o trasferire l\'account a terzi'].map((item, i) => (
                          <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-danger-400 shrink-0" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="responsibilities" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="assignment" size={18} className="text-surface-600" filled /></span>
                    Responsabilità dell'utente
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: 'verified', title: 'Solo uso personale', desc: 'Utilizzo dell\'app esclusivamente per scopi didattici personali' },
                      { icon: 'forum', title: 'Comportamento nella community', desc: 'Rispetto e nessun contenuto offensivo nella community' },
                      { icon: 'report', title: 'Segnalazione problemi', desc: 'Segnalare contenuti inappropriati o problemi tecnici' },
                      { icon: 'update', title: 'Dati aggiornati', desc: 'Mantenere aggiornate e accurate le informazioni personali' },
                      { icon: 'no_adult_content', title: 'Contenuto appropriato', desc: 'Nessun contenuto razzista, offensivo o inappropriato' },
                      { icon: 'code_off', title: 'Nessun tentativo di accesso', desc: 'Nessun tentativo di violare o manomettere il sistema' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-xl p-3">
                        <Icon name={item.icon} size={18} className="text-surface-500 shrink-0 mt-0.5" filled />
                        <div><p className="text-sm font-semibold text-surface-800">{item.title}</p><p className="text-xs text-surface-500">{item.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </section>

                <section id="ip" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="copyright" size={18} className="text-surface-600" filled /></span>
                    Proprietà intellettuale
                  </h2>
                  <p className="text-sm text-surface-600 leading-relaxed mb-4">Tutti i contenuti di Patente Hub — lezioni, domande, spiegazioni, design e logo — sono proprietà intellettuale esclusiva di <strong className="text-surface-900">Patente Hub</strong>.</p>
                  <div className="space-y-3">
                    <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                      <h3 className="font-semibold text-surface-800 text-sm mb-3">Cosa è consentito:</h3>
                      <ul className="space-y-2 text-sm text-surface-600">
                        {['Utilizzo dei contenuti per lo studio personale', 'Condivisione dei link dell\'app con amici', 'Citare i contenuti con indicazione della fonte'].map((item, i) => (
                          <li key={i} className="flex items-center gap-2"><Icon name="check_circle" size={14} className="text-success-500" filled />{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-danger-50 rounded-xl p-4 border border-danger-100">
                      <h3 className="font-semibold text-danger-800 text-sm mb-3">Cosa non è consentito:</h3>
                      <ul className="space-y-2 text-sm text-danger-700">
                        {['Copiare o ripubblicare i contenuti senza autorizzazione scritta', 'Utilizzare i contenuti per scopi commerciali', 'Creare app o siti basati sui nostri contenuti', 'Rivendicare la proprietà di qualsiasi parte dei contenuti'].map((item, i) => (
                          <li key={i} className="flex items-center gap-2"><Icon name="cancel" size={14} className="text-danger-500" filled />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="liability" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="gavel" size={18} className="text-surface-600" filled /></span>
                    Limitazione di responsabilità
                  </h2>
                  <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
                    <p>L'app è fornita <strong>"così com'è"</strong> e ci sforziamo di offrire la migliore esperienza possibile, tuttavia non garantiamo:</p>
                    <ul className="space-y-2 ml-4">
                      {['L\'accuratezza al 100% dei contenuti didattici in ogni momento', 'La disponibilità continua dell\'app senza interruzioni', 'Il superamento dell\'esame ufficiale basandosi solo sull\'uso dell\'app', 'L\'idoneità dei contenuti per tutte le situazioni in Italia'].map((item, i) => (
                        <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-surface-400 shrink-0 mt-2" />{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section id="termination" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="block" size={18} className="text-surface-600" filled /></span>
                    Chiusura dell'account
                  </h2>
                  <div className="space-y-4">
                    <p className="text-sm text-surface-600 leading-relaxed">Puoi eliminare il tuo account in qualsiasi momento dalle impostazioni del profilo. Tutti i dati salvati localmente verranno eliminati.</p>
                    <div className="bg-warning-50 rounded-xl p-4 border border-warning-100">
                      <h3 className="font-semibold text-warning-800 text-sm mb-2 flex items-center gap-2"><Icon name="warning" size={16} className="text-warning-500" filled />Diritto di Patente Hub di sospendere l'account:</h3>
                      <ul className="space-y-1.5 text-sm text-warning-700">
                        {['Violazione di questi termini o dell\'informativa sulla privacy', 'Comportamento offensivo o molestie ad altri utenti', 'Tentativo di violazione del sistema o manipolazione dei dati', 'Pubblicazione di contenuti fuorvianti o dannosi'].map((item, i) => (
                          <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-warning-500 shrink-0 mt-2" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="updates" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="update" size={18} className="text-surface-600" filled /></span>
                    Aggiornamento dei termini
                  </h2>
                  <ul className="space-y-2">
                    {[
                      { icon: 'notifications_active', text: 'Ti avviseremo nell\'app o via email per modifiche sostanziali' },
                      { icon: 'edit_calendar', text: 'La data "ultimo aggiornamento" verrà aggiornata in cima alla pagina' },
                      { icon: 'timer', text: 'Avrai 30 giorni di preavviso per le modifiche importanti' },
                      { icon: 'thumb_up', text: 'Continuare a usare l\'app equivale ad accettare i termini aggiornati' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-surface-600">
                        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name={item.icon} size={15} className="text-primary-600" filled /></div>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </section>

                <section id="contact" className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-2xl p-6 text-white">
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Icon name="contact_mail" size={22} className="text-surface-300" filled />
                    Informazioni di contatto
                  </h2>
                  <p className="text-surface-300 text-sm leading-relaxed mb-5">Per qualsiasi domanda su questi termini o per ulteriori chiarimenti, contattaci:</p>
                  <div className="space-y-3">
                    <a href="mailto:legal@patentehub.com" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-colors border border-white/10">
                      <Icon name="email" size={20} className="text-surface-300" />
                      <div><p className="text-xs text-surface-400">Per questioni legali</p><p className="text-sm font-semibold" dir="ltr">legal@patentehub.com</p></div>
                    </a>
                    <button onClick={() => navigate(ROUTES.CONTACT)} className="w-full flex items-center justify-center gap-2 bg-white text-surface-900 font-semibold rounded-xl px-4 py-3 hover:bg-surface-100 transition-colors text-sm">
                      <Icon name="chat" size={18} className="text-surface-700" />
                      Apri la pagina contatti
                    </button>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section id="acceptance" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="handshake" size={18} className="text-surface-600" filled /></span>
                    قبول الشروط
                  </h2>
                  <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
                    <p>تُمثّل هذه الوثيقة اتفاقية قانونية ملزمة بينك وبين <strong className="text-surface-900">Patente Hub</strong>. بتسجيلك في التطبيق أو استخدامه، فإنك تؤكد:</p>
                    <ul className="space-y-2 mr-4">
                      {['أنك قرأت هذه الشروط وفهمتها بالكامل', 'أنك توافق على الالتزام بجميع بنودها', 'أن عمرك لا يقل عن 16 سنة أو أنك تحت إشراف ولي أمر', 'أن لديك الصلاحية القانونية لإبرام هذه الاتفاقية'].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-success-50 rounded-full flex items-center justify-center shrink-0 mt-0.5"><Icon name="check" size={12} className="text-success-600" /></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section id="purpose" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="school" size={18} className="text-surface-600" filled /></span>
                    هدف التطبيق
                  </h2>
                  <p className="text-sm text-surface-600 leading-relaxed mb-4"><strong>Patente Hub</strong> هو تطبيق تعليمي مجاني مصمم حصراً لمساعدة الناطقين بالعربية على الاستعداد لامتحان رخصة القيادة الإيطالية.</p>
                  <div className="mt-4 bg-danger-50 rounded-xl p-3 border border-danger-100">
                    <p className="text-xs text-danger-700 flex items-start gap-2">
                      <Icon name="warning" size={14} className="text-danger-500 shrink-0 mt-0.5" filled />
                      <span><strong>تنبيه:</strong> التطبيق أداة تعليمية مساعدة فقط. لا يُغني عن التدريب العملي مع مدرب معتمد، ولا يضمن اجتيازك للامتحان الرسمي.</span>
                    </p>
                  </div>
                </section>

                <section id="eligibility" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="person_check" size={18} className="text-surface-600" filled /></span>
                    شروط الأهلية
                  </h2>
                  <ul className="space-y-2 text-sm text-surface-600">
                    {['الأفراد الذين بلغوا سن 16 عاماً فأكثر', 'من يرغبون في التحضير لامتحان رخصة القيادة الإيطالية', 'المقيمون في إيطاليا أو الدول الأوروبية', 'من يمكنهم قبول هذه الشروط بشكل قانوني في بلدهم'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2"><Icon name="check_circle" size={16} className="text-success-500" filled />{item}</li>
                    ))}
                  </ul>
                </section>

                <section id="account" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="manage_accounts" size={18} className="text-surface-600" filled /></span>
                    قواعد الحساب
                  </h2>
                  <div className="space-y-4">
                    <ul className="space-y-2 text-sm text-surface-600">
                      {['تقديم معلومات صحيحة ودقيقة عند التسجيل', 'الحفاظ على تحديث معلوماتك الشخصية', 'الحفاظ على سرية كلمة مرورك وعدم مشاركتها', 'إخطارنا فوراً في حال الاشتباه باختراق حسابك', 'عدم إنشاء أكثر من حساب واحد لنفس الشخص'].map((item, i) => (
                        <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 mt-2" />{item}</li>
                      ))}
                    </ul>
                    <div className="bg-danger-50 rounded-xl p-4 border border-danger-100">
                      <h3 className="font-semibold text-danger-800 text-sm mb-2 flex items-center gap-2"><Icon name="cancel" size={16} className="text-danger-500" filled />محظور تماماً:</h3>
                      <ul className="space-y-1.5 text-sm text-danger-700">
                        {['مشاركة حسابك مع أشخاص آخرين', 'إنشاء حسابات وهمية', 'انتحال شخصية مستخدمين آخرين', 'بيع أو نقل الحساب لطرف ثالث'].map((item, i) => (
                          <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-danger-400 shrink-0" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="responsibilities" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="assignment" size={18} className="text-surface-600" filled /></span>
                    مسؤوليات المستخدم
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: 'verified', title: 'الاستخدام الشخصي فقط', desc: 'استخدام التطبيق لأغراض تعليمية شخصية حصراً' },
                      { icon: 'forum', title: 'سلوك المجتمع', desc: 'الاحترام وعدم إرسال محتوى مسيء' },
                      { icon: 'report', title: 'الإبلاغ عن المشاكل', desc: 'الإبلاغ عن أي محتوى مخالف أو مشاكل تقنية' },
                      { icon: 'code_off', title: 'عدم الاختراق', desc: 'عدم محاولة اختراق النظام أو تعطيله' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-xl p-3">
                        <Icon name={item.icon} size={18} className="text-surface-500 shrink-0 mt-0.5" filled />
                        <div><p className="text-sm font-semibold text-surface-800">{item.title}</p><p className="text-xs text-surface-500">{item.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </section>

                <section id="ip" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="copyright" size={18} className="text-surface-600" filled /></span>
                    الملكية الفكرية
                  </h2>
                  <p className="text-sm text-surface-600 leading-relaxed mb-4">جميع محتويات Patente Hub — الدروس والأسئلة والشروحات والتصاميم والشعار — هي ملكية فكرية حصرية لـ <strong className="text-surface-900">Patente Hub</strong>.</p>
                </section>

                <section id="liability" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="gavel" size={18} className="text-surface-600" filled /></span>
                    حدود المسؤولية
                  </h2>
                  <p className="text-sm text-surface-600">يُقدَّم التطبيق <strong>"كما هو"</strong>. Patente Hub لا يتحمل أي مسؤولية عن الأضرار الناجمة عن استخدام التطبيق، بما في ذلك الرسوب في الامتحان الرسمي.</p>
                </section>

                <section id="termination" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="block" size={18} className="text-surface-600" filled /></span>
                    إنهاء الوصول
                  </h2>
                  <p className="text-sm text-surface-600 mb-3">يمكنك حذف حسابك في أي وقت من إعدادات الملف الشخصي. نحتفظ بالحق في تعليق الحسابات التي تنتهك هذه الشروط.</p>
                </section>

                <section id="updates" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0"><Icon name="update" size={18} className="text-surface-600" filled /></span>
                    تحديثات الشروط
                  </h2>
                  <p className="text-sm text-surface-600">نحتفظ بالحق في تعديل هذه الشروط. سيتم إشعارك عند إجراء تغييرات جوهرية. استمرارك في استخدام التطبيق يُعدّ موافقة على الشروط المحدثة.</p>
                </section>

                <section id="contact" className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-2xl p-6 text-white">
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Icon name="contact_mail" size={22} className="text-surface-300" filled />
                    معلومات الاتصال
                  </h2>
                  <div className="space-y-3">
                    <a href="mailto:legal@patentehub.com" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-colors border border-white/10">
                      <Icon name="email" size={20} className="text-surface-300" />
                      <div><p className="text-xs text-surface-400">للاستفسارات القانونية</p><p className="text-sm font-semibold" dir="ltr">legal@patentehub.com</p></div>
                    </a>
                    <button onClick={() => navigate(ROUTES.CONTACT)} className="w-full flex items-center justify-center gap-2 bg-white text-surface-900 font-semibold rounded-xl px-4 py-3 hover:bg-surface-100 transition-colors text-sm">
                      <Icon name="chat" size={18} className="text-surface-700" />
                      فتح صفحة التواصل
                    </button>
                  </div>
                </section>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate(ROUTES.PRIVACY_POLICY)} className="flex-1 flex items-center justify-between gap-2 bg-white rounded-2xl px-5 py-4 border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors"><Icon name="privacy_tip" size={20} className="text-surface-400 group-hover:text-primary-500 transition-colors" /></div>
                  <div className={isIt ? '' : 'text-right'}>
                    <p className="text-xs text-surface-400">{isIt ? 'Vedi anche' : 'شاهد أيضاً'}</p>
                    <p className="text-sm font-bold text-surface-900">{isIt ? 'Informativa privacy' : 'سياسة الخصوصية'}</p>
                  </div>
                </div>
                <Icon name="arrow_back" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors" />
              </button>
              <button onClick={() => navigate(ROUTES.CONTACT)} className="flex-1 flex items-center justify-between gap-2 bg-white rounded-2xl px-5 py-4 border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors"><Icon name="mail" size={20} className="text-surface-400 group-hover:text-primary-500 transition-colors" /></div>
                  <div className={isIt ? '' : 'text-right'}>
                    <p className="text-xs text-surface-400">{isIt ? 'Contattaci' : 'تواصل معنا'}</p>
                    <p className="text-sm font-bold text-surface-900">{isIt ? 'Pagina contatti' : 'صفحة الاتصال'}</p>
                  </div>
                </div>
                <Icon name="arrow_back" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
