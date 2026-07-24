// app/working-groups/[id]/progress-report/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Lightbulb,
  ArrowRight,
  Minus,
  Download,
  Printer,
  Share2,
  Calendar,
  Users,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  BarChart3,
  TrendingUp,
  MessageSquare,
  User,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Mail,
  FileSpreadsheet,
  FileJson,
  Send,
  Eye,
  Star,
  Award,
  Activity,
  Zap,
} from "lucide-react";

interface WorkingGroup {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  created_at: string;
  created_by: string;
  creator_name?: string;
  members?: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  priority: string;
  assigned_to: string;
  assigned_to_name?: string;
  due_date: string;
  completed_at?: string;
  created_at: string;
  created_by: string;
  created_by_name?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

interface Comment {
  id: string;
  user_id: string;
  full_name: string;
  comment: string;
  created_at: string;
  activity_id: string;
}

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  joined_at: string;
}

interface CommentAnalysis {
  totalComments: number;
  uniqueContributors: number;
  commentsByUser: {
    userId: string;
    name: string;
    count: number;
    role: string;
    commentTexts: string[];
  }[];
  commentsByActivity: {
    activityId: string;
    activityTitle: string;
    count: number;
    comments: Comment[];
  }[];
  topContributors: {
    userId: string;
    name: string;
    role: string;
    count: number;
  }[];
  recentComments: Comment[];
  sentimentSummary: string;
  keyInsights: string[];
  activityProgress: {
    activityId: string;
    title: string;
    status: string;
    progress: number;
    commentCount: number;
    lastCommentDate: string | null;
  }[];
}

