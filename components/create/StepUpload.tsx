'use client';

import { useRef, useState } from 'react';
import type { DossierFiles } from '@/lib/types';

interface StepUploadProps {
  files: DossierFiles;
  onChange: (files: DossierFiles) => void;
  onNext: () => void;
  onBack: () => void;
}

interface UploadZoneProps {
  label: string;
  description: string;
  required?: boolean;
  multiple?: boolean;
  value: File | File[] | null;
  onChange: (file: File | File[] | null) => void;
}

function UploadZone({ label, description, required, multiple, value, onChange }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const files = value
    ? Array.isArray(value)
      ? value
      : [value]
    : [];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length === 0) return;
    if (multiple) {
      onChange([...files, ...dropped]);
    } else {
      onChange(dropped[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    if (multiple) {
      onChange([...files, ...selected]);
    } else {
      onChange(selected[0]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    if (multiple) {
      const updated = [...files];
      updated.splice(index, 1);
      onChange(updated.length ? updated : null);
    } else {
      onChange(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {!required && <span className="text-xs text-gray-400">Optionnel</span>}
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-primary-400 bg-primary-50'
            : files.length
            ? 'border-green-300 bg-green-50'
            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <div className="py-2">
            <svg className="w-6 h-6 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-xs text-gray-500">{description}</p>
            <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG — 5 Mo max</p>
          </div>
        ) : (
          <div className="py-1 space-y-1" onClick={(e) => e.stopPropagation()}>
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-1.5 text-left">
                <div className="flex items-center gap-2 min-w-0">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-700 truncate">{f.name}</span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => inputRef.current?.click()}
              className="text-xs text-primary-600 hover:text-primary-700 mt-1"
            >
              + Ajouter un fichier
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default function StepUpload({ files, onChange, onNext, onBack }: StepUploadProps) {
  const isValid = !!files.identity;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Vos documents</h2>
        <p className="text-sm text-gray-500">
          Vos documents ne sont jamais stockés. Traitement en mémoire uniquement, suppression automatique après génération.
        </p>
      </div>

      <UploadZone
        label="Pièce d'identité"
        description="Déposez votre CNI ou passeport (recto/verso)"
        required
        value={files.identity}
        onChange={(f) => onChange({ ...files, identity: f as File | null })}
      />

      <UploadZone
        label="Contrat de travail"
        description="CDI, CDD ou promesse d'embauche"
        value={files.contract}
        onChange={(f) => onChange({ ...files, contract: f as File | null })}
      />

      <UploadZone
        label="Fiches de paie"
        description="Les 3 dernières fiches de paie recommandées"
        multiple
        value={files.payslips}
        onChange={(f) => onChange({ ...files, payslips: (f as File[] | null) || [] })}
      />

      <UploadZone
        label="Garant"
        description="Documents du garant si applicable"
        multiple
        value={files.guarantor}
        onChange={(f) => onChange({ ...files, guarantor: (f as File | null) })}
      />

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700">
        Vos documents ne sont jamais stockés sur nos serveurs. Traitement exclusivement en mémoire vive, suppression immédiate après génération.
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
          disabled={!isValid}
          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
