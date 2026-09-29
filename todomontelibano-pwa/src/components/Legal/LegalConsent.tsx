import React, { useState } from 'react';
import TermsModal, { type LegalDocument } from './TermsModal';
import { acceptCurrentTerms } from '../../lib/termsApi';

interface LegalConsentProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  id?: string;
  /** Texto del checkbox. El de pago usa la leyenda de Mercado Pago. */
  variant?: 'account' | 'payment';
}

const LegalConsent: React.FC<LegalConsentProps> = ({
  accepted,
  onAcceptedChange,
  id = 'legal-consent',
  variant = 'account',
}) => {
  const [openDoc, setOpenDoc] = useState<LegalDocument | null>(null);

  const open = (document: LegalDocument) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDoc(document);
  };

  const change = (next: boolean) => {
    onAcceptedChange(next);
    if (next) {
      acceptCurrentTerms().catch(() => undefined);
    }
  };

  return (
    <div className="space-y-2">
      {variant === 'payment' && (
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          Al realizar el pago, aceptas los{' '}
          <button type="button" className="font-bold text-violet-600 hover:underline" onClick={open('terms')}>
            Términos y Condiciones de Chéver
          </button>{' '}
          y las políticas de procesamiento de Mercado Pago.
        </p>
      )}
      <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer">
        <input
          id={id}
          name={id}
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          checked={accepted}
          onChange={(event) => change(event.target.checked)}
          required
        />
        <span className="text-xs text-gray-700 dark:text-gray-300 leading-snug">
          {variant === 'payment' ? (
            'Confirmo que leí y acepto esa condición antes de pagar.'
          ) : (
            <>
              Acepto los{' '}
              <button type="button" className="font-bold text-violet-600 hover:underline" onClick={open('terms')}>
                Términos y Condiciones
              </button>{' '}
              y la{' '}
              <button type="button" className="font-bold text-violet-600 hover:underline" onClick={open('privacy')}>
                Política de Privacidad
              </button>
            </>
          )}
        </span>
      </label>
      <TermsModal open={openDoc !== null} document={openDoc || 'terms'} onClose={() => setOpenDoc(null)} />
    </div>
  );
};

export default LegalConsent;
