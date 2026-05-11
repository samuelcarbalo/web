import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  Users,
  MapPin,
  Plus,
  ChevronRight,
  ChevronLeft,
  Clock,
  Flame,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTournaments } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';
import { getMatches } from '../../lib/sportsApi';
import type { SportType, Match } from '../../types/sports';
import { sportTypeLabels, sportTypeColors } from '../../types/sports';
import { useLocation } from 'react-router-dom';

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

const toDateString = (date: Date) => date.toISOString().split('T')[0];

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// ─── Hook para partidos de un día ─────────────────────────────────────────────
const useMatchesForDay = (date: Date, enabled: boolean) => {
  const from = toDateString(date);
  const to = toDateString(date);

  return useQuery({
    queryKey: ['matches-day', from],
    queryFn: () => getMatches({ from, to }),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
};

// ─── Tipo de tab ──────────────────────────────────────────────────────────────
type Tab = SportType | '' | 'matches';

// ─── Componente principal ─────────────────────────────────────────────────────

const TournamentsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('matches');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [offset, setOffset] = useState(0); // para el navegador de días

  const { user } = useAuthStore();
  let isManager = user?.role === 'manager';
  const location = useLocation();
  if (location.pathname === '/sports/') isManager = false;

  const isMatchesTab = activeTab === 'matches';

  // ── Torneos ───────────────────────────────────────────────────────────────
  const { data: tournamentsData, isLoading: loadingTournaments } = useTournaments({
    sport_type: isMatchesTab ? '' : (activeTab as SportType | ''),
    status: selectedStatus ? selectedStatus : 'active',
    enabled: isManager,
  });

  // ── Partidos por día ──────────────────────────────────────────────────────
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const currentDay = useMemo(() => addDays(today, offset), [today, offset]);
  const { data: matchesData, isLoading: loadingMatches } = useMatchesForDay(currentDay, isMatchesTab);
  const dayMatches: Match[] = matchesData?.results ?? [];

  const isToday = isSameDay(currentDay, today);

  const dayLabel = useMemo(() => {
    if (offset === 0) return 'Hoy';
    if (offset === 1) return 'Mañana';
    if (offset === -1) return 'Ayer';
    return currentDay.toLocaleDateString('es-CO', { weekday: 'long' });
  }, [offset, currentDay]);

  const dateLabel = currentDay.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formatMatchTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs: { value: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { value: 'matches', label: 'Partidos', icon: Calendar },
    { value: '', label: 'Todos', icon: Trophy },
    { value: 'football', label: 'Fútbol', icon: Flame },
    { value: 'softball', label: 'Softbol', icon: Trophy },
    { value: 'basketball', label: 'Baloncesto', icon: Users },
    { value: 'volleyball', label: 'Voleibol', icon: TrendingUp },
  ];

  const statuses = [
    { value: 'active', label: 'En curso' },
    { value: 'draft', label: 'Borradores' },
    { value: 'upcoming', label: 'Próximos' },
    { value: 'cancelled', label: 'Cancelados' },
    { value: 'finished', label: 'Finalizados' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      completed: 'bg-gray-100 text-gray-800',
      finished: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      upcoming: 'Próximo',
      ongoing: 'En curso',
      active: 'En curso',
      draft: 'Borrador',
      completed: 'Finalizado',
      finished: 'Finalizado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-4">
                <Trophy className="w-10 h-10 text-yellow-500" />
                Torneos Deportivos
              </h1>
              <p className="text-gray-400 text-lg">
                Compite en fútbol, softbol y más deportes en Montelibano
              </p>
            </div>
            {isManager && (
              <Link
                to="/sports/tournaments/create"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear torneo
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Selector de tabs (Partidos | Todos | Fútbol | …) */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Vista Partidos ──────────────────────────────────────────────────── */}
        {isMatchesTab && (
          <div className="max-w-2xl mx-auto">
            {/* Navegador de fecha */}
            <div className="flex items-center gap-3 mb-6 bg-white rounded-xl border border-gray-200 p-4">
              <button
                onClick={() => setOffset((o) => o - 1)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Día anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 text-center">
                <p className={`text-base font-semibold capitalize ${isToday ? 'text-green-600' : 'text-gray-800'}`}>
                  {dayLabel}
                </p>
                <p className="text-sm text-gray-400 capitalize">{dateLabel}</p>
              </div>

              <button
                onClick={() => setOffset((o) => o + 1)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Día siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Botón volver a hoy */}
            {!isToday && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setOffset(0)}
                  className="text-xs text-green-600 font-medium border border-green-200 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
                >
                  Ir a hoy
                </button>
              </div>
            )}

            {/* Partidos del día */}
            {loadingMatches ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
              </div>
            ) : dayMatches.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <h3 className="text-gray-600 font-medium">Sin partidos este día</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Usa las flechas para explorar otras fechas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayMatches.map((match: Match) => (
                  <Link
                    key={match.id}
                    to={`/sports/matches/${match.id}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all block group"
                  >
                    {/* Torneo + jornada */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 truncate max-w-[160px]">
                        {match.tournament_name}
                      </span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                        {match.match_week ? `J${match.match_week}` : ''}
                        {match.round_number ? ` • R${match.round_number}` : ''}
                      </span>
                    </div>

                    {/* Equipos + marcador */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Local */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {match.home_team_logo ? (
                          <img
                            src={match.home_team_logo}
                            alt={match.home_team_name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                            {match.home_team_name?.[0]}
                          </div>
                        )}
                        <span className="font-semibold text-sm text-gray-900 truncate">
                          {match.home_team_name}
                        </span>
                      </div>

                      {/* Centro */}
                      <div className="shrink-0 text-center min-w-[52px]">
                        {match.status === 'finished' &&
                        match.home_score != null &&
                        match.away_score != null ? (
                          <span className="text-base font-bold text-gray-800 tabular-nums">
                            {match.home_score}–{match.away_score}
                          </span>
                        ) : match.status === 'live' ? (
                          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg animate-pulse">
                            EN VIVO
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 font-medium">VS</span>
                        )}
                      </div>

                      {/* Visitante */}
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                        <span className="font-semibold text-sm text-gray-900 truncate text-right">
                          {match.away_team_name}
                        </span>
                        {match.away_team_logo ? (
                          <img
                            src={match.away_team_logo}
                            alt={match.away_team_name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                            {match.away_team_name?.[0]}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hora y sede */}
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatMatchTime(match.match_date)}
                      </div>
                      {match.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[180px]">{match.venue}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center text-green-600 text-xs font-medium group-hover:text-green-700">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver detalles del partido
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Vista Torneos (Todos | Fútbol | …) ─────────────────────────────── */}
        {!isMatchesTab && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              {/* Filtro de estado */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedStatus('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedStatus === ''
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Todos
                </button>
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedStatus === status.value
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>

              {loadingTournaments ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
                </div>
              ) : tournamentsData?.results.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No hay torneos activos</h3>
                  <p className="text-gray-500 mt-2">
                    {activeTab ? 'Prueba con otro deporte' : 'Los próximos torneos aparecerán aquí'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tournamentsData?.results.map((tournament) => (
                    <Link
                      key={tournament.id}
                      to={`/sports/tournaments/${tournament.slug}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
                    >
                      {/* Banner */}
                      <div className={`h-24 ${sportTypeColors[tournament.sport_type]} relative`}>
                        {tournament.banner ? (
                          <img
                            src={tournament.banner}
                            alt={tournament.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700">
                            <Trophy className="w-10 h-10 text-white opacity-80" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                            {sportTypeLabels[tournament.sport_type]}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tournament.status)}`}>
                            {getStatusLabel(tournament.status)}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                              {tournament.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {tournament.teams_count} / {tournament.max_teams} equipos
                            </p>
                          </div>
                          {tournament.logo ? (
                            <img
                              src={tournament.logo}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover ml-3"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full ${sportTypeColors[tournament.sport_type]} flex items-center justify-center flex-shrink-0 ml-3`}>
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(tournament.start_date).toLocaleDateString('es-CO')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {tournament.teams_count} equipos
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
          </div>
        )}

      </div>
    </div>
  );
};

export default TournamentsList;