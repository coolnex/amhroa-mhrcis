// app/admin/survey-results/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  Download,
  Eye,
  PieChart,
  Activity,
  Zap,
  ArrowLeft,
  RefreshCw,
  LogOut,
} from "lucide-react";

interface SurveyWithStats {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  response_count: number;
  completion_rate: number;
  avg_time: number;
  last_response_at: string | null;
  questions: any;
  metadata: any;
}

export default function AdminSurveyResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [surveys, setSurveys] = useState<SurveyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyWithStats | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔐 Admin Survey Results - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.role === "Admin" && userData.status === "Approved") {
            setUser(userData);
            setIsAuthorized(true);
            await fetchSurveyResults();
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

      await fetchSurveyResults();
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

  const fetchSurveyResults = async () => {
    setLoading(true);
    try {
      // Fetch all surveys
      const { data: surveysData, error: surveysError } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (surveysError) throw surveysError;

      // Get response counts and stats for each survey
      const surveysWithStats = await Promise.all(
        (surveysData || []).map(async (survey) => {
          // Get response count
          const { count, error: countError } = await supabase
            .from("survey_responses")
            .select("*", { count: "exact", head: true })
            .eq("survey_id", survey.id);

          if (countError) {
            console.error(`Error counting responses for survey ${survey.id}:`, countError);
          }

          // Get last response date
          const { data: lastResponse, error: lastError } = await supabase
            .from("survey_responses")
            .select("created_at")
            .eq("survey_id", survey.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lastError && lastError.code !== "PGRST116") {
            console.error(`Error getting last response for survey ${survey.id}:`, lastError);
          }

          // Calculate completion rate
          let completionRate = 0;
          if (count && count > 0) {
            const { data: responses, error: respError } = await supabase
              .from("survey_responses")
              .select("responses")
              .eq("survey_id", survey.id);

            if (!respError && responses) {
              const totalQuestions = survey.questions?.reduce((acc: number, section: any) => 
                acc + (section.questions?.filter((q: any) => q.visible !== false).length || 0), 0) || 1;
              
              const completedResponses = responses.filter((r: any) => {
                const answered = Object.keys(r.responses || {}).filter(k => 
                  r.responses[k] !== undefined && r.responses[k] !== null && r.responses[k] !== ""
                ).length;
                return answered >= totalQuestions * 0.8;
              });
              
              completionRate = (completedResponses.length / responses.length) * 100;
            }
          }

          return {
            ...survey,
            response_count: count || 0,
            completion_rate: completionRate,
            avg_time: 0,
            last_response_at: lastResponse?.created_at || null,
          };
        })
      );

      setSurveys(surveysWithStats);
    } catch (error) {
      console.error("Error fetching survey results:", error);
    } finally {
      setLoading(false);
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
          <p className="text-slate-300">Loading survey results...</p>
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
            <Link 
              href="/admin/surveys" 
              className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Surveys
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    SURVEY RESULTS
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Survey Results Dashboard
              </h1>
              <p className="text-slate-400 mt-1">
                Track and analyze all survey responses across the platform
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchSurveyResults}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Surveys</p>
            </div>
            <p className="text-2xl font-bold text-white">{surveys.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald-400" />
              <p className="text-slate-400 text-xs">Total Responses</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {surveys.reduce((acc, s) => acc + s.response_count, 0)}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <p className="text-slate-400 text-xs">Avg. Completion Rate</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {(surveys.reduce((acc, s) => acc + s.completion_rate, 0) / (surveys.length || 1)).toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <p className="text-slate-400 text-xs">Active Surveys</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {surveys.filter(s => s.status === "published").length}
            </p>
          </div>
        </div>

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
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Surveys Grid */}
        {filteredSurveys.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No surveys found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create a survey to start collecting responses"}
            </p>
            <Link
              href="/admin/survey-builder"
              className="inline-block mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
            >
              Create Survey
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSurveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6 group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white line-clamp-1">
                        {survey.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeBadge(survey.type)}`}>
                        {survey.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(survey.status)}`}>
                        {survey.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2">{survey.description}</p>
                  </div>
                  <Link
                    href={`/admin/survey-results/${survey.id}`}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors group-hover:bg-slate-700"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-slate-500 text-xs">Responses</p>
                    <p className="text-lg font-bold text-white">{survey.response_count}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Completion</p>
                    <p className={`text-lg font-bold ${
                      survey.completion_rate > 70 ? 'text-emerald-400' :
                      survey.completion_rate > 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {survey.completion_rate.toFixed(1)}%
                    </p>
                    <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                      <div 
                        className={`h-1 rounded-full ${
                          survey.completion_rate > 70 ? 'bg-emerald-500' :
                          survey.completion_rate > 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${survey.completion_rate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Created</p>
                    <p className="text-white text-sm">
                      {new Date(survey.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Last Response</p>
                    <p className="text-white text-sm">
                      {survey.last_response_at 
                        ? new Date(survey.last_response_at).toLocaleDateString()
                        : 'No responses'}
                    </p>
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