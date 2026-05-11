import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  TrendingUp,
  Users,
  ChevronRight,
  Flame,
  Clock,
  MapPin,
} from 'lucide-react';
import { useTournaments, useMatches } from '../../hooks/useSports';
import { sportTypeLabels, sportTypeColors } from '../../types/sports';
import type { Match, Tournament } from '../../types/sports';

const SportsPublicPage: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string>('');
  
  const { data: tournamentsData, isLoading: loadingTournaments } = useTournaments({
    sport_type: selectedSport || undefined,
    status: 'active',
  });
  
  const { data: liveMatchesData } = useMatches({ live: true });
  const { data: upcomingMatchesData } = useMatches({
    status: 'scheduled',
    from: new Date().toISOString().split('T')[0],
  });

  const tournaments = tournamentsData?.results || [];
  const liveMatches = liveMatchesData?.results || [];
  const upcomingMatches = upcomingMatchesData?.results?.slice(0, 5) || [];

  const sportTypes = [
    { value: '', label: 'Todos', icon: Trophy },
    { value: 'football', label: 'Fútbol', icon: Flame },
    { value: 'basketball', label: 'Baloncesto', icon: Users },
    { value: 'volleyball', label: 'Voleibol', icon: TrendingUp },
    { value: 'softball', label: 'Softbol', icon: Trophy },
  ];

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-CO', { month: 'short' }),
      time: date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Deportes</h1>
          <p className="text-gray-400 text-lg">
            Sigue tus torneos favoritos, resultados en vivo y estadísticas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filtro de deportes */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {sportTypes.map((sport) => (
            <button
              key={sport.value}
              onClick={() => setSelectedSport(sport.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedSport === sport.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <sport.icon className="w-4 h-4" />
              {sport.label}
            </button>
          ))}
        </div>

        {/* Partidos en VIVO */}
        {liveMatches.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-xl font-bold text-gray-900">En Vivo Ahora</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMatches.map((match: Match) => (
                <Link
                  key={match.id}
                  to={`/sports/matches/${match.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full animate-pulse">
                      ● EN VIVO
                    </span>
                    <span className="text-xs text-gray-500">{match.tournament_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="font-bold text-gray-900">{match.home_team_name}</p>
                    </div>
                    <div className="px-4">
                      <span className="text-2xl font-bold text-red-600">
                        {match.home_score} - {match.away_score}
                      </span>
                    </div>
                    <div className="text-center flex-1">
                      <p className="font-bold text-gray-900">{match.away_team_name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna principal - Torneos */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Torneos Activos
            </h2>
            
            {loadingTournaments ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
              </div>
            ) : tournaments.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay torneos activos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournaments.map((tournament: Tournament) => (
                  <Link
                    key={tournament.id}
                    to={`/sports/tournaments/${tournament.slug}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    {/* Banner */}
                    <div className={`h-24 ${sportTypeColors[tournament.sport_type]} relative`}>
                      {tournament.banner && (
                        <img
                          src={tournament.banner}
                          alt={tournament.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                          {sportTypeLabels[tournament.sport_type]}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {tournament.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {tournament.teams_count} equipos • {tournament.matches_count} partidos
                          </p>
                        </div>
                        {tournament.logo && (
                          <img
                            src={tournament.logo}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover ml-3"
                          />
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(tournament.start_date).toLocaleDateString('es-CO')}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Próximos partidos */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Próximos Partidos
            </h2>
            
            {upcomingMatches.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No hay partidos programados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map((match: Match) => {
                  const dateInfo = formatMatchDate(match.match_date);
                  return (
                    <Link
                      key={match.id}
                      to={`/sports/matches/${match.id}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow block"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">{match.tournament_name}</span>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {dateInfo.day} {dateInfo.month}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-900">{match.home_team_name}</span>
                        <span className="text-xs text-gray-400 mx-2">vs</span>
                        <span className="font-medium text-sm text-gray-900">{match.away_team_name}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {dateInfo.time}
                        {match.venue && (
                          <>
                            <span className="mx-1">•</span>
                            <MapPin className="w-3 h-3" />
                            {match.venue}
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsPublicPage;