// hooks/useWorkingGroupChat.ts
import { useState, useEffect, useCallback } from 'react';
import { getOrCreateConversation, sendChatMessage, getChatMessages, getUserConversations } from '@/lib/chat-utils';
import { supabase } from '@/lib/supabase';

export function useWorkingGroupChat(groupId: string, userId: string, userRole: string) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<string[]>([]);

  // Get working group members
  const getGroupMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('working_group_members')
        .select('user_id')
        .eq('working_group_id', groupId);

      if (error) throw error;
      const memberIds = data?.map(m => m.user_id) || [];
      setParticipants(memberIds);
      return memberIds;
    } catch (error) {
      console.error('Error getting group members:', error);
      return [];
    }
  }, [groupId]);

  // Initialize or get group chat
  const initializeGroupChat = useCallback(async () => {
    setLoading(true);
    try {
      const memberIds = await getGroupMembers();
      
      if (memberIds.length === 0) {
        setLoading(false);
        return;
      }

      // Include the current user if not already in the list
      if (!memberIds.includes(userId)) {
        memberIds.push(userId);
      }

      // Get or create conversation
      const convId = await getOrCreateConversation(userId, memberIds, 'group');
      setConversationId(convId);

      if (convId) {
        const msgs = await getChatMessages(convId);
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Error initializing group chat:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId, userId, getGroupMembers]);

  // Send a message to the group
  const sendGroupMessage = useCallback(async (message: string, file?: File) => {
    if (!conversationId) return;

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const newMessage = await sendChatMessage(
        conversationId,
        userId,
        user?.full_name || 'User',
        message,
        file ? 'file' : 'text',
        file
      );

      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Error sending group message:', error);
    }
  }, [conversationId, userId]);

  // Setup real-time subscription for group messages
  useEffect(() => {
    if (!conversationId) return;

    const subscription = supabase
      .channel(`group-chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversationId]);

  useEffect(() => {
    initializeGroupChat();
  }, [initializeGroupChat]);

  return {
    conversationId,
    messages,
    loading,
    sendGroupMessage,
    participants,
    refresh: initializeGroupChat,
  };
}