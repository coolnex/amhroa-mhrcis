"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  ShieldAlert,
  TrendingUp,
  Activity,
  FileText,
  BrainCircuit,
  BadgeDollarSign,
  Award,
  Target,
  AlertTriangle,
  Users,
  Building2,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  ChevronRight,
  Flame,
  Zap,
  Leaf,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

// Type definitions
interface CountryData {
  id: number;
  country_name: string;
  region: string;
  reform_score: number;
  reform_tier: string;
  priority_level: string;
  sdg3_score: number;
  sdg10_score: number;
  sdg16_score: number;
  agenda2063_score: number;
  implementation_score: number;
  law_status: string;
  implementation_status: string;
  budget_level: string;
  strategy: string;
  funding_gap_level: string;
  investment_priority: string;
  estimated_investment_need: number;
  donor_readiness_score: number;
  created_at: string;
}

interface ReportData {
  id: number;
  title: string;
  country: string;
  submitted_at: string;
  status: string;
}

interface DashboardMetrics {
  totalCountries: number;
  avgReformScore: number;
  avgSDG3: number;
  highPriority: number;
  avgWorkforceScore: number;
  avgFinancingScore: number;
  totalOrganizations: number;
  activeCoordinators: number;
  reportsThisMonth: number;
  criticalFundingGap: number;
  avgDonorReadiness: number;
  totalInvestmentNeed: number;
}

interface AIInsights {
  summary: string;
  riskAlert: string;
  opportunity: string;
  recommendation: string;
}

interface DashboardTrends {
  reformProgress: number;
  sdgProgress: number;
  implementationGap: number;
}

interface DashboardData {
  success: boolean;
  metrics: DashboardMetrics;
  countries: CountryData[];
  reports: ReportData[];
  aiInsights: AIInsights;
  trends: DashboardTrends;
  message?: string;
  error?: string;
}

