// hooks/useGuestChat.ts
"use client";

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

export function useGuestChat(guestId: string, guestName: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [effectiveGuestId, setEffectiveGuestId] = useState<string>('');
  const [effectiveGuestName, setEffectiveGuestName] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const channelRef = useRef<any>(null);
  const isMounted = useRef(true);
  const initAttempted = useRef(false);

  // Initialize guest data
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let newGuestId = guestId || chatService.getGuestId();
    let newGuestName = guestName || chatService.getGuestName();

    setEffectiveGuestId(newGuestId);
    setEffectiveGuestName(newGuestName);
    setIsInitialized(true);

    console.log('✅ Guest chat initialized with ID:', newGuestId, 'Name:', newGuestName);
  }, [guestId, guestName]);

  // Get or create admin conversation
  const getAdminConversation = useCallback(async () => {
    const currentGuestId = effectiveGuestId || chatService.getGuestId();
    const currentGuestName = effectiveGuestName || chatService.getGuestName();

    if (!currentGuestId) {
      console.error('❌ No guest ID available');
      return null;
    }

    console.log('🔍 Looking for guest conversation for:', currentGuestId);

    try {
      // First, try to find existing conversation
      const { data: existing, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('*')
        .contains('participant_ids', [currentGuestId])
        .eq('type', 'guest')
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error fetching conversation:', fetchError);
        return null;
      }

      if (existing) {
        console.log('✅ Found existing guest conversation:', existing.id);
        setActiveConversation(existing.id);
        return existing.id;
      }

      console.log('📝 Creating new guest conversation...');

      // Create new guest conversation with admin
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          participant_ids: [currentGuestId, 'admin'],
          participant_names: [currentGuestName, 'Admin Support'],
          type: 'guest',
          created_by: currentGuestId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message: 'Welcome! How can we help you?',
          last_message_at: new Date().toISOString(),
          metadata: {
            is_guest: true,
            guest_name: currentGuestName,
            guest_id: currentGuestId
          }
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating guest conversation:', error);
        console.error('Error details:', error.message);
        return null;
      }
      
      if (data) {
        console.log('✅ Created new guest conversation:', data.id);
        setActiveConversation(data.id);
        return data.id;
      }
    } catch (error) {
      console.error('Error in getAdminConversation:', error);
    }
    return null;
  }, [effectiveGuestId, effectiveGuestName]);

  // Send a message as guest
  const sendGuestMessage = useCallback(async (message: string, type: string = 'text') => {
    const currentGuestId = effectiveGuestId || chatService.getGuestId();
    const currentGuestName = effectiveGuestName || chatService.getGuestName();
    
    if (!currentGuestId) {
      console.error('❌ No guest ID available');
      return;
    }

    // Get or create conversation
    let conversationId = activeConversation;
    if (!conversationId) {
      conversationId = await getAdminConversation();
    }
    
    if (!conversationId) {
      console.error('❌ No conversation available');
      return;
    }

    if (!message.trim()) {
      console.log('⚠️ Cannot send empty message');
      return;
    }

    console.log('📤 Sending guest message to conversation:', conversationId);
    console.log('📤 Message:', message);

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentGuestId,
          sender_name: currentGuestName,
          message: message,
          message_type: type,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        return;
      }

      // Update conversation last message
      await supabase
        .from('chat_conversations')
        .update({
          last_message: message,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (data && isMounted.current) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), data]
        }));
        console.log('✅ Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending guest message:', error);
    }
  }, [activeConversation, effectiveGuestId, effectiveGuestName, getAdminConversation]);

  // Fetch messages
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        return;
      }
      
      if (isMounted.current) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: data || []
        }));
        console.log(`✅ Fetched ${data?.length || 0} messages`);
      }
    } catch (error) {
      console.error('Error fetching guest messages:', error);
    }
  }, []);

  // Setup real-time subscription
  useEffect(() => {
    const convId = activeConversation;
    if (!convId || typeof window === 'undefined') return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('🔌 Setting up real-time subscription for guest conversation:', convId);

    const channel = supabase
      .channel(`guest-chat-${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (isMounted.current) {
            console.log('📩 New guest message received:', newMessage);
            setMessages(prev => ({
              ...prev,
              [convId]: [...(prev[convId] || []), newMessage]
            }));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [activeConversation]);

  // Initialize conversation on mount
  useEffect(() => {
    if (!isInitialized || initAttempted.current) return;

    const init = async () => {
      if (typeof window === 'undefined') return;
      
      initAttempted.current = true;
      
      try {
        console.log('🔍 Initializing guest chat...');
        console.log('📋 Guest ID:', effectiveGuestId);
        console.log('📋 Guest Name:', effectiveGuestName);
        
        // Get or create conversation
        const convId = await getAdminConversation();
        if (convId && isMounted.current) {
          await fetchMessages(convId);
          console.log('✅ Guest chat initialized with conversation:', convId);
        } else {
          console.warn('⚠️ No conversation available for guest');
          // Try again after a delay if no conversation
          setTimeout(async () => {
            if (isMounted.current && !activeConversation) {
              console.log('🔄 Retrying conversation creation...');
              const retryConvId = await getAdminConversation();
              if (retryConvId && isMounted.current) {
                await fetchMessages(retryConvId);
                console.log('✅ Guest chat initialized on retry:', retryConvId);
              }
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error initializing guest chat:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isInitialized, effectiveGuestId, effectiveGuestName, getAdminConversation, fetchMessages, activeConversation]);

  return {
    messages,
    loading,
    activeConversation,
    sendGuestMessage,
    fetchMessages,
    getAdminConversation,
  };
}