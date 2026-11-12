import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Trophy,
  Play,
  Square,
  Edit3,
  Trash2,
  Filter,
  Loader2,
  Eye,
} from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import {
  useTournament,
  useTeams,
  useMatches,
  useCreateMatch,
  useUpdateMatch,
  useDeleteMatch,
  useStartMatch,
  useFinishMatch,
} from '../../hooks/useSports';
import {
  bogotaDateKey,
  bogotaInputToISO,
  formatBogotaDate,
  formatBogotaTime,
  toBogotaInputValue,
} from '../../lib/bogotaTime';
import TeamName from '../../components/Sports/TeamName';
import type { CreateMatchData, Match, Team } from '../../types/sports';
import SponsorshipAvailabilityBanner from '../../components/Advertising/SponsorshipAvailabilityBanner';
import TournamentAdSlot from '../../components/Advertising/TournamentAdSlot';
import { useSponsorshipAvailability } from '../../hooks/useAdvertising';
import BackToTournamentLink from '../../components/Sports/BackToTournamentLink';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-violet-100 dark:bg-violet-950/40 text-blue-700',
  live: 'bg-red-100 text-red-700 animate-pulse',
  finished: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
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

const TournamentSchedulePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isOwner: checkIsOwner } = usePermissions();

  const { data: tournament } = useTournament(slug || '');
  const { data: sponsorshipAvailability } = useSponsorshipAvailability(slug || '');
  const { data: teamsData } = useTeams(slug || '');
  const { data: matchesData, isLoading: loadingMatches } = useMatches({
    tournament: slug || '',
  });
  const createMutation = useCreateMatch();
  const updateMutation = useUpdateMatch();
  const deleteMutation = useDeleteMatch();
  const startMutation = useStartMatch();

  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [finishingMatch, setFinishingMatch] = useState<Match | null>(null);
  const [scoreData, setScoreData] = useState({ home_score: 0, away_score: 0 });

  const finishMutation = useFinishMatch();

  const handleFinishMatch = () => {
    if (!finishingMatch) return;
    finishMutation.mutate(
      { id: finishingMatch.id, data: scoreData },
      { onSuccess: () => { setFinishingMatch(null); setScoreData({ home_score: 0, away_score: 0 }); } }
    );
  };

  const isOwner = checkIsOwner(tournament);

  const teams = (teamsData?.results || []) as Team[];
  const matches = matchesData?.results || [];

  const matchInstant = (match: Match) => match.match_date || match.start_time || '';

  const teamOptions = useMemo(() => {
    const fromApi = teams
      .filter((team) => team.id && team.name)
      .map((team) => ({ id: team.id, name: team.name }));
    const source = fromApi.length > 0
      ? fromApi
      : [...matches.reduce((seen, match) => {
          if (match.home_team && match.home_team_name) seen.set(match.home_team, match.home_team_name);
          if (match.away_team && match.away_team_name) seen.set(match.away_team, match.away_team_name);
          return seen;
        }, new Map<string, string>())].map(([id, name]) => ({ id, name }));
    return source.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [teams, matches]);

  const dateOptions = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const match of matches) {
      const instant = matchInstant(match);
      const key = bogotaDateKey(instant);
      if (key && !byKey.has(key)) byKey.set(key, instant);
    }
    return [...byKey.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, instant]) => ({
        key,
        label: formatBogotaDate(instant, {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      }));
  }, [matches]);

  const filteredAndSortedMatches = useMemo(() => {
    return matches
      .filter((match) => {
        if (statusFilter && match.status !== statusFilter) return false;
        if (selectedTeam && match.home_team !== selectedTeam && match.away_team !== selectedTeam) return false;
        if (selectedDate && bogotaDateKey(matchInstant(match)) !== selectedDate) return false;
        return true;
      })
      .sort((a, b) => {
        const diff = new Date(matchInstant(a)).getTime() - new Date(matchInstant(b)).getTime();
        return sortOrder === 'ASC' ? diff : -diff;
      });
  }, [matches, statusFilter, selectedTeam, selectedDate, sortOrder]);

  const hasActiveFilters = Boolean(statusFilter || selectedTeam || selectedDate);

  const clearFilters = () => {
    setStatusFilter('');
    setSelectedTeam('');
    setSelectedDate('');
    setSortOrder('ASC');
  };

  const [formData, setFormData] = useState<CreateMatchData>({
    tournament: tournament?.id || '',
    home_team: '',
    away_team: '',
    match_date: '',
    venue: '',
    stadium: '',
    round_number: 1,
    match_week: 1,
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      tournament: tournament?.id || '',
      home_team: '',
      away_team: '',
      match_date: '',
      venue: '',
      stadium: '',
      round_number: 1,
      match_week: 1,
      notes: '',
    });
    setEditingMatch(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.home_team || !formData.away_team || !formData.match_date) return;
    if (formData.home_team === formData.away_team) {
      alert('Los equipos deben ser diferentes');
      return;
    }

    const matchDateISO = bogotaInputToISO(formData.match_date);
    if (!matchDateISO) {
      alert('La fecha y hora del partido no es válida.');
      return;
    }
    const payload = { ...formData, match_date: matchDateISO };

    if (editingMatch) {
      updateMutation.mutate(
        { id: editingMatch.id, data: payload },
        { onSuccess: () => resetForm() }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => resetForm(),
      });
    }
  };
  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      tournament: match.tournament,
      home_team: match.home_team,
      away_team: match.away_team,
      match_date: toBogotaInputValue(match.match_date),
      venue: match.venue || '',
      stadium: match.stadium || '',
      round_number: match.round_number,
      match_week: match.match_week,
      notes: match.notes || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (matchId: string) => {
    if (confirm('¿Eliminar este partido?')) {
      deleteMutation.mutate(matchId);
    }
  };

  const handleStartMatch = (matchId: string) => {
    if (confirm('¿Iniciar este partido?')) {
      startMutation.mutate(matchId);
    }
  };

  const formatMatchDate = (dateString: string) => ({
    date: formatBogotaDate(dateString),
    time: formatBogotaTime(dateString),
    day: formatBogotaDate(dateString, { weekday: 'long' }),
  });

  const groupedMatches = filteredAndSortedMatches.reduce((acc: Record<string, Match[]>, match: Match) => {
    const date = bogotaDateKey(match.match_date);
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="page-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackToTournamentLink tournamentSlug={slug} />
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Calendario</h1>
                <p className="text-sm text-gray-500">{tournament?.name}</p>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-3xl hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showForm ? 'Cancelar' : 'Crear partido'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="space-y-3 mb-8">
          <SponsorshipAvailabilityBanner
            availability={sponsorshipAvailability}
            showPurchaseButton={false}
            tournament={tournament}
          />
          <TournamentAdSlot
            position="standings_top"
            tournamentId={tournament?.id}
            variant="horizontal"
          />
        </div>

        {/* Formulario crear/editar partido */}
        {showForm && isOwner && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingMatch ? 'Editar Partido' : 'Nuevo Partido'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Equipo local *</label>
                <select
                  value={formData.home_team}
                  onChange={(e) => setFormData(prev => ({ ...prev, home_team: e.target.value }))}
                  className="w-full rounded-3xl border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {teams.map((team: any) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Equipo visitante *</label>
                <select
                  value={formData.away_team}
                  onChange={(e) => setFormData(prev => ({ ...prev, away_team: e.target.value }))}
                  className="w-full rounded-3xl border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {teams.map((team: any) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Fecha y hora *</label>
                <input
                  type="datetime-local"
                  value={formData.match_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, match_date: e.target.value }))}
                  className="w-full rounded-3xl border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Lugar / Cancha</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value, stadium: e.target.value }))}
                  className="w-full rounded-3xl border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                  placeholder="Estadio El Campín"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Jornada</label>
                <input
                  type="number"
                  min={1}
                  value={formData.match_week}
                  onChange={(e) => setFormData(prev => ({ ...prev, match_week: parseInt(e.target.value) || 1 }))}
                  className="w-full rounded-3xl border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Ronda</label>
                <input
                  type="number"
                  min={1}
                  value={formData.round_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, round_number: parseInt(e.target.value) || 1 }))}
                  className="w-full rounded-3xl border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Notas</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-3xl border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-3xl hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingMatch ? 'Guardar cambios' : 'Crear partido'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-3xl hover:bg-gray-50 dark:bg-gray-900/50 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 mb-6 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Filtrar:</span>
            {['', 'scheduled', 'live', 'finished', 'postponed'].map((status) => (
              <button
                key={status || 'all'}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {status ? STATUS_LABELS[status] : 'Todos'}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              aria-label="Filtrar por equipo"
              className="w-full sm:w-auto rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
            >
              <option value="">Todos los equipos</option>
              {teamOptions.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>

            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Filtrar por fecha"
              className="w-full sm:w-auto rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
            >
              <option value="">Todas las fechas</option>
              {dateOptions.map((date) => (
                <option key={date.key} value={date.key}>{date.label}</option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}
              aria-label="Ordenar por fecha"
              className="w-full sm:w-auto rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
            >
              <option value="ASC">Más antiguos primero</option>
              <option value="DESC">Más recientes primero</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2 py-1.5"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Lista de partidos */}
        {loadingMatches ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : Object.keys(groupedMatches).length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {hasActiveFilters ? 'Ningún partido coincide con estos filtros' : 'No hay partidos programados'}
            </p>
            {isOwner && !hasActiveFilters && (
              <p className="text-sm text-gray-400 mt-1">Crea el primer partido con el botón verde</p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMatches).map(([date, dayMatches]) => {
              const firstMatch = dayMatches[0];
              const dateInfo = formatMatchDate(firstMatch.match_date);
              
              return (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-3xl text-sm font-medium">
                      {dateInfo.day}
                    </div>
                    <span className="text-gray-500 text-sm">{dateInfo.date}</span>
                  </div>

                  <div className="space-y-3">
                    {dayMatches.map((match: Match) => (
                      <div
                        key={match.id}
                        className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 hover:shadow-2xl transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          {/* Equipo local */}
                          <div className="flex items-center gap-3 flex-1">
                            {match.home_team_logo ? (
                              <img 
                                src={match.home_team_logo}
                                alt={match.home_team_name}
                                className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                {match.home_team_name?.[0]}
                              </div>
                            )}
                            <div className="min-w-0">
                              <TeamName
                                name={match.home_team_name}
                                abbreviation={match.home_team_abbreviation}
                                className="block font-medium text-gray-900 dark:text-white truncate"
                              />
                              {match.status === 'finished' && (
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{match.home_score ?? '-'}</p>
                              )}
                            </div>
                          </div>

                          {/* Centro - estado/hora */}
                          <div className="text-center px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[match.status]}`}>
                              {STATUS_LABELS[match.status]}
                            </span>
                            {match.status === 'live' ? (
                              <p className="text-red-600 font-bold mt-1 animate-pulse">
                                {match.home_score} - {match.away_score}
                              </p>
                            ) : match.status === 'finished' ? (
                              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {match.home_score} - {match.away_score}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatMatchDate(match.match_date).time}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              J{match.match_week} • R{match.round_number}
                            </p>
                          </div>

                          {/* Equipo visitante */}
                          <div className="flex items-center gap-3 flex-1 justify-end">
                            <div className="min-w-0 text-right">
                              <TeamName
                                name={match.away_team_name}
                                abbreviation={match.away_team_abbreviation}
                                className="block font-medium text-gray-900 dark:text-white truncate"
                              />
                              {match.status === 'finished' && (
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{match.away_score ?? '-'}</p>
                              )}
                            </div>
                            {match.away_team_logo ? (
                              <img src={match.away_team_logo} alt={match.away_team_name}
                              className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                {match.away_team_name?.[0]}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info adicional y acciones */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {match.venue && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {match.venue}
                              </span>
                            )}
                            {match.notes && (
                              <span className="text-gray-400">{match.notes}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                          {/* ← BOTÓN VER DETALLE (visible para todos) */}
                          <Link
                            to={`/sports/matches/${match.id}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-gray-800 rounded-3xl transition-colors group"
                            title="Ver detalle del partido"
                          >
                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-400" />
                            <span>Ver Detalle</span>
                          </Link>

                            {isOwner && (
                              <>
                                {match.status === 'scheduled' && (
                                  <button
                                    onClick={() => handleStartMatch(match.id)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-3xl transition-colors"
                                    title="Iniciar partido"
                                  >
                                    <Play className="w-4 h-4" />
                                  </button>
                                )}
                                {match.status === 'live' && (
                                  <button
                                    onClick={() => {
                                      setFinishingMatch(match);
                                      setScoreData({
                                        home_score: match.home_score ?? 0,
                                        away_score: match.away_score ?? 0,
                                      });
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-3xl transition-colors"
                                    title="Finalizar partido"
                                  >
                                    <Square className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEdit(match)}
                                  className="p-1.5 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:bg-violet-950/30 rounded-3xl transition-colors"
                                  title="Editar"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(match.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-3xl transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Modal: Finalizar partido */}
      {finishingMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Finalizar partido</h2>
            <p className="text-sm text-gray-500 mb-5">
              {finishingMatch.home_team_detail?.name} vs {finishingMatch.away_team_detail?.name}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500 mb-1 truncate">{finishingMatch.home_team_detail?.name}</p>
                <input
                  type="number"
                  min={0}
                  value={scoreData.home_score}
                  onChange={(e) => setScoreData(prev => ({ ...prev, home_score: parseInt(e.target.value) || 0 }))}
                  className="w-full text-center text-3xl font-bold border-2 border-gray-200 dark:border-gray-800 rounded-3xl py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <span className="text-2xl font-bold text-gray-400">-</span>
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500 mb-1 truncate">{finishingMatch.away_team_detail?.name}</p>
                <input
                  type="number"
                  min={0}
                  value={scoreData.away_score}
                  onChange={(e) => setScoreData(prev => ({ ...prev, away_score: parseInt(e.target.value) || 0 }))}
                  className="w-full text-center text-3xl font-bold border-2 border-gray-200 dark:border-gray-800 rounded-3xl py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleFinishMatch}
                disabled={finishMutation.isPending}
                className="flex-1 py-2 bg-green-600 text-white rounded-3xl hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {finishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                Confirmar
              </button>
              <button
                onClick={() => { setFinishingMatch(null); setScoreData({ home_score: 0, away_score: 0 }); }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-3xl hover:bg-gray-50 dark:bg-gray-900/50 font-medium"
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

export default TournamentSchedulePage;