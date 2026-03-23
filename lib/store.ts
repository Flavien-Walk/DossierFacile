import type { DossierStyle, UserFormData } from './types';

const STORAGE_KEY = 'dossierfacile_session';

interface StoredSession {
  sessionToken: string;
  formData: UserFormData;
  style: DossierStyle;
}

export function saveSession(data: StoredSession): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage may be unavailable
  }
}

export function loadSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
