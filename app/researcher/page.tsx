// app/researcher/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertsWidget } from "@/components/AlertsWidget";
import { GovernanceAlertsWidget } from "@/components/GovernanceAlertsWidget";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  FileText,
  Users,
  Target,
  TrendingUp,
  Award,
  Globe,
  Calendar,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Heart,
  Briefcase,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  University,
  GraduationCap,
  BookMarked,
  Sparkles,
  UserPlus,
  MessageSquare,
  Share2,
  ExternalLink,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  ClipboardList,
  FolderOpen,
  Users as UsersIcon,
  Link2,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe2,
  Twitter,
  Linkedin,
  Youtube,
  LogOut,
} from "lucide-react";
import Link from "next/link";

interface University {
  id: string;
  name: string;
  country: string;
  region: string;
  type: string;
  website: string;
  research_areas: string[];
  partnerships: number;
  active_researchers: number;
  publications: number;
  funding_received: number;
  rating: number;
  status: string;
  contact_email: string;
  contact_phone: string;
  established_year: number;
  logo_url?: string;
  description?: string;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  status: "Active" | "Completed" | "Proposed" | "Under Review";
  progress: number;
  university_id: string;
  university_name?: string;
  lead_researcher: string;
  collaborators: number;
  start_date: string;
  end_date: string;
  funding: number;
  sdg_alignment: string[];
  created_at: string;
  updated_at: string;
}

interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  doi: string;
  citations: number;
  downloads: number;
  publication_date: string;
  university_id: string;
  university_name?: string;
  status: "Published" | "Under Review" | "In Progress";
  research_area: string;
  created_at: string;
}

interface ResearchActivity {
  id: string;
  title: string;
  type: "Webinar" | "Workshop" | "Conference" | "Seminar" | "Training" | "Collaboration";
  description: string;
  date: string;
  time: string;
  venue: string;
  is_virtual: boolean;
  link?: string;
  capacity: number;
  registered: number;
  university_id: string;
  university_name?: string;
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
  created_at: string;
}

interface UniversityStat {
  totalUniversities: number;
  totalResearchers: number;
  totalPublications: number;
  totalFunding: number;
  activeProjects: number;
  researchAreas: string[];
}

