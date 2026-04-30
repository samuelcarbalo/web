import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Clock,
  MapPin,
  Trophy,
  Edit3,
  Save,
  X,
  Loader2,
  Activity,
  Calendar,
  Users,
  Shield,
  Swords,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  useMatch,
  useTournament,
  useUpdateScore,
  useFinishMatch,
} from '../../hooks/useSports';

const MatchLivePage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuthStore();

  const { data: match, isLoading: loadingMatch } = useMatch(matchId || '');
  const { data: tournament } = useTournament(match?.tournament || '');

  const updateScoreMutation = useUpdateScore();
  const finishMutation = useFinishMatch();

  const [editingScore, setEditingScore] = useState(false);
  const [scoreForm, setScoreForm] = useState({
    home_score: 0,
    away_score: 0,
    home_runs: null as number | null,
    away_runs: null as number | null,
  });

  const isOwner = user?.role === 'manager' && user?.id === tournament?.posted_by;
  const isSoftball = tournament?.sport_type === 'softball';

  if (loadingMatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Partido no encontrado</h2>
          <Link to="/sports" className="text-green-600 mt-4 inline-block">
            ← Ver torneos
          </Link>
        </div>
      </div>
    );
  }

  const handleEditScore = () => {
    setScoreForm({
      home_score: match.home_score ?? 0,
      away_score: match.away_score ?? 0,
      home_runs: match.home_runs ?? null,
      away_runs: match.away_runs ?? null,
    });
    setEditingScore(true);
  };

  const handleSaveScore = () => {
    updateScoreMutation.mutate(
      {
        matchId: match.id,
        data: {
          home_score: scoreForm.home_score,
          away_score: scoreForm.away_score,
          ...(isSoftball && {
            home_runs: scoreForm.home_runs,
            away_runs: scoreForm.away_runs,
          }),
        },
      },
      {
        onSuccess: () => setEditingScore(false),
      }
    );
  };

  const handleFinishMatch = () => {
    if (confirm('¿Finalizar este partido? El marcador quedará definitivo.')) {
      finishMutation.mutate({
        matchId: match.id,
        data: {
          home_score: match.home_score ?? 0,
          away_score: match.away_score ?? 0,
          ...(isSoftball && {
            home_runs: match.home_runs,
            away_runs: match.away_runs,
          }),
        },
      });
    }
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
      time: date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const matchDate = formatDate(match.match_date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':      return 'bg-red-500';
      case 'finished':  return 'bg-gray-500';
      case 'scheduled': return 'bg-blue-500';
      case 'postponed': return 'bg-yellow-500';
      default:          return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live':      return 'EN VIVO';
      case 'finished':  return 'FINALIZADO';
      case 'scheduled': return 'PROGRAMADO';
      case 'postponed': return 'APLAZADO';
      default:          return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/sports/tournaments/${tournament?.slug}/schedule`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Volver al calendario
            </Link>
            <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getStatusColor(match.status)}`}>
              {match.status === 'live' && <span className="animate-pulse mr-1">●</span>}
              {getStatusLabel(match.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Marcador principal */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">

          {/* Info del partido */}
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              {matchDate.full}
              <span className="mx-2">•</span>
              <Clock className="w-4 h-4" />
              {matchDate.time}
            </p>
            {match.venue && (
              <p className="text-gray-400 text-sm mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                {match.venue}
              </p>
            )}
          </div>

          {/* Equipos y marcador */}
          <div className="flex items-center justify-center gap-8">

            {/* Local */}
            <div className="text-center flex-1">
              {match.home_team_logo ? (
                <img
                  src={match.home_team_logo}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                  {match.home_team_name?.[0]}
                </div>
              )}
              <h2 className="text-xl font-bold">{match.home_team_name}</h2>
              <p className="text-gray-400 text-sm">Local</p>
            </div>

            {/* Marcador */}
            <div className="text-center px-8">
              {editingScore && isOwner ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-center">
                    <input
                      type="number"
                      min={0}
                      value={scoreForm.home_score}
                      onChange={(e) =>
                        setScoreForm((prev) => ({ ...prev, home_score: parseInt(e.target.value) || 0 }))
                      }
                      className="w-20 h-20 text-center text-4xl font-bold bg-white/10 border-2 border-white/30 rounded-xl text-white focus:border-green-500 focus:outline-none"
                    />
                    <span className="text-4xl font-bold text-gray-500">-</span>
                    <input
                      type="number"
                      min={0}
                      value={scoreForm.away_score}
                      onChange={(e) =>
                        setScoreForm((prev) => ({ ...prev, away_score: parseInt(e.target.value) || 0 }))
                      }
                      className="w-20 h-20 text-center text-4xl font-bold bg-white/10 border-2 border-white/30 rounded-xl text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  {isSoftball && (
                    <div className="flex items-center gap-3 justify-center">
                      <input
                        type="number"
                        min={0}
                        value={scoreForm.home_runs ?? ''}
                        onChange={(e) =>
                          setScoreForm((prev) => ({
                            ...prev,
                            home_runs: e.target.value ? parseInt(e.target.value) : null,
                          }))
                        }
                        className="w-16 h-12 text-center text-xl font-bold bg-white/10 border-2 border-white/30 rounded-lg text-white focus:border-green-500 focus:outline-none"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-400">Carreras</span>
                      <input
                        type="number"
                        min={0}
                        value={scoreForm.away_runs ?? ''}
                        onChange={(e) =>
                          setScoreForm((prev) => ({
                            ...prev,
                            away_runs: e.target.value ? parseInt(e.target.value) : null,
                          }))
                        }
                        className="w-16 h-12 text-center text-xl font-bold bg-white/10 border-2 border-white/30 rounded-lg text-white focus:border-green-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleSaveScore}
                      disabled={updateScoreMutation.isPending}
                      className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-1"
                    >
                      {updateScoreMutation.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Save className="w-4 h-4" />}
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingScore(false)}
                      className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-sm font-medium flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-6xl font-bold tracking-wider">
                    {match.home_score ?? 0} - {match.away_score ?? 0}
                  </div>
                  {isSoftball && (match.home_runs !== null || match.away_runs !== null) && (
                    <div className="text-xl text-gray-400 mt-2">
                      Carreras: {match.home_runs ?? 0} - {match.away_runs ?? 0}
                    </div>
                  )}
                  {isOwner && match.status !== 'finished' && match.status !== 'cancelled' && (
                    <button
                      onClick={handleEditScore}
                      className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium flex items-center gap-1 mx-auto transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar marcador
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Visitante */}
            <div className="text-center flex-1">
              {match.away_team_logo ? (
                <img
                  src={match.away_team_logo}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                  {match.away_team_name?.[0]}
                </div>
              )}
              <h2 className="text-xl font-bold">{match.away_team_name}</h2>
              <p className="text-gray-400 text-sm">Visitante</p>
            </div>
          </div>

          {/* Botón finalizar — solo si está en vivo */}
          {isOwner && match.status === 'live' && (
            <div className="mt-8 text-center">
              <button
                onClick={handleFinishMatch}
                disabled={finishMutation.isPending}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl font-bold text-lg transition-colors inline-flex items-center gap-2"
              >
                {finishMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                FINALIZAR PARTIDO
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido inferior */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Info del partido */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Detalles
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Torneo</span>
                  <Link
                    to={`/sports/tournaments/${tournament?.slug}`}
                    className="font-medium text-gray-900 hover:text-green-600"
                  >
                    {tournament?.name}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jornada</span>
                  <span className="font-medium">Jornada {match.match_week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ronda</span>
                  <span className="font-medium">Ronda {match.round_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado</span>
                  <span className={`font-medium ${match.status === 'live' ? 'text-red-600' : 'text-gray-900'}`}>
                    {match.status_display || getStatusLabel(match.status)}
                  </span>
                </div>
                {match.notes && (
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-gray-600 text-sm">Notas:</span>
                    <p className="text-gray-800 mt-1">{match.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Estadísticas
              </h3>
              <p className="text-gray-500 text-center py-4">
                Las estadísticas detalladas estarán disponibles próximamente
              </p>
            </div>
          </div>

          {/* Eventos y alineaciones */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Swords className="w-5 h-5 text-purple-500" />
                Eventos del partido
              </h3>

              {match.events && match.events.length > 0 ? (
                <div className="space-y-3">
                  {match.events.map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-700 font-bold text-sm">{event.minute}'</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.event_type_display}</p>
                        <p className="text-sm text-gray-600">
                          {event.player_name} • {event.team_name}
                        </p>
                        {event.description && (
                          <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No hay eventos registrados</p>
                  {isOwner && match.status === 'live' && (
                    <p className="text-sm text-gray-400 mt-1">
                      Los eventos se agregarán desde aquí próximamente
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Alineaciones
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{match.home_team_name}</p>
                  <p className="text-sm text-gray-400 mt-1">Alineación por confirmar</p>
                </div>
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{match.away_team_name}</p>
                  <p className="text-sm text-gray-400 mt-1">Alineación por confirmar</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MatchLivePage;
