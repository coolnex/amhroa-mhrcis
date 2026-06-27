// app/research/impact/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Users,
  FileText,
  DollarSign,
  Globe,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Sparkles,
  Target,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Download,
  Eye,
  Heart,
  Share2,
  BookOpen,
  GraduationCap,
  Building2,
  MapPin,
  Mail,
  Linkedin,
  Twitter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ImpactMetric {
  id: string;
  metric_type: "Citation" | "Download" | "View" | "Collaboration" | "Mentorship" | "Publication";
  count: number;
  percentage_change: number;
  description: string;
  icon: string;
}

interface ResearchImpact {
  total_publications: number;
  total_citations: number;
  total_downloads: number;
  total_views: number;
  collaborations: number;
  mentees: number;
  funding_received: number;
  sdg_contributions: string[];
  top_publications: {
    title: string;
    citations: number;
    downloads: number;
  }[];
  impact_by_year: {
    year: number;
    publications: number;
    citations: number;
  }[];
  metrics: ImpactMetric[];
  research_areas: {
    area: string;
    count: number;
  }[];
  recent_activity: {
    type: string;
    description: string;
    date: string;
  }[];
}

export default function ResearchImpactPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [impact, setImpact] = useState<ResearchImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"year" | "month" | "all">("year");
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");

  useEffect(() => {
    checkAuth();
    fetchImpactData();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (userData.role !== "Researcher" && userData.role !== "Admin" && userData.role !== "University") {
        router.push("/dashboard");
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  };

  const fetchImpactData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - replace with actual API calls
      const mockImpact: ResearchImpact = {
        total_publications: 24,
        total_citations: 342,
        total_downloads: 1256,
        total_views: 3456,
        collaborations: 12,
        mentees: 8,
        funding_received: 450000,
        sdg_contributions: ["SDG 3", "SDG 10", "SDG 16"],
        top_publications: [
          { title: "Mental Health Workforce Study in East Africa", citations: 28, downloads: 156 },
          { title: "Community Mental Health Interventions", citations: 15, downloads: 98 },
          { title: "Policy Implementation Gaps in West Africa", citations: 8, downloads: 67 },
        ],
        impact_by_year: [
          { year: 2024, publications: 8, citations: 45 },
          { year: 2023, publications: 6, citations: 32 },
          { year: 2022, publications: 4, citations: 18 },
        ],
        metrics: [
          { id: "1", metric_type: "Citation", count: 342, percentage_change: 12, description: "Total citations across all publications", icon: "Award" },
          { id: "2", metric_type: "Download", count: 1256, percentage_change: 8, description: "Total downloads of your research", icon: "Download" },
          { id: "3", metric_type: "View", count: 3456, percentage_change: 15, description: "Total views of your research", icon: "Eye" },
          { id: "4", metric_type: "Collaboration", count: 12, percentage_change: 5, description: "Research collaborations", icon: "Users" },
          { id: "5", metric_type: "Mentorship", count: 8, percentage_change: 10, description: "Mentees you've guided", icon: "GraduationCap" },
        ],
        research_areas: [
          { area: "Mental Health Research", count: 8 },
          { area: "Policy Analysis", count: 5 },
          { area: "Community Research", count: 4 },
          { area: "Clinical Trials", count: 3 },
          { area: "Implementation Science", count: 2 },
        ],
        recent_activity: [
          { type: "Publication", description: "New paper published in Journal of Mental Health", date: "2024-03-15" },
          { type: "Citation", description: "Your research was cited by WHO report", date: "2024-03-10" },
          { type: "Collaboration", description: "New collaboration with University of Nairobi", date: "2024-03-05" },
        ],
      };

      setImpact(mockImpact);
    } catch (error) {
      console.error("Error fetching impact data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Award: Award,
      Download: Download,
      Eye: Eye,
      Users: Users,
      GraduationCap: GraduationCap,
    };
    const Icon = icons[iconName] || TrendingUp;
    return <Icon className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading research impact data...</p>
        </div>
      </div>
    );
  }

  if (!impact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg">No impact data available</p>
          <Link href="/researcher" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <Link href="/researcher" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    RESEARCH IMPACT
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Research Impact Dashboard
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Track the impact of your research. Monitor citations, downloads, collaborations, and contributions to mental health research across Africa.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === "overview" ? "detailed" : "overview")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">{viewMode === "overview" ? "Detailed View" : "Overview"}</span>
              </button>
              <button
                onClick={fetchImpactData}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              timeRange === "month" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              timeRange === "year" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            This Year
          </button>
          <button
            onClick={() => setTimeRange("all")}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              timeRange === "all" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All Time
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Publications</p>
            </div>
            <p className="text-2xl font-bold text-white">{impact.total_publications}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Citations</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{impact.total_citations}</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 text-xs">Downloads</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{impact.total_downloads}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Views</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{impact.total_views}</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-amber-400" />
              <p className="text-amber-400 text-xs">Collaborations</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">{impact.collaborations}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <p className="text-cyan-400 text-xs">Mentees</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{impact.mentees}</p>
          </div>
        </div>

        {viewMode === "overview" ? (
          <>
            {/* Top Publications */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Top Publications
                </h3>
                <Link href="/research/publications" className="text-cyan-400 hover:text-cyan-300 text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {impact.top_publications.map((pub, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{pub.title}</h4>
                        <div className="flex gap-4 mt-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {pub.citations} citations
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {pub.downloads} downloads
                          </span>
                        </div>
                      </div>
                      <span className="text-cyan-400 font-bold">#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Over Time */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Impact Over Time
              </h3>
              <div className="h-64 flex items-end gap-4">
                {impact.impact_by_year.map((item, index) => {
                  const maxPublications = Math.max(...impact.impact_by_year.map(i => i.publications));
                  const maxCitations = Math.max(...impact.impact_by_year.map(i => i.citations));
                  const pubHeight = maxPublications > 0 ? (item.publications / maxPublications) * 100 : 0;
                  const citHeight = maxCitations > 0 ? (item.citations / maxCitations) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="flex gap-2 w-full justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-8 bg-cyan-500/30 rounded-t transition-all hover:bg-cyan-500/50" style={{ height: `${pubHeight}%` }} />
                          <span className="text-cyan-400 text-xs mt-1">{item.publications}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-8 bg-purple-500/30 rounded-t transition-all hover:bg-purple-500/50" style={{ height: `${citHeight}%` }} />
                          <span className="text-purple-400 text-xs mt-1">{item.citations}</span>
                        </div>
                      </div>
                      <span className="text-slate-500 text-xs mt-2">{item.year}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500/30 rounded"></div>
                  <span className="text-slate-400 text-xs">Publications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500/30 rounded"></div>
                  <span className="text-slate-400 text-xs">Citations</span>
                </div>
              </div>
            </div>

            {/* Research Areas */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-cyan-400" />
                Research Areas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {impact.research_areas.map((area, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white">{area.area}</span>
                      <span className="text-cyan-400 font-bold">{area.count}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-cyan-500 h-1.5 rounded-full" 
                        style={{ width: `${(area.count / Math.max(...impact.research_areas.map(a => a.count))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {impact.metrics.map((metric) => {
                const isPositive = metric.percentage_change >= 0;
                return (
                  <div key={metric.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getMetricIcon(metric.icon)}
                          <span className="text-slate-400 text-sm">{metric.metric_type}</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{metric.count}</p>
                        <p className="text-slate-400 text-sm mt-1">{metric.description}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {isPositive ? "↑" : "↓"}
                        {Math.abs(metric.percentage_change)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-cyan-400" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {impact.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-xl">
                    <div className="w-2 h-2 mt-2 bg-cyan-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-300">
                          {activity.type}
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SDG Contributions */}
            <div className="mt-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/30 p-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-purple-400" />
                SDG Contributions
              </h3>
              <div className="flex flex-wrap gap-3">
                {impact.sdg_contributions.map((sdg, index) => (
                  <span key={index} className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">
                    {sdg}
                  </span>
                ))}
              </div>
              <p className="text-slate-300 text-sm mt-3">
                Your research contributes to the Sustainable Development Goals, driving progress in mental health across Africa.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}