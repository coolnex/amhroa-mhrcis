"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Users,
  Building2,
  Scale,
  Heart,
  Calendar,
  Download,
  Share2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Globe,
  FileText,
  Star,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Shield,
  Flag,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  Brain,
  DollarSign,
  Wallet,
  FileCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart as ReLineChart,
  Line,
  CartesianGrid,
} from "recharts";

// Interface matching mental_health_reforms table
interface CountryProfile {
  id: number;
  country_name: string;
  reform_tier: string;
  law_status: string;
  implementation_status: string;
  budget_level: string;
  priority_level: string;
  strategy: string;
  reform_score: number;
  implementation_score: number;
  sdg3_score: number;
  sdg10_score: number;
  sdg16_score: number;
  agenda2063_score: number;
  funding_gap_level: string;
  investment_priority: string;
  estimated_investment_need: number;
  donor_readiness_score: number;
  created_at: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 70) return "text-cyan-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return "bg-emerald-500/20";
  if (score >= 70) return "bg-cyan-500/20";
  if (score >= 60) return "bg-blue-500/20";
  if (score >= 50) return "bg-yellow-500/20";
  if (score >= 40) return "bg-orange-500/20";
  return "bg-red-500/20";
};

const getPriorityDisplay = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "crisis":
    case "🔥": return { icon: "🔥", label: "Urgent Priority", color: "bg-red-500/20 text-red-400" };
    case "high":
    case "⚡": return { icon: "⚡", label: "High Impact", color: "bg-yellow-500/20 text-yellow-400" };
    case "model":
    case "🌱": return { icon: "🌱", label: "Model System", color: "bg-emerald-500/20 text-emerald-400" };
    default: return { icon: "⚡", label: "High Impact", color: "bg-yellow-500/20 text-yellow-400" };
  }
};

