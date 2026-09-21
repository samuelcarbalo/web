import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { ROUTES } from '../../config/seo';

export const PAYMENT_DISCLAIMER =
  'Al proceder con el pago, aceptas que la transacción es procesada de forma segura por Mercado Pago. Chéver no almacena los datos de tus tarjetas ni información bancaria confidencial. Las compras de créditos o entradas no son reembolsables una vez procesadas, salvo en los casos previstos por los términos y condiciones de la plataforma.';

interface PaymentLegalConsentProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  id?: string;
}

const PaymentLegalConsent: React.FC<PaymentLegalConsentProps> = ({
  accepted,
  onAcceptedChange,
  id = 'payment-legal-consent',
}) => (
  <div className="space-y-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-3.5 py-3">
    <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
      <Shield className="w-4 h-4 shrink-0 mt-0.5 text-violet-600" aria-hidden="true" />
      <p>{PAYMENT_DISCLAIMER}</p>
    </div>
    <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer">
      <input
        id={id}
        name={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        checked={accepted}
        onChange={(event) => onAcceptedChange(event.target.checked)}
        required
      />
      <span className="text-xs text-gray-700 dark:text-gray-300 leading-snug">
        Al hacer clic en Pagar, aceptas nuestros{' '}
        <Link to={ROUTES.terms} className="font-bold text-violet-600 hover:underline" target="_blank" rel="noreferrer">
          Términos y Condiciones
        </Link>{' '}
        y la{' '}
        <Link to={ROUTES.privacy} className="font-bold text-violet-600 hover:underline" target="_blank" rel="noreferrer">
          Política de Privacidad
        </Link>
        .
      </span>
    </label>
  </div>
);

export default PaymentLegalConsent;
