import React from 'react';

type Props = {
  name?: string | null;
  abbreviation?: string | null;
  className?: string;
};

export function teamShortName(name?: string | null, abbreviation?: string | null): string {
  const abbr = (abbreviation || '').trim();
  if (abbr) return abbr.toUpperCase();
  const clean = (name || '').trim();
  return clean ? clean.replace(/\s+/g, '').slice(0, 3).toUpperCase() : '—';
}

/** Abreviatura en móvil (< sm) y nombre completo desde sm. */
const TeamName: React.FC<Props> = ({ name, abbreviation, className = '' }) => {
  const fullName = (name || '').trim() || '—';
  return (
    <span className={className} title={fullName}>
      <span className="inline sm:hidden">{teamShortName(name, abbreviation)}</span>
      <span className="hidden sm:inline">{fullName}</span>
    </span>
  );
};

export default TeamName;
