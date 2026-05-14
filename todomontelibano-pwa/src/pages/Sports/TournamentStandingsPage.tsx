import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTournament, useTournamentStandings } from '../../hooks/useSports';
import { Trophy, Loader2, TrendingUp, TrendingDown, Minus, Shield, ChevronRight } from 'lucide-react';

// Tipado mejorado
interface TeamStanding {
  position: number;
  previous_position?: number;
  team: {
    id: string;
    name: string;
    logo?: string;
    short_name?: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  // Softbol
  runs?: number;
  runs_against?: number;
  average?: number;
}

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
    2: 'bg-gray-100 text-gray-700 border-gray-300',
    3: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const style = styles[position as keyof typeof styles] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm ${style}`}>
      {position}
    </div>
  );
};

const ZoneIndicator: React.FC<{ position: number; totalTeams: number }> = ({ position, totalTeams }) => {
  // Ejemplo de zonas típicas (ajusta según tu lógica de torneo)
  let color = 'bg-transparent';
  let label = '';
  
  if (position <= 4) {
    color = 'bg-blue-500';
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
  color = 'text-gray-600'
}) => (
  <div className={`text-center text-sm ${highlight ? 'font-bold text-gray-900' : color}`}>
    {value}
  </div>
);

const TournamentStandingsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: tournament, isLoading: tournamentLoading } = useTournament(slug || '');
  const { data: standings, isLoading: standingsLoading } = useTournamentStandings(slug || '');

  const isSoftball = tournament?.sport_type === 'softball';

  if (tournamentLoading || standingsLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="space-y-3 mt-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
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
          <div className="p-2 bg-green-50 rounded-lg">
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isSoftball ? 'Tabla de Posiciones' : 'Tabla de Posiciones'}
            </h1>
            <p className="text-gray-500">{tournament?.name}</p>
          </div>
        </div>
        
        {/* Leyenda de zonas */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
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
      </div>

      {/* Tabla Desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[auto_3rem_1fr_repeat(8,minmax(2.5rem,1fr))_auto] gap-3 px-4 py-3 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider items-center">
          <div className="w-1" /> {/* Indicador de zona */}
          <div className="text-center">#</div>
          <div>Equipo</div>
          <div className="text-center" title="Partidos Jugados">PJ</div>
          <div className="text-center" title="Ganados">G</div>
          <div className="text-center" title="Empatados">E</div>
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
          
          <div className="text-center font-bold text-gray-900">PTS</div>
          <div className="w-4" /> {/* Espacio para flecha */}
        </div>

        {/* Filas */}
        {standings.map((team: TeamStanding, index: number) => (
          <Link
            key={team.team.id}
            to={`/teams/${team.team.id}`}
            className="grid grid-cols-[auto_3rem_1fr_repeat(8,minmax(2.5rem,1fr))_auto] gap-3 px-4 py-3 border-b border-gray-100 items-center hover:bg-gray-50/80 transition-colors group cursor-pointer"
          >
            <ZoneIndicator position={team.position} totalTeams={standings.length} />
            
            <div className="flex justify-center">
              <PositionBadge position={team.position} />
            </div>

            <div className="flex items-center gap-3 min-w-0">
              {team.team.logo ? (
                <img 
                  src={team.team.logo} 
                  alt={team.team.name} 
                  className="w-8 h-8 rounded-lg object-cover shadow-sm" 
                  loading="lazy"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                  {team.team.short_name || team.team.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-semibold text-gray-900 text-sm truncate block">
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
            <StatCell value={team.drawn} color="text-yellow-600" />
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
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                index < 3 ? 'bg-green-100 text-green-800' : 'text-gray-900'
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
            to={`/teams/${team.team.id}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <PositionBadge position={team.position} />
                  <PositionChange current={team.position} previous={team.previous_position} />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  {team.team.logo ? (
                    <img src={team.team.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {team.team.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-gray-900 text-sm truncate">
                    {team.team.name}
                  </span>
                </div>
              </div>
              <span className={`text-lg font-bold ${index < 3 ? 'text-green-700' : 'text-gray-900'}`}>
                {team.points} <span className="text-xs font-normal text-gray-500">pts</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-0.5">PJ</p>
                <p className="font-semibold text-sm text-gray-900">{team.played}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <p className="text-xs text-green-600 mb-0.5">G</p>
                <p className="font-semibold text-sm text-green-700">{team.won}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <p className="text-xs text-yellow-600 mb-0.5">E</p>
                <p className="font-semibold text-sm text-yellow-700">{team.drawn}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-xs text-red-500 mb-0.5">P</p>
                <p className="font-semibold text-sm text-red-600">{team.lost}</p>
              </div>
            </div>

            {isSoftball ? (
              <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
                <div>
                  <span className="text-gray-500">CR:</span>{' '}
                  <span className="font-semibold text-gray-900">{team.runs ?? 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">CC:</span>{' '}
                  <span className="font-semibold text-gray-900">{team.runs_against ?? 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">AVG:</span>{' '}
                  <span className="font-semibold text-gray-900">{team.average?.toFixed(3) ?? '-'}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 text-xs">
                <span className="text-gray-500">
                  GF: <span className="font-semibold text-gray-900">{team.goals_for}</span>
                </span>
                <span className="text-gray-500">
                  GC: <span className="font-semibold text-gray-900">{team.goals_against}</span>
                </span>
                <span className="text-gray-500">
                  DG: <span className="font-semibold text-gray-900">{team.goal_difference}</span>
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Resumen del torneo */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Equipos</p>
          <p className="text-2xl font-bold text-gray-900">{standings.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Partidos Jugados</p>
          <p className="text-2xl font-bold text-gray-900">
            {standings.reduce((acc: number, t: TeamStanding) => acc + t.played, 0) / 2}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Goles/Carreras</p>
          <p className="text-2xl font-bold text-gray-900">
            {standings.reduce((acc: number, t: TeamStanding) => acc + (isSoftball ? (t.runs ?? 0) : t.goals_for), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Promedio de Goles</p>
          <p className="text-2xl font-bold text-gray-900">
            {(
              standings.reduce((acc: number, t: TeamStanding) => acc + (isSoftball ? (t.runs ?? 0) : t.goals_for), 0) / 
              (standings.reduce((acc: number, t: TeamStanding) => acc + t.played, 0) || 1)
            ).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TournamentStandingsPage;