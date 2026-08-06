import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, CreditCard, MessageSquare, Briefcase } from 'lucide-react';
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

const formatCop = (amount?: number | null) => {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const titleFor = (n: Notification) => {
  if (n.extra_data?.title) return n.extra_data.title;
  if (n.type === 'payment_success') return '¡Pago aprobado!';
  if (n.type === 'payment_failed') return 'Pago rechazado';
  if (n.type === 'payment_pending') return 'Pago pendiente';
  if (n.type === 'chat_message') return 'Mensaje';
  if (n.type === 'job_status_change') return 'Postulación';
  return 'Notificación';
};

const TypeIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  if (type.startsWith('payment_')) {
    return <CreditCard className="w-4 h-4 text-secondary-600 dark:text-secondary-400 shrink-0 mt-0.5" />;
  }
  if (type === 'chat_message') {
    return <MessageSquare className="w-4 h-4 text-info-500 shrink-0 mt-0.5" />;
  }
  if (type === 'job_status_change') {
    return <Briefcase className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
  }
  return <Bell className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />;
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
    const link = n.extra_data?.link || (n.type.startsWith('payment_') ? '/creditos?tab=historial' : null);
    if (link) navigate(link);
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
              items.map((n) => {
                const amount = formatCop(n.extra_data?.amount);
                const credits = n.extra_data?.credits_added ?? n.extra_data?.credits;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800/50 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors ${
                      !n.is_read ? 'bg-violet-50/50 dark:bg-violet-950/20' : ''
                    }`}
                  >
                    <div className="flex gap-2">
                      <TypeIcon type={n.type} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {titleFor(n)}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-0.5">
                          {n.message}
                        </p>
                        {n.type.startsWith('payment_') && (credits != null || amount) && (
                          <p className="text-xs text-secondary-700 dark:text-secondary-300 mt-1">
                            {credits != null ? `+${credits} créditos` : null}
                            {credits != null && amount ? ' · ' : null}
                            {amount}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
