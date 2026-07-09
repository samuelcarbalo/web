/** Posiciones defensivas de softbol (9 en campo). */
export const SOFTBALL_FIELD_SLOTS = [
  { key: 'pitcher', label: 'P — Lanzador' },
  { key: 'catcher', label: 'C — Receptor' },
  { key: 'first_base', label: '1B — Primera base' },
  { key: 'second_base', label: '2B — Segunda base' },
  { key: 'third_base', label: '3B — Tercera base' },
  { key: 'shortstop', label: 'SS — Shortstop' },
  { key: 'left_field', label: 'LF — Jardinero izquierdo' },
  { key: 'center_field', label: 'CF — Jardinero central' },
  { key: 'right_field', label: 'RF — Jardinero derecho' },
] as const;

export const SOFTBALL_DH_SLOT = {
  key: 'designated_hitter',
  label: 'DH/EP — Bateador designado (extra por el pitcher)',
} as const;

export type SoftballFieldKey =
  | (typeof SOFTBALL_FIELD_SLOTS)[number]['key']
  | typeof SOFTBALL_DH_SLOT.key;

export function getSoftballStarterCount(lineupSize: number): number {
  return lineupSize === 10 ? 10 : 9;
}

export function positionLabel(position?: string): string {
  const map: Record<string, string> = {
    pitcher: 'P',
    catcher: 'C',
    first_base: '1B',
    second_base: '2B',
    third_base: '3B',
    shortstop: 'SS',
    left_field: 'LF',
    center_field: 'CF',
    right_field: 'RF',
    designated_hitter: 'DH',
    utility: 'UT',
  };
  return map[position || ''] || position || '—';
}

export interface SoftballLineupPayloadPlayer {
  player: string;
  is_starter: boolean;
  position: string;
  jersey_number?: number;
  batting_order?: number;
}

export function buildSoftballLineupPayload(
  fieldSlots: Record<string, string>,
  dhPlayerId: string,
  battingOrder: string[],
  benchPlayerIds: string[],
  playersById: Record<string, { jersey_number?: number; position?: string }>
): SoftballLineupPayloadPlayer[] {
  const payload: SoftballLineupPayloadPlayer[] = [];

  SOFTBALL_FIELD_SLOTS.forEach(({ key }) => {
    const playerId = fieldSlots[key];
    if (!playerId) return;
    const order = battingOrder.indexOf(playerId) + 1;
    payload.push({
      player: playerId,
      is_starter: true,
      position: key,
      jersey_number: playersById[playerId]?.jersey_number,
      batting_order: order > 0 ? order : undefined,
    });
  });

  if (dhPlayerId) {
    const order = battingOrder.indexOf(dhPlayerId) + 1;
    payload.push({
      player: dhPlayerId,
      is_starter: true,
      position: SOFTBALL_DH_SLOT.key,
      jersey_number: playersById[dhPlayerId]?.jersey_number,
      batting_order: order > 0 ? order : undefined,
    });
  }

  benchPlayerIds.forEach((playerId) => {
    payload.push({
      player: playerId,
      is_starter: false,
      position: playersById[playerId]?.position || 'utility',
      jersey_number: playersById[playerId]?.jersey_number,
    });
  });

  return payload;
}

export function validateSoftballLineupState(
  fieldSlots: Record<string, string>,
  dhPlayerId: string,
  lineupSize: number
): string | null {
  const missingField = SOFTBALL_FIELD_SLOTS.find(({ key }) => !fieldSlots[key]);
  if (missingField) {
    return `Falta asignar jugador en ${missingField.label}.`;
  }

  const assigned = [
    ...SOFTBALL_FIELD_SLOTS.map(({ key }) => fieldSlots[key]).filter(Boolean),
    ...(lineupSize === 10 ? [dhPlayerId] : []),
  ];
  if (new Set(assigned).size !== assigned.length) {
    return 'Un jugador no puede ocupar dos posiciones.';
  }

  if (lineupSize === 10 && !dhPlayerId) {
    return 'Debes asignar el bateador designado (DH/EP).';
  }

  return null;
}
