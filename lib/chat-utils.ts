// lib/chat-utils.ts
import { supabase } from './supabase';

export interface ChatUser {
  id: string;
  full_name: string;
  email: string;
  role?: string;
}

export interface ChatMessage {
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
  created_at: string;
}

export interface ChatConversation {
  id: string;
  participant_ids: string[];
  participant_names: string[];
  type: 'direct' | 'group' | 'admin';
  last_message: string;
  last_message_at: string;
  unread_count?: number;
}

// Create or get a conversation
export const getOrCreateConversation = async (
  userId: string,
  participantIds: string[],
  type: 'direct' | 'group' | 'admin' = 'direct'
): Promise<string | null> => {
  try {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('chat_conversations')
      .select('id')
      .contains('participant_ids', [userId, ...participantIds])
      .eq('type', type)
      .maybeSingle();

    if (existing) {
      return existing.id;
    }

    // Get participant names
    const { data: users } = await supabase
      .from('users')
      .select('full_name')
      .in('id', [userId, ...participantIds]);

    const names = users?.map(u => u.full_name) || [];

    // Create new conversation
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        participant_ids: [userId, ...participantIds],
        participant_names: names,
        type: type,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

// Send a message
export const sendChatMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  message: string,
  type: 'text' | 'file' = 'text',
  file?: File
): Promise<ChatMessage | null> => {
  try {
    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;

    // Upload file if provided
    if (file) {
      const fileExt = file.name.split('.').pop();
      const filePath = `chat/${conversationId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      fileUrl = publicUrl;
      fileName = file.name;
      fileSize = file.size;
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName,
        message: message || (file ? '📎 ' + fileName : ''),
        message_type: file ? 'file' : type,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation last message
    await supabase
      .from('chat_conversations')
      .update({
        last_message: message || (file ? '📎 ' + fileName : ''),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Get messages for a conversation
export const getChatMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Get all conversations for a user
export const getUserConversations = async (userId: string): Promise<ChatConversation[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .contains('participant_ids', [userId])
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Get unread counts
    const conversationsWithCounts = await Promise.all(
      (data || []).map(async (conv) => {
        const { count, error: countError } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId);

        return {
          ...conv,
          unread_count: countError ? 0 : count || 0,
        };
      })
    );

    return conversationsWithCounts;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};