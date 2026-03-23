export type DossierStyle = 'classic' | 'modern' | 'premium';

export type Situation = 'cdi' | 'cdd' | 'etudiant' | 'freelance' | 'autre';

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  situation: Situation;
  revenue: string;
}

export interface DossierFiles {
  identity: File | null;
  contract: File | null;
  payslips: File[];
  guarantor: File | null;
}

export interface WizardState {
  step: 1 | 2 | 3 | 4;
  formData: UserFormData;
  files: DossierFiles;
  style: DossierStyle;
  previewUrl: string | null;
  sessionToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface PreviewResponse {
  pdfBase64: string;
  sessionToken: string;
}

export interface CheckoutResponse {
  url: string;
}

export const SITUATION_LABELS: Record<Situation, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  etudiant: 'Étudiant(e)',
  freelance: 'Freelance / Indépendant',
  autre: 'Autre',
};
