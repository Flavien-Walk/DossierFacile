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

      saveSession({
        sessionToken: result.sessionToken,
        formData,
        style: selectedStyle,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleStyleChange = async (newStyle: DossierStyle) => {
    onStyleChange(newStyle);
    if (previewUrl) {
      await handleGenerate(newStyle);
    }
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
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Aperçu de votre dossier</h2>
        <p className="text-sm text-gray-500">
          Prévisualisez avant de payer. Changez de style à tout moment.
        </p>
      </div>

      {/* Style switcher */}
      <div className="flex gap-2">
        {(['classic', 'modern', 'premium'] as DossierStyle[]).map((s) => (
          <button
            key={s}
            onClick={() => handleStyleChange(s)}
            disabled={loading}
            className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
              style === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {STYLE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Preview area */}
      {!previewUrl && !loading && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-gray-500 mb-4">Générez l'aperçu pour voir votre dossier</p>
          <button
            onClick={() => handleGenerate()}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Générer l'aperçu gratuit
          </button>
        </div>
      )}

      {loading && (
        <div className="border border-gray-100 rounded-xl p-10 text-center bg-gray-50">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Génération en cours...</p>
          <p className="text-xs text-gray-400 mt-1">Vos documents ne sont jamais stockés</p>
        </div>
      )}

      {previewUrl && !loading && (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <div className="bg-gray-100 px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">APERÇU — Filigrane visible sur la version gratuite</span>
            <button
              onClick={() => handleGenerate()}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Actualiser
            </button>
          </div>
          <iframe
            src={previewUrl}
            className="w-full h-[420px]"
            title="Aperçu du dossier"
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Trust reminder */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-start gap-3 text-xs text-gray-500">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Vos documents ne sont jamais stockés. L'aperçu est généré en mémoire et supprimé immédiatement.</span>
      </div>

      {/* CTA */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 px-5 rounded-xl transition-colors text-sm"
        >
          Retour
        </button>
        <button
          onClick={handlePay}
          disabled={!sessionToken || payLoading || loading}
          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {payLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Redirection...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Télécharger le PDF — 5 €
            </>
          )}
        </button>
      </div>

      {sessionToken && (
        <p className="text-center text-xs text-gray-400">
          Paiement sécurisé par Stripe · Téléchargement immédiat après paiement
        </p>
      )}
    </div>
  );
}
