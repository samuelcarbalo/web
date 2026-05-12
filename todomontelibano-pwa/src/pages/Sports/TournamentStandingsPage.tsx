import React from 'react';
import { useParams } from 'react-router-dom';
import { useTournament, useTournamentStandings } from '../../hooks/useSports';
import { Trophy, Loader2 } from 'lucide-react';

const TournamentStandingsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: tournament, isLoading: tournamentLoading } = useTournament(slug || '');
  const { data: standings, isLoading: standingsLoading } = useTournamentStandings(slug || '');

  if (tournamentLoading || standingsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay datos de posiciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Tabla de Posiciones
      </h1>
      <p className="text-gray-500 mb-6">{tournament?.name}</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-4">Equipo</div>
          <div className="col-span-1 text-center">PJ</div>
          <div className="col-span-1 text-center">PG</div>
          <div className="col-span-1 text-center">PE</div>
          <div className="col-span-1 text-center">PP</div>
          <div className="col-span-1 text-center">GF</div>
          <div className="col-span-1 text-center">GC</div>
          <div className="col-span-1 text-center font-bold text-gray-900">PTS</div>
        </div>

        {/* Filas */}
        {standings.map((team: any, index: number) => (
          <div
            key={team.team.id}
            className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 items-center ${
              index < 3 ? 'bg-green-50/50' : '' // Destacar top 3
            }`}
          >
            <div className="col-span-1 text-center font-bold text-gray-900">
              {team.position}
            </div>
            <div className="col-span-4 flex items-center gap-2">
              {team.team.logo ? (
                <img src={team.team.logo} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                  {team.team.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-gray-900 text-sm truncate">
                {team.team.name}
              </span>
            </div>
            <div className="col-span-1 text-center text-sm text-gray-600">{team.played}</div>
            <div className="col-span-1 text-center text-sm text-green-600">{team.won}</div>
            <div className="col-span-1 text-center text-sm text-yellow-600">{team.drawn}</div>
            <div className="col-span-1 text-center text-sm text-red-600">{team.lost}</div>
            <div className="col-span-1 text-center text-sm text-gray-600">{team.goals_for}</div>
            <div className="col-span-1 text-center text-sm text-gray-600">{team.goals_against}</div>
            <div className="col-span-1 text-center font-bold text-gray-900">
              {team.points}
            </div>
          </div>
        ))}
      </div>

      {/* Stats de softbol si aplica */}
      {tournament?.sport_type === 'softball' && standings[0]?.runs !== undefined && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Estadísticas de Softbol</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 p-4">
            {standings.map((team: any) => (
              <div key={team.team.id} className="text-center">
                <p className="text-sm font-medium text-gray-900">{team.team.name}</p>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <p>Carreras: <span className="font-bold text-gray-700">{team.runs}</span></p>
                  <p>Carreras en contra: <span className="font-bold text-gray-700">{team.runs_against}</span></p>
                  <p>Average: <span className="font-bold text-gray-700">{team.average?.toFixed(3)}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentStandingsPage;