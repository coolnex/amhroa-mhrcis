// app/data-collection/field-reports/page.tsx
"use client";

import { CountrySelect } from "@/components/ui/country-select";
import { StateSelect } from "@/components/ui/state-select";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
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
  LogOut,
  Lock,
  Globe,
  Users,
  Eye as EyeIcon,
  ThumbsUp,
  MessageSquare,
  Share2,
  FileText,
  BookOpen,
  Info,
} from "lucide-react";
import Link from "next/link";

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
  visibility: string;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  shares: number;
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
  visibility: string;
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

const visibilityOptions = [
  { value: "restricted", label: "Restricted", icon: Lock, description: "Only authorized personnel can view" },
  { value: "public", label: "Public", icon: Globe, description: "Visible to all users" },
  { value: "confidential", label: "Confidential", icon: Shield, description: "Highly sensitive - limited access" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending Review", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  verified: { label: "Verified", color: "bg-blue-500/20 text-blue-400", icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-cyan-500/20 text-cyan-400", icon: Activity },
  resolved: { label: "Resolved", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400", icon: XCircle },
};

export default function FieldReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userCountry, setUserCountry] = useState<string>("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedReportTitle, setSubmittedReportTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
    visibility: "restricted",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      console.log("🔐 Field Reports - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.status === "Approved") {
            setUser(userData);
            setUserCountry(userData.country || "");
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
        .select("id, full_name, email, role, status, country, phone, organization")
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Approval Constraint Guard Rule
      if (userData.status !== "Approved") {
        console.log("Account is not yet marked as Approved.");
        router.push("/login?message=Account pending approval");
        return;
      }

      // 5. Cache user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setUserCountry(userData.country || "");
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

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Only fetch approved reports (status != 'pending')
      // And only show reports from user's country
      let query = supabase
        .from("field_reports")
        .select("*")
        .neq("status", "pending") // Exclude pending reports
        .eq("country", userCountry) // Only show reports from user's country
        .order("created_at", { ascending: false });

      const { data, error } = await query;

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
    if (!user) {
      setErrorMessage("Please log in to submit reports.");
      return;
    }
    
    setSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Please enter a report title.");
      }
      if (!formData.incident_type) {
        throw new Error("Please select a report type.");
      }
      if (!formData.description.trim()) {
        throw new Error("Please enter a description.");
      }
      if (!formData.country && !userCountry) {
        throw new Error("Please select a country.");
      }
      
      let evidenceUrl = null;
      if (evidenceFile) {
        evidenceUrl = await handleFileUpload(evidenceFile);
      }

      // Ensure user.id is a valid UUID
      if (!user.id || user.id.length !== 36) {
        throw new Error("Invalid user ID. Please log out and log in again.");
      }

      const reportData = {
        user_id: user.id,
        title: formData.title.trim(),
        incident_type: formData.incident_type,
        country: formData.country || userCountry,
        location: formData.location || "",
        description: formData.description.trim(),
        severity: formData.severity,
        evidence_url: evidenceUrl,
        status: "pending",
        visibility: formData.visibility || "restricted",
        reported_by: {
          name: formData.reporter_name || "Anonymous",
          role: formData.reporter_role || "Unknown",
          organization: formData.reporter_organization || "",
          contact: formData.reporter_contact || "",
        },
        views: 0,
        downloads: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      };

      console.log("📤 Submitting report data:", reportData);

      const { data, error } = await supabase
        .from("field_reports")
        .insert(reportData)
        .select();

      if (error) {
        console.error("❌ Supabase error:", error);
        
        if (error.code === "42501") {
          throw new Error("Permission denied. Please ensure you are logged in and have the correct permissions.");
        } else if (error.code === "23503") {
          throw new Error("Your user account could not be found. Please contact support.");
        } else {
          throw new Error(`Failed to submit report: ${error.message}`);
        }
      }

      console.log("✅ Report submitted successfully:", data);

      setSubmittedReportTitle(formData.title);
      setShowSuccessMessage(true);
      
      setFormData({
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
        visibility: "restricted",
      });
      setSelectedCountryCode("");
      setSelectedStateId("");
      setEvidenceFile(null);
      
      setTimeout(() => {
        setShowForm(false);
        setShowSuccessMessage(false);
        fetchReports();
      }, 3000);
      
    } catch (error: any) {
      console.error("❌ Error submitting report:", error);
      setErrorMessage(error.message || "Failed to submit report. Please try again.");
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

  const handleVisibilitySelect = (value: string) => {
    setFormData(prev => ({ ...prev, visibility: value }));
  };

  const handleViewReport = (report: FieldReport) => {
    setSelectedReport(report);
    incrementView(report.id);
  };

  const incrementView = async (reportId: string) => {
    try {
      const { error } = await supabase.rpc('increment_report_views', { report_id: reportId });
      if (error) throw error;
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const handleGoToRepository = () => {
    router.push("/data-collection/repository");
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
      const matchesVisibility = visibilityFilter === "all" || report.visibility === visibilityFilter;
      return matchesSearch && matchesType && matchesSeverity && matchesStatus && matchesCountry && matchesVisibility;
    });
  }, [reports, searchTerm, typeFilter, severityFilter, statusFilter, countryFilter, visibilityFilter]);

  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.severity === "critical").length,
    inProgress: reports.filter(r => r.status === "in_progress").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    public: reports.filter(r => r.visibility === "public").length,
    restricted: reports.filter(r => r.visibility === "restricted").length,
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

  const getVisibilityIcon = (visibility: string) => {
    const icons: Record<string, any> = {
      public: Globe,
      restricted: Lock,
      confidential: Shield,
    };
    return icons[visibility] || Lock;
  };

  const getVisibilityColor = (visibility: string) => {
    const colors: Record<string, string> = {
      public: "text-emerald-400 bg-emerald-500/10",
      restricted: "text-yellow-400 bg-yellow-500/10",
      confidential: "text-red-400 bg-red-500/10",
    };
    return colors[visibility] || colors.restricted;
  };

  // Get unique countries for filter
  const uniqueCountries = [...new Set(reports.map(r => r.country).filter(Boolean))];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading field reports...</p>
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
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
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
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    FIELD REPORT SUBMISSION
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">Submit Reports</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 rounded-full">
                  <Shield className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300 text-xs">Visibility Control</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 rounded-full">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-300 text-xs">Pending Approval</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Submit Field Reports
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Submit field observations, incidents, and rapid response intelligence. All reports require 
                verification before being published to the repository.
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
                onClick={handleGoToRepository}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">View Repository</span>
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
        {/* Info Banner */}
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-cyan-400 text-sm font-medium">Submission Guidelines</p>
              <p className="text-slate-300 text-sm">
                Reports submitted here require verification before they appear in the public repository. 
                You will see your submitted reports listed here once they are approved. 
                Only reports from <span className="text-cyan-400 font-medium">{userCountry}</span> are displayed.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
            <p className="text-slate-400 text-[10px]">Approved Reports</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
            <p className="text-red-400 text-[10px]">Critical</p>
            <p className="text-xl font-bold text-red-400">{stats.critical}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20">
            <p className="text-cyan-400 text-[10px]">In Progress</p>
            <p className="text-xl font-bold text-cyan-400">{stats.inProgress}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
            <p className="text-emerald-400 text-[10px]">Resolved</p>
            <p className="text-xl font-bold text-emerald-400">{stats.resolved}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
            <p className="text-emerald-400 text-[10px]">Public</p>
            <p className="text-xl font-bold text-emerald-400">{stats.public}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20">
            <p className="text-yellow-400 text-[10px]">Restricted</p>
            <p className="text-xl font-bold text-yellow-400">{stats.restricted}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search approved reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
          >
            <option value="all">All Types</option>
            {incidentTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
          >
            <option value="all">All Severities</option>
            {severityLevels.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="restricted">Restricted</option>
            <option value="confidential">Confidential</option>
          </select>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No approved reports found</p>
            <p className="text-slate-500 text-sm mt-2">
              Submit a new field report using the "New Report" button. 
              Reports will appear here once approved.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Submit New Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => {
              const StatusIcon = statusConfig[report.status]?.icon || Clock;
              const severityInfo = severityLevels.find(s => s.value === report.severity);
              const SeverityIcon = severityInfo?.icon || AlertTriangle;
              const VisibilityIcon = getVisibilityIcon(report.visibility);
              const reportedBy = report.reported_by as any || { name: "Anonymous", role: "", organization: "" };
              
              return (
                <div
                  key={report.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden"
                  onClick={() => handleViewReport(report)}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap items-center gap-2">
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
                        <span className={`text-xs px-2 py-1 rounded-full ${getVisibilityColor(report.visibility)}`}>
                          <span className="flex items-center gap-1">
                            <VisibilityIcon className="w-3 h-3" />
                            {report.visibility}
                          </span>
                        </span>
                      </div>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{report.title}</h3>
                    
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>{report.country}{report.location && `, ${report.location}`}</span>
                    </div>

                    <p className="text-slate-300 text-sm mb-3 line-clamp-2">{report.description}</p>

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-4 mb-3 text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="w-3 h-3" />
                        {report.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {report.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {report.comments || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {report.shares || 0}
                      </span>
                    </div>

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
                      <button 
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewReport(report);
                        }}
                      >
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => !showSuccessMessage && setShowForm(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Submit Field Report</h2>
                  <p className="text-slate-400 text-sm mt-1">All reports require verification before publication</p>
                </div>
                {!showSuccessMessage && (
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
                )}
              </div>
            </div>

            {showSuccessMessage ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Report Submitted!</h3>
                <p className="text-slate-300 mb-2">"{submittedReportTitle}"</p>
                <p className="text-slate-400 text-sm mb-4">
                  Your report has been submitted and is pending review. 
                  You will be notified once it's verified and published.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-yellow-300 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Reports are typically reviewed within 24-48 hours
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Error Message */}
                {errorMessage && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {errorMessage}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Report Type *</label>
                    <select
                      name="incident_type"
                      value={formData.incident_type}
                      onChange={handleFormChange}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
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
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
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
                    <p className="text-slate-500 text-xs mt-1">Default: {userCountry}</p>
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Visibility Selection */}
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Visibility *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {visibilityOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.visibility === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleVisibilitySelect(option.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                            <span className={`text-sm font-medium ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                              {option.label}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
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
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
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
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Organization</label>
                    <input
                      type="text"
                      name="reporter_organization"
                      value={formData.reporter_organization}
                      onChange={handleFormChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Contact (Email/Phone)</label>
                    <input
                      type="text"
                      name="reporter_contact"
                      value={formData.reporter_contact}
                      onChange={handleFormChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
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

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-yellow-300 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    This report will be reviewed before publication. You'll be notified once approved.
                  </p>
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
                      Submit for Review
                    </>
                  )}
                </button>
              </form>
            )}
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
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[selectedReport.status]?.color}`}>
                      {statusConfig[selectedReport.status]?.label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(selectedReport.severity)}`}>
                      {selectedReport.severity?.toUpperCase()} SEVERITY
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getVisibilityColor(selectedReport.visibility)}`}>
                      <span className="flex items-center gap-1">
                        {getVisibilityIcon(selectedReport.visibility) && 
                          <>{getVisibilityIcon(selectedReport.visibility) !== Lock && 
                            <span className="w-3 h-3">{getVisibilityIcon(selectedReport.visibility)}</span>
                          }</>
                        }
                        {selectedReport.visibility}
                      </span>
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

              {/* Engagement Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <EyeIcon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-white font-bold">{selectedReport.views || 0}</p>
                  <p className="text-slate-400 text-[10px]">Views</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <ThumbsUp className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-white font-bold">{selectedReport.likes || 0}</p>
                  <p className="text-slate-400 text-[10px]">Likes</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <MessageSquare className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-white font-bold">{selectedReport.comments || 0}</p>
                  <p className="text-slate-400 text-[10px]">Comments</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <Share2 className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-white font-bold">{selectedReport.shares || 0}</p>
                  <p className="text-slate-400 text-[10px]">Shares</p>
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