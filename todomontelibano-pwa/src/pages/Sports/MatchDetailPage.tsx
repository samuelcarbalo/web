import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Play,
  Square,
  Edit3,
  Trash2,
  Loader2,
  Flag,
  AlertTriangle,
  UserPlus,
  Activity,
  Shield,
  Timer,
  Pause,
  ChevronRight,
  Zap,
  Users,
  Target,
  Swords,
  History,
  Ban,
  ArrowUpRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  useMatch,
  useTournament,
  useUpdateMatch,
  useDeleteMatch,
  useStartMatch,
  useFinishMatch,
  useAddMatchEvent,
  usePlayers,
  useMatchPeriods,
  useStartPeriod,
  usePausePeriod,
  useResumePeriod,
  useEndPeriod,
} from '../../hooks/useSports';
import type { MatchEvent } from '../../types/sports';
import MatchLineupSection from './MatchLineupSection';

const EVENT_ICONS: Record<string, React.ReactNode> = {
  goal: <Trophy className="w-4 h-4 text-yellow-500" />,
  own_goal: <Target className="w-4 h-4 text-red-400" />,
  yellow_card: <Shield className="w-4 h-4 text-yellow-500" />,
  red_card: <Shield className="w-4 h-4 text-red-600" />,
  substitution_in: <UserPlus className="w-4 h-4 text-green-500" />,
  substitution_out: <ArrowUpRight className="w-4 h-4 text-blue-500" />,
  penalty_goal: <Target className="w-4 h-4 text-green-500" />,
  penalty_missed: <Ban className="w-4 h-4 text-red-400" />,
  assist: <Zap className="w-4 h-4 text-yellow-400" />,
  expelled: <Ban className="w-4 h-4 text-red-600" />,
  other: <Activity className="w-4 h-4 text-gray-500" />,
};

const EVENT_LABELS: Record<string, string> = {
  goal: 'Gol',
  own_goal: 'Autogol',
  yellow_card: 'Tarjeta Amarilla',
  red_card: 'Tarjeta Roja',
  substitution_in: 'Entra',
  substitution_out: 'Sale',
  penalty_goal: 'Gol de Penal',
  penalty_missed: 'Penal Fallado',
  assist: 'Asistencia',
  expelled: 'Expulsado',
  other: 'Otro',
};

const EVENT_COLORS: Record<string, string> = {
  goal: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  own_goal: 'bg-red-50 border-red-200 text-red-800',
  yellow_card: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  red_card: 'bg-red-50 border-red-200 text-red-800',
  substitution_in: 'bg-green-50 border-green-200 text-green-800',
  substitution_out: 'bg-blue-50 border-blue-200 text-blue-800',
  penalty_goal: 'bg-green-50 border-green-200 text-green-800',
  penalty_missed: 'bg-red-50 border-red-200 text-red-800',
  assist: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  expelled: 'bg-red-50 border-red-200 text-red-800',
  other: 'bg-gray-50 border-gray-200 text-gray-800',
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  scheduled: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    label: 'Programado',
    icon: <Calendar className="w-3.5 h-3.5" />
  },
  live: { 
    bg: 'bg-red-50', 
    text: 'text-red-700', 
    label: 'En vivo',
    icon: <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
  },
  finished: { 
    bg: 'bg-gray-100', 
    text: 'text-gray-600', 
    label: 'Finalizado',
    icon: <Trophy className="w-3.5 h-3.5" />
  },
  postponed: { 
    bg: 'bg-yellow-50', 
    text: 'text-yellow-700', 
    label: 'Aplazado',
    icon: <Clock className="w-3.5 h-3.5" />
  },
  cancelled: { 
    bg: 'bg-red-50', 
    text: 'text-red-500 line-through', 
    label: 'Cancelado',
    icon: <Ban className="w-3.5 h-3.5" />
  },
};

// Constantes del cronómetro
const MATCH_DURATION_MINUTES = 90;
const HALF_TIME_MINUTES = 45;
const EXTRA_TIME_MINUTES = 120;

