'use client';

import { useRef, useState } from 'react';
import type { DossierFiles, Situation } from '@/lib/types';

interface StepUploadProps {
  files: DossierFiles;
  onChange: (files: DossierFiles) => void;
  onNext: () => void;
  onBack: () => void;
  situation: Situation;
  hasGuarantor: boolean;
}

interface UploadZoneProps {
  label: string;
  description: string;
  helper?: string;
  badge?: string;        // custom badge (defaults to "Optionnel" when not required)
  required?: boolean;
  multiple?: boolean;
  value: File | File[] | null;
  onChange: (file: File | File[] | null) => void;
}

function UploadZone({
  label, description, helper, badge, required, multiple, value, onChange,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const files = value ? (Array.isArray(value) ? value : [value]) : [];
  const hasFiles = files.length > 0;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (!dropped.length) return;
    onChange(multiple ? [...files, ...dropped] : dropped[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    onChange(multiple ? [...files, ...selected] : selected[0]);
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

  const badgeText = required ? null : (badge ?? 'Optionnel');

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {badgeText && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            badgeText === 'Recommandé' || badgeText === 'Souvent demandé'
              ? 'text-primary-600 bg-primary-50 border border-primary-100'
              : 'text-slate-400 bg-slate-100'
          }`}>
            {badgeText}
          </span>
        )}
      </div>

      <div
        className={`border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          dragging
            ? 'border-primary-400 bg-primary-50/60 scale-[1.01]'
            : hasFiles
            ? 'border-emerald-300 bg-emerald-50/40'
            : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50/60 bg-white'
        }`}
        onClick={() => !hasFiles && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {!hasFiles ? (
          <div className="px-4 py-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">{description}</p>
            <p className="text-xs text-slate-400">PDF, JPG, PNG · 10 Mo max · Cliquez ou glissez</p>
          </div>
        ) : (
          <div className="p-3 space-y-1.5" onClick={(e) => e.stopPropagation()}>
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-slate-200/80 shadow-card"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-700 font-medium truncate">{f.name}</span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="w-6 h-6 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center ml-2 flex-shrink-0 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {multiple && (
              <button
                onClick={() => inputRef.current?.click()}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium px-3 py-1.5 w-full text-center hover:bg-primary-50 rounded-lg transition-colors"
              >
                + Ajouter un fichier
              </button>
            )}
          </div>
        )}
      </div>

      {helper && (
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{helper}</p>
      )}

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

// ── Zone config by situation ──────────────────────────────────────────────

interface ZoneConfig {
  label: string;
  description: string;
  helper: string;
  badge?: string;
}

function getContractConfig(situation: Situation): ZoneConfig {
  switch (situation) {
    case 'cdi':
      return {
        label: 'Contrat de travail CDI',
        description: 'Contrat signé ou attestation employeur',
        helper: 'Votre contrat CDI atteste la stabilité de votre emploi. Une attestation datée et signée de votre employeur est également acceptée.',
        badge: 'Recommandé',
      };
    case 'cdd':
      return {
        label: 'Contrat de travail CDD',
        description: 'Contrat signé en cours de validité',
        helper: "Joignez votre contrat CDD en cours. Si le contrat est récent, une promesse d'embauche est acceptée.",
        badge: 'Recommandé',
      };
    case 'alternant':
      return {
        label: "Contrat d'alternance",
        description: "Contrat d'alternance ou d'apprentissage signé",
        helper: "Le contrat signé par les deux parties suffit. Joignez aussi l'attestation de l'organisme de formation si disponible.",
        badge: 'Recommandé',
      };
    case 'etudiant':
      return {
        label: 'Justificatif de scolarité',
        description: 'Carte étudiante ou certificat de scolarité',
        helper: "Certificat de scolarité en cours de validité, carte étudiante ou attestation d'inscription. Document de l'année universitaire en cours.",
        badge: 'Recommandé',
      };
    default:
      return {
        label: 'Contrat de travail',
        description: 'Tout contrat ou document attestant votre situation',
        helper: 'Joignez tout document officiel qui atteste de votre situation professionnelle actuelle.',
      };
  }
}

function getPayslipsConfig(situation: Situation): ZoneConfig {
  switch (situation) {
    case 'retraite':
      return {
        label: 'Bulletins de pension',
        description: 'Dernier(s) bulletin(s) de pension de retraite',
        helper: 'Un à deux bulletins récents suffisent généralement. Ils attestent du niveau et de la régularité de votre pension.',
        badge: 'Recommandé',
      };
    case 'alternant':
      return {
        label: 'Bulletins de salaire',
        description: "Bulletins de salaire ou attestation de l'organisme",
        helper: "Les bulletins disponibles suffisent. Une attestation de l'OPCO ou de l'organisme de formation est également acceptée.",
        badge: 'Recommandé',
      };
    default:
      return {
        label: 'Bulletins de salaire',
        description: '3 derniers bulletins de salaire',
        helper: "Les 3 derniers bulletins permettent d'établir la régularité et le niveau de vos revenus. C'est la pièce la plus demandée par les propriétaires.",
        badge: 'Recommandé',
      };
  }
}

// ── Main component ────────────────────────────────────────────────────────

export default function StepUpload({
  files, onChange, onNext, onBack, situation, hasGuarantor,
}: StepUploadProps) {
  const isValid = !!files.identity;

  const showContract  = ['cdi', 'cdd', 'alternant', 'etudiant', 'autre'].includes(situation);
  const showPayslips  = ['cdi', 'cdd', 'alternant', 'retraite', 'autre'].includes(situation);
  const showTaxNotice = ['cdi', 'cdd', 'alternant', 'retraite', 'autre'].includes(situation);
  const showBusiness  = situation === 'freelance';

  const contractConfig = showContract ? getContractConfig(situation) : null;
  const payslipsConfig = showPayslips ? getPayslipsConfig(situation) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-1">
        <h2 className="text-xl font-bold text-slate-900 mb-1.5 tracking-tight">Vos documents</h2>
        <p className="text-sm text-slate-500">
          Seules les pièces pertinentes pour votre profil vous sont demandées. Traitement en mémoire uniquement.
        </p>
      </div>

      {/* ── Section : Identité & domicile ── */}
      <UploadZone
        label="Pièce d'identité"
        description="CNI recto-verso ou passeport"
        helper="Carte nationale d'identité (recto-verso obligatoire) ou passeport en cours de validité. Document systématiquement exigé."
        required
        value={files.identity}
        onChange={(f) => onChange({ ...files, identity: f as File | null })}
      />

      <UploadZone
        label="Justificatif de domicile"
        description="Quittance de loyer, facture ou attestation"
        helper="Quittance de loyer récente, facture d'énergie ou d'eau, ou attestation d'hébergement. Souvent demandé par les propriétaires pour vérifier votre adresse actuelle."
        badge="Recommandé"
        value={files.domicile}
        onChange={(f) => onChange({ ...files, domicile: f as File | null })}
      />

      {/* ── Section : Documents liés à la situation ── */}
      {showContract && contractConfig && (
        <UploadZone
          label={contractConfig.label}
          description={contractConfig.description}
          helper={contractConfig.helper}
          badge={contractConfig.badge}
          value={files.contract}
          onChange={(f) => onChange({ ...files, contract: f as File | null })}
        />
      )}

      {showPayslips && payslipsConfig && (
        <UploadZone
          label={payslipsConfig.label}
          description={payslipsConfig.description}
          helper={payslipsConfig.helper}
          badge={payslipsConfig.badge}
          multiple
          value={files.payslips}
          onChange={(f) => onChange({ ...files, payslips: (f as File[] | null) || [] })}
        />
      )}

      {showTaxNotice && (
        <UploadZone
          label="Avis d'imposition"
          description="Avis d'imposition N-1"
          helper="Le dernier avis d'imposition est très souvent demandé. Il confirme officiellement vos revenus déclarés auprès des impôts."
          badge="Souvent demandé"
          value={files.taxNotice}
          onChange={(f) => onChange({ ...files, taxNotice: f as File | null })}
        />
      )}

      {showBusiness && (
        <UploadZone
          label="Documents d'activité"
          description="Kbis, bilans, liasses fiscales, avis d'imposition"
          helper="Joignez au minimum : Kbis ou extrait INSEE + les 2 derniers avis d'imposition. Les bilans comptables ou liasses fiscales sont un plus. Couvrez au moins 2 exercices."
          badge="Recommandé"
          multiple
          value={files.businessDocs}
          onChange={(f) => onChange({ ...files, businessDocs: (f as File[] | null) || [] })}
        />
      )}

      {/* ── Section : Garant ── */}
      {hasGuarantor && (
        <>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">
              Documents du garant
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="flex items-start gap-3 bg-primary-50/60 border border-primary-100 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-slate-600 leading-relaxed">
              Le garant s'engage solidairement en cas de défaut de paiement. Les propriétaires demandent généralement les mêmes pièces que pour le locataire principal : identité, justificatif de revenus et de domicile.
            </p>
          </div>

          <UploadZone
            label="Pièces du garant"
            description="Identité, revenus et justificatif de domicile du garant"
            helper="Joignez dans cet espace tous les documents de votre garant : CNI ou passeport, bulletins de salaire ou avis d'imposition, et justificatif de domicile."
            badge="Recommandé"
            multiple
            value={files.guarantorFiles}
            onChange={(f) => onChange({ ...files, guarantorFiles: (f as File[] | null) || [] })}
          />
        </>
      )}

      {/* Trust notice */}
      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5">
        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-600">Vos documents ne sont jamais stockés.</span>{' '}
          Traitement exclusivement en mémoire vive, suppression immédiate après génération du PDF.
        </p>
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
          disabled={!isValid}
          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-btn hover:shadow-btn-hover hover:-translate-y-px disabled:shadow-none disabled:translate-y-0"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
