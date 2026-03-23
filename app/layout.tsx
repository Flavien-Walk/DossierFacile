import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'DossierFacile — Dossier locataire professionnel en 2 minutes',
  description:
    'Créez un dossier locataire professionnel en 2 minutes. Sans création de compte, sans stockage, suppression automatique après génération.',
  keywords: 'dossier locataire, location appartement, dossier PDF, candidature location',
  openGraph: {
    title: 'DossierFacile — Dossier locataire professionnel en 2 minutes',
    description: 'Sans création de compte. Sans stockage. Suppression automatique.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
