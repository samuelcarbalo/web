import React, { useEffect, useState } from 'react';

type Props = {
  endTime: string;
  className?: string;
};

function formatRemaining(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 48) {
    const days = Math.floor(h / 24);
    return `${days}d ${pad(h % 24)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Cuenta regresiva hasta end_time de una flash sale. */
const FlashSaleCountdown: React.FC<Props> = ({ endTime, className = '' }) => {
  const [label, setLabel] = useState(() =>
    formatRemaining(new Date(endTime).getTime() - Date.now()),
  );

  useEffect(() => {
    const tick = () => {
      setLabel(formatRemaining(new Date(endTime).getTime() - Date.now()));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endTime]);

  return (
    <span className={`tabular-nums font-bold ${className}`} aria-live="polite">
      {label}
    </span>
  );
};

export default FlashSaleCountdown;
