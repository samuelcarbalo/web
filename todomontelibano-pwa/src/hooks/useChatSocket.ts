import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketUrl } from '../lib/chatApi';
import { openSafeWebSocket } from '../lib/notificationsRealtime';
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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const closeSocket = useCallback(() => {
    const ws = wsRef.current;
    wsRef.current = null;
    if (!ws) return;
    try {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    } catch {
      /* ignore */
    }
  }, []);

  const connect = useCallback(() => {
    if (!conversationId || !enabled) return;

    closeSocket();
    const url = getWebSocketUrl(conversationId);
    const ws = openSafeWebSocket(url);
    if (!ws) {
      setIsConnected(false);
      return;
    }

    wsRef.current = ws;
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => {
      setIsConnected(false);
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    };

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
          void queryClient.invalidateQueries({ queryKey: chatKeys.all });
        } else if (data.type === 'typing' && onTyping) {
          onTyping(data.user_id, data.username, data.action);
        } else if (data.type === 'presence' && onPresence) {
          onPresence(data.user_id, data.status);
        }
      } catch {
        // ignore malformed messages
      }
    };
  }, [conversationId, enabled, queryClient, onTyping, onPresence, closeSocket]);

  useEffect(() => {
    connect();

    if (conversationId && enabled) {
      pollRef.current = setInterval(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          void queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
          void queryClient.invalidateQueries({ queryKey: chatKeys.all });
        }
      }, 20_000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      closeSocket();
      setIsConnected(false);
    };
  }, [connect, conversationId, enabled, queryClient, closeSocket]);

  const sendWsMessage = useCallback((body: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'message.send', body }));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  const sendTyping = useCallback((action: 'start' | 'stop') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: `typing.${action}` }));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const notifyTyping = useCallback(() => {
    sendTyping('start');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping('stop'), 2000);
  }, [sendTyping]);

  const markRead = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'read.mark' }));
      } catch {
        /* ignore */
      }
    }
  }, []);

  return { isConnected, sendWsMessage, notifyTyping, markRead };
};
