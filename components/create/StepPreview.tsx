'use client';

import { useState } from 'react';
import type { DossierStyle, DossierFiles, UserFormData } from '@/lib/types';
import { createCheckoutSession } from '@/lib/api';

interface StepPreviewProps {
  formData: UserFormData;
  files: DossierFiles;
  style: DossierStyle;
  onStyleChange: (style: DossierStyle) => void;
  onBack: () => void;
  // Lifted from parent — generation happens at step 3
  previewUrl: string | null;
  sessionToken: string | null;
  generating: boolean;
  previewError: string | null;
}

const STYLES: { id: DossierStyle; label: string; tag: string }[] = [
  { id: 'classic', label: 'Classique', tag: 'Intemporel' },
  { id: 'modern',  label: 'Moderne',  tag: 'Recommandé' },
  { id: 'premium', label: 'Premium',  tag: 'Haut de gamme' },
];

const INCLUDES = [
  'PDF haute qualité, prêt à envoyer',
  'Sommaire cliquable intégré',
  'Sections bien organisées',
  'Sans filigrane',
];

export default function StepPreview({
  formData, files, style, onStyleChange, onBack,
  previewUrl, sessionToken, generating, previewError,
}: StepPreviewProps) {
  const [payLoading, setPayLoading] = useState(false);
  const [payError,   setPayError]   = useState<string | null>(null);

  const handlePay = async () => {
    if (!sessionToken) return;
    setPayLoading(true);
    setPayError(null);
    try {
      const { url } = await createCheckoutSession(formData.email, sessionToken);
      window.location.href = url;
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Erreur lors du paiement.');
      setPayLoading(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="pb-1">
        <h2 className="text-xl font-bold text-slate-900 mb-1.5 tracking-tight">
          Aperçu de votre dossier
        </h2>
        <p className="text-sm text-slate-500">
          Changez de style librement. Le PDF final est sans filigrane.
        </p>
      </div>

      {/* Style tabs */}
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onStyleChange(s.id)}
            disabled={generating}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
              style === s.id
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
            }`}
          >
            {s.label}
            {s.id === 'modern' && style !== s.id && (
              <span className="ml-1.5 text-[9px] font-semibold text-primary-500">★</span>
            )}
          </button>
        ))}
      </div>

      {/* PDF Viewer area */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-card-md">

        {/* Toolbar */}
        <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {generating ? 'Génération en cours…' : 'Aperçu — filigrane sur la version gratuite'}
            </span>
          </div>
          {previewUrl && !generating && (
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Prêt
            </span>
          )}
        </div>

        {/* Loading state */}
        {generating && (
          <div className="w-full h-[520px] bg-slate-50 flex flex-col items-center justify-center gap-5">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full bg-primary-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Génération du dossier…</p>
              <p className="text-xs text-slate-400 mt-1">Traitement en mémoire · Aucun stockage</p>
            </div>
          </div>
        )}

        {/* PDF iframe */}
        {previewUrl && !generating && (
          <iframe
            src={previewUrl}
            className="w-full h-[520px] bg-white"
            title="Aperçu du dossier"
          />
        )}

        {/* Error in viewer */}
        {previewError && !generating && (
          <div className="w-full h-[200px] flex flex-col items-center justify-center gap-3 bg-red-50">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600 font-medium text-center px-6">{previewError}</p>
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-start gap-3 bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3">
        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-xs text-slate-600 leading-relaxed">
          Vos documents ne sont jamais stockés. L'aperçu est généré en mémoire et supprimé automatiquement.
        </p>
      </div>

      {/* Pricing block */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card-md overflow-hidden">

        {/* Price header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-slate-900 text-sm">PDF final sans filigrane</p>
              <p className="text-xs text-slate-500 mt-0.5">Téléchargement immédiat après paiement</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-bold text-slate-900">5</span>
                <span className="text-base font-semibold text-slate-700">€</span>
              </div>
              <p className="text-[10px] text-slate-400">paiement unique</p>
            </div>
          </div>
        </div>

        {/* Includes list */}
        <div className="px-5 py-3.5 space-y-2.5">
          {INCLUDES.map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-slate-600">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA + navigation */}
        <div className="px-4 pb-4 pt-1 space-y-3">

          {payError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {payError}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={!sessionToken || payLoading || generating}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-btn hover:shadow-btn-hover hover:-translate-y-px disabled:shadow-none disabled:translate-y-0"
          >
            {payLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Redirection vers Stripe…
              </>
            ) : generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Génération en cours…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payer et télécharger — 5 €
              </>
            )}
          </button>

          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors py-1"
            >
              ← Retour
            </button>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Paiement sécurisé Stripe
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
