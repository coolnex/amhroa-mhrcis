// components/Chat/ChatWidget.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
  Search,
  User,
  UserPlus,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";

interface ChatWidgetProps {
  userId: string;
  userRole?: string;
  recipientId?: string;
  recipientName?: string;
}

export function ChatWidget({ userId, userRole, recipientId, recipientName }: ChatWidgetProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Debug logging
  useEffect(() => {
    console.log("💬 ChatWidget mounted with userId:", userId);
    if (userId) {
      setIsInitialized(true);
    }
  }, [userId]);

  // Load conversations on mount - only if authenticated
  useEffect(() => {
    if (userId && userId.length > 10 && !userId.startsWith('guest_')) {
      console.log("💬 Fetching conversations for user:", userId);
      fetchConversations();
    }
  }, [userId, fetchConversations]);

  // Filter users based on search query - IMPROVED
  useEffect(() => {
    if (!users || users.length === 0) {
      setFilteredUsers([]);
      return;
    }

    if (searchQuery.trim().length === 0) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    console.log("🔍 Searching for:", query);
    console.log("👥 Total users:", users.length);

    const filtered = users.filter(user => {
      const fullName = (user.full_name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      
      // Check if query matches name or email
      const nameMatch = fullName.includes(query);
      const emailMatch = email.includes(query);
      
      // Also try matching by individual name parts (first name, last name)
      const nameParts = fullName.split(' ');
      const partMatch = nameParts.some((part: string) => part.includes(query));
      
      return nameMatch || emailMatch || partMatch;
    });

    console.log("✅ Search results:", filtered.length);
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Safe User Directory Fetching - IMPROVED with better error handling
  useEffect(() => {
    if (showUserList && userId) {
      const fetchUsers = async () => {
        setIsSearching(true);
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
          
          console.log("👥 Fetching users from database...");
          let query = supabase
            .from('users')
            .select('id, full_name, email, role')
            .order('full_name', { ascending: true });
          
          // Exclude current user
          if (isUuid) {
            query = query.neq('id', userId);
          }

          const { data, error } = await query;

          if (error) {
            console.error("❌ Supabase fetch users error:", error.message);
            setUsers([]);
            setFilteredUsers([]);
            setIsSearching(false);
            return;
          }

          if (data) {
            console.log("✅ Users loaded:", data.length);
            // Log first few users to verify data
            if (data.length > 0) {
              console.log("📋 Sample users:", data.slice(0, 3).map(u => ({ 
                id: u.id, 
                full_name: u.full_name, 
                email: u.email 
              })));
            }
            setUsers(data);
            setFilteredUsers(data);
          } else {
            setUsers([]);
            setFilteredUsers([]);
          }
        } catch (error) {
          console.error("❌ Error fetching users:", error);
          setUsers([]);
          setFilteredUsers([]);
        } finally {
          setIsSearching(false);
        }
      };
      fetchUsers();
    }
  }, [showUserList, userId]);

  // Don't render if no valid userId
  if (!userId || userId.length < 10 || userId.startsWith('guest_')) {
    console.log("💬 ChatWidget hidden - invalid userId:", userId);
    return null;
  }

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

  // Focus search input when user list opens
  useEffect(() => {
    if (showUserList && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showUserList]);

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
    setShowUserList(false);
    setSearchQuery("");
    
    const newConv = await createConversation([targetUser.id]);
    if (newConv) {
      const targetId = typeof newConv === 'object' && newConv !== null ? newConv.id : newConv;
      setActiveConversation(targetId); 
      await fetchMessages(targetId);
    } else {
      alert("Could not start conversation.");
    }
  };
  
  const handleSelectConversation = async (conversationId: string) => {
    setActiveConversation(conversationId);
    await fetchMessages(conversationId);
    setSelectedUser(null);
    setShowUserList(false);
  };

  const currentActiveConv = conversations.find(c => c.id === activeConversation);

  const getConversationName = (conversation: any) => {
    if (!conversation) return selectedUser ? selectedUser.full_name : 'Chat';
    if (conversation.type === 'admin') return 'Admin Support';
    
    const names = conversation.participant_names || [];
    const otherNames = names.filter((name: string) => {
      const currentUser = users.find(u => u.id === userId);
      return name !== currentUser?.full_name;
    });
    return otherNames.length ? otherNames.join(', ') : 'Direct Message';
  };

  const getConversationAvatar = (conversation: any) => {
    if (!conversation) return '?';
    const name = getConversationName(conversation);
    return name.charAt(0).toUpperCase();
  };

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  // Get online status (mock - can be replaced with real presence)
  const isUserOnline = (userId: string) => {
    // This is a mock - you can implement real presence tracking
    return Math.random() > 0.6;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-full shadow-lg transition-all duration-300 group flex items-center justify-center transform hover:scale-105"
      >
        <MessageSquare className="w-6 h-6 text-white" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
            {totalUnread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 w-[400px] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-cyan-500/20 flex flex-col transition-all duration-300 overflow-hidden ${
        isMinimized ? 'h-16' : 'h-[580px]'
      }`}
    >
      {/* Header Container */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 to-slate-900 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {!activeConversation && !selectedUser ? (
            <>
              <MessageSquare className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <span className="font-medium text-sm text-white">Messages</span>
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                  {totalUnread} new
                </span>
              )}
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {getConversationAvatar(currentActiveConv)}
              </div>
              <span className="font-medium truncate text-sm text-white">
                {activeConversation ? getConversationName(currentActiveConv) : selectedUser?.full_name}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {(activeConversation || selectedUser) && (
            <button
              onClick={() => {
                setActiveConversation(null);
                setSelectedUser(null);
                setShowUserList(false);
                setSearchQuery("");
              }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              setShowUserList(!showUserList);
              if (!showUserList) {
                setSearchQuery("");
              }
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              showUserList ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isMinimized && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
          {showUserList ? (
            /* 1. USER LIST VIEW WITH SEARCH */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search Bar */}
              <div className="p-3 border-b border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
                  )}
                  {!isSearching && searchQuery && filteredUsers.length === 0 && (
                    <X 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 cursor-pointer hover:text-white"
                      onClick={() => setSearchQuery("")}
                    />
                  )}
                </div>
                {searchQuery && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    Found {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              {/* User List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isSearching ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center p-8">
                    {searchQuery ? (
                      <>
                        <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No users found matching "{searchQuery}"</p>
                        <p className="text-slate-500 text-xs mt-1">Try a different name or email</p>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No other users available</p>
                        <p className="text-slate-500 text-xs mt-1">Invite others to join the platform</p>
                      </>
                    )}
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isOnline = isUserOnline(u.id);
                    const hasRecentChat = conversations.some(c => 
                      c.participant_ids?.includes(u.id)
                    );
                    
                    // Highlight matching text in name
                    let displayName = u.full_name;
                    if (searchQuery) {
                      const index = displayName.toLowerCase().indexOf(searchQuery.toLowerCase());
                      if (index !== -1) {
                        const before = displayName.substring(0, index);
                        const match = displayName.substring(index, index + searchQuery.length);
                        const after = displayName.substring(index + searchQuery.length);
                        displayName = (
                          <span>
                            {before}
                            <span className="bg-cyan-500/20 text-cyan-300 px-0.5 rounded">
                              {match}
                            </span>
                            {after}
                          </span>
                        );
                      }
                    }
                    
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/80 rounded-xl text-left transition-all group hover:border-cyan-500/20 border border-transparent"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {u.full_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm text-white truncate">
                              {displayName}
                            </div>
                            {hasRecentChat && (
                              <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 truncate">{u.email}</span>
                            {u.role && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded-full">
                                {u.role}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MessageSquare className="w-4 h-4 text-cyan-400" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (activeConversation && activeConversation !== "undefined") ? (
            /* 2. ACTIVE LIVE MESSAGING VIEW */
            <>
              {/* Conversation Header */}
              <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                  {getConversationAvatar(currentActiveConv)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {getConversationName(currentActiveConv)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {currentActiveConv?.type === 'direct' ? 'Direct Message' : 'Group Chat'}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {(messages[activeConversation] || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-slate-400 text-sm">No messages yet</p>
                    <p className="text-slate-500 text-xs">Start the conversation below</p>
                  </div>
                ) : (
                  (messages[activeConversation] || []).map((msg, index) => {
                    const isMe = msg.sender_id === userId;
                    const showAvatar = index === 0 || 
                      (messages[activeConversation] || [])[index - 1]?.sender_id !== msg.sender_id;
                    
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                          {!isMe && showAvatar && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {msg.sender_name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          {!isMe && !showAvatar && <div className="w-7 flex-shrink-0"></div>}
                          <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                            isMe 
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-none' 
                              : 'bg-slate-800 text-slate-200 rounded-bl-none'
                          }`}>
                            {!isMe && showAvatar && (
                              <p className="text-[10px] text-cyan-300 font-semibold mb-1">{msg.sender_name}</p>
                            )}
                            <p className="leading-relaxed break-words">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Messaging Input Area */}
              <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-end gap-2 flex-shrink-0">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" />
                
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pr-12 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 resize-none max-h-24 min-h-[42px]"
                    rows={1}
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 96) + 'px';
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="absolute right-1.5 bottom-1.5 p-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white disabled:text-slate-500 rounded-xl transition-all flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* 3. RECENT ROOMS FEED VIEW */
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-3 py-2">
                <p className="text-xs text-slate-400 font-semibold">Recent Conversations</p>
              </div>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-slate-400 text-sm">No conversations yet</p>
                  <p className="text-slate-500 text-xs mt-1">Click the <Users className="w-3 h-3 inline" /> icon to start a new chat</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const unread = conv.unread_count || 0;
                  const convName = getConversationName(conv);
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/60 rounded-xl text-left transition-all group"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {convName.charAt(0).toUpperCase()}
                        </div>
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-white truncate">{convName}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {conv.last_message || 'No messages'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}