/**
 * LezioniPatenteInfoPage — public SEO landing page.
 * URL: /it/lezioni-patente-b
 * Target keywords: lezioni patente b, codice della strada lezioni, studiare patente b
 */
import { Link } from 'react-router-dom';
import { PageMeta } from '@/hooks/usePageMeta';
import { SeoLayout } from './SeoLayout';

const CANONICAL = 'https://patentehub.com/it/lezioni-patente-b';

const LESSON_TOPICS = [
  {
    number: '01',
    title: 'Segnali Stradali',
    desc: 'Tutte le categorie: pericolo, divieto, obbligo, indicazione e precedenza con immagini e spiegazioni.',
    keywords: 'segnali stradali, segnaletica stradale',
  },
  {
    number: '02',
    title: 'Norme di Comportamento',
    desc: 'Comportamento alla guida, obblighi del conducente, uso del telefono e cinture di sicurezza.',
    keywords: 'norme comportamento guida, obblighi conducente',
  },
  {
    number: '03',
    title: 'Velocità e Distanze',
    desc: 'Limiti di velocità in città, fuori città e autostrada. Distanza di sicurezza e spazio di frenata.',
    keywords: 'limiti velocità, spazio frenata',
  },
  {
    number: '04',
    title: 'Precedenze e Incroci',
    desc: 'Regole di precedenza agli incroci, rotatorie, sorpassi e manovre in sicurezza.',
    keywords: 'precedenze, incroci, rotatorie',
  },
  {
    number: '05',
    title: 'Alcol, Droghe e Farmaci',
    desc: "Limiti legali per l'alcol alla guida, effetti delle droghe sulla capacità di guida e sanzioni previste.",
    keywords: 'alcol guida, droghe guida, tasso alcolemico',
  },
  {
    number: '06',
    title: 'Sicurezza Stradale',
    desc: 'Fattori di rischio, condizioni meteorologiche, dispositivi di sicurezza e comportamento in caso di incidente.',
    keywords: 'sicurezza stradale, fattori rischio',
  },
  {
    number: '07',
    title: 'Il Veicolo: Tecnica e Manutenzione',
    desc: 'Pneumatici, freni, luci e dispositivi di sicurezza del veicolo. Revisione e manutenzione ordinaria.',
    keywords: 'manutenzione auto, pneumatici, freni',
  },
  {
    number: '08',
    title: 'Primo Soccorso Stradale',
    desc: 'Comportamento corretto in caso di incidente, chiamata dei soccorsi e manovre di primo soccorso.',
    keywords: 'primo soccorso, incidente stradale',
  },
  {
    number: '09',
    title: "Tutela dell'Ambiente",
    desc: 'Emissioni dei veicoli, guida ecologica, limiti di emissione e impatto ambientale della mobilità.',
    keywords: 'guida ecologica, emissioni veicoli',
  },
];

const FEATURES = [
  {
    icon: '🎓',
    title: 'Lezioni Strutturate',
    desc: 'Ogni argomento è suddiviso in lezioni brevi e progressive, facili da seguire anche su smartphone.',
  },
  {
    icon: '📸',
    title: 'Immagini e Diagrammi',
    desc: 'Segnali stradali, schemi di precedenza e diagrammi di frenata per capire visivamente i concetti.',
  },
  {
    icon: '🌍',
    title: 'Italiano e Arabo',
    desc: "Ogni lezione è disponibile in entrambe le lingue per chi studia la patente italiana dall'estero.",
  },
  {
    icon: '📊',
    title: 'Progressi Salvati',
    desc: 'Il sistema ricorda dove sei arrivato. Riprendi da dove hai lasciato, ogni volta che vuoi.',
  },
  {
    icon: '🔗',
    title: 'Collegato ai Quiz',
    desc: "Dopo ogni lezione, puoi fare un quiz specifico su quell'argomento per verificare la comprensione.",
  },
  {
    icon: '📱',
    title: 'Mobile-Friendly',
    desc: 'Studia ovunque ti trovi, dal telefono, tablet o computer. Ottimizzato per ogni dispositivo.',
  },
];

