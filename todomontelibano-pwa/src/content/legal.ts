import {
  PRIVACY_SECTIONS as privacySections,
  TERMS_SECTIONS as termsSections,
  TERMS_UPDATED_LABEL,
  TERMS_VERSION,
} from './legalContent.mjs';

export interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export { TERMS_UPDATED_LABEL, TERMS_VERSION };

export const TERMS_SECTIONS = termsSections as LegalSection[];
export const PRIVACY_SECTIONS = privacySections as LegalSection[];
