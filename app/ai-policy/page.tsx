"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Globe,
  Search,
  Filter,
  Download,
  RefreshCw,
  Star,
  Award,
  Flame,
  Zap,
  Leaf,
  ChevronRight,
  Lightbulb,
  BarChart3,
  PieChart,
  MessageSquare,
  Eye,
  Calendar,
  MapPin,
  Shield,
  Rocket,
  Sparkles,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";

interface AICountryIntelligence {
  id: number;
  country_name: string;
  region: string;
  reform_score: number;
  reform_tier: string;
  priority_level: "🔥" | "⚡" | "🌱";
  reform_status: string;
  ai_recommendations: string[];
  ai_insights?: {
    summary: string;
    key_opportunities: string[];
    critical_gaps: string[];
    predicted_trajectory: string;
    confidence_score: number;
  };
  implementation_gaps?: {
    category: string;
    gap_score: number;
    urgency: "High" | "Medium" | "Low";
  }[];
  policy_timeline?: {
    action: string;
    timeframe: string;
    impact: "High" | "Medium" | "Low";
  }[];
  benchmark_data?: {
    regional_avg: number;
    continental_avg: number;
    top_performer: string;
    top_score: number;
  };
  last_updated: string;
}

// Mock data for demonstration with complete structure
const mockAIIntelligence: AICountryIntelligence[] = [
  {
    id: 1,
    country_name: "Nigeria",
    region: "West Africa",
    reform_score: 62,
    reform_tier: "Tier 2 - Law Exists / Limited Implementation",
    priority_level: "🔥",
    reform_status: "Limited Reform",
    ai_recommendations: [
      "Accelerate state-level domestication of the Mental Health Act across 36 states",
      "Establish Mental Health Department at federal and state levels with dedicated funding",
      "Train 10,000 primary healthcare workers in mental health over next 24 months",
      "Launch pilot community mental health programs in 6 geo-political zones",
      "Create national mental health funding mechanism with 5% health budget allocation",
    ],
    ai_insights: {
      summary: "Nigeria has a modern legal framework but faces significant implementation challenges due to federal-state coordination gaps and inadequate funding. Only 10% of those in need receive care, representing a massive treatment gap.",
      key_opportunities: [
        "State-level domestication momentum building in 12 states",
        "Youth mental health advocacy movement gaining traction",
        "Telehealth infrastructure expanding rapidly",
      ],
      critical_gaps: [
        "Mental health budget <1% of health budget",
        "Severe workforce shortage (0.4 psychiatrists per 100k)",
        "Weak primary healthcare integration",
      ],
      predicted_trajectory: "Expected to reach 68% reform score by 2026 with focused intervention",
      confidence_score: 94,
    },
    implementation_gaps: [
      { category: "Legal Framework", gap_score: 25, urgency: "High" },
      { category: "Workforce Capacity", gap_score: 85, urgency: "High" },
      { category: "Funding & Budget", gap_score: 90, urgency: "High" },
      { category: "Community Services", gap_score: 80, urgency: "High" },
      { category: "Data Systems", gap_score: 70, urgency: "Medium" },
    ],
    policy_timeline: [
      { action: "State-level domestication campaign", timeframe: "0-6 months", impact: "High" },
      { action: "Primary healthcare worker training", timeframe: "6-18 months", impact: "High" },
      { action: "Community mental health pilots", timeframe: "12-24 months", impact: "High" },
      { action: "National funding mechanism", timeframe: "18-36 months", impact: "High" },
    ],
    benchmark_data: {
      regional_avg: 42,
      continental_avg: 55,
      top_performer: "South Africa",
      top_score: 81,
    },
    last_updated: "2024-03-15",
  },
  {
    id: 2,
    country_name: "Kenya",
    region: "East Africa",
    reform_score: 74,
    reform_tier: "Tier 2 - Law Exists / Limited Implementation",
    priority_level: "🔥",
    reform_status: "Moderate Reform",
    ai_recommendations: [
      "Accelerate county-level implementation through dedicated technical assistance",
      "Expand community health worker training on mental health to reach rural areas",
      "Increase mental health budget allocation to 5% of health budget",
      "Launch national anti-stigma campaign targeting rural populations",
      "Establish telepsychiatry network to reach underserved counties",
      "Strengthen mental health data collection and monitoring systems",
    ],
    ai_insights: {
      summary: "Kenya has made significant progress with devolution enabling county-level innovation, but implementation remains uneven across 47 counties. Urban centers show better service delivery than rural areas.",
      key_opportunities: [
        "Devolution creating county-level innovation hubs",
        "Strong civil society engagement and advocacy",
        "Mental health integrated into Universal Health Coverage",
      ],
      critical_gaps: [
        "Severe shortage of psychiatrists (0.5 per 100k)",
        "Limited community-based services outside urban areas",
        "Stigma remains high in rural communities",
      ],
      predicted_trajectory: "Expected to reach 82% reform score by 2026 with continued momentum",
      confidence_score: 96,
    },
    implementation_gaps: [
      { category: "Legal Framework", gap_score: 15, urgency: "Low" },
      { category: "Workforce Capacity", gap_score: 75, urgency: "High" },
      { category: "Funding & Budget", gap_score: 65, urgency: "Medium" },
      { category: "Community Services", gap_score: 70, urgency: "High" },
      { category: "Data Systems", gap_score: 55, urgency: "Medium" },
    ],
    policy_timeline: [
      { action: "County implementation acceleration", timeframe: "0-6 months", impact: "High" },
      { action: "Community health worker training", timeframe: "6-12 months", impact: "High" },
      { action: "National anti-stigma campaign", timeframe: "12-18 months", impact: "Medium" },
      { action: "Telepsychiatry network rollout", timeframe: "18-24 months", impact: "High" },
    ],
    benchmark_data: {
      regional_avg: 58,
      continental_avg: 55,
      top_performer: "South Africa",
      top_score: 81,
    },
    last_updated: "2024-03-15",
  },
  {
    id: 3,
    country_name: "South Africa",
    region: "Southern Africa",
    reform_score: 81,
    reform_tier: "Tier 4 - Moderate Systems",
    priority_level: "⚡",
    reform_status: "Advanced Reform",
    ai_recommendations: [
      "Focus on equity in access between provinces and urban/rural areas",
      "Expand community-based care models and reduce reliance on psychiatric hospitals",
      "Strengthen mental health data collection and research capacity",
      "Address social determinants of mental health through cross-sectoral collaboration",
      "Scale up evidence-based interventions for priority populations",
    ],
    ai_insights: {
      summary: "South Africa has the most advanced mental health system in Africa, but significant disparities exist between provinces. Community-based care expansion and workforce distribution remain key priorities.",
      key_opportunities: [
        "Strong legal framework and policy environment",
        "Established research and academic infrastructure",
        "Growing private sector engagement in mental health",
      ],
      critical_gaps: [
        "Inequitable distribution of resources across provinces",
        "High reliance on psychiatric hospitals vs community care",
        "Workforce maldistribution and retention challenges",
      ],
      predicted_trajectory: "Expected to reach 88% reform score by 2026 with equity-focused interventions",
      confidence_score: 92,
    },
    implementation_gaps: [
      { category: "Legal Framework", gap_score: 10, urgency: "Low" },
      { category: "Workforce Capacity", gap_score: 45, urgency: "Medium" },
      { category: "Funding & Budget", gap_score: 35, urgency: "Medium" },
      { category: "Community Services", gap_score: 50, urgency: "Medium" },
      { category: "Data Systems", gap_score: 40, urgency: "Medium" },
    ],
    policy_timeline: [
      { action: "Equity in access framework", timeframe: "6-12 months", impact: "High" },
      { action: "Community care expansion", timeframe: "12-24 months", impact: "High" },
      { action: "Workforce retention strategy", timeframe: "6-18 months", impact: "Medium" },
      { action: "Social determinants integration", timeframe: "18-36 months", impact: "Medium" },
    ],
    benchmark_data: {
      regional_avg: 58,
      continental_avg: 55,
      top_performer: "Mauritius",
      top_score: 85,
    },
    last_updated: "2024-03-15",
  },
  {
    id: 4,
    country_name: "DR Congo",
    region: "Central Africa",
    reform_score: 16,
    reform_tier: "Tier 1 - System Failure",
    priority_level: "🔥",
    reform_status: "Crisis Level",
    ai_recommendations: [
      "Emergency mental health policy development with humanitarian partners",
      "Integrate mental health into primary healthcare as entry point",
      "Establish minimum mental health service package for humanitarian settings",
      "Train community health workers in psychological first aid",
      "Advocate for national mental health law through AU/WHO channels",
      "Develop mental health referral pathways in conflict-affected areas",
    ],
    ai_insights: {
      summary: "DR Congo has no mental health law and faces a humanitarian crisis with multiple ongoing conflicts. Mental health services are virtually non-existent outside a few urban centers.",
      key_opportunities: [
        "Humanitarian partners interested in mental health integration",
        "WHO technical support available for crisis contexts",
        "Growing awareness among health officials",
      ],
      critical_gaps: [
        "No mental health legislation or policy",
        "No mental health budget allocation",
        "Severe workforce shortage (0.1 psychiatrists per 100k)",
        "Ongoing conflict limiting system development",
      ],
      predicted_trajectory: "Requires immediate humanitarian intervention; system building projected at 5+ years",
      confidence_score: 88,
    },
    implementation_gaps: [
      { category: "Legal Framework", gap_score: 100, urgency: "High" },
      { category: "Workforce Capacity", gap_score: 95, urgency: "High" },
      { category: "Funding & Budget", gap_score: 100, urgency: "High" },
      { category: "Community Services", gap_score: 98, urgency: "High" },
      { category: "Data Systems", gap_score: 95, urgency: "High" },
    ],
    policy_timeline: [
      { action: "Emergency policy development", timeframe: "0-6 months", impact: "High" },
      { action: "PHC integration pilot", timeframe: "6-12 months", impact: "High" },
      { action: "Community health worker training", timeframe: "12-18 months", impact: "High" },
      { action: "National law advocacy", timeframe: "18-36 months", impact: "Medium" },
    ],
    benchmark_data: {
      regional_avg: 28,
      continental_avg: 55,
      top_performer: "South Africa",
      top_score: 81,
    },
    last_updated: "2024-03-15",
  },
];

