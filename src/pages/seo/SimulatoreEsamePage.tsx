/**
 * SimulatoreEsamePage — public SEO landing page.
 * URL: /it/simulatore-esame-patente
 * Target keywords: simulatore esame patente, simulazione esame patente b, test patente b
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageMeta } from '@/shared/hooks/usePageMeta';
import { SeoLayout } from './SeoLayout';

const CANONICAL = 'https://patentehub.com/it/simulatore-esame-patente';

const FAQ_ITEMS = [
  {
    q: "Come si svolge l'esame teorico della patente B?",
    a: "L'esame teorico della patente B è composto da 30 domande a risposta Vero/Falso da completare in 30 minuti. Si supera con un massimo di 3 errori (27 risposte corrette su 30). Le domande provengono dall'archivio ufficiale del MIT.",
  },
  {
    q: "Il simulatore di Patente Hub è uguale all'esame ufficiale?",
    a: "Il simulatore di Patente Hub replica fedelmente le condizioni dell'esame ufficiale: 30 domande casuali, timer da 30 minuti, massimo 3 errori consentiti. Le domande provengono dallo stesso archivio ufficiale usato nelle autoscuole.",
  },
  {
    q: 'Quante volte posso fare la simulazione?',
    a: "Puoi fare la simulazione d'esame quante volte vuoi, gratuitamente. Ti consigliamo di ripeterla fino a ottenere risultati costantemente superiori al 90% prima di sostenere l'esame reale.",
  },
  {
    q: 'Cosa succede se sbaglio più di 3 domande nella simulazione?',
    a: "Se commetti più di 3 errori nella simulazione, il test viene considerato \"non superato\" — esattamente come nell'esame reale. Puoi rivedere tutte le risposte errate con le relative spiegazioni.",
  },
  {
    q: "Quanto tempo devo studiare per superare l'esame patente?",
    a: "Dipende dalla persona, ma in genere 2-4 settimane di studio quotidiano con quiz e simulazioni sono sufficienti. Con Patente Hub puoi monitorare i tuoi progressi e concentrarti sulle aree più deboli.",
  },
];

const EXAM_RULES = [
  { icon: '📝', label: '30 domande', desc: "Vero o Falso, tratte dall'archivio ufficiale MIT" },
  { icon: '⏱️', label: '30 minuti', desc: 'Tempo massimo per completare tutte le domande' },
  { icon: '✅', label: 'Max 3 errori', desc: 'Puoi sbagliare al massimo 3 risposte per superarlo' },
  { icon: '🎲', label: 'Domande casuali', desc: "Ogni simulazione ha domande diverse, come l'esame reale" },
];

export function SimulatoreEsamePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SeoLayout>
      <PageMeta
        title="Simulatore Esame Patente B Online Gratis 2025 – 30 Domande Ufficiali"
        description="Simula l'esame teorico della patente B con il simulatore gratuito di Patente Hub. 30 domande ufficiali, timer 30 minuti, massimo 3 errori – identico all'esame reale. Preparati con la simulazione più fedele disponibile online."
        canonical={CANONICAL}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Simulatore Esame Patente B – Patente Hub',
            url: CANONICAL,
            description: 'Simulazione gratuita dell\'esame teorico della patente B. 30 domande, 30 minuti, max 3 errori.',
            inLanguage: 'it',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://patentehub.com/it' },
                { '@type': 'ListItem', position: 2, name: 'Simulatore Esame Patente', item: CANONICAL },
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
        ]}
      />
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-emerald-200">
              <li><Link to="/it" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-emerald-400">›</li>
              <li aria-current="page" className="text-white font-medium">Simulatore Esame Patente</li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Simulatore Esame Patente B<br />
            <span className="text-yellow-300">Identico all'Esame Ufficiale</span>
          </h1>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-white">30 domande</strong> casuali dall'archivio MIT,
            <strong className="text-white"> 30 minuti</strong> di tempo,
            massimo <strong className="text-white">3 errori</strong>.
            La simulazione più fedele all'esame teorico della patente B disponibile online, gratuitamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/it/register"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-colors shadow-lg"
            >
              🎯 Inizia la Simulazione Gratis
            </Link>
            <Link
              to="/it/quiz-patente-b"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              📚 Quiz di Preparazione
            </Link>
          </div>
        </div>
      </section>

      {/* ── Exam rules ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="regole-esame">
        <div className="max-w-5xl mx-auto">
          <h2 id="regole-esame" className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Le Regole dell'Esame Teorico Patente B
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Il simulatore di Patente Hub replica esattamente le condizioni dell'esame reale
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXAM_RULES.map((rule) => (
              <article
                key={rule.label}
                className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100"
              >
                <div className="text-4xl mb-3" aria-hidden="true">{rule.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{rule.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{rule.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How the simulator works ──────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50" aria-labelledby="come-funziona-simulatore">
        <div className="max-w-4xl mx-auto">
          <h2 id="come-funziona-simulatore" className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Come Funziona il Simulatore
          </h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Avvia la simulazione',
                  desc: "Clicca \"Inizia\" e il simulatore seleziona casualmente 30 domande dall'archivio ufficiale.",
                },
                {
                  step: '2',
                  title: 'Rispondi in 30 minuti',
                  desc: "Il timer parte automaticamente. Puoi rispondere nell'ordine che preferisci e tornare sulle risposte precedenti.",
                },
                {
                  step: '3',
                  title: 'Invia e ricevi il risultato',
                  desc: 'Alla fine del tempo (o prima, se vuoi) invii le risposte. Il sistema calcola immediatamente il risultato.',
                },
                {
                  step: '4',
                  title: 'Rivedi gli errori',
                  desc: 'Ogni risposta errata è mostrata con la spiegazione corretta per aiutarti a non ripetere lo stesso errore.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Stats card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 text-xl mb-6 text-center">La tua scheda esame</h3>
              <div className="space-y-4">
                {[
                  { label: 'Domande totali', value: '30', color: 'text-indigo-600' },
                  { label: 'Errori massimi', value: '3', color: 'text-red-500' },
                  { label: 'Risposte corrette minime', value: '27', color: 'text-emerald-600' },
                  { label: 'Tempo massimo', value: '30 min', color: 'text-amber-600' },
                  { label: 'Punteggio minimo', value: '90%', color: 'text-indigo-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`font-bold text-lg ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tips section ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="consigli-esame">
        <div className="max-w-4xl mx-auto">
          <h2 id="consigli-esame" className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Consigli per Superare l'Esame Teorico della Patente B
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Strategie pratiche testate da chi ha già superato l'esame
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: '📅',
                title: 'Studia ogni giorno',
                desc: '20-30 minuti al giorno per 3-4 settimane sono più efficaci di sessioni intensive. La costanza fa la differenza.',
              },
              {
                icon: '🎯',
                title: 'Concentrati sui punti deboli',
                desc: 'Usa la sezione "Errori" di Patente Hub per rivedere solo le domande che hai sbagliato. Non perdere tempo sulle cose che già sai.',
              },
              {
                icon: '📋',
                title: 'Fai simulazioni regolari',
                desc: 'Dopo ogni sessione di studio, fai almeno una simulazione completa. Monitora il tuo punteggio nel tempo.',
              },
              {
                icon: '🧠',
                title: 'Capire, non memorizzare',
                desc: 'Leggi sempre la spiegazione delle risposte errate. Capire il principio è molto più utile del memorizzare la risposta.',
              },
            ].map(({ icon, title, desc }) => (
              <article key={title} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-2xl flex-shrink-0" aria-hidden="true">{icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50" aria-labelledby="faq-simulatore">
        <div className="max-w-3xl mx-auto">
          <h2 id="faq-simulatore" className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Domande Frequenti sul Simulatore Esame Patente
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
              >
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
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
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Sei Pronto per l'Esame Patente B?
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Testa le tue conoscenze con la simulazione completa. Gratis, senza registrazione necessaria.
          </p>
          <Link
            to="/it/register"
            className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-colors shadow-lg"
          >
            🎯 Inizia la Simulazione
          </Link>
        </div>
      </section>

      {/* ── Internal links ───────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Approfondisci la Preparazione alla Patente B</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/it/quiz-patente-b', label: '📚 Quiz Patente B' },
              { to: '/it/segnali-stradali-italia', label: '🚦 Segnali Stradali' },
              { to: '/it/lezioni-patente-b', label: '🎓 Lezioni Patente' },
              { to: '/it/errori-comuni-esame-patente', label: '⚠️ Errori Comuni' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 p-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
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
