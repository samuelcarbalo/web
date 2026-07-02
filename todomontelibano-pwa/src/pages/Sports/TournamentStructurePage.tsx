import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Layers,
  Users,
  Calendar,
  Loader2,
  CheckCircle2,
  Play,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import {
  useTournament,
  useTournamentStructure,
  useTeams,
  useAssignGroupTeams,
  useGenerateFixture,
  useAdvancePhase,
} from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';
import type { BracketNode, CompetitionGroup, TournamentPhase } from '../../types/sports';
import { getMatchAwayScore, getMatchHomeScore } from '../../lib/matchScoring';

const TournamentStructurePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const { data: tournament, isLoading: loadingTournament } = useTournament(slug || '');
  const { data: structure, isLoading: loadingStructure, isError: structureError } = useTournamentStructure(slug || '');
  const { data: teamsData } = useTeams(slug);
  const assignMutation = useAssignGroupTeams(slug || '');
  const fixtureMutation = useGenerateFixture(slug || '');
  const advanceMutation = useAdvancePhase(slug || '');

  const [selectedGroup, setSelectedGroup] = useState<CompetitionGroup | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [fixturePhase, setFixturePhase] = useState<TournamentPhase | null>(null);
  const [advanceFromPhase, setAdvanceFromPhase] = useState<TournamentPhase | null>(null);
  const [fixtureGroupId, setFixtureGroupId] = useState<string>('');
  const [matchDate, setMatchDate] = useState('');
  const [venue, setVenue] = useState('');
  const [advanceError, setAdvanceError] = useState('');

  const sportType = tournament?.sport_type || 'football';

  const isOwner = user?.id === tournament?.posted_by || user?.role === 'manager';
  const teams = teamsData?.results ?? [];

  const assignedTeamIds = useMemo(() => {
    const ids = new Set<string>();
    structure?.phases.forEach((phase) =>
      phase.groups.forEach((group) =>
        group.memberships.forEach((m) => ids.add(m.team.id))
      )
    );
    return ids;
  }, [structure]);

  const openAssignModal = (group: CompetitionGroup) => {
    setSelectedGroup(group);
    setSelectedTeamIds(group.memberships.map((m) => m.team.id));
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const handleAssign = () => {
    if (!selectedGroup) return;
    assignMutation.mutate(
      { groupId: selectedGroup.id, teamIds: selectedTeamIds },
      {
        onSuccess: () => {
          setSelectedGroup(null);
          setSelectedTeamIds([]);
        },
      }
    );
  };

  const handleGenerateFixture = () => {
    if (!fixturePhase || !matchDate) return;
    fixtureMutation.mutate({
      phase_id: fixturePhase.id,
      group_id: fixtureGroupId || undefined,
      match_date: new Date(matchDate).toISOString(),
      venue,
    });
  };

  const handleAdvancePhase = () => {
    if (!advanceFromPhase) return;
    setAdvanceError('');
    advanceMutation.mutate(
      {
        from_phase: advanceFromPhase.slug,
        match_date: matchDate ? new Date(matchDate).toISOString() : undefined,
        venue,
      },
      {
        onSuccess: () => {
          setAdvanceFromPhase(null);
          setMatchDate('');
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'No se pudo avanzar de fase';
          setAdvanceError(msg);
        },
      }
    );
  };

  const hasNextPhase = (phase: TournamentPhase) => {
    if (!structure) return false;
    return structure.phases.some((p) => p.order > phase.order);
  };

  const BracketNodeCard: React.FC<{ node: BracketNode }> = ({ node }) => {
    const m = node.match;
    const homeName = node.home_team?.name || node.home_label;
    const awayName = node.away_team?.name || node.away_label;
    const homeScore = m ? getMatchHomeScore(m, sportType) : null;
    const awayScore = m ? getMatchAwayScore(m, sportType) : null;

    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900/50">
        <p className="text-xs font-semibold text-violet-600 uppercase mb-3">
          {node.round_display}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <span className={m && homeScore !== null && awayScore !== null && homeScore > awayScore ? 'font-bold' : ''}>
              {homeName}
            </span>
            {homeScore !== null && <span className="font-bold tabular-nums">{homeScore}</span>}
          </div>
          <div className="flex justify-between gap-2">
            <span className={m && homeScore !== null && awayScore !== null && awayScore > homeScore ? 'font-bold' : ''}>
              {awayName}
            </span>
            {awayScore !== null && <span className="font-bold tabular-nums">{awayScore}</span>}
          </div>
        </div>
        {m && (
          <Link
            to={`/deportes/matches/${m.id}`}
            className="mt-3 block text-center text-xs text-green-600 hover:underline"
          >
            Ver partido
          </Link>
        )}
      </div>
    );
  };

  if (loadingTournament || loadingStructure) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (structureError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 mb-4">No se pudo cargar la estructura del torneo.</p>
        <p className="text-sm text-gray-500 mb-6">Verifica que el backend esté activo en el puerto 8000.</p>
        <Link to={`/deportes/tournaments/${slug}`} className="btn-primary inline-flex">
          Volver al torneo
        </Link>
      </div>
    );
  }

  if (!structure || structure.structure_mode === 'legacy') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Torneo de liga simple
        </h2>
        <p className="text-gray-500 mb-6">
          Este torneo no usa fases ni cuadrangulares. Crea partidos manualmente desde el calendario.
        </p>
        <Link to={`/deportes/tournaments/${slug}`} className="btn-primary inline-flex">
          Volver al torneo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
      <Link
        to={`/deportes/tournaments/${slug}`}
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 text-sm"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {tournament?.name}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-violet-100 dark:bg-violet-950/40 rounded-xl">
          <Layers className="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estructura del torneo</h1>
          <p className="text-sm text-gray-500">
            Fases, cuadrangulares y generación de fixture
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {structure.phases.map((phase) => (
          <div key={phase.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">{phase.name}</h2>
                <p className="text-xs text-gray-500">
                  {phase.phase_type_display || phase.phase_type} · {phase.status_display || phase.status}
                </p>
              </div>
              {isOwner && phase.phase_type !== 'knockout' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFixturePhase(phase);
                      setFixtureGroupId('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-full hover:bg-green-700"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Generar fixture
                  </button>
                  {phase.status === 'active' && hasNextPhase(phase) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAdvanceFromPhase(phase);
                        setAdvanceError('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-full hover:bg-violet-700"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Cerrar fase y avanzar
                    </button>
                  )}
                </div>
              )}
            </div>

            {phase.phase_type === 'knockout' && phase.bracket?.nodes?.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {phase.bracket.nodes.map((node) => (
                  <BracketNodeCard key={node.id} node={node} />
                ))}
              </div>
            ) : phase.groups.length === 0 ? (
              <p className="text-sm text-gray-500">
                {phase.phase_type === 'knockout'
                  ? 'Los partidos de eliminatoria se generan al cerrar la fase anterior.'
                  : 'Fase sin grupos — el fixture incluirá todos los equipos del torneo.'}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {phase.groups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-900/30"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                      <span className="text-xs text-gray-500">
                        {group.memberships.length}/{group.max_teams} equipos
                      </span>
                    </div>

                    {group.memberships.length > 0 ? (
                      <ul className="space-y-1.5 mb-3">
                        {group.memberships.map((m) => (
                          <li
                            key={m.id}
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            {m.team.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400 mb-3">Sin equipos asignados</p>
                    )}

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => openAssignModal(group)}
                        className="w-full py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 inline mr-1" />
                        Asignar equipos
                      </button>
                    )}

                    <Link
                      to={`/deportes/tournaments/${slug}/standings?phase=${phase.slug}&group=${group.slug}`}
                      className="block mt-2 text-center text-xs text-green-600 hover:underline"
                    >
                      Ver tabla del grupo
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal asignar equipos */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-1">{selectedGroup.name}</h3>
            <p className="text-sm text-gray-500 mb-4">
              Selecciona hasta {selectedGroup.max_teams} equipos
            </p>
            <div className="space-y-2 mb-6">
              {teams.map((team) => {
                const isSelected = selectedTeamIds.includes(team.id);
                const isAssignedElsewhere =
                  assignedTeamIds.has(team.id) &&
                  !selectedGroup.memberships.some((m) => m.team.id === team.id);
                return (
                  <label
                    key={team.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-gray-200 dark:border-gray-700'
                    } ${isAssignedElsewhere && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={
                        !isSelected &&
                        (selectedTeamIds.length >= selectedGroup.max_teams || isAssignedElsewhere)
                      }
                      onChange={() => toggleTeam(team.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">{team.name}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAssign}
                disabled={assignMutation.isPending || selectedTeamIds.length < 2}
                className="flex-1 btn-primary py-2.5 disabled:opacity-50"
              >
                {assignMutation.isPending ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="flex-1 btn-secondary py-2.5"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal generar fixture */}
      {fixturePhase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Generar fixture — {fixturePhase.name}
            </h3>
            {fixturePhase.groups.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Grupo (opcional)</label>
                <select
                  value={fixtureGroupId}
                  onChange={(e) => setFixtureGroupId(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Todos los grupos por separado</option>
                  {fixturePhase.groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fecha y hora del primer partido *</label>
              <input
                type="datetime-local"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Lugar</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="input-field w-full"
                placeholder="Campo municipal"
              />
            </div>
            {fixtureMutation.isSuccess && (
              <p className="text-sm text-green-600 mb-3">
                Se crearon {fixtureMutation.data?.created_count} partidos.
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleGenerateFixture}
                disabled={fixtureMutation.isPending || !matchDate}
                className="flex-1 btn-primary py-2.5 disabled:opacity-50"
              >
                {fixtureMutation.isPending ? 'Generando...' : 'Generar'}
              </button>
              <button
                type="button"
                onClick={() => setFixturePhase(null)}
                className="flex-1 btn-secondary py-2.5"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal avanzar fase */}
      {advanceFromPhase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-violet-600" />
              Cerrar {advanceFromPhase.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Se verificará que todos los partidos estén finalizados y se crearán los cruces de la siguiente fase.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fecha partidos eliminatoria</label>
              <input
                type="datetime-local"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Lugar</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="input-field w-full"
                placeholder="Campo municipal"
              />
            </div>
            {advanceError && (
              <p className="text-sm text-red-600 mb-3">{advanceError}</p>
            )}
            {advanceMutation.isSuccess && (
              <p className="text-sm text-green-600 mb-3">
                Fase avanzada. Se crearon {advanceMutation.data?.matches_created?.length ?? 0} partidos.
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAdvancePhase}
                disabled={advanceMutation.isPending}
                className="flex-1 btn-primary py-2.5 disabled:opacity-50"
              >
                {advanceMutation.isPending ? 'Procesando...' : 'Confirmar avance'}
              </button>
              <button
                type="button"
                onClick={() => setAdvanceFromPhase(null)}
                className="flex-1 btn-secondary py-2.5"
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

export default TournamentStructurePage;
