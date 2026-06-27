"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Users,
  ArrowLeft,
  Paperclip,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";

interface ChatWidgetProps {
  userId: string;
  userRole?: string;
  recipientId?: string;
  recipientName?: string;
}

export function ChatWidget({ userId, userRole, recipientId, recipientName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    conversations,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    fetchMessages,
    sendMessage,
    createConversation,
    fetchConversations
  } = useChat(userId);

  // Load conversations on mount
  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId, fetchConversations]);

  // Safe User Directory Fetching (No duplicate hook blocks)
  useEffect(() => {
    if (showUserList) {
      const fetchUsers = async () => {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        let query = supabase.from('users').select('id, full_name, email, role');
        
        if (isUuid) {
          query = query.neq('id', userId);
        }

        const { data, error } = await query.limit(50);

        if (error) {
          console.error("❌ Supabase fetch users error:", error.message);
          return;
        }
        if (data) setUsers(data);
      };
      fetchUsers();
    }
  }, [showUserList, userId]);

  // Autoscroll to bottom message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  // Focus message window input
  useEffect(() => {
    if (activeConversation && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [activeConversation]);

  const handleSendMessage = async () => {
    if (!message.trim() && !fileInputRef.current?.files?.length) return;

    let currentConversation = activeConversation;

    if (!currentConversation) {
      let targetId = selectedUser?.id || recipientId || users[0]?.id;
      if (!targetId) {
        alert("Please select a user to chat with first");
        return;
      }
      const newConv = await createConversation([targetId]);
      if (newConv) {
        currentConversation = newConv.id;
        setActiveConversation(newConv.id);
      }
    }

    if (!currentConversation) return;

    const file = fileInputRef.current?.files?.[0];
    await sendMessage(currentConversation, message, 'text', file);
    setMessage("");
    
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectUser = async (targetUser: any) => {
    setSelectedUser(targetUser);
    setShowUserList(false); // Instantly drop directory menus
    
    const newConv = await createConversation([targetUser.id]);
    if (newConv) {
      // Extract the raw string ID parameter whether returned as an object row or a direct token key string
      const targetId = typeof newConv === 'object' && newConv !== null ? newConv.id : newConv;
      
      console.log("🔥 Successfully unlocking chat room view wrapper window for ID:", targetId);
      
      setActiveConversation(targetId); 
      await fetchMessages(targetId); // Pulls existing history or empty space state instantly
    } else {
      alert("Could not start conversation room layer channel.");
    }
  };
  
  
  const handleSelectConversation = async (conversationId: string) => {
    setActiveConversation(conversationId);
    await fetchMessages(conversationId);
    setSelectedUser(null);
  };

  const currentActiveConv = conversations.find(c => c.id === activeConversation);

  const getConversationName = (conversation: any) => {
    if (!conversation) return selectedUser ? selectedUser.full_name : 'Chat';
    if (conversation.type === 'admin') return 'Admin Support';
    
    const names = conversation.participant_names || [];
    return names.length ? names.join(', ') : 'Direct Message';
  };

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-600 hover:bg-cyan-700 rounded-full shadow-lg transition-all duration-300 group flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6 text-white" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
            {totalUnread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 w-[380px] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-cyan-500/20 flex flex-col transition-all duration-300 overflow-hidden ${
        isMinimized ? 'h-16' : 'h-[500px]'
      }`}
    >
      {/* Header Container */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <span className="font-medium truncate text-sm">
            {activeConversation ? getConversationName(currentActiveConv) : selectedUser ? selectedUser.full_name : 'Messages'}
          </span>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {(activeConversation || selectedUser) && (
            <button
              onClick={() => {
                setActiveConversation(null);
                setSelectedUser(null);
              }}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowUserList(!showUserList)}
            className={`p-1 rounded-lg transition-colors ${showUserList ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isMinimized && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
          {showUserList ? (
            /* 1. USER LIST VIEW */
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <p className="text-xs text-slate-400 px-2 py-1 font-semibold">Start a Conversation</p>
              {users.length === 0 ? (
                <div className="text-center text-xs text-slate-500 p-4">No other users found in directory.</div>
              ) : (
                users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-slate-800 rounded-xl text-left transition-colors text-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold">
                      {u.full_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">{u.full_name}</div>
                      <div className="text-xs text-slate-400">{u.role || 'User'}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (activeConversation && activeConversation !== "undefined") ? (
            /* 2. ACTIVE LIVE MESSAGING VIEW WITH TEXTAREA (MOVED TO TOP PRIORITY) */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(messages[activeConversation] || []).length === 0 ? (
                  <div className="text-center text-xs text-slate-500 p-8 h-full flex items-center justify-center">
                    Type a message below to begin your conversation.
                  </div>
                ) : (
                  (messages[activeConversation] || []).map((msg) => {
                    const isMe = msg.sender_id === userId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-md ${isMe ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                          {!isMe && <p className="text-[10px] text-cyan-400 font-semibold mb-1">{msg.sender_name}</p>}
                          <p className="leading-relaxed break-words">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Messaging Input Area */}
              <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2 flex-shrink-0">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" />
                
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 max-h-20 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                  rows={1}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="p-2 bg-cyan-600 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-xl transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* 3. RECENT ROOMS FEED VIEW */
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading chats...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No active rooms found. Click the user icon to start one.</div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/60 rounded-xl text-left transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {getConversationName(conv).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <span className="font-medium text-slate-200 truncate">{getConversationName(conv)}</span>
                      <p className="text-slate-400 truncate">{conv.last_message}</p>
                    </div>
                    {conv.unread_count ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
                    ) : null}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}