export type DossierStyle = 'classic' | 'modern' | 'premium';

export type Situation =
  | 'cdi'
  | 'cdd'
  | 'alternant'
  | 'etudiant'
  | 'freelance'
  | 'retraite'
  | 'autre';

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  situation: Situation;
  revenue: string;
  hasGuarantor: boolean;
}

export interface DossierFiles {
  identity: File | null;        // obligatoire — tous profils
  domicile: File | null;        // recommandé — tous profils
  contract: File | null;        // CDI, CDD, alternant, étudiant
  payslips: File[];             // CDI, CDD, alternant, retraité
  taxNotice: File | null;       // recommandé — CDI, CDD, alternant, retraité
  businessDocs: File[];         // freelance : Kbis, bilans, liasses fiscales
  guarantorFiles: File[];       // si hasGuarantor
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
  cdi:       'Salarié(e) CDI',
  cdd:       'Salarié(e) CDD',
  alternant: 'Alternant(e) / Apprenti(e)',
  etudiant:  'Étudiant(e)',
  freelance: 'Freelance / Indépendant(e)',
  retraite:  'Retraité(e)',
  autre:     'Autre situation',
};
