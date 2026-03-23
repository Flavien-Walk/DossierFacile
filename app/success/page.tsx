'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { generateFinal } from '@/lib/api';
import { loadSession, clearSession } from '@/lib/store';
import type { UserFormData } from '@/lib/types';
import { SITUATION_LABELS } from '@/lib/types';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError('Session de paiement introuvable.');
      return;
    }

    const session = loadSession();

    if (!session) {
      setStatus('error');
      setError('Session expirée. Veuillez recommencer le processus.');
      return;
    }

    setFormData(session.formData);

    generateFinal(sessionId, session.sessionToken)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setStatus('ready');
        clearSession();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Erreur lors de la génération.');
        setStatus('error');
      });
  }, [sessionId]);

  const handleDownload = () => {
    if (!downloadUrl || !formData) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `DossierLocataire_${formData.lastName}_${formData.firstName}.pdf`;
    a.click();
  };

  const emailTemplate = formData
    ? `Bonjour,\n\nVeuillez trouver ci-joint mon dossier locataire complet.\n\nJe reste à votre disposition pour toute information complémentaire.\n\nCordialement,\n${formData.firstName} ${formData.lastName}`
    : '';

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailTemplate).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Génération de votre dossier final...</p>
          <p className="text-sm text-gray-400 mt-1">Sans stockage, en mémoire uniquement</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Une erreur est survenue</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link href="/create" className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
            Recommencer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="font-semibold text-gray-900 tracking-tight text-sm">
            DossierFacile
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Success card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre dossier est prêt</h1>
          <p className="text-gray-500 text-sm mb-8">
            {formData ? `Dossier de ${formData.firstName} ${formData.lastName} · ${SITUATION_LABELS[formData.situation]} · ${Number(formData.revenue).toLocaleString('fr-FR')} €/mois` : ''}
          </p>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Télécharger mon dossier PDF
          </button>

          <p className="mt-4 text-xs text-gray-400">
            PDF sans filigrane · Vos données ont été supprimées automatiquement
          </p>
        </div>

        {/* Email template */}
        {formData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Email prêt à copier</h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copié
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copier
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed border border-gray-100">
              {emailTemplate}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Retour à l'accueil
          </Link>
          <span className="mx-3">·</span>
          <Link href="/create" className="hover:text-gray-600 transition-colors">
            Créer un nouveau dossier
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
