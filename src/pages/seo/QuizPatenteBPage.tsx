/**
 * QuizPatenteBPage — public SEO landing page.
 * URL: /it/quiz-patente-b
 * Target keywords: quiz patente b, quiz patente b gratis, quiz patente italiano
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SeoLayout } from './SeoLayout';

const CANONICAL = 'https://patentehub.com/it/quiz-patente-b';

const FAQ_ITEMS = [
  {
    q: 'Quante domande ci sono nel quiz patente B?',
    a: 'Il quiz di preparazione su Patente Hub copre oltre 500 domande ufficiali del Ministero delle Infrastrutture e dei Trasporti, suddivise per argomento: segnali stradali, norme di comportamento, precedenze, velocità, sicurezza e molto altro.',
  },
  {
    q: 'Il quiz patente B è gratuito?',
    a: 'Sì, Patente Hub offre quiz patente B completamente gratuiti. Registrati in pochi secondi e accedi a tutti gli esercizi, senza costi nascosti.',
  },
  {
    q: 'Come funziona il quiz patente B su Patente Hub?',
    a: 'Ogni quiz presenta domande a risposta Vero/Falso con spiegazione immediata. Puoi esercitarti per argomento o in modo casuale. Il sistema tiene traccia dei tuoi errori così da permetterti di ripassare i punti deboli.',
  },
  {
    q: "Quante domande ha l'esame teorico della patente B?",
    a: "L'esame teorico ufficiale della patente B in Italia è composto da 30 domande da rispondere in 30 minuti. Si supera con non più di 3 errori.",
  },
  {
    q: 'Posso studiare per la patente in italiano e in arabo?',
    a: 'Sì. Patente Hub è disponibile in italiano e in arabo, ideale per candidati di origine araba che studiano per la patente in Italia.',
  },
];

const TOPICS = [
  { icon: '🚦', title: 'Segnali Stradali', desc: 'Pericolo, divieto, obbligo, precedenza, indicazione.' },
  { icon: '⚡', title: 'Velocità e Distanze', desc: 'Limiti di velocità in città, fuori città e autostrada.' },
  { icon: '🔄', title: 'Precedenze', desc: 'Incroci, rotatorie, sorpassi e manovre pericolose.' },
  { icon: '🍺', title: 'Alcol e Droghe', desc: 'Limiti legali, sanzioni e comportamento sicuro.' },
  { icon: '🅿️', title: 'Sosta e Fermata', desc: 'Regole su sosta, fermata e parcheggio.' },
  { icon: '🚑', title: 'Primo Soccorso', desc: 'Comportamento in caso di incidente stradale.' },
];

export function QuizPatenteBPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  usePageMeta({
    title: 'Quiz Patente B Gratis 2025 – Esercitati Online con Spiegazioni',
    description:
      'Quiz patente B gratuiti con oltre 500 domande ufficiali, spiegazioni dettagliate e tracciamento degli errori. Preparati all\'esame teorico della patente B in italiano e arabo su Patente Hub.',
    canonical: CANONICAL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Quiz Patente B Gratis – Patente Hub',
        url: CANONICAL,
        description:
          'Esercitati con quiz patente B gratuiti. Domande ufficiali, spiegazioni e simulazioni per superare l\'esame teorico.',
        inLanguage: 'it',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://patentehub.com/it' },
            { '@type': 'ListItem', position: 2, name: 'Quiz Patente B', item: CANONICAL },
          ],
        },
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
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'Quiz Patente B – Preparazione Esame Teorico',
        description: 'Corso online gratuito con quiz patente B, domande ufficiali e spiegazioni per superare l\'esame della patente in Italia.',
        provider: {
          '@type': 'Organization',
          name: 'Patente Hub',
          url: 'https://patentehub.com',
        },
        educationalLevel: 'Beginner',
        teaches: 'Codice della strada italiano – preparazione esame patente B',
        inLanguage: ['it', 'ar'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      },
    ],
  });

  return (
    <SeoLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-indigo-200">
              <li><Link to="/it" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-indigo-400">›</li>
              <li aria-current="page" className="text-white font-medium">Quiz Patente B</li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Quiz Patente B Gratis<br />
            <span className="text-yellow-300">con Spiegazioni Immediate</span>
          </h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Oltre <strong className="text-white">500 domande ufficiali</strong> del codice della strada.
            Studia per argomento, rivedi i tuoi errori e preparati a superare l'esame teorico della patente B.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/it/register"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-colors shadow-lg"
            >
              🚀 Inizia Gratis Ora
            </Link>
            <Link
              to="/it/simulatore-esame-patente"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              📋 Simulatore Esame
            </Link>
          </div>
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-indigo-200">
            <span className="flex items-center gap-1">✅ 100% Gratuito</span>
            <span className="flex items-center gap-1">📚 500+ Domande</span>
            <span className="flex items-center gap-1">🌍 Italiano & Arabo</span>
            <span className="flex items-center gap-1">📊 Tracciamento Errori</span>
          </div>
        </div>
      </section>

      {/* ── What is quiz patente ─────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="cos-e-quiz">
        <div className="max-w-4xl mx-auto">
          <h2 id="cos-e-quiz" className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Cos'è il Quiz Patente B?
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
            <p>
              Il <strong>quiz patente B</strong> è uno strumento di preparazione all'esame teorico della patente di guida
              di categoria B (auto). Su Patente Hub, le domande sono tratte dall'archivio ufficiale del
              <strong> Ministero delle Infrastrutture e dei Trasporti</strong>, lo stesso utilizzato nelle autoscuole italiane.
            </p>
            <p className="mt-4">
              Ogni domanda è a risposta <strong>Vero o Falso</strong>, accompagnata da una spiegazione dettagliata che
              ti aiuta a capire <em>perché</em> la risposta è corretta. Questo approccio è molto più efficace del semplice
              memorizzare le risposte.
            </p>
            <p className="mt-4">
              Puoi esercitarti per <strong>argomento specifico</strong> (ad esempio solo segnali stradali o regole di
              precedenza) o in <strong>modalità casuale</strong> per simulare le condizioni reali d'esame.
            </p>
          </div>
        </div>
      </section>

      {/* ── Topics grid ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50" aria-labelledby="argomenti-quiz">
        <div className="max-w-5xl mx-auto">
          <h2 id="argomenti-quiz" className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Argomenti del Quiz Patente B
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Le domande coprono tutti gli argomenti dell'esame teorico ufficiale
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOPICS.map((topic) => (
              <article
                key={topic.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3" aria-hidden="true">{topic.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{topic.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{topic.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="come-funziona">
        <div className="max-w-4xl mx-auto">
          <h2 id="come-funziona" className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Come Funziona il Quiz su Patente Hub
          </h2>
          <ol className="space-y-6">
            {[
              {
                step: '1',
                title: 'Registrati gratuitamente',
                desc: 'Crea un account in 30 secondi. Non è richiesta carta di credito.',
              },
              {
                step: '2',
                title: 'Scegli l\'argomento',
                desc: 'Seleziona il tema che vuoi studiare o scegli la modalità casuale per un\'esercitazione completa.',
              },
              {
                step: '3',
                title: 'Rispondi alle domande',
                desc: 'Ogni domanda è Vero/Falso. Dopo ogni risposta ricevi una spiegazione immediata.',
              },
              {
                step: '4',
                title: 'Analizza i tuoi errori',
                desc: 'Il sistema salva tutti i tuoi errori. Ripassali fino a quando non li padroneggi.',
              },
              {
                step: '5',
                title: 'Fai la simulazione d\'esame',
                desc: '30 domande in 30 minuti con le stesse regole dell\'esame ufficiale. Sei pronto!',
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50" aria-labelledby="faq-quiz">
        <div className="max-w-3xl mx-auto">
          <h2 id="faq-quiz" className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Domande Frequenti sul Quiz Patente B
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
              >
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <span className="text-xl flex-shrink-0 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
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
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center" aria-labelledby="cta-quiz">
        <div className="max-w-2xl mx-auto">
          <h2 id="cta-quiz" className="text-3xl font-bold mb-4">
            Inizia a Studiare per la Patente B Gratis
          </h2>
          <p className="text-indigo-100 mb-8 text-lg">
            Unisciti a migliaia di studenti che si preparano con Patente Hub.
            Zero abbonamenti, zero costi nascosti.
          </p>
          <Link
            to="/it/register"
            className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-colors shadow-lg"
          >
            🎓 Registrati Gratis
          </Link>
          <p className="mt-4 text-sm text-indigo-200">
            Già registrato?{' '}
            <Link to="/it/login" className="text-white underline hover:no-underline">
              Accedi
            </Link>
          </p>
        </div>
      </section>

      {/* ── Internal links ───────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white" aria-labelledby="link-correlati">
        <div className="max-w-4xl mx-auto">
          <h2 id="link-correlati" className="text-xl font-bold text-gray-900 mb-6">
            Risorse Correlate per la Patente B
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/it/simulatore-esame-patente', label: '📋 Simulatore Esame' },
              { to: '/it/segnali-stradali-italia', label: '🚦 Segnali Stradali' },
              { to: '/it/lezioni-patente-b', label: '📚 Lezioni Patente' },
              { to: '/it/errori-comuni-esame-patente', label: '⚠️ Errori Comuni' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 p-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
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
