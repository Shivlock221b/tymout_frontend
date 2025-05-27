import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import chatApi from '../../services/chatApi';

// Default page size for infinite scrolling
const PAGE_SIZE = 50;

/* -------------------------------------------------------------------------- */
/*                            CHAT LIST / PREVIEW                             */
/* -------------------------------------------------------------------------- */

export const useChatList = (userId, options = {}) =>
  useQuery({
    queryKey: ['chats', userId],
    queryFn: () => chatApi.getUserChats(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
    ...options
  });

export const useChatPreview = (chatId, userId, options = {}) =>
  useQuery({
    queryKey: ['chatPreview', chatId, userId],
    queryFn: () => chatApi.getChatPreview(chatId, userId),
    enabled: !!chatId && !!userId,
    staleTime: 15 * 1000,
    ...options
  });

/* -------------------------------------------------------------------------- */
/*                            CHAT MESSAGES LIST                              */
/* -------------------------------------------------------------------------- */

export const useChatMessages = (chatId, options = {}) =>
  useInfiniteQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: ({ pageParam = 0 }) =>
      chatApi.getMessages(chatId, { skip: pageParam, limit: PAGE_SIZE }),
    enabled: !!chatId,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.hasMore) return allPages.length * PAGE_SIZE;
      return undefined;
    },
    ...options
  });

/* -------------------------------------------------------------------------- */
/*                                MUTATIONS                                   */
/* -------------------------------------------------------------------------- */

// Send message with optimistic UI update
export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => chatApi.sendMessage(payload),

    onMutate: async (payload) => {
      const { chatId, text } = payload;

      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['chatMessages', chatId] });

      // Snapshot
      const previousData = queryClient.getQueryData(['chatMessages', chatId]);

      // Optimistically add a temp message at the end of first page
      queryClient.setQueryData(['chatMessages', chatId], (old) => {
        if (!old) return old;
        const tmpMsg = {
          _id: `tmp_${Date.now()}`,
          senderId: payload.senderId,
          senderName: payload.senderName,
          senderAvatar: payload.senderAvatar,
          text,
          timestamp: new Date().toISOString(),
          status: 'sending'
        };
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          messages: [...newPages[0].messages, tmpMsg]
        };
        return { ...old, pages: newPages, pageParams: old.pageParams };
      });

      return { previousData };
    },

    onError: (err, payload, context) => {
      // Rollback
      const { chatId } = payload;
      queryClient.setQueryData(['chatMessages', chatId], context.previousData);
    },

    onSettled: (data, error, payload) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', payload.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats', payload.senderId] });
    }
  });
};

// Mark messages as read
export const useMarkChatAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, userId }) => chatApi.markAsRead(chatId, userId),
    onSuccess: (_, { chatId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chatPreview', chatId, userId] });
      queryClient.invalidateQueries({ queryKey: ['chats', userId] });
    }
  });
};

// Start or fetch a direct chat between two users
export const useStartDirectChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userAId, userBId, userAName, userBName, userAAvatar, userBAvatar }) => 
      chatApi.startDirectChat(userAId, userBId, userAName, userBName, userAAvatar, userBAvatar),
    onSuccess: (data, variables) => {
      // Refresh chat list for the initiating user so the new thread appears
      queryClient.invalidateQueries({ queryKey: ['chats', variables.userAId] });
    }
  });
};
