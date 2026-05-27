"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  Globe,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Award,
  Zap,
  Brain,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Map,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Share2,
} from "lucide-react";

// Complete continental data
const fullReformData = [
  { country: "Seychelles", score: 85, region: "Island States", tier: 4, implementation: 82 },
  { country: "Mauritius", score: 85, region: "Island States", tier: 4, implementation: 88 },
  { country: "South Africa", score: 81, region: "Southern Africa", tier: 4, implementation: 75 },
  { country: "Rwanda", score: 77, region: "East Africa", tier: 2, implementation: 65 },
  { country: "Botswana", score: 75, region: "Southern Africa", tier: 4, implementation: 70 },
  { country: "Namibia", score: 73, region: "Southern Africa", tier: 4, implementation: 68 },
  { country: "Kenya", score: 74, region: "East Africa", tier: 2, implementation: 60 },
  { country: "Morocco", score: 72, region: "North Africa", tier: 4, implementation: 65 },
  { country: "Egypt", score: 70, region: "North Africa", tier: 4, implementation: 62 },
  { country: "Cabo Verde", score: 70, region: "West Africa", tier: 4, implementation: 64 },
  { country: "Tunisia", score: 68, region: "North Africa", tier: 4, implementation: 60 },
  { country: "Ghana", score: 68, region: "West Africa", tier: 2, implementation: 55 },
  { country: "Uganda", score: 68, region: "East Africa", tier: 2, implementation: 52 },
  { country: "Nigeria", score: 62, region: "West Africa", tier: 2, implementation: 45 },
  { country: "Zambia", score: 58, region: "Southern Africa", tier: 2, implementation: 48 },
  { country: "Zimbabwe", score: 55, region: "Southern Africa", tier: 2, implementation: 46 },
  { country: "Malawi", score: 52, region: "Southern Africa", tier: 2, implementation: 44 },
  { country: "Gabon", score: 52, region: "Central Africa", tier: 5, implementation: 42 },
  { country: "Algeria", score: 50, region: "North Africa", tier: 3, implementation: 45 },
  { country: "Tanzania", score: 48, region: "East Africa", tier: 5, implementation: 40 },
  { country: "Senegal", score: 48, region: "West Africa", tier: 3, implementation: 42 },
  { country: "Eswatini", score: 48, region: "Southern Africa", tier: 5, implementation: 40 },
  { country: "Lesotho", score: 45, region: "Southern Africa", tier: 5, implementation: 38 },
  { country: "Côte d'Ivoire", score: 45, region: "West Africa", tier: 3, implementation: 40 },
  { country: "Angola", score: 44, region: "Southern Africa", tier: 3, implementation: 38 },
  { country: "Cameroon", score: 42, region: "Central Africa", tier: 3, implementation: 35 },
  { country: "Mozambique", score: 40, region: "Southern Africa", tier: 3, implementation: 36 },
  { country: "The Gambia", score: 38, region: "West Africa", tier: 2, implementation: 30 },
  { country: "Sierra Leone", score: 35, region: "West Africa", tier: 2, implementation: 28 },
  { country: "Liberia", score: 32, region: "West Africa", tier: 2, implementation: 25 },
  { country: "Togo", score: 30, region: "West Africa", tier: 3, implementation: 22 },
  { country: "Djibouti", score: 30, region: "East Africa", tier: 5, implementation: 24 },
  { country: "Comoros", score: 28, region: "Island States", tier: 5, implementation: 20 },
  { country: "Benin", score: 28, region: "West Africa", tier: 3, implementation: 22 },
  { country: "Guinea", score: 28, region: "West Africa", tier: 5, implementation: 20 },
  { country: "Burkina Faso", score: 26, region: "West Africa", tier: 5, implementation: 18 },
  { country: "Mauritania", score: 26, region: "West Africa", tier: 3, implementation: 20 },
  { country: "Madagascar", score: 25, region: "Southern Africa", tier: 3, implementation: 18 },
  { country: "Sudan", score: 25, region: "North Africa", tier: 5, implementation: 20 },
  { country: "Mali", score: 24, region: "West Africa", tier: 3, implementation: 16 },
  { country: "Libya", score: 22, region: "North Africa", tier: 5, implementation: 15 },
  { country: "Equatorial Guinea", score: 22, region: "Central Africa", tier: 1, implementation: 10 },
  { country: "Burundi", score: 22, region: "East Africa", tier: 3, implementation: 12 },
  { country: "Niger", score: 20, region: "West Africa", tier: 3, implementation: 10 },
  { country: "Republic of Congo", score: 20, region: "Central Africa", tier: 1, implementation: 8 },
  { country: "Guinea-Bissau", score: 18, region: "West Africa", tier: 1, implementation: 6 },
  { country: "DR Congo", score: 16, region: "Central Africa", tier: 1, implementation: 5 },
  { country: "Chad", score: 15, region: "Central Africa", tier: 1, implementation: 4 },
  { country: "Eritrea", score: 14, region: "East Africa", tier: 1, implementation: 3 },
  { country: "Somalia", score: 12, region: "East Africa", tier: 1, implementation: 2 },
  { country: "Central African Republic", score: 10, region: "Central Africa", tier: 1, implementation: 2 },
  { country: "South Sudan", score: 8, region: "East Africa", tier: 1, implementation: 1 },
];

