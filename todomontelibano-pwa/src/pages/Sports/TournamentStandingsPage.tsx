import React, { useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTournament, useTournamentStandings, useTournamentStructure } from '../../hooks/useSports';
import { Trophy, Loader2, TrendingUp, TrendingDown, Minus, Shield, ChevronRight } from 'lucide-react';
import TournamentAdSlot from '../../components/Advertising/TournamentAdSlot';
import SponsorshipAvailabilityBanner from '../../components/Advertising/SponsorshipAvailabilityBanner';
import { useSponsorshipAvailability } from '../../hooks/useAdvertising';

import type { TeamStanding } from '../../types/sports';

const PositionChange: React.FC<{ current: number; previous?: number }> = ({ current, previous }) => {
  if (!previous || previous === current) {
    return <Minus className="w-3 h-3 text-gray-400" />;
  }
  if (current < previous) {
    return <TrendingUp className="w-3 h-3 text-green-500" />;
  }
  return <TrendingDown className="w-3 h-3 text-red-500" />;
};

const PositionBadge: React.FC<{ position: number }> = ({ position }) => {
  const styles = {
    1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    2: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700',
    3: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const style = styles[position as keyof typeof styles] || 'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';

  return (
    <div className={`w-8 h-8 rounded-3xl border flex items-center justify-center font-bold text-sm ${style}`}>
      {position}
    </div>
  );
};

const ZoneIndicator: React.FC<{ position: number; totalTeams: number; showZones?: boolean }> = ({ position, totalTeams, showZones = true }) => {
  if (!showZones) return <div className="w-1" />;
  // Ejemplo de zonas típicas (ajusta según tu lógica de torneo)
  let color = 'bg-transparent';
  let label = '';
  
  if (position <= 4) {
    color = 'bg-violet-50 dark:bg-violet-950/300';
    label = 'Libertadores';
  } else if (position <= 6) {
    color = 'bg-orange-500';
    label = 'Sudamericana';
  } else if (position > totalTeams - 3) {
    color = 'bg-red-500';
    label = 'Descenso';
  }

  if (!color) return null;

  return (
    <div className="group relative flex items-center">
      <div className={`w-1 h-8 rounded-full ${color}`} />
      <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
        {label}
      </span>
    </div>
  );
};

const StatCell: React.FC<{ value: number | string; highlight?: boolean; color?: string }> = ({ 
  value, 
  highlight = false,
  color = 'text-gray-600 dark:text-gray-400'
}) => (
  <div className={`text-center text-sm ${highlight ? 'font-bold text-gray-900 dark:text-white' : color}`}>
    {value}
  </div>
);

const TournamentStandingsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const phaseSlug = searchParams.get('phase') || undefined;
  const groupSlug = searchParams.get('group') || undefined;

  const { data: tournament, isLoading: tournamentLoading } = useTournament(slug || '');
  const { data: structure } = useTournamentStructure(slug || '');
  const { data: standings, isLoading: standingsLoading } = useTournamentStandings(slug || '', {
    phase: phaseSlug,
    group: groupSlug,
  });
  const { data: sponsorshipAvailability } = useSponsorshipAvailability(slug || '');

  const isSoftball = tournament?.sport_type === 'softball';
  const isStructured = structure?.structure_mode === 'structured';
  const showFootballZones = !isSoftball && !isStructured;

  const scopeLabel = useMemo(() => {
    if (!structure || !phaseSlug) return null;
    const phase = structure.phases.find((p) => p.slug === phaseSlug);
    if (!phase) return null;
    if (groupSlug) {
      const group = phase.groups.find((g) => g.slug === groupSlug);
      return group ? `${phase.name} — ${group.name}` : phase.name;
    }
    return phase.name;
  }, [structure, phaseSlug, groupSlug]);

  const handleScopeChange = (phase?: string, group?: string) => {
    const next = new URLSearchParams();
    if (phase) next.set('phase', phase);
    if (group) next.set('group', group);
    setSearchParams(next);
  };

  if (tournamentLoading || standingsLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="space-y-3 mt-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No hay datos disponibles
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Las posiciones del torneo aún no han sido generadas o no hay suficientes partidos jugados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header del Torneo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-50 rounded-3xl">
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isSoftball ? 'Tabla de Posiciones' : 'Tabla de Posiciones'}
            </h1>
            <p className="text-gray-500">{tournament?.name}</p>
            {scopeLabel && (
              <p className="text-sm text-green-600 font-medium mt-0.5">{scopeLabel}</p>
            )}
          </div>
        </div>
      </div>

      {isStructured && structure && structure.phases.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleScopeChange()}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !phaseSlug
                ? 'bg-green-600 text-white border-green-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
            }`}
          >
            General
          </button>
          {structure.phases.map((phase) =>
            phase.groups.length > 0 ? (
              phase.groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleScopeChange(phase.slug, group.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    phaseSlug === phase.slug && groupSlug === group.slug
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {group.name}
                </button>
              ))
            ) : (
              <button
                key={phase.id}
                type="button"
                onClick={() => handleScopeChange(phase.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  phaseSlug === phase.slug && !groupSlug
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                }`}
              >
                {phase.name}
              </button>
            )
          )}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <SponsorshipAvailabilityBanner
          availability={sponsorshipAvailability}
          showPurchaseButton={false}
        />
        <TournamentAdSlot
          position="standings_top"
          tournamentId={tournament?.id}
          variant="horizontal"
        />
      </div>

      {showFootballZones && (
      <div className="flex flex-wrap gap-4 mb-6 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-violet-50 dark:bg-violet-950/300" />
          <span>Clasificación directa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Repechaje</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Descenso</span>
        </div>
      </div>
      )}

      {/* Tabla Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[auto_3rem_1fr_repeat(8,minmax(2.5rem,1fr))_auto] gap-3 px-4 py-3 bg-gray-50/80 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider items-center">
          <div className="w-1" /> {/* Indicador de zona */}
          <div className="text-center">#</div>
          <div>Equipo</div>
          <div className="text-center" title="Partidos Jugados">PJ</div>
          <div className="text-center" title="Ganados">G</div>
          {!isSoftball && (
          <div className="text-center" title="Empatados">E</div>
          )}
          <div className="text-center" title="Perdidos">P</div>
          
          {isSoftball ? (
            <>
              <div className="text-center" title="Carreras">CR</div>
              <div className="text-center" title="Carreras en contra">CC</div>
              <div className="text-center" title="Average">AVG</div>
            </>
          ) : (
            <>
              <div className="text-center" title="Goles a Favor">GF</div>
              <div className="text-center" title="Goles en Contra">GC</div>
              <div className="text-center" title="Diferencia de Gol">DG</div>
            </>
          )}
          
          <div className="text-center font-bold text-gray-900 dark:text-white">PTS</div>
          <div className="w-4" /> {/* Espacio para flecha */}
        </div>

        {/* Filas */}
        {standings.map((team: TeamStanding, index: number) => (
          <Link
            key={team.team.id}
            to={`/sports/tournaments/${tournament?.slug}/teams/${team.team.slug}`}
            className="grid grid-cols-[auto_3rem_1fr_repeat(8,minmax(2.5rem,1fr))_auto] gap-3 px-4 py-3 border-b border-gray-100 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50/80 transition-colors group cursor-pointer"
          >
            <ZoneIndicator position={team.position} totalTeams={standings.length} showZones={showFootballZones} />
            
            <div className="flex justify-center">
              <PositionBadge position={team.position} />
            </div>

            <div className="flex items-center gap-3 min-w-0">
              {team.team.logo ? (
                <img 
                  src={team.team.logo} 
                  alt={team.team.name} 
                  className="w-8 h-8 rounded-3xl object-cover shadow-sm" 
                  loading="lazy"
                />
              ) : (
                <div className="w-8 h-8 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                  {team.team.abbreviation || team.team.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-semibold text-gray-900 dark:text-white text-sm truncate block">
                  {team.team.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <PositionChange current={team.position} previous={team.previous_position} />
                  <span className="text-[10px] text-gray-400">
                    {team.previous_position && team.previous_position !== team.position 
                      ? `${team.previous_position > team.position ? '+' : ''}${team.previous_position - team.position}`
                      : '-'
                    }
                  </span>
                </div>
              </div>
            </div>

            <StatCell value={team.played} />
            <StatCell value={team.won} color="text-green-600" />
            {!isSoftball && <StatCell value={team.drawn} color="text-yellow-600" />}
            <StatCell value={team.lost} color="text-red-500" />

            {isSoftball ? (
              <>
                <StatCell value={team.runs ?? 0} />
                <StatCell value={team.runs_against ?? 0} />
                <StatCell value={team.average?.toFixed(3) ?? '-'} highlight />
              </>
            ) : (
              <>
                <StatCell value={team.goals_for} />
                <StatCell value={team.goals_against} />
                <StatCell 
                  value={team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference} 
                  highlight 
                />
              </>
            )}

            <div className="text-center">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-3xl font-bold text-sm ${
                index < 3 ? 'bg-green-100 text-green-800' : 'text-gray-900 dark:text-white'
              }`}>
                {team.points}
              </span>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Vista Mobile (Cards) */}
      <div className="md:hidden space-y-3">
        {standings.map((team: TeamStanding, index: number) => (
          <Link
            key={team.team.id}
            to={`/sports/tournaments/${tournament?.slug}/teams/${team.team.slug}`}
            className="block bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <PositionBadge position={team.position} />
                  <PositionChange current={team.position} previous={team.previous_position} />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  {team.team.logo ? (
                    <img src={team.team.logo} alt="" className="w-8 h-8 rounded-3xl object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                      {team.team.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {team.team.name}
                  </span>
                </div>
              </div>
              <span className={`text-lg font-bold ${index < 3 ? 'text-green-700' : 'text-gray-900 dark:text-white'}`}>
                {team.points} <span className="text-xs font-normal text-gray-500">pts</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-2">
                <p className="text-xs text-gray-500 mb-0.5">PJ</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{team.played}</p>
              </div>
              <div className="bg-green-50 rounded-3xl p-2">
                <p className="text-xs text-green-600 mb-0.5">G</p>
                <p className="font-semibold text-sm text-green-700">{team.won}</p>
              </div>
              <div className="bg-yellow-50 rounded-3xl p-2">
                <p className="text-xs text-yellow-600 mb-0.5">E</p>
                <p className="font-semibold text-sm text-yellow-700">{team.drawn}</p>
              </div>
              <div className="bg-red-50 rounded-3xl p-2">
                <p className="text-xs text-red-500 mb-0.5">P</p>
                <p className="font-semibold text-sm text-red-600">{team.lost}</p>
              </div>
            </div>

            {isSoftball ? (
              <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
                <div>
                  <span className="text-gray-500">CR:</span>{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{team.runs ?? 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">CC:</span>{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{team.runs_against ?? 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">AVG:</span>{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{team.average?.toFixed(3) ?? '-'}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 text-xs">
                <span className="text-gray-500">
                  GF: <span className="font-semibold text-gray-900 dark:text-white">{team.goals_for}</span>
                </span>
                <span className="text-gray-500">
                  GC: <span className="font-semibold text-gray-900 dark:text-white">{team.goals_against}</span>
                </span>
                <span className="text-gray-500">
                  DG: <span className="font-semibold text-gray-900 dark:text-white">{team.goal_difference}</span>
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Resumen del torneo */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Equipos</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{standings.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Partidos Jugados</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {standings.reduce((acc: number, t: TeamStanding) => acc + t.played, 0) / 2}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Goles/Carreras</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {standings.reduce((acc: number, t: TeamStanding) => acc + (isSoftball ? (t.runs ?? 0) : t.goals_for), 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Promedio de Goles</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(
              standings.reduce((acc: number, t: TeamStanding) => acc + (isSoftball ? (t.runs ?? 0) : t.goals_for), 0) / 
              (standings.reduce((acc: number, t: TeamStanding) => acc + t.played, 0) || 1)
            ).toFixed(1)}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <TournamentAdSlot
          position="standings_bottom"
          tournamentId={tournament?.id}
          variant="compact"
        />
      </div>
    </div>
  );
};

export default TournamentStandingsPage;