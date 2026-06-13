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

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      // Check localStorage for JWT token
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        router.push("/login");
        return;
      }

      const userData = JSON.parse(userStr);
      
      if (userData.role !== "Admin") {
        router.push("/dashboard");
        return;
      }

      if (userData.status !== "Approved") {
        router.push("/login?message=Account pending approval");
        return;
      }

      setUser(userData);
      await fetchSubmissions();
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    }
  };

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function approveSubmission(id: string) {
    setActionLoading(id);
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

      if (error) throw error;
      
      await fetchSubmissions();
      alert("Submission approved successfully!");
    } catch (error) {
      console.error("Error approving submission:", error);
      alert("Failed to approve submission");
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectSubmission(id: string) {
    const reason = prompt("Please enter reason for rejection:");
    
    if (!reason) return;
    
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: "Rejected",
          approval_status: "Rejected",
          admin_comment: reason,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      
      await fetchSubmissions();
      alert("Submission rejected successfully!");
    } catch (error) {
      console.error("Error rejecting submission:", error);
      alert("Failed to reject submission");
    } finally {
      setActionLoading(null);
    }
  }

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

            <button
              onClick={fetchSubmissions}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
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
                      <a
                        href={submission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Report
                      </a>

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