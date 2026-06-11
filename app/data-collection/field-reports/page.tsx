// app/data-collection/field-reports/page.tsx
"use client";

import { CountrySelect } from "@/components/ui/country-select";
import { StateSelect } from "@/components/ui/state-select";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Download,
  RefreshCw,
  Plus,
  Calendar,
  Shield,
  Heart,
  Activity,
  Bell,
  Zap,
  Flame,
  Leaf,
  Send,
  X,
  Loader2,
  User,
  Upload,
} from "lucide-react";

interface FieldReport {
  id: string;
  user_id: string;
  title: string;
  incident_type: string;
  country: string;
  location: string;
  description: string;
  severity: string;
  evidence_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  reported_by: {
    name: string;
    role: string;
    organization: string;
    contact: string;
  };
}

interface ReportFormData {
  title: string;
  incident_type: string;
  severity: string;
  country: string;
  location: string;
  description: string;
  reporter_name: string;
  reporter_role: string;
  reporter_organization: string;
  reporter_contact: string;
}

const incidentTypes = [
  "Human Rights Violation",
  "Mental Health Crisis",
  "Corruption Report",
  "Gender-Based Violence",
  "Election Monitoring",
  "Healthcare Access",
  "Conflict",
  "Stigma Incident",
  "Workforce Issue",
  "Facility Closure",
  "Medication Shortage",
];

const severityLevels = [
  { value: "critical", label: "Critical", color: "red", icon: Flame },
  { value: "high", label: "High", color: "orange", icon: AlertTriangle },
  { value: "medium", label: "Medium", color: "yellow", icon: Activity },
  { value: "low", label: "Low", color: "green", icon: Leaf },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending Review", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  verified: { label: "Verified", color: "bg-blue-500/20 text-blue-400", icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-cyan-500/20 text-cyan-400", icon: Activity },
  resolved: { label: "Resolved", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400", icon: XCircle },
};

