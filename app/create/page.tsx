'use client';

import { useState } from 'react';
import Link from 'next/link';
import StepIndicator from '@/components/create/StepIndicator';
import StepForm from '@/components/create/StepForm';
import StepUpload from '@/components/create/StepUpload';
import StepStyle from '@/components/create/StepStyle';
import StepPreview from '@/components/create/StepPreview';
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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<UserFormData>(defaultFormData);
  const [files, setFiles] = useState<DossierFiles>(defaultFiles);
  const [style, setStyle] = useState<DossierStyle>('modern');

  const next = () => setStep((s) => Math.min(s + 1, 4) as 1 | 2 | 3 | 4);
  const back = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900 tracking-tight text-sm hover:text-primary-600 transition-colors">
            DossierFacile
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Documents non stockés
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator current={step} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {step === 1 && (
            <StepForm
              data={formData}
              onChange={setFormData}
              onNext={next}
            />
          )}
          {step === 2 && (
            <StepUpload
              files={files}
              onChange={setFiles}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 3 && (
            <StepStyle
              style={style}
              onChange={setStyle}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 4 && (
            <StepPreview
              formData={formData}
              files={files}
              style={style}
              onStyleChange={setStyle}
              onBack={back}
            />
          )}
        </div>

        {/* Trust footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Sans création de compte · Aucune inscription · Documents non stockés · Suppression automatique
        </p>
      </div>
    </div>
  );
}
