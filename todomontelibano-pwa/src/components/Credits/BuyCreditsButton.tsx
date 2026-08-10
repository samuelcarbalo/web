import React from 'react';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { ROUTES_CREDITS } from '../../config/credits';

interface BuyCreditsButtonProps {
  className?: string;
  label?: string;
  compact?: boolean;
}

/** CTA permanente hacia la pantalla de planes/créditos. */
const BuyCreditsButton: React.FC<BuyCreditsButtonProps> = ({
  className = '',
  label = 'Comprar créditos',
  compact = false,
}) => {
  return (
    <Link
      to={ROUTES_CREDITS.packages}
      className={
        className ||
        (compact
          ? 'inline-flex items-center gap-1.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 px-3 py-1.5 rounded-3xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
          : 'inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-4 py-2 rounded-3xl shadow-md hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500')
      }
      title="Ver planes y comprar créditos"
    >
      <Coins className="w-4 h-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </Link>
  );
};

export default BuyCreditsButton;
