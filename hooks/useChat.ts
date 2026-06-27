import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '@/lib/chat-service';
import { supabase } from '@/lib/supabase';

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

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const fetchConversations = useCallback(async () => {
    const currentUserId = userIdRef.current;
    
    // CRITICAL: Stop execution if there is no user, or if they are a guest (invalid UUID)
    if (!currentUserId || !isValidUUID(currentUserId)) {
      console.log('ℹ️ Guest user or invalid UUID detected. Skipping database conversation fetch.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: convs, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .contains('participant_ids', [currentUserId])
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Map unread counts safely...
      const conversationsWithCounts = await Promise.all(
        (convs || []).map(async (conv) => {
          const { count, error: countError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', currentUserId);

          return { ...conv, unread_count: countError ? 0 : count || 0 };
        })
      );

      setConversations(conversationsWithCounts);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time Event Subscription Safeguard
  // Inside hooks/useChat.ts

useEffect(() => {
  const currentUserId = userIdRef.current;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!currentUserId || !uuidRegex.test(currentUserId)) return;

  // Track a generic user feed room channel
  const channelName = `chat_global_stream_${currentUserId}`;
  chatService.trackChannel(channelName);

  const chatChannel = supabase.channel(channelName);

  // A. Listen for Instant WebSocket Broadcast payloads (Faster than DB storage events)
  chatChannel.on('broadcast', { event: 'shuttle_msg' }, (payload) => {
    const newMessage = payload.payload as Message;
    console.log("⚡ Instant WebSocket message received:", newMessage);

    setMessages(prev => {
      const currentRoomMessages = prev[newMessage.conversation_id] || [];
      if (currentRoomMessages.some(m => m.id === newMessage.id)) return prev;
      return {
        ...prev,
        [newMessage.conversation_id]: [...currentRoomMessages, newMessage]
      };
    });

    setConversations(prev => prev.map(c => 
      c.id === newMessage.conversation_id 
        ? { ...c, last_message: newMessage.message, last_message_at: newMessage.created_at }
        : c
    ));
  });

  // B. Fallback: Listen for standard PostgreSQL physical row insertions
  chatChannel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'chat_messages' },
    (payload) => {
      const newMessage = payload.new as Message;
      console.log("💾 Database synchronization row found:", newMessage);

      setMessages(prev => {
        const currentRoomMessages = prev[newMessage.conversation_id] || [];
        if (currentRoomMessages.some(m => m.id === newMessage.id)) return prev;
        return {
          ...prev,
          [newMessage.conversation_id]: [...currentRoomMessages, newMessage]
        };
      });
    }
  );

  chatChannel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('📡 Realtime active link confirmed.');
    }
  });

  return () => {
    supabase.removeChannel(chatChannel);
  };
}, [userId]);


  const markMessagesAsRead = useCallback(async (conversationId: string, currentUserId: string) => {
    if (!conversationId || !currentUserId) return;
  
    // Validate if the ID matches a standard 36-character UUID format layout
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUserUuid = uuidRegex.test(currentUserId);
  
    try {
      // Construct base update query
      let query = supabase
        .from('chat_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('is_read', false);
  
      // CRITICAL FIX: Only apply the exclusion check filter if the ID is a valid database UUID
      if (isUserUuid) {
        query = query.neq('sender_id', currentUserId);
      }
  
      const { error } = await query;
      if (error) throw error;
  
      // Synchronize local front-end unread pill states instantly
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ));
    } catch (error) {
      console.error('Error marking messages as read safely:', error);
    }
  }, []);
  

  const fetchMessages = useCallback(async (conversationId: string) => {
    const currentUserId = userIdRef.current;
    if (!conversationId || !currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
      }));

      await markMessagesAsRead(conversationId, currentUserId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [markMessagesAsRead]);

  // Real-Time Listener Hook Handler
  // Inside hooks/useChat.ts

useEffect(() => {
  const currentUserId = userIdRef.current;
  // Prevent executing on invalid or guest user credentials 
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!currentUserId || !uuidRegex.test(currentUserId)) return;

  const channelName = `realtime_chat_rooms_${currentUserId}`;
  
  // Track channel within your custom chatService garbage collector
  chatService.trackChannel(channelName);

  // 1. Initialize the channel channel listener reference first
  const chatChannel = supabase.channel(channelName);

  // 2. Attach the event listeners FIRST (Crucial Step)
  chatChannel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'chat_messages' },
    (payload) => {
      const newMessage = payload.new as Message;
      
      // Safety validation mapping to prevent double appends
      setMessages(prev => {
        const currentRoomMessages = prev[newMessage.conversation_id] || [];
        if (currentRoomMessages.some(m => m.id === newMessage.id)) return prev;
        return {
          ...prev,
          [newMessage.conversation_id]: [...currentRoomMessages, newMessage]
        };
      });

      // Advance layout metrics for real-time room updates
      setConversations(prev => prev.map(c => 
        c.id === newMessage.conversation_id 
          ? { ...c, last_message: newMessage.message, last_message_at: newMessage.created_at }
          : c
      ));
    }
  );

  // 3. Fire the final subscribe connection execution AFTER all events are declared
  chatChannel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('📡 Successfully connected to real-time chat updates.');
    }
  });

  // Clean layout instances up on unmount
  return () => {
    supabase.removeChannel(chatChannel);
  };
}, [userId]);


  // Inside hooks/useChat.ts -> Update sendMessage method

