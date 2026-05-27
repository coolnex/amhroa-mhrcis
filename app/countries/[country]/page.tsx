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

interface CountryProfile {
  id: number;
  country_name: string;
  region: string;
  capital: string;
  population: number;
  reform_score: number;
  reform_status: string;
  reform_tier: string;
  legislation_status: string;
  suicide_status: string;
  suicide_decriminalized: boolean;
  workforce_data: string;
  psychiatrists_per_100k: number;
  nurses_per_100k: number;
  psychologists_per_100k: number;
  social_workers_per_100k: number;
  sdg_alignment: string;
  sdg_3_4_score: number;
  sdg_10_2_score: number;
  sdg_16_3_score: number;
  organizations_count: number;
  coordinator_name: string;
  coordinator_email: string;
  coordinator_phone: string;
  last_updated: string;
  key_challenges: string[];
  key_achievements: string[];
  funding_gap: number;
  current_funding: number;
  historical_scores: { year: number; score: number }[];
  priority_level: "🔥" | "⚡" | "🌱";
  ai_recommendations: string[];
}

// Mock data for demonstration
const mockCountryProfile: CountryProfile = {
  id: 1,
  country_name: "Kenya",
  region: "East Africa",
  capital: "Nairobi",
  population: 53.8,
  reform_score: 74,
  reform_status: "Moderate Reform",
  reform_tier: "Tier 2 - Law Exists / Limited Implementation",
  legislation_status: "Mental Health Act 2019 - Modern legal framework aligned with WHO standards. Devolution has enabled county-level innovation and integration into Universal Health Coverage.",
  suicide_status: "Suicide decriminalized in 2019. National suicide prevention strategy being developed with WHO support.",
  suicide_decriminalized: true,
  workforce_data: "Psychiatrists: 0.5 per 100k, Nurses: 3.2 per 100k, Psychologists: 1.8 per 100k, Social workers: 2.1 per 100k",
  psychiatrists_per_100k: 0.5,
  nurses_per_100k: 3.2,
  psychologists_per_100k: 1.8,
  social_workers_per_100k: 2.1,
  sdg_alignment: "Strong alignment with SDG 3.4 (mental health), SDG 10.2 (social inclusion), and SDG 16.3 (rule of law). National policies increasingly incorporating SDG targets.",
  sdg_3_4_score: 68,
  sdg_10_2_score: 55,
  sdg_16_3_score: 72,
  organizations_count: 45,
  coordinator_name: "Dr. James Mwangi",
  coordinator_email: "james.mwangi@mentalhealth.go.ke",
  coordinator_phone: "+254 712 345 678",
  last_updated: "2024-03-15",
  key_challenges: [
    "Uneven implementation across 47 counties",
    "Severe shortage of psychiatrists (0.5 per 100k)",
    "Limited community-based services",
    "Stigma remains high in rural areas",
    "Inadequate funding for mental health programs",
  ],
  key_achievements: [
    "Modern legal framework aligned with WHO standards",
    "Devolution has enabled county-level innovation",
    "Strong civil society engagement and advocacy",
    "Mental health integrated into Universal Health Coverage",
    "National Mental Health Taskforce established",
  ],
  funding_gap: 85000000,
  current_funding: 35000000,
  historical_scores: [
    { year: 2019, score: 58 },
    { year: 2020, score: 62 },
    { year: 2021, score: 65 },
    { year: 2022, score: 68 },
    { year: 2023, score: 71 },
    { year: 2024, score: 74 },
  ],
  priority_level: "🔥",
  ai_recommendations: [
    "Accelerate county-level implementation through dedicated technical assistance",
    "Expand community health worker training on mental health",
    "Increase mental health budget allocation to 5% of health budget",
    "Launch national anti-stigma campaign targeting rural populations",
    "Establish telepsychiatry network to reach underserved areas",
    "Strengthen data collection and monitoring systems",
  ],
};

