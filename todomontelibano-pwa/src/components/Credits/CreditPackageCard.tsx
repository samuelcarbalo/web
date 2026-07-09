import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import type { CreditPackage } from '../../config/credits';
import { formatCop } from '../../config/credits';

interface CreditPackageCardProps {
  pkg: CreditPackage;
  isSelected: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  isProcessing?: boolean;
}

const CreditPackageCard: React.FC<CreditPackageCardProps> = ({
  pkg,
  isSelected,
  isPopular = false,
  onSelect,
  isProcessing = false,
}) => {
  const standardPrice = pkg.standard_price_cop ?? pkg.credits * 1000;
  const hasSavings = pkg.savings_cop > 0;

  return (
    <article
      className={`relative flex flex-col rounded-3xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${
        isSelected
          ? 'border-violet-500 shadow-lg shadow-violet-500/20 bg-white dark:bg-gray-900'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 hover:border-violet-300'
      } ${isPopular ? 'ring-2 ring-violet-400 ring-offset-2 dark:ring-offset-gray-950' : ''}`}
    >
      {pkg.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
            <Sparkles className="w-3 h-3" />
            {pkg.badge}
          </span>
        </div>
      )}

      {hasSavings && (
        <div className="absolute top-4 right-4">
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Súper Ahorro
          </span>
        </div>
      )}

      <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mt-2">{pkg.name}</h3>
      <p className="text-3xl font-black text-violet-600 dark:text-violet-400 mt-2">
        {pkg.credits}
        <span className="text-base font-bold text-gray-500 dark:text-gray-400 ml-1">créditos</span>
      </p>

      <div className="mt-3 space-y-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCop(pkg.price_cop)}</p>
        {hasSavings && (
          <p className="text-sm text-gray-400 line-through">{formatCop(standardPrice)}</p>
        )}
        {hasSavings && (
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Ahorras {formatCop(pkg.savings_cop)}
          </p>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 flex-1">{pkg.description}</p>

      <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          1 crédito = $1.000 COP
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          Empleo o inmueble: 5 créditos
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          Torneo de fútbol: 50 créditos
        </li>
      </ul>

      <button
        type="button"
        onClick={onSelect}
        disabled={isProcessing}
        className={`mt-6 w-full py-3 rounded-2xl font-bold text-sm transition-all ${
          isSelected
            ? 'bg-violet-600 text-white shadow-lg'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-violet-50 dark:hover:bg-violet-950/40'
        } disabled:opacity-60`}
      >
        {isProcessing ? 'Procesando...' : isSelected ? 'Paquete seleccionado' : 'Elegir paquete'}
      </button>
    </article>
  );
};

export default CreditPackageCard;
