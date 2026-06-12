// app/impact-reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  TrendingUp,
  Download,
  Eye,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Target,
  Award,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  Heart,
  Activity,
  Globe,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface ImpactReport {
  id: string;
  title: string;
  description: string;
  report_type: string;
  country: string;
  region: string;
  period_start: string;
  period_end: string;
  metrics: {
    beneficiaries_reached: number;
    trained_professionals: number;
    policies_influenced: number;
    funding_mobilized: number;
    lives_impacted: number;
  };
  file_url: string;
  status: string;
  created_at: string;
  created_by: {
    full_name: string;
    organization: string;
  };
}

const reportTypes = [
  "Annual Impact Report",
  "Quarterly Report",
  "Project Completion Report",
  "Country Spotlight",
  "Thematic Report",
  "Donor Report",
];

export default function ImpactReportsPage() {
  const [reports, setReports] = useState<ImpactReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<ImpactReport | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    checkUser();
    fetchReports();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(profile?.role || "");
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("impact_reports")
        .select(`
          *,
          created_by:created_by (
            full_name,
            organization
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching impact reports:", error);
      // Mock data for demonstration
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || report.report_type === typeFilter;
    const matchesRegion = regionFilter === "all" || report.region === regionFilter;
    return matchesSearch && matchesType && matchesRegion;
  });

  const stats = {
    total: reports.length,
    totalBeneficiaries: reports.reduce((sum, r) => sum + (r.metrics?.beneficiaries_reached || 0), 0),
    totalProfessionals: reports.reduce((sum, r) => sum + (r.metrics?.trained_professionals || 0), 0),
    totalFunding: reports.reduce((sum, r) => sum + (r.metrics?.funding_mobilized || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading impact reports...</p>
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
                    IMPACT MEASUREMENT & REPORTING
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Impact Reports
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Comprehensive impact measurement and reporting on mental health reform initiatives across Africa.
              </p>
            </div>

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

      <div className="px-4 md:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Reports</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Beneficiaries</p>
            </div>
            <p className="text-xl font-bold text-emerald-400">{stats.totalBeneficiaries.toLocaleString()}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Professionals Trained</p>
            </div>
            <p className="text-xl font-bold text-purple-400">{stats.totalProfessionals.toLocaleString()}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <p className="text-cyan-400 text-xs">Funding Mobilized</p>
            </div>
            <p className="text-xl font-bold text-cyan-400">${(stats.totalFunding / 1000000).toFixed(1)}M</p>
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
            {reportTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
          >
            <option value="all">All Regions</option>
            <option value="East Africa">East Africa</option>
            <option value="West Africa">West Africa</option>
            <option value="Southern Africa">Southern Africa</option>
            <option value="North Africa">North Africa</option>
            <option value="Central Africa">Central Africa</option>
          </select>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all overflow-hidden cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-400">
                    {report.report_type}
                  </span>
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{report.title}</h3>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">{report.description}</p>

                <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {report.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {report.region}
                  </span>
                </div>

                {/* Impact Metrics Preview */}
                {report.metrics && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <p className="text-slate-400 text-xs">Beneficiaries</p>
                      <p className="text-cyan-400 font-bold">{report.metrics.beneficiaries_reached.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <p className="text-slate-400 text-xs">Lives Impacted</p>
                      <p className="text-emerald-400 font-bold">{report.metrics.lives_impacted.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">{report.created_by?.full_name}</p>
                      <p className="text-slate-500 text-xs">{report.created_by?.organization}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-cyan-400 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No impact reports found</p>
            <p className="text-slate-500 text-sm mt-2">Check back later for new reports</p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-400">{selectedReport.report_type}</span>
                  <h2 className="text-2xl font-bold text-white mt-2">{selectedReport.title}</h2>
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Country</p>
                  <p className="text-white">{selectedReport.country}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Region</p>
                  <p className="text-white">{selectedReport.region}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Period</p>
                  <p className="text-white">{selectedReport.period_start} - {selectedReport.period_end}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Reported By</p>
                  <p className="text-white">{selectedReport.created_by?.full_name}</p>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Description</h3>
                <p className="text-slate-300">{selectedReport.description}</p>
              </div>

              {selectedReport.metrics && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Key Impact Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Beneficiaries</p>
                      <p className="text-2xl font-bold text-cyan-400">{selectedReport.metrics.beneficiaries_reached.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Professionals Trained</p>
                      <p className="text-2xl font-bold text-purple-400">{selectedReport.metrics.trained_professionals.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Policies Influenced</p>
                      <p className="text-2xl font-bold text-emerald-400">{selectedReport.metrics.policies_influenced}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Funding Mobilized</p>
                      <p className="text-2xl font-bold text-amber-400">${(selectedReport.metrics.funding_mobilized / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="text-center col-span-2">
                      <p className="text-slate-400 text-xs">Lives Impacted</p>
                      <p className="text-2xl font-bold text-cyan-400">{selectedReport.metrics.lives_impacted.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport.file_url && (
                <a
                  href={selectedReport.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-center font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Full Report
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data
const mockReports: ImpactReport[] = [
  {
    id: "1",
    title: "Annual Impact Report 2024: Mental Health Reform Across Africa",
    description: "Comprehensive annual report highlighting achievements in mental health reform across 54 African nations.",
    report_type: "Annual Impact Report",
    country: "Continental",
    region: "All Regions",
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    metrics: {
      beneficiaries_reached: 1250000,
      trained_professionals: 8450,
      policies_influenced: 32,
      funding_mobilized: 12500000,
      lives_impacted: 2500000,
    },
    file_url: "/reports/impact-report-2024.pdf",
    status: "Published",
    created_at: "2024-12-15",
    created_by: {
      full_name: "Dr. Aisha Okonkwo",
      organization: "AMHROA Continental Secretariat",
    },
  },
];