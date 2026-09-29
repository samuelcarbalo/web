import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import {
  PRIVACY_SECTIONS,
  TERMS_SECTIONS,
  TERMS_UPDATED_LABEL,
  type LegalSection,
} from '../../content/legal';
import { ROUTES } from '../../config/seo';

export type LegalDocument = 'terms' | 'privacy';

interface TermsModalProps {
  open: boolean;
  document: LegalDocument;
  onClose: () => void;
}

const copy: Record<LegalDocument, { title: string; sections: LegalSection[]; href: string }> = {
  terms: {
    title: 'Términos y Condiciones',
    sections: TERMS_SECTIONS,
    href: ROUTES.terms,
  },
  privacy: {
    title: 'Política de Privacidad',
    sections: PRIVACY_SECTIONS,
    href: ROUTES.privacy,
  },
};

export const TermsModal: React.FC<TermsModalProps> = ({ open, document, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const current = copy[document];

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/50" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 id="legal-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
              {current.title}
            </h2>
            <p className="text-xs text-gray-500 mt-1">Actualizado el {TERMS_UPDATED_LABEL}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {current.sections.map((section) => (
            <section key={section.title}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{section.title}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mb-2">{paragraph}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc pl-5 space-y-1">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs">
          <Link to={current.href} className="font-semibold text-violet-600 hover:underline" onClick={onClose}>
            Ver página completa
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
