import React, { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useAddMatchEvent } from '../../hooks/useSports';
import type { Match, SoftballEventType } from '../../types/sports';

interface Props {
  match: Match;
  homePlayers: any[];
  awayPlayers: any[];
  currentInning?: number;
  currentHalf?: 'top' | 'bottom';
  onClose: () => void;
}

const PLAYS: { type: SoftballEventType; label: string; group: string }[] = [
  { type: 'single', label: 'Sencillo', group: 'Bateo' },
  { type: 'double', label: 'Doble', group: 'Bateo' },
  { type: 'triple', label: 'Triple', group: 'Bateo' },
  { type: 'home_run', label: 'Jonrón', group: 'Bateo' },
  { type: 'walk', label: 'Base por bolas', group: 'Bateo' },
  { type: 'strikeout', label: 'Ponche', group: 'Bateo' },
  { type: 'out', label: 'Out', group: 'Bateo' },
  { type: 'run', label: 'Carrera anotada', group: 'Anotación' },
  { type: 'rbi', label: 'Carrera impulsada (RBI)', group: 'Anotación' },
  { type: 'error', label: 'Error', group: 'Defensa' },
];

const SoftballEventModal: React.FC<Props> = ({
  match,
  homePlayers,
  awayPlayers,
  currentInning,
  currentHalf,
  onClose,
}) => {
  const addEvent = useAddMatchEvent();
  const [side, setSide] = useState<'home' | 'away'>(
    currentHalf === 'top' ? 'away' : 'home'
  );
  const [playerId, setPlayerId] = useState('');
  const [playType, setPlayType] = useState<SoftballEventType>('single');
  const [rbi, setRbi] = useState(1);

  const players = side === 'home' ? homePlayers : awayPlayers;
  const teamId = side === 'home' ? match.home_team : match.away_team;
  const teamName =
    side === 'home' ? match.home_team_detail?.name : match.away_team_detail?.name;

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === playerId),
    [players, playerId]
  );

  const submit = () => {
    if (!playerId) return;
    const label = PLAYS.find((p) => p.type === playType)?.label ?? playType;
    addEvent.mutate(
      {
        id: match.id,
        data: {
          event_type: playType,
          player: playerId,
          team: teamId,
          minute: null,
          inning_number: currentInning ?? null,
          inning_half: currentHalf ?? '',
          rbi: playType === 'rbi' ? rbi : 0,
          description: `${label}${
            selectedPlayer ? ` — ${selectedPlayer.full_name}` : ''
          }`,
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Registrar jugada</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Equipo */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['away', 'home'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setSide(s);
                setPlayerId('');
              }}
              className={`py-2.5 rounded-2xl text-sm font-semibold border transition-colors ${
                side === s
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
              }`}
            >
              {s === 'home' ? match.home_team_detail?.name : match.away_team_detail?.name}
            </button>
          ))}
        </div>

        {/* Jugador */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
          Jugador ({teamName})
        </label>
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className="w-full rounded-2xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 mb-4"
        >
          <option value="">Selecciona un jugador...</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              #{p.jersey_number} {p.full_name}
            </option>
          ))}
        </select>

        {/* Jugada */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Jugada</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PLAYS.map((p) => (
            <button
              key={p.type}
              onClick={() => setPlayType(p.type)}
              className={`py-2 px-3 rounded-xl text-sm font-medium border text-left transition-colors ${
                playType === p.type
                  ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-400 text-violet-700 dark:text-violet-300'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {playType === 'rbi' && (
          <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl px-4 py-2.5">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Carreras impulsadas</span>
            <input
              type="number"
              min={1}
              max={4}
              value={rbi}
              onChange={(e) => setRbi(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-1.5"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={!playerId || addEvent.isPending}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
          >
            {addEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-semibold"
          >
            Cancelar
          </button>
        </div>
        <p className="mt-3 text-[11px] text-center text-gray-400">
          Las jugadas alimentan el box score y los líderes; el marcador se maneja por entradas.
        </p>
      </div>
    </div>
  );
};

export default SoftballEventModal;
