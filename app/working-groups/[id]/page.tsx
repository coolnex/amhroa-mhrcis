// app/working-groups/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Plus,
  RefreshCw,
  Crown,
  Star,
  UserPlus,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  MessageSquare,
  Send,
  Loader2,
  X,
  Lock,
  TrendingUp,
  Target,
  Flag,
  BarChart3,
  Activity,
  Zap,
  FileText,
  CheckSquare,
  ClipboardList,
  GitBranch,
  PlayCircle,
  PauseCircle,
  FolderCheck,
  Timer,
} from "lucide-react";

interface WorkingGroup {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  created_by: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  joined_at: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  status: "Not Started" | "In Progress" | "Under Review" | "Completed" | "Blocked";
  progress: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  assigned_to: string;
  assigned_to_name?: string;
  due_date: string;
  completed_at?: string;
  created_at: string;
  created_by: string;
  created_by_name?: string;
  dependencies?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
}

interface Comment {
  id: string;
  user_id: string;
  full_name: string;
  comment: string;
  created_at: string;
}

export default function WorkingGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<WorkingGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [isMember, setIsMember] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("Member");
  const [addingMember, setAddingMember] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
    priority: "Medium",
    estimated_hours: 0,
  });
  const [addingActivity, setAddingActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [updateProgress, setUpdateProgress] = useState<Record<string, number>>({});
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // FIXED: Define missing computed variables
  // ============================================
  
  // Check if user can access the group
  const canAccess = isMember || userRole === "Lead" || userRole === "Co-Lead";
  
  // Check if user can manage the group (add/remove members, change roles)
  const canManageGroup = userRole === "Lead" || userRole === "Co-Lead";
  
  // Check if user can add activities
  const canAddActivities = isMember || canManageGroup;
  
  // Filtered activities based on status filter
  const filteredActivities = statusFilter === "all" 
    ? activities 
    : activities.filter(a => a.status === statusFilter);

  // Get member stats function
  const getMemberStats = (userId: string) => {
    const userActivities = activities.filter(a => a.assigned_to === userId);
    return {
      total: userActivities.length,
      completed: userActivities.filter(a => a.status === "Completed").length,
      inProgress: userActivities.filter(a => a.status === "In Progress" || a.status === "Under Review").length,
    };
  };

  // Status colors
  const statusColors: Record<string, string> = {
    "Not Started": "bg-slate-500/20 text-slate-400 border-slate-500/30",
    "In Progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Under Review": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Completed": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Blocked": "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusIcons: Record<string, any> = {
    "Not Started": Clock,
    "In Progress": PlayCircle,
    "Under Review": AlertCircle,
    "Completed": CheckCircle,
    "Blocked": PauseCircle,
  };

  const priorityColors: Record<string, string> = {
    "Low": "bg-slate-500/20 text-slate-400",
    "Medium": "bg-blue-500/20 text-blue-400",
    "High": "bg-yellow-500/20 text-yellow-400",
    "Critical": "bg-red-500/20 text-red-400",
  };

  useEffect(() => {
    checkAuth();
  }, [groupId]);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsLoading(false);
          await fetchGroupData(userData);
          return;
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single();

      if (profileError || !profile) {
        router.push("/login");
        return;
      }

      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
      setIsLoading(false);
      await fetchGroupData(profile);

    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    }
  };


  const fetchGroupData = async (currentUser?: any) => {
    setLoading(true);
    try {
      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from("working_groups")
        .select("*")
        .eq("id", groupId)
        .single();
  
      if (groupError) throw groupError;
      setGroup(groupData);
  
      // Fetch members - FIXED: Use a simpler approach
      const { data: membersData, error: membersError } = await supabase
        .from("working_group_members")
        .select("*")
        .eq("working_group_id", groupId);
  
      if (membersError) throw membersError;
  
      let formattedMembers: Member[] = [];
      if (membersData && membersData.length > 0) {
        // Get all user IDs
        const userIds = membersData.map(m => m.user_id).filter(id => id);
        
        if (userIds.length > 0) {
          // Fetch user details separately
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, full_name, email")
            .in("id", userIds);
  
          if (usersError) {
            console.error("Error fetching users:", usersError);
            // If users table doesn't exist, use member data directly
            formattedMembers = membersData.map((m: any) => ({
              id: m.id,
              user_id: m.user_id,
              full_name: m.user_id || 'Unknown User', // Fallback
              email: '',
              role: m.role || 'Member',
              joined_at: m.joined_at,
            }));
          } else {
            // Create a map of user data
            const userMap = new Map();
            usersData?.forEach((user: any) => {
              userMap.set(user.id, user);
            });
  
            formattedMembers = membersData.map((m: any) => {
              const user = userMap.get(m.user_id);
              return {
                id: m.id,
                user_id: m.user_id,
                full_name: user?.full_name || 'Unknown User',
                email: user?.email || '',
                role: m.role || 'Member',
                joined_at: m.joined_at,
              };
            });
          }
        }
        
        setMembers(formattedMembers);
      } else {
        setMembers([]);
      }
  
      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("working_group_activities")
        .select("*")
        .eq("working_group_id", groupId)
        .order("due_date", { ascending: true, nullsFirst: false });
  
      if (activitiesError) throw activitiesError;
  
      // Get assignee and creator names
      const activitiesWithNames = await Promise.all(
        (activitiesData || []).map(async (activity) => {
          let assignedToName = "Unassigned";
          let createdByName = "Unknown";
  
          if (activity.assigned_to) {
            const { data: assignee } = await supabase
              .from("users")
              .select("full_name")
              .eq("id", activity.assigned_to)
              .maybeSingle();
            assignedToName = assignee?.full_name || "Unassigned";
          }
  
          if (activity.created_by) {
            const { data: creator } = await supabase
              .from("users")
              .select("full_name")
              .eq("id", activity.created_by)
              .maybeSingle();
            createdByName = creator?.full_name || "Unknown";
          }
  
          return {
            ...activity,
            assigned_to_name: assignedToName,
            created_by_name: createdByName,
            dependencies: activity.dependencies || [],
            tags: activity.tags || [],
          };
        })
      );
  
      setActivities(activitiesWithNames);
  
      // Find current user's role and membership status
      const currentMember = formattedMembers.find(m => m.user_id === currentUser?.id);
      const isUserMember = !!currentMember;
      setIsMember(isUserMember);
      setUserRole(currentMember?.role || "");
  
      // Check for pending join request
      if (currentUser && !isUserMember) {
        const { data: requestData, error: requestError } = await supabase
          .from("group_join_requests")
          .select("id, status")
          .eq("group_id", groupId)
          .eq("user_id", currentUser.id)
          .eq("status", "pending")
          .maybeSingle();
        
        if (!requestError) {
          setHasPendingRequest(!!requestData);
        }
      }
  
    } catch (error) {
      console.error("Error fetching group data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const { error } = await supabase
        .from("group_join_requests")
        .insert({
          group_id: groupId,
          user_id: user.id,
          user_name: user.full_name || user.email,
          user_email: user.email,
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      setHasPendingRequest(true);
      alert("Your request to join has been sent!");
    } catch (error) {
      console.error("Error submitting join request:", error);
      alert("Failed to submit join request. Please try again.");
    }
  };

  const searchUsers = async () => {
    if (!searchEmail || searchEmail.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email")
        .ilike("email", `%${searchEmail}%`)
        .limit(5);

      if (error) throw error;
      
      const memberIds = members.map(m => m.user_id);
      const filteredResults = data?.filter(user => !memberIds.includes(user.id)) || [];
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        alert("No users found. Try a different email or the user might already be a member.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Failed to search users. Please try again.");
    }
  };

  const addMember = async () => {
    if (!selectedUser) {
      alert("Please select a user first");
      return;
    }

    setAddingMember(true);
    try {
      const { error } = await supabase
        .from("working_group_members")
        .insert({
          working_group_id: groupId,
          user_id: selectedUser.id,
          role: selectedRole || "Member",
          joined_at: new Date().toISOString(),
        });

      if (error) {
        if (error.message?.includes("duplicate key")) {
          alert(`${selectedUser.full_name} is already a member of this group.`);
        } else {
          alert("Failed to add member: " + error.message);
        }
        setAddingMember(false);
        return;
      }

      alert(`${selectedUser.full_name} added successfully!`);
      setShowAddMember(false);
      setSelectedUser(null);
      setSearchEmail("");
      setSearchResults([]);
      setSelectedRole("Member");
      await fetchGroupData(user);
      
    } catch (error: any) {
      console.error("Error adding member:", error);
      alert("Failed to add member: " + (error.message || "Unknown error"));
    } finally {
      setAddingMember(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("working_group_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;
      await fetchGroupData(user);
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    }
  };

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this working group?`)) return;

    try {
      const { error } = await supabase
        .from("working_group_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      await fetchGroupData(user);
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    }
  };

  const addActivity = async () => {
    if (!newActivity.title) {
      alert("Please enter a title");
      return;
    }

    setAddingActivity(true);
    try {
      const { error } = await supabase
        .from("working_group_activities")
        .insert({
          working_group_id: groupId,
          title: newActivity.title,
          description: newActivity.description,
          assigned_to: newActivity.assigned_to || null,
          due_date: newActivity.due_date || null,
          priority: newActivity.priority || "Medium",
          estimated_hours: newActivity.estimated_hours || 0,
          status: "Not Started",
          progress: 0,
          created_by: user?.id,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      setShowAddActivity(false);
      setNewActivity({ title: "", description: "", assigned_to: "", due_date: "", priority: "Medium", estimated_hours: 0 });
      await fetchGroupData(user);
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("Failed to add activity: " + (error as any).message);
    } finally {
      setAddingActivity(false);
    }
  };

  const updateActivityProgress = async (activityId: string, progress: number) => {
    try {
      const updates: any = { progress };
      
      if (progress >= 100) {
        updates.status = "Completed";
        updates.completed_at = new Date().toISOString();
      } else if (progress > 0) {
        updates.status = "In Progress";
      } else {
        updates.status = "Not Started";
      }

      const { error } = await supabase
        .from("working_group_activities")
        .update(updates)
        .eq("id", activityId);

      if (error) throw error;
      
      await updateGroupProgress();
      await fetchGroupData(user);
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress");
    }
  };

  const updateGroupProgress = async () => {
    try {
      const { data: allActivities } = await supabase
        .from("working_group_activities")
        .select("progress")
        .eq("working_group_id", groupId);

      if (allActivities && allActivities.length > 0) {
        const totalProgress = allActivities.reduce((acc, act) => acc + (act.progress || 0), 0);
        const avgProgress = Math.round(totalProgress / allActivities.length);

        await supabase
          .from("working_groups")
          .update({ progress: avgProgress })
          .eq("id", groupId);
      }
    } catch (error) {
      console.error("Error updating group progress:", error);
    }
  };

  const updateActivityStatus = async (activityId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("working_group_activities")
        .update({ 
          status,
          completed_at: status === "Completed" ? new Date().toISOString() : null
        })
        .eq("id", activityId);

      if (error) throw error;
      await fetchGroupData(user);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const addComment = async (activityId: string) => {
    if (!comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    if (!user) {
      alert("Please login to comment");
      return;
    }

    try {
      console.log("📝 Adding comment for activity:", activityId);
      console.log("📝 User:", user.id, user.full_name);
      console.log("📝 Comment:", comment.trim());
      
      const { data, error } = await supabase
        .from("activity_comments")
        .insert({
          activity_id: activityId,
          user_id: user.id,
          comment: comment.trim(),
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("❌ Comment error:", error);
        alert("Failed to add comment: " + error.message);
        return;
      }

      console.log("✅ Comment added:", data);
      setComment("");
      await fetchComments(activityId);
      
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  };

  const fetchComments = async (activityId: string) => {
    try {
      console.log("🔍 Fetching comments for activity:", activityId);
      
      const { data: memberCheck, error: memberError } = await supabase
        .from("working_group_members")
        .select("id")
        .eq("working_group_id", groupId)
        .eq("user_id", user?.id)
        .maybeSingle();

      if (memberError || !memberCheck) {
        console.warn("User is not a member of this group");
        setComments(prev => ({ ...prev, [activityId]: [] }));
        return;
      }

      const { data, error } = await supabase
        .from("activity_comments")
        .select(`
          id,
          user_id,
          comment,
          created_at
        `)
        .eq("activity_id", activityId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Comments fetch error:", error);
        setComments(prev => ({ ...prev, [activityId]: [] }));
        return;
      }

      if (!data || data.length === 0) {
        setComments(prev => ({ ...prev, [activityId]: [] }));
        return;
      }

      const userIds = [...new Set(data.map(c => c.user_id).filter(id => id))];
      
      let usersMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, full_name")
          .in("id", userIds);

        if (!usersError && usersData) {
          usersMap = usersData.reduce((acc: any, user: any) => {
            acc[user.id] = user.full_name;
            return acc;
          }, {});
        }
      }

      const formattedComments = data.map(c => ({
        id: c.id,
        user_id: c.user_id,
        full_name: usersMap[c.user_id] || "Unknown User",
        comment: c.comment,
        created_at: c.created_at,
      }));
      
      console.log("✅ Comments loaded:", formattedComments.length);
      console.log("📋 Comments data:", formattedComments);
      setComments(prev => ({ ...prev, [activityId]: formattedComments }));
      
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
      setComments(prev => ({ ...prev, [activityId]: [] }));
    }
  };

  // Show restricted access view
  const showRestrictedAccess = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center max-w-md">
          <Lock className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-300 mb-4">
            This working group is private. You need to be a member to view its details.
          </p>
          {user ? (
            hasPendingRequest ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                <p className="text-yellow-400 text-sm">Your request to join is pending approval.</p>
                <p className="text-slate-400 text-xs mt-1">You'll be notified once the group lead responds.</p>
              </div>
            ) : (
              <button
                onClick={handleJoinRequest}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2 mx-auto"
              >
                <Send className="w-4 h-4" />
                Request to Join
              </button>
            )
          ) : (
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
            >
              Login to Request Access
            </Link>
          )}
          <div className="mt-4">
            <Link
              href="/working-groups"
              className="text-slate-400 hover:text-cyan-400 text-sm"
            >
              Back to Working Groups
            </Link>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading working group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg">Working group not found</p>
          <Link href="/working-groups" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">
            Back to Working Groups
          </Link>
        </div>
      </div>
    );
  }

  if (!canAccess && !loading) {
    return showRestrictedAccess();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <Link href="/working-groups" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Working Groups
          </Link>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{group.name}</h1>
              <p className="text-slate-300 text-sm md:text-base mt-2">{group.description}</p>
            </div>
            <div className="flex gap-2">
              {canManageGroup && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm">Add Member</span>
                </button>
              )}
              <button
                onClick={() => fetchGroupData(user)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-cyan-400">{group.progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div className="bg-cyan-500 h-3 rounded-full transition-all" style={{ width: `${group.progress}%` }}></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
              <p className="text-slate-400 text-xs">Total Activities</p>
              <p className="text-white font-bold text-xl">{activities.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
              <p className="text-slate-400 text-xs">Completed</p>
              <p className="text-emerald-400 font-bold text-xl">{activities.filter(a => a.status === "Completed").length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
              <p className="text-slate-400 text-xs">In Progress</p>
              <p className="text-blue-400 font-bold text-xl">{activities.filter(a => a.status === "In Progress" || a.status === "Under Review").length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
              <p className="text-slate-400 text-xs">Members</p>
              <p className="text-white font-bold text-xl">{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Members Section */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Members ({members.length})
                </h3>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {members.map((member) => {
                  const RoleIcon = member.role === "Lead" ? Crown : member.role === "Co-Lead" ? Star : Users;
                  const roleColor = member.role === "Lead" ? "text-yellow-400" : member.role === "Co-Lead" ? "text-cyan-400" : "text-slate-400";
                  const stats = getMemberStats(member.user_id);
                  
                  return (
                    <div key={member.id} className="flex flex-col p-3 bg-slate-700/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <span className="text-cyan-400 font-bold">
                              {member.full_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{member.full_name}</p>
                            <p className="text-slate-500 text-xs">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canManageGroup && member.user_id !== user?.id ? (
                            <select
                              value={member.role}
                              onChange={(e) => updateMemberRole(member.id, e.target.value)}
                              className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white"
                            >
                              <option value="Lead">Lead</option>
                              <option value="Co-Lead">Co-Lead</option>
                              <option value="Member">Member</option>
                            </select>
                          ) : (
                            <div className={`flex items-center gap-1 ${roleColor}`}>
                              <RoleIcon className="w-4 h-4" />
                              <span className="text-sm">{member.role}</span>
                            </div>
                          )}
                          {canManageGroup && member.user_id !== user?.id && (
                            <button
                              onClick={() => removeMember(member.id, member.full_name)}
                              className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>✅ {stats.completed} done</span>
                        <span>🔄 {stats.inProgress} in progress</span>
                        <span>📋 {stats.total} total</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activities Section */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    Activities & Tasks ({filteredActivities.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                  <div className="flex bg-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("board")}
                      className={`px-2 py-1 rounded-md text-sm transition-colors ${
                        viewMode === "board" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Board
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-2 py-1 rounded-md text-sm transition-colors ${
                        viewMode === "list" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      List
                    </button>
                  </div>
                  {canAddActivities && (
                    <button
                      onClick={() => setShowAddActivity(true)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  )}
                </div>
              </div>

              {/* Board View */}
              {viewMode === "board" && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {["Not Started", "In Progress", "Under Review", "Completed", "Blocked"].map((status) => {
                    const statusActivities = filteredActivities.filter(a => a.status === status);
                    const StatusIcon = statusIcons[status] || ClipboardList;
                    
                    return (
                      <div key={status} className="bg-slate-700/20 rounded-xl p-3 min-h-[200px]">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-slate-300 font-medium text-sm flex items-center gap-1">
                            <StatusIcon className="w-4 h-4" />
                            {status}
                          </h4>
                          <span className="text-slate-500 text-xs">{statusActivities.length}</span>
                        </div>
                        <div className="space-y-2">
                          {statusActivities.map((activity) => (
                            <div
                              key={activity.id}
                              className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-cyan-500/30 cursor-pointer transition-all"
                              onClick={() => {
                                setSelectedActivity(activity);
                                setShowTaskDetails(true);
                                fetchComments(activity.id);
                              }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h5 className="text-white text-sm font-medium">{activity.title}</h5>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${priorityColors[activity.priority]}`}>
                                  {activity.priority}
                                </span>
                              </div>
                              <p className="text-slate-400 text-xs line-clamp-2">{activity.description}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-slate-500 text-xs">
                                  {activity.assigned_to_name || "Unassigned"}
                                </span>
                                <span className="text-cyan-400 text-xs">{activity.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-cyan-500 h-1 rounded-full"
                                  style={{ width: `${activity.progress}%` }}
                                />
                              </div>
                              {activity.due_date && (
                                <p className="text-slate-500 text-[10px] mt-1">
                                  Due: {new Date(activity.due_date).toLocaleDateString()}
                                </p>
                              )}
                              <div className="mt-1 text-slate-500 text-[10px] flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {(comments[activity.id] || []).length}
                              </div>
                            </div>
                          ))}
                          {statusActivities.length === 0 && (
                            <p className="text-slate-500 text-xs text-center py-4">No tasks</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-3">
                  {filteredActivities.map((activity) => {
                    const StatusIcon = statusIcons[activity.status] || ClipboardList;
                    const commentCount = (comments[activity.id] || []).length;
                    
                    return (
                      <div
                        key={activity.id}
                        className="bg-slate-700/30 rounded-xl p-4 hover:border-cyan-500/30 border border-slate-700 cursor-pointer transition-all"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setShowTaskDetails(true);
                          fetchComments(activity.id);
                        }}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div className="flex-1 min-w-[200px]">
                            <h4 className="text-white font-semibold">{activity.title}</h4>
                            <p className="text-slate-400 text-sm">{activity.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[activity.status]}`}>
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {activity.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[activity.priority]}`}>
                              {activity.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                          <span>👤 {activity.assigned_to_name || "Unassigned"}</span>
                          {activity.due_date && (
                            <span>📅 {new Date(activity.due_date).toLocaleDateString()}</span>
                          )}
                          <span>📊 {activity.progress}%</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {commentCount}
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-cyan-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${activity.progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {filteredActivities.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p>No activities found</p>
                      {canAddActivities && (
                        <button
                          onClick={() => setShowAddActivity(true)}
                          className="mt-3 text-cyan-400 hover:text-cyan-300"
                        >
                          Create the first activity →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {showTaskDetails && selectedActivity && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowTaskDetails(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedActivity.title}</h2>
                  <p className="text-slate-400 text-sm mt-1">{selectedActivity.description}</p>
                </div>
                <button onClick={() => setShowTaskDetails(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[selectedActivity.status]}`}>
                    {selectedActivity.status}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Priority</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[selectedActivity.priority]}`}>
                    {selectedActivity.priority}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Assigned To</p>
                  <p className="text-white">{selectedActivity.assigned_to_name || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Due Date</p>
                  <p className="text-white">{selectedActivity.due_date ? new Date(selectedActivity.due_date).toLocaleDateString() : "No due date"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${selectedActivity.progress}%` }}
                      />
                    </div>
                    <span className="text-cyan-400 text-sm">{selectedActivity.progress}%</span>
                  </div>
                </div>
                {canManageGroup && (
                  <div>
                    <p className="text-slate-400 text-sm">Update Progress</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={updateProgress[selectedActivity.id] ?? selectedActivity.progress}
                      onChange={(e) => {
                        const newProgress = parseInt(e.target.value);
                        setUpdateProgress(prev => ({ ...prev, [selectedActivity.id]: newProgress }));
                      }}
                      className="w-full accent-cyan-500"
                    />
                    <button
                      onClick={() => {
                        const progress = updateProgress[selectedActivity.id] ?? selectedActivity.progress;
                        updateActivityProgress(selectedActivity.id, progress);
                      }}
                      className="mt-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors"
                    >
                      Update Progress
                    </button>
                  </div>
                )}
              </div>
              
              {/* Status Update */}
              {canManageGroup && (
                <div className="mb-6">
                  <p className="text-slate-400 text-sm mb-2">Change Status</p>
                  <div className="flex flex-wrap gap-2">
                    {["Not Started", "In Progress", "Under Review", "Completed", "Blocked"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          updateActivityStatus(selectedActivity.id, status);
                          setShowTaskDetails(false);
                        }}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          selectedActivity.status === status
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comments ({comments[selectedActivity.id]?.length || 0})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                  {(comments[selectedActivity.id] || []).length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No comments yet. Start the conversation!</p>
                  ) : (
                    (comments[selectedActivity.id] || []).map((comment) => (
                      <div key={comment.id} className="bg-slate-700/30 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <span className="text-cyan-400 text-xs font-medium">
                            {comment.full_name || "Unknown User"}
                            {comment.user_id === user?.id && (
                              <span className="ml-2 text-emerald-400 text-[10px]">(You)</span>
                            )}
                          </span>
                          <span className="text-slate-500 text-xs">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 text-sm mt-1">{comment.comment}</p>
                      </div>
                    ))
                  )}
                </div>
                {/* Input for new comment */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    onKeyPress={(e) => e.key === "Enter" && addComment(selectedActivity.id)}
                  />
                  <button
                    onClick={() => addComment(selectedActivity.id)}
                    className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddMember(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-cyan-400" />
                  Add Member
                </h2>
                <button onClick={() => setShowAddMember(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Search by Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => {
                      setSearchEmail(e.target.value);
                      if (!e.target.value) {
                        setSearchResults([]);
                        setSelectedUser(null);
                      }
                    }}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="user@example.com"
                  />
                  <button
                    onClick={searchUsers}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                  >
                    Search
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-1">Enter at least 2 characters to search</p>
              </div>

              {searchResults.length > 0 && (
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Select User</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className={`p-3 rounded-xl cursor-pointer transition-colors ${
                          selectedUser?.id === result.id
                            ? "bg-cyan-600/20 border border-cyan-500/30"
                            : "bg-slate-700/30 hover:bg-slate-700/50"
                        }`}
                        onClick={() => setSelectedUser(result)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <span className="text-cyan-400 font-bold">
                              {result.full_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{result.full_name}</p>
                            <p className="text-slate-400 text-sm">{result.email}</p>
                          </div>
                          {selectedUser?.id === result.id && (
                            <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser && (
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Member">Member</option>
                    <option value="Co-Lead">Co-Lead</option>
                    <option value="Lead">Lead</option>
                  </select>
                  <p className="text-slate-500 text-xs mt-1">
                    Selected: <span className="text-white">{selectedUser.full_name}</span>
                  </p>
                </div>
              )}

              <button
                onClick={addMember}
                disabled={!selectedUser || addingMember}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addingMember ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Add Member
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivity && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddActivity(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-cyan-400" />
                  Add Task
                </h2>
                <button onClick={() => setShowAddActivity(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Title *</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Description</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                  placeholder="Describe the task..."
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Assign To</label>
                <select
                  value={newActivity.assigned_to}
                  onChange={(e) => setNewActivity({ ...newActivity, assigned_to: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.user_id}>{member.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Priority</label>
                <select
                  value={newActivity.priority}
                  onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Due Date</label>
                <input
                  type="date"
                  value={newActivity.due_date}
                  onChange={(e) => setNewActivity({ ...newActivity, due_date: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Estimated Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newActivity.estimated_hours}
                  onChange={(e) => setNewActivity({ ...newActivity, estimated_hours: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 sticky bottom-0 bg-slate-800 z-10">
              <button
                onClick={addActivity}
                disabled={!newActivity.title || addingActivity}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addingActivity ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}