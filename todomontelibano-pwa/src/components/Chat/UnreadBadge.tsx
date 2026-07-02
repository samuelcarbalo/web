import React from 'react';

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, className = '' }) => {
  if (count <= 0) return null;

  const display = count > 99 ? '99+' : count;

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white bg-violet-600 rounded-full ${className}`}
    >
      {display}
    </span>
  );
};

export default UnreadBadge;