// Helper functions
const getPriorityConfig = (priority: string) => {
  if (!priority) return { icon: Leaf, color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/30", label: "Unknown" };
  
  const lowerPriority = priority.toLowerCase();
  if (lowerPriority.includes("high") || lowerPriority.includes("🔥")) {
    return { icon: Flame, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "High Priority" };
  }
  if (lowerPriority.includes("medium") || lowerPriority.includes("⚡")) {
    return { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", label: "Medium Priority" };
  }
  return { icon: Leaf, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", label: "Low Priority" };
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 70) return "text-cyan-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
};

const getTrendIcon = (value: number | undefined) => {
  if (!value) return null;
  if (value > 0) return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
  if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-400" />;
  return null;
};

const getLawStatusBadge = (status: string): { color: string; label: string } => {
  if (!status) return { color: "bg-slate-500/20 text-slate-400", label: "Unknown" };
  if (status.includes("✅")) return { color: "bg-emerald-500/20 text-emerald-400", label: "Modern" };
  if (status.includes("⚠️")) return { color: "bg-yellow-500/20 text-yellow-400", label: "Outdated" };
  if (status.includes("❌")) return { color: "bg-red-500/20 text-red-400", label: "None" };
  return { color: "bg-slate-500/20 text-slate-400", label: "Unknown" };
};

const getImplementationBadge = (status: string): { color: string; label: string } => {
  if (!status) return { color: "bg-slate-500/20 text-slate-400", label: "Unknown" };
  if (status.includes("🟢")) return { color: "bg-emerald-500/20 text-emerald-400", label: "Moderate" };
  if (status.includes("🟡")) return { color: "bg-yellow-500/20 text-yellow-400", label: "Weak" };
  if (status.includes("🔴")) return { color: "bg-red-500/20 text-red-400", label: "Minimal" };
  return { color: "bg-slate-500/20 text-slate-400", label: "Unknown" };
};

export default function ExecutiveDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/executive-dashboard");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: DashboardData = await response.json();
      
      if (data.success) {
        setDashboard(data);
        setLastUpdated(new Date().toLocaleString());
      } else {
        setError(data.message || "Failed to load dashboard data");
        // Set empty dashboard data
        setDashboard({
          success: false,
          metrics: {
            totalCountries: 0,
            avgReformScore: 0,
            avgSDG3: 0,
            highPriority: 0,
            avgWorkforceScore: 0,
            avgFinancingScore: 0,
            totalOrganizations: 0,
            activeCoordinators: 0,
            reportsThisMonth: 0,
            criticalFundingGap: 0,
            avgDonorReadiness: 0,
            totalInvestmentNeed: 0,
          },
          countries: [],
          reports: [],
          aiInsights: {
            summary: "No data available. Please add country data.",
            riskAlert: "Data collection is ongoing.",
            opportunity: "Start by adding mental health reforms data.",
            recommendation: "Import data to enable analytics.",
          },
          trends: {
            reformProgress: 0,
            sdgProgress: 0,
            implementationGap: 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setError("Failed to load dashboard data. Please try again.");
      setDashboard({
        success: false,
        metrics: {
          totalCountries: 0,
          avgReformScore: 0,
          avgSDG3: 0,
          highPriority: 0,
          avgWorkforceScore: 0,
          avgFinancingScore: 0,
          totalOrganizations: 0,
          activeCoordinators: 0,
          reportsThisMonth: 0,
          criticalFundingGap: 0,
          avgDonorReadiness: 0,
          totalInvestmentNeed: 0,
        },
        countries: [],
        reports: [],
        aiInsights: {
          summary: "Error loading data. Please try refreshing.",
          riskAlert: "Unable to load risk assessment.",
          opportunity: "Data unavailable.",
          recommendation: "Refresh the page or contact support.",
        },
        trends: {
          reformProgress: 0,
          sdgProgress: 0,
          implementationGap: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Safely access data with fallbacks
  const topCountries = dashboard?.countries
    ? [...dashboard.countries]
        .sort((a, b) => b.reform_score - a.reform_score)
        .slice(0, 5)
    : [];
  
  const priorityCountries = dashboard?.countries.filter(
    (country) => country.priority_level && 
      (country.priority_level.includes("High") || country.priority_level.includes("🔥"))
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Continental Intelligence...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    EXECUTIVE COMMAND CENTER
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">Live Intelligence</span>
                </div>
                {error && (
                  <div className="px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30">
                    <span className="text-red-300 text-xs">{error}</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Executive Continental Command Center
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-3xl">
                Unified Pan-African mental health reform intelligence, governance analytics,
                SDG monitoring, donor intelligence, and AI-assisted policy insights.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchDashboard}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-xs">Active Countries</p>
              <p className="text-2xl font-bold text-white">{dashboard.metrics.totalCountries}</p>
            </div>
            <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
              <p className="text-cyan-400 text-xs">Avg Reform Score</p>
              <p className="text-2xl font-bold text-cyan-400">{dashboard.metrics.avgReformScore}%</p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(dashboard.trends?.reformProgress)}
                <span className="text-emerald-400 text-xs">+{dashboard.trends?.reformProgress || 0}% YoY</span>
              </div>
            </div>
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <p className="text-green-400 text-xs">Avg SDG 3 Score</p>
              <p className="text-2xl font-bold text-green-400">{dashboard.metrics.avgSDG3}%</p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(dashboard.trends?.sdgProgress)}
                <span className="text-emerald-400 text-xs">+{dashboard.trends?.sdgProgress || 0}% YoY</span>
              </div>
            </div>
            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
              <p className="text-red-400 text-xs">High Priority States</p>
              <p className="text-2xl font-bold text-red-400">{dashboard.metrics.highPriority}</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
              <p className="text-purple-400 text-xs">Active Orgs</p>
              <p className="text-2xl font-bold text-purple-400">{dashboard.metrics.totalOrganizations}</p>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
              <p className="text-emerald-400 text-xs">Reports This Month</p>
              <p className="text-2xl font-bold text-emerald-400">{dashboard.metrics.reportsThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide">Implementation Score</p>
                <h2 className={`text-4xl font-bold mt-2 ${getScoreColor(dashboard.metrics.avgWorkforceScore)}`}>
                  {dashboard.metrics.avgWorkforceScore}%
                </h2>
              </div>
              <div className="bg-cyan-500/20 p-4 rounded-2xl">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide">Donor Readiness</p>
                <h2 className={`text-4xl font-bold mt-2 ${getScoreColor(dashboard.metrics.avgDonorReadiness)}`}>
                  {dashboard.metrics.avgDonorReadiness}%
                </h2>
              </div>
              <div className="bg-emerald-500/20 p-4 rounded-2xl">
                <BadgeDollarSign className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide">Critical Funding Gaps</p>
                <h2 className="text-4xl font-bold text-red-400 mt-2">{dashboard.metrics.criticalFundingGap}</h2>
              </div>
              <div className="bg-red-500/20 p-4 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide">Total Investment Need</p>
                <h2 className="text-4xl font-bold text-amber-400 mt-2">
                  ${(dashboard.metrics.totalInvestmentNeed / 1000000).toFixed(1)}M
                </h2>
              </div>
              <div className="bg-amber-500/20 p-4 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Countries */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Top Reforming Countries</h2>
                <p className="text-slate-400 text-sm mt-1">Highest performing mental health reform systems</p>
              </div>
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <Award className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            {topCountries.length === 0 ? (
              <div className="bg-slate-700/30 rounded-xl p-8 text-center">
                <p className="text-slate-400">No country data available</p>
                <p className="text-slate-500 text-sm mt-2">Add mental health reforms data to see rankings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCountries.map((country, index) => (
                  <div key={country.id} className="flex items-center justify-between bg-slate-700/30 p-4 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        index === 1 ? "bg-slate-400/20 text-slate-400" :
                        index === 2 ? "bg-amber-600/20 text-amber-400" :
                        "bg-slate-700 text-slate-400"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{country.country_name}</h3>
                        <p className="text-slate-400 text-xs">{country.region}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(country.reform_score)}`}>
                        {country.reform_score}%
                      </p>
                      <p className="text-slate-500 text-xs">Reform Score</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <BrainCircuit className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Insights</h2>
                <p className="text-slate-400 text-sm">Continental intelligence analysis</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h3 className="font-semibold text-red-400">Risk Alert</h3>
                </div>
                <p className="text-slate-300 text-sm">{dashboard.aiInsights?.riskAlert || "Multiple countries require urgent intervention"}</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-semibold text-cyan-400">Opportunity</h3>
                </div>
                <p className="text-slate-300 text-sm">{dashboard.aiInsights?.opportunity || "Community workforce expansion presents high-impact donor opportunities"}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-emerald-400">Recommendation</h3>
                </div>
                <p className="text-slate-300 text-sm">{dashboard.aiInsights?.recommendation || "Prioritize technical assistance for Tier 1 and Tier 2 countries"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Countries */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">High Priority Countries</h2>
              <p className="text-slate-400 text-sm mt-1">Countries requiring urgent governance and reform interventions</p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
          </div>
          {priorityCountries.length === 0 ? (
            <div className="bg-slate-700/30 rounded-xl p-8 text-center">
              <p className="text-slate-400">No high priority countries identified</p>
              <p className="text-slate-500 text-sm mt-2">All countries have adequate reform systems in place</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityCountries.slice(0, 6).map((country) => {
                const lawStatus = getLawStatusBadge(country.law_status);
                const implStatus = getImplementationBadge(country.implementation_status);
                return (
                  <div key={country.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 hover:bg-red-500/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{country.country_name}</h3>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">Urgent</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${lawStatus.color}`}>
                        Law: {lawStatus.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${implStatus.color}`}>
                        Implement: {implStatus.label}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-3">{country.region}</p>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Reform Score</span>
                      <span className={`font-medium ${getScoreColor(country.reform_score)}`}>{country.reform_score}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">SDG 3.4</span>
                      <span className="text-purple-400">{country.sdg3_score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Reports & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Reports</h2>
                <p className="text-slate-400 text-sm mt-1">Latest continental submissions</p>
              </div>
              <div className="bg-slate-700 p-3 rounded-xl">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
            </div>
            {!dashboard.reports || dashboard.reports.length === 0 ? (
              <div className="bg-slate-700/30 rounded-xl p-8 text-center">
                <p className="text-slate-400">No reports submitted yet</p>
                <p className="text-slate-500 text-sm mt-2">Reports will appear here as they are submitted</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between bg-slate-700/30 p-4 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <div>
                      <h3 className="text-white font-medium">{report.title}</h3>
                      <p className="text-slate-400 text-xs flex items-center gap-2 mt-1">
                        <Globe className="w-3 h-3" />
                        {report.country}
                        <Calendar className="w-3 h-3 ml-2" />
                        {new Date(report.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                      report.status === "Under Review" ? "bg-cyan-500/20 text-cyan-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {report.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Governance Summary</h2>
                <p className="text-slate-400 text-sm mt-1">Continental oversight snapshot</p>
              </div>
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm">Implementation Gap</span>
                  <span className="text-red-400 font-bold">{dashboard.trends?.implementationGap || 0}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min(dashboard.trends?.implementationGap || 0, 100)}%` }}></div>
                </div>
                <p className="text-slate-400 text-xs mt-2">Countries with significant implementation gaps</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-xs">SDG Alignment Rate</p>
                  <p className="text-2xl font-bold text-green-400">{dashboard.metrics.avgSDG3}%</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-xs">Implementation Score</p>
                  <p className="text-2xl font-bold text-blue-400">{dashboard.metrics.avgWorkforceScore}%</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-slate-500 text-xs text-center">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}