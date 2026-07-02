import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketUrl } from '../lib/chatApi';
import { chatKeys } from './useChat';
import type { ChatWebSocketEvent, Message } from '../types/chat';

interface UseChatSocketOptions {
  conversationId: string | undefined;
  enabled?: boolean;
  onTyping?: (userId: string, username: string, action: 'start' | 'stop') => void;
  onPresence?: (userId: string, status: 'online' | 'offline') => void;
}

export const useChatSocket = ({
  conversationId,
  enabled = true,
  onTyping,
  onPresence,
}: UseChatSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!conversationId || !enabled) return;

    const url = getWebSocketUrl(conversationId);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    ws.onmessage = (event) => {
      try {
        const data: ChatWebSocketEvent = JSON.parse(event.data);

        if (data.type === 'message.new') {
          queryClient.setQueryData(
            chatKeys.messages(conversationId),
            (old: { pages: { results: Message[] }[] } | undefined) => {
              if (!old) return old;
              const lastPage = old.pages[old.pages.length - 1];
              const exists = lastPage.results.some((m) => m.id === data.message.id);
              if (exists) return old;
              return {
                ...old,
                pages: old.pages.map((page, i) =>
                  i === old.pages.length - 1
                    ? { ...page, results: [...page.results, data.message] }
                    : page
                ),
              };
            }
          );
          queryClient.invalidateQueries({ queryKey: chatKeys.all });
        } else if (data.type === 'typing' && onTyping) {
          onTyping(data.user_id, data.username, data.action);
        } else if (data.type === 'presence' && onPresence) {
          onPresence(data.user_id, data.status);
        }
      } catch {
        // ignore malformed messages
      }
    };
  }, [conversationId, enabled, queryClient, onTyping, onPresence]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  const sendWsMessage = useCallback((body: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message.send', body }));
      return true;
    }
    return false;
  }, []);

  const sendTyping = useCallback((action: 'start' | 'stop') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: `typing.${action}` }));
    }
  }, []);

  const notifyTyping = useCallback(() => {
    sendTyping('start');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping('stop'), 2000);
  }, [sendTyping]);

  const markRead = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'read.mark' }));
    }
  }, []);

  return { isConnected, sendWsMessage, notifyTyping, markRead };
};