const sdgData = [
  { name: "Aligned", value: 32, color: "#10b981" },
  { name: "In Progress", value: 15, color: "#facc15" },
  { name: "Low Progress", value: 7, color: "#ef4444" },
];

const trendData = [
  { year: "2019", reforms: 8, countries: 12, budget: 4.2 },
  { year: "2020", reforms: 10, countries: 15, budget: 4.8 },
  { year: "2021", reforms: 14, countries: 18, budget: 5.5 },
  { year: "2022", reforms: 18, countries: 22, budget: 6.3 },
  { year: "2023", reforms: 22, countries: 28, budget: 7.1 },
  { year: "2024", reforms: 27, countries: 34, budget: 7.8 },
  { year: "2025", reforms: 35, countries: 42, budget: 8.5 },
  { year: "2026", reforms: 44, countries: 48, budget: 9.2 },
];

const regionData = [
  { region: "Southern Africa", avgScore: 58, countries: 12 },
  { region: "North Africa", avgScore: 55, countries: 6 },
  { region: "East Africa", avgScore: 48, countries: 14 },
  { region: "West Africa", avgScore: 42, countries: 16 },
  { region: "Central Africa", avgScore: 28, countries: 8 },
  { region: "Island States", avgScore: 65, countries: 4 },
];

const radarData = [
  { metric: "Legal Framework", value: 65, fullMark: 100 },
  { metric: "Implementation", value: 42, fullMark: 100 },
  { metric: "Funding", value: 28, fullMark: 100 },
  { metric: "Workforce", value: 35, fullMark: 100 },
  { metric: "Community Care", value: 38, fullMark: 100 },
  { metric: "Data Systems", value: 45, fullMark: 100 },
];

