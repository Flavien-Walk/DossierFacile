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

export default function StepForm({ data, onChange, onNext }: StepFormProps) {
  const update = (field: keyof UserFormData, value: string) =>
    onChange({ ...data, [field]: value });

  const isValid =
    data.firstName.trim() &&
    data.lastName.trim() &&
    data.email.trim() &&
    data.phone.trim() &&
    data.situation &&
    data.revenue.trim();

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
          <option value="">Sélectionner...</option>
          {(Object.keys(SITUATION_LABELS) as Situation[]).map((key) => (
            <option key={key} value={key}>
              {SITUATION_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {/* Revenus */}
      <div>
        <label className={labelClass}>Revenus mensuels nets</label>
        <div className="relative">
          <input
            type="number"
            value={data.revenue}
            onChange={(e) => update('revenue', e.target.value)}
            placeholder="2 500"
            min="0"
            required
            className={`${inputClass} pr-10`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
            €
          </span>
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
