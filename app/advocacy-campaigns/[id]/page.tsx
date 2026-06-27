// app/advocacy-campaigns/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Megaphone,
  Users,
  Target,
  Calendar,
  MapPin,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  UserPlus,
  Handshake,
  Share2,
  Copy,
  Check,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
  Plus,
  X,
  Send,
  User,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  Heart,
  FileText,
  Search,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

interface Campaign {
  id: string;
  title: string;
  description: string;
  region: string;
  country: string;
  status: "Planning" | "Active" | "In Progress" | "Completed" | "Archived";
  priority: "Low" | "Medium" | "High" | "Critical";
  reach: number;
  engagement: number;
  start_date: string;
  end_date: string;
  created_at: string;
  created_by: string;
  creator_name?: string;
  supporter_count?: number;
  metadata?: {
    sdg_alignment?: string[];
    coalition_organizations?: string[];
  };
}

interface CoalitionMember {
  id: string;
  organization_id: string;
  organization_name?: string;
  organization_type?: string;
  country?: string;
  role: string;
  joined_at: string;
}

interface Action {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  progress: number;
  assigned_to: string;
  assigned_to_name?: string;
  due_date: string;
  completed_at?: string;
}

interface Supporter {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  message?: string;
  joined_at: string;
}

interface Organization {
  id: string;
  name: string;
  country?: string;
  type?: string;
}