// ─── Skeleton Components ──────────────────────────────────────────────────────
const MatchHeaderSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden animate-pulse">
    <div className="h-12 bg-gray-100" />
    <div className="p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="h-5 bg-gray-200 rounded w-32" />
        </div>
        <div className="h-12 bg-gray-200 rounded w-24" />
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="h-5 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
    <div className="h-16 bg-gray-100" />
  </div>
);

const TimelineSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded w-48" />
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-48" />
        </div>
      </div>
    ))}
  </div>
);

const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: match, isLoading } = useMatch(id || '');
  const { data: tournament } = useTournament(match?.tournament_slug || '');
  const { data: homePlayersData } = usePlayers(match?.home_team || '');
  const { data: awayPlayersData } = usePlayers(match?.away_team || '');
  const isLive = match?.status === 'live';
  const { data: periods } = useMatchPeriods(id || '', isLive);
  const sportType = tournament?.sport_type || 'football';

  const updateMutation = useUpdateMatch();
  const deleteMutation = useDeleteMatch();
  const startMutation = useStartMatch();
  const finishMutation = useFinishMatch();
  const addEventMutation = useAddMatchEvent();
  const startPeriodMutation = useStartPeriod();
  const pausePeriodMutation = usePausePeriod();
  const resumePeriodMutation = useResumePeriod();
  const endPeriodMutation = useEndPeriod();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);
  const [selectedPlayerName, setSelectedPlayerName] = useState('');

  // Estados del cronómetro
  const [matchTimer, setMatchTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [playerCards, setPlayerCards] = useState<Record<string, { yellow: number; red: boolean }>>({});

  // Sincronizar con eventos existentes del match
  useEffect(() => {
    if (!match?.events) return;

    const cards: Record<string, { yellow: number; red: boolean }> = {};

    match.events.forEach((event: MatchEvent) => {
      if (event.event_type === 'yellow_card') {
        cards[event.player] = {
          yellow: (cards[event.player]?.yellow || 0) + 1,
          red: cards[event.player]?.red || false,
        };
        if (cards[event.player].yellow >= 2) {
          cards[event.player].red = true;
        }
      }
      if (event.event_type === 'red_card') {
        cards[event.player] = { yellow: 0, red: true };
      }
    });

    setPlayerCards(cards);
  }, [match?.events]);

  const isPlayerSentOff = useCallback((playerId: string): boolean => {
    return playerCards[playerId]?.red === true;
  }, [playerCards]);

  const getPlayerYellowCards = useCallback((playerId: string): number => {
    return playerCards[playerId]?.yellow || 0;
  }, [playerCards]);

  const [showTimerControls, setShowTimerControls] = useState(false);

  const [editData, setEditData] = useState({
    match_date: '',
    venue: '',
    stadium: '',
    round_number: 1,
    match_week: 1,
    notes: '',
  });

  const [scoreData, setScoreData] = useState({
    home_score: 0,
    away_score: 0,
    home_runs: 0,
    away_runs: 0,
  });

  const [eventData, setEventData] = useState({
    event_type: 'goal' as MatchEvent['event_type'],
    minute: 0,
    player: '',
    team: '',
    description: '',
  });

  const isOwner = user?.role === 'manager' && user?.id === match?.posted_by;
  const isScheduled = match?.status === 'scheduled';
  const isFinished = match?.status === 'finished';

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sincronizar timer con períodos del backend
  useEffect(() => {
    if (!isLive || !periods) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsTimerRunning(false);
      return;
    }

    const activePeriod = periods.find((p: any) => p.is_active);

    if (!activePeriod) {
      const lastCompleted = periods.filter((p: any) => p.is_completed).pop();
      if (lastCompleted) {
        setMatchTimer(lastCompleted.elapsed_minutes);
      }
      setIsTimerRunning(false);
      return;
    }

    const elapsedMinutes = activePeriod.elapsed_minutes || 0;
    setMatchTimer(elapsedMinutes);

    if (activePeriod.paused_at) {
      setIsTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    const interval = setInterval(() => {
      setMatchTimer(prev => {
        const next = prev + 1;
        if (next >= EXTRA_TIME_MINUTES) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return EXTRA_TIME_MINUTES;
        }
        return next;
      });
    }, 60000);

    timerRef.current = interval;
    setIsTimerRunning(true);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLive, periods]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const interval = setInterval(() => {
      setMatchTimer(prev => {
        const next = prev + 1;
        if (next >= EXTRA_TIME_MINUTES) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return EXTRA_TIME_MINUTES;
        }
        return next;
      });
    }, 60000);

    timerRef.current = interval;
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
  };

  const resumeTimer = () => {
    startTimer();
  };

  const resetTimer = () => {
    pauseTimer();
    setMatchTimer(0);
  };

  const adjustTimer = (minutes: number) => {
    setMatchTimer(prev => Math.max(0, Math.min(EXTRA_TIME_MINUTES, prev + minutes)));
  };

  const setTimerToMinute = (minute: number) => {
    setMatchTimer(Math.max(0, Math.min(EXTRA_TIME_MINUTES, minute)));
  };

  const formatTimer = (minutes: number) => {
    if (minutes <= MATCH_DURATION_MINUTES) {
      return `${minutes}'`;
    } else {
      return `90+${minutes - MATCH_DURATION_MINUTES}'`;
    }
  };

  const getMatchPeriod = (minutes: number) => {
    if (minutes === 0) return 'Inicio';
    if (minutes < HALF_TIME_MINUTES) return '1er Tiempo';
    if (minutes === HALF_TIME_MINUTES) return 'Descanso';
    if (minutes < MATCH_DURATION_MINUTES) return '2do Tiempo';
    return 'Tiempo Extra';
  };

  // Helpers para períodos
  const activePeriod = periods?.find((p: any) => p.is_active);
  const lastCompletedPeriod = periods?.filter((p: any) => p.is_completed).pop();
  const isPaused = activePeriod?.paused_at !== null;

  const openEditModal = () => {
    if (!match) return;
    setEditData({
      match_date: match.match_date.slice(0, 16),
      venue: match.venue || '',
      stadium: match.stadium || '',
      round_number: match.round_number,
      match_week: match.match_week,
      notes: match.notes || '',
    });
    setShowEditModal(true);
  };

  const openFinishModal = () => {
    if (!match) return;
    setScoreData({
      home_score: match.home_score ?? 0,
      away_score: match.away_score ?? 0,
      home_runs: match.home_runs ?? 0,
      away_runs: match.away_runs ?? 0,
    });
    setShowFinishModal(true);
  };

  const openEventModal = (teamId: string) => {
    const currentMinute = isLive ? matchTimer : 0;
    setEventData({
      event_type: 'goal',
      minute: currentMinute,
      player: '',
      team: teamId,
      description: '',
    });
    setPlayerSearch('');
    setSelectedPlayerName('');
    setShowPlayerDropdown(false);
    setShowEventModal(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    updateMutation.mutate(
      { id: match.id, data: editData },
      { onSuccess: () => setShowEditModal(false) }
    );
  };

  const handleStartMatch = () => {
    if (!match) return;
    if (confirm('¿Iniciar este partido?')) {
      startMutation.mutate(match.id, {
        onSuccess: (data) => {
          if (data?.started_at) {
            const startedDate = new Date(data.started_at);
            const now = new Date();
            const elapsedMs = now.getTime() - startedDate.getTime();
            const elapsedMinutes = Math.floor(elapsedMs / 60000);
            setMatchTimer(Math.max(0, Math.min(EXTRA_TIME_MINUTES, elapsedMinutes)));
            startTimer();
          }
        }
      });
    }
  };

  // Handlers de períodos
  const handleStartFirstHalf = () => {
    if (!match) return;
    startPeriodMutation.mutate({
      matchId: match.id,
      data: { period_number: 1, name: '1er Tiempo' }
    });
  };

  const handleStartSecondHalf = () => {
    if (!match) return;
    startPeriodMutation.mutate({
      matchId: match.id,
      data: { period_number: 2, name: '2do Tiempo' }
    });
  };

  const handlePause = () => {
    if (!match) return;
    pausePeriodMutation.mutate(match.id);
  };

  const handleResume = () => {
    if (!match) return;
    resumePeriodMutation.mutate(match.id);
  };

  const handleEndHalf = () => {
    if (!match) return;
    endPeriodMutation.mutate(match.id);
  };

  const handleFinishMatch = () => {
    if (!match) return;
    pauseTimer();
    finishMutation.mutate(
      { id: match.id, data: scoreData },
      { onSuccess: () => setShowFinishModal(false) }
    );
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    addEventMutation.mutate(
      { id: match.id, data: eventData },
      { onSuccess: () => setShowEventModal(false) }
    );
  };

  const handleDelete = () => {
    if (!match) return;
    deleteMutation.mutate(match.id, {
      onSuccess: () => navigate(`/sports/tournaments/${match.tournament}`),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      short: date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MatchHeaderSkeleton />
          <div className="mt-6">
            <TimelineSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Swords className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Partido no encontrado</h2>
          <p className="text-gray-500 mb-6">El partido que buscas no existe o ha sido eliminado.</p>
          <Link 
            to="/sports/tournaments" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver a torneos
          </Link>
        </div>
      </div>
    );
  }

  const dateInfo = formatDate(match.match_date);
  const statusConfig = STATUS_CONFIG[match.status] || STATUS_CONFIG.scheduled;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header sticky */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link
              to={`/sports/tournaments/${match.tournament_slug}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <div className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">{match.tournament_name}</span>
            </Link>

            {/* Status pill en header */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>

            {isOwner && (
              <div className="flex items-center gap-1.5">
                {isScheduled && (
                  <button
                    onClick={handleStartMatch}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-semibold"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Iniciar
                  </button>
                )}
                <button
                  onClick={openEditModal}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Tarjeta principal del partido - REDISEÑADA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
          {/* Info del torneo */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">{match.tournament_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">Jornada {match.match_week}</span>
              <span className="text-white/30">·</span>
              <span className="text-white/60 text-xs">Ronda {match.round_number}</span>
            </div>
          </div>

          {/* Marcador y equipos - Layout mejorado */}
          <div className="p-6 md:p-10">
            <div className="flex items-center justify-between gap-4 md:gap-8">
              {/* Equipo local */}
              <div className="flex-1 flex flex-col items-center text-center">
                <Link 
                  to={`/sports/tournaments/${match.tournament_slug}/teams/${match.home_team_detail?.slug}`}
                  className="group flex flex-col items-center"
                >
                  {match.home_team_detail?.logo ? (
                    <img
                      src={match.home_team_detail.logo}
                      alt={match.home_team_detail.name}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-md mb-3 group-hover:scale-105 transition-transform duration-300 bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl mb-3 shadow-md">
                      {match.home_team_detail?.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h2 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                    {match.home_team_detail?.name}
                  </h2>
                </Link>
              </div>

              {/* Marcador central - MÁS IMPACTANTE */}
              <div className="flex-shrink-0 text-center px-4 md:px-8">
                {isLive || isFinished ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 md:gap-5">
                      <span className={`text-5xl md:text-7xl font-black tabular-nums tracking-tight ${
                        (match.home_score ?? 0) > (match.away_score ?? 0) ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {match.home_score ?? 0}
                      </span>
                      <span className="text-3xl md:text-5xl font-light text-gray-300">—</span>
                      <span className={`text-5xl md:text-7xl font-black tabular-nums tracking-tight ${
                        (match.away_score ?? 0) > (match.home_score ?? 0) ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {match.away_score ?? 0}
                      </span>
                    </div>

                    {/* Marcador de carreras para softbol */}
                    {sportType === 'softball' && (match.home_runs != null || match.away_runs != null) && (
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
                        <span>C: {match.home_runs ?? 0}</span>
                        <span className="text-gray-300">|</span>
                        <span>C: {match.away_runs ?? 0}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-4xl md:text-5xl font-black text-gray-200 tracking-wider">VS</span>
                    <p className="text-xs text-gray-400 font-medium">{dateInfo.time}</p>
                  </div>
                )}

                {/* Cronómetro del partido */}
                {isLive && (
                  <div className="mt-3">
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold">
                      <Timer className="w-5 h-5 animate-pulse" />
                      <span className="text-2xl tabular-nums">{formatTimer(matchTimer)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">
                      {activePeriod ? activePeriod.name : (lastCompletedPeriod ? `${lastCompletedPeriod.name} finalizado` : getMatchPeriod(matchTimer))}
                      {isPaused && <span className="ml-1.5 text-amber-600 font-bold">(PAUSADO)</span>}
                    </p>
                  </div>
                )}
              </div>

              {/* Equipo visitante */}
              <div className="flex-1 flex flex-col items-center text-center">
                <Link 
                  to={`/sports/tournaments/${match.tournament_slug}/teams/${match.away_team_detail?.slug}`}
                  className="group flex flex-col items-center"
                >
                  {match.away_team_detail?.logo ? (
                    <img
                      src={match.away_team_detail.logo}
                      alt={match.away_team_detail.name}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-md mb-3 group-hover:scale-105 transition-transform duration-300 bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl mb-3 shadow-md">
                      {match.away_team_detail?.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h2 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                    {match.away_team_detail?.name}
                  </h2>
                </Link>
              </div>
            </div>
          </div>

          {/* Info adicional - Rediseñada como pills */}
          <div className="bg-gray-50/80 border-t border-gray-100 px-6 py-4">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-gray-600">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200/60">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium">{dateInfo.full}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200/60">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium">{dateInfo.time}</span>
              </div>
              {match.venue && (
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200/60">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium">{match.venue}{match.stadium && ` — ${match.stadium}`}</span>
                </div>
              )}
              {match.notes && (
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium text-amber-700">{match.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTROLES DE PERÍODOS - Rediseñados */}
        {isLive && isOwner && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {activePeriod ? activePeriod.name : 'Control del Partido'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Minuto <span className="font-bold text-green-600">{matchTimer}'</span>
                    {isPaused && <span className="ml-1.5 text-amber-600 font-bold">(PAUSADO)</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 flex gap-2 flex-wrap">
              {!activePeriod && !lastCompletedPeriod && (
                <button
                  onClick={handleStartFirstHalf}
                  disabled={startPeriodMutation.isPending}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm font-semibold flex items-center gap-2 shadow-sm shadow-green-200 transition-all hover:shadow-md"
                >
                  <Play className="w-4 h-4" />
                  {startPeriodMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar 1er Tiempo'}
                </button>
              )}

              {activePeriod && !isPaused && (
                <button
                  onClick={handlePause}
                  disabled={pausePeriodMutation.isPending}
                  className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 text-sm font-semibold flex items-center gap-2 shadow-sm shadow-amber-200 transition-all hover:shadow-md"
                >
                  <Pause className="w-4 h-4" />
                  {pausePeriodMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pausar'}
                </button>
              )}

              {activePeriod && isPaused && (
                <button
                  onClick={handleResume}
                  disabled={resumePeriodMutation.isPending}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm font-semibold flex items-center gap-2 shadow-sm shadow-green-200 transition-all hover:shadow-md"
                >
                  <Play className="w-4 h-4" />
                  {resumePeriodMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reanudar'}
                </button>
              )}

              {activePeriod && (
                <button
                  onClick={handleEndHalf}
                  disabled={endPeriodMutation.isPending}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold flex items-center gap-2 shadow-sm shadow-blue-200 transition-all hover:shadow-md"
                >
                  <Square className="w-4 h-4" />
                  {endPeriodMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Finalizar ${activePeriod.name}`}
                </button>
              )}

              {lastCompletedPeriod?.period_number === 1 && !activePeriod && (
                <button
                  onClick={handleStartSecondHalf}
                  disabled={startPeriodMutation.isPending}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm font-semibold flex items-center gap-2 shadow-sm shadow-green-200 transition-all hover:shadow-md"
                >
                  <Play className="w-4 h-4" />
                  {startPeriodMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar 2do Tiempo'}
                </button>
              )}

              {lastCompletedPeriod?.period_number === 2 && !activePeriod && (
                <button
                  onClick={openFinishModal}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-semibold flex items-center gap-2 shadow-sm shadow-red-200 transition-all hover:shadow-md"
                >
                  <Trophy className="w-4 h-4" />
                  Finalizar Partido
                </button>
              )}
            </div>

            {/* Timeline de períodos */}
            {periods && periods.length > 0 && (
              <div className="px-4 pb-4">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {periods.map((period: any) => (
                    <div
                      key={period.id}
                      className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
                        period.is_active
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : period.is_completed
                          ? 'bg-gray-50 border-gray-200 text-gray-600'
                          : 'bg-blue-50 border-blue-200 text-blue-600'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {period.name}: {period.elapsed_minutes}'
                      {period.paused_at && <Pause className="w-3 h-3 ml-1" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Acciones para partido en vivo */}
        {isLive && isOwner && activePeriod && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Registrar evento</h3>
                  <span className="text-xs text-gray-500">Minuto actual: <span className="font-bold text-green-600">{matchTimer}'</span></span>
                </div>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => openEventModal(match.home_team)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl transition-all border border-gray-200 hover:border-blue-200 text-sm font-semibold"
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  {match.home_team_detail?.logo ? (
                    <img src={match.home_team_detail.logo} alt="" className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <span className="text-xs font-bold">{match.home_team_detail?.name?.slice(0, 2)}</span>
                  )}
                </div>
                <span className="truncate">{match.home_team_detail?.name}</span>
              </button>
              <button
                onClick={() => openEventModal(match.away_team)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl transition-all border border-gray-200 hover:border-blue-200 text-sm font-semibold"
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  {match.away_team_detail?.logo ? (
                    <img src={match.away_team_detail.logo} alt="" className="w-6 h-6 rounded object-cover" />
                  ) : (
                    <span className="text-xs font-bold">{match.away_team_detail?.name?.slice(0, 2)}</span>
                  )}
                </div>
                <span className="truncate">{match.away_team_detail?.name}</span>
              </button>
            </div>
          </div>
        )}

        {/* Alineaciones */}
        {sportType && (
          <MatchLineupSection 
            match={{ ...match, sport_type: sportType }} 
            playerCards={playerCards}
            isPlayerSentOff={isPlayerSentOff}
            getPlayerYellowCards={getPlayerYellowCards}
            isLive={isLive}
            matchTimer={matchTimer}
          />
        )}

        {/* Timeline de eventos - REDISEÑADO */}
        {match.events && match.events.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <History className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Cronología del partido</h3>
              <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                {match.events.length} eventos
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {match.events.map((event: MatchEvent) => {
                const playerYellowEvents = match.events.filter(
                  (e: MatchEvent) => e.player === event.player && e.event_type === 'yellow_card'
                );
                const isSecondYellow = event.event_type === 'yellow_card' && 
                  playerYellowEvents.length >= 2 && 
                  playerYellowEvents[playerYellowEvents.length - 1].id === event.id;
                const hasDirectRed = event.event_type === 'red_card';
                const eventLabel = isSecondYellow 
                  ? 'Doble Amarilla → Roja' 
                  : (EVENT_LABELS[event.event_type] || event.event_type);
                const eventIcon = isSecondYellow 
                  ? <Shield className="w-4 h-4 text-red-600" />
                  : (EVENT_ICONS[event.event_type] || EVENT_ICONS.other);
                const isHomeEvent = event.team === match.home_team;

                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-4 p-4 md:px-6 hover:bg-gray-50/50 transition-colors ${
                      isHomeEvent ? '' : 'flex-row-reverse'
                    }`}
                  >
                    {/* Icono con color */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
                      EVENT_COLORS[event.event_type] || EVENT_COLORS.other
                    }`}>
                      {eventIcon}
                    </div>

                    <div className={`flex-1 min-w-0 ${isHomeEvent ? '' : 'text-right'}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isHomeEvent ? '' : 'flex-row-reverse'}`}>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {event.minute}'
                        </span>
                        <span className={`text-sm font-bold ${
                          isSecondYellow || hasDirectRed ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {eventLabel}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700">
                        <span className={`font-semibold ${
                          isSecondYellow || hasDirectRed ? 'text-red-600 line-through' : 'text-gray-900'
                        }`}>
                          {event.player_name}
                        </span>
                        <span className="text-gray-400 mx-1">·</span>
                        <span className="text-gray-500 text-xs">{event.team_name}</span>
                      </p>

                      {event.description && (
                        <p className="text-xs text-gray-400 mt-1.5 bg-gray-50 px-2 py-1 rounded-lg inline-block">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {match.events?.length === 0 && (isLive || isFinished) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-gray-300" />
            </div>
            <h4 className="text-gray-900 font-semibold mb-1">Sin eventos registrados</h4>
            <p className="text-gray-500 text-sm">Los goles, tarjetas y sustituciones aparecerán aquí.</p>
          </div>
        )}
      </div>

      {/* ─── MODALES REDISEÑADOS ───────────────────────────────────────────── */}

      {/* Modal: Editar partido */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Editar Partido</h2>
                <p className="text-sm text-gray-500">Modifica los detalles del encuentro</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={editData.match_date}
                  onChange={(e) => setEditData(prev => ({ ...prev, match_date: e.target.value }))}
                  className="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500/20 px-4 py-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lugar</label>
                  <input
                    type="text"
                    value={editData.venue}
                    onChange={(e) => setEditData(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500/20 px-4 py-2.5"
                    placeholder="Ej: Estadio Municipal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Estadio</label>
                  <input
                    type="text"
                    value={editData.stadium}
                    onChange={(e) => setEditData(prev => ({ ...prev, stadium: e.target.value }))}
                    className="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500/20 px-4 py-2.5"
                    placeholder="Ej: Cancha Principal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jornada</label>
                  <input
                    type="number"
                    min={1}
                    value={editData.match_week}
                    onChange={(e) => setEditData(prev => ({ ...prev, match_week: parseInt(e.target.value) || 1 }))}
                    className="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500/20 px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ronda</label>
                  <input
                    type="number"
                    min={1}
                    value={editData.round_number}
                    onChange={(e) => setEditData(prev => ({ ...prev, round_number: parseInt(e.target.value) || 1 }))}
                    className="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500/20 px-4 py-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500/20 px-4 py-2.5"
                  rows={2}
                  placeholder="Información adicional..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold transition-colors"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Finalizar partido */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Finalizar partido</h2>
                <p className="text-sm text-gray-500">
                  {match.home_team_detail?.name} vs {match.away_team_detail?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 bg-gray-50 rounded-xl p-4">
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500 mb-2 font-medium truncate">{match.home_team_detail?.name}</p>
                <input
                  type="number"
                  min={0}
                  value={scoreData.home_score}
                  onChange={(e) => setScoreData(prev => ({ ...prev, home_score: parseInt(e.target.value) || 0 }))}
                  className="w-full text-center text-4xl font-black border-2 border-gray-200 rounded-xl py-3 focus:border-green-500 focus:ring-green-500/20 bg-white"
                />
              </div>
              <span className="text-2xl font-bold text-gray-300">—</span>
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500 mb-2 font-medium truncate">{match.away_team_detail?.name}</p>
                <input
                  type="number"
                  min={0}
                  value={scoreData.away_score}
                  onChange={(e) => setScoreData(prev => ({ ...prev, away_score: parseInt(e.target.value) || 0 }))}
                  className="w-full text-center text-4xl font-black border-2 border-gray-200 rounded-xl py-3 focus:border-green-500 focus:ring-green-500/20 bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFinishMatch}
                disabled={finishMutation.isPending}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {finishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                Confirmar resultado
              </button>
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Agregar evento */}
      {showEventModal && (() => {
        const isHomeTeam = eventData.team === match.home_team;
        const players = (isHomeTeam ? homePlayersData : awayPlayersData)?.results ?? [];

        const filteredPlayers = playerSearch.trim().length > 0
          ? players.filter((p: any) =>
              p.full_name?.toLowerCase().includes(playerSearch.toLowerCase()) ||
              String(p.jersey_number).includes(playerSearch)
            )
          : players;

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Registrar evento</h2>
                  <p className="text-sm text-gray-500">{isHomeTeam ? match.home_team_detail?.name : match.away_team_detail?.name}</p>
                </div>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de evento</label>
                  <select
                    value={eventData.event_type}
                    onChange={(e) => setEventData(prev => ({ ...prev, event_type: e.target.value as MatchEvent['event_type'] }))}
                    className="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500/20 px-4 py-2.5"
                  >
                    {Object.entries(EVENT_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Minuto
                    {isLive && (
                      <span className="ml-2 text-xs text-green-600 font-normal bg-green-50 px-2 py-0.5 rounded-full">
                        Auto: {matchTimer}'
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={eventData.minute}
                      onChange={(e) => setEventData(prev => ({ ...prev, minute: parseInt(e.target.value) || 0 }))}
                      className="flex-1 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500/20 px-4 py-2.5"
                    />
                    {isLive && (
                      <button
                        type="button"
                        onClick={() => setEventData(prev => ({ ...prev, minute: matchTimer }))}
                        className="px-4 py-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 text-sm font-semibold whitespace-nowrap transition-colors"
                      >
                        Usar actual
                      </button>
                    )}
                  </div>
                </div>

                {/* Jugador con autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jugador</label>
                  <input
                    type="text"
                    value={playerSearch}
                    onChange={(e) => {
                      setPlayerSearch(e.target.value);
                      setSelectedPlayerName('');
                      setEventData(prev => ({ ...prev, player: '' }));
                      setShowPlayerDropdown(true);
                    }}
                    onFocus={() => setShowPlayerDropdown(true)}
                    className="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500/20 px-4 py-2.5"
                    placeholder="Buscar por nombre o número..."
                    autoComplete="off"
                  />

                  {selectedPlayerName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="font-medium">{selectedPlayerName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlayerName('');
                          setPlayerSearch('');
                          setEventData(prev => ({ ...prev, player: '' }));
                        }}
                        className="ml-auto text-green-600 hover:text-green-800 font-bold w-6 h-6 flex items-center justify-center rounded-lg hover:bg-green-100 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {showPlayerDropdown && !selectedPlayerName && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                      {filteredPlayers.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-gray-500 text-center">
                          No se encontraron jugadores
                        </div>
                      ) : (
                        filteredPlayers
                          .filter((player: any) => !isPlayerSentOff(player.id))
                          .map((player: any) => (
                            <button
                              key={player.id}
                              type="button"
                              onClick={() => {
                                setEventData(prev => ({ ...prev, player: player.id }));
                                setSelectedPlayerName(`#${player.jersey_number} ${player.full_name}`);
                                setPlayerSearch(`#${player.jersey_number} ${player.full_name}`);
                                setShowPlayerDropdown(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-left transition-colors"
                            >
                              <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                                {player.jersey_number}
                              </span>
                              <span className="text-sm font-medium text-gray-800">{player.full_name}</span>
                              <span className="ml-auto text-xs text-gray-400">{player.position_display}</span>
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                  <textarea
                    value={eventData.description}
                    onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500/20 px-4 py-2.5"
                    rows={2}
                    placeholder="Detalles adicionales..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={addEventMutation.isPending}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold transition-colors"
                  >
                    {addEventMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      : 'Agregar evento'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal: Confirmar eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">¿Eliminar partido?</h2>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-6">
              <p className="text-sm text-red-700 font-medium">
                {match.home_team_detail?.name} vs {match.away_team_detail?.name}
              </p>
              <p className="text-xs text-red-500 mt-0.5">{dateInfo.full} · {dateInfo.time}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-semibold transition-colors"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Eliminar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetailPage;
