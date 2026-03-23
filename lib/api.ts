import type { DossierFiles, DossierStyle, UserFormData, PreviewResponse, CheckoutResponse } from './types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function generatePreview(
  formData: UserFormData,
  files: DossierFiles,
  style: DossierStyle
): Promise<PreviewResponse> {
  const form = new FormData();
  form.append('userData', JSON.stringify(formData));
  form.append('style', style);

  if (files.identity)   form.append('identity',   files.identity);
  if (files.domicile)   form.append('domicile',   files.domicile);
  if (files.contract)   form.append('contract',   files.contract);
  if (files.taxNotice)  form.append('taxNotice',  files.taxNotice);

  files.payslips.forEach((f)      => form.append('payslips',       f));
  files.businessDocs.forEach((f)  => form.append('businessDocs',   f));
  files.guarantorFiles.forEach((f) => form.append('guarantorFiles', f));

  const res = await fetch(`${BACKEND_URL}/generate-preview`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(err.error || "Erreur lors de la génération de l'aperçu");
  }

  return res.json();
}

export async function createCheckoutSession(
  email: string,
  sessionToken: string
): Promise<CheckoutResponse> {
  const res = await fetch(`${BACKEND_URL}/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, sessionToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(err.error || 'Erreur lors de la création du paiement');
  }

  return res.json();
}

export async function generateFinal(
  sessionId: string,
  sessionToken: string
): Promise<Blob> {
  const res = await fetch(`${BACKEND_URL}/generate-final`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, sessionToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(err.error || 'Erreur lors de la génération finale');
  }

  return res.blob();
}
