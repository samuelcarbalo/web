import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  Trophy,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Shield,
  Target,
} from 'lucide-react';
import { useTournament, useTeams, useMatches } from '../../hooks/useSports';
import { sportTypeLabels } from '../../types/sports';
import type { Match, Team } from '../../types/sports';

type TabType = 'schedule' | 'standings' | 'stats';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-red-100 text-red-700 animate-pulse',
  finished: 'bg-gray-100 text-gray-600',
  postponed: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-50 text-red-500 line-through',
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  live: 'En vivo',
  finished: 'Finalizado',
  postponed: 'Aplazado',
  cancelled: 'Cancelado',
};

const TournamentPublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('schedule');

  const { data: tournament, isLoading: loadingTournament } = useTournament(slug || '');
  const { data: teamsData } = useTeams(slug || '');
  const { data: matchesData, isLoading: loadingMatches } = useMatches({
    tournament: slug || '',
  });

  const teams = teamsData?.results || [];
  const matches = matchesData?.results || [];

  // Ordenar equipos por posición (puntos, diferencia de goles)
  const standings = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    return (b.goals_for || 0) - (a.goals_for || 0);
  });

  // Agrupar partidos por fecha
  const groupedMatches = matches.reduce((acc: Record<string, Match[]>, match: Match) => {
    const date = new Date(match.match_date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      day: date.toLocaleDateString('es-CO', { weekday: 'long' }),
    };
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'schedule', label: 'Calendario', icon: Calendar },
    { id: 'standings', label: 'Posiciones', icon: Trophy },
    { id: 'stats', label: 'Estadísticas', icon: TrendingUp },
  ];

  if (loadingTournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Torneo no encontrado</p>
          <Link to="/sports" className="text-green-600 hover:underline mt-2 inline-block">
            Volver a deportes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del torneo */}
      <div className="relative h-48 bg-gray-900 overflow-hidden">
        {tournament.banner && (
          <img
            src={tournament.banner}
            alt={tournament.name}
            className="w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/sports"
            className="inline-flex items-center text-white/80 hover:text-white mb-3 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver a deportes
          </Link>
          <div className="flex items-center gap-4">
            {tournament.logo && (
              <img
                src={tournament.logo}
                alt={tournament.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white/20"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
              <p className="text-white/80 text-sm">
                {sportTypeLabels[tournament.sport_type]} • {teams.length} equipos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB: CALENDARIO */}
        {activeTab === 'schedule' && (
          <div>
            {loadingMatches ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
              </div>
            ) : Object.keys(groupedMatches).length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay partidos programados</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedMatches).map(([date, dayMatches]) => {
                  const firstMatch = dayMatches[0];
                  const dateInfo = formatMatchDate(firstMatch.match_date);
                  
                  return (
                    <div key={date}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                          {dateInfo.day}
                        </div>
                        <span className="text-gray-500 text-sm">{dateInfo.date}</span>
                      </div>

                      <div className="space-y-3">
                        {dayMatches.map((match: Match) => (
                          <Link
                            key={match.id}
                            to={`/sports/matches/${match.id}`}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow block"
                          >
                            <div className="flex items-center justify-between">
                              {/* Local */}
                              <div className="flex items-center gap-3 flex-1">
                                {match.home_team_logo ? (
                                  <img
                                    src={match.home_team_logo}
                                    alt={match.home_team_name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                    {match.home_team_name?.[0]}
                                  </div>
                                )}
                                <span className="font-medium text-gray-900">{match.home_team_name}</span>
                              </div>

                              {/* Centro */}
                              <div className="text-center px-4">
                                {match.status === 'live' ? (
                                  <div>
                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse mb-1">
                                      EN VIVO
                                    </span>
                                    <p className="text-xl font-bold text-red-600">
                                      {match.home_score} - {match.away_score}
                                    </p>
                                  </div>
                                ) : match.status === 'finished' ? (
                                  <p className="text-xl font-bold text-gray-900">
                                    {match.home_score} - {match.away_score}
                                  </p>
                                ) : (
                                  <div>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatMatchDate(match.match_date).time}
                                    </p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[match.status]}`}>
                                      {STATUS_LABELS[match.status]}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Visitante */}
                              <div className="flex items-center gap-3 flex-1 justify-end">
                                <span className="font-medium text-gray-900">{match.away_team_name}</span>
                                {match.away_team_logo ? (
                                  <img
                                    src={match.away_team_logo}
                                    alt={match.away_team_name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                    {match.away_team_name?.[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {match.venue && (
                              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {match.venue}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: POSICIONES */}
        {activeTab === 'standings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">PJ</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">G</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">E</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">P</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">GF</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">GC</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">DG</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {standings.map((team: Team, index: number) => (
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'text-gray-500'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {team.logo ? (
                            <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                              {team.abbreviation}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{team.name}</p>
                            <p className="text-xs text-gray-500">{team.abbreviation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{team.played}</td>
                      <td className="px-4 py-3 text-center text-sm text-green-600 font-medium">{team.won}</td>
                      <td className="px-4 py-3 text-center text-sm text-yellow-600">{team.drawn}</td>
                      <td className="px-4 py-3 text-center text-sm text-red-600">{team.lost}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{team.goals_for}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{team.goals_against}</td>
                      <td className="px-4 py-3 text-center text-sm font-medium">
                        <span className={team.goal_difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-gray-900">{team.points}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {standings.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay equipos registrados</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: ESTADÍSTICAS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Resumen del torneo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Resumen
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Equipos</span>
                  <span className="font-bold">{teams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partidos jugados</span>
                  <span className="font-bold">{matches.filter((m: Match) => m.status === 'finished').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partidos pendientes</span>
                  <span className="font-bold">{matches.filter((m: Match) => m.status === 'scheduled').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">En vivo</span>
                  <span className="font-bold text-red-600">{matches.filter((m: Match) => m.status === 'live').length}</span>
                </div>
              </div>
            </div>

            {/* Mejores equipos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Mejores Equipos
              </h3>
              <div className="space-y-3">
                {standings.slice(0, 5).map((team: Team, index: number) => (
                  <div key={team.id} className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-gray-500">{index + 1}</span>
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                        {team.abbreviation}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{team.name}</p>
                    </div>
                    <span className="font-bold text-sm">{team.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Goleadores (si tuvieras datos de jugadores por torneo) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Goleadores
              </h3>
              <p className="text-sm text-gray-500 text-center py-4">
                Estadísticas de goleadores próximamente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentPublicPage;