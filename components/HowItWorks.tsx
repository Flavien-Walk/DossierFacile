const steps = [
  { number: '01', title: 'Renseignez vos informations', description: 'Nom, situation professionnelle, revenus, contact. Aucune donnée n\'est conservée.' },
  { number: '02', title: 'Déposez vos documents', description: 'Pièce d\'identité, fiches de paie, contrat de travail. Traitement en mémoire uniquement.' },
  { number: '03', title: 'Choisissez un style', description: 'Trois designs professionnels disponibles : classique, moderne ou premium.' },
  { number: '04', title: 'Prévisualisez gratuitement', description: 'Visualisez votre dossier en temps réel avant toute décision. Changez de style à tout moment.' },
  { number: '05', title: 'Payez et téléchargez', description: 'Un paiement unique de 5 €. Téléchargement immédiat du PDF final sans filigrane.' },
];

export default function HowItWorks() {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Comment ça marche</h2>
        <p className="text-gray-500">Un processus simple, rapide et entièrement privé.</p>
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => (
          <div key={step.number} className="flex gap-6 pb-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 mt-2"></div>
              )}
            </div>
            <div className="pt-1.5 pb-4">
              <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
