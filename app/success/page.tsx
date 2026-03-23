'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { generateFinal } from '@/lib/api';
import { loadSession, clearSession } from '@/lib/store';
import type { UserFormData } from '@/lib/types';
import { SITUATION_LABELS } from '@/lib/types';

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
        setDownloadUrl(URL.createObjectURL(blob));
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

  const handleCopy = () => {
    navigator.clipboard.writeText(emailTemplate).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ── Loading ─────────────────────────────────────── */
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-slate-700 font-semibold text-lg">Génération de votre dossier final...</p>
          <p className="text-sm text-slate-400 mt-2 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Traitement en mémoire · Aucun stockage
          </p>
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────── */
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Une erreur est survenue</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">{error}</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-btn hover:shadow-btn-hover"
          >
            Recommencer
          </Link>
        </div>
      </div>
    );
  }

  /* ── Success ─────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200/70">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500 ring-4 ring-primary-100"></span>
            <span className="font-semibold text-slate-900 tracking-tight text-sm">DossierFacile</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-12 space-y-5">

        {/* Success card */}
        <div className="bg-white rounded-2xl shadow-card-md border border-slate-200/60 overflow-hidden">
          {/* Top accent band */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-primary-500"></div>

          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-200">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Votre dossier est prêt</h1>

            {formData && (
              <p className="text-slate-500 text-sm mb-8">
                {formData.firstName} {formData.lastName}
                <span className="mx-2 text-slate-300">·</span>
                {SITUATION_LABELS[formData.situation]}
                <span className="mx-2 text-slate-300">·</span>
                {Number(formData.revenue).toLocaleString('fr-FR')} €/mois
              </p>
            )}

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-btn hover:shadow-btn-hover hover:-translate-y-px w-full justify-center mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger mon dossier PDF
            </button>

            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              PDF sans filigrane · Vos données ont été supprimées automatiquement
            </p>
          </div>
        </div>

        {/* Email template */}
        {formData && (
          <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-slate-900 text-sm">Email de candidature</h2>
                <p className="text-xs text-slate-400 mt-0.5">Prêt à copier et coller</p>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all border ${
                  copied
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'text-primary-600 hover:text-primary-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copié
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copier
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed text-[13px]">
              {emailTemplate}
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-4">
          <Link href="/" className="hover:text-slate-600 transition-colors">Retour à l'accueil</Link>
          <span className="text-slate-300">·</span>
          <Link href="/create" className="hover:text-slate-600 transition-colors">Créer un nouveau dossier</Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
