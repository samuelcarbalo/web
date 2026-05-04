import React, { useState } from 'react';
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
  Plus,
  Minus,
  Loader2,
  Flag,
  AlertTriangle,
  UserPlus,
  Activity,
  Shield,
  Timer,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  useMatch,
  useTournament,
  useUpdateMatch,
  useDeleteMatch,
  useStartMatch,
  useFinishMatch,
  useUpdateScore,
  useAddMatchEvent,
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

const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: match, isLoading } = useMatch(id || '');
  const { data: tournament } = useTournament(match?.tournament_slug || '');
  const sportType = tournament?.sport_type || 'football';
  
  const updateMutation = useUpdateMatch();
  const deleteMutation = useDeleteMatch();
  const startMutation = useStartMatch();
  const finishMutation = useFinishMatch();
  const updateScoreMutation = useUpdateScore();
  const addEventMutation = useAddMatchEvent();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
  const isLive = match?.status === 'live';
  const isScheduled = match?.status === 'scheduled';
  const isFinished = match?.status === 'finished';

  // Inicializar datos de edición cuando se abre el modal
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
    setEventData({
      event_type: 'goal',
      minute: 0,
      player: '',
      team: teamId,
      description: '',
    });
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
      startMutation.mutate(match.id);
    }
  };

  const handleFinishMatch = () => {
    if (!match) return;
    finishMutation.mutate(
      { id: match.id, data: scoreData },
      { onSuccess: () => setShowFinishModal(false) }
    );
  };

  const handleUpdateScore = (field: 'home_score' | 'away_score', increment: number) => {
    if (!match || !isLive) return;
    const newValue = Math.max(0, (match[field] ?? 0) + increment);
    updateScoreMutation.mutate({
      id: match.id,
      data: { [field]: newValue },
    });
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
                    {/* Controles de score para partido en vivo (solo owner) */}
                    {isLive && isOwner && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleUpdateScore('home_score', 1)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateScore('home_score', -1)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="text-5xl font-bold text-gray-900 tabular-nums">
                      {match.home_score ?? 0}
                    </div>
                    <span className="text-3xl font-bold text-gray-400">-</span>
                    <div className="text-5xl font-bold text-gray-900 tabular-nums">
                      {match.away_score ?? 0}
                    </div>
                    {isLive && isOwner && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleUpdateScore('away_score', 1)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateScore('away_score', -1)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-400">VS</div>
                )}
                {isLive && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-red-600 font-medium animate-pulse">
                    <Timer className="w-4 h-4" />
                    <span>En vivo</span>
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
                Jornada {match.match_week} • Ronda {match.round_number}
              </span>
            </div>
            {match.notes && (
              <p className="text-center text-gray-500 text-sm mt-2">{match.notes}</p>
            )}
          </div>
        </div>

        {/* Acciones para partido en vivo */}
        {isLive && isOwner && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Acciones del partido</h3>
              <button
                onClick={openFinishModal}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Square className="w-4 h-4 mr-2" />
                Finalizar partido
              </button>
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
        {sportType && <MatchLineupSection match={{ ...match, sport_type: sportType }} />}
        {/* Timeline de eventos */}
        {match.events && match.events.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Eventos del partido</h3>
            <div className="space-y-4">
              {match.events.map((event: MatchEvent) => (
                <div
                  key={event.id}
                  className={`flex items-start gap-4 ${
                    event.team === match.home_team ? 'flex-row' : 'flex-row-reverse text-right'
                  }`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {EVENT_ICONS[event.event_type] || EVENT_ICONS.other}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {event.minute}'
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {EVENT_LABELS[event.event_type] || event.event_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{event.player_name}</span>
                      {' - '}
                      <span className="text-gray-500">{event.team_name}</span>
                    </p>
                    {event.description && (
                      <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
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
      {showEventModal && (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Minuto</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={eventData.minute}
                  onChange={(e) => setEventData(prev => ({ ...prev, minute: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jugador</label>
                <input
                  type="text"
                  value={eventData.player}
                  onChange={(e) => setEventData(prev => ({ ...prev, player: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  placeholder="ID del jugador"
                />
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
                  {addEventMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Agregar evento'}
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
      )}

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