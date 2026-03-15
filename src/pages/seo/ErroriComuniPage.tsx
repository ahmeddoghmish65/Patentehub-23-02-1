/**
 * ErroriComuniPage — public SEO landing page.
 * URL: /it/errori-comuni-esame-patente
 * Target keywords: errori comuni esame patente, come superare esame patente, esame patente b trucchi
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageMeta } from '@/shared/hooks/usePageMeta';
import { SeoLayout } from './SeoLayout';

const CANONICAL = 'https://patentehub.com/it/errori-comuni-esame-patente';

const COMMON_ERRORS = [
  {
    rank: 1,
    title: 'Confondere i segnali di pericolo con quelli di divieto',
    category: 'Segnali Stradali',
    categoryColor: 'bg-red-100 text-red-700',
    desc: 'Molti candidati confondono i triangoli (pericolo) con i cerchi rossi (divieto). La forma è il primo elemento da guardare: triangolo = avvertimento, cerchio = obbligo o divieto.',
    tip: 'Memorizza prima la forma, poi il contenuto. Tutti i triangoli avvertono, tutti i cerchi rossi vietano.',
  },
  {
    rank: 2,
    title: 'Sbagliare le regole di precedenza agli incroci',
    category: 'Precedenze',
    categoryColor: 'bg-amber-100 text-amber-700',
    desc: "Gli incroci sono l'argomento con più errori nell'esame. La regola base è: se non ci sono segnali, si ha la precedenza da destra. Ma molti si confondono con incroci segnalati, rotatorie e corsie preferenziali.",
    tip: "Disegna mentalmente l'incrocio e identifica tutti i segnali presenti prima di rispondere. La rotatoria dà sempre la precedenza a chi è già in rotazione.",
  },
  {
    rank: 3,
    title: 'Confondere le distanze di sicurezza',
    category: 'Velocità',
    categoryColor: 'bg-blue-100 text-blue-700',
    desc: 'Lo spazio di frenata e la distanza di sicurezza aumentano con il quadrato della velocità — a 100 km/h servono 4 volte più metri che a 50 km/h. Molti sottovalutano questo effetto.',
    tip: 'Ricorda: raddoppi la velocità = quadrupli lo spazio di frenata. È fisica, non intuizione.',
  },
  {
    rank: 4,
    title: 'Errori sui limiti di velocità',
    category: 'Velocità',
    categoryColor: 'bg-blue-100 text-blue-700',
    desc: 'I limiti variano per tipo di strada, condizioni meteo e tipo di patente. Ad es. i neopatentati hanno limiti ridotti per 3 anni. Anche il rimorchio cambia i limiti.',
    tip: 'Impara i limiti base (50/90/110/130) e le eccezioni principali: pioggia, neopatentati, autoarticolati.',
  },
  {
    rank: 5,
    title: "Sottovalutare le domande sull'alcol",
    category: 'Alcol e Droghe',
    categoryColor: 'bg-purple-100 text-purple-700',
    desc: 'Il tasso alcolemico legale è 0,5 g/L per i conducenti ordinari e 0,0 g/L per neopatentati, professionisti e under 21. Le sanzioni variano drasticamente per fascia.',
    tip: 'Studia la tabella completa delle fasce di tasso alcolemico e le relative sanzioni. Ci sono spesso domande su questo argomento.',
  },
  {
    rank: 6,
    title: 'Non distinguere fermata e sosta',
    category: 'Sosta',
    categoryColor: 'bg-orange-100 text-orange-700',
    desc: 'La fermata è una sosta breve con il guidatore pronto a partire (max pochi minuti). La sosta è più lunga, con il guidatore che si allontana. I segnali di divieto si applicano diversamente.',
    tip: 'Fermata = breve, conducente presente. Sosta = prolungata, conducente assente. Il segnale di "divieto di sosta" vieta la sosta ma permette la fermata.',
  },
  {
    rank: 7,
    title: 'Sbagliare le domande sul primo soccorso',
    category: 'Primo Soccorso',
    categoryColor: 'bg-green-100 text-green-700',
    desc: 'Le domande sul primo soccorso riguardano la sequenza corretta delle azioni: sicurezza, chiamata dei soccorsi, posizione laterale di sicurezza, massaggio cardiaco. Molti invertono la priorità.',
    tip: 'La sequenza è sempre: 1) metti in sicurezza la scena, 2) chiama il 112, 3) presta soccorso. La sicurezza viene prima di tutto.',
  },
  {
    rank: 8,
    title: 'Rispondere troppo in fretta',
    category: 'Tecnica d\'Esame',
    categoryColor: 'bg-gray-100 text-gray-700',
    desc: 'Con 30 domande e 30 minuti, il tempo è sufficiente (1 minuto per domanda). Molti si precipitano e sbagliano per disattenzione, non per mancanza di studio.',
    tip: 'Leggi ogni domanda due volte. Usa la griglia di navigazione per rivedere le domande a cui non sei sicuro prima di consegnare.',
  },
];

const FAQ_ITEMS = [
  {
    q: "Quali sono gli argomenti più difficili dell'esame patente B?",
    a: "Gli argomenti con più errori sono: precedenze agli incroci (regole complesse), segnali stradali (confusione tra categorie), limiti di velocità con eccezioni, e regole sull'alcol con le diverse fasce di tasso alcolemico.",
  },
  {
    q: "Con quanti errori si supera l'esame teorico patente B?",
    a: "L'esame teorico della patente B si supera con un massimo di 3 errori su 30 domande (punteggio minimo: 27/30). Con 4 o più errori l'esame non è superato.",
  },
  {
    q: "Quante volte si può ripetere l'esame teorico patente B?",
    a: "Non c'è un limite al numero di tentativi per l'esame teorico. Bisogna però attendere almeno 30 giorni tra un tentativo e l'altro dopo il secondo fallimento.",
  },
  {
    q: "Posso usare il calcolatore durante l'esame patente?",
    a: "No, durante l'esame teorico della patente B non è consentito usare calcolatori o altri dispositivi. Le domande non richiedono calcoli complessi.",
  },
  {
    q: "Quanto dura il foglio rosa dopo l'esame teorico?",
    a: "Il foglio rosa (autorizzazione alla guida accompagnata o all'esame pratico) ha una validità di 2 anni. Se non si supera l'esame pratico entro 2 anni, bisogna ripetere quello teorico.",
  },
];

export function ErroriComuniPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SeoLayout>
      <PageMeta
        title="Errori Comuni Esame Patente B – Come Evitarli e Superare il Test"
        description="Scopri gli 8 errori più comuni nell'esame teorico patente B e come evitarli. Guida pratica su segnali, precedenze, velocità, alcol e tecnica d'esame. Preparati con i consigli di chi ha già superato l'esame."
        canonical={CANONICAL}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Errori Comuni Esame Patente B – Patente Hub',
            url: CANONICAL,
            description: 'Gli errori più comuni nell\'esame patente B e come evitarli.',
            inLanguage: 'it',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://patentehub.com/it' },
                { '@type': 'ListItem', position: 2, name: 'Errori Comuni Esame Patente', item: CANONICAL },
              ],
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Errori Comuni Esame Patente B – Come Evitarli',
            description: 'Guida agli errori più frequenti nell\'esame teorico della patente B in Italia.',
            author: { '@type': 'Organization', name: 'Patente Hub' },
            publisher: { '@type': 'Organization', name: 'Patente Hub', url: 'https://patentehub.com' },
            inLanguage: 'it',
            url: CANONICAL,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          },
        ]}
      />
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-orange-200">
              <li><Link to="/it" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-orange-400">›</li>
              <li aria-current="page" className="text-white font-medium">Errori Comuni Esame Patente</li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Gli 8 Errori Più Comuni<br />
            <span className="text-white/90">dell'Esame Patente B</span>
            <br /><span className="text-2xl md:text-3xl font-bold text-yellow-200">e Come Evitarli</span>
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Analisi dei <strong className="text-white">errori più frequenti</strong> nell'esame teorico della patente B
            con consigli pratici per non ripeterli. Studia in modo mirato e arriva preparato.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/it/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-orange-50 transition-colors shadow-lg"
            >
              ⚠️ Allenati sugli Errori Gratis
            </Link>
            <Link
              to="/it/simulatore-esame-patente"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              📋 Simulatore Esame
            </Link>
          </div>
        </div>
      </section>

      {/* ── Intro ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="intro-errori">
        <div className="max-w-4xl mx-auto">
          <h2 id="intro-errori" className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Perché Conoscere gli Errori Comuni Prima dell'Esame
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
            <p>
              Ogni anno in Italia migliaia di candidati <strong>non superano l'esame teorico della patente B</strong>
              non per mancanza di studio, ma per errori evitabili. Molti sbagliano le stesse domande,
              sugli stessi argomenti, per gli stessi motivi.
            </p>
            <p className="mt-4">
              Questa guida analizza gli <strong>8 errori più frequenti</strong> basati sull'esperienza di migliaia di
              candidati. Per ognuno trovi: la spiegazione dell'errore, il motivo per cui è così comune e
              il <strong>consiglio pratico</strong> per non ricaderci.
            </p>
            <p className="mt-4">
              Su Patente Hub puoi inoltre esercitarti specificamente sugli argomenti in cui fai più errori:
              il sistema salva ogni risposta sbagliata e ti permette di ripassarla.
            </p>
          </div>
        </div>
      </section>

      {/* ── Errors list ──────────────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-gray-50" aria-labelledby="lista-errori">
        <div className="max-w-4xl mx-auto">
          <h2 id="lista-errori" className="text-3xl font-bold text-gray-900 mb-10 text-center">
            I 8 Errori Più Comuni nell'Esame Patente B
          </h2>
          <div className="space-y-6">
            {COMMON_ERRORS.map((err) => (
              <article
                key={err.rank}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-600 text-white font-extrabold flex items-center justify-center text-lg">
                    {err.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-base">{err.title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${err.categoryColor}`}>
                        {err.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{err.desc}</p>
                    <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3 border border-amber-100">
                      <span className="text-amber-600 flex-shrink-0 text-lg" aria-hidden="true">💡</span>
                      <p className="text-sm text-amber-800 font-medium leading-relaxed">{err.tip}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Checklist before exam ─────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="checklist-esame">
        <div className="max-w-4xl mx-auto">
          <h2 id="checklist-esame" className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Checklist Prima dell'Esame Patente B
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Controlla di aver studiato tutti questi punti prima di presentarti all'esame
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Conosco tutte le categorie di segnali stradali',
              'So le regole di precedenza agli incroci e nelle rotatorie',
              'Conosco i limiti di velocità per ogni tipo di strada',
              'So la differenza tra fermata e sosta',
              'Conosco i limiti di tasso alcolemico e le sanzioni',
              'So il comportamento corretto in caso di incidente',
              'Ho fatto almeno 5 simulazioni complete con punteggio >90%',
              'Ho ripassato tutti gli errori delle mie simulazioni',
              'So usare la griglia di navigazione dell\'esame',
              'Sono riposato e arrivo in orario il giorno dell\'esame',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50" aria-labelledby="faq-errori">
        <div className="max-w-3xl mx-auto">
          <h2 id="faq-errori" className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Domande Frequenti sull'Esame Patente B
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <span className="text-xl flex-shrink-0" style={{ display: 'inline-block', transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                    <p className="pt-4">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Non Ripetere gli Stessi Errori. Studia con Patente Hub
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Esercitati sugli argomenti più difficili, tieni traccia dei tuoi errori e arriva all'esame preparato.
          </p>
          <Link
            to="/it/register"
            className="inline-flex items-center gap-2 bg-white text-orange-700 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-orange-50 transition-colors shadow-lg"
          >
            🚀 Inizia a Studiare Gratis
          </Link>
        </div>
      </section>

      {/* ── Internal links ───────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Completa la tua Preparazione alla Patente B</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/it/quiz-patente-b', label: '📚 Quiz Patente B' },
              { to: '/it/simulatore-esame-patente', label: '📋 Simulatore Esame' },
              { to: '/it/segnali-stradali-italia', label: '🚦 Segnali Stradali' },
              { to: '/it/lezioni-patente-b', label: '🎓 Lezioni Patente' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 p-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all"
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
