import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/i18n';

const sectionsAr = [
  { id: 'intro', title: 'مقدمة', icon: 'info' },
  { id: 'collect', title: 'المعلومات التي نجمعها', icon: 'manage_search' },
  { id: 'use', title: 'كيفية استخدام المعلومات', icon: 'settings' },
  { id: 'cookies', title: 'ملفات الارتباط والتخزين', icon: 'data_object' },
  { id: 'storage', title: 'تخزين البيانات', icon: 'storage' },
  { id: 'third-party', title: 'خدمات الطرف الثالث', icon: 'share' },
  { id: 'rights', title: 'حقوق المستخدم (GDPR)', icon: 'verified_user' },
  { id: 'protection', title: 'حماية البيانات', icon: 'security' },
  { id: 'contact', title: 'التواصل بشأن الخصوصية', icon: 'contact_mail' },
];

const sectionsIt = [
  { id: 'intro', title: 'Introduzione', icon: 'info' },
  { id: 'collect', title: 'Dati che raccogliamo', icon: 'manage_search' },
  { id: 'use', title: 'Come utilizziamo i dati', icon: 'settings' },
  { id: 'cookies', title: 'Cookie e archiviazione', icon: 'data_object' },
  { id: 'storage', title: 'Archiviazione dei dati', icon: 'storage' },
  { id: 'third-party', title: 'Servizi di terze parti', icon: 'share' },
  { id: 'rights', title: 'Diritti dell\'utente (GDPR)', icon: 'verified_user' },
  { id: 'protection', title: 'Protezione dei dati', icon: 'security' },
  { id: 'contact', title: 'Contatti privacy', icon: 'contact_mail' },
];

