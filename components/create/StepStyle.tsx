'use client';

import type { DossierStyle } from '@/lib/types';

interface StepStyleProps {
  style: DossierStyle;
  onChange: (style: DossierStyle) => void;
  onNext: () => void;
  onBack: () => void;
}

const STYLES: {
  id: DossierStyle;
  name: string;
  tag: string;
  description: string;
  preview: React.ReactNode;
}[] = [
  {
    id: 'classic',
    name: 'Classique',
    tag: 'Intemporel',
    description: 'Sobre, noir et blanc. Typographie sérieuse, mise en page épurée.',
    preview: (
      <div className="w-full h-36 bg-white rounded-lg overflow-hidden border border-slate-200 shadow-card">
        <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-3 gap-2">
          <div className="text-[7px] font-bold text-slate-600 uppercase tracking-[0.15em]">Dossier Locataire</div>
        </div>
        <div className="p-3.5">
          <div className="h-2.5 w-24 bg-slate-800 rounded-sm mb-1.5"></div>
          <div className="h-px w-16 bg-slate-300 mb-3"></div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-14 bg-slate-200 rounded-sm"></div>
            <div className="h-1.5 w-20 bg-slate-300 rounded-sm"></div>
            <div className="h-1.5 w-11 bg-slate-200 rounded-sm"></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'modern',
    name: 'Moderne',
    tag: 'Recommandé',
    description: 'En-tête bleu, mise en page dynamique. Professionnel et mémorable.',
    preview: (
      <div className="w-full h-36 bg-white rounded-lg overflow-hidden border border-slate-200 shadow-card">
        <div className="h-16 bg-[#4A6CF7] flex flex-col justify-end px-3.5 pb-2.5">
          <div className="text-[6.5px] text-blue-200 uppercase tracking-[0.2em] mb-1 font-medium">Dossier Locataire</div>
          <div className="h-2 w-20 bg-white/80 rounded-sm"></div>
        </div>
        <div className="p-3.5 space-y-1.5">
          <div className="h-1.5 w-14 bg-blue-100 rounded-sm"></div>
          <div className="h-1.5 w-20 bg-slate-200 rounded-sm"></div>
          <div className="h-1.5 w-11 bg-blue-100 rounded-sm"></div>
        </div>
      </div>
    ),
  },
  {
    id: 'premium',
    name: 'Premium',
    tag: 'Haut de gamme',
    description: 'Colonne latérale marine, mise en page travaillée. Impression très soignée.',
    preview: (
      <div className="w-full h-36 bg-white rounded-lg overflow-hidden border border-slate-200 shadow-card flex">
        <div className="w-12 bg-[#1E3A5F] flex flex-col items-center pt-3 gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2E5080] flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">JD</span>
          </div>
          <div className="h-1 w-5 bg-white/20 rounded-full mt-2"></div>
          <div className="h-1 w-4 bg-white/15 rounded-full"></div>
        </div>
        <div className="flex-1 p-3.5">
          <div className="text-[6.5px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Dossier</div>
          <div className="h-2.5 w-20 bg-slate-700 rounded-sm mb-1.5"></div>
          <div className="h-px w-12 bg-slate-200 mb-3"></div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-14 bg-slate-200 rounded-sm"></div>
            <div className="h-1.5 w-11 bg-slate-300 rounded-sm"></div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function StepStyle({ style, onChange, onNext, onBack }: StepStyleProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-1">
        <h2 className="text-xl font-bold text-slate-900 mb-1.5 tracking-tight">Choisissez un style</h2>
        <p className="text-sm text-slate-500">
          Vous pourrez changer le style librement sur la page de prévisualisation.
        </p>
      </div>

      {/* Style cards */}
      <div className="space-y-3">
        {STYLES.map((s) => {
          const isSelected = style === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className={`w-full rounded-2xl p-4 text-left transition-all border-2 ${
                isSelected
                  ? 'border-primary-500 bg-primary-50/50 shadow-card-md'
                  : 'border-slate-200 bg-white hover:border-primary-200 hover:shadow-card shadow-card'
              }`}
            >
              <div className="flex gap-4 items-start">
                {/* Preview thumbnail */}
                <div className="flex-shrink-0 w-28">
                  {s.preview}
                </div>

                {/* Info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-slate-900 text-sm">{s.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : s.tag === 'Recommandé'
                        ? 'bg-primary-50 text-primary-600 border-primary-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {isSelected ? 'Sélectionné' : s.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3 px-5 rounded-xl transition-colors text-sm"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-btn hover:shadow-btn-hover hover:-translate-y-px"
        >
          Générer l'aperçu
        </button>
      </div>
    </div>
  );
}
