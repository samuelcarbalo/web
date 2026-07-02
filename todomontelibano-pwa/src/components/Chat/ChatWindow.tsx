import React, { useEffect, useRef, useState, useCallback } from 'react';
import ChatHeader from './ChatHeader';
import ChatComposer from './ChatComposer';
import MessageBubble from './MessageBubble';
import {
  useConversation,
  useMessages,
  useSendMessage,
  useMarkAsRead,
} from '../../hooks/useChat';
import { useChatSocket } from '../../hooks/useChatSocket';
import type { Message } from '../../types/chat';

interface ChatWindowProps {
  conversationId: string;
  onBack?: () => void;
  showBack?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  onBack,
  showBack = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: conversation } = useConversation(conversationId);
  const { data: messagesData, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(conversationId);
  const sendMutation = useSendMessage(conversationId);
  const markReadMutation = useMarkAsRead(conversationId);

  const handleTyping = useCallback((_userId: string, username: string, action: 'start' | 'stop') => {
    if (action === 'start') {
      setTypingUser(username);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTypingUser(null), 3000);
    } else {
      setTypingUser(null);
    }
  }, []);

  const { isConnected, sendWsMessage, notifyTyping, markRead } = useChatSocket({
    conversationId,
    enabled: !!conversationId,
    onTyping: handleTyping,
  });

  const allMessages: Message[] =
    messagesData?.pages.flatMap((page) => page.results) ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  useEffect(() => {
    if (conversationId) {
      markReadMutation.mutate();
      markRead();
    }
  }, [conversationId]);

  const handleSend = async (text: string) => {
    const sentViaWs = sendWsMessage(text);
    if (!sentViaWs) {
      await sendMutation.mutateAsync({ body: text });
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || !hasNextPage || isFetchingNextPage) return;
    if (container.scrollTop < 100) {
      fetchNextPage();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        conversation={conversation}
        isTyping={!!typingUser}
        typingUsername={typingUser || undefined}
        onBack={onBack}
        showBack={showBack}
      />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600" />
          </div>
        )}
        {allMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!isConnected && (
        <div className="px-4 py-1 text-xs text-center text-amber-600 bg-amber-50 dark:bg-amber-950/30">
          Reconectando... Los mensajes se enviarán por HTTP.
        </div>
      )}

      <ChatComposer
        onSend={handleSend}
        onTyping={notifyTyping}
        disabled={sendMutation.isPending}
      />
    </div>
  );
};

export default ChatWindow;
