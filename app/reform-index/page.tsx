"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Download,
  Search,
  Eye,
  Target,
  Globe,
  PieChart as PieChartIcon,
  Flame,
  Zap,
  Leaf,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ============================================================================
// DATA STRUCTURES
// ============================================================================

interface CountryReformData {
  name: string;
  region: string;
  tier: 1 | 2 | 3 | 4 | 5;
  law: "has" | "outdated" | "none";
  implementation: "green" | "yellow" | "red";
  budget: "high" | "medium" | "low";
  score: number;
  priority: "🔥" | "⚡" | "🌱";
  strategy: string;
  population: number;
  psychiatristsPer100k: number;
  bedsPer100k: number;
}

// Complete continental data (54 countries)
const continentalReformData: CountryReformData[] = [
  // TIER 1: SYSTEM FAILURE / NO LAW / NO IMPLEMENTATION
  { name: "Somalia", region: "East Africa", tier: 1, law: "none", implementation: "red", budget: "low", score: 12, priority: "🔥", strategy: "Emergency mental health policy + humanitarian integration", population: 15.9, psychiatristsPer100k: 0.2, bedsPer100k: 2.5 },
  { name: "South Sudan", region: "East Africa", tier: 1, law: "none", implementation: "red", budget: "low", score: 8, priority: "🔥", strategy: "Build from scratch (policy + workforce)", population: 11.2, psychiatristsPer100k: 0.1, bedsPer100k: 1.2 },
  { name: "Chad", region: "Central Africa", tier: 1, law: "none", implementation: "red", budget: "low", score: 15, priority: "🔥", strategy: "Policy development + WHO engagement", population: 16.4, psychiatristsPer100k: 0.15, bedsPer100k: 2.0 },
  { name: "Central African Republic", region: "Central Africa", tier: 1, law: "none", implementation: "red", budget: "low", score: 10, priority: "🔥", strategy: "Integrate into primary healthcare", population: 4.8, psychiatristsPer100k: 0.1, bedsPer100k: 1.5 },
  { name: "Eritrea", region: "East Africa", tier: 1, law: "none", implementation: "red", budget: "low", score: 14, priority: "🔥", strategy: "Policy advocacy via AU/WHO channels", population: 3.5, psychiatristsPer100k: 0.2, bedsPer100k: 3.0 },
  { name: "Guinea-Bissau", region: "West Africa", tier: 1, law: "none", implementation: "red", budget: "low", score: 18, priority: "🔥", strategy: "Regional policy support (ECOWAS)", population: 2.0, psychiatristsPer100k: 0.3, bedsPer100k: 4.0 },
  { name: "DR Congo", region: "Central Africa", tier: 1, law: "none", implementation: "red", budget: "low", score: 16, priority: "🔥", strategy: "National law + decentralization strategy", population: 89.6, psychiatristsPer100k: 0.1, bedsPer100k: 1.8 },
  { name: "Republic of Congo", region: "Central Africa", tier: 1, law: "none", implementation: "red", budget: "low", score: 20, priority: "🔥", strategy: "Legislative advocacy", population: 5.5, psychiatristsPer100k: 0.25, bedsPer100k: 3.5 },
  { name: "Equatorial Guinea", region: "Central Africa", tier: 1, law: "none", implementation: "red", budget: "low", score: 22, priority: "🔥", strategy: "Policy initiation + technical support", population: 1.4, psychiatristsPer100k: 0.3, bedsPer100k: 5.0 },
  
  // TIER 2: LAW EXISTS BUT MINIMAL IMPLEMENTATION
  { name: "Nigeria", region: "West Africa", tier: 2, law: "has", implementation: "yellow", budget: "low", score: 62, priority: "🔥", strategy: "Domestication + state-level rollout + funding", population: 218.6, psychiatristsPer100k: 0.4, bedsPer100k: 8.0 },
  { name: "Kenya", region: "East Africa", tier: 2, law: "has", implementation: "yellow", budget: "low", score: 74, priority: "🔥", strategy: "Devolution + county-level implementation", population: 53.8, psychiatristsPer100k: 0.5, bedsPer100k: 10.5 },
  { name: "Uganda", region: "East Africa", tier: 2, law: "has", implementation: "yellow", budget: "low", score: 68, priority: "🔥", strategy: "Community mental health scale-up", population: 45.9, psychiatristsPer100k: 0.4, bedsPer100k: 9.0 },
  { name: "Ethiopia", region: "East Africa", tier: 2, law: "has", implementation: "yellow", budget: "low", score: 65, priority: "🔥", strategy: "Integrate into PHC + workforce expansion", population: 117.9, psychiatristsPer100k: 0.3, bedsPer100k: 7.5 },
  { name: "Ghana", region: "West Africa", tier: 2, law: "has", implementation: "yellow", budget: "medium", score: 68, priority: "⚡", strategy: "Strengthen Mental Health Authority", population: 32.8, psychiatristsPer100k: 0.6, bedsPer100k: 12.0 },
  { name: "Sierra Leone", region: "West Africa", tier: 2, law: "has", implementation: "red", budget: "low", score: 35, priority: "🔥", strategy: "Post-law operational structures", population: 8.2, psychiatristsPer100k: 0.2, bedsPer100k: 4.5 },
  { name: "Liberia", region: "West Africa", tier: 2, law: "has", implementation: "red", budget: "low", score: 32, priority: "🔥", strategy: "System rebuilding + donor alignment", population: 5.2, psychiatristsPer100k: 0.2, bedsPer100k: 5.0 },
  { name: "The Gambia", region: "West Africa", tier: 2, law: "has", implementation: "red", budget: "low", score: 38, priority: "🔥", strategy: "Implementation framework development", population: 2.4, psychiatristsPer100k: 0.3, bedsPer100k: 6.0 },
  { name: "Rwanda", region: "East Africa", tier: 2, law: "has", implementation: "yellow", budget: "medium", score: 77, priority: "⚡", strategy: "Scale community services", population: 13.3, psychiatristsPer100k: 0.8, bedsPer100k: 15.0 },
  { name: "Zambia", region: "Southern Africa", tier: 2, law: "has", implementation: "yellow", budget: "low", score: 58, priority: "🔥", strategy: "Conference leverage for national reform", population: 18.4, psychiatristsPer100k: 0.4, bedsPer100k: 8.0 },
  { name: "Malawi", region: "Southern Africa", tier: 2, law: "has", implementation: "yellow", budget: "low", score: 52, priority: "🔥", strategy: "Workforce + PHC integration", population: 19.1, psychiatristsPer100k: 0.3, bedsPer100k: 7.0 },
  { name: "Zimbabwe", region: "Southern Africa", tier: 2, law: "has", implementation: "yellow", budget: "low", score: 55, priority: "🔥", strategy: "Policy-to-service transition", population: 14.9, psychiatristsPer100k: 0.4, bedsPer100k: 9.0 },
  
  // TIER 3: OUTDATED LAWS
  { name: "Cameroon", region: "Central Africa", tier: 3, law: "outdated", implementation: "yellow", budget: "low", score: 42, priority: "🔥", strategy: "Law reform advocacy", population: 27.2, psychiatristsPer100k: 0.3, bedsPer100k: 6.5 },
  { name: "Senegal", region: "West Africa", tier: 3, law: "outdated", implementation: "yellow", budget: "low", score: 48, priority: "⚡", strategy: "Policy update + decentralization", population: 16.7, psychiatristsPer100k: 0.5, bedsPer100k: 10.0 },
  { name: "Côte d'Ivoire", region: "West Africa", tier: 3, law: "outdated", implementation: "yellow", budget: "low", score: 45, priority: "⚡", strategy: "Legal modernization", population: 27.5, psychiatristsPer100k: 0.4, bedsPer100k: 8.5 },
  { name: "Togo", region: "West Africa", tier: 3, law: "outdated", implementation: "red", budget: "low", score: 30, priority: "🔥", strategy: "Reform + system strengthening", population: 8.5, psychiatristsPer100k: 0.3, bedsPer100k: 5.0 },
  { name: "Benin", region: "West Africa", tier: 3, law: "outdated", implementation: "red", budget: "low", score: 28, priority: "🔥", strategy: "Policy overhaul", population: 12.7, psychiatristsPer100k: 0.3, bedsPer100k: 4.5 },
  { name: "Madagascar", region: "Southern Africa", tier: 3, law: "outdated", implementation: "red", budget: "low", score: 25, priority: "🔥", strategy: "National law reform", population: 28.2, psychiatristsPer100k: 0.2, bedsPer100k: 3.0 },
  { name: "Mozambique", region: "Southern Africa", tier: 3, law: "outdated", implementation: "yellow", budget: "low", score: 40, priority: "⚡", strategy: "Update + implementation", population: 32.4, psychiatristsPer100k: 0.3, bedsPer100k: 6.0 },
  { name: "Angola", region: "Southern Africa", tier: 3, law: "outdated", implementation: "yellow", budget: "low", score: 44, priority: "⚡", strategy: "Reform + workforce investment", population: 33.9, psychiatristsPer100k: 0.4, bedsPer100k: 7.0 },
  { name: "Algeria", region: "North Africa", tier: 3, law: "outdated", implementation: "yellow", budget: "medium", score: 50, priority: "⚡", strategy: "Align with human rights", population: 44.2, psychiatristsPer100k: 0.7, bedsPer100k: 11.0 },
  { name: "Burundi", region: "East Africa", tier: 3, law: "outdated", implementation: "red", budget: "low", score: 22, priority: "🔥", strategy: "Reform + basic services", population: 12.2, psychiatristsPer100k: 0.2, bedsPer100k: 2.5 },
  { name: "Niger", region: "West Africa", tier: 3, law: "outdated", implementation: "red", budget: "low", score: 20, priority: "🔥", strategy: "Law + system establishment", population: 25.3, psychiatristsPer100k: 0.2, bedsPer100k: 2.0 },
  { name: "Mali", region: "West Africa", tier: 3, law: "outdated", implementation: "red", budget: "low", score: 24, priority: "🔥", strategy: "Conflict-sensitive reform", population: 21.9, psychiatristsPer100k: 0.2, bedsPer100k: 3.0 },
  { name: "Mauritania", region: "West Africa", tier: 3, law: "outdated", implementation: "red", budget: "low", score: 26, priority: "🔥", strategy: "Policy development", population: 4.7, psychiatristsPer100k: 0.3, bedsPer100k: 4.0 },
  
  // TIER 4: MODERATE SYSTEMS
  { name: "South Africa", region: "Southern Africa", tier: 4, law: "has", implementation: "green", budget: "medium", score: 81, priority: "⚡", strategy: "Equity + community care", population: 60.1, psychiatristsPer100k: 1.2, bedsPer100k: 25.0 },
  { name: "Egypt", region: "North Africa", tier: 4, law: "has", implementation: "yellow", budget: "medium", score: 70, priority: "⚡", strategy: "Decentralization", population: 104.3, psychiatristsPer100k: 0.8, bedsPer100k: 18.0 },
  { name: "Morocco", region: "North Africa", tier: 4, law: "has", implementation: "yellow", budget: "medium", score: 72, priority: "⚡", strategy: "Community-based care", population: 37.1, psychiatristsPer100k: 0.9, bedsPer100k: 20.0 },
  { name: "Tunisia", region: "North Africa", tier: 4, law: "has", implementation: "yellow", budget: "medium", score: 68, priority: "⚡", strategy: "System reform", population: 11.9, psychiatristsPer100k: 1.0, bedsPer100k: 22.0 },
  { name: "Botswana", region: "Southern Africa", tier: 4, law: "has", implementation: "yellow", budget: "medium", score: 75, priority: "⚡", strategy: "Workforce expansion", population: 2.6, psychiatristsPer100k: 0.8, bedsPer100k: 19.0 },
  { name: "Namibia", region: "Southern Africa", tier: 4, law: "has", implementation: "yellow", budget: "medium", score: 73, priority: "⚡", strategy: "Service decentralization", population: 2.6, psychiatristsPer100k: 0.7, bedsPer100k: 17.0 },
  { name: "Mauritius", region: "Island States", tier: 4, law: "has", implementation: "green", budget: "high", score: 85, priority: "🌱", strategy: "Model system strengthening", population: 1.3, psychiatristsPer100k: 1.8, bedsPer100k: 35.0 },
  { name: "Cabo Verde", region: "West Africa", tier: 4, law: "has", implementation: "yellow", budget: "medium", score: 70, priority: "⚡", strategy: "Scale services", population: 0.6, psychiatristsPer100k: 0.6, bedsPer100k: 14.0 },
  
  // TIER 5: SMALL STATES
  { name: "Seychelles", region: "Island States", tier: 5, law: "has", implementation: "green", budget: "medium", score: 82, priority: "🌱", strategy: "Sustain + innovation", population: 0.1, psychiatristsPer100k: 1.5, bedsPer100k: 40.0 },
  { name: "Comoros", region: "Island States", tier: 5, law: "outdated", implementation: "red", budget: "low", score: 28, priority: "🔥", strategy: "Law reform", population: 0.9, psychiatristsPer100k: 0.3, bedsPer100k: 3.0 },
  { name: "Djibouti", region: "East Africa", tier: 5, law: "outdated", implementation: "red", budget: "low", score: 30, priority: "🔥", strategy: "System development", population: 1.0, psychiatristsPer100k: 0.3, bedsPer100k: 4.0 },
  { name: "Lesotho", region: "Southern Africa", tier: 5, law: "outdated", implementation: "yellow", budget: "low", score: 45, priority: "⚡", strategy: "Legal update", population: 2.2, psychiatristsPer100k: 0.4, bedsPer100k: 8.0 },
  { name: "Eswatini", region: "Southern Africa", tier: 5, law: "outdated", implementation: "yellow", budget: "low", score: 48, priority: "⚡", strategy: "Reform + services", population: 1.2, psychiatristsPer100k: 0.4, bedsPer100k: 9.0 },
  { name: "Sudan", region: "North Africa", tier: 5, law: "outdated", implementation: "red", budget: "low", score: 25, priority: "🔥", strategy: "Reform in fragile context", population: 44.9, psychiatristsPer100k: 0.2, bedsPer100k: 3.5 },
  { name: "Libya", region: "North Africa", tier: 5, law: "outdated", implementation: "red", budget: "low", score: 22, priority: "🔥", strategy: "System rebuilding", population: 6.9, psychiatristsPer100k: 0.3, bedsPer100k: 4.0 },
  { name: "Tanzania", region: "East Africa", tier: 5, law: "outdated", implementation: "yellow", budget: "low", score: 48, priority: "⚡", strategy: "Law reform + PHC", population: 61.5, psychiatristsPer100k: 0.3, bedsPer100k: 6.0 },
  { name: "Gabon", region: "Central Africa", tier: 5, law: "outdated", implementation: "yellow", budget: "medium", score: 52, priority: "⚡", strategy: "Legal modernization", population: 2.3, psychiatristsPer100k: 0.5, bedsPer100k: 10.0 },
  { name: "Guinea", region: "West Africa", tier: 5, law: "outdated", implementation: "red", budget: "low", score: 28, priority: "🔥", strategy: "Reform + awareness", population: 13.5, psychiatristsPer100k: 0.2, bedsPer100k: 3.0 },
  { name: "Burkina Faso", region: "West Africa", tier: 5, law: "outdated", implementation: "red", budget: "low", score: 26, priority: "🔥", strategy: "Policy + service rollout", population: 21.5, psychiatristsPer100k: 0.2, bedsPer100k: 2.5 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTierConfig = (tier: number) => {
  const configs: Record<number, { label: string; bg: string; border: string; text: string }> = {
    1: { label: "System Failure", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
    2: { label: "Law Exists / No Impl", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
    3: { label: "Outdated Laws", bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" },
    4: { label: "Moderate Systems", bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
    5: { label: "Small States", bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  };
  return configs[tier] || configs[2];
};

const getImplementationColor = (impl: string) => {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    green: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Partial Implementation" },
    yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Minimal Implementation" },
    red: { bg: "bg-red-500/20", text: "text-red-400", label: "No Implementation" },
  };
  return colors[impl];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReformIntelligencePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedTier, setSelectedTier] = useState<number | "all">("all");
  const [selectedCountry, setSelectedCountry] = useState<CountryReformData | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const regions = ["all", ...new Set(continentalReformData.map(c => c.region))];

  const filteredData = useMemo(() => {
    return continentalReformData.filter(country => {
      const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === "all" || country.region === selectedRegion;
      const matchesTier = selectedTier === "all" || country.tier === selectedTier;
      return matchesSearch && matchesRegion && matchesTier;
    });
  }, [searchTerm, selectedRegion, selectedTier]);

  const stats = useMemo(() => {
    const total = continentalReformData.length;
    const tier1 = continentalReformData.filter(c => c.tier === 1).length;
    const tier2 = continentalReformData.filter(c => c.tier === 2).length;
    const tier3 = continentalReformData.filter(c => c.tier === 3).length;
    const tier4 = continentalReformData.filter(c => c.tier === 4).length;
    const hasLaw = continentalReformData.filter(c => c.law === "has").length;
    const greenImpl = continentalReformData.filter(c => c.implementation === "green").length;
    
    return { total, tier1, tier2, tier3, tier4, hasLaw, greenImpl };
  }, []);

  const tierDistribution = [
    { name: "Tier 1: System Failure", count: stats.tier1, color: "#ef4444" },
    { name: "Tier 2: Law/No Impl", count: stats.tier2, color: "#f97316" },
    { name: "Tier 3: Outdated Laws", count: stats.tier3, color: "#eab308" },
    { name: "Tier 4: Moderate Systems", count: stats.tier4, color: "#3b82f6" },
  ];

  const topPerformers = [...continentalReformData].sort((a, b) => b.score - a.score).slice(0, 10);
  const bottomPerformers = [...continentalReformData].sort((a, b) => a.score - b.score).slice(0, 10);
  
  const urgentCount = stats.tier1 + stats.tier2 + stats.tier3;
  const urgentPercent = Math.round((urgentCount / stats.total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-8 py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">LIVE CONTINENTAL INTELLIGENCE</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-xs">Real-time data • {stats.total} countries</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Africa Mental Health Reform Intelligence
              </h1>
              <p className="text-slate-300 text-lg mt-4 max-w-3xl">
                Africa does not have a mental health awareness problem — it has a <span className="text-cyan-400 font-semibold">systems implementation crisis</span>. 
                Only {Math.round((stats.greenImpl / stats.hasLaw) * 100)}% of countries with modern laws have fully implemented them.
              </p>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm">Export Report</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-xl border border-cyan-500/20">
            <div className="flex items-center gap-3 flex-wrap">
              <Target className="w-5 h-5 text-cyan-400" />
              <p className="text-sm text-slate-300">
                <span className="text-cyan-400 font-semibold">NDOLA STRATEGY:</span> Launch the Africa Mental Health Scorecard Dashboard & Ndola Declaration — moving Africa from commitments to care.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Countries Tracked</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">🔥 Tier 1</p>
            <p className="text-2xl md:text-3xl font-bold text-red-400">{stats.tier1}</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
            <p className="text-orange-400 text-xs">⚡ Tier 2</p>
            <p className="text-2xl md:text-3xl font-bold text-orange-400">{stats.tier2}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs">⚠️ Tier 3</p>
            <p className="text-2xl md:text-3xl font-bold text-yellow-400">{stats.tier3}</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Modern Laws</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{stats.hasLaw}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">✅ Implemented</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-400">{stats.greenImpl}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
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
            <option value="all">All Regions</option>
            {regions.filter(r => r !== "all").map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value === "all" ? "all" : parseInt(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Tiers</option>
            <option value={1}>Tier 1: System Failure 🔥</option>
            <option value={2}>Tier 2: Law/No Impl ⚡</option>
            <option value={3}>Tier 3: Outdated Laws ⚠️</option>
            <option value={4}>Tier 4: Moderate Systems</option>
          </select>

          <div className="flex bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === "grid" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === "table" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-cyan-400" />
              Continental Crisis Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="count"
                    label={({ name, percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-slate-400 text-xs text-center mt-4">
              {urgentCount} countries ({urgentPercent}%) require urgent intervention
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Top 10 Reform Performers
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPerformers} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Performers */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-8">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400" />
            Crisis Alert: Bottom 10 Performers (Critical Intervention Needed)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottomPerformers} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="score" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Countries View */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Country Reform Intelligence
              <span className="text-slate-400 text-sm font-normal ml-2">({filteredData.length} countries)</span>
            </h3>
          </div>

          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Region</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Tier</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Law</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Implementation</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Score</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((country) => {
                    const tierConfig = getTierConfig(country.tier);
                    const implColor = getImplementationColor(country.implementation);
                    return (
                      <tr key={country.name} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 font-medium text-white">{country.name}</td>
                        <td className="p-4 text-slate-300 text-sm">{country.region}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${tierConfig.bg} ${tierConfig.text}`}>
                            {tierConfig.label}
                          </span>
                        </td>
                        <td className="p-4">
                          {country.law === "has" ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : 
                           country.law === "outdated" ? <AlertCircle className="w-5 h-5 text-yellow-400" /> :
                           <XCircle className="w-5 h-5 text-red-400" />}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${implColor.bg} ${implColor.text}`}>
                            {implColor.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-700 rounded-full h-2">
                              <div className={`h-2 rounded-full ${country.score >= 70 ? "bg-emerald-500" : country.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${country.score}%` }}></div>
                            </div>
                            <span className="text-white text-sm font-mono">{country.score}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedCountry(country)}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {filteredData.map((country) => {
                const tierConfig = getTierConfig(country.tier);
                return (
                  <div
                    key={country.name}
                    className={`bg-slate-900/50 rounded-xl p-4 border ${tierConfig.border} hover:shadow-lg transition-all cursor-pointer`}
                    onClick={() => setSelectedCountry(country)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{country.name}</h4>
                        <p className="text-slate-400 text-xs">{country.region}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${tierConfig.bg} ${tierConfig.text}`}>
                        {tierConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {country.priority === "🔥" && <Flame className="w-4 h-4 text-red-400" />}
                        {country.priority === "⚡" && <Zap className="w-4 h-4 text-yellow-400" />}
                        {country.priority === "🌱" && <Leaf className="w-4 h-4 text-emerald-400" />}
                        <span className="text-2xl font-bold text-white">{country.score}</span>
                        <span className="text-slate-500 text-sm">/100</span>
                      </div>
                      <div className="flex gap-1">
                        {country.law === "has" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                         country.law === "outdated" ? <AlertCircle className="w-4 h-4 text-yellow-400" /> :
                         <XCircle className="w-4 h-4 text-red-400" />}
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                      <div className={`h-1.5 rounded-full ${country.score >= 70 ? "bg-emerald-500" : country.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${country.score}%` }}></div>
                    </div>
                    <p className="text-slate-300 text-xs">{country.strategy.substring(0, 80)}...</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCountry(null)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCountry.name}</h2>
                  <p className="text-slate-400">{selectedCountry.region}</p>
                </div>
                <button onClick={() => setSelectedCountry(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Reform Score</p>
                  <p className="text-3xl font-bold text-white">{selectedCountry.score}/100</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Population</p>
                  <p className="text-xl font-bold text-white">{selectedCountry.population}M</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Psychiatrists per 100k</p>
                  <p className="text-xl font-bold text-white">{selectedCountry.psychiatristsPer100k}</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Psychiatric Beds per 100k</p>
                  <p className="text-xl font-bold text-white">{selectedCountry.bedsPer100k}</p>
                </div>
              </div>
              
              <div className="bg-cyan-600/10 rounded-lg p-4 border border-cyan-500/20">
                <p className="text-cyan-400 text-sm font-semibold mb-2">Strategic Recommendation</p>
                <p className="text-slate-300">{selectedCountry.strategy}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}