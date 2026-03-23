const steps = [
  {
    number: '01',
    title: 'Renseignez vos informations',
    description: "Nom, situation professionnelle, revenus, contact. Aucune donnée n'est conservée.",
    tag: null,
  },
  {
    number: '02',
    title: 'Déposez vos documents',
    description: "Pièce d'identité, fiches de paie, contrat. Traitement en mémoire uniquement.",
    tag: 'Aucun stockage',
  },
  {
    number: '03',
    title: 'Choisissez un style',
    description: 'Trois designs professionnels : classique, moderne ou premium.',
    tag: null,
  },
  {
    number: '04',
    title: 'Prévisualisez gratuitement',
    description: 'Visualisez votre dossier en direct. Changez de style à tout moment.',
    tag: 'Gratuit',
  },
  {
    number: '05',
    title: 'Payez et téléchargez',
    description: 'Paiement unique de 5 €. PDF final sans filigrane, téléchargement immédiat.',
    tag: '5 €',
  },
];

export default function HowItWorks() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Processus
        </p>
        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Comment ça marche</h2>
        <p className="text-slate-500 text-sm">Simple, rapide et entièrement privé.</p>
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => (
          <div key={step.number} className="flex gap-5">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-btn">
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className="w-px flex-1 bg-slate-200 mt-2 mb-0" style={{ minHeight: '32px' }} />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1">
              <div className="flex items-center gap-2.5 mb-1 pt-1.5">
                <h3 className="font-semibold text-slate-900 text-sm">{step.title}</h3>
                {step.tag && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    step.tag === 'Aucun stockage'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : step.tag === 'Gratuit'
                      ? 'bg-slate-100 text-slate-500 border border-slate-200'
                      : 'bg-primary-50 text-primary-600 border border-primary-200'
                  }`}>
                    {step.tag}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
