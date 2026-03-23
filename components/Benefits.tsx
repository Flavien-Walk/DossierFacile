const benefits = [
  {
    title: 'Une présentation qui favorise la lecture',
    description:
      "Un dossier bien structuré est plus agréable à consulter. La mise en page de DossierFacile facilite la lecture et améliore la perception de votre candidature dès la première page.",
  },
  {
    title: 'Réduire le risque de mauvaise impression',
    description:
      "Un dossier illisible, mal scanné ou désorganisé peut nuire à votre candidature. DossierFacile organise vos documents dans un format clair, propre et cohérent.",
  },
  {
    title: 'Se démarquer par le soin apporté',
    description:
      "Présenter un dossier professionnel témoigne de votre sérieux. Dans un marché locatif compétitif, ce détail peut faire la différence auprès d'un propriétaire ou d'une agence.",
  },
  {
    title: 'Une projection concrète pour le bailleur',
    description:
      "La page de présentation synthétise vos informations essentielles en un coup d'œil. Le propriétaire comprend immédiatement votre situation sans chercher dans les documents.",
  },
];

export default function Benefits() {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Pourquoi soigner la présentation de son dossier
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          La forme ne remplace pas le fond, mais elle peut l'accompagner efficacement.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {benefits.map((b) => (
          <div key={b.title} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
