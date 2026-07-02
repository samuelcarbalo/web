import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, Home, ExternalLink } from 'lucide-react';
import type { Conversation } from '../../types/chat';

interface ChatHeaderProps {
  conversation: Conversation;
  isTyping?: boolean;
  typingUsername?: string;
  onBack?: () => void;
  showBack?: boolean;
}

const contextIcon = (type: string) => {
  if (type === 'job' || type === 'job_application') return Briefcase;
  if (type === 'real_estate') return Home;
  return Briefcase;
};

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  isTyping,
  typingUsername,
  onBack,
  showBack = false,
}) => {
  const other = conversation.other_participant;
  const ctx = conversation.context;
  const Icon = ctx ? contextIcon(ctx.type) : Briefcase;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
      {showBack && onBack && (
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {(other?.full_name || other?.username || '?').charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white truncate">
          {other?.full_name || other?.username || conversation.subject}
        </h3>
        {isTyping ? (
          <p className="text-xs text-violet-600 dark:text-violet-400 animate-pulse">
            {typingUsername} está escribiendo...
          </p>
        ) : ctx ? (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Icon className="w-3 h-3" />
            <span className="truncate">{ctx.title}</span>
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {conversation.subject}
          </p>
        )}
      </div>

      {ctx?.url_path && (
        <Link
          to={ctx.url_path}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Ver contexto"
        >
          <ExternalLink className="w-4 h-4 text-gray-500" />
        </Link>
      )}
    </div>
  );
};

export default ChatHeader;
