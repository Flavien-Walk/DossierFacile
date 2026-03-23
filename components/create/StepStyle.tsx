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
  description: string;
  preview: React.ReactNode;
}[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Sobre et intemporel. Noir et blanc, typographie sérieuse.',
    preview: (
      <div className="w-full h-32 bg-white border border-gray-200 rounded-lg overflow-hidden relative">
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3">
          <div className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">Dossier Locataire</div>
        </div>
        <div className="p-3">
          <div className="h-2 w-20 bg-gray-800 rounded mb-1.5"></div>
          <div className="h-px w-16 bg-gray-300 mb-2"></div>
          <div className="h-1.5 w-12 bg-gray-200 rounded mb-1"></div>
          <div className="h-1.5 w-16 bg-gray-300 rounded mb-1"></div>
          <div className="h-1.5 w-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
  },
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Design épuré avec une touche de couleur bleue. Dynamique et professionnel.',
    preview: (
      <div className="w-full h-32 bg-white border border-gray-200 rounded-lg overflow-hidden relative">
        <div className="h-14 bg-blue-500 flex items-end px-3 pb-2">
          <div>
            <div className="text-[7px] text-blue-200 uppercase tracking-widest mb-0.5">Dossier Locataire</div>
            <div className="h-2 w-16 bg-white/80 rounded"></div>
          </div>
        </div>
        <div className="p-3">
          <div className="h-1.5 w-12 bg-gray-200 rounded mb-1"></div>
          <div className="h-1.5 w-16 bg-blue-200 rounded mb-1"></div>
          <div className="h-1.5 w-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Mise en page travaillée avec une colonne latérale. Impression haut de gamme.',
    preview: (
      <div className="w-full h-32 bg-white border border-gray-200 rounded-lg overflow-hidden flex">
        <div className="w-10 bg-slate-800 flex flex-col items-center pt-3">
          <div className="h-1.5 w-5 bg-white/20 rounded mb-1"></div>
          <div className="h-1.5 w-4 bg-white/20 rounded"></div>
        </div>
        <div className="flex-1 p-3">
          <div className="h-2 w-14 bg-slate-700 rounded mb-2"></div>
          <div className="h-px w-12 bg-slate-200 mb-2"></div>
          <div className="h-1.5 w-10 bg-gray-200 rounded mb-1"></div>
          <div className="h-1.5 w-14 bg-gray-300 rounded mb-1"></div>
          <div className="h-1.5 w-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
  },
];

export default function StepStyle({ style, onChange, onNext, onBack }: StepStyleProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Choisissez un style</h2>
        <p className="text-sm text-gray-500">
          Vous pourrez modifier le style sur la page de prévisualisation. Prévisualisez avant de payer.
        </p>
      </div>

      <div className="space-y-3">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`w-full border-2 rounded-xl p-4 text-left transition-all ${
              style === s.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-24">
                {s.preview}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{s.name}</span>
                  {style === s.id && (
                    <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                      Sélectionné
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors text-sm"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Générer l'aperçu
        </button>
      </div>
    </div>
  );
}