const COLORS = ["#0f172a", "#06b6d4", "#10b981", "#facc15", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const [reformData, setReformData] = useState(fullReformData);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedView, setSelectedView] = useState<"countries" | "regions">("countries");
  const [timeRange, setTimeRange] = useState<"5y" | "10y">("5y");
  const [showComparison, setShowComparison] = useState(false);
  const [compareCountry, setCompareCountry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCharts, setExpandedCharts] = useState<string[]>([]);

  const toggleExpand = (chartId: string) => {
    setExpandedCharts(prev =>
      prev.includes(chartId) ? prev.filter(id => id !== chartId) : [...prev, chartId]
    );
  };

  const filteredData = selectedRegion === "all"
    ? reformData
    : reformData.filter(d => d.region === selectedRegion);

  const stats = {
    totalCountries: reformData.length,
    avgScore: Math.round(reformData.reduce((a, b) => a + b.score, 0) / reformData.length),
    highPerformers: reformData.filter(d => d.score >= 70).length,
    crisisCountries: reformData.filter(d => d.score < 30).length,
    totalReports: 156,
    activeCoordinators: 42,
  };

  const topPerformers = [...reformData].sort((a, b) => b.score - a.score).slice(0, 5);
  const bottomPerformers = [...reformData].sort((a, b) => a.score - b.score).slice(0, 5);

  // Filter trend data based on time range
  const filteredTrendData = timeRange === "5y" ? trendData.slice(-5) : trendData;

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
                    CONTINENTAL ANALYTICS HUB
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">Live Intelligence</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Continental Analytics Center
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Real-time Pan-African mental health intelligence and reform analytics with predictive insights.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Export Report</span>
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
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Countries Tracked</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalCountries}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <p className="text-cyan-400 text-xs">Avg Reform Score</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{stats.avgScore}%</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">High Performers</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.highPerformers}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-xs">Crisis Level</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.crisisCountries}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Reports</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.totalReports}</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-orange-400" />
              <p className="text-orange-400 text-xs">Coordinators</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.activeCoordinators}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2 border border-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-sm"
            >
              <option value="all">All Regions</option>
              <option value="Southern Africa">Southern Africa</option>
              <option value="East Africa">East Africa</option>
              <option value="West Africa">West Africa</option>
              <option value="North Africa">North Africa</option>
              <option value="Central Africa">Central Africa</option>
              <option value="Island States">Island States</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2 border border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as "5y" | "10y")}
              className="bg-transparent text-white focus:outline-none text-sm"
            >
              <option value="5y">Last 5 Years</option>
              <option value="10y">Last 10 Years</option>
            </select>
          </div>

          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3 py-2 rounded-xl text-sm transition-colors ${
              showComparison ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Compare Countries
          </button>

          <button
            onClick={() => setSelectedView(selectedView === "countries" ? "regions" : "countries")}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-400 transition-colors"
          >
            View by {selectedView === "countries" ? "Region" : "Country"}
          </button>
        </div>

        {/* Country Comparison */}
        {showComparison && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Country Comparison Tool
              </h3>
              <button onClick={() => setShowComparison(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={compareCountry}
                onChange={(e) => setCompareCountry(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white"
              >
                <option value="">Select Country to Compare</option>
                {reformData.map(c => (
                  <option key={c.country} value={c.country}>{c.country}</option>
                ))}
              </select>
            </div>
            {compareCountry && (
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-slate-300 text-sm">Comparison feature coming soon. Selected: {compareCountry}</p>
              </div>
            )}
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart - Reform Scores */}
          <div className={`bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden transition-all ${expandedCharts.includes("bar") ? "lg:col-span-2" : ""}`}>
            <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Reform Scores by {selectedView === "countries" ? "Country" : "Region"}
              </h3>
              <button onClick={() => toggleExpand("bar")} className="p-1 hover:bg-slate-700 rounded">
                {expandedCharts.includes("bar") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="p-6" style={{ height: expandedCharts.includes("bar") ? 500 : 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                {selectedView === "countries" ? (
                  <BarChart data={filteredData.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="country" angle={-45} textAnchor="end" height={80} tick={{ fill: '#94a3b8' }} />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                    <Legend />
                    <Bar dataKey="score" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="implementation" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="region" tick={{ fill: '#94a3b8' }} />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                    <Bar dataKey="avgScore" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - SDG Alignment */}
          <div className={`bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden transition-all ${expandedCharts.includes("pie") ? "lg:col-span-2" : ""}`}>
            <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-cyan-400" />
                SDG Alignment Progress
              </h3>
              <button onClick={() => toggleExpand("pie")} className="p-1 hover:bg-slate-700 rounded">
                {expandedCharts.includes("pie") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="p-6" style={{ height: expandedCharts.includes("pie") ? 500 : 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sdgData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sdgData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart - Trend */}
          <div className={`bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden transition-all ${expandedCharts.includes("line") ? "lg:col-span-2" : ""}`}>
            <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-cyan-400" />
                Reform Growth Trend
              </h3>
              <button onClick={() => toggleExpand("line")} className="p-1 hover:bg-slate-700 rounded">
                {expandedCharts.includes("line") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="p-6" style={{ height: expandedCharts.includes("line") ? 500 : 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="reforms" stroke="#06b6d4" strokeWidth={3} name="Reforms Initiated" />
                  <Line yAxisId="left" type="monotone" dataKey="countries" stroke="#10b981" strokeWidth={3} name="Countries Engaged" />
                  <Area yAxisId="right" type="monotone" dataKey="budget" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Budget ($B)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart - Continental Health */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Continental Health Metrics
              </h3>
            </div>
            <div className="p-6" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                  <Radar name="Continental Avg" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top and Bottom Performers */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Top 5 Performers
              </h3>
            </div>
            <div className="divide-y divide-slate-700">
              {topPerformers.map((country, idx) => (
                <div key={country.country} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-sm font-mono">#{idx + 1}</span>
                    <span className="text-white font-medium">{country.country}</span>
                    <span className="text-slate-400 text-xs">{country.region}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${country.score}%` }}></div>
                    </div>
                    <span className="text-emerald-400 font-bold">{country.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Bottom 5 - Crisis Priority
              </h3>
            </div>
            <div className="divide-y divide-slate-700">
              {bottomPerformers.map((country, idx) => (
                <div key={country.country} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-sm font-mono">#{idx + 1}</span>
                    <span className="text-white font-medium">{country.country}</span>
                    <span className="text-slate-400 text-xs">{country.region}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${country.score}%` }}></div>
                    </div>
                    <span className="text-red-400 font-bold">{country.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Footer */}
        <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 p-6">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">AI-Powered Continental Insights</h3>
              <p className="text-slate-300">
                Based on current data, the continent shows a <span className="text-emerald-400 font-semibold">+18% year-over-year growth</span> in reform initiatives.
                <span className="text-cyan-400 font-semibold"> Southern Africa</span> leads with average score of 58%, while
                <span className="text-red-400 font-semibold"> Central Africa</span> requires urgent intervention.
                Projected continental average by 2026: <span className="text-purple-400 font-semibold">52%</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}