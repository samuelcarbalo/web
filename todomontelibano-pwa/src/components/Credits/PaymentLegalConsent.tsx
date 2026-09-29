import React from 'react';
import LegalConsent from '../Legal/LegalConsent';

export const PAYMENT_DISCLAIMER =
  'Al realizar el pago, aceptas los Términos y Condiciones de Chéver y las políticas de procesamiento de Mercado Pago.';

interface PaymentLegalConsentProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  id?: string;
}

const PaymentLegalConsent: React.FC<PaymentLegalConsentProps> = (props) => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-3">
    <LegalConsent {...props} variant="payment" />
  </div>
);

export default PaymentLegalConsent;