export default function WorkingGroupProgressReport() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<WorkingGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdminOrLead, setIsAdminOrLead] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [dateRange, setDateRange] = useState<"all" | "month" | "week" | "quarter">("all");
  const [reportFormat, setReportFormat] = useState<"summary" | "detailed" | "executive">("summary");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [groupId]);

  const checkAuth = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        await fetchData(userData);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", session.user.id)
            .single();
          if (profile) {
            setUser(profile);
            await fetchData(profile);
          }
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    }
  };

  const fetchData = async (currentUser: any) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch group
      const { data: groupData, error: groupError } = await supabase
        .from("working_groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupError) throw groupError;

      if (groupData) {
        // Get creator name
        const { data: creator } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", groupData.created_by)
          .maybeSingle();

        setGroup({
          ...groupData,
          creator_name: creator?.full_name || "Unknown",
        });
      }

      // Fetch members from working_group_members table
      const { data: membersData, error: membersError } = await supabase
        .from("working_group_members")
        .select("*")
        .eq("working_group_id", groupId);

      if (membersError) throw membersError;

      if (membersData) {
        const userIds = membersData.map((m: any) => m.user_id);
        const { data: usersData } = await supabase
          .from("users")
          .select("id, full_name, email")
          .in("id", userIds);

        const userMap = new Map();
        usersData?.forEach((u: any) => userMap.set(u.id, u));

        const formattedMembers = membersData.map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          full_name: userMap.get(m.user_id)?.full_name || "Unknown",
          email: userMap.get(m.user_id)?.email || "",
          role: m.role || "Member",
          joined_at: m.joined_at,
        }));

        setMembers(formattedMembers);

        // Check if user is admin or lead
        const currentMember = formattedMembers.find((m: Member) => m.user_id === currentUser.id);
        const isLead = currentMember?.role === "Lead" || currentMember?.role === "Co-Lead";
        setIsAdminOrLead(isLead || currentUser.role === "Admin");
      }

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("working_group_activities")
        .select("*")
        .eq("working_group_id", groupId)
        .order("created_at", { ascending: false });

      if (activitiesError) throw activitiesError;

      if (activitiesData) {
        // Get assignee and creator names
        const activitiesWithNames = await Promise.all(
          activitiesData.map(async (activity) => {
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
            };
          })
        );

        setActivities(activitiesWithNames);
      }

      // Fetch all comments for this group
      await fetchAllComments(activitiesData || []);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllComments = async (activitiesData: any[]) => {
    try {
      // Get all activity IDs
      const activityIds = activitiesData.map((a: any) => a.id);
      
      if (activityIds.length === 0) {
        setAllComments([]);
        return;
      }

      console.log("Fetching comments for activity IDs:", activityIds);

      // Approach 1: Simple fetch without join
      const result = await supabase
        .from("activity_comments")
        .select("*")
        .in("activity_id", activityIds)
        .order("created_at", { ascending: false });

      const commentsData = result.data;
      const error = result.error;

      if (error) {
        console.error("Error fetching comments:", error);
        setAllComments([]);
        return;
      }

      console.log("Raw comments data:", commentsData);

      if (commentsData && commentsData.length > 0) {
        // Get user names for each comment
        const userIds = commentsData.map((c: any) => c.user_id);
        const uniqueUserIds = [...new Set(userIds)];
        
        let userMap = new Map();
        if (uniqueUserIds.length > 0) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id, full_name")
            .in("id", uniqueUserIds);
          
          usersData?.forEach((u: any) => userMap.set(u.id, u.full_name));
        }

        const formattedComments = commentsData.map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          full_name: userMap.get(c.user_id) || "Unknown User",
          comment: c.comment,
          created_at: c.created_at,
          activity_id: c.activity_id,
        }));

        console.log("Formatted comments:", formattedComments);
        setAllComments(formattedComments);
      } else {
        console.log("No comments found for activities");
        setAllComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setAllComments([]);
    }
  };

  // ============================================
  // COMMENT ANALYSIS
  // ============================================
  const analyzeComments = useMemo((): CommentAnalysis => {
    const analysis: CommentAnalysis = {
      totalComments: allComments.length,
      uniqueContributors: 0,
      commentsByUser: [],
      commentsByActivity: [],
      topContributors: [],
      recentComments: [],
      sentimentSummary: "",
      keyInsights: [],
      activityProgress: [],
    };

    console.log("Analyzing comments:", allComments.length);

    if (allComments.length === 0) {
      return analysis;
    }

    // Analyze by user
    const userCommentMap = new Map<string, { name: string; role: string; comments: string[] }>();
    allComments.forEach(c => {
      const userRole = members.find(m => m.user_id === c.user_id)?.role || "Member";
      if (userCommentMap.has(c.user_id)) {
        const existing = userCommentMap.get(c.user_id)!;
        existing.comments.push(c.comment);
      } else {
        userCommentMap.set(c.user_id, {
          name: c.full_name,
          role: userRole,
          comments: [c.comment],
        });
      }
    });

    analysis.uniqueContributors = userCommentMap.size;

    // Build comments by user
    userCommentMap.forEach((data, userId) => {
      analysis.commentsByUser.push({
        userId,
        name: data.name,
        role: data.role,
        count: data.comments.length,
        commentTexts: data.comments,
      });
    });

    // Sort by count descending
    analysis.commentsByUser.sort((a, b) => b.count - a.count);

    // Top contributors
    analysis.topContributors = analysis.commentsByUser
      .slice(0, 5)
      .map(u => ({
        userId: u.userId,
        name: u.name,
        role: u.role,
        count: u.count,
      }));

    // Analyze by activity
    const activityCommentMap = new Map<string, Comment[]>();
    allComments.forEach(c => {
      if (activityCommentMap.has(c.activity_id)) {
        activityCommentMap.get(c.activity_id)!.push(c);
      } else {
        activityCommentMap.set(c.activity_id, [c]);
      }
    });

    activityCommentMap.forEach((comments, activityId) => {
      const activity = activities.find(a => a.id === activityId);
      analysis.commentsByActivity.push({
        activityId,
        activityTitle: activity?.title || "Unknown Activity",
        count: comments.length,
        comments,
      });
    });

    // Sort by count descending
    analysis.commentsByActivity.sort((a, b) => b.count - a.count);

    // Recent comments (last 10)
    analysis.recentComments = allComments.slice(0, 10);

    // Activity progress with comment counts
    analysis.activityProgress = activities.map(a => {
      const activityComments = allComments.filter(c => c.activity_id === a.id);
      const lastComment = activityComments.length > 0 
        ? activityComments.sort((x, y) => 
            new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
          )[0]
        : null;
      
      return {
        activityId: a.id,
        title: a.title,
        status: a.status,
        progress: a.progress,
        commentCount: activityComments.length,
        lastCommentDate: lastComment?.created_at || null,
      };
    });

    // Generate key insights
    const insights: string[] = [];

    if (analysis.totalComments > 0) {
      insights.push(`Total of ${analysis.totalComments} comments have been shared across ${activities.length} activities.`);
    }

    if (analysis.uniqueContributors > 0) {
      insights.push(`${analysis.uniqueContributors} team members have contributed to discussions.`);
    }

    const topContributor = analysis.topContributors[0];
    if (topContributor) {
      insights.push(`${topContributor.name} is the top contributor with ${topContributor.count} comments.`);
    }

    const mostDiscussedActivity = analysis.commentsByActivity[0];
    if (mostDiscussedActivity) {
      insights.push(`"${mostDiscussedActivity.activityTitle}" has the most comments (${mostDiscussedActivity.count}).`);
    }

    // Check activity status distribution
    const completedActivities = activities.filter(a => a.status === "Completed").length;
    const inProgressActivities = activities.filter(a => a.status === "In Progress" || a.status === "Under Review").length;
    const notStartedActivities = activities.filter(a => a.status === "Not Started").length;

    insights.push(`Activities status: ${completedActivities} completed, ${inProgressActivities} in progress, ${notStartedActivities} not started.`);

    const avgComments = activities.length > 0 ? Math.round(analysis.totalComments / activities.length) : 0;
    insights.push(`Average comments per activity: ${avgComments}.`);

    analysis.keyInsights = insights;

    // Sentiment summary based on comment analysis (simple version)
    const positiveWords = ["good", "great", "excellent", "awesome", "well", "progress", "completed", "done", "success", "thanks", "appreciate", "helpful"];
    const negativeWords = ["issue", "problem", "delay", "stuck", "blocked", "slow", "difficult", "challenging", "concern"];
    const neutralWords = ["ok", "fine", "noted", "okay", "neutral"];

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    allComments.forEach(c => {
      const text = c.comment.toLowerCase();
      const hasPositive = positiveWords.some(w => text.includes(w));
      const hasNegative = negativeWords.some(w => text.includes(w));
      const hasNeutral = neutralWords.some(w => text.includes(w));

      if (hasPositive) positiveCount++;
      if (hasNegative) negativeCount++;
      if (hasNeutral) neutralCount++;
    });

    let sentiment = "";
    if (positiveCount > negativeCount * 1.5) {
      sentiment = "🟢 Very Positive - Team members are expressing satisfaction and progress.";
    } else if (positiveCount > negativeCount) {
      sentiment = "🟡 Generally Positive - Overall sentiment is good with some challenges noted.";
    } else if (negativeCount > positiveCount * 1.5) {
      sentiment = "🔴 Needs Attention - Significant concerns or challenges are being raised.";
    } else {
      sentiment = "⚪ Balanced - Mix of positive and constructive feedback.";
    }

    analysis.sentimentSummary = sentiment;

    return analysis;
  }, [allComments, activities, members]);

  const filteredComments = useMemo(() => {
    if (dateRange === "all") return allComments;
    
    const now = new Date();
    let cutoff = new Date();
    
    switch (dateRange) {
      case "week":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        cutoff.setMonth(now.getMonth() - 3);
        break;
      default:
        return allComments;
    }
    
    return allComments.filter(c => new Date(c.created_at) >= cutoff);
  }, [allComments, dateRange]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["Activity", "Comment", "Author", "Date", "Role"];
    const rows = allComments.map(c => {
      const activity = activities.find(a => a.id === c.activity_id);
      const member = members.find(m => m.user_id === c.user_id);
      return [
        activity?.title || "Unknown",
        c.comment,
        c.full_name,
        new Date(c.created_at).toLocaleString(),
        member?.role || "Member",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `progress_report_${group?.name}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    const reportText = generateReportText();
    navigator.clipboard.writeText(reportText);
    alert("✅ Report copied to clipboard!");
  };

  const generateReportText = () => {
    const analysis = analyzeComments;
    let text = `╔══════════════════════════════════════════════════════════════╗\n`;
    text += `║        WORKING GROUP PROGRESS REPORT                        ║\n`;
    text += `╚══════════════════════════════════════════════════════════════╝\n\n`;
    text += `📊 GROUP INFORMATION\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    text += `Group:        ${group?.name}\n`;
    text += `Status:       ${group?.status || 'N/A'}\n`;
    text += `Progress:     ${group?.progress || 0}%\n`;
    text += `Report Date:  ${new Date().toLocaleString()}\n\n`;
    
    text += `📈 EXECUTIVE SUMMARY\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    text += `Total Activities:     ${activities.length}\n`;
    text += `  ✅ Completed:       ${activities.filter(a => a.status === "Completed").length}\n`;
    text += `  🔄 In Progress:     ${activities.filter(a => a.status === "In Progress" || a.status === "Under Review").length}\n`;
    text += `  ⏳ Not Started:     ${activities.filter(a => a.status === "Not Started").length}\n`;
    text += `Team Members:         ${members.length}\n`;
    text += `  👥 Leads:           ${members.filter(m => m.role === "Lead" || m.role === "Co-Lead").length}\n`;
    text += `Total Comments:       ${analysis.totalComments}\n`;
    text += `  👤 Contributors:    ${analysis.uniqueContributors}\n\n`;
    
    text += `💬 TOP CONTRIBUTORS\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    if (analysis.topContributors.length > 0) {
      analysis.topContributors.forEach((c, i) => {
        text += `  ${i + 1}. ${c.name.padEnd(20)} (${c.role.padEnd(8)}) - ${c.count} comments\n`;
      });
    } else {
      text += `  No contributors yet\n`;
    }
    text += `\n`;
    
    text += `💡 KEY INSIGHTS\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    if (analysis.keyInsights.length > 0) {
      analysis.keyInsights.forEach(insight => {
        text += `  • ${insight}\n`;
      });
    } else {
      text += `  No insights available yet\n`;
    }
    text += `\n`;
    
    text += `😊 TEAM SENTIMENT\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    text += `  ${analysis.sentimentSummary || "No comments available for sentiment analysis."}\n\n`;
    
    text += `📋 ACTIVITY PROGRESS & COMMENTS\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    if (analysis.activityProgress.length > 0) {
      analysis.activityProgress.forEach(ap => {
        const statusIcon = ap.status === "Completed" ? "✅" : 
                          ap.status === "In Progress" ? "🔄" : 
                          ap.status === "Under Review" ? "🔍" : "⏳";
        text += `  ${statusIcon} ${ap.title}\n`;
        text += `     Progress: ${ap.progress}%  |  Status: ${ap.status}  |  Comments: ${ap.commentCount}\n`;
        if (ap.lastCommentDate) {
          text += `     Last comment: ${new Date(ap.lastCommentDate).toLocaleString()}\n`;
        }
        text += `\n`;
      });
    } else {
      text += `  No activities created yet\n\n`;
    }
    
    // Add all comments section with full details
    text += `💬 ALL COMMENTS (${allComments.length} total)\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    if (allComments.length > 0) {
      // Group comments by activity
      const commentsByActivity = new Map<string, Comment[]>();
      allComments.forEach(c => {
        if (commentsByActivity.has(c.activity_id)) {
          commentsByActivity.get(c.activity_id)!.push(c);
        } else {
          commentsByActivity.set(c.activity_id, [c]);
        }
      });
      
      // Sort activities by comment count (most discussed first)
      const sortedActivities = Array.from(commentsByActivity.entries())
        .sort((a, b) => b[1].length - a[1].length);
      
      sortedActivities.forEach(([activityId, comments]) => {
        const activity = activities.find(a => a.id === activityId);
        const activityTitle = activity?.title || "Unknown Activity";
        text += `\n  📌 ${activityTitle} (${comments.length} comments)\n`;
        text += `  ${'─'.repeat(50)}\n`;
        
        // Sort comments by date (newest first)
        const sortedComments = [...comments].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        sortedComments.forEach((comment, index) => {
          const date = new Date(comment.created_at).toLocaleString();
          text += `  ${(index + 1).toString().padStart(2)}. ${comment.full_name.padEnd(20)} (${date})\n`;
          text += `     "${comment.comment}"\n`;
          text += `\n`;
        });
      });
    } else {
      text += `  No comments yet. Start discussions by adding comments to activities.\n`;
    }
    
    text += `\n`;
    text += `╔══════════════════════════════════════════════════════════════╗\n`;
    text += `║  Generated from AMHROA Working Group Progress Report System ║\n`;
    text += `║  ${new Date().toLocaleString().padEnd(44)} ║\n`;
    text += `╚══════════════════════════════════════════════════════════════╝\n`;
    
    return text;
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (user) {
      await fetchData(user);
    }
  };

  // Enhanced share via email with all comments
  const handleEmailShare = () => {
    const reportText = generateReportText();
    const subject = encodeURIComponent(`Progress Report: ${group?.name} (${new Date().toLocaleDateString()})`);
    const body = encodeURIComponent(reportText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!isAdminOrLead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-300 mb-4">
            Only group leaders and administrators can view this progress report.
          </p>
          <Link
            href={`/working-groups/${groupId}`}
            className="inline-block px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
          >
            Back to Group
          </Link>
        </div>
      </div>
    );
  }

  const analysis = analyzeComments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-content, #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 40px;
          }
          .no-print {
            display: none !important;
          }
          .print-button {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20 no-print">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <Link
            href={`/working-groups/${groupId}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Group
          </Link>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    PROGRESS REPORT
                  </span>
                </div>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-xs transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {group?.name} - Progress Report
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Generated on {new Date().toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={handleEmailShare}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 md:mx-8 mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          <p className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </p>
        </div>
      )}

      {/* Report Content */}
      <div id="report-content" className="px-4 md:px-8 py-6">
        {/* Executive Summary */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Executive Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs">Total Activities</p>
              <p className="text-2xl font-bold text-white">{activities.length}</p>
              <div className="flex justify-center gap-2 mt-1 text-xs flex-wrap">
                <span className="text-emerald-400">{activities.filter(a => a.status === "Completed").length} done</span>
                <span className="text-blue-400">{activities.filter(a => a.status === "In Progress" || a.status === "Under Review").length} in progress</span>
                <span className="text-slate-400">{activities.filter(a => a.status === "Not Started").length} not started</span>
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs">Overall Progress</p>
              <p className="text-3xl font-bold text-cyan-400">{group?.progress || 0}%</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs">Team Members</p>
              <p className="text-2xl font-bold text-white">{members.length}</p>
              <p className="text-xs text-slate-400">
                {members.filter(m => m.role === "Lead" || m.role === "Co-Lead").length} leads
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs">Comments</p>
              <p className="text-2xl font-bold text-white">{analysis.totalComments}</p>
              <p className="text-xs text-slate-400">{analysis.uniqueContributors} contributors</p>
            </div>
          </div>
        </div>

        {/* Sentiment & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Team Sentiment
            </h3>
            <div className="bg-slate-700/30 rounded-xl p-4">
              <p className="text-slate-300">{analysis.sentimentSummary || "No comments available for sentiment analysis."}</p>
            </div>
            {analysis.totalComments > 0 && (
              <div className="mt-3 flex gap-4 text-sm">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-4 h-4" /> Positive
                </span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <Minus className="w-4 h-4" /> Neutral
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <AlertCircle className="w-4 h-4" /> Negative
                </span>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Key Insights
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {analysis.keyInsights.length > 0 ? (
                analysis.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>{insight}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No insights available yet. Start adding comments to activities to generate insights.</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Top Contributors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.topContributors.length > 0 ? (
              analysis.topContributors.map((contributor, index) => (
                <div key={contributor.userId} className="bg-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <span className="text-cyan-400 font-bold">
                        {contributor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{contributor.name}</p>
                      <p className="text-slate-400 text-xs">{contributor.role}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-cyan-400 font-bold text-xl">{contributor.count}</p>
                      <p className="text-slate-500 text-xs">comments</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 col-span-full text-center py-4">No contributors yet. Comments will appear here once team members start discussing activities.</p>
            )}
          </div>
        </div>

        {/* Activity Progress with Comments */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Activity Progress & Comments
          </h3>
          {analysis.activityProgress.length > 0 ? (
            <div className="space-y-4">
              {analysis.activityProgress.map((ap) => {
                const activity = activities.find(a => a.id === ap.activityId);
                const activityComments = allComments.filter(c => c.activity_id === ap.activityId);
                
                return (
                  <div key={ap.activityId} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-white font-medium">{ap.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            ap.status === "Completed" ? "bg-emerald-500/20 text-emerald-400" :
                            ap.status === "In Progress" ? "bg-blue-500/20 text-blue-400" :
                            ap.status === "Under Review" ? "bg-purple-500/20 text-purple-400" :
                            "bg-slate-500/20 text-slate-400"
                          }`}>
                            {ap.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-32 bg-slate-700 rounded-full h-1.5">
                            <div 
                              className="bg-cyan-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${ap.progress}%` }}
                            />
                          </div>
                          <span className="text-cyan-400 text-xs">{ap.progress}%</span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {ap.commentCount} comments
                          </span>
                          {ap.lastCommentDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Last: {new Date(ap.lastCommentDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {activityComments.length > 0 && (
                          <button
                            onClick={() => {
                              const comments = activityComments.map(c => 
                                `${c.full_name}: ${c.comment} (${new Date(c.created_at).toLocaleString()})`
                              ).join('\n');
                              alert(`Comments for "${ap.title}":\n\n${comments}`);
                            }}
                            className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 rounded-lg text-cyan-400 text-xs transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View {activityComments.length} comments
                          </button>
                        )}
                        <Link
                          href={`/working-groups/${groupId}?activity=${ap.activityId}`}
                          className="px-3 py-1.5 bg-slate-600/50 hover:bg-slate-600 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          Open
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No activities created yet. Create activities to track progress.</p>
          )}
        </div>

        {/* Recent Comments */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Recent Comments
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredComments.length > 0 ? (
              filteredComments.map((comment) => {
                const activity = activities.find(a => a.id === comment.activity_id);
                return (
                  <div key={comment.id} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium">{comment.full_name}</span>
                          <span className="text-slate-500 text-xs">
                            {members.find(m => m.user_id === comment.user_id)?.role || "Member"}
                          </span>
                          <span className="text-slate-500 text-xs">
                            on {activity?.title || "Unknown Activity"}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mt-1">{comment.comment}</p>
                      </div>
                      <span className="text-slate-500 text-xs whitespace-nowrap ml-4">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-center py-8">
                {dateRange === "all" 
                  ? "No comments yet. Start discussions by adding comments to activities." 
                  : "No comments in this time period."}
              </p>
            )}
          </div>
        </div>

        {/* Report Footer */}
        <div className="mt-6 pt-6 border-t border-slate-700 text-center text-slate-500 text-xs">
          <p>
            Generated from AMHROA Working Group Progress Report System • {new Date().toLocaleString()}
          </p>
          <p className="mt-1">
            Group: {group?.name} • Members: {members.length} • Activities: {activities.length} • Comments: {allComments.length}
          </p>
        </div>
      </div>
    </div>
  );
}