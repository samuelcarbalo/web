import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { COLD_START_HINT, subscribeColdStartHint } from '../../lib/coldStartUi';

/** Banner global cuando la primera petición API supera ~3 s (cold start). */
const ColdStartNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeColdStartHint(setVisible), []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-500"
    >
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-violet-200 bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-lg backdrop-blur dark:border-violet-900/60 dark:bg-slate-900/95 dark:text-slate-200">
        <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-violet-600 dark:text-violet-400" aria-hidden="true" />
        <p className="leading-snug">{COLD_START_HINT}</p>
      </div>
    </div>
  );
};

export default ColdStartNotice;