export function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('intro');
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
    <div className="min-h-screen bg-surface-50 animate-fade-in-up">
      <header className="sticky top-0 z-50 bg-white border-b border-surface-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-surface-500 hover:text-primary-600 transition-colors">
            <Icon name="arrow_forward" size={20} className="ltr:rotate-180" />
            <span className="text-sm font-medium">{isIt ? 'Indietro' : 'رجوع'}</span>
          </button>
          <h1 className="text-base font-bold text-surface-900">{isIt ? 'Informativa sulla privacy' : 'سياسة الخصوصية'}</h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
              <Icon name="directions_car" size={16} className="text-white" filled />
            </div>
            <span className="text-sm font-bold text-surface-900 hidden sm:block">Patente Hub</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-primary-600 to-primary-900 rounded-2xl p-8 text-center text-white mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/30">
              <Icon name="privacy_tip" size={32} className="text-white" filled />
            </div>
            <h1 className="text-3xl font-black mb-2">{isIt ? 'Informativa sulla privacy' : 'سياسة الخصوصية'}</h1>
            <p className="text-primary-200 text-sm">
              {isIt ? 'Ultimo aggiornamento: gennaio 2025 · Conforme al GDPR europeo' : 'آخر تحديث: يناير 2025 · متوافقة مع اللائحة الأوروبية GDPR'}
            </p>
          </div>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
          <Icon name="info" size={20} className="text-primary-500 shrink-0 mt-0.5" filled />
          <p className="text-sm text-primary-700 leading-relaxed">
            {isIt
              ? <>Utilizzando <strong>Patente Hub</strong>, accetti le condizioni descritte in questa informativa. Ti consigliamo di leggerla attentamente prima dell'uso.</>
              : <>باستخدامك لتطبيق <strong>Patente Hub</strong>، فإنك توافق على الشروط الواردة في هذه السياسة. نوصي بقراءتها بعناية قبل الاستخدام.</>
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
                    className={`w-full ${isIt ? 'text-left' : 'text-right'} flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all ${activeSection === section.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-surface-500 hover:text-primary-600 hover:bg-surface-50'}`}>
                    <Icon name={section.icon} size={14} className={activeSection === section.id ? 'text-primary-500' : 'text-surface-400'} />
                    <span className="leading-tight">{section.title}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-surface-100">
                <button onClick={() => navigate(ROUTES.CONTACT)} className="w-full flex items-center justify-center gap-1.5 text-xs bg-primary-600 text-white px-3 py-2 rounded-xl hover:bg-primary-700 transition-colors font-medium">
                  <Icon name="mail" size={14} />
                  {isIt ? 'Contattaci' : 'تواصل معنا'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-5">
            {isIt ? (
              <>
                <section id="intro" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="info" size={18} className="text-primary-600" filled /></span>
                    Introduzione
                  </h2>
                  <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
                    <p>Benvenuto su <strong className="text-surface-900">Patente Hub</strong>. Rispettiamo la tua privacy e ci impegniamo a proteggerla. Questo documento spiega come raccogliamo, utilizziamo e conserviamo i tuoi dati personali.</p>
                    <p>Patente Hub è un'app educativa per prepararsi all'esame della patente di guida italiana. Operiamo nel rispetto delle migliori pratiche internazionali in materia di protezione dei dati.</p>
                    <p>Questa informativa è conforme al <strong className="text-surface-900">Regolamento Generale sulla Protezione dei Dati (GDPR)</strong> e alla normativa italiana sulla privacy.</p>
                  </div>
                </section>

                <section id="collect" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="manage_search" size={18} className="text-primary-600" filled /></span>
                    Dati che raccogliamo
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                      <h3 className="font-semibold text-surface-800 text-sm mb-3 flex items-center gap-2"><Icon name="person" size={16} className="text-primary-500" filled />Dati dell'account</h3>
                      <ul className="space-y-2 text-sm text-surface-600">
                        {['Nome e cognome', 'Indirizzo email', 'Nome utente (facoltativo)', 'Password (cifrata)', 'Data di nascita', 'Numero di telefono (facoltativo)', 'Sesso e provincia italiana (per statistiche)', 'Foto profilo (facoltativa)'].map((item, i) => (
                          <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                      <h3 className="font-semibold text-surface-800 text-sm mb-3 flex items-center gap-2"><Icon name="analytics" size={16} className="text-primary-500" filled />Dati di utilizzo e progressi</h3>
                      <ul className="space-y-2 text-sm text-surface-600">
                        {['Risultati dei quiz e risposte fornite', 'Lezioni completate e progressi per sezione', 'Sessioni di allenamento e livello di prestazione', 'Errori frequenti per migliorare il piano di studio', 'Serie di giorni di studio (Streak)', 'Attività nella community (post e commenti)'].map((item, i) => (
                          <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="use" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="settings" size={18} className="text-primary-600" filled /></span>
                    Come utilizziamo i dati
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: 'person_add', title: 'Gestione account', desc: 'Creazione, accesso e gestione del tuo profilo' },
                      { icon: 'school', title: 'Esperienza educativa', desc: 'Tracciamento dei progressi e contenuti personalizzati' },
                      { icon: 'trending_up', title: 'Analisi delle prestazioni', desc: 'Miglioramento degli algoritmi dei quiz in base ai risultati' },
                      { icon: 'security', title: 'Sicurezza', desc: 'Protezione dell\'account da accessi non autorizzati' },
                      { icon: 'support_agent', title: 'Assistenza tecnica', desc: 'Supporto quando contatti il nostro team' },
                      { icon: 'notifications', title: 'Notifiche', desc: 'Promemoria di studio e notifiche di risultati' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-xl p-3 border border-surface-100">
                        <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name={item.icon} size={18} className="text-primary-600" filled /></div>
                        <div><p className="text-sm font-semibold text-surface-800">{item.title}</p><p className="text-xs text-surface-500 leading-relaxed">{item.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </section>

                <section id="cookies" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="data_object" size={18} className="text-primary-600" filled /></span>
                    Cookie e archiviazione locale
                  </h2>
                  <p className="text-sm text-surface-600 leading-relaxed mb-4">L'app utilizza <strong>localStorage</strong> e <strong>IndexedDB</strong> per l'archiviazione locale sul tuo dispositivo invece dei cookie tradizionali. I token JWT di Supabase (autenticazione) sono salvati in localStorage e rinnovati automaticamente.</p>
                  <div className="space-y-3">
                    {[
                      { icon: 'key', title: 'Token JWT (Supabase)', desc: 'Salva il token di accesso e il refresh token per mantenerti connesso in modo sicuro', color: 'text-primary-500' },
                      { icon: 'sync', title: 'Dati di progresso', desc: 'Sincronizza i progressi e li rende disponibili offline', color: 'text-success-500' },
                      { icon: 'tune', title: 'Impostazioni e preferenze', desc: 'Salva la lingua dei contenuti e le preferenze dell\'interfaccia', color: 'text-warning-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-xl p-3">
                        <Icon name={item.icon} size={20} className={`${item.color} shrink-0 mt-0.5`} filled />
                        <div><p className="text-sm font-semibold text-surface-800">{item.title}</p><p className="text-xs text-surface-500">{item.desc}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-warning-50 rounded-xl p-3 border border-warning-100">
                    <p className="text-xs text-warning-700 flex items-start gap-2">
                      <Icon name="info" size={16} className="text-warning-500 shrink-0 mt-0.5" />
                      Puoi cancellare questi dati in qualsiasi momento dalle impostazioni del browser. Ciò comporterà la disconnessione e la cancellazione dei dati locali dell'app su questo dispositivo.
                    </p>
                  </div>
                </section>

                <section id="storage" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="storage" size={18} className="text-primary-600" filled /></span>
                    Archiviazione dei dati
                  </h2>
                  <p className="text-sm text-surface-600 leading-relaxed mb-4">Patente Hub utilizza un modello di archiviazione ibrido: i dati di autenticazione e il profilo utente sono archiviati in modo sicuro su <strong className="text-surface-900">server Supabase (PostgreSQL, UE)</strong>, mentre i contenuti educativi e i dati della community sono salvati <strong className="text-surface-900">localmente sul tuo dispositivo</strong> tramite IndexedDB.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                      <Icon name="cloud_done" size={24} className="text-primary-600 mb-2" filled />
                      <h3 className="font-semibold text-primary-800 text-sm mb-1">Dati cloud (Supabase)</h3>
                      <p className="text-xs text-primary-700">Account, profilo, progressi e impostazioni sono archiviati in modo sicuro su server PostgreSQL in Europa</p>
                    </div>
                    <div className="bg-success-50 rounded-xl p-4 border border-success-100">
                      <Icon name="phone_android" size={24} className="text-success-600 mb-2" filled />
                      <h3 className="font-semibold text-success-800 text-sm mb-1">Dati locali (IndexedDB)</h3>
                      <p className="text-xs text-success-700">Contenuti educativi, segnali stradali, dizionario e dati della community rimangono sul dispositivo</p>
                    </div>
                    <div className="bg-warning-50 rounded-xl p-4 border border-warning-100 sm:col-span-2">
                      <Icon name="backup" size={24} className="text-warning-600 mb-2" filled />
                      <h3 className="font-semibold text-warning-800 text-sm mb-1">Backup automatico</h3>
                      <p className="text-xs text-warning-700">I progressi e le impostazioni sono automaticamente sincronizzati con il tuo account Supabase e accessibili da qualsiasi dispositivo.</p>
                    </div>
                  </div>
                </section>

                <section id="third-party" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="share" size={18} className="text-primary-600" filled /></span>
                    Servizi di terze parti
                  </h2>
                  <p className="text-sm text-surface-600 leading-relaxed mb-4">L'app utilizza i seguenti servizi esterni, ognuno con la propria informativa sulla privacy:</p>
                  <div className="space-y-3">
                    {[
                      { name: 'Supabase', desc: 'Piattaforma cloud per autenticazione e archiviazione del profilo utente (server in Europa)', icon: 'cloud' },
                      { name: 'Google Fonts', desc: 'Caricamento dei font per l\'interfaccia', icon: 'text_fields' },
                      { name: 'Material Symbols (Google)', desc: 'Libreria di icone per l\'interfaccia', icon: 'interests' },
                    ].map((service, i) => (
                      <div key={i} className="flex items-center gap-3 bg-surface-50 rounded-xl p-4 border border-surface-100">
                        <div className="w-10 h-10 bg-white rounded-xl border border-surface-200 flex items-center justify-center shrink-0"><Icon name={service.icon} size={20} className="text-surface-500" /></div>
                        <div><p className="text-sm font-semibold text-surface-800">{service.name}</p><p className="text-xs text-surface-500">{service.desc}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-surface-50 rounded-xl p-3 border border-surface-100">
                    <p className="text-xs text-surface-500 flex items-start gap-2">
                      <Icon name="verified_user" size={14} className="text-success-500 shrink-0 mt-0.5" filled />
                      <span><strong>Il nostro impegno:</strong> Non vendiamo, condividiamo o affittiamo i tuoi dati personali a terze parti per scopi commerciali o di marketing.</span>
                    </p>
                  </div>
                </section>

                <section id="rights" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="verified_user" size={18} className="text-primary-600" filled /></span>
                    Diritti dell'utente ai sensi del GDPR
                  </h2>
                  <p className="text-sm text-surface-600 leading-relaxed mb-4">Ai sensi del GDPR hai i seguenti diritti, esercitabili in qualsiasi momento:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: 'visibility', title: 'Diritto di accesso', desc: 'Accedere a tutti i tuoi dati personali conservati' },
                      { icon: 'edit', title: 'Diritto di rettifica', desc: 'Correggere informazioni inesatte o incomplete' },
                      { icon: 'delete_forever', title: 'Diritto alla cancellazione', desc: 'Richiedere la cancellazione definitiva del tuo account e dati' },
                      { icon: 'pause_circle', title: 'Diritto di limitazione', desc: 'Limitare il trattamento dei tuoi dati in casi specifici' },
                      { icon: 'download', title: 'Diritto alla portabilità', desc: 'Ottenere una copia dei tuoi dati in formato leggibile' },
                      { icon: 'thumb_down', title: 'Diritto di opposizione', desc: 'Opporti al trattamento dei tuoi dati per determinati scopi' },
                    ].map((right, i) => (
                      <div key={i} className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center"><Icon name={right.icon} size={15} className="text-primary-600" filled /></div>
                          <h3 className="font-semibold text-surface-800 text-sm">{right.title}</h3>
                        </div>
                        <p className="text-xs text-surface-500 leading-relaxed">{right.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-primary-50 rounded-xl p-3 border border-primary-100">
                    <p className="text-xs text-primary-700 flex items-start gap-2">
                      <Icon name="info" size={14} className="text-primary-500 shrink-0 mt-0.5" />
                      Per esercitare uno di questi diritti, contattaci tramite la pagina contatti o invia un'email a privacy@patentehub.com
                    </p>
                  </div>
                </section>

                <section id="protection" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="security" size={18} className="text-primary-600" filled /></span>
                    Protezione dei dati
                  </h2>
                  <ul className="space-y-3">
                    {[
                      { icon: 'shield', text: 'Autenticazione tramite Supabase con JWT sicuri e rinnovo automatico del token' },
                      { icon: 'password', text: 'Le password non vengono mai archiviate: Supabase gestisce l\'autenticazione in modo sicuro' },
                      { icon: 'token', text: 'Token di accesso JWT con scadenza breve (1 ora) e refresh token a lungo termine' },
                      { icon: 'visibility_off', text: 'Nessuna visualizzazione di password o dati sensibili nell\'interfaccia' },
                      { icon: 'admin_panel_settings', text: 'Accesso ai dati sensibili limitato in base ai ruoli utente' },
                      { icon: 'gpp_good', text: 'Revisione periodica delle procedure di sicurezza' },
                    ].map((measure, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-success-50 rounded-lg flex items-center justify-center shrink-0"><Icon name={measure.icon} size={16} className="text-success-600" filled /></div>
                        <span className="text-sm text-surface-600">{measure.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section id="contact" className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Icon name="contact_mail" size={22} className="text-primary-200" filled />
                    Contatti per la privacy
                  </h2>
                  <p className="text-primary-100 text-sm leading-relaxed mb-5">Per qualsiasi domanda su questa informativa, per esercitare i tuoi diritti legali o per segnalare una violazione della privacy, contattaci:</p>
                  <div className="space-y-3">
                    <a href="mailto:privacy@patentehub.com" className="flex items-center gap-3 bg-white/15 hover:bg-white/25 rounded-xl px-4 py-3 transition-colors border border-white/20">
                      <Icon name="email" size={20} className="text-primary-200" />
                      <div>
                        <p className="text-xs text-primary-200">Email per la privacy</p>
                        <p className="text-sm font-semibold" dir="ltr">privacy@patentehub.com</p>
                      </div>
                    </a>
                    <button onClick={() => navigate(ROUTES.CONTACT)} className="w-full flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold rounded-xl px-4 py-3 hover:bg-primary-50 transition-colors text-sm">
                      <Icon name="chat" size={18} className="text-primary-600" />
                      Pagina contatti
                    </button>
                  </div>
                  <p className="text-primary-300 text-xs mt-4">Ci impegniamo a rispondere a tutte le richieste riguardanti la privacy entro 30 giorni dal ricevimento.</p>
                </section>
              </>
            ) : (
              <>
                <section id="intro" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="info" size={18} className="text-primary-600" filled /></span>
                    مقدمة
                  </h2>
                  <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
                    <p>مرحباً بك في <strong className="text-surface-900">Patente Hub</strong>. نحن نُدرك أهمية خصوصيتك ونلتزم بحمايتها. توضح هذه الوثيقة كيفية جمع بياناتك الشخصية واستخدامها والحفاظ عليها عند استخدامك للتطبيق.</p>
                    <p>Patente Hub هو تطبيق تعليمي يساعد الناطقين بالعربية على الاستعداد لامتحان رخصة القيادة الإيطالية. نحن نعمل وفقاً لأفضل الممارسات الدولية في مجال حماية البيانات.</p>
                    <p>هذه السياسة متوافقة مع <strong className="text-surface-900">اللائحة الأوروبية العامة لحماية البيانات (GDPR)</strong> ولوائح الخصوصية الإيطالية.</p>
                  </div>
                </section>

                <section id="collect" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="manage_search" size={18} className="text-primary-600" filled /></span>
                    المعلومات التي نجمعها
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                      <h3 className="font-semibold text-surface-800 text-sm mb-3 flex items-center gap-2"><Icon name="person" size={16} className="text-primary-500" filled />معلومات الحساب الشخصي</h3>
                      <ul className="space-y-2 text-sm text-surface-600">
                        {['الاسم الأول والأخير', 'عنوان البريد الإلكتروني', 'اسم المستخدم (اختياري)', 'كلمة المرور (مُشفَّرة)', 'تاريخ الميلاد', 'رقم الهاتف (اختياري)', 'الجنس والمحافظة الإيطالية (للإحصائيات)', 'الصورة الشخصية (اختيارية)'].map((item, i) => (
                          <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                      <h3 className="font-semibold text-surface-800 text-sm mb-3 flex items-center gap-2"><Icon name="analytics" size={16} className="text-primary-500" filled />بيانات الاستخدام والتقدم</h3>
                      <ul className="space-y-2 text-sm text-surface-600">
                        {['نتائج الاختبارات والأسئلة المجاب عليها', 'الدروس المكتملة والتقدم في كل قسم', 'جلسات التدريب ومستوى الأداء', 'الأخطاء المتكررة لتحسين خطة التعلم', 'سلسلة أيام الدراسة (Streak)', 'نشاط المجتمع (المنشورات والتعليقات)'].map((item, i) => (
                          <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="use" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="settings" size={18} className="text-primary-600" filled /></span>
                    كيفية استخدام المعلومات
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: 'person_add', title: 'إدارة الحساب', desc: 'إنشاء حسابك وتسجيل دخولك وإدارة ملفك الشخصي' },
                      { icon: 'school', title: 'التجربة التعليمية', desc: 'تتبع تقدمك وتقديم محتوى مخصص لمستواك' },
                      { icon: 'trending_up', title: 'تحليل الأداء', desc: 'تحسين خوارزميات الاختبارات بناءً على أدائك' },
                      { icon: 'notifications', title: 'الإشعارات', desc: 'إرسال تذكيرات الدراسة وإشعارات الإنجازات' },
                      { icon: 'security', title: 'الأمان', desc: 'حماية حسابك من الوصول غير المصرح به' },
                      { icon: 'support_agent', title: 'الدعم الفني', desc: 'تقديم المساعدة عند التواصل مع فريق الدعم' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-xl p-3 border border-surface-100">
                        <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name={item.icon} size={18} className="text-primary-600" filled /></div>
                        <div><p className="text-sm font-semibold text-surface-800">{item.title}</p><p className="text-xs text-surface-500 leading-relaxed">{item.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </section>

                <section id="cookies" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="data_object" size={18} className="text-primary-600" filled /></span>
                    ملفات الارتباط والتخزين المحلي
                  </h2>
                  <p className="text-sm text-surface-600 leading-relaxed mb-4">يستخدم التطبيق <strong>localStorage</strong> و <strong>IndexedDB</strong> للتخزين المحلي على جهازك بدلاً من ملفات الارتباط التقليدية. تُحفَظ رموز JWT من Supabase في localStorage وتُجدَّد تلقائياً.</p>
                  <div className="space-y-3">
                    {[
                      { icon: 'key', title: 'رمز JWT (Supabase)', desc: 'حفظ رمز الوصول ورمز التحديث للمصادقة الآمنة', color: 'text-primary-500' },
                      { icon: 'sync', title: 'بيانات التقدم', desc: 'مزامنة تقدمك التعليمي وإتاحته بدون اتصال', color: 'text-success-500' },
                      { icon: 'tune', title: 'الإعدادات والتفضيلات', desc: 'حفظ لغة المحتوى وتفضيلات واجهة المستخدم', color: 'text-warning-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-xl p-3">
                        <Icon name={item.icon} size={20} className={`${item.color} shrink-0 mt-0.5`} filled />
                        <div><p className="text-sm font-semibold text-surface-800">{item.title}</p><p className="text-xs text-surface-500">{item.desc}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-warning-50 rounded-xl p-3 border border-warning-100">
                    <p className="text-xs text-warning-700 flex items-start gap-2">
                      <Icon name="info" size={16} className="text-warning-500 shrink-0 mt-0.5" />
                      يمكنك مسح هذه البيانات في أي وقت من إعدادات متصفحك.
                    </p>
                  </div>
                </section>

                <section id="storage" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="storage" size={18} className="text-primary-600" filled /></span>
                    تخزين البيانات
                  </h2>
                  <p className="text-sm text-surface-600 leading-relaxed mb-4">يعتمد Patente Hub على نموذج تخزين مزدوج: تُحفَظ بيانات المصادقة والملف الشخصي بأمان على <strong className="text-surface-900">خوادم Supabase (PostgreSQL، أوروبا)</strong>، بينما تُخزَّن المحتويات التعليمية وبيانات المجتمع <strong className="text-surface-900">محلياً على جهازك</strong> عبر IndexedDB.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                      <Icon name="cloud_done" size={24} className="text-primary-600 mb-2" filled />
                      <h3 className="font-semibold text-primary-800 text-sm mb-1">بيانات سحابية (Supabase)</h3>
                      <p className="text-xs text-primary-700">الحساب والملف الشخصي والتقدم والإعدادات تُحفَظ بأمان على خوادم PostgreSQL في أوروبا</p>
                    </div>
                    <div className="bg-success-50 rounded-xl p-4 border border-success-100">
                      <Icon name="phone_android" size={24} className="text-success-600 mb-2" filled />
                      <h3 className="font-semibold text-success-800 text-sm mb-1">بيانات محلية (IndexedDB)</h3>
                      <p className="text-xs text-success-700">المحتوى التعليمي وإشارات الطرق والقاموس وبيانات المجتمع تبقى على جهازك</p>
                    </div>
                    <div className="bg-warning-50 rounded-xl p-4 border border-warning-100 sm:col-span-2">
                      <Icon name="backup" size={24} className="text-warning-600 mb-2" filled />
                      <h3 className="font-semibold text-warning-800 text-sm mb-1">نسخ احتياطي تلقائي</h3>
                      <p className="text-xs text-warning-700">يتم مزامنة تقدمك وإعداداتك تلقائياً مع حسابك على Supabase، ويمكن الوصول إليها من أي جهاز.</p>
                    </div>
                  </div>
                </section>

                <section id="third-party" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="share" size={18} className="text-primary-600" filled /></span>
                    خدمات الطرف الثالث
                  </h2>
                  <div className="space-y-3">
                    {[
                      { name: 'Supabase', desc: 'منصة سحابية للمصادقة وتخزين ملف المستخدم (خوادم في أوروبا)', icon: 'cloud' },
                      { name: 'Google Fonts', desc: 'لتحميل خطوط واجهة التطبيق', icon: 'text_fields' },
                      { name: 'Material Symbols (Google)', desc: 'مكتبة الأيقونات المستخدمة في واجهة التطبيق', icon: 'interests' },
                    ].map((service, i) => (
                      <div key={i} className="flex items-center gap-3 bg-surface-50 rounded-xl p-4 border border-surface-100">
                        <div className="w-10 h-10 bg-white rounded-xl border border-surface-200 flex items-center justify-center shrink-0"><Icon name={service.icon} size={20} className="text-surface-500" /></div>
                        <div><p className="text-sm font-semibold text-surface-800">{service.name}</p><p className="text-xs text-surface-500">{service.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </section>

                <section id="rights" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="verified_user" size={18} className="text-primary-600" filled /></span>
                    حقوق المستخدم بموجب GDPR
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: 'visibility', title: 'حق الوصول', desc: 'الاطلاع على جميع بياناتك الشخصية المخزنة' },
                      { icon: 'edit', title: 'حق التصحيح', desc: 'تعديل أي معلومات غير دقيقة' },
                      { icon: 'delete_forever', title: 'حق الحذف', desc: 'طلب حذف حسابك وجميع بياناتك نهائياً' },
                      { icon: 'pause_circle', title: 'حق القيد', desc: 'تقييد معالجة بياناتك في حالات محددة' },
                      { icon: 'download', title: 'حق النقل', desc: 'الحصول على نسخة من بياناتك بصيغة قابلة للقراءة' },
                      { icon: 'thumb_down', title: 'حق الاعتراض', desc: 'الاعتراض على معالجة بياناتك لأغراض معينة' },
                    ].map((right, i) => (
                      <div key={i} className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center"><Icon name={right.icon} size={15} className="text-primary-600" filled /></div>
                          <h3 className="font-semibold text-surface-800 text-sm">{right.title}</h3>
                        </div>
                        <p className="text-xs text-surface-500 leading-relaxed">{right.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section id="protection" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
                  <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Icon name="security" size={18} className="text-primary-600" filled /></span>
                    حماية البيانات
                  </h2>
                  <ul className="space-y-3">
                    {[
                      { icon: 'shield', text: 'مصادقة عبر Supabase برموز JWT آمنة وتجديد تلقائي للرمز' },
                      { icon: 'password', text: 'لا تُخزَّن كلمات المرور أبداً — تُدار المصادقة بأمان عبر Supabase' },
                      { icon: 'token', text: 'رمز وصول JWT قصير الأجل (ساعة واحدة) مع رمز تحديث طويل الأجل' },
                      { icon: 'visibility_off', text: 'عدم عرض كلمات المرور أو البيانات الحساسة في الواجهة' },
                      { icon: 'admin_panel_settings', text: 'تقييد الوصول للبيانات الحساسة حسب صلاحيات المستخدم' },
                      { icon: 'gpp_good', text: 'مراجعة دورية لإجراءات الأمان وتحديثها باستمرار' },
                    ].map((measure, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-success-50 rounded-lg flex items-center justify-center shrink-0"><Icon name={measure.icon} size={16} className="text-success-600" filled /></div>
                        <span className="text-sm text-surface-600">{measure.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section id="contact" className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Icon name="contact_mail" size={22} className="text-primary-200" filled />
                    التواصل بشأن الخصوصية
                  </h2>
                  <p className="text-primary-100 text-sm leading-relaxed mb-5">إذا كان لديك أي استفسار حول هذه السياسة أو أردت ممارسة حقوقك القانونية، يرجى التواصل معنا:</p>
                  <div className="space-y-3">
                    <a href="mailto:privacy@patentehub.com" className="flex items-center gap-3 bg-white/15 hover:bg-white/25 rounded-xl px-4 py-3 transition-colors border border-white/20">
                      <Icon name="email" size={20} className="text-primary-200" />
                      <div>
                        <p className="text-xs text-primary-200">البريد الإلكتروني للخصوصية</p>
                        <p className="text-sm font-semibold" dir="ltr">privacy@patentehub.com</p>
                      </div>
                    </a>
                    <button onClick={() => navigate(ROUTES.CONTACT)} className="w-full flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold rounded-xl px-4 py-3 hover:bg-primary-50 transition-colors text-sm">
                      <Icon name="chat" size={18} className="text-primary-600" />
                      صفحة التواصل معنا
                    </button>
                  </div>
                  <p className="text-primary-300 text-xs mt-4">نلتزم بالرد على جميع الاستفسارات خلال 30 يوماً.</p>
                </section>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate(ROUTES.TERMS_OF_SERVICE)} className="flex-1 flex items-center justify-between gap-2 bg-white rounded-2xl px-5 py-4 border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors"><Icon name="gavel" size={20} className="text-surface-400 group-hover:text-primary-500 transition-colors" /></div>
                  <div className={isIt ? '' : 'text-right'}>
                    <p className="text-xs text-surface-400">{isIt ? 'Pagina successiva' : 'الصفحة التالية'}</p>
                    <p className="text-sm font-bold text-surface-900">{isIt ? 'Termini di servizio' : 'شروط الاستخدام'}</p>
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
  );
}
