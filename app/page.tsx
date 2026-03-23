import Link from 'next/link';
import TrustBadges from '@/components/TrustBadges';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-gray-900 tracking-tight">DossierFacile</span>
          <Link
            href="/create"
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Créer mon dossier
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6 border border-primary-100">
            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
            Sans création de compte — Sans stockage
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            Créez un dossier locataire professionnel en 2 minutes
          </h1>

          <p className="text-lg text-gray-600 mb-3 leading-relaxed">
            Un dossier bien présenté peut faire la différence. DossierFacile met en forme vos
            documents automatiquement et génère un PDF clair, lisible et professionnel.
          </p>

          <p className="text-sm text-gray-500 mb-10">
            Sans création de compte. Sans inscription. Vos documents ne sont jamais stockés.
            Suppression automatique après génération.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/create"
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors text-center shadow-sm"
            >
              Créer mon dossier
            </Link>
            <a
              href="#comment-ca-marche"
              className="text-gray-600 hover:text-gray-900 font-medium px-8 py-4 rounded-xl text-base transition-colors text-center border border-gray-200 hover:border-gray-300"
            >
              Voir comment ça marche
            </a>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Prévisualisation gratuite · Téléchargement 5 €
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-gray-100 bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <TrustBadges />
        </div>
      </section>

      {/* How it works */}
      <section id="comment-ca-marche" className="max-w-5xl mx-auto px-6 py-20">
        <HowItWorks />
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <Benefits />
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Un prix simple et transparent</h2>
          <p className="text-gray-500 mb-8">Prévisualisation gratuite. Vous payez uniquement si vous souhaitez télécharger le PDF final.</p>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="text-5xl font-bold text-gray-900 mb-1">5 €</div>
            <div className="text-gray-500 text-sm mb-6">paiement unique, sans abonnement</div>

            <ul className="text-left space-y-3 mb-8">
              {[
                'Prévisualisation gratuite avant paiement',
                'PDF final sans filigrane',
                'Choix parmi 3 styles professionnels',
                'Email de candidature inclus',
                'Téléchargement immédiat',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/create"
              className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl text-center transition-colors"
            >
              Créer mon dossier
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-gray-700">DossierFacile</span>
          <p className="text-sm text-gray-400">
            Vos documents ne sont jamais stockés · Suppression automatique après génération
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
