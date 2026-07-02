import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import {
  useNotifications,
  useNotificationUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../../hooks/useNotifications';
import UnreadBadge from '../Chat/UnreadBadge';
import type { Notification } from '../../types/notification';

interface NotificationPanelProps {
  enabled?: boolean;
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ enabled = true }) => {
  const [open, setOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: unreadData } = useNotificationUnreadCount(enabled);
  const { data: listData } = useNotifications(enabled && open);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unreadCount = unreadData?.unread_count ?? 0;
  const items = listData?.results ?? [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id);
    setOpen(false);
    if (n.extra_data?.link) navigate(n.extra_data.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-3xl text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5">
            <UnreadBadge count={unreadCount} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass rounded-3xl shadow-2xl z-50 overflow-hidden border border-gray-200/80 dark:border-gray-700/80">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/80 dark:border-gray-700/80">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Marcar todas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Sin notificaciones
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800/50 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors ${
                    !n.is_read ? 'bg-violet-50/50 dark:bg-violet-950/20' : ''
                  }`}
                >
                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
