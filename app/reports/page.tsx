// app/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  FileText,
  Eye,
  Download,
  Search,
  Filter,
  Globe,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  RefreshCw,
  LogOut,
  ArrowLeft,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  country: string;
  file_url: string;
  status: string;
  score?: number;
  submitted_by: string;
  created_at: string;
  updated_at: string;
  description?: string;
  category?: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const countryParam = searchParams.get("country");
  
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>(countryParam || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [selectedCountry, statusFilter, user]);

  const checkAuth = async () => {
    try {
      console.log("🔐 Reports Page - Verifying authentication...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.status === "Approved") {
            setUser(userData);
            setLoading(false);
            await fetchReports();
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

      // 3. Fetch user profile
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, country")
        .eq("auth_user_id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Check if user is approved
      if (userData.status !== "Approved") {
        router.push("/login?message=Account pending approval");
        return;
      }

      // 5. Cache user data
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      // If no country param and user has a country, set it
      if (!countryParam && userData.country) {
        setSelectedCountry(userData.country);
      }

    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter by country
      if (selectedCountry !== "all") {
        query = query.eq("country", selectedCountry);
      }

      // Filter by status
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching reports:", error);
        setError("Failed to load reports");
        return;
      }

      setReports(data || []);

      // Extract unique countries for filter
      const uniqueCountries = [...new Set(data?.map(r => r.country).filter(Boolean))] as string[];
      setCountries(uniqueCountries);

    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("An unexpected error occurred");
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

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.country?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle };
      case "Rejected":
        return { color: "bg-red-500/20 text-red-400", icon: XCircle };
      case "Pending":
        return { color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
      case "Under Review":
        return { color: "bg-blue-500/20 text-blue-400", icon: Clock };
      default:
        return { color: "bg-slate-500/20 text-slate-400", icon: Clock };
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-slate-400";
    if (score >= 80) return "text-emerald-400";
    if (score >= 70) return "text-cyan-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const stats = {
    total: reports.length,
    approved: reports.filter(r => r.status === "Approved").length,
    pending: reports.filter(r => r.status === "Pending" || r.status === "Under Review").length,
    rejected: reports.filter(r => r.status === "Rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    REPORTS INTELLIGENCE
                  </span>
                </div>
                {selectedCountry !== "all" && (
                  <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                    <span className="text-emerald-300 text-xs font-mono tracking-wider">
                      {selectedCountry}
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Reports & Publications
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2">
                Browse and analyze continental reports and publications
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchReports}
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
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Reports</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Approved</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-xs">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-xs">Rejected</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCountry("all");
              setStatusFilter("all");
            }}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No reports found</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const statusBadge = getStatusBadge(report.status);
              const StatusIcon = statusBadge.icon;
              const isExpanded = expandedReport === report.id;

              return (
                <div
                  key={report.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {report.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {report.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                          {report.submitted_by && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {report.submitted_by}
                            </span>
                          )}
                          {report.score && (
                            <span className={`flex items-center gap-1 font-bold ${getScoreColor(report.score)}`}>
                              <TrendingUp className="w-4 h-4" />
                              Score: {report.score}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBadge.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{report.status || "Pending"}</span>
                      </div>
                    </div>

                    {report.description && (
                      <p className="text-slate-300 text-sm mt-4">{report.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-700">
                      {report.file_url && (
                        <a
                          href={report.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Report
                        </a>
                      )}

                      {report.file_url && (
                        <a
                          href={report.file_url}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      )}

                      <button
                        onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? "Show Less" : "Show More"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-700/30 rounded-lg p-3">
                            <p className="text-slate-400 text-xs">Status</p>
                            <p className="text-white font-medium">{report.status}</p>
                          </div>
                          <div className="bg-slate-700/30 rounded-lg p-3">
                            <p className="text-slate-400 text-xs">Submitted</p>
                            <p className="text-white font-medium">{new Date(report.created_at).toLocaleString()}</p>
                          </div>
                          {report.updated_at && (
                            <div className="bg-slate-700/30 rounded-lg p-3">
                              <p className="text-slate-400 text-xs">Last Updated</p>
                              <p className="text-white font-medium">{new Date(report.updated_at).toLocaleString()}</p>
                            </div>
                          )}
                          {report.category && (
                            <div className="bg-slate-700/30 rounded-lg p-3">
                              <p className="text-slate-400 text-xs">Category</p>
                              <p className="text-white font-medium">{report.category}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}