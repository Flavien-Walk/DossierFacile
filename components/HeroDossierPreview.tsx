export default function HeroDossierPreview() {
  const docs = [
    { label: "Pièce d'identité" },
    { label: 'Justificatif de domicile' },
    { label: 'Contrat de travail' },
    { label: 'Bulletins de salaire × 3' },
    { label: "Avis d'imposition" },
  ];

  return (
    <div className="w-full flex flex-col items-center lg:items-end gap-3 pt-6 lg:pt-0">
      {/* "Exemple" label */}
      <span className="self-end text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm tracking-wide">
        Exemple de rendu
      </span>

      {/* Stack wrapper */}
      <div className="relative">
        {/* Ghost card 2 — furthest back */}
        <div className="absolute inset-0 rounded-2xl bg-primary-50/80 border border-primary-100/60 rotate-[4.5deg]" />
        {/* Ghost card 1 — middle */}
        <div className="absolute inset-0 rounded-2xl bg-slate-100/90 border border-slate-200/60 rotate-[2deg]" />

        {/* Main card */}
        <div className="relative z-10 w-[272px] sm:w-[296px] bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">

          {/* Cover header */}
          <div className="bg-primary-600 px-5 pt-5 pb-5">
            <div className="flex items-center gap-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <span className="text-[9px] font-bold text-white/60 tracking-[0.16em] uppercase">
                DossierFacile
              </span>
            </div>
            <p className="text-[9px] text-primary-200 uppercase tracking-[0.14em] font-semibold mb-1.5">
              Dossier locataire
            </p>
            <p className="text-white font-bold text-lg leading-tight tracking-tight">
              Jean Dupont
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] text-primary-200">Salarié CDI</span>
              <span className="w-1 h-1 rounded-full bg-primary-400/70" />
              <span className="text-[10px] text-primary-200">2 800 €/mois</span>
            </div>
          </div>

          {/* Table of contents */}
          <div className="px-5 py-4">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.13em] mb-3">
              Documents inclus
            </p>
            <div>
              {docs.map(({ label }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-2.5 h-2.5 text-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-[11px] text-slate-700">{label}</span>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Footer strip */}
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
              <span className="text-[10px] text-slate-500 font-medium">Style Moderne</span>
            </div>
            <span className="text-[9px] text-slate-300 font-medium tracking-wide">
              PDF · 6 pages
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
