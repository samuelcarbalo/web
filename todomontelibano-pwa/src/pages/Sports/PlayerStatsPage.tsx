import React from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer, usePlayerStats, useTournament} from '../../hooks/useSports';
import { Activity, Goal, Shield, AlertTriangle, Calendar,Loader2 } from 'lucide-react';

const PlayerStatsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: player, isLoading: playerLoading } = usePlayer(id || '');
  const { data: stats, isLoading: statsLoading } = usePlayerStats(id || '');

  if (playerLoading || statsLoading) {
    return <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mt-12" />;
  }

  if (!player || !stats) {
    return <p className="text-center text-gray-500 mt-12">Jugador no encontrado</p>;
  }

  const { data: tournament} = useTournament(player?.tournament_slug || '');

  const isSoftball = tournament?.sport_type === 'softball';
  const isFootball = tournament?.sport_type === 'football'


  // Tarjetas de estadísticas principales
  const mainStats = [
    { label: 'Partidos', value: stats.matches_played, icon: <Calendar className="w-5 h-5" />, color: 'blue' },
    { label: 'Goles', value: stats.goals, icon: <Goal className="w-5 h-5" />, color: 'green' },
    { label: 'Asistencias', value: stats.assists, icon: <Activity className="w-5 h-5" />, color: 'purple' },
    { label: 'Amarillas', value: stats.yellow_cards, icon: <Shield className="w-5 h-5" />, color: 'yellow' },
    { label: 'Rojas', value: stats.red_cards, icon: <AlertTriangle className="w-5 h-5" />, color: 'red' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header del jugador */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          {player.photo ? (
            <img src={player.photo} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-700">
              {player.first_name[0]}{player.last_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{player.full_name}</h1>
            <p className="text-gray-500">#{player.jersey_number} • {player.position_display}</p>
            <p className="text-sm text-gray-400">{player.team_name}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {mainStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className={`inline-flex p-2 rounded-lg bg-${stat.color}-100 text-${stat.color}-600 mb-2`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stats específicas de softbol */}
      {isSoftball && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Estadísticas de Softbol</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats.average?.toFixed(3) || '0.000'}</p>
              <p className="text-xs text-gray-500">Average</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats.strikes}</p>
              <p className="text-xs text-gray-500">Strikes</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats.walks}</p>
              <p className="text-xs text-gray-500">Walks</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{stats.home_runs}</p>
              <p className="text-xs text-gray-500">Home Runs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerStatsPage;