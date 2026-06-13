// app/policymaker/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp,
  Scale,
  Target,
  AlertTriangle,
  Download,
  Eye,
  Calendar,
  BarChart3,
  Globe,
  Users,
  Building2,
  FileText,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  Lightbulb,
  MessageSquare,
  Printer,
  Share2,
} from "lucide-react";

interface CountryData {
  id: string;
  country_name: string;
  region: string;
  reform_score: number;
  legislation_score: number;
  implementation_score: number;
  financing_score: number;
  sdg_score: number;
  workforce_score: number;
  population: number;
}

interface PolicyData {
  id: string;
  title: string;
  status: string;
  sdg_alignment: string;
  implementation_progress: number;
  effective_date?: string;
}

interface TimelineMilestone {
  id: string;
  title: string;
  date: string;
  status: "completed" | "in-progress" | "pending";
  description: string;
}

interface BenchmarkData {
  country: string;
  score: number;
  rank: number;
  region: string;
}

export default function PolicymakerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("Kenya");
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [timeline, setTimeline] = useState<TimelineMilestone[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    checkAuth();
    fetchData();
    setLastUpdated(new Date().toLocaleString());
  }, [selectedCountry]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        router.push("/login");
        return;
      }

      const userData = JSON.parse(userStr);
      
      if (userData.role !== "Policymaker" && userData.role !== "Admin") {
        router.push("/dashboard");
        return;
      }

      if (userData.status !== "Approved") {
        router.push("/login?message=Account pending approval");
        return;
      }

      setUser(userData);
      setUserRole(userData.role);
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch countries list
      const { data: countriesData } = await supabase
        .from("countries")
        .select("id, country_name, region, reform_score, legislation_score, implementation_score, financing_score, sdg_score, workforce_score, population")
        .order("country_name");

      if (countriesData) {
        setCountries(countriesData);
        
        // Find selected country data
        const selected = countriesData.find(c => c.country_name === selectedCountry);
        if (selected) {
          setCountryData(selected);
          
          // Fetch benchmarking data
          const regionalCountries = countriesData.filter(c => c.region === selected.region);
          const sorted = [...regionalCountries].sort((a, b) => b.reform_score - a.reform_score);
          const benchmarksData = sorted.slice(0, 5).map((c, idx) => ({
            country: c.country_name,
            score: c.reform_score,
            rank: idx + 1,
            region: c.region,
          }));
          setBenchmarks(benchmarksData);
        }
      }

      // Mock policies data (would come from database)
      setPolicies([
        { id: "1", title: "National Mental Health Act", status: "Passed", sdg_alignment: "SDG 3.4", implementation_progress: 85 },
        { id: "2", title: "Community Mental Health Framework", status: "In Committee", sdg_alignment: "SDG 3.4, 10.2", implementation_progress: 40 },
        { id: "3", title: "Workplace Mental Health Regulations", status: "Drafting", sdg_alignment: "SDG 8.5", implementation_progress: 15 },
        { id: "4", title: "Suicide Prevention Strategy", status: "Under Review", sdg_alignment: "SDG 3.4", implementation_progress: 55 },
      ]);

      // Mock timeline data
      setTimeline([
        { id: "1", title: "Mental Health Act Passage", date: "2024 Q4", status: "completed", description: "Legislation passed by parliament" },
        { id: "2", title: "National Commission Establishment", date: "2025 Q1", status: "in-progress", description: "Commission structure being defined" },
        { id: "3", title: "County-Level Implementation", date: "2025 Q3", status: "pending", description: "Rollout to 47 counties" },
        { id: "4", title: "Continental Compliance Audit", date: "2026 Q1", status: "pending", description: "AMHROA compliance review" },
      ]);

      // AI Recommendations based on country data
      if (countryData) {
        const recommendations = [];
        if (countryData.legislation_score < 70) {
          recommendations.push("Accelerate legislative reforms - current score below continental average");
        }
        if (countryData.financing_score < 60) {
          recommendations.push("Increase budget allocation for preventive care (currently below regional average)");
        }
        if (countryData.implementation_score < 65) {
          recommendations.push("Strengthen implementation mechanisms and monitoring frameworks");
        }
        if (countryData.workforce_score < 50) {
          recommendations.push("Expand mental health workforce training programs");
        }
        recommendations.push("Align reporting framework with continental SDG indicators by Q3 2026");
        setAiRecommendations(recommendations);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Passed": return "text-emerald-400 bg-emerald-500/20";
      case "In Committee": return "text-yellow-400 bg-yellow-500/20";
      case "Drafting": return "text-blue-400 bg-blue-500/20";
      case "Under Review": return "text-purple-400 bg-purple-500/20";
      default: return "text-slate-400 bg-slate-500/20";
    }
  };

  const getTimelineStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "in-progress": return <Clock className="w-5 h-5 text-yellow-400" />;
      default: return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 70) return "text-cyan-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 50) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Policy Intelligence...</p>
        </div>
      </div>
    );
  }

  const overallScore = countryData?.reform_score || 0;
  const legislativeScore = countryData?.legislation_score || 0;
  const implementationScore = countryData?.implementation_score || 0;
  const financingScore = countryData?.financing_score || 0;
  const sdgScore = countryData?.sdg_score || 0;

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
                    POLICYMAKER INTELLIGENCE
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-xs">Live Data</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                National Reform Intelligence Center
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2">
                Continental Policy Decision Support System · {selectedCountry}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Share</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <Printer className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Print</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Export Brief</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Country Selector */}
        <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {countries.map((country) => (
                <option key={country.id} value={country.country_name}>
                  {country.country_name}
                </option>
              ))}
            </select>
            <div className="text-slate-400 text-sm flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Last updated: {lastUpdated}
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/30 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">Overall Reform Score</p>
                <p className={`text-4xl font-bold mt-2 ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </p>
                <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +5.2% vs last quarter
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">Legislative Progress</p>
                <p className={`text-4xl font-bold mt-2 ${getScoreColor(legislativeScore)}`}>
                  {legislativeScore}%
                </p>
                <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +3.1% vs last quarter
                </p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Scale className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-500/30 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">SDG 3.4 Alignment</p>
                <p className={`text-4xl font-bold mt-2 ${getScoreColor(sdgScore)}`}>
                  {sdgScore}%
                </p>
                <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% YoY
                </p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/30 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">Implementation Gaps</p>
                <p className="text-4xl font-bold mt-2 text-yellow-400">6</p>
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  -2 gaps resolved
                </p>
              </div>
              <div className="bg-red-500/20 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Implementation Heatmap */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Implementation Gaps by Region
              </h3>
              <div className="space-y-3">
                {[
                  { region: "Nairobi", score: 82 },
                  { region: "Coast", score: 45 },
                  { region: "Eastern", score: 67 },
                  { region: "Central", score: 78 },
                  { region: "Rift Valley", score: 59 },
                  { region: "Western", score: 38 },
                ].map((item) => (
                  <div key={item.region} className="group cursor-pointer">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 text-sm">{item.region}</span>
                      <span className={`text-sm font-mono ${item.score >= 80 ? "text-emerald-400" : item.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                        {item.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${item.score >= 80 ? "bg-emerald-500" : item.score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legislation Status Table */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-800/80">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Legislation Status & SDG Alignment
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Policy</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">SDG Alignment</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Implementation</th>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((policy) => (
                      <tr key={policy.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 font-medium text-white">{policy.title}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(policy.status)}`}>
                            {policy.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300 text-sm">{policy.sdg_alignment}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-700 rounded-full h-1.5">
                              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${policy.implementation_progress}%` }}></div>
                            </div>
                            <span className="text-slate-300 text-sm">{policy.implementation_progress}%</span>
                          </div>
                          <div className="p-4">
                            <button className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors">
                              <Eye className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Policy Timeline */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Reform Implementation Timeline
              </h3>
              <div className="space-y-4">
                {timeline.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getTimelineStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-slate-500 text-xs">{item.date}</p>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                      <div className="mt-2 h-1 w-full bg-slate-700 rounded-full">
                        <div
                          className={`h-1 rounded-full ${
                            item.status === "completed" ? "bg-emerald-500 w-full" :
                            item.status === "in-progress" ? "bg-yellow-500 w-1/2" : "bg-slate-500 w-0"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Benchmarking Widget */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Regional Benchmarking
              </h3>
              <div className="space-y-3">
                {benchmarks.map((benchmark) => (
                  <div key={benchmark.country} className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-sm w-6">#{benchmark.rank}</span>
                      <span className="text-white text-sm">{benchmark.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-700 rounded-full h-1.5">
                        <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${benchmark.score}%` }}></div>
                      </div>
                      <span className="text-cyan-400 text-sm font-mono">{benchmark.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">AI Policy Recommendations</h3>
              </div>
              <div className="space-y-3">
                {aiRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-purple-500/10 rounded-xl">
                    <p className="text-slate-300 text-sm">{rec}</p>
                    <button className="mt-2 text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1">
                      Apply Recommendation
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors">
                  Generate Legislative Impact Assessment
                </button>
                <button className="w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors">
                  Compare with 3 Countries
                </button>
                <button className="w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors">
                  Schedule Cross-Ministerial Review
                </button>
                <button className="w-full text-left px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 rounded-lg text-cyan-300 text-sm transition-colors">
                  Export SDG Compliance Report
                </button>
              </div>
            </div>

            {/* Key Metrics Card */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                Key Performance Indicators
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Workforce Capacity</span>
                  <span className="text-white font-mono">{countryData?.workforce_score || 0}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${countryData?.workforce_score || 0}%` }}></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400 text-sm">Financing</span>
                  <span className="text-white font-mono">{financingScore}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${financingScore}%` }}></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400 text-sm">Population Covered</span>
                  <span className="text-white font-mono">{countryData?.population ? `${(countryData.population / 1000000).toFixed(1)}M` : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}