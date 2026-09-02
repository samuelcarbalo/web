import React from 'react';
import { Sparkles } from 'lucide-react';
import Modal from '../UI/Modal';
import { CREDIT_COSTS, STORE_UNLIMITED_COPY } from '../../config/credits';

interface StoreUnlimitedActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userCredits: number;
  isProcessing?: boolean;
}

const StoreUnlimitedActivationModal: React.FC<StoreUnlimitedActivationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userCredits,
  isProcessing = false,
}) => {
  const activationCost = CREDIT_COSTS.storeUnlimitedActivation;
  const remainingCredits = Math.max(0, userCredits - activationCost);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activar Tienda Ilimitada">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 dark:text-amber-100">
            {STORE_UNLIMITED_COPY.monthEquivalency} Al confirmar, se descontarán{' '}
            <strong>{activationCost} créditos</strong> de tu saldo y se activará{' '}
            <strong>30 días de publicaciones ilimitadas</strong> en la tienda.
          </p>
        </div>

        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li>
            Saldo actual: <strong className="text-gray-900 dark:text-white">{userCredits} créditos</strong>
          </li>
          <li>
            Costo de activación:{' '}
            <strong className="text-gray-900 dark:text-white">{activationCost} créditos</strong>
          </li>
          <li>
            Saldo restante para otros servicios:{' '}
            <strong className="text-gray-900 dark:text-white">{remainingCredits} créditos</strong>
          </li>
        </ul>

        <p className="text-xs text-gray-500 dark:text-gray-400">{STORE_UNLIMITED_COPY.surplusUsage}</p>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-2xl font-bold text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-2xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {isProcessing
              ? 'Activando y publicando…'
              : `Confirmar activación (${activationCost} créditos)`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StoreUnlimitedActivationModal;
