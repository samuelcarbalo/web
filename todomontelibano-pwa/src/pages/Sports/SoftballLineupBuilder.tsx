import React, { useEffect, useMemo, useState } from 'react';
import {
  Save,
  Loader2,
  AlertCircle,
  Check,
  Users,
  ListOrdered,
} from 'lucide-react';
import type { Player } from '../../types/sports';
import {
  SOFTBALL_FIELD_SLOTS,
  SOFTBALL_DH_SLOT,
  buildSoftballLineupPayload,
  getSoftballStarterCount,
  validateSoftballLineupState,
  positionLabel,
} from '../../lib/softballLineup';

interface LineupPlayer {
  id: string;
  player: string;
  player_name: string;
  jersey_number?: number;
  position?: string;
  is_starter: boolean;
  is_on_field?: boolean;
  batting_order?: number | null;
  status: string;
}

interface SoftballLineupBuilderProps {
  teamName: string;
  players: Player[];
  lineupSize: number;
  existingStarters: LineupPlayer[];
  existingBench: LineupPlayer[];
  onSave: (players: ReturnType<typeof buildSoftballLineupPayload>) => void;
  isSaving: boolean;
  readOnly?: boolean;
}

const emptySlots = (): Record<string, string> =>
  Object.fromEntries(SOFTBALL_FIELD_SLOTS.map(({ key }) => [key, '']));

