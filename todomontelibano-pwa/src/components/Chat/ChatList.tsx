import React from 'react';
import { Briefcase, Home, MessageSquare } from 'lucide-react';
import UnreadBadge from './UnreadBadge';
import type { Conversation } from '../../types/chat';

interface ChatListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

const formatRelativeTime = (dateStr: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const typeIcon = (type: string) => {
  if (type === 'job') return Briefcase;
  if (type === 'real_estate') return Home;
  return MessageSquare;
};

const ChatList: React.FC<ChatListProps> = ({
  conversations,
  activeId,
  onSelect,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No tienes conversaciones aún</p>
        <p className="text-sm mt-1">Postúlate a una oferta para iniciar un chat</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1">
      {conversations.map((conv) => {
        const other = conv.other_participant;
        const Icon = typeIcon(conv.conversation_type);
        const isActive = conv.id === activeId;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
              isActive ? 'bg-violet-50 dark:bg-violet-950/30' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {(other?.full_name || other?.username || '?').charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <Icon className="w-3 h-3 text-violet-600" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-900 dark:text-white truncate">
                  {other?.full_name || other?.username || conv.subject}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatRelativeTime(conv.last_message_at)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {conv.last_message_preview || conv.context?.title || 'Sin mensajes'}
                </p>
                <UnreadBadge count={conv.unread_count} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChatList;
