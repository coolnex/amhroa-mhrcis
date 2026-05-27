"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  TrendingUp,
  User,
  MapPin,
  Calendar,
  FileCheck,
  Printer,
  Send,
  MessageSquare,
  Star,
  Flag,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Upload,
  Shield,
  Award,
  BarChart3,
} from "lucide-react";

interface Report {
  id: number;
  title: string;
  country: string;
  report_type: string;
  submitted_by: string;
  submitted_by_role: string;
  description: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Published";
  priority: "High" | "Medium" | "Low";
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  attachment_url?: string;
  sdg_alignment?: string[];
  reform_score?: number;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [expandedReports, setExpandedReports] = useState<number[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reports");
      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
      } else {
        // Mock data for demonstration
        setReports(mockReports);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.submitted_by.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((r) => r.report_type === typeFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((r) => r.priority === priorityFilter);
    }

    setFilteredReports(filtered);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewed_by: "Continental Administrator",
          admin_notes: adminNotes || `${status} by administrator`,
          reviewed_at: new Date().toISOString(),
        }),
      });
      fetchReports();
      setAdminNotes("");
      setSelectedReport(null);
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedReports((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "Under Review": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
      Published: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colors[status as keyof typeof colors] || colors.Pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      High: "text-red-400 bg-red-500/10",
      Medium: "text-yellow-400 bg-yellow-500/10",
      Low: "text-green-400 bg-green-500/10",
    };
    return colors[priority as keyof typeof colors] || colors.Medium;
  };

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "Pending").length,
    underReview: reports.filter((r) => r.status === "Under Review").length,
    approved: reports.filter((r) => r.status === "Approved").length,
    published: reports.filter((r) => r.status === "Published").length,
    rejected: reports.filter((r) => r.status === "Rejected").length,
    highPriority: reports.filter((r) => r.priority === "High").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading intelligence reports...</p>
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
                    INTELLIGENCE VALIDATION CENTER
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-xs">Live Governance</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Reports Review Center
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Continental governance approval and intelligence validation system for all submitted reports.
              </p>
            </div>

            <button
              onClick={fetchReports}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Total Reports</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <p className="text-blue-400 text-xs">Under Review</p>
            <p className="text-2xl font-bold text-blue-400">{stats.underReview}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">Approved</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-purple-400 text-xs">Published</p>
            <p className="text-2xl font-bold text-purple-400">{stats.published}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
            <p className="text-orange-400 text-xs">High Priority</p>
            <p className="text-2xl font-bold text-orange-400">{stats.highPriority}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports by title, country, or submitter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Published">Published</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Types</option>
            <option value="Country Report">Country Report</option>
            <option value="Progress Report">Progress Report</option>
            <option value="Impact Assessment">Impact Assessment</option>
            <option value="Policy Brief">Policy Brief</option>
            <option value="Research Paper">Research Paper</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No reports found</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isExpanded = expandedReports.includes(report.id);
              const statusColor = getStatusColor(report.status);

              return (
                <div
                  key={report.id}
                  className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all"
                >
                  {/* Report Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-slate-700/30 transition-colors"
                    onClick={() => toggleExpand(report.id)}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h2 className="text-xl font-bold text-white">{report.title}</h2>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                            {report.priority} Priority
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${statusColor}`}>
                            {report.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-4 h-4" />
                            {report.country}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <FileText className="w-4 h-4" />
                            {report.report_type}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <User className="w-4 h-4" />
                            {report.submitted_by} ({report.submitted_by_role})
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(report.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.reform_score && (
                          <div className="text-right">
                            <p className="text-slate-400 text-xs">Reform Score</p>
                            <p className="text-cyan-400 font-bold text-lg">{report.reform_score}</p>
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-700 p-6 bg-slate-800/30">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Report Details */}
                        <div className="lg:col-span-2 space-y-4">
                          <div>
                            <h3 className="text-white font-semibold mb-2">Description</h3>
                            <p className="text-slate-300">{report.description}</p>
                          </div>

                          {report.sdg_alignment && report.sdg_alignment.length > 0 && (
                            <div>
                              <h3 className="text-white font-semibold mb-2">SDG Alignment</h3>
                              <div className="flex flex-wrap gap-2">
                                {report.sdg_alignment.map((sdg) => (
                                  <span key={sdg} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs">
                                    {sdg}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {report.admin_notes && (
                            <div>
                              <h3 className="text-white font-semibold mb-2">Previous Review Notes</h3>
                              <div className="bg-slate-700/30 rounded-lg p-3">
                                <p className="text-slate-300 text-sm">{report.admin_notes}</p>
                                {report.reviewed_by && (
                                  <p className="text-slate-500 text-xs mt-2">
                                    Reviewed by: {report.reviewed_by} on {report.reviewed_at && new Date(report.reviewed_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Actions */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-white font-semibold mb-2">Admin Notes</h3>
                            <textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add review notes, feedback, or justification..."
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 text-sm"
                              rows={3}
                            />
                          </div>

                          <div>
                            <h3 className="text-white font-semibold mb-2">Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => updateStatus(report.id, "Under Review")}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 transition-colors text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                Start Review
                              </button>
                              <button
                                onClick={() => updateStatus(report.id, "Approved")}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg text-emerald-400 transition-colors text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(report.id, "Published")}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-purple-400 transition-colors text-sm"
                              >
                                <FileCheck className="w-4 h-4" />
                                Publish
                              </button>
                              <button
                                onClick={() => updateStatus(report.id, "Rejected")}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400 transition-colors text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {report.attachment_url && (
                              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors text-sm">
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            )}
                            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors text-sm">
                              <MessageSquare className="w-4 h-4" />
                              Contact Submitter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-400 text-sm">Governance Intelligence Summary</span>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-slate-500 text-xs">Approval Rate</p>
                <p className="text-white font-bold">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-xs">Avg Response Time</p>
                <p className="text-white font-bold">2.4 days</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-xs">This Month</p>
                <p className="text-white font-bold">{reports.filter(r => new Date(r.submitted_at).getMonth() === new Date().getMonth()).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data for demonstration
const mockReports: Report[] = [
  {
    id: 1,
    title: "Mental Health Reform Progress Report - Q4 2024",
    country: "Kenya",
    report_type: "Progress Report",
    submitted_by: "Dr. Sarah Wanjiku",
    submitted_by_role: "Country Coordinator",
    description: "Comprehensive progress report on mental health reform implementation across 47 counties. Highlights include increased budget allocation, community health worker training completion, and new facility openings.",
    status: "Pending",
    priority: "High",
    submitted_at: "2024-03-10T10:30:00",
    sdg_alignment: ["SDG 3.4", "SDG 10.2"],
    reform_score: 74,
  },
  {
    id: 2,
    title: "Legislative Impact Assessment: Mental Health Act 2024",
    country: "Nigeria",
    report_type: "Impact Assessment",
    submitted_by: "Prof. Adebayo Ogunlesi",
    submitted_by_role: "Researcher",
    description: "Assessment of the newly passed Mental Health Act's potential impact on service delivery, funding mechanisms, and patient rights protection across federal and state levels.",
    status: "Under Review",
    priority: "High",
    submitted_at: "2024-03-08T14:15:00",
    sdg_alignment: ["SDG 3.4", "SDG 16.3"],
    reform_score: 62,
  },
  {
    id: 3,
    title: "Community-Based Mental Health Services Framework",
    country: "Rwanda",
    report_type: "Policy Brief",
    submitted_by: "Mariya Umuhoza",
    submitted_by_role: "CSO Director",
    description: "Proposed framework for scaling community-based mental health services, including training protocols, supervision structures, and integration with existing primary healthcare systems.",
    status: "Pending",
    priority: "Medium",
    submitted_at: "2024-03-12T09:00:00",
    sdg_alignment: ["SDG 3.4", "SDG 3.8", "SDG 11.1"],
    reform_score: 77,
  },
  {
    id: 4,
    title: "Workforce Capacity Assessment Report",
    country: "South Africa",
    report_type: "Country Report",
    submitted_by: "Dr. Thabo Nkosi",
    submitted_by_role: "Researcher",
    description: "Comprehensive assessment of mental health workforce across provinces, identifying gaps in psychiatrist-to-population ratios and recommending training expansion strategies.",
    status: "Approved",
    priority: "Medium",
    submitted_at: "2024-03-05T11:45:00",
    sdg_alignment: ["SDG 3.4", "SDG 8.5"],
    reform_score: 81,
  },
  {
    id: 5,
    title: "Funding Gap Analysis for Mental Health Services",
    country: "Uganda",
    report_type: "Impact Assessment",
    submitted_by: "Grace Achieng",
    submitted_by_role: "Donor Coordinator",
    description: "Analysis of current funding levels versus required investment for full implementation of the national mental health strategy, including donor mapping and recommendations.",
    status: "Rejected",
    priority: "High",
    submitted_at: "2024-03-01T13:20:00",
    sdg_alignment: ["SDG 3.4", "SDG 17.1"],
    reform_score: 68,
    admin_notes: "Insufficient data methodology. Please provide more detailed breakdown of funding sources and methodology for gap calculation.",
    reviewed_by: "Continental Administrator",
    reviewed_at: "2024-03-07T10:00:00",
  },
];