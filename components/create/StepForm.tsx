'use client';

import type { UserFormData, Situation } from '@/lib/types';
import { SITUATION_LABELS } from '@/lib/types';

interface StepFormProps {
  data: UserFormData;
  onChange: (data: UserFormData) => void;
  onNext: () => void;
}

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
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Vos informations</h2>
        <p className="text-sm text-gray-500">Ces informations apparaîtront sur la page de présentation de votre dossier.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            placeholder="Jean"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            placeholder="Dupont"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="jean.dupont@email.com"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="06 12 34 56 78"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Situation professionnelle</label>
        <select
          value={data.situation}
          onChange={(e) => update('situation', e.target.value as Situation)}
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
        >
          <option value="">Sélectionner...</option>
          {(Object.keys(SITUATION_LABELS) as Situation[]).map((key) => (
            <option key={key} value={key}>
              {SITUATION_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Revenus mensuels nets (€)</label>
        <div className="relative">
          <input
            type="number"
            value={data.revenue}
            onChange={(e) => update('revenue', e.target.value)}
            placeholder="2 500"
            min="0"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!isValid}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Continuer
        </button>
      </div>
    </form>
  );
}
