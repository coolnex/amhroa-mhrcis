// app/mental-health-professional/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertsWidget } from "@/components/AlertsWidget";
import { supabase } from "@/lib/supabase";
import { GovernanceAlertsWidget } from "@/components/GovernanceAlertsWidget";
import Link from "next/link";
import {
  Brain,
  Users,
  FileText,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Globe,
  Mail,
  Phone,
  MapPin,
  Settings,
  LogOut,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Award,
  Heart,
  Briefcase,
  BookOpen,
  Handshake,
  Megaphone,
  BarChart3,
  UserPlus,
  MessageCircle,
  Video,
  Newspaper,
  Shield,
  Stethoscope,
  Microscope,
  Sparkles,
  LineChart,
  PieChart,
  LayoutDashboard,
  TrendingDown,
  Minus,
} from "lucide-react";

interface WorkingGroup {
  id: string;
  name: string;
  description: string;
  role: string;
  members: number;
  status: "Active" | "Pending" | "Completed";
  progress: number;
  next_meeting: string;
  created_by: string;
  created_at: string;
}

interface AdvocacyCampaign {
  id: string;
  title: string;
  description: string;
  reach: number;
  engagement: number;
  status: "Active" | "Planning" | "Completed";
  start_date: string;
  end_date: string;
  region: string;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  lead: string;
  lead_id: string;
  collaborators: number;
  status: "Active" | "Pending" | "Completed";
  start_date: string;
  end_date: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "Conference" | "Webinar" | "Meeting" | "Workshop";
  attendees: number;
  location: string;
  meeting_link?: string;
}

