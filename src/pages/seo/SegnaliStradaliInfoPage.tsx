/**
 * SegnaliStradaliInfoPage — public SEO landing page.
 * URL: /it/segnali-stradali-italia
 * Target keywords: segnali stradali, segnali stradali italiani, significato segnali stradali
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageMeta } from '@/hooks/usePageMeta';
import { SeoLayout } from './SeoLayout';

const CANONICAL = 'https://patentehub.com/it/segnali-stradali-italia';

const SIGN_CATEGORIES = [
  {
    emoji: '⚠️',
    name: 'Segnali di Pericolo',
    color: 'bg-red-50 border-red-200',
    titleColor: 'text-red-700',
    desc: 'I segnali di pericolo avvertono gli utenti della strada della presenza di pericoli. Hanno forma triangolare con bordo rosso e sfondo bianco. Esempi: curva pericolosa, attraversamento pedonale, incrocio pericoloso.',
    examples: ['Curva pericolosa a destra/sinistra', 'Doppia curva', 'Attraversamento pedonale', 'Bambi (fauna selvatica)', 'Semaforo', 'Lavori in corso'],
  },
  {
    emoji: '🚫',
    name: 'Segnali di Divieto',
    color: 'bg-rose-50 border-rose-200',
    titleColor: 'text-rose-700',
    desc: 'I segnali di divieto impongono limitazioni e divieti specifici. Hanno generalmente forma circolare con bordo rosso. I divieti devono essere rispettati pena sanzioni.',
    examples: ['Divieto di transito', 'Divieto di sorpasso', 'Limite di velocità', 'Divieto di accesso', 'Sosta vietata', 'Fermata vietata'],
  },
  {
    emoji: '🔵',
    name: 'Segnali di Obbligo',
    color: 'bg-blue-50 border-blue-200',
    titleColor: 'text-blue-700',
    desc: 'I segnali di obbligo prescrivono comportamenti obbligatori che il guidatore deve seguire. Sono circolari con sfondo blu. Indicano direzioni obbligatorie, corsie riservate e velocità minime.',
    examples: ['Obbligo di svoltare a destra', 'Senso rotatorio obbligatorio', 'Percorso pedonale', 'Pista ciclabile', 'Velocità minima', 'Catene da neve obbligatorie'],
  },
  {
    emoji: '🟢',
    name: 'Segnali di Indicazione',
    color: 'bg-green-50 border-green-200',
    titleColor: 'text-green-700',
    desc: 'I segnali di indicazione forniscono informazioni utili agli utenti della strada. Includono indicazioni stradali, segnali di servizio e direzioni. Il colore varia: verde per autostrada, blu per strade statali.',
    examples: ['Indicazioni autostrada', 'Area di servizio', 'Ospedale', 'Parcheggio', 'Zona residenziale', 'Inizio/fine autostrada'],
  },
  {
    emoji: '🔺',
    name: 'Segnali di Precedenza',
    color: 'bg-amber-50 border-amber-200',
    titleColor: 'text-amber-700',
    desc: 'I segnali di precedenza regolano la priorità di passaggio agli incroci. Comprendono STOP, dare precedenza, diritto di precedenza e precedenza sul senso contrario.',
    examples: ['STOP', 'Dare precedenza', 'Diritto di precedenza', 'Precedenza sul senso contrario', 'Incrocio con precedenza', 'Fine precedenza'],
  },
];

const FAQ_ITEMS = [
  {
    q: 'Quanti segnali stradali ci sono in Italia?',
    a: "Il Codice della Strada italiano prevede centinaia di segnali stradali, suddivisi in diverse categorie: pericolo, divieto, obbligo, indicazione e precedenza. Patente Hub include tutti i segnali necessari per l'esame della patente B.",
  },
  {
    q: 'Qual è la differenza tra segnale di pericolo e segnale di divieto?',
    a: 'I segnali di pericolo (triangolari, sfondo bianco con bordo rosso) avvertono di un pericolo imminente. I segnali di divieto (circolari, bordo rosso) impongono restrizioni obbligatorie. Ignorare un divieto comporta sanzioni, ignorare un pericolo mette a rischio la sicurezza.',
  },
  {
    q: 'Come si riconoscono i segnali stradali obbligatori?',
    a: 'I segnali di obbligo sono cerchi con sfondo blu. Indicano comportamenti che il guidatore deve necessariamente seguire, come una direzione obbligatoria o una corsia riservata.',
  },
  {
    q: 'I segnali stradali sono uguali in tutta Europa?',
    a: 'La maggior parte dei segnali stradali europei segue le Convenzioni di Vienna, quindi sono simili. Tuttavia, esistono variazioni locali. In Italia il Codice della Strada (D.Lgs. 285/1992) è la legge di riferimento.',
  },
];

export function SegnaliStradaliInfoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SeoLayout>
      <PageMeta
        title="Segnali Stradali Italiani – Guida Completa con Significati 2025"
        description="Guida completa ai segnali stradali italiani: pericolo, divieto, obbligo, indicazione e precedenza. Significati, esempi e spiegazioni per prepararsi all'esame della patente B. Studia gratis su Patente Hub."
        canonical={CANONICAL}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Segnali Stradali Italiani – Guida Completa',
            url: CANONICAL,
            description: 'Guida completa ai segnali stradali italiani per la patente B.',
            inLanguage: 'it',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://patentehub.com/it' },
                { '@type': 'ListItem', position: 2, name: 'Segnali Stradali Italia', item: CANONICAL },
              ],
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Segnali Stradali Italiani – Guida Completa con Significati',
            description: 'Guida completa alle categorie di segnali stradali in Italia: pericolo, divieto, obbligo, indicazione, precedenza.',
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
      <section className="bg-gradient-to-br from-red-600 via-rose-600 to-pink-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-rose-200">
              <li><Link to="/it" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-rose-400">›</li>
              <li aria-current="page" className="text-white font-medium">Segnali Stradali</li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Segnali Stradali Italiani<br />
            <span className="text-yellow-300">Guida Completa con Spiegazioni</span>
          </h1>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tutte le <strong className="text-white">categorie di segnali stradali</strong> previste dal Codice della Strada italiano.
            Significati, esempi pratici e quiz per prepararti all'esame della patente B.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/it/register"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-colors shadow-lg"
            >
              🚦 Esercitati sui Segnali Gratis
            </Link>
            <Link
              to="/it/quiz-patente-b"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              📚 Quiz Patente B
            </Link>
          </div>
        </div>
      </section>

      {/* ── Intro ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="intro-segnali">
        <div className="max-w-4xl mx-auto">
          <h2 id="intro-segnali" className="text-3xl font-bold text-gray-900 mb-6 text-center">
            I Segnali Stradali nell'Esame Patente B
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
            <p>
              I <strong>segnali stradali</strong> sono uno degli argomenti più importanti dell'esame teorico della
              <strong> patente B</strong>. Circa il <strong>30-40% delle domande</strong> dell'esame riguarda
              la corretta interpretazione dei segnali stradali.
            </p>
            <p className="mt-4">
              In Italia, i segnali stradali sono regolamentati dal <strong>Codice della Strada</strong>
              (D.Lgs. 285/1992) e dal suo Regolamento di esecuzione. Sono suddivisi in cinque grandi categorie,
              ognuna con forme e colori caratteristici per essere riconoscibili a prima vista.
            </p>
            <p className="mt-4">
              Su Patente Hub puoi studiare tutti i segnali stradali con <strong>immagini, nomi e spiegazioni</strong>
              in italiano e in arabo, e poi allenarti con quiz specifici per ogni categoria.
            </p>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-gray-50" aria-labelledby="categorie-segnali">
        <div className="max-w-5xl mx-auto">
          <h2 id="categorie-segnali" className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Le 5 Categorie di Segnali Stradali
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Conosci le caratteristiche di ogni categoria per riconoscerle a colpo d'occhio
          </p>
          <div className="space-y-6">
            {SIGN_CATEGORIES.map((cat) => (
              <article
                key={cat.name}
                className={`rounded-2xl p-6 border ${cat.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0" aria-hidden="true">{cat.emoji}</div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${cat.titleColor}`}>{cat.name}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{cat.desc}</p>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Esempi principali:</p>
                      <ul className="flex flex-wrap gap-2">
                        {cat.examples.map((ex) => (
                          <li
                            key={ex}
                            className="text-xs bg-white rounded-full px-3 py-1 border border-gray-200 text-gray-600"
                          >
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Study tips ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" aria-labelledby="come-studiare-segnali">
        <div className="max-w-4xl mx-auto">
          <h2 id="come-studiare-segnali" className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Come Studiare i Segnali Stradali per la Patente
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                title: 'Impara per categoria',
                desc: 'Studia prima tutti i segnali di una categoria prima di passare alla prossima. È più facile memorizzare per blocchi logici.',
              },
              {
                icon: '🖼️',
                title: 'Visualizza le immagini',
                desc: 'Associa sempre il segnale alla sua immagine. Il cervello ricorda molto meglio le immagini rispetto ai testi.',
              },
              {
                icon: '🧪',
                title: 'Fai quiz specifici',
                desc: 'Dopo aver studiato una categoria, fai quiz specifici su quella categoria per consolidare la memoria.',
              },
            ].map(({ icon, title, desc }) => (
              <article key={title} className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50" aria-labelledby="faq-segnali">
        <div className="max-w-3xl mx-auto">
          <h2 id="faq-segnali" className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Domande Frequenti sui Segnali Stradali
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-900 hover:text-red-600 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <span className="text-xl flex-shrink-0" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>+</span>
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
      <section className="py-20 px-4 bg-gradient-to-r from-red-600 to-rose-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Studia Tutti i Segnali Stradali Gratis
          </h2>
          <p className="text-red-100 mb-8 text-lg">
            Oltre 100 segnali stradali con immagini, spiegazioni e quiz. Disponibile in italiano e arabo.
          </p>
          <Link
            to="/it/register"
            className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-yellow-300 transition-colors shadow-lg"
          >
            🚦 Inizia a Studiare
          </Link>
        </div>
      </section>

      {/* ── Internal links ───────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Continua a Prepararti per la Patente B</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/it/quiz-patente-b', label: '📚 Quiz Patente B' },
              { to: '/it/simulatore-esame-patente', label: '📋 Simulatore Esame' },
              { to: '/it/lezioni-patente-b', label: '🎓 Lezioni Patente' },
              { to: '/it/errori-comuni-esame-patente', label: '⚠️ Errori Comuni' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 p-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
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