const sendMessage = useCallback(async (conversationId: string, message: string, type: string = 'text', file?: File) => {
  const currentUserId = userIdRef.current;
  if (!currentUserId || (!message.trim() && !file)) return;

  // ... (Your file storage uploading blocks remain exactly unchanged here) ...

  try {
    let senderName = 'User';
    if (!currentUserId.startsWith('guest_')) {
      const { data: userData } = await supabase.from('users').select('full_name').eq('id', currentUserId).single();
      senderName = userData?.full_name || 'User';
    } else {
      senderName = chatService.getGuestName();
    }

    const messagePayload = {
      conversation_id: conversationId,
      sender_id: currentUserId,
      sender_name: senderName,
      message: message,
      message_type: type,
      is_read: false,
      created_at: new Date().toISOString()
    };

    // 1. OPTIMISTIC UPDATE: Put the message in your own UI instantly without waiting for a database response
    const mockId = `temp_${Date.now()}`;
    const optimisticMsg = { id: mockId, ...messagePayload };
    
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), optimisticMsg]
    }));

    // 2. Fetch conversation metadata row to figure out who needs to receive the broadcast message
    const { data: currentConv } = await supabase
      .from('chat_conversations')
      .select('participant_ids')
      .eq('id', conversationId)
      .single();

    // 3. Save message row directly to the database
    const { data: savedData, error } = await supabase
      .from('chat_messages')
      .insert(messagePayload)
      .select()
      .single();

    if (error) throw error;

    // Replace our temporary UI message with the authentic database record
    setMessages(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(m => m.id === mockId ? savedData : m)
    }));

    // 4. INSTANT BROADCAST TRANSMISSION: Loop over conversation participants and ping their WebSocket channels
    if (currentConv && currentConv.participant_ids) {
      const otherRecipients = currentConv.participant_ids.filter((pId: string) => pId !== currentUserId);

      for (const targetRecipientId of otherRecipients) {
        const broadcastChannelName = `chat_global_stream_${targetRecipientId}`;
        
        // Dispatch instant WebSocket message token transmission packets
        await supabase.channel(broadcastChannelName).send({
          type: 'broadcast',
          event: 'shuttle_msg',
          payload: savedData // Send verified db row
        });
      }
    }

    // 5. Update main conversation metadata last message row index pointer
    await supabase
      .from('chat_conversations')
      .update({
        last_message: message,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId);

  } catch (error) {
    console.error('Error sending message:', error);
  }
}, []);


  const createConversation = useCallback(async (participantIds: string[], type: string = 'direct') => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) {
      console.error("❌ Cannot create conversation: Current User ID is missing.");
      return null;
    }
  
    // 1. TYPE SAFEGUARD: Separate valid Postgres UUIDs from client transient guest text strings
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Combine IDs and keep unique values
    const allIds = Array.from(new Set([...participantIds, currentUserId]));
    
    // Extract strictly valid UUIDs for Postgres queries
    const validDatabaseUUIDs = allIds.filter(id => uuidRegex.test(id));
    
    // Track guest IDs separately so we don't pass them to UUID columns
    const guestStringIds = allIds.filter(id => !uuidRegex.test(id));
  
    try {
      console.log("🛠️ Type parsing breakdown:", { databaseUuids: validDatabaseUUIDs, guestIds: guestStringIds });
  
      // 2. DUPLICATE CHECK: Skip DB lookups if there aren't enough valid database UUIDs
      if (type === 'direct' && validDatabaseUUIDs.length > 0) {
        const { data: existingConvs, error: lookupError } = await supabase
          .from('chat_conversations')
          .select('*')
          .contains('participant_ids', validDatabaseUUIDs);
  
        if (!lookupError && existingConvs) {
          // Match existing row exactly by length to avoid group-chat collision bugs
          const exactMatch = existingConvs.find(
            c => c.participant_ids?.length === validDatabaseUUIDs.length
          );
          if (exactMatch) {
            console.log("🎯 Match found! Reusing conversation room ID:", exactMatch.id);
            setConversations(prev => prev.some(p => p.id === exactMatch.id) ? prev : [exactMatch, ...prev]);
            return exactMatch;
          }
        }
      }
  
      // 3. NAME RESOLUTION: Fetch names only for valid database users to prevent network fetch errors
      let participantNames: string[] = [];
      
      if (validDatabaseUUIDs.length > 0) {
        const { data: userProfiles, error: profilesError } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', validDatabaseUUIDs);
  
        if (!profilesError && userProfiles) {
          participantNames = validDatabaseUUIDs.map(id => {
            const profile = userProfiles.find(u => u.id.toLowerCase() === id.toLowerCase());
            return profile?.full_name || 'User';
          });
        }
      }
  
      // Append names for guests using client-side fallback storage
      guestStringIds.forEach(() => {
        participantNames.push('Guest User');
      });
  
      // 4. FALLBACK STRATEGY: If a guest is chatting, do not attempt to map them into the strict UUID[] columns
      // Construct the database payload safely
      const databasePayload: any = {
        type: type,
        last_message: 'Conversation started',
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participant_names: participantNames,
        metadata: { guest_participants: guestStringIds } // Safely track guest IDs inside a JSONB column instead of a UUID array
      };
  
      // Only map to strict UUID properties if values exist and are structurally valid
      if (validDatabaseUUIDs.length > 0) {
        databasePayload.participant_ids = validDatabaseUUIDs;
        if (uuidRegex.test(currentUserId)) {
          databasePayload.created_by = currentUserId;
        }
      }
  
      console.log("📤 Dispatching clean row payload to Supabase:", databasePayload);
  
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert(databasePayload)
        .select()
        .single();
  
      if (error) {
        console.error('❌ Supabase DB Reject Reason:', error.message, error.details);
        throw error;
      }
  
      console.log('✅ Conversation created successfully:', data);
      setConversations(prev => [data, ...prev]);
      return data;
  
    } catch (error: any) {
      console.error('❌ Catastrophic error inside createConversation:', error);
      return null;
    }
  }, []);
  

  return {
    conversations,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation
  };
}
