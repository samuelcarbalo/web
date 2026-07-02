import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Minus, ChevronRight, Trophy } from 'lucide-react';
import { useRecordInning } from '../../hooks/useSports';
import type { LineScore, Match } from '../../types/sports';

interface Props {
  match: Match;
  lineScore: LineScore | null | undefined;
  regulationInnings: number;
}

type Half = 'top' | 'bottom';
interface Cursor {
  number: number;
  half: Half;
}

/** Primera media entrada aún no registrada (orden: alta antes que baja). */
function firstUnplayed(ls: LineScore | null | undefined, regulation: number): Cursor {
  const count = ls?.innings_count ?? 0;
  const max = Math.max(count, regulation);
  for (let n = 1; n <= max; n++) {
    const top = ls?.away.line[n - 1];
    const bottom = ls?.home.line[n - 1];
    if (!top?.played) return { number: n, half: 'top' };
    if (!bottom?.played) return { number: n, half: 'bottom' };
  }
  return { number: count + 1, half: 'top' };
}

const SoftballLiveControls: React.FC<Props> = ({ match, lineScore, regulationInnings }) => {
  const record = useRecordInning();
  const [cursor, setCursor] = useState<Cursor>(() => firstUnplayed(lineScore, regulationInnings));
  const [draft, setDraft] = useState({ runs: 0, hits: 0, errors: 0 });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && lineScore !== undefined) {
      setCursor(firstUnplayed(lineScore, regulationInnings));
      setInitialized(true);
    }
  }, [lineScore, regulationInnings, initialized]);

  const battingTeam =
    cursor.half === 'top' ? match.away_team_detail?.name : match.home_team_detail?.name;
  const halfLabel = cursor.half === 'top' ? 'Alta ▲' : 'Baja ▼';

  const persist = (next: typeof draft, complete: boolean) => {
    record.mutate({
      id: match.id,
      data: {
        number: cursor.number,
        half: cursor.half,
        runs: next.runs,
        hits: next.hits,
        errors: next.errors,
        is_complete: complete,
        finish: complete,
      },
    });
  };

  const bump = (field: keyof typeof draft, delta: number) => {
    const next = { ...draft, [field]: Math.max(0, draft[field] + delta) };
    setDraft(next);
    persist(next, false);
  };

  const closeHalf = () => {
    persist(draft, true);
    const nextCursor: Cursor =
      cursor.half === 'top'
        ? { number: cursor.number, half: 'bottom' }
        : { number: cursor.number + 1, half: 'top' };
    setCursor(nextCursor);
    setDraft({ runs: 0, hits: 0, errors: 0 });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200/80 dark:border-gray-800/80 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Anotación por entradas</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Entrada <span className="font-bold text-violet-600 dark:text-violet-400">{cursor.number}</span> ·{' '}
            {halfLabel} · batea <span className="font-semibold">{battingTeam}</span>
          </p>
        </div>
        {record.isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      <div className="p-5 space-y-5">
        {/* Carreras */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Carreras</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => bump('runs', -1)}
              disabled={draft.runs === 0}
              className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-3xl font-black tabular-nums w-10 text-center text-gray-900 dark:text-white">
              {draft.runs}
            </span>
            <button
              type="button"
              onClick={() => bump('runs', 1)}
              className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 shadow-sm shadow-violet-300/50 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hits y errores */}
        <div className="grid grid-cols-2 gap-4">
          {(['hits', 'errors'] as const).map((field) => (
            <div key={field} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 rounded-2xl px-3 py-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                {field === 'hits' ? 'Hits' : 'Errores'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bump(field, -1)}
                  disabled={draft[field] === 0}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 flex items-center justify-center disabled:opacity-40"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center font-bold tabular-nums text-gray-800 dark:text-gray-100">
                  {draft[field]}
                </span>
                <button
                  type="button"
                  onClick={() => bump(field, 1)}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={closeHalf}
          disabled={record.isPending}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
          Cerrar media entrada
        </button>
        <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
          <Trophy className="w-3 h-3" />
          El juego se cierra solo por regulación ({regulationInnings} entradas), walk-off o nocaut.
        </p>
      </div>
    </div>
  );
};

export default SoftballLiveControls;
