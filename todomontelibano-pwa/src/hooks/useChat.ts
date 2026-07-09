import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getConversations,
  getConversation,
  getConversationByApplication,
  getMessages,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
  startRealEstateChat,
} from '../lib/chatApi';
import type { SendMessagePayload, StartRealEstateChatPayload } from '../types/chat';

export const chatKeys = {
  all: ['conversations'] as const,
  list: (type?: string) => [...chatKeys.all, 'list', type] as const,
  detail: (id: string) => [...chatKeys.all, 'detail', id] as const,
  messages: (id: string) => [...chatKeys.all, 'messages', id] as const,
  unread: () => [...chatKeys.all, 'unread'] as const,
  byApplication: (appId: string) => [...chatKeys.all, 'application', appId] as const,
};

export const useConversations = (type?: string) => {
  return useQuery({
    queryKey: chatKeys.list(type),
    queryFn: () => getConversations(type ? { type } : undefined),
    refetchInterval: 30000,
  });
};

export const useConversation = (id: string | undefined) => {
  return useQuery({
    queryKey: chatKeys.detail(id || ''),
    queryFn: () => getConversation(id!),
    enabled: !!id,
  });
};

export const useConversationByApplication = (applicationId: string | undefined) => {
  return useQuery({
    queryKey: chatKeys.byApplication(applicationId || ''),
    queryFn: () => getConversationByApplication(applicationId!),
    enabled: !!applicationId,
    retry: false,
  });
};

export const useMessages = (conversationId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId || ''),
    queryFn: ({ pageParam = 1 }) =>
      getMessages(conversationId!, { page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      if (lastPage.links?.next) {
        return (lastPageParam as number) + 1;
      }
      return undefined;
    },
    enabled: !!conversationId,
    refetchInterval: 10000,
  });
};

export const useUnreadCount = (enabled = true) => {
  return useQuery({
    queryKey: chatKeys.unread(),
    queryFn: getUnreadCount,
    refetchInterval: 15000,
    enabled,
  });
};

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessagePayload) => sendMessage(conversationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
};

export const useMarkAsRead = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markConversationAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
};

export const useStartRealEstateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartRealEstateChatPayload) => startRealEstateChat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
};