export default function CountryProfilePage() {
  const params = useParams();
  const countrySlug = params.country as string;
  const [country, setCountry] = useState<CountryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "sdg" | "funding" | "recommendations">("overview");

  useEffect(() => {
    if (countrySlug) {
      fetchCountry();
    }
  }, [countrySlug]);

  const fetchCountry = async () => {
    setLoading(true);
    setError(null);
    try {
      // Decode the URL parameter - handle both encoded and unencoded
      const decodedSlug = decodeURIComponent(countrySlug);
      console.log("🔍 Fetching country:", decodedSlug);
      
      // Try with the decoded slug directly
      const response = await fetch(`/api/countries/${encodeURIComponent(decodedSlug)}`);
      console.log("📡 Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("📦 Data received:", data);
        if (data.success && data.country) {
          setCountry(data.country);
        } else {
          setError(data.message || "Country not found");
        }
      } else {
        // Try with the original slug if the decoded one failed
        console.log("🔄 Retrying with original slug:", countrySlug);
        const retryResponse = await fetch(`/api/countries/${encodeURIComponent(countrySlug)}`);
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          if (data.success && data.country) {
            setCountry(data.country);
          } else {
            setError(data.message || "Country not found");
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || `Error ${response.status}: Country not found`);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching country:", error);
      setError("Failed to load country data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate radar data from country data
  const getRadarData = (countryData: CountryProfile) => {
    if (!countryData) return [];
    return [
      { metric: "Reform Score", value: countryData.reform_score || 0, fullMark: 100 },
      { metric: "Implementation", value: countryData.implementation_score || 0, fullMark: 100 },
      { metric: "SDG 3", value: countryData.sdg3_score || 0, fullMark: 100 },
      { metric: "SDG 10", value: countryData.sdg10_score || 0, fullMark: 100 },
      { metric: "SDG 16", value: countryData.sdg16_score || 0, fullMark: 100 },
      { metric: "Agenda 2063", value: countryData.agenda2063_score || 0, fullMark: 100 },
    ];
  };

  // Generate recommendations based on country data
  const getRecommendations = (countryData: CountryProfile) => {
    if (!countryData) return [];
    const recs = [];
    
    if (countryData.reform_score && countryData.reform_score < 50) {
      recs.push("Accelerate mental health reform implementation through dedicated technical assistance");
    }
    if (countryData.implementation_score && countryData.implementation_score < 50) {
      recs.push("Strengthen implementation capacity through training and resource allocation");
    }
    if (countryData.law_status?.toLowerCase().includes("outdated") || countryData.law_status?.toLowerCase().includes("no law")) {
      recs.push("Develop and enact modern mental health legislation aligned with WHO standards");
    }
    if (countryData.funding_gap_level?.toLowerCase() === "high") {
      recs.push("Increase mental health budget allocation to address the significant funding gap");
    }
    if (countryData.donor_readiness_score && countryData.donor_readiness_score < 50) {
      recs.push("Improve donor readiness through better governance and accountability frameworks");
    }
    if (countryData.sdg3_score && countryData.sdg3_score < 50) {
      recs.push("Strengthen mental health integration into primary healthcare systems");
    }
    if (countryData.sdg10_score && countryData.sdg10_score < 50) {
      recs.push("Enhance community-based mental health services and social inclusion programs");
    }
    if (countryData.sdg16_score && countryData.sdg16_score < 50) {
      recs.push("Strengthen legal frameworks and access to justice for mental health");
    }
    
    // Add strategy-based recommendations
    if (countryData.strategy) {
      recs.push(`Implement the strategic pathway: ${countryData.strategy}`);
    }
    
    // Ensure we have at least 3 recommendations
    while (recs.length < 3) {
      recs.push("Continue monitoring and evaluation of mental health reform progress");
    }
    
    return recs.slice(0, 6);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading country intelligence data...</p>
        </div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Country Not Found</h1>
          <p className="text-slate-400 mb-6">{error || "The requested country profile could not be located."}</p>
          <p className="text-slate-500 text-sm mb-4">Country slug: {countrySlug}</p>
          <div className="flex flex-col gap-3">
            <Link href="/countries" className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors">
              Back to Countries
            </Link>
            <button
              onClick={fetchCountry}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const radarData = getRadarData(country);
  const recommendations = getRecommendations(country);
  const priorityInfo = getPriorityDisplay(country.priority_level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <Link href="/countries" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Countries
          </Link>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    COUNTRY INTELLIGENCE REPORT
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-lg ${priorityInfo.color}`}>
                  {priorityInfo.icon} {priorityInfo.label}
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {country.country_name}
              </h1>
              <div className="flex flex-wrap gap-4 mt-3">
                <p className="text-slate-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  {country.reform_tier || "Not classified"}
                </p>
                <p className="text-slate-300 flex items-center gap-1">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  {country.law_status || "N/A"}
                </p>
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last updated: {country.created_at ? new Date(country.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Export PDF</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Main Score Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="text-center md:text-left">
                <p className="text-slate-400 text-sm mb-2">Overall Reform Score</p>
                <div className={`w-32 h-32 rounded-full ${getScoreBgColor(country.reform_score || 0)} flex items-center justify-center mx-auto md:mx-0`}>
                  <span className={`text-5xl font-bold ${getScoreColor(country.reform_score || 0)}`}>
                    {country.reform_score || 0}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-2">/100</p>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-lg">{country.reform_tier || "Not assessed"}</p>
                <p className="text-slate-400 text-sm mt-1">Implementation: {country.implementation_status || "N/A"}</p>
                <p className="text-slate-400 text-sm">Budget Level: {country.budget_level || "N/A"}</p>
                {country.strategy && (
                  <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <p className="text-cyan-400 text-xs font-semibold">Strategic Pathway</p>
                    <p className="text-slate-300 text-sm mt-1">{country.strategy}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-2">Investment Readiness</p>
            <div className="flex justify-between mb-2">
              <span className="text-white text-sm">Donor Readiness</span>
              <span className="text-cyan-400 font-bold">{country.donor_readiness_score || 0}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${country.donor_readiness_score || 0}%` }}></div>
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-slate-400 text-sm">Investment Priority</span>
              <span className="text-white text-sm">{country.investment_priority || "N/A"}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-slate-400 text-sm">Funding Gap</span>
              <span className={`text-sm font-medium ${
                country.funding_gap_level?.toLowerCase() === "high" ? "text-red-400" :
                country.funding_gap_level?.toLowerCase() === "medium" ? "text-yellow-400" :
                "text-emerald-400"
              }`}>
                {country.funding_gap_level || "N/A"}
              </span>
            </div>
            {country.estimated_investment_need && country.estimated_investment_need > 0 && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-yellow-400 text-xs font-semibold">Estimated Investment Need</p>
                <p className="text-white text-lg font-bold">${(country.estimated_investment_need / 1000000).toFixed(1)}M</p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Globe className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("sdg")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "sdg"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Target className="w-4 h-4" />
            SDG & Agenda 2063
          </button>
          <button
            onClick={() => setActiveTab("funding")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "funding"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Funding & Investment
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "recommendations"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Brain className="w-4 h-4" />
            Recommendations
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-semibold text-lg">Legislation Status</h3>
                </div>
                <p className="text-slate-300 text-lg font-medium">{country.law_status || "Not specified"}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Implementation:</span>
                  <span className="text-white">{country.implementation_status || "N/A"}</span>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-semibold text-lg">Budget & Resources</h3>
                </div>
                <p className="text-slate-300 text-lg font-medium">{country.budget_level || "Not specified"}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Reform Tier:</span>
                  <span className="text-white">{country.reform_tier || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Country Performance Radar
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                    <Radar name={country.country_name} dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reform Score Breakdown */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                Reform Score Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-sm">Reform Score</span>
                    <span className={`font-bold ${getScoreColor(country.reform_score || 0)}`}>{country.reform_score || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getScoreBgColor(country.reform_score || 0)}`} style={{ width: `${country.reform_score || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-sm">Implementation</span>
                    <span className={`font-bold ${getScoreColor(country.implementation_score || 0)}`}>{country.implementation_score || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getScoreBgColor(country.implementation_score || 0)}`} style={{ width: `${country.implementation_score || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-sm">Donor Readiness</span>
                    <span className={`font-bold ${getScoreColor(country.donor_readiness_score || 0)}`}>{country.donor_readiness_score || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getScoreBgColor(country.donor_readiness_score || 0)}`} style={{ width: `${country.donor_readiness_score || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SDG Tab */}
        {activeTab === "sdg" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Target className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">SDG 3.4</p>
                <p className="text-3xl font-bold text-white">{country.sdg3_score || 0}%</p>
                <p className="text-slate-500 text-xs">Mental Health & NCDs</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">SDG 10.2</p>
                <p className="text-3xl font-bold text-white">{country.sdg10_score || 0}%</p>
                <p className="text-slate-500 text-xs">Social Inclusion</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">SDG 16.3</p>
                <p className="text-3xl font-bold text-white">{country.sdg16_score || 0}%</p>
                <p className="text-slate-500 text-xs">Rule of Law</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Target className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Agenda 2063</p>
                <p className="text-3xl font-bold text-white">{country.agenda2063_score || 0}%</p>
                <p className="text-slate-500 text-xs">African Union Agenda</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                SDG & Agenda 2063 Alignment
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-sm">SDG 3.4 - Mental Health Coverage</span>
                    <span className="text-emerald-400 text-sm">{country.sdg3_score || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${country.sdg3_score || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-sm">SDG 10.2 - Social & Economic Inclusion</span>
                    <span className="text-blue-400 text-sm">{country.sdg10_score || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${country.sdg10_score || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-sm">SDG 16.3 - Rule of Law & Access to Justice</span>
                    <span className="text-purple-400 text-sm">{country.sdg16_score || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${country.sdg16_score || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-sm">Agenda 2063 - The Africa We Want</span>
                    <span className="text-amber-400 text-sm">{country.agenda2063_score || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${country.agenda2063_score || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Funding Tab */}
        {activeTab === "funding" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-semibold text-lg">Funding Overview</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">Estimated Investment Need</p>
                    <p className="text-2xl font-bold text-white">
                      ${country.estimated_investment_need ? (country.estimated_investment_need / 1000000).toFixed(1) : "0"}M
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Funding Gap Level</p>
                    <p className={`text-lg font-bold ${
                      country.funding_gap_level?.toLowerCase() === "high" ? "text-red-400" :
                      country.funding_gap_level?.toLowerCase() === "medium" ? "text-yellow-400" :
                      "text-emerald-400"
                    }`}>
                      {country.funding_gap_level || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Investment Priority</p>
                    <p className="text-white">{country.investment_priority || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-semibold text-lg">Investment Readiness</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">Donor Readiness Score</p>
                    <div className="flex items-center gap-4">
                      <span className={`text-3xl font-bold ${getScoreColor(country.donor_readiness_score || 0)}`}>
                        {country.donor_readiness_score || 0}%
                      </span>
                      <div className="flex-1">
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className={`h-2 rounded-full ${getScoreBgColor(country.donor_readiness_score || 0)}`} 
                               style={{ width: `${country.donor_readiness_score || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-xl">
                    <p className="text-slate-400 text-sm">
                      {country.donor_readiness_score && country.donor_readiness_score >= 70 ? 
                        "✅ Country is ready for donor engagement" :
                        country.donor_readiness_score && country.donor_readiness_score >= 50 ? 
                        "⚠️ Partially ready - some improvements needed" :
                        "❌ Needs significant preparation for donor engagement"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Investment Gap Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                  <p className="text-slate-400 text-sm">Reform Score</p>
                  <p className="text-2xl font-bold text-white">{country.reform_score || 0}%</p>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                  <p className="text-slate-400 text-sm">Implementation Score</p>
                  <p className="text-2xl font-bold text-white">{country.implementation_score || 0}%</p>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                  <p className="text-slate-400 text-sm">Donor Readiness</p>
                  <p className="text-2xl font-bold text-white">{country.donor_readiness_score || 0}%</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-yellow-400 text-sm font-semibold">Investment Opportunity</p>
                <p className="text-slate-300 text-sm">
                  {country.country_name} shows {country.reform_score && country.reform_score >= 70 ? "strong" : "moderate"} reform progress 
                  with a {country.funding_gap_level?.toLowerCase() || "significant"} funding gap. 
                  Estimated investment need of ${country.estimated_investment_need ? (country.estimated_investment_need / 1000000).toFixed(1) : "0"}M 
                  presents a {country.donor_readiness_score && country.donor_readiness_score >= 70 ? "strong" : "developing"} investment opportunity.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-600/10 to-purple-600/10 rounded-2xl border border-cyan-500/20 p-6">
              <div className="flex items-start gap-4">
                <Brain className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">AI-Powered Strategic Recommendations</h3>
                  <p className="text-slate-300 text-sm">Based on continental benchmarks and global best practices</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-cyan-500/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-sm font-bold">{idx + 1}</span>
                  </div>
                  <p className="text-slate-300 flex-1">{rec}</p>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>

            {country.strategy && (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-cyan-400" />
                  Strategic Pathway
                </h3>
                <p className="text-slate-300 leading-relaxed">{country.strategy}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}