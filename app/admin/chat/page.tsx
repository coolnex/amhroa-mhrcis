// app/admin/chat/page.tsx - Updated with better guest handling
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  MessageSquare,
  Send,
  Loader2,
  Check,
  CheckCheck,
  Shield,
  User,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";

export default function AdminChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [guestConversations, setGuestConversations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "users" | "guests">("all");
  const [refreshing, setRefreshing] = useState(false);

  const {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    fetchMessages,
    sendMessage,
    createConversation,
  } = useChat(user?.id);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userStr || !token) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== "Admin") {
      router.push("/dashboard");
      return;
    }

    setUser(userData);
    await fetchAllData();
    setLoading(false);
  };

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAllUsers(),
        fetchGuestConversations(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAllUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .neq('id', user?.id)
      .order('full_name');

    if (!error && data) {
      setUsers(data);
    }
  };

  const fetchGuestConversations = async () => {
    console.log('🔍 Fetching guest conversations...');
    
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('type', 'guest')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching guest conversations:', error);
      return;
    }

    console.log(`✅ Found ${data?.length || 0} guest conversations`);

    if (data && data.length > 0) {
      // Get messages for each guest conversation
      const guestData = await Promise.all(
        data.map(async (conv) => {
          const { data: msgs } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...conv,
            last_message: msgs?.[0]?.message || conv.last_message || 'No messages yet',
            last_message_at: msgs?.[0]?.created_at || conv.last_message_at,
          };
        })
      );
      setGuestConversations(guestData);
    } else {
      setGuestConversations([]);
    }
  };

  const handleSelectUser = async (selectedUser: any) => {
    const convId = await createConversation([selectedUser.id]);
    if (convId) {
      setSelectedUser(selectedUser);
      setSelectedGuest(null);
      setActiveConversation(convId);
      await fetchMessages(convId);
    }
  };

  const handleSelectGuest = async (guest: any) => {
    console.log('👤 Selected guest conversation:', guest.id);
    setSelectedGuest(guest);
    setSelectedUser(null);
    setActiveConversation(guest.id);
    await fetchMessages(guest.id);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    await sendMessage(activeConversation, message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFilteredItems = () => {
    const items: any[] = [];

    if (filterType === "all" || filterType === "users") {
      users.forEach(u => {
        const conv = conversations.find(c => c.participant_ids?.includes(u.id));
        items.push({
          type: 'user',
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          role: u.role,
          conversation_id: conv?.id,
          last_message: conv?.last_message || 'No messages yet',
          last_message_at: conv?.last_message_at || new Date().toISOString(),
          unread_count: conv?.unread_count || 0,
          data: u,
        });
      });
    }

    if (filterType === "all" || filterType === "guests") {
      guestConversations.forEach(conv => {
        const guestName = conv.metadata?.guest_name || 
                          conv.participant_names?.find((n: string) => n !== 'Admin Support') || 
                          'Guest User';
        items.push({
          type: 'guest',
          id: conv.id,
          full_name: guestName,
          email: 'Guest User',
          role: 'Guest',
          conversation_id: conv.id,
          last_message: conv.last_message || 'No messages yet',
          last_message_at: conv.last_message_at || conv.created_at,
          unread_count: 0,
          data: conv,
          is_guest: true,
          participant_names: conv.participant_names,
          metadata: conv.metadata,
        });
      });
    }

    // Sort by last_message_at (newest first)
    items.sort((a, b) => {
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    });

    return items.filter(item =>
      item.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredItems = getFilteredItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="px-4 md:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <button
            onClick={fetchAllData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="flex h-[600px]">
            {/* User List */}
            <div className="w-80 border-r border-slate-700 flex flex-col">
              <div className="p-4 border-b border-slate-700">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Conversations
                  <span className="text-slate-400 text-sm font-normal ml-1">
                    ({filteredItems.length})
                  </span>
                </h2>
                
                {/* Filters */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                      filterType === "all" ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType("users")}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                      filterType === "users" ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    Users
                  </button>
                  <button
                    onClick={() => setFilterType("guests")}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                      filterType === "guests" ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Shield className="w-3 h-3 inline mr-1" />
                    Guests
                    {guestConversations.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-purple-400 text-white text-xs rounded-full">
                        {guestConversations.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p>No conversations found</p>
                    <p className="text-sm mt-1">Guest chats will appear here automatically</p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isGuest = item.type === 'guest';
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => isGuest ? handleSelectGuest(item.data) : handleSelectUser(item.data)}
                        className={`flex items-center gap-3 p-4 hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-700/50 ${
                          (selectedUser?.id === item.id || selectedGuest?.id === item.id) ? 'bg-cyan-500/10' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isGuest ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                        }`}>
                          {isGuest ? (
                            <Shield className="w-5 h-5 text-purple-400" />
                          ) : (
                            <span className="text-cyan-400 font-bold">{item.full_name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="text-white font-medium truncate">{item.full_name}</p>
                            {!isGuest && item.unread_count > 0 && (
                              <span className="w-5 h-5 bg-cyan-500 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0">
                                {item.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm truncate flex items-center gap-1">
                            {isGuest && <Shield className="w-3 h-3 text-purple-400" />}
                            {isGuest ? 'Guest Chat' : (item.last_message || 'No messages yet')}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {new Date(item.last_message_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser || selectedGuest ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedGuest ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                      }`}>
                        {selectedGuest ? (
                          <Shield className="w-4 h-4 text-purple-400" />
                        ) : (
                          <span className="text-cyan-400 font-bold">{selectedUser?.full_name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {selectedGuest ? selectedGuest.metadata?.guest_name || 'Guest User' : selectedUser?.full_name}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {selectedGuest ? '🟢 Guest Support' : (selectedUser?.role || 'User')}
                        </p>
                      </div>
                    </div>
                    {selectedGuest && (
                      <span className="text-purple-400 text-xs bg-purple-500/20 px-2 py-1 rounded-full">
                        Guest Session
                      </span>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages[activeConversation || '']?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <MessageSquare className="w-12 h-12 mb-3 text-slate-600" />
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation!</p>
                      </div>
                    ) : (
                      messages[activeConversation || '']?.map((msg: any) => {
                        const isOwn = msg.sender_id === user.id;
                        const isGuestSender = msg.sender_id !== user.id && msg.sender_id !== 'admin';
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl p-3 ${
                              isOwn ? 'bg-cyan-600 text-white' : 
                              isGuestSender ? 'bg-purple-600/30 text-white border border-purple-500/30' :
                              'bg-slate-700/50 text-white'
                            }`}>
                              {!isOwn && (
                                <p className="text-xs text-purple-300 mb-1">
                                  {isGuestSender ? 'Guest' : msg.sender_name || 'User'}
                                </p>
                              )}
                              <p className="text-sm break-words">{msg.message}</p>
                              <div className="flex justify-end items-center gap-1 mt-1">
                                <span className="text-[10px] opacity-70">
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isOwn && (
                                  msg.is_read ? (
                                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    {selectedGuest && (
                      <p className="text-xs text-purple-400 mt-1">
                        💡 This is a guest chat. They may be experiencing login issues.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-3 text-slate-600" />
                    <p>Select a user or guest to start chatting</p>
                    {guestConversations.length > 0 && (
                      <p className="text-sm mt-1 text-purple-400">
                        {guestConversations.length} guest{guestConversations.length > 1 ? 's' : ''} waiting for support
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}