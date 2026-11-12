import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface BackToTournamentLinkProps {
  tournamentSlug?: string | null;
  /** Texto visible. Si no se envía, muestra «Volver al torneo». */
  label?: string;
  tone?: 'default' | 'onDark';
  className?: string;
}

/** Enlace directo al detalle del torneo. No usa el historial del navegador. */
const BackToTournamentLink: React.FC<BackToTournamentLinkProps> = ({
  tournamentSlug,
  label,
  tone = 'default',
  className = '',
}) => {
  if (!tournamentSlug) return null;

  const text = label?.trim() || 'Volver al torneo';
  const toneClass =
    tone === 'onDark'
      ? 'text-white/90 hover:text-white'
      : 'text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400';

  return (
    <Link
      to={`/deportes/torneos/${tournamentSlug}`}
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${toneClass} ${className}`}
    >
      <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
      <span className="truncate">{text}</span>
    </Link>
  );
};

export default BackToTournamentLink;