export default function ResearcherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<University[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [activities, setActivities] = useState<ResearchActivity[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [stats, setStats] = useState<UniversityStat>({
    totalUniversities: 0,
    totalResearchers: 0,
    totalPublications: 0,
    totalFunding: 0,
    activeProjects: 0,
    researchAreas: [],
  });
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedUniversityDetail, setSelectedUniversityDetail] = useState<University | null>(null);
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchResearcherData();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      console.log("🔐 Researcher Dashboard - Verifying security clearance...");

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
        .select("id, full_name, email, role, status, country")
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Researcher Authorization Guard Rule
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

  const fetchResearcherData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUniversities(),
        fetchProjects(),
        fetchPublications(),
        fetchActivities(),
      ]);
    } catch (error) {
      console.error("Error fetching researcher data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    const { data, error } = await supabase
      .from("universities")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      setUniversities(data);
      // Calculate stats
      const uniqueResearchAreas = new Set<string>();
      data.forEach(u => {
        u.research_areas?.forEach((area: string) => uniqueResearchAreas.add(area));
      });
      
      setStats({
        totalUniversities: data.length,
        totalResearchers: data.reduce((sum, u) => sum + (u.active_researchers || 0), 0),
        totalPublications: data.reduce((sum, u) => sum + (u.publications || 0), 0),
        totalFunding: data.reduce((sum, u) => sum + (u.funding_received || 0), 0),
        activeProjects: data.reduce((sum, u) => sum + (u.partnerships || 0), 0),
        researchAreas: Array.from(uniqueResearchAreas),
      });
    }
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("research_projects")
      .select(`
        *,
        university:university_id (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const projectsWithNames = data.map((p: any) => ({
        ...p,
        university_name: p.university?.name,
      }));
      setProjects(projectsWithNames);
    }
  };

  const fetchPublications = async () => {
    const { data, error } = await supabase
      .from("publications")
      .select(`
        *,
        university:university_id (
          name
        )
      `)
      .order("publication_date", { ascending: false });

    if (!error && data) {
      const publicationsWithNames = data.map((p: any) => ({
        ...p,
        university_name: p.university?.name,
      }));
      setPublications(publicationsWithNames);
    }
  };

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("research_activities")
      .select(`
        *,
        university:university_id (
          name
        )
      `)
      .order("date", { ascending: true });

    if (!error && data) {
      const activitiesWithNames = data.map((a: any) => ({
        ...a,
        university_name: a.university?.name,
      }));
      setActivities(activitiesWithNames);
    }
  };

  const filteredUniversities = useMemo(() => {
    let filtered = universities;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.country?.toLowerCase().includes(term) ||
        u.research_areas?.some(area => area.toLowerCase().includes(term))
      );
    }
    
    if (selectedUniversity !== "all") {
      filtered = filtered.filter(u => u.id === selectedUniversity);
    }
    
    return filtered;
  }, [universities, searchTerm, selectedUniversity]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
      case "Published":
      case "Completed":
        return { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle };
      case "Proposed":
      case "Under Review":
      case "In Progress":
        return { color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
      case "Cancelled":
        return { color: "bg-red-500/20 text-red-400", icon: AlertCircle };
      default:
        return { color: "bg-slate-500/20 text-slate-400", icon: Clock };
    }
  };

  const handleViewProject = (project: ResearchProject) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleViewUniversity = (university: University) => {
    setSelectedUniversityDetail(university);
    setShowUniversityModal(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading Research Intelligence...</p>
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
      <GovernanceAlertsWidget userRole="researcher" />
      
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    RESEARCH INTELLIGENCE
                  </span>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                  <span className="text-emerald-300 text-xs font-mono tracking-wider">
                    UNIVERSITIES NETWORK
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Research Intelligence Hub
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Welcome back, {user?.full_name}. Explore university research, discover collaborations, and track research impact across Africa.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/researcher/create-project"
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">New Project</span>
              </Link>
              <Link
                href="/researcher/add-university"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors"
              >
                <University className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Add University</span>
              </Link>
              <button
                onClick={fetchResearcherData}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Alerts Widget */}
        <div className="mb-6">
          <AlertsWidget 
            userRole={user?.role}
            userCountry={user?.country}
            userId={user?.id}
            limit={3}
            showViewAll={true}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <University className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Universities</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalUniversities}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Researchers</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.totalResearchers.toLocaleString()}</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 text-xs">Publications</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.totalPublications.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Funding</p>
            </div>
            <p className="text-xl font-bold text-emerald-400">${(stats.totalFunding / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-amber-400" />
              <p className="text-amber-400 text-xs">Active Projects</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">{stats.activeProjects}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <BookMarked className="w-4 h-4 text-cyan-400" />
              <p className="text-cyan-400 text-xs">Research Areas</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{stats.researchAreas.length}</p>
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
                  placeholder="Search universities, research areas, countries..."
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
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "list" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                List
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Research Area</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Areas</option>
                  {stats.researchAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Country</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Countries</option>
                  {[...new Set(universities.map(u => u.country))].filter(Boolean).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">University Type</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Types</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Research">Research Intensive</option>
                  <option value="Comprehensive">Comprehensive</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Universities Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((university) => (
              <div
                key={university.id}
                className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden group cursor-pointer"
                onClick={() => handleViewUniversity(university)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        {university.logo_url ? (
                          <img src={university.logo_url} alt={university.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <University className="w-6 h-6 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{university.name}</h3>
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {university.country}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      university.status === "Active" ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-slate-500/20 text-slate-400"
                    }`}>
                      {university.status || "Active"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {university.research_areas?.slice(0, 3).map((area, index) => (
                      <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-300">
                        {area}
                      </span>
                    ))}
                    {(university.research_areas?.length || 0) > 3 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                        +{(university.research_areas?.length || 0) - 3}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-700/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Researchers</p>
                      <p className="text-white font-bold">{university.active_researchers || 0}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Publications</p>
                      <p className="text-white font-bold">{university.publications || 0}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Rating</p>
                      <p className="text-yellow-400 font-bold">{university.rating || 0}★</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                    <div className="flex gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {university.type || "University"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {university.established_year || "N/A"}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewUniversity(university);
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-xs transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredUniversities.map((university) => (
              <div
                key={university.id}
                className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6 cursor-pointer"
                onClick={() => handleViewUniversity(university)}
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        {university.logo_url ? (
                          <img src={university.logo_url} alt={university.name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <University className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{university.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {university.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {university.active_researchers || 0} researchers
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {university.research_areas?.slice(0, 4).map((area, index) => (
                        <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-300">
                          {area}
                        </span>
                      ))}
                      {(university.research_areas?.length || 0) > 4 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
                          +{(university.research_areas?.length || 0) - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Publications</p>
                      <p className="text-white font-bold">{university.publications || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Funding</p>
                      <p className="text-emerald-400 font-bold">${((university.funding_received || 0) / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Rating</p>
                      <p className="text-yellow-400 font-bold">{university.rating || 0}★</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewUniversity(university);
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Activities Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Upcoming Research Activities
            </h2>
            <Link href="/researcher/activities" className="text-cyan-400 hover:text-cyan-300 text-sm">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activities.filter(a => a.status === "Upcoming").slice(0, 4).map((activity) => (
              <div key={activity.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-cyan-500/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activity.type === "Webinar" ? "bg-purple-500/20 text-purple-400" :
                    activity.type === "Workshop" ? "bg-yellow-500/20 text-yellow-400" :
                    activity.type === "Conference" ? "bg-blue-500/20 text-blue-400" :
                    "bg-cyan-500/20 text-cyan-400"
                  }`}>
                    {activity.type}
                  </span>
                  <span className="text-slate-500 text-xs">{new Date(activity.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-white font-medium">{activity.title}</h4>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{activity.description}</p>
                <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
                  <span>{activity.university_name || "University"}</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {activity.registered || 0}/{activity.capacity || 0}
                  </span>
                </div>
                {activity.is_virtual && activity.link && (
                  <a
                    href={activity.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
                  >
                    Join Event <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
            {activities.filter(a => a.status === "Upcoming").length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>No upcoming activities</p>
                <p className="text-sm mt-1">Check back later for events and opportunities</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Publications Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Recent Publications
            </h2>
            <Link href="/researcher/publications" className="text-cyan-400 hover:text-cyan-300 text-sm">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publications.slice(0, 4).map((pub) => (
              <div key={pub.id} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-cyan-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-medium">{pub.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    pub.status === "Published" ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {pub.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-1">{pub.authors?.join(", ") || "Unknown"}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {pub.journal || "Journal"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {pub.citations || 0} citations
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {pub.downloads || 0} downloads
                  </span>
                </div>
                {pub.doi && (
                  <a
                    href={`https://doi.org/${pub.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
                  >
                    DOI: {pub.doi} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
            {publications.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>No publications yet</p>
                <p className="text-sm mt-1">Publish your research to share with the community</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Link href="/researcher/collaborations" className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all group">
            <UsersIcon className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold">Collaborations</h3>
            <p className="text-slate-400 text-sm mt-1">Find research partners</p>
          </Link>
          <Link href="/research-sponsorships" className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all group">
            <DollarSign className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold">Funding</h3>
            <p className="text-slate-400 text-sm mt-1">Discover opportunities</p>
          </Link>
          <Link href="/researcher/mentorship" className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all group">
            <GraduationCap className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold">Mentorship</h3>
            <p className="text-slate-400 text-sm mt-1">Connect with mentors</p>
          </Link>
          <Link href="/researcher/impact" className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all group">
            <BarChart3 className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold">Research Impact</h3>
            <p className="text-slate-400 text-sm mt-1">Track your impact</p>
          </Link>
        </div>
      </div>

      {/* University Detail Modal */}
      {showUniversityModal && selectedUniversityDetail && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowUniversityModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUniversityDetail.name}</h2>
                  <p className="text-slate-400 text-sm">{selectedUniversityDetail.country} · {selectedUniversityDetail.type || "University"}</p>
                </div>
                <button onClick={() => setShowUniversityModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* University Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs">Researchers</p>
                  <p className="text-2xl font-bold text-white">{selectedUniversityDetail.active_researchers || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs">Publications</p>
                  <p className="text-2xl font-bold text-white">{selectedUniversityDetail.publications || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs">Funding</p>
                  <p className="text-2xl font-bold text-emerald-400">${((selectedUniversityDetail.funding_received || 0) / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs">Rating</p>
                  <p className="text-2xl font-bold text-yellow-400">{selectedUniversityDetail.rating || 0}★</p>
                </div>
              </div>

              {/* Research Areas */}
              {selectedUniversityDetail.research_areas?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Research Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUniversityDetail.research_areas.map((area, index) => (
                      <span key={index} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <h4 className="text-slate-400 text-sm mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    {selectedUniversityDetail.contact_email && (
                      <p className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        {selectedUniversityDetail.contact_email}
                      </p>
                    )}
                    {selectedUniversityDetail.contact_phone && (
                      <p className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 text-cyan-400" />
                        {selectedUniversityDetail.contact_phone}
                      </p>
                    )}
                    {selectedUniversityDetail.website && (
                      <a
                        href={selectedUniversityDetail.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                      >
                        <Globe2 className="w-4 h-4" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <h4 className="text-slate-400 text-sm mb-2">Established</h4>
                  <p className="text-white text-sm">{selectedUniversityDetail.established_year || "N/A"}</p>
                  <h4 className="text-slate-400 text-sm mt-3 mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedUniversityDetail.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                  }`}>
                    {selectedUniversityDetail.status || "Active"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Action to collaborate with university
                  alert(`Collaboration request sent to ${selectedUniversityDetail.name}`);
                }}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Request Collaboration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}