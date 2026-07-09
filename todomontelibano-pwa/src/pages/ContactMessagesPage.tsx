import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Search,
  Loader2,
  CheckCircle2,
  Circle,
  Inbox,
  Clock,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useContactMessages, useMarkContactMessageRead } from '../hooks/useContact';
import type { ContactMessage } from '../lib/contactApi';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const ContactMessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    const params: { is_read?: boolean; search?: string } = {};
    if (filter === 'unread') params.is_read = false;
    if (filter === 'read') params.is_read = true;
    if (search.trim()) params.search = search.trim();
    return params;
  }, [filter, search]);

  const { data: messages = [], isLoading, isError } = useContactMessages(
    !!user?.is_superuser,
    queryParams
  );
  const markRead = useMarkContactMessageRead();

  const selected = messages.find((m) => m.id === selectedId) ?? messages[0] ?? null;

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const toggleRead = (msg: ContactMessage) => {
    markRead.mutate({ id: msg.id, is_read: !msg.is_read });
  };

  return (
    <div className="page-container page-section">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al dashboard
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-8 h-8 text-violet-600" />
            Mensajes de contacto
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bandeja exclusiva para superusuario. Solo tú puedes ver estos mensajes.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-sm font-semibold">
            <Mail className="w-4 h-4" />
            {unreadCount} sin leer
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Lista */}
        <div className="lg:col-span-2 card-static !p-0 overflow-hidden flex flex-col min-h-[420px]">
          <div className="p-4 border-b border-gray-200/80 dark:border-gray-800/80 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar por nombre, email o asunto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 py-2.5 text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'unread', 'read'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-semibold transition-colors ${
                    filter === key
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {key === 'all' ? 'Todos' : key === 'unread' ? 'Sin leer' : 'Leídos'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              </div>
            )}
            {isError && (
              <p className="p-6 text-sm text-red-600 dark:text-red-400">
                No se pudieron cargar los mensajes. Verifica que tu cuenta sea superusuario.
              </p>
            )}
            {!isLoading && !isError && messages.length === 0 && (
              <p className="p-8 text-center text-gray-500 text-sm">No hay mensajes con estos filtros.</p>
            )}
            {messages.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => setSelectedId(msg.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  selected?.id === msg.id ? 'bg-violet-50 dark:bg-violet-950/30' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.is_read ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-amber-500/20" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                      {msg.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{msg.email}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-1">
                      {msg.subject || msg.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">{formatDate(msg.created_at)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle */}
        <div className="lg:col-span-3 card-static min-h-[420px]">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-gray-500">
              <Mail className="w-12 h-12 mb-3 opacity-40" />
              <p>Selecciona un mensaje para ver el detalle</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selected.subject || 'Sin asunto'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDate(selected.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleRead(selected)}
                  disabled={markRead.isPending}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-colors ${
                    selected.is_read
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selected.is_read ? 'Marcar como no leído' : 'Marcar como leído'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Remitente</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selected.name}</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-violet-600 dark:text-violet-400 hover:underline break-all"
                  >
                    {selected.email}
                  </a>
                </div>
                {selected.organization_name && (
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Tenant
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">{selected.organization_name}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Mensaje</p>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>
              </div>

              {selected.ip_address && (
                <p className="text-xs text-gray-400">IP: {selected.ip_address}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessagesPage;