const actionTypes = [
  { value: "petition", label: "Petition", icon: FileText },
  { value: "letter", label: "Letter Writing", icon: Send },
  { value: "meeting", label: "Policy Meeting", icon: Handshake },
  { value: "social_media", label: "Social Media Campaign", icon: Megaphone },
  { value: "rally", label: "Rally/March", icon: Users },
  { value: "policy_brief", label: "Policy Brief", icon: FileText },
  { value: "media_engagement", label: "Media Engagement", icon: MessageSquare },
];

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [coalitionMembers, setCoalitionMembers] = useState<CoalitionMember[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supporting, setSupporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "actions" | "coalition" | "supporters">("overview");
  
  // Action Modal States
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionForm, setActionForm] = useState({
    title: "",
    description: "",
    type: "",
    target_audience: "",
    due_date: "",
    assigned_to: "",
  });
  const [submittingAction, setSubmittingAction] = useState(false);
  
  // Invite Organization Modal States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchOrgTerm, setSearchOrgTerm] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviteMessage, setInviteMessage] = useState("");
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [availableOrgs, setAvailableOrgs] = useState<Organization[]>([]);

  // Users for assignment
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Check localStorage first
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        // Check Supabase session using id (not auth_user_id)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!sessionError && session) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (profile) {
            setUser(profile);
            localStorage.setItem("user", JSON.stringify(profile));
          }
        }
      }

      await Promise.all([
        fetchCampaignData(),
        fetchUsers(),
        fetchOrganizations()
      ]);
    };

    fetchData();
  }, [campaignId]);

  const fetchCampaignData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Fetching campaign with ID:", campaignId);
      
      // Fetch campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from("advocacy_campaigns")
        .select("*")
        .eq("id", campaignId)
        .maybeSingle();
  
      if (campaignError) {
        console.error("❌ Campaign fetch error:", campaignError);
        setError("Failed to load campaign");
        setLoading(false);
        return;
      }
  
      if (!campaignData) {
        console.error("❌ No campaign found with ID:", campaignId);
        setError("Campaign not found");
        setLoading(false);
        return;
      }
  
      console.log("✅ Campaign found:", campaignData);
  
      // Get creator name separately
      let creatorName = "Unknown";
      if (campaignData.created_by) {
        const { data: creatorData, error: creatorError } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", campaignData.created_by)
          .maybeSingle();
        
        if (!creatorError && creatorData) {
          creatorName = creatorData.full_name || "Unknown";
        }
      }

      // Get supporter count
      const { count: supporterCount, error: countError } = await supabase
        .from("advocacy_supporters")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", campaignId);

      if (countError) {
        console.error("❌ Supporter count error:", countError);
      }
  
      setCampaign({
        ...campaignData,
        creator_name: creatorName,
        supporter_count: supporterCount || 0,
        metadata: campaignData.metadata || {},
      });
  
      // Check if user supports this campaign
      if (user) {
        const { data: supportData } = await supabase
          .from("advocacy_supporters")
          .select("id")
          .eq("campaign_id", campaignId)
          .eq("user_id", user.id)
          .maybeSingle();
        setIsSupported(!!supportData);
      }
  
      // Fetch coalition members
      const { data: coalitionData, error: coalitionError } = await supabase
        .from("advocacy_coalition_members")
        .select("*")
        .eq("campaign_id", campaignId);
  
      if (!coalitionError && coalitionData) {
        // Get organization details separately
        const coalitionWithOrgs = await Promise.all(
          coalitionData.map(async (member) => {
            let orgName = "Unknown Organization";
            let orgType = "N/A";
            let orgCountry = "";
            
            if (member.organization_id) {
              const { data: orgData } = await supabase
                .from("organizations")
                .select("name, type, country")
                .eq("id", member.organization_id)
                .maybeSingle();
              if (orgData) {
                orgName = orgData.name || "Unknown Organization";
                orgType = orgData.type || "N/A";
                orgCountry = orgData.country || "";
              }
            }
            
            return {
              ...member,
              organization_name: orgName,
              organization_type: orgType,
              country: orgCountry,
            };
          })
        );
        setCoalitionMembers(coalitionWithOrgs);
      }
  
      // Fetch actions
      const { data: actionsData, error: actionsError } = await supabase
        .from("advocacy_actions")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("due_date", { ascending: true });
  
      if (!actionsError && actionsData) {
        // Get assignee names separately
        const actionsWithNames = await Promise.all(
          actionsData.map(async (action) => {
            let assignedToName = "Unassigned";
            if (action.assigned_to) {
              const { data: userData } = await supabase
                .from("users")
                .select("full_name")
                .eq("id", action.assigned_to)
                .maybeSingle();
              if (userData) {
                assignedToName = userData.full_name || "Unassigned";
              }
            }
            return {
              ...action,
              assigned_to_name: assignedToName,
            };
          })
        );
        setActions(actionsWithNames);
      }
  
      // Fetch supporters
      const { data: supportersData, error: supportersError } = await supabase
        .from("advocacy_supporters")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("joined_at", { ascending: false });
  
      if (!supportersError && supportersData) {
        // Get user names separately
        const supportersWithNames = await Promise.all(
          supportersData.map(async (supporter) => {
            let userName = "Anonymous";
            let userEmail = "";
            if (supporter.user_id) {
              const { data: userData } = await supabase
                .from("users")
                .select("full_name, email")
                .eq("id", supporter.user_id)
                .maybeSingle();
              if (userData) {
                userName = userData.full_name || "Anonymous";
                userEmail = userData.email || "";
              }
            }
            return {
              ...supporter,
              user_name: userName,
              user_email: userEmail,
            };
          })
        );
        setSupporters(supportersWithNames);
      }
  
      // Update available organizations
      if (coalitionData) {
        const memberOrgIds = coalitionData.map((c: any) => c.organization_id);
        setAvailableOrgs(organizations.filter(org => !memberOrgIds.includes(org.id)));
      }
  
    } catch (error) {
      console.error("❌ Error fetching campaign:", error);
      setError("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, email, role")
      .eq("status", "Approved")
      .limit(50);
    if (data) setUsers(data);
  };

  const fetchOrganizations = async () => {
    try {
      console.log("🔍 Fetching organizations...");
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, country, type")
        .eq("status", "Approved")
        .order("name", { ascending: true });
      
      if (error) {
        console.error("❌ Organizations error:", error);
        return;
      }
      
      console.log("✅ Organizations found:", data?.length || 0);
      if (data) {
        setOrganizations(data);
        
        // After fetching organizations, update available orgs
        if (coalitionMembers.length > 0) {
          const memberOrgIds = coalitionMembers.map((c: any) => c.organization_id);
          setAvailableOrgs(data.filter(org => !memberOrgIds.includes(org.id)));
        } else {
          setAvailableOrgs(data);
        }
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const handleSupportCampaign = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
  
    setSupporting(true);
    try {
      console.log("🔍 Supporting campaign:", campaignId);
      console.log("🔍 User:", user.id);
      
      // Check if user already supports this campaign
      const { data: existingSupport, error: checkError } = await supabase
        .from("advocacy_supporters")
        .select("id")
        .eq("campaign_id", campaignId)
        .eq("user_id", user.id)
        .maybeSingle();
  
      if (checkError) {
        console.error("❌ Check error:", checkError);
      }
  
      if (existingSupport) {
        alert("You already support this campaign!");
        setSupporting(false);
        return;
      }
  
      // Insert support
      const { data, error } = await supabase
        .from("advocacy_supporters")
        .insert({
          campaign_id: campaignId,
          user_id: user.id,
          message: supportMessage || undefined,
          joined_at: new Date().toISOString(),
          status: "Active",
        })
        .select()
        .single();
  
      if (error) {
        console.error("❌ Insert error:", error);
        alert(`Failed to support campaign: ${error.message}`);
        setSupporting(false);
        return;
      }
  
      console.log("✅ Support added:", data);
  
      // Update local state
      setIsSupported(true);
      
      // Add new supporter to the list
      const newSupporter: Supporter = {
        id: data[0]?.id || data.id,
        user_id: user.id,
        user_name: user.full_name || "Anonymous",
        user_email: user.email || "",
        message: supportMessage || "",
        joined_at: new Date().toISOString(),
      };
      setSupporters(prev => [newSupporter, ...prev]);
      
      // Update campaign supporter count
      setCampaign(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          supporter_count: (prev.supporter_count || 0) + 1,
        };
      });
  
      setShowSupportModal(false);
      setSupportMessage("");
      
      alert("You are now supporting this campaign!");
    } catch (error) {
      console.error("❌ Error supporting campaign:", error);
      alert("Failed to support campaign. Please try again.");
    } finally {
      setSupporting(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddAction = async () => {
    if (!actionForm.title || !actionForm.type) {
      alert("Please fill in the required fields");
      return;
    }
  
    setSubmittingAction(true);
    try {
      const { data, error } = await supabase
        .from("advocacy_actions")
        .insert({
          campaign_id: campaignId,
          title: actionForm.title,
          description: actionForm.description || null,
          type: actionForm.type,
          target_audience: actionForm.target_audience || null,
          due_date: actionForm.due_date || null,
          assigned_to: actionForm.assigned_to || null,
          status: "Planned",
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
  
      if (error) throw error;
  
      setActions(prev => [{
        ...data,
        assigned_to_name: users.find(u => u.id === data.assigned_to)?.full_name || "Unassigned",
      }, ...prev]);
  
      setShowActionModal(false);
      setActionForm({
        title: "",
        description: "",
        type: "",
        target_audience: "",
        due_date: "",
        assigned_to: "",
      });
      
      alert("Action added successfully!");
    } catch (error) {
      console.error("Error adding action:", error);
      alert("Failed to add action. Please try again.");
    } finally {
      setSubmittingAction(false);
    }
  };
  

  // ==================== INVITE ORGANIZATION FUNCTIONALITY ====================
  const handleInviteOrganization = async () => {
  if (!selectedOrg) {
    alert("Please select an organization");
    return;
  }

  setSubmittingInvite(true);
  try {
    console.log("🔍 Inviting organization:", selectedOrg);
    console.log("🔍 Campaign ID:", campaignId);
    
    // Check if organization is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("advocacy_coalition_members")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("organization_id", selectedOrg)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Check error:", checkError);
    }

    if (existingMember) {
      alert("This organization is already a member of the coalition!");
      setSubmittingInvite(false);
      return;
    }

    // Insert coalition member
    const { data, error } = await supabase
      .from("advocacy_coalition_members")
      .insert({
        campaign_id: campaignId,
        organization_id: selectedOrg,
        role: inviteRole,
        status: "Active",
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Insert error:", error);
      alert(`Failed to invite organization: ${error.message}`);
      setSubmittingInvite(false);
      return;
    }

    console.log("✅ Organization invited:", data);

    // Get organization details
    const org = organizations.find(o => o.id === selectedOrg);
    
    const newMember: CoalitionMember = {
      id: data[0]?.id || data.id,
      organization_id: selectedOrg,
      organization_name: org?.name || "Unknown Organization",
      organization_type: org?.type || "N/A",
      country: org?.country || "",
      role: inviteRole,
      joined_at: new Date().toISOString(),
    };
    
    setCoalitionMembers(prev => [...prev, newMember]);
    setAvailableOrgs(prev => prev.filter(org => org.id !== selectedOrg));

    // Clear search and selection
    setShowInviteModal(false);
    setSelectedOrg("");
    setInviteRole("Member");
    setInviteMessage("");
    setSearchOrgTerm("");
    
    alert("Organization invited successfully!");
  } catch (error) {
    console.error("❌ Error inviting organization:", error);
    alert("Failed to invite organization. Please try again.");
  } finally {
    setSubmittingInvite(false);
  }
};

  // ==================== UPDATE ACTION PROGRESS ====================
  const updateActionProgress = async (actionId: string, progress: number) => {
    // Check if user is authorized to update this action
    const action = actions.find(a => a.id === actionId);
    if (!action) {
      alert("Action not found");
      return;
    }
    
    // Check if user is the creator or an admin
    const isCreator = action.assigned_to === user?.id;
    const isAdmin = user?.role === "Admin";
    
    if (!isCreator && !isAdmin) {
      alert("You don't have permission to update this action. Only the action creator or an Admin can update progress.");
      return;
    }

    try {
      const status = progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Planned";
      const { error } = await supabase
        .from("advocacy_actions")
        .update({
          progress,
          status,
          completed_at: progress >= 100 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", actionId);

      if (error) throw error;

      // Update local state
      setActions(prev => prev.map(a => 
        a.id === actionId ? { ...a, progress, status } : a
      ));
    } catch (error) {
      console.error("Error updating action progress:", error);
      alert("Failed to update action progress. Please try again.");
    }
  };
  // Update available organizations when coalition members or organizations change
  useEffect(() => {
    if (organizations.length > 0 && coalitionMembers.length >= 0) {
      const memberOrgIds = coalitionMembers.map((c: any) => c.organization_id);
      setAvailableOrgs(organizations.filter(org => !memberOrgIds.includes(org.id)));
    }
  }, [organizations, coalitionMembers]);
  // ==================== REMOVE COALITION MEMBER ====================
  const removeCoalitionMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this organization from the coalition?")) return;

    try {
      const { error } = await supabase
        .from("advocacy_coalition_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      const removedMember = coalitionMembers.find(m => m.id === memberId);
      setCoalitionMembers(prev => prev.filter(m => m.id !== memberId));
      
      if (removedMember) {
        const org = organizations.find(o => o.id === removedMember.organization_id);
        if (org) {
          setAvailableOrgs(prev => [...prev, org]);
        }
      }
    } catch (error) {
      console.error("Error removing coalition member:", error);
      alert("Failed to remove organization. Please try again.");
    }
  };

  // ==================== DELETE ACTION ====================
  const deleteAction = async (actionId: string) => {
    if (!confirm("Are you sure you want to delete this action?")) return;

    try {
      const { error } = await supabase
        .from("advocacy_actions")
        .delete()
        .eq("id", actionId);

      if (error) throw error;

      setActions(prev => prev.filter(a => a.id !== actionId));
    } catch (error) {
      console.error("Error deleting action:", error);
      alert("Failed to delete action. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle };
      case "In Progress":
        return { color: "bg-blue-500/20 text-blue-400", icon: Clock };
      case "Planning":
        return { color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
      case "Completed":
        return { color: "bg-purple-500/20 text-purple-400", icon: CheckCircle };
      case "Archived":
        return { color: "bg-slate-500/20 text-slate-400", icon: AlertCircle };
      default:
        return { color: "bg-slate-500/20 text-slate-400", icon: Clock };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-red-400";
      case "High": return "text-orange-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-blue-400";
      default: return "text-slate-400";
    }
  };

  const getActionTypeIcon = (type: string) => {
    const found = actionTypes.find(at => at.value === type);
    if (found) {
      const Icon = found.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Target className="w-4 h-4" />;
  };

  // Calculate progress from actions
  const campaignProgress = actions.length > 0 
    ? Math.round(actions.reduce((acc, action) => acc + (action.progress || 0), 0) / actions.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Campaign Not Found</h2>
          <p className="text-slate-300 mb-4">{error || "The campaign you're looking for doesn't exist."}</p>
          <Link
            href="/advocacy-campaigns"
            className="inline-block px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
          >
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(campaign.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="px-4 md:px-8 py-6">
        {/* Back Button */}
        <Link
          href="/advocacy-campaigns"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>

        {/* Campaign Header */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-white">{campaign.title}</h1>
                <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                  <StatusIcon className="w-3 h-3 inline mr-1" />
                  {campaign.status}
                </span>
                <span className={`text-xs font-medium ${getPriorityColor(campaign.priority)}`}>
                  {campaign.priority} Priority
                </span>
              </div>
              <p className="text-slate-400">{campaign.description}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {campaign.country || campaign.region || "Continental"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Started: {new Date(campaign.start_date).toLocaleDateString()}
                </span>
                {campaign.end_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Ends: {new Date(campaign.end_date).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  By: {campaign.creator_name}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              {!isSupported ? (
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Support Campaign
                </button>
              ) : (
                <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  You Support This
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
            <div>
              <p className="text-slate-400 text-xs">Progress</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{campaignProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${campaignProgress}%` }} />
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Coalition Members</p>
              <p className="text-2xl font-bold text-white">{coalitionMembers.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Actions</p>
              <p className="text-2xl font-bold text-white">{actions.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Supporters</p>
              <p className="text-2xl font-bold text-white">{campaign.supporter_count || supporters.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "actions" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Actions ({actions.length})
          </button>
          <button
            onClick={() => setActiveTab("coalition")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "coalition" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Coalition ({coalitionMembers.length})
          </button>
          <button
            onClick={() => setActiveTab("supporters")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "supporters" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Supporters ({supporters.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {campaign.metadata?.sdg_alignment && campaign.metadata.sdg_alignment.length > 0 && (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold mb-3">SDG Alignment</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.metadata.sdg_alignment.map((sdg, index) => (
                    <span key={index} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-300 text-sm">
                      {sdg}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold mb-3">About This Campaign</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{campaign.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Impact Metrics
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Reach</p>
                    <p className="text-2xl font-bold text-white">{campaign.reach?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Engagement</p>
                    <p className="text-2xl font-bold text-white">{campaign.engagement?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Start Date</p>
                    <p className="text-white">{new Date(campaign.start_date).toLocaleDateString()}</p>
                  </div>
                  {campaign.end_date && (
                    <div>
                      <p className="text-slate-400 text-sm">End Date</p>
                      <p className="text-white">{new Date(campaign.end_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === "actions" && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Campaign Actions</h3>
              {user && (
                <button
                  onClick={() => setShowActionModal(true)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Action
                </button>
              )}
            </div>
            {actions.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No actions planned yet</p>
            ) : (
              <div className="space-y-4">
                {actions.map((action) => {
                const isCreator = action.assigned_to === user?.id;
                const isAdmin = user?.role === "Admin";
                const canUpdateProgress = isCreator || isAdmin;
                
                return (
                  <div key={action.id} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getActionTypeIcon(action.type)}
                          <h4 className="text-white font-medium">{action.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            action.status === "Completed" ? "bg-emerald-500/20 text-emerald-400" :
                            action.status === "In Progress" ? "bg-blue-500/20 text-blue-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {action.status || "Planned"}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">{action.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                          {action.assigned_to_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Assigned: {action.assigned_to_name}
                            </span>
                          )}
                          {action.assigned_to_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Created by: {action.assigned_to_name}
                            </span>
                          )}
                          {action.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(action.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {canUpdateProgress && (
                          <button
                            onClick={() => deleteAction(action.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete action"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">Progress</span>
                          <span className="text-cyan-400 text-sm font-bold">{action.progress || 0}%</span>
                        </div>
                        <div className="w-32 bg-slate-600 rounded-full h-1.5">
                          <div 
                            className="bg-cyan-500 h-1.5 rounded-full"
                            style={{ width: `${action.progress || 0}%` }}
                          />
                        </div>
                        {canUpdateProgress && (
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={action.progress || 0}
                            onChange={(e) => updateActionProgress(action.id, parseInt(e.target.value))}
                            className="w-32 accent-cyan-500"
                          />
                        )}
                        {!canUpdateProgress && (
                          <span className="text-xs text-slate-500 mt-1">
                            Only the action creator or Admin can update progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        )}

        {/* Coalition Tab */}
        {activeTab === "coalition" && (
          <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Coalition Members</h3>
          <div className="flex gap-2">
            {user && (
              <button
                onClick={() => {
                  setShowInviteModal(true);
                  // Refresh organizations when opening the modal
                  fetchOrganizations();
                }}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                Invite Organization
              </button>
            )}
            <button
              onClick={fetchOrganizations}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
            {coalitionMembers.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No coalition members yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coalitionMembers.map((member) => (
                  <div key={member.id} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <Building2 className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{member.organization_name || "Unknown Organization"}</h4>
                          <p className="text-slate-400 text-sm">{member.organization_type || "N/A"}</p>
                          {member.country && (
                            <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {member.country}
                            </p>
                          )}
                          <p className="text-slate-500 text-xs mt-2">
                            Joined: {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {user && (
                        <button
                          onClick={() => removeCoalitionMember(member.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Remove from coalition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Supporters Tab */}
        {activeTab === "supporters" && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold mb-4">Supporters</h3>
            {supporters.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Be the first to support this campaign!</p>
            ) : (
              <div className="space-y-4">
                {supporters.map((supporter) => (
                  <div key={supporter.id} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-cyan-400 font-bold">
                          {supporter.user_name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{supporter.user_name || "Anonymous"}</p>
                            {supporter.user_email && (
                              <p className="text-slate-400 text-xs">{supporter.user_email}</p>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs">
                            {new Date(supporter.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                        {supporter.message && (
                          <p className="text-slate-300 text-sm mt-2 italic">"{supporter.message}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowSupportModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Support Campaign</h2>
                <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-white font-medium">{campaign.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{campaign.description}</p>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Why do you support this campaign? (Optional)</label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={3}
                  placeholder="Share why you're supporting this campaign..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={handleSupportCampaign}
                disabled={supporting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {supporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Handshake className="w-4 h-4" />}
                {supporting ? "Supporting..." : "Support Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowActionModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-cyan-400" />
                  Add Action
                </h2>
                <button onClick={() => setShowActionModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Action Title *</label>
                <input
                  type="text"
                  value={actionForm.title}
                  onChange={(e) => setActionForm({ ...actionForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  placeholder="e.g., Submit Petition to Parliament"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Description</label>
                <textarea
                  value={actionForm.description}
                  onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none"
                  placeholder="Describe what needs to be done..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Action Type *</label>
                  <select
                    value={actionForm.type}
                    onChange={(e) => setActionForm({ ...actionForm, type: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="">Select Type</option>
                    {actionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Target Audience</label>
                  <input
                    type="text"
                    value={actionForm.target_audience}
                    onChange={(e) => setActionForm({ ...actionForm, target_audience: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                    placeholder="e.g., Parliament, Ministry of Health"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Due Date</label>
                  <input
                    type="date"
                    value={actionForm.due_date}
                    onChange={(e) => setActionForm({ ...actionForm, due_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Assign To</label>
                  <select
                    value={actionForm.assigned_to}
                    onChange={(e) => setActionForm({ ...actionForm, assigned_to: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.full_name} ({user.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddAction}
                disabled={submittingAction}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {submittingAction ? "Adding..." : "Add Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Organization Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowInviteModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-cyan-400" />
                  Invite Organization
                </h2>
                <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Search Organization</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchOrgTerm}
                    onChange={(e) => setSearchOrgTerm(e.target.value)}
                    placeholder="Search by name or country..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  {availableOrgs.length} organizations available to invite
                </p>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Select Organization *</label>
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  size={Math.min(
                    availableOrgs
                      .filter(o => 
                        o.name.toLowerCase().includes(searchOrgTerm.toLowerCase()) ||
                        (o.country && o.country.toLowerCase().includes(searchOrgTerm.toLowerCase()))
                      )
                      .length + 1, 
                    5
                  )}
                >
                  <option value="">Select an organization</option>
                  {availableOrgs
                    .filter(o => 
                      o.name.toLowerCase().includes(searchOrgTerm.toLowerCase()) ||
                      (o.country && o.country.toLowerCase().includes(searchOrgTerm.toLowerCase()))
                    )
                    .map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.country || "No country"})
                      </option>
                    ))}
                </select>
                {availableOrgs.length === 0 && (
                  <p className="text-yellow-400 text-xs mt-1">
                    No organizations available to invite. All approved organizations are already in the coalition.
                  </p>
                )}
                {availableOrgs.length > 0 && availableOrgs.filter(o => 
                  o.name.toLowerCase().includes(searchOrgTerm.toLowerCase()) ||
                  (o.country && o.country.toLowerCase().includes(searchOrgTerm.toLowerCase()))
                ).length === 0 && searchOrgTerm && (
                  <p className="text-yellow-400 text-xs mt-1">
                    No organizations match your search. Try a different term.
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                >
                  <option value="Member">Member</option>
                  <option value="Lead">Lead</option>
                  <option value="Co-Lead">Co-Lead</option>
                  <option value="Partner">Partner</option>
                  <option value="Observer">Observer</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Invitation Message (Optional)</label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-cyan-500"
                  placeholder="Personal message to the organization..."
                />
              </div>

              <button
                onClick={handleInviteOrganization}
                disabled={submittingInvite || !selectedOrg}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submittingInvite ? "Inviting..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}