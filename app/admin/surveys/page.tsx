// app/admin/surveys/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Plus,
  Edit,
  Eye,
  EyeOff,
  ArrowLeft,
  Trash2,
  Copy,
  Filter,
  Search,
  Calendar,
  Users,
  Globe,
  Lock,
  Unlock,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  LogOut,
} from "lucide-react";

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  status: "draft" | "published" | "archived";
  questions: any;
  metadata: any;
  created_at: string;
  response_count?: number;
}

export default function AdminSurveysPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔐 Admin Surveys - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.role === "Admin" && userData.status === "Approved") {
            setUser(userData);
            setIsAuthorized(true);
            await fetchSurveys();
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

      // 4. Admin Authorization Guard Rule
      if (userData.role !== "Admin") {
        console.warn(`🛑 Unauthorized access attempt. User role "${userData.role}" is not Admin.`);
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

      await fetchSurveys();
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
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get response counts
      const surveysWithCounts = await Promise.all(
        (data || []).map(async (survey) => {
          const { count, error: countError } = await supabase
            .from("survey_responses")
            .select("*", { count: "exact", head: true })
            .eq("survey_id", survey.id);

          return {
            ...survey,
            response_count: countError ? 0 : count || 0
          };
        })
      );

      setSurveys(surveysWithCounts);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!confirm("Are you sure you want to delete this survey?")) return;

    try {
      const { error } = await supabase
        .from("surveys")
        .delete()
        .eq("id", surveyId);

      if (error) throw error;
      await fetchSurveys();
    } catch (error) {
      console.error("Error deleting survey:", error);
      alert("Failed to delete survey");
    }
  };

  const handleDuplicateSurvey = async (survey: Survey) => {
    try {
      const { error } = await supabase
        .from("surveys")
        .insert({
          title: `${survey.title} (Copy)`,
          description: survey.description,
          category: survey.category,
          type: survey.type,
          questions: survey.questions,
          metadata: survey.metadata,
          status: "draft",
          created_by: user.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      await fetchSurveys();
    } catch (error) {
      console.error("Error duplicating survey:", error);
      alert("Failed to duplicate survey");
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          survey.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || survey.type === typeFilter;
    const matchesStatus = statusFilter === "all" || survey.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-500/20 text-emerald-400";
      case "draft":
        return "bg-yellow-500/20 text-yellow-400";
      case "archived":
        return "bg-slate-500/20 text-slate-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "internal":
        return "bg-purple-500/20 text-purple-400";
      case "external":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading surveys...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
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
                    ADMIN SURVEYS
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Survey Management
              </h1>
              <p className="text-slate-400 mt-1">
                Create and manage internal and external surveys
              </p>
            </div>
            <Link
              href="/admin/survey-builder"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Survey
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Types</option>
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={fetchSurveys}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-white transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Surveys List */}
        {filteredSurveys.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No surveys found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first survey by clicking 'New Survey'"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSurveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{survey.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadge(survey.type)}`}>
                        {survey.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(survey.status)}`}>
                        {survey.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2">{survey.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(survey.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {survey.response_count || 0} responses
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/data-collection/surveys/${survey.id}`}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="View/Preview"
                    >
                      <Eye className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                    </Link>
                    <Link
                      href={`/admin/survey-builder?id=${survey.id}`}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                    </Link>
                    <button
                      onClick={() => handleDuplicateSurvey(survey)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4 text-slate-400 hover:text-emerald-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteSurvey(survey.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                    <Link
                      href={`/admin/survey-results/${survey.id}`}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="View Results"
                    >
                      <BarChart3 className="w-4 h-4 text-slate-400 hover:text-purple-400" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Add missing import
