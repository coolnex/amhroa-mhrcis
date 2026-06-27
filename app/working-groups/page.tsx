// app/working-groups/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Users,
  Plus,
  RefreshCw,
  Crown,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  ChevronRight,
  Send,
  Loader2,
  Check,
  X,
  UserPlus,
  Mail,
  User,
  MessageSquare,
} from "lucide-react";

interface WorkingGroup {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  created_by: string;
  created_at: string;
  member_count: number;
  user_role?: string;
  is_member?: boolean;
  has_pending_request?: boolean;
  pending_requests_count?: number;
}

interface GroupMember {
  user_id: string;
  role: string;
}

interface JoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  message: string;
  status: string;
  created_at: string;
  group_name?: string;
}

export default function WorkingGroupsPage() {
  const router = useRouter();
  const [workingGroups, setWorkingGroups] = useState<WorkingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [joinRequestLoading, setJoinRequestLoading] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<WorkingGroup | null>(null);
  const [joinReason, setJoinReason] = useState("");
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log("🔍 [DEBUG] checkAuth started");

    try {
      // First check localStorage for user profile (set during login)
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log("✅ [DEBUG] User found in localStorage:", userData);
          setUser(userData);
          setIsAuthenticated(true);
          await fetchWorkingGroups(userData);
          return;
        } catch (e) {
          console.error("❌ [DEBUG] Failed to parse user:", e);
          localStorage.removeItem("user");
        }
      }

      // If no localStorage, check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("❌ [DEBUG] Session error:", sessionError);
        setIsAuthenticated(false);
        setUser(null);
        await fetchWorkingGroups(null);
        return;
      }

      if (!session) {
        console.log("⚠️ [DEBUG] No session found");
        setIsAuthenticated(false);
        setUser(null);
        await fetchWorkingGroups(null);
        return;
      }

      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single();

      if (profileError || !profile) {
        console.error("❌ [DEBUG] Profile fetch error:", profileError);
        setIsAuthenticated(false);
        setUser(null);
        await fetchWorkingGroups(null);
        return;
      }

      // Cache in localStorage
      localStorage.setItem("user", JSON.stringify(profile));
      
      console.log("✅ [DEBUG] User authenticated via Supabase:", profile);
      setUser(profile);
      setIsAuthenticated(true);
      await fetchWorkingGroups(profile);

    } catch (error) {
      console.error("❌ [DEBUG] Auth check error:", error);
      setIsAuthenticated(false);
      setUser(null);
      await fetchWorkingGroups(null);
    }
  };

  const fetchWorkingGroups = async (currentUser?: any) => {
    console.log("🔍 [DEBUG] fetchWorkingGroups started");
    setLoading(true);
    
    try {
      // Fetch all working groups with member counts
      const { data: groups, error } = await supabase
        .from("working_groups")
        .select(`
          *,
          working_group_members!left (
            user_id,
            role
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ [DEBUG] Supabase error:", error);
        throw error;
      }

      console.log(`✅ [DEBUG] Found ${groups?.length || 0} working groups`);

      // Process groups
      const processedGroups = await Promise.all(groups?.map(async (group) => {
        let members = group.working_group_members as GroupMember[] || [];
        
        // Add created_by as "Lead" if not already in members
        if (!members.find((m) => m.user_id === group.created_by)) {
          members = [
            ...members,
            { user_id: group.created_by, role: "Lead" },
          ];
        }
        
        // Find current user in members
        const member = currentUser 
          ? members.find((m: GroupMember) => m.user_id === currentUser.id)
          : null;
        
        // Check for pending join requests
        let hasPendingRequest = false;
        if (currentUser) {
          const { data: requestData } = await supabase
            .from("group_join_requests")
            .select("id")
            .eq("group_id", group.id)
            .eq("user_id", currentUser.id)
            .eq("status", "pending")
            .single();
          
          hasPendingRequest = !!requestData;
        }
        
        // Count pending requests for leads/admins
        let pendingRequestsCount = 0;
        if (member?.role === "Lead" || member?.role === "Co-Lead" || currentUser?.role === "Admin") {
          const { count } = await supabase
            .from("group_join_requests")
            .select("id", { count: "exact", head: true })
            .eq("group_id", group.id)
            .eq("status", "pending");
          
          pendingRequestsCount = count || 0;
        }
        
        return {
          ...group,
          member_count: members.length,
          user_role: member?.role,
          is_member: !!member,
          has_pending_request: hasPendingRequest,
          pending_requests_count: pendingRequestsCount,
        };
      }) || []);

      setWorkingGroups(processedGroups);
      
    } catch (error) {
      console.error("❌ [DEBUG] Error fetching working groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (group: WorkingGroup) => {
    // Allow access if user is a member OR is Admin
    if (group.is_member || user?.role === "Admin") {
      router.push(`/working-groups/${group.id}`);
    } else if (isAuthenticated) {
      alert("You need to be a member of this working group to view its details.");
    } else {
      router.push("/login?redirect=/working-groups");
    }
  };

  const handleJoinRequest = async (group: WorkingGroup) => {
    if (!user) {
      router.push("/login?redirect=/working-groups");
      return;
    }

    // Check for existing request
    const { data: existingRequest } = await supabase
      .from("group_join_requests")
      .select("id, status")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    if (existingRequest) {
      alert("You already have a pending request to join this group.");
      return;
    }

    setSelectedGroup(group);
    setJoinReason("");
    setShowJoinModal(true);
  };

  const submitJoinRequest = async () => {
    if (!selectedGroup || !user) return;

    setJoinRequestLoading(selectedGroup.id);
    try {
      const { error } = await supabase
        .from("group_join_requests")
        .insert({
          group_id: selectedGroup.id,
          user_id: user.id,
          user_name: user.full_name || user.email,
          user_email: user.email,
          message: joinReason || "I would like to join this working group.",
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error("❌ [DEBUG] Error submitting join request:", error);
        alert("Failed to submit join request: " + error.message);
        return;
      }

      // Update local state
      setWorkingGroups(prev => prev.map(g => 
        g.id === selectedGroup.id 
          ? { ...g, has_pending_request: true }
          : g
      ));

      setShowJoinModal(false);
      alert("Your request to join has been sent! The group lead will review it.");
      
    } catch (error) {
      console.error("❌ [DEBUG] Error submitting join request:", error);
      alert("Failed to submit join request. Please try again.");
    } finally {
      setJoinRequestLoading(null);
    }
  };

  const fetchPendingRequests = async (groupId: string) => {
    setRequestsLoading(true);
    try {
      const { data, error } = await supabase
        .from("group_join_requests")
        .select(`
          *,
          working_groups!inner (
            name
          )
        `)
        .eq("group_id", groupId)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedRequests = data?.map(req => ({
        ...req,
        group_name: req.working_groups?.name || "Unknown Group",
      })) || [];

      setPendingRequests(formattedRequests);
      setShowRequestsModal(true);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      alert("Failed to load pending requests.");
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, userId: string, groupId: string) => {
    if (!confirm("Approve this member's request to join?")) return;
    
    setProcessingRequest(requestId);
    try {
      // Update the request status to approved
      const { error: updateError } = await supabase
        .from("group_join_requests")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Add the user to the working group members
      const { error: memberError } = await supabase
        .from("working_group_members")
        .insert({
          working_group_id: groupId,
          user_id: userId,
          role: "Member",
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // Remove from pending list
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Update the group's pending count
      setWorkingGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, pending_requests_count: Math.max(0, (g.pending_requests_count || 0) - 1) }
          : g
      ));

      alert("Request approved! User has been added to the group.");
      
      // Refresh data
      await fetchWorkingGroups(user);
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request. Please try again.");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string, groupId: string) => {
    if (!confirm("Reject this member's request to join?")) return;
    
    setProcessingRequest(requestId);
    try {
      const { error } = await supabase
        .from("group_join_requests")
        .update({
          status: "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      // Remove from pending list
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Update the group's pending count
      setWorkingGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, pending_requests_count: Math.max(0, (g.pending_requests_count || 0) - 1) }
          : g
      ));

      alert("Request rejected.");
      
      // Refresh data
      await fetchWorkingGroups(user);
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request. Please try again.");
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle };
      case "Inactive":
        return { color: "bg-red-500/20 text-red-400", icon: AlertCircle };
      default:
        return { color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Lead":
        return { color: "bg-yellow-500/20 text-yellow-400", icon: Crown };
      case "Co-Lead":
        return { color: "bg-cyan-500/20 text-cyan-400", icon: Star };
      default:
        return { color: "bg-slate-500/20 text-slate-400", icon: Users };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading working groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    WORKING GROUPS
                  </span>
                </div>
                {isAuthenticated && (
                  <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                    <span className="text-emerald-300 text-xs font-mono tracking-wider">
                      {user?.role === "Admin" ? "ADMIN ACCESS" : "MEMBER ACCESS"}
                    </span>
                  </div>
                )}
                {!isAuthenticated && (
                  <div className="px-3 py-1 bg-slate-500/20 rounded-full border border-slate-500/30">
                    <span className="text-slate-300 text-xs font-mono tracking-wider">
                      PUBLIC VIEW
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Working Groups
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                {user?.role === "Admin" 
                  ? "Manage all working groups, members, and activities across the platform."
                  : isAuthenticated 
                  ? "Manage your working groups, assign roles, and track activities."
                  : "Browse active working groups. Join or login to access group details."}
              </p>
            </div>

            <div className="flex gap-2">
              {(isAuthenticated || user?.role === "Admin") && (
                <Link
                  href="/working-groups/new"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Create Group</span>
                </Link>
              )}
              <button
                onClick={() => fetchWorkingGroups(user)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Info Banner for Public Users */}
        {!isAuthenticated && workingGroups.length > 0 && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <h4 className="text-cyan-400 font-medium">Public View</h4>
                <p className="text-slate-300 text-sm">
                  You're viewing working groups as a guest. 
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300 ml-1">
                    Login
                  </Link>
                  {" "}or{" "}
                  <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 ml-1">
                    Sign up
                  </Link>
                  {" "}to join groups and access detailed content.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Working Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workingGroups.map((group) => {
            const statusBadge = getStatusBadge(group.status);
            const StatusIcon = statusBadge.icon;
            const roleBadge = group.user_role ? getRoleBadge(group.user_role) : null;
            const RoleIcon = roleBadge?.icon || Users;
            const canAccess = group.is_member || user?.role === "Admin";
            const isLeadOrAdmin = group.user_role === "Lead" || group.user_role === "Co-Lead" || user?.role === "Admin";
            const hasPendingRequests = group.pending_requests_count && group.pending_requests_count > 0;

            return (
              <div
                key={group.id}
                className={`bg-slate-800/50 rounded-2xl border transition-all overflow-hidden ${
                  canAccess
                    ? "border-slate-700 hover:border-cyan-500/30 cursor-pointer" 
                    : isAuthenticated 
                      ? "border-slate-700/50 opacity-75"
                      : "border-slate-700/50 cursor-pointer hover:border-cyan-500/20"
                }`}
                onClick={() => handleGroupClick(group)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {roleBadge && (
                        <div className={`p-1.5 rounded-lg ${roleBadge.color}`}>
                          <RoleIcon className="w-3 h-3" />
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-white">{group.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {group.status}
                      </div>
                      {canAccess ? (
                        <div className="text-emerald-400 bg-emerald-500/20 p-1 rounded-full">
                          <Unlock className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="text-slate-500 bg-slate-700/50 p-1 rounded-full">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{group.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-cyan-400">{group.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${group.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {group.member_count} members
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs">
                        Created: {new Date(group.created_at).toLocaleDateString()}
                      </span>
                      {canAccess && (
                        <span className="text-cyan-400 text-xs flex items-center gap-1">
                          View <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Member indicator badge */}
                  {group.is_member && (
                    <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-emerald-400 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Member
                      </span>
                      {group.user_role && (
                        <span className={`text-xs ${roleBadge?.color || "text-slate-400"}`}>
                          {group.user_role}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Admin indicator */}
                  {user?.role === "Admin" && !group.is_member && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <span className="text-purple-400 text-xs flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Admin Access
                      </span>
                    </div>
                  )}

                  {/* Join Request Button */}
                  {!group.is_member && user?.role !== "Admin" && isAuthenticated && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      {group.has_pending_request ? (
                        <div className="text-yellow-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Request Pending
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinRequest(group);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          Request to Join →
                        </button>
                      )}
                    </div>
                  )}

                  {/* Pending Requests Button for Leads/Admins */}
                  {isLeadOrAdmin && hasPendingRequests && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchPendingRequests(group.id);
                        }}
                        className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>{group.pending_requests_count} pending request{group.pending_requests_count !== 1 ? 's' : ''}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {workingGroups.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No working groups yet</p>
            <p className="text-slate-500 text-sm mt-2">
              {isAuthenticated 
                ? "Create your first working group to start collaborating" 
                : "Login or sign up to create and join working groups"}
            </p>
            {isAuthenticated ? (
              <Link
                href="/working-groups/new"
                className="inline-block mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                Create Working Group
              </Link>
            ) : (
              <div className="mt-4 flex gap-3 justify-center">
                <Link
                  href="/login"
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Join Request Modal */}
      {showJoinModal && selectedGroup && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowJoinModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full max-h-[calc(100vh-2rem)] flex flex-col shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-white">Request to Join</h2>
                <p className="text-xs text-slate-400 mt-0.5">Submit your application to the group lead</p>
              </div>
              <button 
                onClick={() => setShowJoinModal(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4">
                <h3 className="text-white font-medium text-base">{selectedGroup.name}</h3>
                {selectedGroup.description && (
                  <p className="text-slate-400 text-sm mt-1.5">{selectedGroup.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 text-sm font-medium block">
                  Why do you want to join? <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={joinReason}
                  onChange={(e) => setJoinReason(e.target.value)}
                  rows={3}
                  placeholder="Tell the group lead why you'd like to join..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                />
              </div>

              <div className="bg-slate-800/20 border border-slate-800/60 rounded-xl p-4 text-xs text-slate-400 space-y-1">
                <div className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <p>Your request will be sent to the group lead for review.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <p>You'll be notified once your request is approved.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 shrink-0">
              <button
                onClick={submitJoinRequest}
                disabled={joinRequestLoading === selectedGroup.id}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 rounded-xl text-white font-medium transition-all shadow-lg shadow-cyan-600/10 hover:shadow-cyan-600/20 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
              >
                {joinRequestLoading === selectedGroup.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests Modal */}
      {showRequestsModal && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowRequestsModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[calc(100vh-2rem)] flex flex-col shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-white">Pending Join Requests</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} waiting for review
                </p>
              </div>
              <button 
                onClick={() => setShowRequestsModal(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-slate-300">No pending requests</p>
                  <p className="text-slate-500 text-sm">All join requests have been processed.</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.id} className="bg-slate-800/40 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{request.user_name}</h4>
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {request.user_email}
                            </p>
                          </div>
                        </div>
                        {request.message && (
                          <div className="mt-2 bg-slate-700/30 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-slate-300 text-sm flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                              <span>{request.message}</span>
                            </p>
                          </div>
                        )}
                        <div className="mt-2 text-xs text-slate-500">
                          Requested: {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleApproveRequest(request.id, request.user_id, request.group_id)}
                          disabled={processingRequest === request.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-40"
                        >
                          {processingRequest === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id, request.group_id)}
                          disabled={processingRequest === request.id}
                          className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 active:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-40"
                        >
                          {processingRequest === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 shrink-0 flex justify-end">
              <button
                onClick={() => setShowRequestsModal(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}