"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Trash2,
  Calendar,
  User,
  MapPin,
  FileType,
  X,
  ArrowLeft,
  RefreshCw,
  Bell,
  Clock,
  TrendingUp,
  Shield,
  HelpCircle,
  Globe,
} from "lucide-react";
import Link from "next/link";

interface ReportFormData {
  country: string;
  submitted_by: string;
  submitted_by_role: string;
  report_type: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  sdg_alignment: string[];
}

interface RecentSubmission {
  id: string;
  title: string;
  report_type: string;
  country: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  submitted_at: string;
}

const countries = [
  "Nigeria", "Kenya", "South Africa", "Ghana", "Rwanda", "Egypt", "Morocco",
  "Ethiopia", "Tanzania", "Uganda", "Senegal", "Zambia", "DR Congo", "Somalia"
];

const reportTypes = [
  "Country Progress Report",
  "Annual Reform Report",
  "Impact Assessment",
  "Policy Brief",
  "Research Paper",
  "Legislative Update",
  "Community Report",
  "Financial Report"
];

const sdgOptions = [
  "SDG 3.4 - Mental Health & Well-being",
  "SDG 3.8 - Universal Health Coverage",
  "SDG 5.2 - Violence Against Women",
  "SDG 10.2 - Social Inclusion",
  "SDG 16.1 - Reduce Violence",
  "SDG 16.3 - Rule of Law"
];

const roles = [
  "Country Coordinator",
  "Researcher",
  "CSO Representative",
  "Government Official",
  "Independent Expert"
];

export default function SubmissionsPage() {
  const [formData, setFormData] = useState<ReportFormData>({
    country: "",
    submitted_by: "",
    submitted_by_role: "",
    report_type: "",
    title: "",
    description: "",
    priority: "Medium",
    sdg_alignment: [],
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchRecentSubmissions();
  }, []);

  const fetchRecentSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const response = await fetch("/api/reports/recent");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.submissions) {
          setRecentSubmissions(data.submissions);
        } else {
          // Mock data
          setRecentSubmissions([
            { id: "1", title: "Q4 2024 Reform Progress", report_type: "Country Progress Report", country: "Kenya", status: "Under Review", submitted_at: new Date().toISOString() },
            { id: "2", title: "Mental Health Act Implementation", report_type: "Impact Assessment", country: "Nigeria", status: "Pending", submitted_at: new Date(Date.now() - 86400000).toISOString() },
            { id: "3", title: "Workforce Capacity Assessment", report_type: "Research Paper", country: "South Africa", status: "Approved", submitted_at: new Date(Date.now() - 172800000).toISOString() },
          ]);
        }
      }
    } catch (error) {
      console.error("Error fetching recent submissions:", error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSdgToggle = (sdg: string) => {
    setFormData(prev => ({
      ...prev,
      sdg_alignment: prev.sdg_alignment.includes(sdg)
        ? prev.sdg_alignment.filter(s => s !== sdg)
        : [...prev.sdg_alignment, sdg]
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || 
          droppedFile.type === "application/msword" ||
          droppedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFile(droppedFile);
      } else {
        alert("Please upload PDF or DOC/DOCX files only");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(0);

    try {
      let uploadedFileUrl = "";

      // File upload with progress simulation
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          uploadedFileUrl = uploadResult.fileUrl;
        } else {
          throw new Error("File upload failed");
        }
      }

      // Report submission
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          file_url: uploadedFileUrl,
          submitted_at: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccess(true);
        // Reset form
        setFormData({
          country: "",
          submitted_by: "",
          submitted_by_role: "",
          report_type: "",
          title: "",
          description: "",
          priority: "Medium",
          sdg_alignment: [],
        });
        setFile(null);
        setUploadProgress(0);
        fetchRecentSubmissions();
        
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        alert(data.message || "Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Submission failed. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-500/20 text-emerald-400";
      case "Under Review": return "bg-cyan-500/20 text-cyan-400";
      case "Pending": return "bg-yellow-500/20 text-yellow-400";
      case "Rejected": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    REPORT SUBMISSION PORTAL
                  </span>
                </div>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors text-xs"
                >
                  <HelpCircle className="w-3 h-3" />
                  Help
                </button>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Country Report Submission
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Submit country reports, research papers, and policy briefs for continental review and publication.
              </p>
            </div>

            <button
              onClick={fetchRecentSubmissions}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Success Notification */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-emerald-400 font-semibold">Report Submitted Successfully!</p>
              <p className="text-slate-300 text-sm">Your report has been submitted and is pending administrative review.</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="ml-auto text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Help Panel */}
        {showHelp && (
          <div className="mb-6 p-4 bg-cyan-600/10 border border-cyan-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold mb-1">Submission Guidelines</p>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• Supported file formats: PDF, DOC, DOCX (Max 25MB)</li>
                  <li>• All reports are reviewed within 5-7 business days</li>
                  <li>• You will receive email notification when your report is reviewed</li>
                  <li>• Approved reports are published in the continental repository</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Submit New Report</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select Country</option>
                      {countries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Priority Level *</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="High">High Priority 🔥</option>
                      <option value="Medium">Medium Priority ⚡</option>
                      <option value="Low">Low Priority 📄</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Report Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter a descriptive title for your report"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Submitted By *</label>
                    <input
                      type="text"
                      name="submitted_by"
                      value={formData.submitted_by}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Role *</label>
                    <select
                      name="submitted_by_role"
                      value={formData.submitted_by_role}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select Role</option>
                      {roles.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Report Type *</label>
                  <select
                    name="report_type"
                    value={formData.report_type}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Report Type</option>
                    {reportTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Provide a detailed description of your report content, methodology, and key findings..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-2 block">SDG Alignment</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sdgOptions.map(sdg => (
                      <label key={sdg} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.sdg_alignment.includes(sdg)}
                          onChange={() => handleSdgToggle(sdg)}
                          className="w-4 h-4 accent-cyan-500"
                        />
                        <span className="text-slate-300 text-sm">{sdg}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File Upload Area */}
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Attach Report File *</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      dragActive
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    {file ? (
                      <div>
                        <p className="text-cyan-400 font-medium">{file.name}</p>
                        <p className="text-slate-500 text-sm mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="mt-2 text-red-400 text-sm hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-300">Drag & drop or click to upload</p>
                        <p className="text-slate-500 text-sm mt-1">PDF, DOC, DOCX (Max 25MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {submitting && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Uploading file...</span>
                      <span className="text-cyan-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Recent Submissions Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-semibold">Recent Submissions</h3>
              </div>
              
              {loadingSubmissions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : recentSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {recentSubmissions.map((sub) => (
                    <div key={sub.id} className="p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-medium text-sm">{sub.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {sub.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileType className="w-3 h-3" />
                          {sub.report_type}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">No recent submissions</p>
              )}
            </div>

            {/* Tips Panel */}
            <div className="bg-gradient-to-br from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-semibold">Submission Tips</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5" />
                  Ensure data is accurate and up-to-date
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5" />
                  Include methodology and sources
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5" />
                  Reference relevant SDG targets
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5" />
                  Use clear section headings
                </li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
              <Bell className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Need Assistance?</p>
              <p className="text-slate-400 text-xs mt-1">Contact the support team</p>
              <button 
                onClick={() => window.location.href = "mailto:support@amhroa.org"}
                className="mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-cyan-400 text-sm transition-colors"
              >
                support@amhroa.org
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}