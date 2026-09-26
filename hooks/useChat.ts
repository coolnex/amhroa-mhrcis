// hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { chatService } from '@/lib/chat-service';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  metadata?: any;
}

interface Conversation {
  id: string;
  participant_ids: string[];
  participant_names: string[];
  type: string;
  last_message: string;
  last_message_at: string;
  unread_count?: number;
  metadata?: any;
}

const isValidUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export function useChat(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  
  const userIdRef = useRef<string>(userId);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    userIdRef.current = userId;
    
    // Reset chat service when userId changes (e.g., new login)
    if (userId && isValidUUID(userId)) {
      // Clear cache for this user
      chatService.clearUserCache(userId);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [userId]);

  const fetchConversations = useCallback(async () => {
    const currentUserId = userIdRef.current;
    
    if (!currentUserId || !isValidUUID(currentUserId)) {
      console.log('ℹ️ Invalid user ID, skipping conversation fetch.');
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('ℹ️ Already fetching conversations, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      const { data: convs, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .contains('participant_ids', [currentUserId])
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      if (!mountedRef.current) return;

      // Get unread counts from database directly (don't use cache for initial load)
      const conversationsWithCounts = await Promise.all(
        (convs || []).map(async (conv) => {
          // Always fetch from database on initial load
          const { count, error: countError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', currentUserId);

          const unreadCount = countError ? 0 : count || 0;
          
          // Update cache
          if (unreadCount > 0) {
            chatService.setUnreadCount(conv.id, unreadCount);
          } else {
            chatService.resetUnreadCount(conv.id);
          }

          return { ...conv, unread_count: unreadCount };
        })
      );

      if (mountedRef.current) {
        setConversations(conversationsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, []);

  // Real-time subscription with proper unread count management
  useEffect(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId || !isValidUUID(currentUserId)) {
      return;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    const channelName = `chat_user_${currentUserId}`;
    chatService.trackChannel(channelName);
    const chatChannel = supabase.channel(channelName);

    chatChannel.on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages' 
      },
      (payload) => {
        const newMessage = payload.new as Message;
        
        // Only process if user is a participant
        const conversation = conversations.find(c => c.id === newMessage.conversation_id);
        if (!conversation || !conversation.participant_ids.includes(currentUserId)) {
          return;
        }

        // Add message to UI
        setMessages(prev => {
          const currentRoomMessages = prev[newMessage.conversation_id] || [];
          if (currentRoomMessages.some(m => m.id === newMessage.id)) return prev;
          return {
            ...prev,
            [newMessage.conversation_id]: [...currentRoomMessages, newMessage]
          };
        });

        // Update unread count ONLY if the message is from someone else
        // AND the conversation is not currently active
        if (newMessage.sender_id !== currentUserId) {
          const shouldIncrement = activeConversation !== newMessage.conversation_id;
          
          if (shouldIncrement) {
            const newCount = chatService.incrementUnreadCount(newMessage.conversation_id);
            
            // Update conversation list
            setConversations(prev => prev.map(c => {
              if (c.id === newMessage.conversation_id) {
                return { ...c, unread_count: newCount };
              }
              return c;
            }));
          }
        }

        // Update last message
        setConversations(prev => prev.map(c => 
          c.id === newMessage.conversation_id 
            ? { ...c, last_message: newMessage.message, last_message_at: newMessage.created_at }
            : c
        ));
      }
    );

    // Also listen for updates to messages (for when they're marked as read)
    chatChannel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages'
      },
      (payload) => {
        const updatedMessage = payload.new as Message;
        
        // If a message was marked as read, update the unread count
        if (updatedMessage.is_read && updatedMessage.sender_id !== currentUserId) {
          // Refresh the unread count for this conversation
          const conversationId = updatedMessage.conversation_id;
          
          // Check if all messages in this conversation are now read
          const refreshUnreadCount = async () => {
            const { count, error } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conversationId)
              .eq('is_read', false)
              .neq('sender_id', currentUserId);
            
            if (!error) {
              const newCount = count || 0;
              if (newCount === 0) {
                chatService.resetUnreadCount(conversationId);
              } else {
                chatService.setUnreadCount(conversationId, newCount);
              }
              
              setConversations(prev => prev.map(c => 
                c.id === conversationId ? { ...c, unread_count: newCount } : c
              ));
            }
          };
          
          refreshUnreadCount();
        }
      }
    );

    chatChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('📡 Real-time chat subscribed.');
        isSubscribedRef.current = true;
      }
    });

    channelRef.current = chatChannel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [userId, conversations, activeConversation]);

  const markMessagesAsRead = useCallback(async (conversationId: string, currentUserId: string) => {
    if (!conversationId || !currentUserId) return;
  
    try {
      // First, get all unread messages from others
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', currentUserId);

      if (fetchError) {
        console.error('Error fetching unread messages:', fetchError);
        return;
      }

      if (!unreadMessages || unreadMessages.length === 0) {
        // No unread messages, just reset cache
        chatService.resetUnreadCount(conversationId);
        setConversations(prev => prev.map(c => 
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        ));
        return;
      }

      // Mark them as read
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', currentUserId);
  
      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }
  
      // Reset unread count in cache
      chatService.resetUnreadCount(conversationId);
  
      // Update conversation list
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    const currentUserId = userIdRef.current;
    if (!conversationId || !currentUserId) return;

    try {
      const { data: conv, error: convError } = await supabase
        .from('chat_conversations')
        .select('participant_ids')
        .eq('id', conversationId)
        .single();

      if (convError || !conv) {
        console.error('Conversation not found');
        return;
      }

      if (!conv.participant_ids.includes(currentUserId)) {
        console.error('User is not a participant');
        return;
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (mountedRef.current) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: data || []
        }));
      }

      // Mark messages as read when fetching
      await markMessagesAsRead(conversationId, currentUserId);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [markMessagesAsRead]);

  const sendMessage = useCallback(async (conversationId: string, message: string, type: string = 'text', file?: File) => {
    const currentUserId = userIdRef.current;
    if (!currentUserId || (!message.trim() && !file)) return;

    try {
      const { data: conv, error: convError } = await supabase
        .from('chat_conversations')
        .select('participant_ids')
        .eq('id', conversationId)
        .single();

      if (convError || !conv) {
        console.error('Conversation not found');
        return;
      }

      if (!conv.participant_ids.includes(currentUserId)) {
        console.error('User is not a participant');
        return;
      }

      let senderName = 'User';
      if (isValidUUID(currentUserId)) {
        const { data: userData } = await supabase.from('users').select('full_name').eq('id', currentUserId).single();
        senderName = userData?.full_name || 'User';
      }

      const messagePayload = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        sender_name: senderName,
        message: message || (file ? '📎 File shared' : ''),
        message_type: type,
        is_read: false,
        created_at: new Date().toISOString()
      };

      // Optimistic update
      const mockId = `temp_${Date.now()}`;
      const optimisticMsg = { id: mockId, ...messagePayload };
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), optimisticMsg]
      }));

      const { data: savedData, error } = await supabase
        .from('chat_messages')
        .insert(messagePayload)
        .select()
        .single();

      if (error) throw error;

      // Replace temp message with real one
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(m => m.id === mockId ? savedData : m)
      }));

      // Update conversation last message
      await supabase
        .from('chat_conversations')
        .update({
          last_message: message || '📎 File shared',
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, []);

  const createConversation = useCallback(async (participantIds: string[], type: string = 'direct') => {
    const currentUserId = userIdRef.current;
    if (!currentUserId || !isValidUUID(currentUserId)) {
      console.error("❌ Cannot create conversation: Invalid User ID.");
      return null;
    }

    const allIds = Array.from(new Set([...participantIds, currentUserId]));
    const validUUIDs = allIds.filter(id => isValidUUID(id));

    try {
      if (type === 'direct' && validUUIDs.length === 2) {
        const { data: existingConvs, error: lookupError } = await supabase
          .from('chat_conversations')
          .select('*')
          .contains('participant_ids', validUUIDs)
          .eq('type', 'direct');

        if (!lookupError && existingConvs) {
          const exactMatch = existingConvs.find(
            c => c.participant_ids?.length === validUUIDs.length
          );
          if (exactMatch) {
            setConversations(prev => prev.some(p => p.id === exactMatch.id) ? prev : [exactMatch, ...prev]);
            return exactMatch;
          }
        }
      }

      let participantNames: string[] = [];
      if (validUUIDs.length > 0) {
        const { data: userProfiles } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', validUUIDs);

        if (userProfiles) {
          participantNames = validUUIDs.map(id => {
            const profile = userProfiles.find(u => u.id === id);
            return profile?.full_name || 'User';
          });
        }
      }

      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          participant_ids: validUUIDs,
          participant_names: participantNames,
          type: type,
          last_message: 'Conversation started',
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setConversations(prev => [data, ...prev]);
      return data;

    } catch (error: any) {
      console.error('❌ Error creating conversation:', error);
      return null;
    }
  }, []);

  // Refresh unread counts (useful after login)
  const refreshUnreadCounts = useCallback(async () => {
    const currentUserId = userIdRef.current;
    if (!currentUserId || !isValidUUID(currentUserId)) return;

    try {
      const updatedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const { count, error } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', currentUserId);

          const unreadCount = error ? 0 : count || 0;
          
          // Update cache
          if (unreadCount > 0) {
            chatService.setUnreadCount(conv.id, unreadCount);
          } else {
            chatService.resetUnreadCount(conv.id);
          }

          return { ...conv, unread_count: unreadCount };
        })
      );

      if (mountedRef.current) {
        setConversations(updatedConversations);
      }
    } catch (error) {
      console.error('Error refreshing unread counts:', error);
    }
  }, [conversations]);

  return {
    conversations,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    refreshUnreadCounts
  };
}