// app/advocacy-campaigns/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Megaphone,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Loader2,
  Users,
  Target,
  Calendar,
  Globe,
  MapPin,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Eye,
  Heart,
  Share2,
  UserPlus,
  Handshake,
  Sparkles,
  Zap,
  BarChart3,
  ChevronDown,
  Grid,
  List,
  X,
} from "lucide-react";

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
  coalition_count?: number;
  action_count?: number;
  sdg_alignment?: string[];
  is_supported?: boolean;
  supporter_count?: number;
}

const regions = [
  "All Regions",
  "Continental",
  "West Africa",
  "East Africa",
  "Southern Africa",
  "North Africa",
  "Central Africa",
  "Horn of Africa",
  "Sahel Region",
];

const statuses = [
  "All Status",
  "Active",
  "In Progress",
  "Planning",
  "Completed",
  "Archived",
];

const priorities = [
  "All Priorities",
  "Critical",
  "High",
  "Medium",
  "Low",
];

export default function AdvocacyCampaignsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedPriority, setSelectedPriority] = useState("All Priorities");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [supportMessage, setSupportMessage] = useState("");
  const [supporting, setSupporting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, selectedRegion, selectedStatus, selectedPriority]);

  const checkAuth = async () => {
    try {
      // First check localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        console.log("✅ User loaded:", userData);
        return;
      }

      // Check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("No session found");
        setLoading(false);
        return;
      }

      // Get user profile using id (not auth_user_id)
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile error:", profileError);
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
      console.log("✅ User loaded from Supabase:", profile);
    } catch (error) {
      console.error("Auth error:", error);
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = [...campaigns];

    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.region?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion !== "All Regions") {
      filtered = filtered.filter(campaign => campaign.region === selectedRegion);
    }

    if (selectedStatus !== "All Status") {
      filtered = filtered.filter(campaign => campaign.status === selectedStatus);
    }

    if (selectedPriority !== "All Priorities") {
      filtered = filtered.filter(campaign => campaign.priority === selectedPriority);
    }

    setFilteredCampaigns(filtered);
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching campaigns...");
      
      const { data: campaignsData, error } = await supabase
        .from("advocacy_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("❌ Fetch error:", error);
        throw error;
      }
  
      console.log("✅ Campaigns found:", campaignsData?.length || 0);
  
      if (!campaignsData || campaignsData.length === 0) {
        setCampaigns([]);
        setFilteredCampaigns([]);
        setLoading(false);
        return;
      }
  
      // Get creator names
      const creatorIds = campaignsData.map(c => c.created_by).filter(id => id);
      let creatorsMap: Record<string, string> = {};
      
      if (creatorIds.length > 0) {
        const { data: usersData } = await supabase
          .from("users")
          .select("id, full_name")
          .in("id", creatorIds);
        
        if (usersData) {
          creatorsMap = usersData.reduce((acc: Record<string, string>, user: { id: string; full_name: string }) => {
            acc[user.id] = user.full_name;
            return acc;
          }, {});
        }
      }
  
      // Get supporter counts
      const { data: supporterCountsData } = await supabase
        .from("advocacy_supporters")
        .select("campaign_id");
      
      const supporterCounts: Record<string, number> = {};
      (supporterCountsData || []).forEach(s => {
        supporterCounts[s.campaign_id] = (supporterCounts[s.campaign_id] || 0) + 1;
      });
  
      // Get coalition counts
      const { data: coalitionCountsData } = await supabase
        .from("advocacy_coalition_members")
        .select("campaign_id");
      
      const coalitionCounts: Record<string, number> = {};
      (coalitionCountsData || []).forEach(c => {
        coalitionCounts[c.campaign_id] = (coalitionCounts[c.campaign_id] || 0) + 1;
      });
  
      // Get action counts
      const { data: actionCountsData } = await supabase
        .from("advocacy_actions")
        .select("campaign_id");
      
      const actionCounts: Record<string, number> = {};
      (actionCountsData || []).forEach(a => {
        actionCounts[a.campaign_id] = (actionCounts[a.campaign_id] || 0) + 1;
      });
  
      // Get user's supported campaigns
      let supportedCampaigns = new Set<string>();
      if (user) {
        const { data: userSupporters } = await supabase
          .from("advocacy_supporters")
          .select("campaign_id")
          .eq("user_id", user.id);
        
        (userSupporters || []).forEach(s => {
          supportedCampaigns.add(s.campaign_id);
        });
      }
  
      // Process campaigns with all counts
      const processedCampaigns = campaignsData.map(campaign => ({
        ...campaign,
        creator_name: creatorsMap[campaign.created_by] || "Unknown",
        coalition_count: coalitionCounts[campaign.id] || 0,
        action_count: actionCounts[campaign.id] || 0,
        supporter_count: supporterCounts[campaign.id] || 0,
        is_supported: supportedCampaigns.has(campaign.id),
        sdg_alignment: campaign.metadata?.sdg_alignment || [],
      }));
  
      console.log("✅ Processed campaigns:", processedCampaigns.length);
      setCampaigns(processedCampaigns);
      setFilteredCampaigns(processedCampaigns);
    } catch (error) {
      console.error("❌ Error fetching campaigns:", error);
      setCampaigns([]);
      setFilteredCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportCampaign = async () => {
    if (!user || !selectedCampaign) return;

    setSupporting(true);
    try {
      console.log("🔍 Supporting campaign:", selectedCampaign.id);
      
      // Check if already supported
      const { data: existingSupport, error: checkError } = await supabase
        .from("advocacy_supporters")
        .select("id")
        .eq("campaign_id", selectedCampaign.id)
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

      // Add supporter
      const { data, error } = await supabase
        .from("advocacy_supporters")
        .insert({
          campaign_id: selectedCampaign.id,
          user_id: user.id,
          message: supportMessage || null,
          joined_at: new Date().toISOString(),
          status: "Active",
        })
        .select();

      if (error) {
        console.error("❌ Insert error:", error);
        alert(`Failed to support campaign: ${error.message}`);
        setSupporting(false);
        return;
      }

      console.log("✅ Support added:", data);

      // Update local state
      setCampaigns(prev => prev.map(c =>
        c.id === selectedCampaign.id
          ? { 
              ...c, 
              is_supported: true, 
              supporter_count: (c.supporter_count || 0) + 1 
            }
          : c
      ));

      setShowSupportModal(false);
      setSupportMessage("");
      setSelectedCampaign(null);
      
      alert("You are now supporting this campaign!");
    } catch (error) {
      console.error("❌ Error supporting campaign:", error);
      alert("Failed to support campaign. Please try again.");
    } finally {
      setSupporting(false);
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegion("All Regions");
    setSelectedStatus("All Status");
    setSelectedPriority("All Priorities");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading advocacy campaigns...</p>
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
                    ADVOCACY CAMPAIGNS
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Advocacy Campaigns
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Discover and support advocacy campaigns across Africa. Join movements, take action, and drive mental health reform.
              </p>
            </div>

            <div className="flex gap-2">
              {user && (
                <Link
                  href="/advocacy-campaigns/new"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Launch Campaign</span>
                </Link>
              )}
              <button
                onClick={fetchCampaigns}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Campaigns</p>
            </div>
            <p className="text-2xl font-bold text-white">{campaigns.length}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Active</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {campaigns.filter(c => c.status === "Active" || c.status === "In Progress").length}
            </p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Supported</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {campaigns.filter(c => c.is_supported).length}
            </p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 text-xs">Countries</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {new Set(campaigns.map(c => c.country).filter(Boolean)).size}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campaigns by title, country, or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <div className="flex bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "grid" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "list" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {(searchTerm || selectedRegion !== "All Regions" || selectedStatus !== "All Status" || selectedPriority !== "All Priorities") && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 text-sm transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Campaigns Grid */}
        {filteredCampaigns.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Megaphone className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No campaigns found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || selectedRegion !== "All Regions" || selectedStatus !== "All Status" || selectedPriority !== "All Priorities"
                ? "Try adjusting your search or filters"
                : "Be the first to launch a campaign"}
            </p>
            {user && (
              <Link
                href="/advocacy-campaigns/new"
                className="inline-block mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                Launch Campaign
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              const statusBadge = getStatusBadge(campaign.status);
              const StatusIcon = statusBadge.icon;
              return (
                <div key={campaign.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {campaign.status}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(campaign.priority)}`}>
                        {campaign.priority} Priority
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{campaign.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{campaign.description}</p>

                    <div className="space-y-2 text-sm text-slate-400">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {campaign.country || campaign.region || "Continental"}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-cyan-400" />
                        {campaign.coalition_count || 0} coalition members
                      </p>
                      <p className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-cyan-400" />
                        {campaign.action_count || 0} actions planned
                      </p>
                    </div>

                    {campaign.sdg_alignment && campaign.sdg_alignment.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
                        {campaign.sdg_alignment.slice(0, 2).map((sdg, index) => (
                          <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">
                            {sdg}
                          </span>
                        ))}
                        {campaign.sdg_alignment.length > 2 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                            +{campaign.sdg_alignment.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">
                          By {campaign.creator_name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {campaign.is_supported ? (
                          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Supporting
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowSupportModal(true);
                            }}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            Support
                          </button>
                        )}
                        <Link
                          href={`/advocacy-campaigns/${campaign.id}`}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => {
              const statusBadge = getStatusBadge(campaign.status);
              const StatusIcon = statusBadge.icon;
              return (
                <div key={campaign.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{campaign.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {campaign.status}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(campaign.priority)}`}>
                          {campaign.priority} Priority
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{campaign.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {campaign.country || campaign.region || "Continental"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {campaign.coalition_count || 0} coalition members
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {campaign.action_count || 0} actions
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Started: {new Date(campaign.start_date).toLocaleDateString()}
                        </span>
                      </div>
                      {campaign.sdg_alignment && campaign.sdg_alignment.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {campaign.sdg_alignment.map((sdg, index) => (
                            <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">
                              {sdg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {campaign.is_supported ? (
                          <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Supporting
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowSupportModal(true);
                            }}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Support
                          </button>
                        )}
                        <Link
                          href={`/advocacy-campaigns/${campaign.id}`}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                        By {campaign.creator_name}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Support Modal */}
      {showSupportModal && selectedCampaign && (
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
                <h3 className="text-white font-medium">{selectedCampaign.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{selectedCampaign.description}</p>
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
    </div>
  );
}