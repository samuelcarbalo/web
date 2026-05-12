import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTournament, useTournamentPlayerStats } from '../../hooks/useSports';
import { Trophy, Loader2, ChevronLeft, Goal, Shield, AlertTriangle, Zap, Home } from 'lucide-react';

const TournamentPlayerStatsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: tournament, isLoading: tournamentLoading } = useTournament(slug || '');
  const { data: stats, isLoading: statsLoading } = useTournamentPlayerStats(slug || '');

  if (tournamentLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (!tournament || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Torneo no encontrado</p>
          <Link to="/sports/tournaments" className="text-green-600 hover:underline mt-2 inline-block">
            Volver a torneos
          </Link>
        </div>
      </div>
    );
  }

  const isSoftball = tournament.sport_type === 'softball';

  const StatSection = ({ 
    title, 
    icon, 
    players, 
    statKey, 
    statLabel, 
    colorClass, 
    bgClass 
  }: {
    title: string;
    icon: React.ReactNode;
    players: any[];
    statKey: string;
    statLabel: string;
    colorClass: string;
    bgClass: string;
  }) => {
    if (!players || players.length === 0) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={`px-4 py-3 ${bgClass} border-b border-gray-200 flex items-center gap-2`}>
          {icon}
          <h3 className={`font-bold ${colorClass}`}>{title}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {players.map((player: any, index: number) => (
            <div 
              key={player.id} 
              className={`flex items-center gap-3 px-4 py-3 ${
                index === 0 ? 'bg-yellow-50/50' : ''
              }`}
            >
              {/* Posición */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-400 text-white' :
                'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>

              {/* Foto */}
              {player.photo ? (
                <img src={player.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                  {player.first_name?.[0]}{player.last_name?.[0]}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/sports/players/${player.id}`}
                  className="font-medium text-gray-900 text-sm hover:text-green-600 transition-colors truncate block"
                >
                  {player.full_name}
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>#{player.jersey_number || '—'}</span>
                  <span>•</span>
                  <Link 
                    to={`/sports/tournaments/${slug}/teams/${player.team_slug}`}
                    className="hover:text-green-600 transition-colors truncate"
                  >
                    {player.team_name}
                  </Link>
                  <span>•</span>
                  <span>{player.position_display}</span>
                </div>
              </div>

              {/* Stat */}
              <div className={`text-right ${colorClass}`}>
                <span className="text-xl font-bold">{player[statKey]}</span>
                <span className="text-xs block text-gray-400">{statLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to={`/sports/tournaments/${slug}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver al torneo
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estadísticas de Jugadores</h1>
            <p className="text-gray-500">{tournament.name}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Top Goleadores */}
          <StatSection
            title="Top Goleadores"
            icon={<Goal className="w-5 h-5 text-green-600" />}
            players={stats.top_scorers}
            statKey="goals"
            statLabel="goles"
            colorClass="text-green-600"
            bgClass="bg-green-50"
          />

          {/* Top Amarillas */}
          <StatSection
            title="Top Tarjetas Amarillas"
            icon={<Shield className="w-5 h-5 text-yellow-600" />}
            players={stats.top_yellow_cards}
            statKey="yellow_cards"
            statLabel="amarillas"
            colorClass="text-yellow-600"
            bgClass="bg-yellow-50"
          />

          {/* Top Rojas */}
          <StatSection
            title="Top Tarjetas Rojas"
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            players={stats.top_red_cards}
            statKey="red_cards"
            statLabel="rojas"
            colorClass="text-red-600"
            bgClass="bg-red-50"
          />

          {/* Stats de Softbol */}
          {isSoftball && (
            <>
              <StatSection
                title="Top Strikes"
                icon={<Zap className="w-5 h-5 text-blue-600" />}
                players={stats.top_strikes}
                statKey="strikes"
                statLabel="strikes"
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
              />

              <StatSection
                title="Top Home Runs"
                icon={<Home className="w-5 h-5 text-purple-600" />}
                players={stats.top_home_runs}
                statKey="home_runs"
                statLabel="home runs"
                colorClass="text-purple-600"
                bgClass="bg-purple-50"
              />
            </>
          )}
        </div>

        {/* Sin datos */}
        {!stats.top_scorers?.length && 
         !stats.top_yellow_cards?.length && 
         !stats.top_red_cards?.length && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aún no hay estadísticas de jugadores registradas</p>
            <p className="text-gray-400 text-sm mt-1">
              Las estadísticas se actualizan automáticamente con los eventos de los partidos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentPlayerStatsPage;