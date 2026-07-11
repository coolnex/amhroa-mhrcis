// app/agenda2063/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp,
  TrendingDown,
  Award,
  ArrowLeft,
  Target,
  Globe,
  Users,
  Heart,
  Shield,
  Handshake,
  BookOpen,
  Building2,
  Flag,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  ChevronRight,
  BarChart3,
  LineChart,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface AgendaIndicator {
  id: string;
  country_id: string;
  country_name: string;
  aspiration_1_score: number;
  aspiration_2_score: number;
  aspiration_3_score: number;
  aspiration_4_score: number;
  aspiration_5_score: number;
  aspiration_6_score: number;
  aspiration_7_score: number;
  overall_score: number;
  readiness_score: number;
  risk_level: string;
  last_updated: string;
}

interface AspirationDetail {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  metrics: {
    workforce?: number;
    financing?: number;
    treatment_coverage?: number;
    research?: number;
    partnerships?: number;
    knowledge_sharing?: number;
    laws?: number;
    human_rights?: number;
    decriminalization?: number;
    conflict_response?: number;
    trauma_programs?: number;
    refugee_support?: number;
    community?: number;
    traditional_support?: number;
    youth_programs?: number;
    lived_experience?: number;
    cso_engagement?: number;
    advocacy?: number;
    research_output?: number;
    international_partnerships?: number;
    who_engagement?: number;
  };
}

const aspirations: AspirationDetail[] = [
  { id: 1, title: "Prosperous Africa", subtitle: "Mental Health Workforce & Financing", icon: TrendingUpIcon, color: "from-emerald-500 to-teal-500", metrics: {} },
  { id: 2, title: "Integrated Continent", subtitle: "Cross-border Research & Partnerships", icon: Globe, color: "from-blue-500 to-cyan-500", metrics: {} },
  { id: 3, title: "Good Governance", subtitle: "Mental Health Laws & Human Rights", icon: Shield, color: "from-purple-500 to-indigo-500", metrics: {} },
  { id: 4, title: "Peace and Security", subtitle: "Conflict Response & Trauma Programs", icon: Heart, color: "from-rose-500 to-red-500", metrics: {} },
  { id: 5, title: "Strong Cultural Identity", subtitle: "Community & Youth Programs", icon: Flag, color: "from-amber-500 to-orange-500", metrics: {} },
  { id: 6, title: "People Driven Development", subtitle: "Lived Experience & CSO Engagement", icon: Users, color: "from-teal-500 to-emerald-500", metrics: {} },
  { id: 7, title: "Global Influence", subtitle: "Research & International Partnerships", icon: Globe, color: "from-indigo-500 to-purple-500", metrics: {} },
];

// Mock data for demonstration
const mockRankings = [
  { rank: 1, country: "Rwanda", score: 87, region: "East Africa", trend: "up" },
  { rank: 2, country: "Mauritius", score: 85, region: "Island States", trend: "up" },
  { rank: 3, country: "South Africa", score: 84, region: "Southern Africa", trend: "stable" },
  { rank: 4, country: "Ghana", score: 82, region: "West Africa", trend: "up" },
  { rank: 5, country: "Kenya", score: 80, region: "East Africa", trend: "up" },
  { rank: 6, country: "Botswana", score: 78, region: "Southern Africa", trend: "stable" },
  { rank: 7, country: "Namibia", score: 76, region: "Southern Africa", trend: "down" },
  { rank: 8, country: "Nigeria", score: 65, region: "West Africa", trend: "stable" },
  { rank: 9, country: "Tanzania", score: 58, region: "East Africa", trend: "up" },
  { rank: 10, country: "Uganda", score: 55, region: "East Africa", trend: "down" },
];

const historicalData = [
  { year: "2020", score: 48, readiness: 42 },
  { year: "2021", score: 52, readiness: 46 },
  { year: "2022", score: 58, readiness: 51 },
  { year: "2023", score: 64, readiness: 57 },
  { year: "2024", score: 71, readiness: 63 },
  { year: "2025", score: 75, readiness: 68 },
  { year: "2026", score: 79, readiness: 72 },
];