export default function MentalHealthProfessionalDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "working-groups" | "advocacy" | "research" | "regions" | "events">("overview");
  
  const [workingGroups, setWorkingGroups] = useState<WorkingGroup[]>([]);
  const [advocacyCampaigns, setAdvocacyCampaigns] = useState<AdvocacyCampaign[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [countryReports, setCountryReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // First check localStorage
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log("✅ User found in localStorage:", userData);
          setUser(userData);
          setIsLoading(false);
          await fetchData(userData);
          return;
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      // Check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push("/login");
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single();

      if (profileError || !profile) {
        router.push("/login");
        return;
      }

      // Check if user has mental health professional role
      if (profile.role !== "Mental_Health_Professional" && profile.role !== "mental_health_professional") {
        router.push("/dashboard");
        return;
      }

      // Cache in localStorage
      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
      setIsLoading(false);
      await fetchData(profile);

    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    }
  };

  const fetchData = async (currentUser?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch working groups the user is part of
      const { data: memberGroups, error: wgError } = await supabase
        .from("working_group_members")
        .select(`
          working_group_id,
          role,
          working_groups:working_group_id (
            id,
            name,
            description,
            status,
            progress,
            created_by,
            created_at
          )
        `)
        .eq("user_id", currentUser?.id || user?.id);
  
      if (wgError) {
        console.error("Error fetching working groups:", wgError);
      } else if (memberGroups) {
        // Get member counts for each group
        const groupsWithCounts = await Promise.all(
          memberGroups.map(async (mg) => {
            // Get member count for this group
            const { count } = await supabase
              .from("working_group_members")
              .select("*", { count: "exact", head: true })
              .eq("working_group_id", mg.working_group_id);
            
            // Access the working_groups data correctly
            const groupData = mg.working_groups as any;
            
            return {
              id: groupData.id,
              name: groupData.name || "Unnamed Group",
              description: groupData.description || "",
              role: mg.role || "Member",
              members: count || 0,
              status: (groupData.status as "Active" | "Pending" | "Completed") || "Active",
              progress: groupData.progress || 0,
              next_meeting: "",
              created_by: groupData.created_by || "",
              created_at: groupData.created_at || new Date().toISOString(),
            };
          })
        );
        setWorkingGroups(groupsWithCounts);
      }
  
      // Fetch advocacy campaigns
      const { data: acData, error: acError } = await supabase
        .from("advocacy_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (acError) {
        console.error("Error fetching advocacy campaigns:", acError);
      } else if (acData) {
        setAdvocacyCampaigns(acData);
      }
  
      // Fetch research projects
      const { data: rpData, error: rpError } = await supabase
        .from("research_projects")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (rpError) {
        console.error("Error fetching research projects:", rpError);
      } else if (rpData) {
        setResearchProjects(rpData);
      }
  
      // Fetch events
      const { data: evData, error: evError } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });
  
      if (evError) {
        console.error("Error fetching events:", evError);
      } else if (evData) {
        setUpcomingEvents(evData);
      }
  
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    workingGroups: workingGroups.length,
    activeInitiatives: advocacyCampaigns.filter(c => c.status === "Active").length,
    countriesCovered: 12,
    researchProjects: researchProjects.filter(p => p.status === "Active").length,
    campaignReach: advocacyCampaigns.reduce((sum, c) => sum + c.reach, 0).toLocaleString(),
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Professional Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <GovernanceAlertsWidget userRole="mental_health_professional" />
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    MENTAL HEALTH PROFESSIONAL PORTAL
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Stethoscope className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">Clinical Leadership</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Mental Health Professional Command Center
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-3xl">
                Welcome, {user?.full_name || "Professional"}. Lead working groups, drive advocacy, coordinate research, and oversee regional mental health initiatives.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fetchData(user)}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Working Groups</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.workingGroups}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Active Initiatives</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.activeInitiatives}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Countries Covered</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.countriesCovered}</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Microscope className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 text-xs">Research Projects</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.researchProjects}</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <p className="text-amber-400 text-xs">Campaign Reach</p>
            </div>
            <p className="text-xl font-bold text-amber-400">{stats.campaignReach}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "overview" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("working-groups")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "working-groups" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Working Groups
          </button>
          <button
            onClick={() => setActiveTab("advocacy")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "advocacy" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Advocacy
          </button>
          <button
            onClick={() => setActiveTab("research")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "research" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Microscope className="w-4 h-4" />
            Research
          </button>
          <button
            onClick={() => setActiveTab("regions")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "regions" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Globe className="w-4 h-4" />
            Regional
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "events" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Events
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Leadership Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-2xl border border-cyan-500/30 p-4">
                <Crown className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-slate-400 text-xs">Role</p>
                <p className="text-white font-bold text-lg">Mental Health Professional</p>
                <p className="text-slate-400 text-sm">Clinical Leadership</p>
              </div>
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 p-4">
                <Users className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-slate-400 text-xs">Working Groups</p>
                <p className="text-white font-bold text-lg">{stats.workingGroups}</p>
                <p className="text-slate-400 text-sm">Active Groups</p>
              </div>
              <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-2xl border border-emerald-500/30 p-4">
                <Globe className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-slate-400 text-xs">Research</p>
                <p className="text-white font-bold text-lg">{stats.researchProjects}</p>
                <p className="text-slate-400 text-sm">Active Projects</p>
              </div>
              <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-2xl border border-amber-500/30 p-4">
                <Heart className="w-8 h-8 text-amber-400 mb-2" />
                <p className="text-slate-400 text-xs">Impact</p>
                <p className="text-white font-bold text-lg">{stats.campaignReach}</p>
                <p className="text-slate-400 text-sm">People Reached</p>
              </div>
            </div>

            {/* Working Groups Overview */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Your Working Groups
                </h3>
                <Link href="/working-groups/new" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Create Group
                </Link>
              </div>
              <div className="space-y-4">
                {workingGroups.length > 0 ? (
                  workingGroups.slice(0, 3).map((group) => (
                    <div key={group.id} className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-semibold">{group.name}</h4>
                          <p className="text-slate-400 text-sm mt-1">{group.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          group.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {group.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{group.members} members</span>
                        <span>Your Role: {group.role}</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-cyan-400">{group.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${group.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <p>You're not a member of any working groups yet.</p>
                    <Link href="/working-groups" className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block">
                      Browse Working Groups →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Working Groups Tab */}
        {activeTab === "working-groups" && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Link
                href="/working-groups/new"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Working Group
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workingGroups.length > 0 ? (
                workingGroups.map((group) => (
                  <div key={group.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">{group.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        group.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {group.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{group.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      <span>{group.members} members</span>
                      <span>Your Role: {group.role}</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-cyan-400">{group.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${group.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Created: {new Date(group.created_at).toLocaleDateString()}</span>
                      <Link href={`/working-groups/${group.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-700">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-lg">No working groups yet</p>
                  <p className="text-sm mt-1">Join or create a working group to get started</p>
                  <Link href="/working-groups" className="text-cyan-400 hover:text-cyan-300 text-sm mt-3 inline-block">
                    Browse Working Groups →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advocacy Tab */}
        {activeTab === "advocacy" && (
          <div className="space-y-6">
            <div className="flex justify-end mb-4">
              <Link
                href="/advocacy-campaigns/new"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Campaign
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {advocacyCampaigns.length > 0 ? (
                advocacyCampaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">{campaign.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        campaign.status === "Active" ? "bg-emerald-500/20 text-emerald-400" :
                        campaign.status === "Planning" ? "bg-yellow-500/20 text-yellow-400" : "bg-slate-500/20 text-slate-400"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{campaign.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <p className="text-2xl font-bold text-cyan-400">{campaign.reach.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">Reach</p>
                      </div>
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <p className="text-2xl font-bold text-purple-400">{campaign.engagement.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">Engagement</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">{campaign.region}</span>
                      <Link href={`/advocacy-campaigns/${campaign.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-700">
                  <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-lg">No advocacy campaigns</p>
                  <p className="text-sm mt-1">Create your first advocacy campaign</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Research Tab */}
        {activeTab === "research" && (
          <div className="space-y-6">
            <div className="flex justify-end mb-4">
              <Link
                href="/research-projects/new"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Research Project
              </Link>
            </div>
            <div className="space-y-3">
              {researchProjects.length > 0 ? (
                researchProjects.map((project) => (
                  <div key={project.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-cyan-500/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-semibold">{project.title}</h4>
                        <p className="text-slate-400 text-sm">Lead: {project.lead} · {project.collaborators} collaborators</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === "Active" ? "bg-emerald-500/20 text-emerald-400" :
                        project.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" : "bg-slate-500/20 text-slate-400"
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-slate-400 text-xs">
                        {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                      </span>
                      <Link href={`/research-projects/${project.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-700">
                  <Microscope className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-lg">No research projects</p>
                  <p className="text-sm mt-1">Start a new research project</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-end mb-4">
              <Link
                href="/events/new"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Schedule Event
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.type === "Conference" ? "bg-purple-500/20 text-purple-400" :
                        event.type === "Webinar" ? "bg-cyan-500/20 text-cyan-400" :
                        "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees} attendees
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    </div>
                    <Link href={`/events/${event.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                      View Details →
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-700">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-lg">No upcoming events</p>
                  <p className="text-sm mt-1">Schedule an event to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Regions Tab */}
        {activeTab === "regions" && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-cyan-400" />
                Regional Coverage
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  "West Africa", "East Africa", "Central Africa", 
                  "Southern Africa", "North Africa", "Sahel Region",
                  "Horn of Africa", "Great Lakes Region"
                ].map((region) => (
                  <div key={region} className="bg-slate-700/30 rounded-xl p-3 text-center">
                    <p className="text-white font-medium">{region}</p>
                    <p className="text-slate-400 text-xs">Active</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-cyan-400" />
                Country Reports
              </h3>
              <div className="space-y-3">
                {["Nigeria", "Kenya", "South Africa", "Ghana"].map((country) => (
                  <div key={country} className="bg-slate-700/30 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{country}</p>
                      <p className="text-slate-400 text-xs">Mental Health Report Q4 2024</p>
                    </div>
                    <Link href={`/country-reports/${country}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                      View Report →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}