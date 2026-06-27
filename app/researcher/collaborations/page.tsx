// app/research/collaborations/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  UserPlus,
  MessageSquare,
  Mail,
  Calendar,
  MapPin,
  Building2,
  Globe,
  Send,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  Plus,
  X,
  User,
  Star,
  Heart,
  Briefcase,
  BookOpen,
  Target,
  TrendingUp,
  Sparkles,
  LogOut,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

interface Collaboration {
  id: string;
  title: string;
  description: string;
  type: "Research" | "Publication" | "Project" | "Conference" | "Workshop" | "Funding";
  status: "Active" | "Pending" | "Completed" | "Proposed";
  lead_organization: string;
  lead_researcher: string;
  lead_researcher_id: string;
  partners: string[];
  partner_count: number;
  country: string;
  region: string;
  start_date: string;
  end_date: string;
  objectives: string[];
  expected_outcomes: string[];
  funding: number;
  progress: number;
  sdg_alignment: string[];
  created_at: string;
  updated_at: string;
  is_public: boolean;
  tags: string[];
}

interface CollaborationRequest {
  id: string;
  collaboration_id: string;
  requester_id: string;
  requester_name: string;
  requester_organization: string;
  requester_email: string;
  message: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

const collaborationTypes = [
  "All Types",
  "Research",
  "Publication",
  "Project",
  "Conference",
  "Workshop",
  "Funding",
];

const statusOptions = [
  "All Status",
  "Active",
  "Pending",
  "Completed",
  "Proposed",
];

export default function ResearchCollaborationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCollaboration, setSelectedCollaboration] = useState<Collaboration | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCollaborations();
      fetchCollaborationRequests();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      console.log("🔐 Research Collaborations - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const allowedRoles = ["Researcher", "Admin", "University"];
          
          if (allowedRoles.includes(userData.role) && userData.status === "Approved") {
            setUser(userData);
            setIsAuthorized(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      // 2. Fetch active authentication token session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.log("No active session found, routing back to login page.");
        router.push("/login");
        return;
      }

      // 3. Fetch structural profile record from public.users table
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, country, organization")
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Authorization Guard Rule
      const allowedRoles = ["Researcher", "Admin", "University"];
      
      if (!allowedRoles.includes(userData.role)) {
        console.warn(`🛑 Unauthorized access attempt. User role "${userData.role}" is not authorized.`);
        router.push("/dashboard");
        return;
      }

      // 5. Approval Constraint Guard Rule
      if (userData.status !== "Approved") {
        console.log("Account is not yet marked as Approved.");
        router.push("/login?message=Account pending approval");
        return;
      }

      // 6. Cache user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthorized(true);
      
    } catch (error) {
      console.error("Critical error encountered during security verification:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("token");
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("research_collaborations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCollaborations(data || []);
    } catch (error) {
      console.error("Error fetching collaborations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("collaboration_requests")
        .select("*")
        .eq("requester_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCollaborationRequests(data || []);
    } catch (error) {
      console.error("Error fetching collaboration requests:", error);
    }
  };

  const handleRequestCollaboration = async () => {
    if (!selectedCollaboration || !user) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("collaboration_requests")
        .insert({
          collaboration_id: selectedCollaboration.id,
          requester_id: user.id,
          requester_name: user.full_name,
          requester_organization: user.organization || "Independent Researcher",
          requester_email: user.email,
          message: requestMessage || "I would like to collaborate on this project.",
          status: "Pending",
        });

      if (error) throw error;

      alert("Collaboration request sent successfully!");
      setShowRequestModal(false);
      setRequestMessage("");
      fetchCollaborationRequests();
    } catch (error) {
      console.error("Error sending collaboration request:", error);
      alert("Failed to send collaboration request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, status: "Approved" | "Rejected") => {
    try {
      const { error } = await supabase
        .from("collaboration_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;
      fetchCollaborationRequests();
      alert(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Failed to process request");
    }
  };

  const filteredCollaborations = useMemo(() => {
    let filtered = collaborations;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.lead_organization.toLowerCase().includes(term) ||
        c.country.toLowerCase().includes(term) ||
        c.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (selectedType !== "All Types") {
      filtered = filtered.filter(c => c.type === selectedType);
    }

    if (selectedStatus !== "All Status") {
      filtered = filtered.filter(c => c.status === selectedStatus);
    }

    return filtered;
  }, [collaborations, searchTerm, selectedType, selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle };
      case "Pending":
      case "Proposed":
        return { color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
      case "Completed":
        return { color: "bg-blue-500/20 text-blue-400", icon: Award };
      default:
        return { color: "bg-slate-500/20 text-slate-400", icon: Clock };
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Research": "bg-cyan-500/10 text-cyan-400",
      "Publication": "bg-purple-500/10 text-purple-400",
      "Project": "bg-blue-500/10 text-blue-400",
      "Conference": "bg-yellow-500/10 text-yellow-400",
      "Workshop": "bg-green-500/10 text-green-400",
      "Funding": "bg-emerald-500/10 text-emerald-400",
    };
    return colors[type] || "bg-slate-500/10 text-slate-400";
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading collaborations...</p>
        </div>
      </div>
    );
  }

  // If not authorized, return null
  if (!isAuthorized || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-center mb-4">
            <Link href="/researcher" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    RESEARCH COLLABORATIONS
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Research Collaborations
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Discover and connect with research partners across Africa. Find collaboration opportunities, share expertise, and advance mental health research together.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Requests</span>
                {collaborationRequests.filter(r => r.status === "Pending").length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {collaborationRequests.filter(r => r.status === "Pending").length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  fetchCollaborations();
                  fetchCollaborationRequests();
                }}
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
        {/* Search and Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search collaborations..."
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
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {collaborationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
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
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Region</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Regions</option>
                  <option value="West Africa">West Africa</option>
                  <option value="East Africa">East Africa</option>
                  <option value="Central Africa">Central Africa</option>
                  <option value="Southern Africa">Southern Africa</option>
                  <option value="North Africa">North Africa</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Collaboration Requests Panel */}
        {showRequests && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Your Collaboration Requests
              </h3>
              <button
                onClick={() => setShowRequests(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {collaborationRequests.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No collaboration requests yet</p>
            ) : (
              <div className="space-y-4">
                {collaborationRequests.map((request) => (
                  <div key={request.id} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{request.requester_name}</p>
                        <p className="text-slate-400 text-sm">{request.requester_organization}</p>
                        <p className="text-slate-300 text-sm mt-1">{request.message}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                        request.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    {request.status === "Pending" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleRespondToRequest(request.id, "Approved")}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondToRequest(request.id, "Rejected")}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collaborations Grid */}
        {filteredCollaborations.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No collaborations found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || selectedType !== "All Types" || selectedStatus !== "All Status"
                ? "Try adjusting your search or filters"
                : "Be the first to create a collaboration opportunity"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollaborations.map((collab) => {
              const statusBadge = getStatusBadge(collab.status);
              const StatusIcon = statusBadge.icon;
              return (
                <div key={collab.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(collab.type)}`}>
                        {collab.type}
                      </span>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {collab.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{collab.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{collab.description}</p>

                    <div className="space-y-2 text-sm text-slate-400">
                      <p className="flex items-center gap-2">
                        <Building2 className="w-3 h-3 text-cyan-400" />
                        {collab.lead_organization}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {collab.country}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-cyan-400" />
                        {collab.partner_count || 0} partners
                      </p>
                    </div>

                    {collab.sdg_alignment?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
                        {collab.sdg_alignment.map((sdg, index) => (
                          <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">
                            {sdg}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedCollaboration(collab);
                            setShowRequestModal(true);
                          }}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                        >
                          <UserPlus className="w-4 h-4" />
                          Join
                        </button>
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-slate-500 text-xs">
                        {new Date(collab.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredCollaborations.map((collab) => {
              const statusBadge = getStatusBadge(collab.status);
              const StatusIcon = statusBadge.icon;
              return (
                <div key={collab.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{collab.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(collab.type)}`}>
                          {collab.type}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {collab.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{collab.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {collab.lead_organization}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {collab.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {collab.partner_count || 0} partners
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCollaboration(collab);
                          setShowRequestModal(true);
                        }}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Join Collaboration
                      </button>
                      <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Collaboration Request Modal */}
      {showRequestModal && selectedCollaboration && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowRequestModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Request to Collaborate</h2>
                <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-white font-medium">{selectedCollaboration.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{selectedCollaboration.lead_organization}</p>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Message</label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                  placeholder="Why do you want to collaborate? What expertise do you bring?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={handleRequestCollaboration}
                disabled={submitting}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}