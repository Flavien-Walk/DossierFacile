'use client';

import type { UserFormData, Situation } from '@/lib/types';
import { SITUATION_LABELS } from '@/lib/types';

interface StepFormProps {
  data: UserFormData;
  onChange: (data: UserFormData) => void;
  onNext: () => void;
}

const inputClass =
  'w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all';

const labelClass = 'block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2';

const REVENUE_CONFIG: Record<Situation | '', { label: string; placeholder: string }> = {
  '':        { label: 'Revenus mensuels nets',             placeholder: '2 500' },
  cdi:       { label: 'Revenus mensuels nets',             placeholder: '2 500' },
  cdd:       { label: 'Revenus mensuels nets',             placeholder: '2 200' },
  alternant: { label: 'Revenus mensuels nets',             placeholder: '1 200' },
  etudiant:  { label: 'Revenus mensuels (jobs, bourses…)', placeholder: '0' },
  freelance: { label: 'Revenus mensuels moyens nets',      placeholder: '3 500' },
  retraite:  { label: 'Pension mensuelle nette',           placeholder: '1 800' },
  autre:     { label: 'Revenus mensuels nets',             placeholder: '2 000' },
};

const SITUATION_HINTS: Partial<Record<Situation, string>> = {
  etudiant:
    "Les pièces demandées à l'étape suivante seront adaptées à votre profil. Un garant est souvent attendu.",
  freelance:
    "Des documents d'activité (Kbis, bilans ou liasses fiscales) vous seront demandés à l'étape suivante.",
  alternant:
    "Votre contrat d'alternance ou d'apprentissage sera intégré dans le dossier.",
};

export default function StepForm({ data, onChange, onNext }: StepFormProps) {
  const update = (field: keyof UserFormData, value: string | boolean) =>
    onChange({ ...data, [field]: value });

  const sit = data.situation as Situation | '';
  const revConfig = REVENUE_CONFIG[sit] ?? REVENUE_CONFIG[''];

  const isValid =
    !!data.firstName.trim() &&
    !!data.lastName.trim() &&
    !!data.email.trim() &&
    !!data.phone.trim() &&
    !!data.situation &&
    (data.situation === 'etudiant' || !!data.revenue.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="pb-1">
        <h2 className="text-xl font-bold text-slate-900 mb-1.5 tracking-tight">Vos informations</h2>
        <p className="text-sm text-slate-500">
          Ces informations apparaîtront sur la page de présentation de votre dossier.
        </p>
      </div>

      {/* Prénom / Nom */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Prénom</label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            placeholder="Jean"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Nom</label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            placeholder="Dupont"
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="jean.dupont@email.com"
          required
          className={inputClass}
        />
      </div>

      {/* Téléphone */}
      <div>
        <label className={labelClass}>Téléphone</label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="06 12 34 56 78"
          required
          className={inputClass}
        />
      </div>

      {/* Situation */}
      <div>
        <label className={labelClass}>Situation professionnelle</label>
        <select
          value={data.situation}
          onChange={(e) => update('situation', e.target.value as Situation)}
          required
          className={`${inputClass} appearance-none cursor-pointer`}
        >
          <option value="">Sélectionner votre situation…</option>
          {(Object.keys(SITUATION_LABELS) as Situation[]).map((key) => (
            <option key={key} value={key}>
              {SITUATION_LABELS[key]}
            </option>
          ))}
        </select>
        {data.situation && SITUATION_HINTS[data.situation as Situation] && (
          <p className="mt-1.5 text-xs text-primary-600 leading-relaxed">
            {SITUATION_HINTS[data.situation as Situation]}
          </p>
        )}
      </div>

      {/* Revenus */}
      <div>
        <label className={labelClass}>{revConfig.label}</label>
        <div className="relative">
          <input
            type="number"
            value={data.revenue}
            onChange={(e) => update('revenue', e.target.value)}
            placeholder={revConfig.placeholder}
            min="0"
            className={`${inputClass} pr-10`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
            €
          </span>
        </div>
        {data.situation === 'etudiant' && (
          <p className="mt-1.5 text-xs text-slate-400">
            Indiquez 0 si vous n'avez pas de revenus. Ce champ est optionnel pour les étudiants.
          </p>
        )}
      </div>

      {/* Garant toggle */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Avez-vous un garant ?</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {data.situation === 'etudiant'
                ? 'Souvent exigé pour les étudiants. Ses documents seront intégrés dans une section dédiée.'
                : "Optionnel — peut renforcer votre dossier si votre taux d'effort est élevé."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => update('hasGuarantor', !data.hasGuarantor)}
            aria-pressed={data.hasGuarantor}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              data.hasGuarantor ? 'bg-primary-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                data.hasGuarantor ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* CTA */}
      <button
        type="submit"
        disabled={!isValid}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-btn hover:shadow-btn-hover hover:-translate-y-px disabled:shadow-none disabled:translate-y-0"
      >
        Continuer
      </button>
    </form>
  );
}
