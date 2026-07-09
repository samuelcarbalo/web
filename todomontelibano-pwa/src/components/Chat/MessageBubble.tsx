import React from 'react';
import { CheckCheck } from 'lucide-react';
import type { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isOwn = message.is_own;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-3xl ${
          isOwn
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-md'
            : 'card-static py-2.5 rounded-bl-md'
        }`}
      >
        {!isOwn && (
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">
            {message.sender.full_name || message.sender.username}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? 'justify-end text-violet-200' : 'justify-end text-gray-400'
          }`}
        >
          {message.is_edited && (
            <span className="text-[10px] italic mr-1">editado</span>
          )}
          <span className="text-[10px]">{formatTime(message.created_at)}</span>
          {isOwn && <CheckCheck className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