const radarData = (country: CountryProfile) => [
  { metric: "Legal Framework", value: country.sdg_16_3_score, fullMark: 100 },
  { metric: "Implementation", value: country.reform_score, fullMark: 100 },
  { metric: "Workforce", value: country.psychiatrists_per_100k * 20, fullMark: 100 },
  { metric: "Funding", value: (country.current_funding / (country.current_funding + country.funding_gap)) * 100, fullMark: 100 },
  { metric: "SDG 3.4", value: country.sdg_3_4_score, fullMark: 100 },
  { metric: "Community Care", value: country.sdg_10_2_score, fullMark: 100 },
];

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

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "🔥": return <div className="px-2 py-1 bg-red-500/20 rounded-lg text-red-400 text-sm">🔥 Urgent Priority</div>;
    case "⚡": return <div className="px-2 py-1 bg-yellow-500/20 rounded-lg text-yellow-400 text-sm">⚡ High Impact</div>;
    case "🌱": return <div className="px-2 py-1 bg-emerald-500/20 rounded-lg text-emerald-400 text-sm">🌱 Model System</div>;
    default: return null;
  }
};

export default function CountryProfilePage() {
  const params = useParams();
  const countrySlug = params.country as string;
  const [country, setCountry] = useState<CountryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "workforce" | "sdg" | "recommendations">("overview");

  useEffect(() => {
    fetchCountry();
  }, [countrySlug]);

  const fetchCountry = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/countries/${encodeURIComponent(countrySlug)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.country) {
          setCountry(data.country);
        } else {
          setCountry(mockCountryProfile);
        }
      } else {
        setCountry(mockCountryProfile);
      }
    } catch (error) {
      console.error("Error fetching country:", error);
      setCountry(mockCountryProfile);
    } finally {
      setLoading(false);
    }
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

  if (!country) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Country not found</h1>
          <p className="text-slate-400">The requested country profile could not be located.</p>
          <Link href="/countries" className="inline-block mt-6 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors">
            Back to Countries
          </Link>
        </div>
      </div>
    );
  }

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
                {getPriorityIcon(country.priority_level)}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {country.country_name}
              </h1>
              <div className="flex flex-wrap gap-4 mt-3">
                <p className="text-slate-300 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  {country.region} · Capital: {country.capital}
                </p>
                <p className="text-slate-300 flex items-center gap-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Population: {country.population}M
                </p>
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last updated: {new Date(country.last_updated).toLocaleDateString()}
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
                <div className={`w-32 h-32 rounded-full ${getScoreBgColor(country.reform_score)} flex items-center justify-center mx-auto md:mx-0`}>
                  <span className={`text-5xl font-bold ${getScoreColor(country.reform_score)}`}>
                    {country.reform_score}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-2">/100</p>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-lg">{country.reform_status}</p>
                <p className="text-slate-400 text-sm mt-1">{country.reform_tier}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300 text-sm">Continental Rank: #12 / 54</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300 text-sm">+16% since 2019</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-2">Funding Status</p>
            <div className="flex justify-between mb-2">
              <span className="text-white text-sm">Current Funding</span>
              <span className="text-cyan-400 font-bold">${(country.current_funding / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-white text-sm">Funding Gap</span>
              <span className="text-red-400 font-bold">${(country.funding_gap / 1000000).toFixed(1)}M</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(country.current_funding / (country.current_funding + country.funding_gap)) * 100}%` }}></div>
            </div>
            <p className="text-slate-500 text-xs mt-2">{(country.current_funding / (country.current_funding + country.funding_gap) * 100).toFixed(0)}% funded</p>
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
            onClick={() => setActiveTab("workforce")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "workforce"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Workforce
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
            SDG Alignment
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "recommendations"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Star className="w-4 h-4" />
            AI Recommendations
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Legislation & Suicide Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-semibold text-lg">Legislation Status</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">{country.legislation_status}</p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-semibold text-lg">Suicide Decriminalization</h3>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {country.suicide_decriminalized ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                  <span className="text-white">
                    {country.suicide_decriminalized ? "Decriminalized" : "Not Decriminalized"}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{country.suicide_status}</p>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Continental Benchmarking Radar
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData(country)}>
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

            {/* Historical Trend */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-cyan-400" />
                Reform Progress Trend (2019-2024)
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={country.historical_scores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" tick={{ fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                    <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 6 }} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Achievements & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-white font-semibold text-lg">Key Achievements</h3>
                </div>
                <ul className="space-y-2">
                  {country.key_achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-500/5 rounded-2xl border border-red-500/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-white font-semibold text-lg">Key Challenges</h3>
                </div>
                <ul className="space-y-2">
                  {country.key_challenges.map((challenge, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Workforce Tab */}
        {activeTab === "workforce" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Psychiatrists</p>
                <p className="text-3xl font-bold text-white">{country.psychiatrists_per_100k}</p>
                <p className="text-slate-500 text-xs">per 100,000 population</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Mental Health Nurses</p>
                <p className="text-3xl font-bold text-white">{country.nurses_per_100k}</p>
                <p className="text-slate-500 text-xs">per 100,000 population</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Psychologists</p>
                <p className="text-3xl font-bold text-white">{country.psychologists_per_100k}</p>
                <p className="text-slate-500 text-xs">per 100,000 population</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Social Workers</p>
                <p className="text-3xl font-bold text-white">{country.social_workers_per_100k}</p>
                <p className="text-slate-500 text-xs">per 100,000 population</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Workforce Analysis
              </h3>
              <p className="text-slate-300 leading-relaxed">{country.workforce_data}</p>
              <div className="mt-4 p-4 bg-slate-700/30 rounded-xl">
                <p className="text-yellow-400 text-sm font-semibold mb-2">Critical Gap</p>
                <p className="text-slate-300 text-sm">
                  WHO recommends minimum of 1 psychiatrist per 100,000 population. {country.country_name} currently has 
                  {country.psychiatrists_per_100k} per 100,000, representing a shortage of {Math.max(0, 1 - country.psychiatrists_per_100k).toFixed(1)} per 100,000.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SDG Tab */}
        {activeTab === "sdg" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Target className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">SDG 3.4</p>
                <p className="text-3xl font-bold text-white">{country.sdg_3_4_score}%</p>
                <p className="text-slate-500 text-xs">Mental Health & NCDs</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">SDG 10.2</p>
                <p className="text-3xl font-bold text-white">{country.sdg_10_2_score}%</p>
                <p className="text-slate-500 text-xs">Social Inclusion</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">SDG 16.3</p>
                <p className="text-3xl font-bold text-white">{country.sdg_16_3_score}%</p>
                <p className="text-slate-500 text-xs">Rule of Law</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                SDG Alignment Assessment
              </h3>
              <p className="text-slate-300 leading-relaxed">{country.sdg_alignment}</p>
            </div>

            {/* SDG Progress Bars */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">SDG Progress Tracking</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-sm">SDG 3.4 - Mental Health Coverage</span>
                    <span className="text-emerald-400 text-sm">{country.sdg_3_4_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${country.sdg_3_4_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-sm">SDG 10.2 - Social & Economic Inclusion</span>
                    <span className="text-blue-400 text-sm">{country.sdg_10_2_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${country.sdg_10_2_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400 text-sm">SDG 16.3 - Rule of Law & Access to Justice</span>
                    <span className="text-purple-400 text-sm">{country.sdg_16_3_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${country.sdg_16_3_score}%` }}></div>
                  </div>
                </div>
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
              {country.ai_recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-cyan-500/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 text-sm font-bold">{idx + 1}</span>
                  </div>
                  <p className="text-slate-300 flex-1">{rec}</p>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-cyan-400" />
                Implementation Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-24 text-cyan-400 text-sm">Short-term</div>
                  <div className="flex-1">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">0-6 months: Priority 1-2 recommendations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 text-yellow-400 text-sm">Medium-term</div>
                  <div className="flex-1">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "50%" }}></div>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">6-18 months: Recommendations 3-4</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 text-emerald-400 text-sm">Long-term</div>
                  <div className="flex-1">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">18-36 months: Recommendations 5-6</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coordinator & Organizations Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold text-lg">Country Coordinator</h3>
            </div>
            <p className="text-white font-medium">{country.coordinator_name}</p>
            <div className="mt-3 space-y-2">
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {country.coordinator_email}
              </p>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {country.coordinator_phone}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold text-lg">Civil Society Presence</h3>
            </div>
            <p className="text-4xl font-bold text-white">{country.organizations_count}</p>
            <p className="text-slate-400 text-sm mt-1">Active CSOs and NGOs</p>
            <Link
              href={`/organizations?country=${encodeURIComponent(country.country_name)}`}
              className="inline-flex items-center gap-1 mt-3 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              View all organizations
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import Brain icon if not already in lucide-react
import { Brain } from "lucide-react";