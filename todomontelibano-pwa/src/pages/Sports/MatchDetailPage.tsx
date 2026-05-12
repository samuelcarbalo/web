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
  yellow_card: <Shield className="w-4 h-4 text-yellow-500" />,
  red_card: <Shield className="w-4 h-4 text-red-600" />,
  substitution: <UserPlus className="w-4 h-4 text-blue-500" />,
  injury: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  other: <Activity className="w-4 h-4 text-gray-500" />,
};

const EVENT_LABELS: Record<string, string> = {
  goal: 'Gol',
  yellow_card: 'Tarjeta Amarilla',
  red_card: 'Tarjeta Roja',
  substitution: 'Sustitución',
  injury: 'Lesión',
  other: 'Otro',
};

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

// Constantes del cronómetro
const MATCH_DURATION_MINUTES = 90;
const HALF_TIME_MINUTES = 45;
const EXTRA_TIME_MINUTES = 120;

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
      // No hay período activo, mostrar último completado o 0
      const lastCompleted = periods.filter((p: any) => p.is_completed).pop();
      if (lastCompleted) {
        setMatchTimer(lastCompleted.elapsed_minutes);
      }
      setIsTimerRunning(false);
      return;
    }

    // Período activo encontrado
    const elapsedMinutes = activePeriod.elapsed_minutes || 0;
    setMatchTimer(elapsedMinutes);

    // Si está pausado, no iniciar intervalo
    if (activePeriod.paused_at) {
      setIsTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Iniciar intervalo local
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
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Partido no encontrado</p>
          <Link to="/sports/tournaments" className="text-green-600 hover:underline mt-2 inline-block">
            Volver a torneos
          </Link>
        </div>
      </div>
    );
  }

  const dateInfo = formatDate(match.match_date);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/sports/tournaments/${match.tournament_slug}`}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Volver al torneo
              </Link>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2">
                {isScheduled && (
                  <button
                    onClick={handleStartMatch}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar partido
                  </button>
                )}
                <button
                  onClick={openEditModal}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjeta principal del partido */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Info del torneo y estado */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">{match.tournament_name}</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[match.status]}`}>
              {STATUS_LABELS[match.status]}
            </span>
          </div>

          {/* Marcador y equipos */}
          <div className="p-8">
            <div className="flex items-center justify-between gap-4">
              {/* Equipo local */}
              <div className="flex-1 text-center">
                <div className="flex flex-col items-center">
                  {match.home_team_detail?.logo ? (
                    <img
                      src={match.home_team_detail?.logo}
                      alt={match.home_team_detail?.name}
                      className="w-20 h-20 rounded-full object-cover mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl mb-3">
                      {match.home_team_detail?.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-gray-900">{match.home_team_detail?.name}</h2>
                </div>
              </div>

              {/* Marcador central */}
              <div className="text-center px-8">
                {isLive || isFinished ? (
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-gray-900 tabular-nums">
                      {match.home_score ?? 0}
                    </div>
                    <span className="text-3xl font-bold text-gray-400">-</span>
                    <div className="text-5xl font-bold text-gray-900 tabular-nums">
                      {match.away_score ?? 0}
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-400">VS</div>
                )}
                
                {/* Cronómetro del partido */}
                {isLive && (
                  <div className="mt-3">
                    <div className="flex items-center justify-center gap-2 text-red-600 font-bold animate-pulse">
                      <Timer className="w-5 h-5" />
                      <span className="text-2xl tabular-nums">{formatTimer(matchTimer)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {activePeriod ? activePeriod.name : (lastCompletedPeriod ? `${lastCompletedPeriod.name} finalizado` : getMatchPeriod(matchTimer))}
                      {isPaused && <span className="ml-1 text-yellow-600 font-bold">(PAUSADO)</span>}
                    </p>
                  </div>
                )}
              </div>

              {/* Equipo visitante */}
              <div className="flex-1 text-center">
                <div className="flex flex-col items-center">
                  {match.away_team_detail?.logo ? (
                    <img
                      src={match.away_team_detail?.logo}
                      alt={match.away_team_detail?.name}
                      className="w-20 h-20 rounded-full object-cover mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl mb-3">
                      {match.away_team_detail?.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-gray-900">{match.away_team_detail?.name}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Info adicional */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {dateInfo.full}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {dateInfo.time}
              </span>
              {match.venue && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {match.venue}
                  {match.stadium && ` - ${match.stadium}`}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Jornada {match.match_week} • Ronda {match.match_week}
              </span>
            </div>
            {match.notes && (
              <p className="text-center text-gray-500 text-sm mt-2">{match.notes}</p>
            )}
          </div>
        </div>

        {/* CONTROLES DE PERÍODOS (solo para owner y partido en vivo) */}
        {isLive && isOwner && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-900">
                  {activePeriod ? activePeriod.name : 'Control del Partido'}
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Minuto: <span className="font-bold text-green-600">{matchTimer}'</span>
                  {isPaused && <span className="ml-1 text-yellow-600 font-bold">(PAUSADO)</span>}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {/* Iniciar 1T */}
              {!activePeriod && !lastCompletedPeriod && (
                <button
                  onClick={handleStartFirstHalf}
                  disabled={startPeriodMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {startPeriodMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar 1er Tiempo'}
                </button>
              )}
              
              {/* Pausar */}
              {activePeriod && !isPaused && (
                <button
                  onClick={handlePause}
                  disabled={pausePeriodMutation.isPending}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  {pausePeriodMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pausar'}
                </button>
              )}
              
              {/* Reanudar */}
              {activePeriod && isPaused && (
                <button
                  onClick={handleResume}
                  disabled={resumePeriodMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {resumePeriodMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reanudar'}
                </button>
              )}
              
              {/* Finalizar período */}
              {activePeriod && (
                <button
                  onClick={handleEndHalf}
                  disabled={endPeriodMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  {endPeriodMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Finalizar ${activePeriod.name}`}
                </button>
              )}
              
              {/* Iniciar 2T */}
              {lastCompletedPeriod?.period_number === 1 && !activePeriod && (
                <button
                  onClick={handleStartSecondHalf}
                  disabled={startPeriodMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {startPeriodMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar 2do Tiempo'}
                </button>
              )}
              
              {/* Finalizar partido */}
              {lastCompletedPeriod?.period_number === 2 && !activePeriod && (
                <button
                  onClick={openFinishModal}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Finalizar Partido
                </button>
              )}
            </div>

            {/* Timeline de períodos */}
            {periods && periods.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex gap-2 overflow-x-auto">
                  {periods.map((period: any) => (
                    <div
                      key={period.id}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                        period.is_active
                          ? 'bg-green-100 text-green-700'
                          : period.is_completed
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {period.name}: {period.elapsed_minutes}'
                      {period.paused_at && <span className="ml-1">⏸</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Acciones para partido en vivo (eventos) */}
        {isLive && isOwner && activePeriod && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-900">Acciones del partido</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Minuto actual: <span className="font-bold text-green-600">{matchTimer}'</span>
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => openEventModal(match.home_team)}
                className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                + Evento {match.home_team_detail?.name}
              </button>
              <button
                onClick={() => openEventModal(match.away_team)}
                className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                + Evento {match.away_team_detail?.name}
              </button>
            </div>
          </div>
        )}
        
        {sportType && 
          <MatchLineupSection 
            match={{ ...match, sport_type: sportType }} 
            playerCards={playerCards}
            isPlayerSentOff={isPlayerSentOff}
            getPlayerYellowCards={getPlayerYellowCards}
            isLive={isLive}
            matchTimer={matchTimer}
          />
        }
        
        {/* Timeline de eventos */}
        {match.events && match.events.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Eventos del partido</h3>
            <div className="space-y-4">
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

                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-4 ${
                      event.team === match.home_team ? 'flex-row' : 'flex-row-reverse text-right'
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {eventIcon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {event.minute}'
                        </span>
                        <span className={`text-sm font-medium ${
                          isSecondYellow || hasDirectRed ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {eventLabel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className={`font-semibold ${
                          isSecondYellow || hasDirectRed ? 'text-red-600 line-through' : ''
                        }`}>
                          {event.player_name}
                        </span>
                        {' - '}
                        <span className="text-gray-500">{event.team_name}</span>
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {match.events?.length === 0 && (isLive || isFinished) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-8">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay eventos registrados en este partido</p>
          </div>
        )}
      </div>

      {/* Modal: Editar partido */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Editar Partido</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={editData.match_date}
                  onChange={(e) => setEditData(prev => ({ ...prev, match_date: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
                  <input
                    type="text"
                    value={editData.venue}
                    onChange={(e) => setEditData(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estadio</label>
                  <input
                    type="text"
                    value={editData.stadium}
                    onChange={(e) => setEditData(prev => ({ ...prev, stadium: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
                  <input
                    type="number"
                    min={1}
                    value={editData.match_week}
                    onChange={(e) => setEditData(prev => ({ ...prev, match_week: parseInt(e.target.value) || 1 }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ronda</label>
                  <input
                    type="number"
                    min={1}
                    value={editData.round_number}
                    onChange={(e) => setEditData(prev => ({ ...prev, round_number: parseInt(e.target.value) || 1 }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Finalizar partido</h2>
            <p className="text-sm text-gray-500 mb-5">
              {match.home_team_detail?.name} vs {match.away_team_detail?.name}
            </p>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500 mb-1 truncate">{match.home_team_detail?.name}</p>
                <input
                  type="number"
                  min={0}
                  value={scoreData.home_score}
                  onChange={(e) => setScoreData(prev => ({ ...prev, home_score: parseInt(e.target.value) || 0 }))}
                  className="w-full text-center text-3xl font-bold border-2 border-gray-200 rounded-lg py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <span className="text-2xl font-bold text-gray-400">-</span>
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500 mb-1 truncate">{match.away_team_detail?.name}</p>
                <input
                  type="number"
                  min={0}
                  value={scoreData.away_score}
                  onChange={(e) => setScoreData(prev => ({ ...prev, away_score: parseInt(e.target.value) || 0 }))}
                  className="w-full text-center text-3xl font-bold border-2 border-gray-200 rounded-lg py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFinishMatch}
                disabled={finishMutation.isPending}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {finishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                Confirmar
              </button>
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Agregar evento</h2>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de evento</label>
                  <select
                    value={eventData.event_type}
                    onChange={(e) => setEventData(prev => ({ ...prev, event_type: e.target.value as MatchEvent['event_type'] }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  >
                    {Object.entries(EVENT_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minuto
                    {isLive && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        (Auto: {matchTimer}')
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
                      className="flex-1 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                    {isLive && (
                      <button
                        type="button"
                        onClick={() => setEventData(prev => ({ ...prev, minute: matchTimer }))}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium whitespace-nowrap"
                      >
                        Usar actual
                      </button>
                    )}
                  </div>
                </div>

                {/* Jugador con autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jugador</label>
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
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="Buscar por nombre o número..."
                    autoComplete="off"
                  />

                  {/* Indicador de jugador seleccionado */}
                  {selectedPlayerName && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      {selectedPlayerName}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlayerName('');
                          setPlayerSearch('');
                          setEventData(prev => ({ ...prev, player: '' }));
                        }}
                        className="ml-auto text-green-600 hover:text-green-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Dropdown */}
                  {showPlayerDropdown && !selectedPlayerName && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredPlayers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No se encontraron jugadores
                        </div>
                      ) : (
                        filteredPlayers
                          .filter((player: any) => !isPlayerSentOff(player.id))  // ← AQUÍ VA EL FILTRO
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
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-left transition-colors"
                            >
                              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                                {player.jersey_number}
                              </span>
                              <span className="text-sm text-gray-800">{player.full_name}</span>
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={eventData.description}
                    onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                    rows={2}
                    placeholder="Detalles adicionales..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={addEventMutation.isPending}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {addEventMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      : 'Agregar evento'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar partido?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción no se puede deshacer. El partido será eliminado permanentemente.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Eliminar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
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