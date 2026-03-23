'use client';

import { useState } from 'react';
import type { DossierStyle, DossierFiles, UserFormData } from '@/lib/types';
import { generatePreview, createCheckoutSession } from '@/lib/api';
import { saveSession } from '@/lib/store';

interface StepPreviewProps {
  formData: UserFormData;
  files: DossierFiles;
  style: DossierStyle;
  onStyleChange: (style: DossierStyle) => void;
  onBack: () => void;
}

const STYLE_LABELS: Record<DossierStyle, string> = {
  classic: 'Classique',
  modern: 'Moderne',
  premium: 'Premium',
};

export default function StepPreview({ formData, files, style, onStyleChange, onBack }: StepPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (selectedStyle: DossierStyle = style) => {
    setLoading(true);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    try {
      const result = await generatePreview(formData, files, selectedStyle);
      setSessionToken(result.sessionToken);
      const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setPreviewUrl(URL.createObjectURL(blob));
      saveSession({ sessionToken: result.sessionToken, formData, style: selectedStyle });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleStyleChange = async (newStyle: DossierStyle) => {
    onStyleChange(newStyle);
    if (previewUrl) await handleGenerate(newStyle);
  };

  const handlePay = async () => {
    if (!sessionToken) return;
    setPayLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession(formData.email, sessionToken);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du paiement.');
      setPayLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-1">
        <h2 className="text-xl font-bold text-slate-900 mb-1.5 tracking-tight">Aperçu de votre dossier</h2>
        <p className="text-sm text-slate-500">
          Prévisualisez avant de payer. Changez de style à tout moment sans frais.
        </p>
      </div>

      {/* Style switcher — pill tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        {(['classic', 'modern', 'premium'] as DossierStyle[]).map((s) => (
          <button
            key={s}
            onClick={() => handleStyleChange(s)}
            disabled={loading}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              style === s
                ? 'bg-white text-primary-600 shadow-card'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {STYLE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Preview area — empty state */}
      {!previewUrl && !loading && (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center bg-white">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">Votre dossier est prêt à être généré</p>
          <p className="text-xs text-slate-400 mb-5">L'aperçu est entièrement gratuit</p>
          <button
            onClick={() => handleGenerate()}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-btn hover:shadow-btn-hover hover:-translate-y-px"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Générer l'aperçu gratuit
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="border border-slate-200 rounded-2xl p-10 text-center bg-slate-50">
          <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-600">Génération en cours...</p>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Traitement en mémoire · Aucun stockage
          </p>
        </div>
      )}

      {/* PDF viewer */}
      {previewUrl && !loading && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-card-md">
          {/* Viewer toolbar */}
          <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Aperçu — filigrane sur la version gratuite
              </span>
            </div>
            <button
              onClick={() => handleGenerate()}
              className="text-xs text-slate-400 hover:text-white font-medium transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
          <iframe
            src={previewUrl}
            className="w-full h-[440px] bg-slate-100"
            title="Aperçu du dossier"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Trust reminder */}
      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5">
        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-xs text-slate-500 leading-relaxed">
          Vos documents ne sont jamais stockés. L'aperçu est généré en mémoire et supprimé immédiatement.
        </p>
      </div>

      {/* CTA block */}
      <div className="bg-slate-900 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-semibold text-white mb-1">Télécharger le PDF final</p>
            <p className="text-xs text-slate-400">Sans filigrane · Téléchargement immédiat</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-2xl font-bold text-white">5 €</span>
            <p className="text-xs text-slate-500">unique</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 font-medium py-3 px-5 rounded-xl transition-colors text-sm"
          >
            Retour
          </button>
          <button
            onClick={handlePay}
            disabled={!sessionToken || payLoading || loading}
            className="flex-1 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-btn hover:shadow-btn-hover hover:-translate-y-px disabled:shadow-none disabled:translate-y-0"
          >
            {payLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Redirection vers Stripe...
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
        </div>

        {sessionToken && (
          <p className="text-center text-xs text-slate-600 mt-3 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Paiement sécurisé par Stripe
          </p>
        )}
      </div>
    </div>
  );
}
