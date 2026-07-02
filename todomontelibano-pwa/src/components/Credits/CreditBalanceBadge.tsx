import React from 'react';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ROUTES_CREDITS } from '../../config/credits';

interface CreditBalanceBadgeProps {
  className?: string;
  showLabel?: boolean;
}

const CreditBalanceBadge: React.FC<CreditBalanceBadgeProps> = ({
  className = '',
  showLabel = true,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return null;

  const credits = user?.credits ?? 0;

  return (
    <Link
      to={ROUTES_CREDITS.packages}
      className={`inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-3xl hover:bg-amber-100 dark:hover:bg-amber-950/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${className}`}
      title="Ver paquetes de créditos"
    >
      <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden />
      {showLabel ? (
        <span>
          Saldo: <strong>{credits}</strong> créditos
        </span>
      ) : (
        <strong>{credits}</strong>
      )}
    </Link>
  );
};

export default CreditBalanceBadge;
