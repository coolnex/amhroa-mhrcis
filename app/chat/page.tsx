// app/admin/chat/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useChat } from "@/hooks/useChat";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  MessageSquare,
  CheckCheck,
  Check,
  Send,
  Loader2,
  ArrowLeft,
  X,
  Circle,
} from "lucide-react";
import Link from "next/link";

interface UserWithConversation {
  id: string;
  full_name: string;
  email: string;
  role: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  conversation_id?: string;
}

export default function AdminChatPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [users, setUsers] = useState<UserWithConversation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithConversation | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

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
    await fetchUsers();
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .neq('id', user?.id)
      .order('full_name');

    if (!error && data) {
      // Get conversation info for each user
      const usersWithConversations = await Promise.all(
        data.map(async (u) => {
          const { data: conv } = await supabase
            .from('chat_conversations')
            .select('id, last_message, last_message_at')
            .contains('participant_ids', [user.id, u.id])
            .maybeSingle();

          if (conv) {
            const { count } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .eq('is_read', false)
              .neq('sender_id', user.id);

            return {
              ...u,
              conversation_id: conv.id,
              last_message: conv.last_message,
              last_message_at: conv.last_message_at,
              unread_count: count || 0,
            };
          }
          return u;
        })
      );

      setUsers(usersWithConversations);
    }
  };

  const handleSelectUser = async (selectedUser: UserWithConversation) => {
    let convId = selectedUser.conversation_id;
    
    if (!convId) {
      convId = await createConversation([selectedUser.id]);
    }

    if (convId) {
      setSelectedUser(selectedUser);
      setActiveConversation(convId);
      await fetchMessages(convId);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation) return;

    await sendMessage(activeConversation, message);
    setMessage("");
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="flex h-[600px]">
            {/* User List */}
            <div className="w-80 border-r border-slate-700 flex flex-col">
              <div className="p-4 border-b border-slate-700">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Conversations
                </h2>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`flex items-center gap-3 p-4 hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-700/50 ${
                      selectedUser?.id === u.id ? 'bg-cyan-500/10' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-cyan-400 font-bold">{u.full_name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-white font-medium truncate">{u.full_name}</p>
                        {u.unread_count && u.unread_count > 0 && (
                          <span className="w-5 h-5 bg-cyan-500 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0">
                            {u.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm truncate">
                        {u.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <span className="text-cyan-400 font-bold">{selectedUser.full_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{selectedUser.full_name}</p>
                        <p className="text-slate-400 text-xs">{selectedUser.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages[activeConversation || '']?.map((msg: any) => {
                      const isOwn = msg.sender_id === user.id;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl p-3 ${
                            isOwn ? 'bg-cyan-600 text-white' : 'bg-slate-700/50 text-white'
                          }`}>
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
                    })}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-3 text-slate-600" />
                    <p>Select a user to start chatting</p>
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