export default function FieldReportsPage() {
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<ReportFormData>({
    title: "",
    incident_type: "",
    severity: "medium",
    country: "",
    location: "",
    description: "",
    reporter_name: "",
    reporter_role: "",
    reporter_organization: "",
    reporter_contact: "",
  });

  useEffect(() => {
    checkUser();
    fetchReports();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setUser(user);
    
    // Pre-fill reporter name from user profile
    const { data: profile } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .single();
    
    if (profile?.full_name) {
      setFormData(prev => ({ ...prev, reporter_name: profile.full_name }));
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("field_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `field-reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("evidence")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    try {
      let evidenceUrl = null;
      if (evidenceFile) {
        evidenceUrl = await handleFileUpload(evidenceFile);
      }

      const reportData = {
        user_id: user.id,
        title: formData.title,
        incident_type: formData.incident_type,
        country: formData.country,
        location: formData.location,
        description: formData.description,
        severity: formData.severity,
        evidence_url: evidenceUrl,
        status: "pending",
        reported_by: {
          name: formData.reporter_name,
          role: formData.reporter_role,
          organization: formData.reporter_organization,
          contact: formData.reporter_contact,
        },
      };

      const { error } = await supabase.from("field_reports").insert(reportData);

      if (error) throw error;

      setShowForm(false);
      setFormData({
        title: "",
        incident_type: "",
        severity: "medium",
        country: "",
        location: "",
        description: "",
        reporter_name: formData.reporter_name,
        reporter_role: "",
        reporter_organization: "",
        reporter_contact: "",
      });
      setSelectedCountryCode("");
      setSelectedStateId("");
      setEvidenceFile(null);
      fetchReports();
      
      alert("Field report submitted successfully!");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCountrySelect = (code: string, name: string) => {
    setSelectedCountryCode(code);
    setFormData(prev => ({ ...prev, country: name }));
  };

  const handleStateSelect = (id: string, name: string) => {
    setSelectedStateId(id);
    setFormData(prev => ({ ...prev, location: name }));
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.country?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || report.incident_type === typeFilter;
      const matchesSeverity = severityFilter === "all" || report.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      const matchesCountry = countryFilter === "all" || report.country === countryFilter;
      return matchesSearch && matchesType && matchesSeverity && matchesStatus && matchesCountry;
    });
  }, [reports, searchTerm, typeFilter, severityFilter, statusFilter, countryFilter]);

  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.severity === "critical").length,
    pending: reports.filter(r => r.status === "pending").length,
    inProgress: reports.filter(r => r.status === "in_progress").length,
    resolved: reports.filter(r => r.status === "resolved").length,
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "text-red-400 bg-red-500/10",
      high: "text-orange-400 bg-orange-500/10",
      medium: "text-yellow-400 bg-yellow-500/10",
      low: "text-emerald-400 bg-emerald-500/10",
    };
    return colors[severity] || colors.medium;
  };

  // Get unique countries for filter
  const uniqueCountries = [...new Set(reports.map(r => r.country).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading field reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header - same as before */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    RAPID RESPONSE INTELLIGENCE
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">Live Field Reports</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Field Reports & Rapid Response
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Real-time incidents, community observations, human rights violations, and emergency alerts from across the continent.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">New Report</span>
              </button>
              <button
                onClick={fetchReports}
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Total Reports</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">Critical</p>
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-400 text-xs">In Progress</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.inProgress}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">Resolved</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Types</option>
            {incidentTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Severities</option>
            {severityLevels.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Countries</option>
            {uniqueCountries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No field reports found</p>
            <p className="text-slate-500 text-sm mt-2">Create your first field report using the "New Report" button</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => {
              const StatusIcon = statusConfig[report.status]?.icon || Clock;
              const severityInfo = severityLevels.find(s => s.value === report.severity);
              const SeverityIcon = severityInfo?.icon || AlertTriangle;
              const reportedBy = report.reported_by as any || { name: "Anonymous", role: "", organization: "" };
              
              return (
                <div
                  key={report.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${getSeverityColor(report.severity)}`}>
                          <SeverityIcon className="w-3 h-3" />
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(report.severity)}`}>
                          {report.severity?.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[report.status]?.color}`}>
                          <span className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[report.status]?.label}
                          </span>
                        </span>
                      </div>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{report.title}</h3>
                    
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>{report.country}{report.location && `, ${report.location}`}</span>
                    </div>

                    <p className="text-slate-300 text-sm mb-3 line-clamp-2">{report.description}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm">{reportedBy.name || "Anonymous"}</p>
                          <p className="text-slate-500 text-xs">{reportedBy.role || report.incident_type}</p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-cyan-400 transition-colors">
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

      {/* Submit Report Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Submit Field Report</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Report Type *</label>
                  <select
                    name="incident_type"
                    value={formData.incident_type}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                  >
                    <option value="">Select Type</option>
                    {incidentTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Severity *</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                  >
                    {severityLevels.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Report Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  placeholder="Brief descriptive title"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Country *</label>
                  <CountrySelect
                    value={selectedCountryCode}
                    onChange={handleCountrySelect}
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">State/Region</label>
                  <StateSelect
                    countryCode={selectedCountryCode}
                    value={selectedStateId}
                    onChange={handleStateSelect}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  rows={5}
                  placeholder="Detailed description of the incident, observation, or violation..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Your Name *</label>
                  <input
                    type="text"
                    name="reporter_name"
                    value={formData.reporter_name}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Your Role *</label>
                  <input
                    type="text"
                    name="reporter_role"
                    value={formData.reporter_role}
                    onChange={handleFormChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Organization</label>
                  <input
                    type="text"
                    name="reporter_organization"
                    value={formData.reporter_organization}
                    onChange={handleFormChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Contact (Email/Phone)</label>
                  <input
                    type="text"
                    name="reporter_contact"
                    value={formData.reporter_contact}
                    onChange={handleFormChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Evidence (Photo/Video/Document)</label>
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="evidence-upload"
                  />
                  <label htmlFor="evidence-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400">Click to upload evidence</p>
                    <p className="text-slate-500 text-xs mt-1">Supports images, videos, PDFs (Max 25MB)</p>
                  </label>
                  {evidenceFile && (
                    <p className="mt-2 text-cyan-400 text-sm">{evidenceFile.name}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting || uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploading ? "Uploading..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Field Report
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[selectedReport.status]?.color}`}>
                      {statusConfig[selectedReport.status]?.label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(selectedReport.severity)}`}>
                      {selectedReport.severity?.toUpperCase()} SEVERITY
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedReport.title}</h2>
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Type</p>
                  <p className="text-white text-sm">{selectedReport.incident_type}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Reported</p>
                  <p className="text-white text-sm">{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Location</p>
                  <p className="text-white text-sm">{selectedReport.country}{selectedReport.location && `, ${selectedReport.location}`}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Status</p>
                  <p className="text-white text-sm capitalize">{selectedReport.status}</p>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">Description</h3>
                <p className="text-slate-300">{selectedReport.description}</p>
              </div>

              {selectedReport.evidence_url && (
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Evidence</h3>
                  <a href={selectedReport.evidence_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                    View Evidence File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}