const regions = ["all", "West Africa", "East Africa", "Southern Africa", "North Africa", "Central Africa", "Island States"];
const priorityLevels = ["all", "🔥", "⚡", "🌱"];

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case "🔥": return { icon: Flame, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "Crisis Priority" };
    case "⚡": return { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", label: "High Impact" };
    case "🌱": return { icon: Leaf, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", label: "Model System" };
    default: return { icon: Target, color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/30", label: "Strategic Priority" };
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

// Helper function to safely get nested properties
const getSafeValue = <T,>(obj: any, path: string, defaultValue: T): T => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }
  return (result === undefined || result === null) ? defaultValue : result;
};

export default function AIPolicyPage() {
  const [countries, setCountries] = useState<AICountryIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchAIIntelligence();
  }, []);

  const fetchAIIntelligence = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai-policy");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.intelligence) {
          setCountries(data.intelligence);
        } else {
          setCountries(mockAIIntelligence);
        }
      } else {
        setCountries(mockAIIntelligence);
      }
    } catch (error) {
      console.error("Error fetching AI intelligence:", error);
      setCountries(mockAIIntelligence);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = useMemo(() => {
    return countries.filter(country => {
      const matchesSearch = country.country_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === "all" || country.region === selectedRegion;
      const matchesPriority = selectedPriority === "all" || country.priority_level === selectedPriority;
      return matchesSearch && matchesRegion && matchesPriority;
    });
  }, [countries, searchTerm, selectedRegion, selectedPriority]);

  const stats = {
    total: countries.length,
    avgScore: countries.length > 0 ? Math.round(countries.reduce((acc, c) => acc + c.reform_score, 0) / countries.length) : 0,
    highPriority: countries.filter(c => c.priority_level === "🔥").length,
    highImpact: countries.filter(c => c.priority_level === "⚡").length,
    modelSystems: countries.filter(c => c.priority_level === "🌱").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading AI policy intelligence...</p>
        </div>
      </div>
    );
  }

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
                    AI-POWERED POLICY INTELLIGENCE
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400 text-xs">Generative AI Analysis</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Policy Intelligence
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                AI-assisted reform recommendations and governance intelligence engine for continental policy development.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchAIIntelligence}
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
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Countries Analyzed</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-400 text-xs">Continental Avg Score</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.avgScore}%</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">🔥 Crisis Priority</p>
            <p className="text-2xl font-bold text-red-400">{stats.highPriority}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs">⚡ High Impact</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.highImpact}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">🌱 Model Systems</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.modelSystems}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            {regions.map(region => (
              <option key={region} value={region}>
                {region === "all" ? "All Regions" : region}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Priorities</option>
            <option value="🔥">Crisis Priority 🔥</option>
            <option value="⚡">High Impact ⚡</option>
            <option value="🌱">Model System 🌱</option>
          </select>
        </div>

        {/* Country Cards */}
        <div className="space-y-6">
          {filteredCountries.map((country) => {
            const priorityConfig = getPriorityConfig(country.priority_level);
            const PriorityIcon = priorityConfig.icon;
            const isExpanded = expandedId === country.id;
            
            // Safely get nested values with defaults
            const confidenceScore = getSafeValue(country, 'ai_insights.confidence_score', 85);
            const benchmarkRegionalAvg = getSafeValue(country, 'benchmark_data.regional_avg', 0);
            const benchmarkTopPerformer = getSafeValue(country, 'benchmark_data.top_performer', 'Unknown');
            const benchmarkTopScore = getSafeValue(country, 'benchmark_data.top_score', 0);
            
            return (
              <div
                key={country.id}
                className={`bg-slate-800/50 rounded-2xl border ${priorityConfig.border} overflow-hidden transition-all hover:shadow-xl`}
              >
                {/* Card Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : country.id)}
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">{country.country_name}</h2>
                        <div className={`px-2 py-1 rounded-lg ${priorityConfig.bg} flex items-center gap-1`}>
                          <PriorityIcon className={`w-3 h-3 ${priorityConfig.color}`} />
                          <span className={`text-xs ${priorityConfig.color}`}>{priorityConfig.label}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {country.region}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {country.reform_tier}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          AI Confidence: {confidenceScore}%
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-sm">Reform Score</p>
                      <p className={`text-4xl font-bold ${getScoreColor(country.reform_score)}`}>
                        {country.reform_score}%
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500 text-xs">vs Regional: {benchmarkRegionalAvg}%</span>
                        {country.reform_score > benchmarkRegionalAvg ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && country.ai_insights && (
                  <div className="border-t border-slate-700 p-6 bg-slate-800/30">
                    {/* AI Summary */}
                    <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-4 mb-6 border border-purple-500/20">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <div>
                          <h3 className="text-white font-semibold mb-1">AI Intelligence Summary</h3>
                          <p className="text-slate-300 text-sm">{country.ai_insights.summary}</p>
                          <p className="text-cyan-400 text-sm mt-2">
                            Predicted trajectory: {country.ai_insights.predicted_trajectory}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Key Opportunities & Critical Gaps */}
                      <div className="space-y-4">
                        <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                          <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Key Opportunities
                          </h3>
                          <ul className="space-y-2">
                            {country.ai_insights.key_opportunities.map((opp, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                                <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5" />
                                {opp}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                          <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Critical Gaps
                          </h3>
                          <ul className="space-y-2">
                            {country.ai_insights.critical_gaps.map((gap, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                                <AlertCircle className="w-3 h-3 text-red-400 mt-0.5" />
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Implementation Gaps */}
                      {country.implementation_gaps && (
                        <div className="space-y-4">
                          <div className="bg-slate-700/30 rounded-xl p-4">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-cyan-400" />
                              Implementation Gap Analysis
                            </h3>
                            <div className="space-y-3">
                              {country.implementation_gaps.map((gap, idx) => (
                                <div key={idx}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-400">{gap.category}</span>
                                    <span className={`${gap.urgency === "High" ? "text-red-400" : gap.urgency === "Medium" ? "text-yellow-400" : "text-emerald-400"}`}>
                                      {gap.gap_score}% gap
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${gap.urgency === "High" ? "bg-red-500" : gap.urgency === "Medium" ? "bg-yellow-500" : "bg-emerald-500"}`}
                                      style={{ width: `${gap.gap_score}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Policy Timeline */}
                          {country.policy_timeline && (
                            <div className="bg-slate-700/30 rounded-xl p-4">
                              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-cyan-400" />
                                Policy Implementation Timeline
                              </h3>
                              <div className="space-y-3">
                                {country.policy_timeline.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="text-white text-sm">{item.action}</p>
                                      <p className="text-slate-500 text-xs">{item.timeframe}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                      item.impact === "High" ? "bg-emerald-500/20 text-emerald-400" :
                                      "bg-yellow-500/20 text-yellow-400"
                                    }`}>
                                      {item.impact} Impact
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* AI Recommendations */}
                    <div className="mt-6">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-cyan-400" />
                        AI-Generated Policy Recommendations
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {country.ai_recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-cyan-600/10 rounded-xl border border-cyan-500/20">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-cyan-400 text-xs font-bold">{idx + 1}</span>
                            </div>
                            <p className="text-slate-300 text-sm flex-1">{rec}</p>
                            <ThumbsUp className="w-4 h-4 text-cyan-400 opacity-50 hover:opacity-100 cursor-pointer transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Benchmark Data */}
                    <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center text-sm">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-slate-500">Regional Avg</span>
                          <p className="text-white font-medium">{benchmarkRegionalAvg}%</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Continental Avg</span>
                          <p className="text-white font-medium">{getSafeValue(country, 'benchmark_data.continental_avg', 55)}%</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Top Performer</span>
                          <p className="text-cyan-400 font-medium">{benchmarkTopPerformer} ({benchmarkTopScore}%)</p>
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs">Last updated: {new Date(country.last_updated).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCountries.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No AI intelligence data found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}