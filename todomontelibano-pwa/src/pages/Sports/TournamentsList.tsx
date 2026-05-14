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
  Search,
  Filter,
  ArrowRight,
  Activity,
  Shield,
  Star,
  Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTournaments, useBannersByPosition } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';
import { getMatches } from '../../lib/sportsApi';
import type { SportType, Match } from '../../types/sports';
import { sportTypeLabels, sportTypeColors } from '../../types/sports';
import { useLocation } from 'react-router-dom';
import BannerAd from '../../components/BannerAd';

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

// ─── Skeleton Components ──────────────────────────────────────────────────────
const TournamentCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden animate-pulse">
    <div className="h-32 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="flex gap-3 pt-2">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
);

const MatchCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 animate-pulse space-y-4">
    <div className="flex justify-between">
      <div className="h-3 bg-gray-200 rounded w-24" />
      <div className="h-3 bg-gray-200 rounded w-16" />
    </div>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-6 bg-gray-200 rounded w-12" />
      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
      </div>
    </div>
    <div className="h-3 bg-gray-200 rounded w-32" />
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const TournamentsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('matches');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

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

  // ── Banners publicitarios ────────────────────────────────────────────────
  const { data: homeBanners } = useBannersByPosition('home_hero');
  const { data: tournamentBanners } = useBannersByPosition('tournament_list');

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
    { value: 'matches', label: 'Partidos', icon: Activity },
    { value: '', label: 'Todos', icon: Trophy },
    { value: 'football', label: 'Fútbol', icon: Flame },
    { value: 'softball', label: 'Softbol', icon: Trophy },
    { value: 'basketball', label: 'Baloncesto', icon: Users },
    { value: 'volleyball', label: 'Voleibol', icon: TrendingUp },
  ];

  const statuses = [
    { value: 'active', label: 'En curso', color: 'green' },
    { value: 'registration', label: 'Inscripción', color: 'blue' },
    { value: 'draft', label: 'Borradores', color: 'gray' },
    { value: 'finished', label: 'Finalizados', color: 'gray' },
    { value: 'cancelled', label: 'Cancelados', color: 'red' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
      ongoing: 'bg-green-50 text-green-700 border-green-200',
      active: 'bg-green-50 text-green-700 border-green-200',
      registration: 'bg-blue-50 text-blue-700 border-blue-200',
      draft: 'bg-gray-50 text-gray-700 border-gray-200',
      completed: 'bg-gray-50 text-gray-700 border-gray-200',
      finished: 'bg-gray-50 text-gray-700 border-gray-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      upcoming: 'Próximo',
      ongoing: 'En curso',
      active: 'En curso',
      registration: 'Inscripción',
      draft: 'Borrador',
      completed: 'Finalizado',
      finished: 'Finalizado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getSportIcon = (sport: SportType) => {
    const icons: Record<string, React.ReactNode> = {
      football: <Flame className="w-4 h-4" />,
      softball: <Trophy className="w-4 h-4" />,
      basketball: <Users className="w-4 h-4" />,
      volleyball: <TrendingUp className="w-4 h-4" />,
    };
    return icons[sport] || <Star className="w-4 h-4" />;
  };

  // Filtrar torneos por búsqueda
  const filteredTournaments = useMemo(() => {
    if (!searchQuery) return tournamentsData?.results;
    return tournamentsData?.results.filter((t: any) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tournamentsData?.results, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Mejorado */}
      <div className="relative bg-gray-900 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">
                  Competiciones Deportivas
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Torneos en <span className="text-green-400">Montelíbano</span>
              </h1>
              <p className="text-gray-400 text-lg mt-3 max-w-lg">
                Compite en fútbol, softbol, baloncesto y más deportes. 
                Encuentra torneos activos y sigue los resultados en vivo.
              </p>
            </div>

            {isManager && (
              <Link
                to="/sports/tournaments/create"
                className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-semibold transition-all shadow-lg shadow-green-900/30 hover:shadow-xl hover:shadow-green-900/40 hover:-translate-y-0.5 flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
                Crear torneo
              </Link>
            )}
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50/50 to-transparent" />
      </div>

      {/* Banner Publicitario Hero */}
      {homeBanners && homeBanners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {homeBanners.slice(0, 3).map((banner: any) => (
              <BannerAd
                key={banner.id}
                id={banner.id}
                image={banner.image}
                title={banner.title}
                link_url={banner.link_url}
                description={banner.description}
                variant="compact"
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Barra de búsqueda y tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setSearchQuery('');
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                  ${activeTab === tab.value
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Búsqueda (solo en vista torneos) */}
          {!isMatchesTab && (
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar torneos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 w-full md:w-64 transition-all"
              />
            </div>
          )}
        </div>

        {/* ── Vista Partidos ──────────────────────────────────────────────────── */}
        {isMatchesTab && (
          <div className="max-w-3xl mx-auto">
            {/* Navegador de fecha mejorado */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setOffset((o) => o - 1)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all"
                  aria-label="Día anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className={`text-lg font-bold capitalize ${isToday ? 'text-green-600' : 'text-gray-900'}`}>
                      {dayLabel}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 capitalize mt-0.5">{dateLabel}</p>
                </div>

                <button
                  onClick={() => setOffset((o) => o + 1)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all"
                  aria-label="Día siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Días cercanos rápidos */}
              <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-gray-100">
                {[-2, -1, 0, 1, 2].map((dayOffset) => {
                  const d = addDays(today, dayOffset);
                  const isSelected = offset === dayOffset;
                  return (
                    <button
                      key={dayOffset}
                      onClick={() => setOffset(dayOffset)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${isSelected
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className="block text-[10px] uppercase tracking-wider opacity-70">
                        {dayOffset === 0 ? 'Hoy' : dayOffset === -1 ? 'Ayer' : dayOffset === 1 ? 'Mañ' : d.toLocaleDateString('es-CO', { weekday: 'short' })}
                      </span>
                      <span className="block font-bold">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Partidos del día */}
            {loadingMatches ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <MatchCardSkeleton key={i} />
                ))}
              </div>
            ) : dayMatches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sin partidos este día</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  No hay partidos programados para {dateLabel}. Usa las flechas para explorar otras fechas.
                </p>
                {offset !== 0 && (
                  <button
                    onClick={() => setOffset(0)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Ir a hoy
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {dayMatches.map((match: Match) => (
                  <Link
                    key={match.id}
                    to={`/sports/matches/${match.id}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 hover:shadow-lg hover:border-gray-300 transition-all block group"
                  >
                    {/* Header: Torneo + estado */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                          {match.tournament_name}
                        </span>
                        {match.match_week && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                            J{match.match_week}
                          </span>
                        )}
                      </div>

                      {match.status === 'live' && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full animate-pulse">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          EN VIVO
                        </span>
                      )}
                      {match.status === 'finished' && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                          Finalizado
                        </span>
                      )}
                      {match.status === 'scheduled' && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                          Programado
                        </span>
                      )}
                    </div>

                    {/* Equipos + marcador */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Local */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {match.home_team_logo ? (
                          <img
                            src={match.home_team_logo}
                            alt={match.home_team_name}
                            className="w-11 h-11 rounded-xl object-cover shadow-sm bg-white flex-shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0">
                            {match.home_team_name?.[0]}
                          </div>
                        )}
                        <span className="font-bold text-sm text-gray-900 truncate">
                          {match.home_team_name}
                        </span>
                      </div>

                      {/* Marcador / VS */}
                      <div className="shrink-0 text-center min-w-[64px]">
                        {match.status === 'finished' &&
                        match.home_score != null &&
                        match.away_score != null ? (
                          <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl">
                            <span className={`text-lg font-bold tabular-nums ${match.home_score > match.away_score ? 'text-green-400' : ''}`}>
                              {match.home_score}
                            </span>
                            <span className="text-gray-500">-</span>
                            <span className={`text-lg font-bold tabular-nums ${match.away_score > match.home_score ? 'text-green-400' : ''}`}>
                              {match.away_score}
                            </span>
                          </div>
                        ) : match.status === 'live' ? (
                          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-sm">
                            {match.home_score ?? 0} - {match.away_score ?? 0}
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-gray-300">VS</span>
                        )}
                      </div>

                      {/* Visitante */}
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                        <span className="font-bold text-sm text-gray-900 truncate text-right">
                          {match.away_team_name}
                        </span>
                        {match.away_team_logo ? (
                          <img
                            src={match.away_team_logo}
                            alt={match.away_team_name}
                            className="w-11 h-11 rounded-xl object-cover shadow-sm bg-white flex-shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0">
                            {match.away_team_name?.[0]}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer: Hora, sede, CTA */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatMatchTime(match.match_date)}
                        </span>
                        {match.venue && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[140px]">{match.venue}</span>
                          </span>
                        )}
                      </div>

                      <span className="flex items-center gap-1 text-green-600 text-xs font-semibold group-hover:gap-2 transition-all">
                        <Eye className="w-3.5 h-3.5" />
                        Ver partido
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Vista Torneos (Todos | Fútbol | …) ─────────────────────────────── */}
        {!isMatchesTab && (
          <div className="space-y-8">
            {/* Filtro de estado */}
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSelectedStatus('')}
                  className={`
                    px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border
                    ${selectedStatus === ''
                      ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  Todos
                </button>
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`
                      px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border
                      ${selectedStatus === status.value
                        ? `bg-${status.color}-600 text-white border-${status.color}-600 shadow-sm`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Banner entre filtros y cards */}
            {tournamentBanners && tournamentBanners.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournamentBanners.slice(0, 2).map((banner: any) => (
                  <BannerAd
                    key={banner.id}
                    id={banner.id}
                    image={banner.image}
                    title={banner.title}
                    link_url={banner.link_url}
                    description={banner.description}
                    variant="horizontal"
                  />
                ))}
              </div>
            )}

            {loadingTournaments ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <TournamentCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredTournaments?.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {searchQuery ? 'No se encontraron torneos' : 'No hay torneos activos'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchQuery 
                    ? `No hay resultados para "${searchQuery}". Intenta con otro término.`
                    : 'Los próximos torneos aparecerán aquí una vez que sean publicados.'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-green-600 text-sm font-medium hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredTournaments?.map((tournament: any) => (
                  <Link
                    key={tournament.id}
                    to={`/sports/tournaments/${tournament.slug}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all group flex flex-col"
                  >
                    {/* Banner / Header */}
                    <div className="h-36 relative overflow-hidden">
                      {tournament.banner ? (
                        <img
                          src={tournament.banner}
                          alt={tournament.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className={`w-full h-full ${sportTypeColors[tournament.sport_type]} flex items-center justify-center`}>
                          <div className="text-center">
                            {getSportIcon(tournament.sport_type)}
                            <p className="text-white/80 text-xs mt-2 font-medium uppercase tracking-wider">
                            {getSportIcon(tournament.sport_type as SportType)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Overlay gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                        {getSportIcon(tournament.sport_type as SportType)}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border shadow-sm backdrop-blur-sm ${getStatusColor(tournament.status)}`}>
                          {getStatusLabel(tournament.status)}
                        </span>
                      </div>

                      {/* Logo del torneo */}
                      {tournament.logo && (
                        <div className="absolute -bottom-5 right-4">
                          <img
                            src={tournament.logo}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover border-3 border-white shadow-lg bg-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 pt-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors text-lg leading-tight line-clamp-2">
                        {tournament.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {tournament.description || 'Sin descripción'}
                      </p>

                      {/* Stats row */}
                      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(tournament.start_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {tournament.teams_count} / {tournament.max_teams}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          {tournament.min_players_per_team}-{tournament.max_players_per_team} jug.
                        </span>
                      </div>

                      {/* Progress bar de equipos */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>Cupos ocupados</span>
                          <span className="font-medium text-gray-600">
                            {Math.round((tournament.teams_count / tournament.max_teams) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              tournament.teams_count >= tournament.max_teams 
                                ? 'bg-red-500' 
                                : tournament.teams_count >= tournament.max_teams * 0.8 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, (tournament.teams_count / tournament.max_teams) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {tournament.organization_name || 'Organización'}
                        </span>
                        <span className="flex items-center gap-1 text-green-600 text-xs font-semibold group-hover:gap-2 transition-all">
                          Ver torneo
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsList;
