import Link from 'next/link';
import TrustBadges from '@/components/TrustBadges';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500 ring-4 ring-primary-100"></span>
            <span className="font-semibold text-slate-900 tracking-tight">DossierFacile</span>
          </div>
          <Link
            href="/create"
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-btn hover:shadow-btn-hover hover:-translate-y-px"
          >
            Créer mon dossier
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="hero-bg">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-20">
          <div className="max-w-[640px]">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white text-slate-600 text-xs font-semibold px-3.5 py-2 rounded-full mb-8 border border-slate-200 shadow-card">
              <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1l2.928 6.472L20 8.556l-5 4.86 1.18 6.868L10 17.27l-6.18 3.014L5 13.416 0 8.556l7.072-1.084L10 1z" clipRule="evenodd" />
              </svg>
              Sans compte · Sans stockage · Suppression automatique
            </div>

            {/* Title */}
            <h1 className="text-[2.75rem] sm:text-[3.25rem] font-bold text-slate-900 leading-[1.12] tracking-tight mb-5">
              Créez un dossier locataire{' '}
              <span className="text-primary-600">professionnel</span>{' '}
              en 2 minutes
            </h1>

            {/* Lead */}
            <p className="text-lg text-slate-600 mb-4 leading-relaxed max-w-[520px]">
              Un dossier bien présenté peut faire la différence. DossierFacile met en forme
              vos documents et génère un PDF clair, lisible et professionnel.
            </p>

            {/* Trust micro-copy */}
            <p className="text-sm text-slate-400 mb-10 leading-relaxed">
              Aucune inscription. Vos documents ne sont jamais stockés.
              Suppression automatique après génération.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-btn hover:shadow-btn-hover hover:-translate-y-px"
              >
                Créer mon dossier
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#comment-ca-marche"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-8 py-4 rounded-xl text-base transition-colors border border-slate-200 bg-white hover:border-slate-300 shadow-card"
              >
                Comment ça marche
              </a>
            </div>

            {/* Social proof chips */}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <span className="text-xs text-slate-400">Inclus :</span>
              {[
                'Prévisualisation gratuite',
                '3 styles PDF',
                'Email de candidature',
                '5 € paiement unique',
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-card">
                  <svg className="w-3 h-3 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust badges ────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200/70 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-6">
            Conçu pour votre tranquillité d'esprit
          </p>
          <TrustBadges />
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section id="comment-ca-marche" className="max-w-5xl mx-auto px-6 py-24">
        <HowItWorks />
      </section>

      {/* ── Benefits ────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200/70 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <Benefits />
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="max-w-[420px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
              Un prix simple et transparent
            </h2>
            <p className="text-slate-500 text-sm">
              Prévisualisez gratuitement. Payez uniquement si vous voulez le PDF final.
            </p>
          </div>

          <div className="pricing-card-bg border border-primary-200/60 rounded-2xl p-8 shadow-card-md relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />

            <div className="relative">
              {/* Price */}
              <div className="flex items-end gap-2 mb-1">
                <span className="text-[3.5rem] font-bold text-slate-900 leading-none tracking-tight">5 €</span>
                <span className="text-slate-400 text-sm mb-2">paiement unique</span>
              </div>
              <p className="text-xs text-slate-400 mb-8">Sans abonnement. Sans engagement.</p>

              {/* Divider */}
              <div className="h-px bg-slate-200/80 mb-6" />

              {/* Features */}
              <ul className="space-y-3.5 mb-8">
                {[
                  'Prévisualisation gratuite avant paiement',
                  'PDF final sans filigrane',
                  'Choix parmi 3 styles professionnels',
                  'Email de candidature inclus',
                  'Téléchargement immédiat',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/create"
                className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl text-sm transition-all shadow-btn hover:shadow-btn-hover hover:-translate-y-px"
              >
                Créer mon dossier
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Guarantee */}
              <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Paiement sécurisé · Documents supprimés automatiquement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-slate-200/70 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
            <span className="font-semibold text-slate-700">DossierFacile</span>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Vos documents ne sont jamais stockés · Traitement en mémoire uniquement · Suppression automatique
          </p>
          <div className="flex gap-5 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