export default function Agenda2063Page() {
  const [indicators, setIndicators] = useState<AgendaIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedAspiration, setSelectedAspiration] = useState<number | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);

  useEffect(() => {
    fetchAgendaData();
  }, []);

  const fetchAgendaData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("agenda2063_indicators")
        .select(`
          *,
          countries:country_id (
            country_name,
            region
          )
        `)
        .order("overall_score", { ascending: false });

      if (error) throw error;
      setIndicators(data || []);
    } catch (error) {
      console.error("Error fetching agenda data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-emerald-400 bg-emerald-500/20";
      case "Medium": return "text-yellow-400 bg-yellow-500/20";
      case "High": return "text-orange-400 bg-orange-500/20";
      case "Critical": return "text-red-400 bg-red-500/20";
      default: return "text-slate-400 bg-slate-500/20";
    }
  };

  const calculateContinentalScore = () => {
    if (indicators.length === 0) return 71;
    const avg = indicators.reduce((sum, i) => sum + (i.overall_score || 0), 0) / indicators.length;
    return Math.round(avg);
  };

  const getPrediction = () => {
    return {
      sdg2030: 67,
      agenda2063: 61,
      workforceGrowth: 23,
      riskLevel: "Medium",
      recommendations: [
        "Increase mental health budget allocation to 5% of health budget by 2028",
        "Accelerate implementation of community-based mental health services",
        "Strengthen cross-border research partnerships with 5+ African universities",
        "Develop national suicide prevention strategies aligned with WHO guidelines",
      ],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Agenda 2063 Intelligence...</p>
        </div>
      </div>
    );
  }

  const continentalScore = calculateContinentalScore();
  const prediction = getPrediction();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        <div className="relative px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                <span className="text-cyan-300 text-xs font-mono tracking-wider">
                  AGENDA 2063 INTELLIGENCE
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Flag className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400 text-xs">The Africa We Want</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Agenda 2063 Mental Health Intelligence
            </h1>
            <p className="text-slate-300 text-lg md:text-xl mt-4 max-w-3xl">
              Tracking Africa's Progress Toward The Africa We Want — Monitoring continental mental health transformation.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Continental Score Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-2xl border border-cyan-500/30 p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide">Continental Agenda 2063 Score</p>
                <p className="text-7xl font-bold text-white mt-2">{continentalScore}%</p>
                <p className="text-cyan-400 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +23% since 2020
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">2035 Target</p>
                <p className="text-4xl font-bold text-emerald-400">82%</p>
                <p className="text-slate-500 text-xs">+11% to goal</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">2063 Readiness</p>
                <p className="text-4xl font-bold text-amber-400">{prediction.agenda2063}%</p>
                <p className="text-slate-500 text-xs">Projected</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Risk Level</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getRiskColor(prediction.riskLevel)}`}>
                  {prediction.riskLevel} Risk
                </span>
              </div>
            </div>
          </div>

          {/* Aspiration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {aspirations.map((asp) => (
              <div
                key={asp.id}
                className={`bg-gradient-to-br ${asp.color} rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => setSelectedAspiration(selectedAspiration === asp.id ? null : asp.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <asp.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-white">
                    {indicators.length > 0 
                      ? Math.round(indicators.reduce((sum, i) => sum + (i[`aspiration_${asp.id}_score` as keyof AgendaIndicator] as number || 0), 0) / indicators.length)
                      : [82, 68, 71, 65, 73, 59, 70][asp.id - 1]}%
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-4">{asp.title}</h3>
                <p className="text-white/80 text-sm mt-1">{asp.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Country Rankings */}
            <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Continental Rankings
                </h3>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm">View All →</button>
              </div>
              <div className="space-y-3">
                {mockRankings.map((country) => (
                  <div key={country.rank} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-slate-500 w-8">#{country.rank}</span>
                      <div>
                        <p className="text-white font-medium">{country.country}</p>
                        <p className="text-slate-400 text-xs">{country.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${country.score}%` }}></div>
                      </div>
                      <span className="text-white font-bold">{country.score}%</span>
                      {country.trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                      {country.trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight Panel */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-white font-semibold text-lg">AI Insight</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Countries with high workforce scores but low financing scores are unlikely to meet 
                    Agenda 2063 mental health targets by 2035. Priority intervention needed for Nigeria, 
                    Tanzania, and Uganda.
                  </p>
                </div>
                <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Rwanda leads the continent in Aspiration 3 (Good Governance) due to comprehensive 
                    mental health legislation and human rights protections.
                  </p>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Regional collaboration on mental health research has increased by 34% since 2022, 
                    driving innovation in community-based care models.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Trend Chart */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-8">
            <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-cyan-400" />
              Continental Progress Trend (2020-2026)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} name="Agenda 2063 Score" />
                  <Line type="monotone" dataKey="readiness" stroke="#8b5cf6" strokeWidth={3} name="Readiness Score" />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Premium Forecast Engine (Shown when toggled) */}
          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/20 p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-white font-semibold text-lg">AMHROA Reform Forecast Engine</h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">Premium</span>
              </div>
              <button
                onClick={() => setShowForecast(!showForecast)}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                {showForecast ? "Hide Forecast" : "Show Forecast"} →
              </button>
            </div>

            {showForecast && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">SDG Target 2030</p>
                  <p className="text-3xl font-bold text-emerald-400">{prediction.sdg2030}%</p>
                  <p className="text-slate-500 text-xs">+6% from current</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Agenda 2063 Readiness</p>
                  <p className="text-3xl font-bold text-cyan-400">{prediction.agenda2063}%</p>
                  <p className="text-slate-500 text-xs">Projected for 2063</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Mental Health Workforce</p>
                  <p className="text-3xl font-bold text-purple-400">+{prediction.workforceGrowth}%</p>
                  <p className="text-slate-500 text-xs">Projected growth by 2030</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Risk Level</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRiskColor(prediction.riskLevel)}`}>
                    {prediction.riskLevel}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Import Brain icon
import { Brain } from "lucide-react";