const SoftballLineupBuilder: React.FC<SoftballLineupBuilderProps> = ({
  teamName,
  players,
  lineupSize,
  existingStarters,
  existingBench,
  onSave,
  isSaving,
  readOnly = false,
}) => {
  const [fieldSlots, setFieldSlots] = useState<Record<string, string>>(emptySlots());
  const [dhPlayerId, setDhPlayerId] = useState('');
  const [battingOrder, setBattingOrder] = useState<string[]>([]);
  const [benchIds, setBenchIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const requiredStarters = getSoftballStarterCount(lineupSize);

  useEffect(() => {
    const slots = emptySlots();
    let dh = '';
    const order: string[] = [];

    const sorted = [...existingStarters].sort(
      (a, b) => (a.batting_order || 99) - (b.batting_order || 99)
    );

    sorted.forEach((entry) => {
      if (entry.position === SOFTBALL_DH_SLOT.key) {
        dh = entry.player;
      } else if (entry.position && entry.position in slots) {
        slots[entry.position] = entry.player;
      }
      if (entry.batting_order) {
        order[entry.batting_order - 1] = entry.player;
      } else if (!order.includes(entry.player)) {
        order.push(entry.player);
      }
    });

    setFieldSlots(slots);
    setDhPlayerId(dh);
    setBattingOrder(order.filter(Boolean));
    setBenchIds(existingBench.map((p) => p.player));
  }, [existingStarters, existingBench]);

  const starterIds = useMemo(() => {
    const ids = SOFTBALL_FIELD_SLOTS.map(({ key }) => fieldSlots[key]).filter(Boolean);
    if (lineupSize === 10 && dhPlayerId) ids.push(dhPlayerId);
    return ids;
  }, [fieldSlots, dhPlayerId, lineupSize]);

  const playersById = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players]
  );

  const availableForSlot = (currentSlotValue: string, slotKey?: string) =>
    players.filter((p) => {
      if (p.id === currentSlotValue) return true;
      const usedInField = Object.entries(fieldSlots).some(
        ([key, id]) => id === p.id && key !== slotKey
      );
      const usedAsDh = dhPlayerId === p.id && slotKey !== SOFTBALL_DH_SLOT.key;
      const usedOnBench = benchIds.includes(p.id);
      return !usedInField && !usedAsDh && !usedOnBench;
    });

  const syncBattingOrder = (nextStarterIds: string[]) => {
    setBattingOrder((prev) => {
      const kept = prev.filter((id) => nextStarterIds.includes(id));
      const added = nextStarterIds.filter((id) => !kept.includes(id));
      return [...kept, ...added];
    });
  };

  const handleFieldChange = (key: string, playerId: string) => {
    const next = { ...fieldSlots, [key]: playerId };
    setFieldSlots(next);
    const ids = SOFTBALL_FIELD_SLOTS.map(({ key: k }) => next[k]).filter(Boolean);
    if (lineupSize === 10 && dhPlayerId) ids.push(dhPlayerId);
    syncBattingOrder(ids);
    setError(null);
  };

  const handleDhChange = (playerId: string) => {
    setDhPlayerId(playerId);
    const ids = SOFTBALL_FIELD_SLOTS.map(({ key }) => fieldSlots[key]).filter(Boolean);
    if (playerId) ids.push(playerId);
    syncBattingOrder(ids);
    setError(null);
  };

  const moveBatter = (index: number, direction: -1 | 1) => {
    const next = [...battingOrder];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBattingOrder(next);
  };

  const toggleBench = (playerId: string) => {
    setBenchIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
    setError(null);
  };

  const handleSave = () => {
    const validation = validateSoftballLineupState(fieldSlots, dhPlayerId, lineupSize);
    if (validation) {
      setError(validation);
      return;
    }
    const payload = buildSoftballLineupPayload(
      fieldSlots,
      lineupSize === 10 ? dhPlayerId : '',
      battingOrder,
      benchIds,
      playersById
    );
    onSave(payload);
    setShowConfirm(false);
  };

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Alineación — {teamName}
          </h3>
          <span className="text-xs text-gray-500 ml-auto">
            {requiredStarters} titulares · {lineupSize === 10 ? 'con DH' : '9 en campo'}
          </span>
        </div>

        {existingStarters.length > 0 ? (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">En campo</p>
              <div className="space-y-2">
                {existingStarters
                  .filter((p) => p.is_on_field !== false && p.position !== 'designated_hitter')
                  .sort((a, b) => (a.batting_order || 99) - (b.batting_order || 99))
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-green-200 bg-green-50 dark:bg-green-950/20"
                    >
                      <span className="w-8 text-center font-bold text-green-700">
                        {entry.batting_order || '—'}
                      </span>
                      <span className="font-medium flex-1">{entry.player_name}</span>
                      <span className="text-xs text-gray-500">
                        #{entry.jersey_number || '—'} · {positionLabel(entry.position)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {existingStarters.some((p) => p.position === 'designated_hitter') && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Bateador designado</p>
                {existingStarters
                  .filter((p) => p.position === 'designated_hitter')
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-violet-200 bg-violet-50 dark:bg-violet-950/20"
                    >
                      <span className="w-8 text-center font-bold text-violet-700">
                        {entry.batting_order || '—'}
                      </span>
                      <span className="font-medium flex-1">{entry.player_name}</span>
                      <span className="text-xs text-gray-500">DH/EP</span>
                    </div>
                  ))}
              </div>
            )}

            {existingBench.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Reservas</p>
                <div className="space-y-2">
                  {existingBench.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 dark:border-gray-800"
                    >
                      <span className="font-medium flex-1">{entry.player_name}</span>
                      <span className="text-xs text-gray-500">
                        #{entry.jersey_number || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">Sin alineación publicada.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Alineación softbol — {teamName}
          </h3>
          <p className="text-sm text-gray-500">
            {requiredStarters} titulares ({lineupSize === 10 ? '9 en campo + DH' : '9 en campo'})
          </p>
        </div>
        {starterIds.length === requiredStarters && (
          <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
            Listo para guardar
          </span>
        )}
      </div>

      {/* Posiciones defensivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SOFTBALL_FIELD_SLOTS.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              {label}
            </span>
            <select
              value={fieldSlots[key]}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              className="w-full rounded-2xl border-gray-300 dark:border-gray-700 text-sm"
            >
              <option value="">Seleccionar jugador</option>
              {availableForSlot(fieldSlots[key], key).map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.jersey_number || '—'} {p.full_name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {lineupSize === 10 && (
        <label className="block">
          <span className="text-xs font-medium text-violet-700 mb-1 block">
            {SOFTBALL_DH_SLOT.label}
          </span>
          <select
            value={dhPlayerId}
            onChange={(e) => handleDhChange(e.target.value)}
            className="w-full rounded-2xl border-violet-300 dark:border-violet-800 text-sm"
          >
            <option value="">Seleccionar bateador designado</option>
            {availableForSlot(dhPlayerId, SOFTBALL_DH_SLOT.key).map((p) => (
              <option key={p.id} value={p.id}>
                #{p.jersey_number || '—'} {p.full_name}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Orden de bateo */}
      {battingOrder.length > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ListOrdered className="w-4 h-4 text-gray-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Orden de bateo</h4>
          </div>
          <div className="space-y-2">
            {battingOrder.map((playerId, index) => {
              const p = playersById[playerId];
              if (!p) return null;
              return (
                <div
                  key={playerId}
                  className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50"
                >
                  <span className="w-6 text-center font-bold text-sm text-green-700">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    #{p.jersey_number || '—'} {p.full_name}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveBatter(index, -1)}
                      disabled={index === 0}
                      className="px-2 py-1 text-xs rounded-lg border disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBatter(index, 1)}
                      disabled={index === battingOrder.length - 1}
                      className="px-2 py-1 text-xs rounded-lg border disabled:opacity-40"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reservas */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Reservas (opcional)
        </p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {players
            .filter((p) => !starterIds.includes(p.id))
            .map((p) => {
              const selected = benchIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleBench(p.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors ${
                    selected
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-medium text-sm flex-1">{p.full_name}</span>
                  <span className="text-xs text-gray-500">#{p.jersey_number || '—'}</span>
                </button>
              );
            })}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={starterIds.length !== requiredStarters || isSaving}
        className="w-full py-2.5 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar alineación ({starterIds.length}/{requiredStarters})
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2">Confirmar alineación</h2>
            <p className="text-sm text-gray-500 mb-4">
              Se publicarán {requiredStarters} titulares
              {benchIds.length > 0 ? ` y ${benchIds.length} reservas` : ''} para {teamName}.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-2 bg-green-600 text-white rounded-2xl text-sm font-medium"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 border rounded-2xl text-sm"
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

export default SoftballLineupBuilder;