export function LezioniPatenteInfoPage() {
  return (
    <SeoLayout>
      <PageMeta
        title="Lezioni Patente B Online Gratis 2025 – Codice della Strada Completo"
        description="Studia il codice della strada con lezioni patente B gratuite su Patente Hub. Segnali stradali, velocità, precedenze, alcol e sicurezza. Lezioni in italiano e arabo con quiz integrati."
        canonical={CANONICAL}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Lezioni Patente B Online – Patente Hub',
            url: CANONICAL,
            description: 'Lezioni online gratuite per prepararsi all\'esame della patente B. Codice della strada completo.',
            inLanguage: 'it',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://patentehub.com/it' },
                { '@type': 'ListItem', position: 2, name: 'Lezioni Patente B', item: CANONICAL },
              ],
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: 'Lezioni Patente B – Codice della Strada Completo',
            description: 'Corso online gratuito per prepararsi all\'esame della patente B. Tutte le lezioni del codice della strada in italiano e arabo.',
            provider: {
              '@type': 'Organization',
              name: 'Patente Hub',
              url: 'https://patentehub.com',
            },
            educationalLevel: 'Beginner',
            teaches: 'Codice della strada italiano – segnali stradali, precedenze, velocità, sicurezza',
            inLanguage: ['it', 'ar'],
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
            hasCourseInstance: LESSON_TOPICS.map(topic => ({
              '@type': 'CourseInstance',
              name: topic.title,
              description: topic.desc,
            })),
          },
        ]}
      />
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-violet-200">
              <li><Link to="/it" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-violet-400">›</li>
              <li aria-current="page" className="text-white font-medium">Lezioni Patente B</li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Lezioni Patente B Online<br />
            <span className="text-yellow-300">Codice della Strada Completo</span>
          </h1>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tutto il <strong className="text-white">Codice della Strada</strong> suddiviso in lezioni brevi
            e comprensibili. Studia a tuo ritmo, in italiano o in arabo, e preparati all'esame patente B.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/it/register"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-colors shadow-lg"
            >
              📚 Inizia a Studiare Gratis
            </Link>
            <Link
              to="/it/quiz-patente-b"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              📝 Quiz di Verifica
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-violet-200">
            <span>✅ 9 Moduli Tematici</span>
            <span>📱 Studio Mobile</span>
            <span>🌍 Italiano & Arabo</span>
            <span>🔗 Quiz Integrati</span>
          </div>
        </div>
      </section>

      {/* ── Lesson topics ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="argomenti-lezioni">
        <div className="max-w-5xl mx-auto">
          <h2 id="argomenti-lezioni" className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Argomenti delle Lezioni Patente B
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Ogni modulo copre un aspetto fondamentale del Codice della Strada
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LESSON_TOPICS.map((topic) => (
              <article
                key={topic.number}
                className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-violet-400 bg-violet-100 rounded-lg px-2 py-1 flex-shrink-0 group-hover:bg-violet-200 transition-colors">
                    {topic.number}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">{topic.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{topic.desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Patente Hub ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50" aria-labelledby="perche-patente-hub">
        <div className="max-w-5xl mx-auto">
          <h2 id="perche-patente-hub" className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Perché Studiare la Patente su Patente Hub?
          </h2>
          <p className="text-center text-gray-500 mb-10">
            La piattaforma gratuita più completa per prepararsi all'esame teorico della patente B
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => (
              <article key={feat.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-3xl mb-3" aria-hidden="true">{feat.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Study plan ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="piano-studio">
        <div className="max-w-4xl mx-auto">
          <h2 id="piano-studio" className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Piano di Studio Consigliato per la Patente B
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Un programma di 4 settimane per arrivare all'esame preparato
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                week: 'Settimana 1',
                color: 'border-blue-200 bg-blue-50',
                titleColor: 'text-blue-700',
                tasks: [
                  'Segnali stradali di pericolo e divieto',
                  'Segnali di obbligo e indicazione',
                  'Segnali di precedenza',
                  'Quiz sui segnali stradali',
                ],
              },
              {
                week: 'Settimana 2',
                color: 'border-green-200 bg-green-50',
                titleColor: 'text-green-700',
                tasks: [
                  'Velocità e distanze di sicurezza',
                  'Precedenze e incroci',
                  'Sorpasso e manovre',
                  'Simulazione parziale (15 domande)',
                ],
              },
              {
                week: 'Settimana 3',
                color: 'border-amber-200 bg-amber-50',
                titleColor: 'text-amber-700',
                tasks: [
                  'Alcol, droghe e farmaci',
                  'Sicurezza stradale e meteorologia',
                  'Tecnica e manutenzione veicolo',
                  'Quiz sugli errori comuni',
                ],
              },
              {
                week: 'Settimana 4',
                color: 'border-violet-200 bg-violet-50',
                titleColor: 'text-violet-700',
                tasks: [
                  'Ripasso degli argomenti più difficili',
                  'Simulazioni complete giornaliere',
                  'Focus sugli errori ricorrenti',
                  'Simulazione finale: target >90%',
                ],
              },
            ].map(({ week, color, titleColor, tasks }) => (
              <div key={week} className={`rounded-2xl p-6 border ${color}`}>
                <h3 className={`font-bold text-lg mb-4 ${titleColor}`}>{week}</h3>
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li key={task} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Inizia le Lezioni Patente B Gratis
          </h2>
          <p className="text-violet-100 mb-8 text-lg">
            Tutto il codice della strada, organizzato per te. Studia a tuo ritmo, dove vuoi.
          </p>
          <Link
            to="/it/register"
            className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-colors shadow-lg"
          >
            🎓 Inizia le Lezioni
          </Link>
        </div>
      </section>

      {/* ── Internal links ───────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Strumenti Complementari per la Patente B</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/it/quiz-patente-b', label: '📝 Quiz Patente B' },
              { to: '/it/simulatore-esame-patente', label: '📋 Simulatore Esame' },
              { to: '/it/segnali-stradali-italia', label: '🚦 Segnali Stradali' },
              { to: '/it/errori-comuni-esame-patente', label: '⚠️ Errori Comuni' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 p-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SeoLayout>
  );
}
