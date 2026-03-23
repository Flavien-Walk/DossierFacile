const benefits = [
  {
    num: '01',
    title: 'Une présentation qui favorise la lecture',
    description:
      "Un dossier bien structuré est plus agréable à consulter. La mise en page de DossierFacile facilite la lecture et améliore la perception de votre candidature dès la première page.",
  },
  {
    num: '02',
    title: 'Réduire le risque de mauvaise impression',
    description:
      "Un dossier illisible, mal scanné ou désorganisé peut nuire à votre candidature. DossierFacile organise vos documents dans un format clair, propre et cohérent.",
  },
  {
    num: '03',
    title: 'Se démarquer par le soin apporté',
    description:
      "Présenter un dossier professionnel témoigne de votre sérieux. Dans un marché locatif compétitif, ce détail peut faire la différence auprès d'un propriétaire ou d'une agence.",
  },
  {
    num: '04',
    title: 'Une projection concrète pour le bailleur',
    description:
      "La page de présentation synthétise vos informations essentielles en un coup d'œil. Le propriétaire comprend immédiatement votre situation.",
  },
];

export default function Benefits() {
  return (
    <div>
      <div className="text-center mb-14">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Pourquoi ça compte
        </p>
        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
          Pourquoi soigner la présentation de son dossier
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          La forme ne remplace pas le fond, mais elle peut l'accompagner efficacement.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card relative overflow-hidden group hover:shadow-card-md hover:border-slate-300/80 transition-all"
          >
            {/* Faded number */}
            <span className="absolute top-3 right-4 text-6xl font-black text-slate-100 select-none leading-none pointer-events-none">
              {b.num}
            </span>
            <div className="relative">
              <h3 className="font-semibold text-slate-900 mb-2 pr-8 text-[0.9375rem] leading-snug">
                {b.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
