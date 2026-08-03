import React, { useMemo, useState } from 'react';
import { Ban, Loader2, ShieldAlert, Undo2 } from 'lucide-react';
import {
  useCreatePlayerSuspension,
  usePlayerSuspensions,
  usePlayers,
  useRevokePlayerSuspension,
  useUpdatePlayerSuspension,
} from '../../hooks/useSports';
import type { PlayerSuspension, SuspensionReason } from '../../types/sports';

const REASON_LABELS: Record<SuspensionReason, string> = {
  direct_red: 'Roja directa',
  double_yellow: 'Doble amarilla',
  manual: 'Manual',
};

interface PlayerSuspensionsPanelProps {
  tournamentId: string;
  tournamentSlug: string;
}

const PlayerSuspensionsPanel: React.FC<PlayerSuspensionsPanelProps> = ({
  tournamentId,
  tournamentSlug,
}) => {
  const { data: suspensions, isLoading } = usePlayerSuspensions(tournamentId);
  const { data: playersData } = usePlayers(undefined, tournamentSlug);
  const createMutation = useCreatePlayerSuspension();
  const revokeMutation = useRevokePlayerSuspension();
  const updateMutation = useUpdatePlayerSuspension();

  const [playerId, setPlayerId] = useState('');
  const [matchesCount, setMatchesCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const players = playersData?.results ?? [];

  const list: PlayerSuspension[] = useMemo(() => {
    if (Array.isArray(suspensions)) return suspensions;
    if (suspensions && typeof suspensions === 'object' && 'results' in suspensions) {
      return (suspensions as { results: PlayerSuspension[] }).results;
    }
    return [];
  }, [suspensions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!playerId) {
      setFormError('Selecciona un jugador.');
      return;
    }
    try {
      await createMutation.mutateAsync({
        player: playerId,
        tournament: tournamentId,
        reason: 'manual',
        matches_count: matchesCount,
        notes: notes.trim(),
      });
      setPlayerId('');
      setMatchesCount(1);
      setNotes('');
    } catch {
      setFormError('No se pudo crear la suspensión. Verifica permisos y datos.');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('¿Revocar esta suspensión?')) return;
    await revokeMutation.mutateAsync(id);
  };

  const handleUpdateMatches = async (suspension: PlayerSuspension, newCount: number) => {
    if (newCount < 1) return;
    await updateMutation.mutateAsync({
      id: suspension.id,
      data: { matches_count: newCount },
    });
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-red-500" />
        <h3 className="font-bold text-gray-900 dark:text-white">Control de sanciones</h3>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Suspender jugador manualmente</p>
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
        >
          <option value="">Seleccionar jugador</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name || `${p.first_name} ${p.last_name}`} — {p.team_name}
            </option>
          ))}
        </select>
        <div className="flex gap-3">
          <label className="flex-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Partidos de sanción</span>
            <input
              type="number"
              min={1}
              max={10}
              value={matchesCount}
              onChange={(e) => setMatchesCount(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2"
            />
          </label>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Motivo (opcional)"
          rows={2}
          className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
        />
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
          Aplicar suspensión
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-6 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No hay suspensiones registradas.</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto">
          {list.map((s) => (
            <li
              key={s.id}
              className={`rounded-2xl border p-3 text-sm ${
                s.is_active
                  ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/30 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{s.player_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {REASON_LABELS[s.reason]} · {s.matches_remaining}/{s.matches_count} fechas restantes
                  </p>
                  {s.notes && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{s.notes}</p>}
                </div>
                {s.is_active && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(s.id)}
                    disabled={revokeMutation.isPending}
                    className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs font-medium hover:bg-white dark:hover:bg-gray-800"
                    title="Revocar suspensión"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    Revocar
                  </button>
                )}
              </div>
              {s.is_active && s.reason === 'manual' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Modificar fechas:</span>
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleUpdateMatches(s, n)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        s.matches_count === n
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayerSuspensionsPanel;
