'use client';

import { useState } from 'react';
import Link from 'next/link';
import StepIndicator from '@/components/create/StepIndicator';
import StepForm from '@/components/create/StepForm';
import StepUpload from '@/components/create/StepUpload';
import StepStyle from '@/components/create/StepStyle';
import StepPreview from '@/components/create/StepPreview';
import { generatePreview } from '@/lib/api';
import { saveSession } from '@/lib/store';
import type { UserFormData, DossierFiles, DossierStyle } from '@/lib/types';

const defaultFormData: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  situation: '' as never,
  revenue: '',
};

const defaultFiles: DossierFiles = {
  identity: null,
  contract: null,
  payslips: [],
  guarantor: null,
};

export default function CreatePage() {
  const [step, setStep]       = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<UserFormData>(defaultFormData);
  const [files, setFiles]     = useState<DossierFiles>(defaultFiles);
  const [style, setStyle]     = useState<DossierStyle>('modern');

  // Preview state — lifted here so generation starts at step 3
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [generating, setGenerating]     = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, 4) as 1 | 2 | 3 | 4);
  const back = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);

  // Triggered from step 3 "Générer l'aperçu" AND from style changes in step 4
  const handleGenerate = async (targetStyle: DossierStyle) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSessionToken(null);
    setGenerating(true);
    setPreviewError(null);
    try {
      const result = await generatePreview(formData, files, targetStyle);
      setSessionToken(result.sessionToken);
      const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
      const blob  = new Blob([bytes], { type: 'application/pdf' });
      setPreviewUrl(URL.createObjectURL(blob));
      saveSession({ sessionToken: result.sessionToken, formData, style: targetStyle });
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Nav */}
      <nav className="bg-white border-b border-slate-200/70 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-2 h-2 rounded-full bg-primary-500 ring-4 ring-primary-100" />
            <span className="font-semibold text-slate-900 tracking-tight text-sm group-hover:text-primary-600 transition-colors">
              DossierFacile
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Documents non stockés
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-8 px-1">
          <StepIndicator current={step} />
        </div>

        <div className="bg-white rounded-2xl shadow-card-md border border-slate-200/60 p-6 sm:p-8">
          {step === 1 && (
            <StepForm data={formData} onChange={setFormData} onNext={next} />
          )}
          {step === 2 && (
            <StepUpload files={files} onChange={setFiles} onNext={next} onBack={back} />
          )}
          {step === 3 && (
            <StepStyle
              style={style}
              onChange={setStyle}
              onNext={() => { handleGenerate(style); next(); }}
              onBack={back}
            />
          )}
          {step === 4 && (
            <StepPreview
              formData={formData}
              files={files}
              style={style}
              onStyleChange={(s) => { setStyle(s); handleGenerate(s); }}
              onBack={back}
              previewUrl={previewUrl}
              sessionToken={sessionToken}
              generating={generating}
              previewError={previewError}
            />
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Sans compte · Sans inscription · Documents non stockés · Suppression automatique
        </div>
      </div>
    </div>
  );
}
