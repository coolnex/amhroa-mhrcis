// app/admin/submissions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Search,
  Filter,
  Globe,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react";

interface Submission {
  id: string;
  title: string;
  country: string;
  file_url: string;
  approval_status: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
  submitted_by?: string;
  description?: string;
}

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      console.log("🔐 Admin Submissions - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.role === "Admin" && userData.status === "Approved") {
            setUser(userData);
            await fetchSubmissions();
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
        .select("id, full_name, email, role, status")
        .eq("auth_user_id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Admin Authorization Guard Rule
      if (userData.role !== "Admin") {
        console.warn(`🛑 Unauthorized access attempt. User role "${userData.role}" is not an Admin.`);
        router.push("/dashboard");
        return;
      }

      // 5. Approval Constraint Guard Rule
      if (userData.status !== "Approved") {
        console.log("Admin account is not yet marked as Approved.");
        router.push("/login?message=Account pending approval");
        return;
      }

      // 6. Cache user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      await fetchSubmissions();

    } catch (error) {
      console.error("Critical error encountered during admin security verification:", error);
      setError("Failed to authenticate. Please try again.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching submissions:", error);
        setError("Failed to load submissions");
        return;
      }
      
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const approveSubmission = async (id: string) => {
    setActionLoading(id);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: "Approved",
          approval_status: "Approved",
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error approving submission:", error);
        setError("Failed to approve submission");
        return;
      }
      
      await fetchSubmissions();
      alert("Submission approved successfully!");
    } catch (error) {
      console.error("Error approving submission:", error);
      setError("Failed to approve submission");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectSubmission = async (id: string) => {
    const reason = prompt("Please enter reason for rejection:");
    
    if (reason === null) return; // User cancelled
    if (!reason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    
    setActionLoading(id);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: "Rejected",
          approval_status: "Rejected",
          review_notes: reason,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error rejecting submission:", error);
        setError("Failed to reject submission");
        return;
      }
      
      await fetchSubmissions();
      alert("Submission rejected successfully!");
    } catch (error) {
      console.error("Error rejecting submission:", error);
      setError("Failed to reject submission");
    } finally {
      setActionLoading(null);
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

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesCountry = countryFilter === "all" || sub.country === countryFilter;
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "Pending").length,
    approved: submissions.filter(s => s.status === "Approved").length,
    rejected: submissions.filter(s => s.status === "Rejected").length,
  };

  const uniqueCountries = [...new Set(submissions.map(s => s.country).filter(Boolean))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle };
      case "Rejected":
        return { color: "bg-red-500/20 text-red-400", icon: XCircle };
      default:
        return { color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading submissions...</p>
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
                    REPORT APPROVAL CENTER
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Report Approvals
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2">
                Review and approve continental report submissions
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchSubmissions}
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
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-xs">Pending Review</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Approved</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
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
                placeholder="Search by title or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No submissions found</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => {
              const statusBadge = getStatusBadge(submission.status);
              const StatusIcon = statusBadge.icon;
              
              return (
                <div
                  key={submission.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {submission.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {submission.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(submission.created_at).toLocaleDateString()}
                          </span>
                          {submission.submitted_by && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {submission.submitted_by}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBadge.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{submission.status || "Pending"}</span>
                      </div>
                    </div>

                    {submission.description && (
                      <p className="text-slate-300 text-sm mb-4">{submission.description}</p>
                    )}

                    {submission.review_notes && (
                      <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                        <p className="text-slate-400 text-xs mb-1">Review Notes</p>
                        <p className="text-slate-300 text-sm">{submission.review_notes}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
                      {submission.file_url && (
                        <a
                          href={submission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Report
                        </a>
                      )}

                      {submission.status === "Pending" && (
                        <>
                          <button
                            onClick={() => approveSubmission(submission.id)}
                            disabled={actionLoading === submission.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white transition-colors disabled:opacity-50"
                          >
                            {actionLoading === submission.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </button>

                          <button
                            onClick={() => rejectSubmission(submission.id)}
                            disabled={actionLoading === submission.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
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