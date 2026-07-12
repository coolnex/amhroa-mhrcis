// app/sdg-intelligence/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Globe,
  TrendingUp,
  Target,
  ArrowLeft,
  Award,
  Search,
  BarChart3,
  RefreshCw,
  Loader2,
  AlertCircle,
  Shield,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Eye,
  MapPin,
  Users,
  Clock,
  Star,
  Building2,
  DollarSign,
  Gauge,
} from "lucide-react";
import Link from "next/link";

interface Country {
  id: string;
  country_name: string;
  region: string;
  sdg_score: number;
  sdg_3_4_score: number;
  sdg_10_2_score: number;
  sdg_16_3_score: number;
  reform_score: number;
  population: number;
  last_updated: string;
  // Additional fields from mental_health_reforms
  reform_tier?: string;
  law_status?: string;
  implementation_status?: string;
  budget_level?: string;
  priority_level?: string;
  funding_gap_level?: string;
  investment_priority?: string;
  estimated_investment_need?: number;
  donor_readiness_score?: number;
  agenda2063_score?: number;
}

interface Metrics {
  total_countries: number;
  average_sdg_score: number;
  average_sdg_3_4: number;
  average_sdg_10_2: number;
  average_sdg_16_3: number;
  high_performers: number;
  low_performers: number;
}

interface RegionData {
  region: string;
  countries: Country[];
  average_sdg_score: number;
}

interface TopPerformer {
  rank: number;
  country_name: string;
  sdg_score: number;
  sdg_3_4_score: number;
  sdg_10_2_score: number;
  sdg_16_3_score: number;
  reform_tier?: string;
  priority_level?: string;
}

export default function SDGIntelligencePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Country>("country_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  useEffect(() => {
    fetchSDGData();
  }, []);

  const fetchSDGData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/sdg-intelligence");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCountries(data.countries || []);
        setMetrics(data.metrics || null);
        setRegions(data.by_region || []);
        setTopPerformers(data.top_performers || []);
        setLastUpdated(new Date().toISOString());
      } else {
        setError(data.message || "Failed to load SDG intelligence data");
      }
    } catch (error) {
      console.error("Error fetching SDG data:", error);
      setError("Failed to load SDG intelligence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchSDGData();
  };

  const getUniqueRegions = useMemo(() => {
    const regionSet = new Set<string>();
    countries.forEach(c => {
      if (c.region) regionSet.add(c.region);
    });
    return ["all", ...Array.from(regionSet)];
  }, [countries]);

  const getUniqueTiers = useMemo(() => {
    const tierSet = new Set<string>();
    countries.forEach(c => {
      if (c.reform_tier) tierSet.add(c.reform_tier);
    });
    return ["all", ...Array.from(tierSet)];
  }, [countries]);

  const getUniquePriorities = useMemo(() => {
    const prioritySet = new Set<string>();
    countries.forEach(c => {
      if (c.priority_level) prioritySet.add(c.priority_level);
    });
    return ["all", ...Array.from(prioritySet)];
  }, [countries]);

  const filteredCountries = useMemo(() => {
    let filtered = [...countries];

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.country_name.toLowerCase().includes(term) ||
        c.region?.toLowerCase().includes(term) ||
        c.reform_tier?.toLowerCase().includes(term) ||
        c.law_status?.toLowerCase().includes(term)
      );
    }

    // Region filter (reform tier)
    if (filterRegion !== "all") {
      filtered = filtered.filter(c => c.region === filterRegion);
    }

    // Tier filter
    if (filterTier !== "all") {
      filtered = filtered.filter(c => c.reform_tier === filterTier);
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(c => c.priority_level === filterPriority);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy] || 0;
      let bVal = b[sortBy] || 0;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return filtered;
  }, [countries, search, sortBy, sortOrder, filterRegion, filterTier, filterPriority]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/20 border-emerald-500/20";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/20";
    if (score >= 40) return "bg-orange-500/20 border-orange-500/20";
    return "bg-red-500/20 border-red-500/20";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (score >= 60) return <TrendingUp className="w-4 h-4 text-yellow-400" />;
    if (score >= 40) return <AlertCircle className="w-4 h-4 text-orange-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const getStatusLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    return "Critical";
  };

  const getOverallScore = (country: Country) => {
    return Math.round(
      (country.sdg_score + country.sdg_3_4_score + country.sdg_10_2_score + country.sdg_16_3_score) / 4
    );
  };

  const handleSort = (field: keyof Country) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country);
    setShowDetailModal(true);
  };

  const exportData = () => {
    const csv = [
      [
        "Country",
        "Reform Tier",
        "SDG Score",
        "SDG 3.4",
        "SDG 10.2",
        "SDG 16.3",
        "Reform Score",
        "Law Status",
        "Implementation Status",
        "Budget Level",
        "Priority Level",
        "Funding Gap",
        "Investment Priority",
        "Donor Readiness"
      ],
      ...filteredCountries.map(c => [
        c.country_name,
        c.reform_tier || "N/A",
        c.sdg_score,
        c.sdg_3_4_score,
        c.sdg_10_2_score,
        c.sdg_16_3_score,
        c.reform_score || 0,
        c.law_status || "N/A",
        c.implementation_status || "N/A",
        c.budget_level || "N/A",
        c.priority_level || "N/A",
        c.funding_gap_level || "N/A",
        c.investment_priority || "N/A",
        c.donor_readiness_score || 0,
      ]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sdg_intelligence_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading SDG Intelligence...</p>
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
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
              <span className="text-cyan-300 text-xs font-mono tracking-wider">
                SDG INTELLIGENCE
              </span>
            </div>
            <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
              <span className="text-purple-300 text-xs font-mono tracking-wider">
                AGENDA 2063
              </span>
            </div>
            <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
              <span className="text-emerald-300 text-xs font-mono tracking-wider">
                MENTAL HEALTH REFORMS
              </span>
            </div>
          </div>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Continental SDG & Mental Health Intelligence
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Monitor Africa's progress on Mental Health Reforms, Sustainable Development Goals and Agenda 2063 
                implementation using real-time governance intelligence from the mental_health_reforms database.
              </p>
              {lastUpdated && (
                <p className="text-slate-500 text-xs mt-2">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={handleRetry}
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
        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Countries Tracked</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics?.total_countries || 0}</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <p className="text-slate-400 text-xs">Avg SDG Score</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{metrics?.average_sdg_score || 0}%</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <p className="text-slate-400 text-xs">High Performers</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{metrics?.high_performers || 0}</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-slate-400 text-xs">Needs Attention</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{metrics?.low_performers || 0}</p>
          </div>
        </div>

        {/* Reform Tier Breakdown */}
        {regions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {regions.map((region) => (
              <div key={region.region} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 hover:border-cyan-500/30 transition-colors cursor-pointer" onClick={() => {
                setFilterRegion(region.region);
                setShowFilters(true);
              }}>
                <p className="text-slate-400 text-xs">Reform Tier: {region.region}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-white font-bold">{region.countries.length} countries</p>
                  <p className={`text-sm font-bold ${getScoreColor(region.average_sdg_score)}`}>
                    {region.average_sdg_score}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country, tier, or status..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <div className="flex bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "table" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "cards" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Cards
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Reform Tier</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {getUniqueRegions.map(region => (
                    <option key={region} value={region}>
                      {region === "all" ? "All Tiers" : region}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Law Status</label>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {getUniqueTiers.map(tier => (
                    <option key={tier} value={tier}>
                      {tier === "all" ? "All Statuses" : tier}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Priority Level</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {getUniquePriorities.map(priority => (
                    <option key={priority} value={priority}>
                      {priority === "all" ? "All Priorities" : priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* AI Intelligence Insight */}
        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/30 p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-purple-400">AI Intelligence Insight</h3>
          </div>
          <p className="text-slate-300 text-sm">
            {metrics?.low_performers && metrics.low_performers > 0 ? (
              <>
                {metrics.low_performers} countries are scoring below 40% and require immediate attention.
                Countries scoring below 60% across SDG 3, SDG 10, and SDG 16 should be prioritized for mental health
                governance strengthening, workforce investment and policy reform acceleration.
              </>
            ) : (
              "All countries are showing promising progress. Continue monitoring and sharing best practices across the continent."
            )}
            {topPerformers.length > 0 && (
              <span className="block mt-2 text-emerald-400 text-xs">
                🏆 Top performer: {topPerformers[0]?.country_name} with {topPerformers[0]?.sdg_score}% overall SDG score.
                {topPerformers[0]?.reform_tier && ` (Tier: ${topPerformers[0].reform_tier})`}
              </span>
            )}
          </p>
        </div>

        {/* Country Rankings */}
        {viewMode === "table" ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Country Benchmark Rankings
                <span className="text-slate-400 text-sm font-normal ml-2">
                  ({filteredCountries.length} countries)
                </span>
              </h2>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1"
              >
                {sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 sticky top-0">
                  <tr>
                    <th className="p-4 text-left text-slate-400 text-sm font-medium">#</th>
                    <th className="p-4 text-left text-slate-400 text-sm font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("country_name")}>
                      Country
                    </th>
                    <th className="p-4 text-left text-slate-400 text-sm font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("region")}>
                      Tier
                    </th>
                    <th className="p-4 text-left text-slate-400 text-sm font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("sdg_score")}>
                      SDG Score
                    </th>
                    <th className="p-4 text-left text-slate-400 text-sm font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("sdg_3_4_score")}>
                      SDG 3.4
                    </th>
                    <th className="p-4 text-left text-slate-400 text-sm font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("sdg_10_2_score")}>
                      SDG 10.2
                    </th>
                    <th className="p-4 text-left text-slate-400 text-sm font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("sdg_16_3_score")}>
                      SDG 16.3
                    </th>
                    <th className="p-4 text-left text-slate-400 text-sm font-medium cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("reform_score")}>
                      Reform
                    </th>
                    <th className="p-4 text-left text-slate-400 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCountries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        {search || filterRegion !== "all" || filterTier !== "all" || filterPriority !== "all"
                          ? "No countries match your search criteria"
                          : "No countries found"}
                      </td>
                    </tr>
                  ) : (
                    filteredCountries.map((country, index) => {
                      const overall = getOverallScore(country);
                      return (
                        <tr
                          key={country.id}
                          className="border-t border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors"
                          onClick={() => handleCountryClick(country)}
                        >
                          <td className="p-4 text-slate-500 text-sm">{index + 1}</td>
                          <td className="p-4 font-medium text-white">
                            {country.country_name}
                            {country.priority_level === "high" && (
                              <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full">HIGH PRIORITY</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-300 text-sm">{country.region || "—"}</td>
                          <td className={`p-4 font-bold ${getScoreColor(country.sdg_score)}`}>
                            {country.sdg_score}%
                          </td>
                          <td className={`p-4 font-bold ${getScoreColor(country.sdg_3_4_score)}`}>
                            {country.sdg_3_4_score}%
                          </td>
                          <td className={`p-4 font-bold ${getScoreColor(country.sdg_10_2_score)}`}>
                            {country.sdg_10_2_score}%
                          </td>
                          <td className={`p-4 font-bold ${getScoreColor(country.sdg_16_3_score)}`}>
                            {country.sdg_16_3_score}%
                          </td>
                          <td className={`p-4 font-bold ${getScoreColor(country.reform_score || 0)}`}>
                            {country.reform_score || 0}%
                          </td>
                          <td className="p-4">
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getScoreBg(overall)} border`}>
                              {getScoreIcon(overall)}
                              <span className="text-white">{getStatusLabel(overall)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Cards View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCountries.map((country) => {
              const overall = getOverallScore(country);
              return (
                <div
                  key={country.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-all p-6 cursor-pointer"
                  onClick={() => handleCountryClick(country)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold">{country.country_name}</h3>
                      <p className="text-slate-400 text-xs">Tier: {country.region || "Not specified"}</p>
                      {country.priority_level && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          country.priority_level === "high" ? "bg-red-500/20 text-red-400" :
                          country.priority_level === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {country.priority_level.toUpperCase()} PRIORITY
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getScoreBg(overall)} border`}>
                      {getScoreIcon(overall)}
                      <span className="text-white">{getStatusLabel(overall)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <p className="text-slate-400 text-xs">SDG Score</p>
                      <p className={`text-lg font-bold ${getScoreColor(country.sdg_score)}`}>
                        {country.sdg_score}%
                      </p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <p className="text-slate-400 text-xs">Reform Score</p>
                      <p className={`text-lg font-bold ${getScoreColor(country.reform_score || 0)}`}>
                        {country.reform_score || 0}%
                      </p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <p className="text-slate-400 text-xs">SDG 3.4</p>
                      <p className={`text-lg font-bold ${getScoreColor(country.sdg_3_4_score)}`}>
                        {country.sdg_3_4_score}%
                      </p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <p className="text-slate-400 text-xs">SDG 16.3</p>
                      <p className={`text-lg font-bold ${getScoreColor(country.sdg_16_3_score)}`}>
                        {country.sdg_16_3_score}%
                      </p>
                    </div>
                  </div>

                  {country.law_status && (
                    <p className="text-slate-500 text-xs mt-3 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Law: {country.law_status}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Country Detail Modal */}
      {showDetailModal && selectedCountry && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {selectedCountry.country_name}
                </h2>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
              </div>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                Reform Tier: {selectedCountry.region || "Not specified"}
                {selectedCountry.priority_level && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    selectedCountry.priority_level === "high" ? "bg-red-500/20 text-red-400" :
                    selectedCountry.priority_level === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {selectedCountry.priority_level.toUpperCase()} PRIORITY
                  </span>
                )}
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs">SDG Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedCountry.sdg_score)}`}>
                    {selectedCountry.sdg_score}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs">SDG 3.4</p>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedCountry.sdg_3_4_score)}`}>
                    {selectedCountry.sdg_3_4_score}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs">SDG 10.2</p>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedCountry.sdg_10_2_score)}`}>
                    {selectedCountry.sdg_10_2_score}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs">SDG 16.3</p>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedCountry.sdg_16_3_score)}`}>
                    {selectedCountry.sdg_16_3_score}%
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs">Reform Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedCountry.reform_score || 0)}`}>
                    {selectedCountry.reform_score || 0}%
                  </p>
                </div>
                {selectedCountry.donor_readiness_score !== undefined && (
                  <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs">Donor Readiness</p>
                    <p className={`text-2xl font-bold ${getScoreColor(selectedCountry.donor_readiness_score)}`}>
                      {selectedCountry.donor_readiness_score}%
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedCountry.law_status && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Law Status</p>
                    <p className="text-white font-medium">{selectedCountry.law_status}</p>
                  </div>
                )}
                {selectedCountry.implementation_status && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Implementation</p>
                    <p className="text-white font-medium">{selectedCountry.implementation_status}</p>
                  </div>
                )}
                {selectedCountry.budget_level && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Budget Level</p>
                    <p className="text-white font-medium">{selectedCountry.budget_level}</p>
                  </div>
                )}
                {selectedCountry.funding_gap_level && (
                  <div className="bg-slate-700/30 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Funding Gap</p>
                    <p className="text-white font-medium">{selectedCountry.funding_gap_level}</p>
                  </div>
                )}
                {selectedCountry.investment_priority && (
                  <div className="bg-slate-700/30 rounded-xl p-3 col-span-2">
                    <p className="text-slate-400 text-xs">Investment Priority</p>
                    <p className="text-white font-medium">{selectedCountry.investment_priority}</p>
                  </div>
                )}
                {selectedCountry.estimated_investment_need && (
                  <div className="bg-slate-700/30 rounded-xl p-3 col-span-2">
                    <p className="text-slate-400 text-xs">Estimated Investment Need</p>
                    <p className="text-white font-medium">${selectedCountry.estimated_investment_need.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-700/30 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Overall Assessment</h3>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getScoreBg(getOverallScore(selectedCountry))}`}>
                    {getScoreIcon(getOverallScore(selectedCountry))}
                    <span className="text-white font-bold">
                      {getOverallScore(selectedCountry)}% - {getStatusLabel(getOverallScore(selectedCountry))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <h4 className="text-purple-400 font-medium flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  AI Recommendation
                </h4>
                <p className="text-slate-300 text-sm">
                  {selectedCountry.sdg_score < 60 || selectedCountry.sdg_16_3_score < 60
                    ? `🔴 ${selectedCountry.country_name} shows critical gaps in ${selectedCountry.sdg_score < 60 ? 'SDG Score' : ''}${selectedCountry.sdg_score < 60 && selectedCountry.sdg_16_3_score < 60 ? ' and ' : ''}${selectedCountry.sdg_16_3_score < 60 ? 'SDG 16.3 (Governance)' : ''}. Immediate policy reform and investment in mental health infrastructure is recommended.`
                    : selectedCountry.sdg_score >= 80 && selectedCountry.sdg_16_3_score >= 80
                    ? `✅ ${selectedCountry.country_name} demonstrates strong performance in both health and governance. Continue to share best practices with other African nations.`
                    : `📊 ${selectedCountry.country_name} shows moderate performance. Focus on strengthening ${selectedCountry.sdg_score < 70 ? 'SDG Score' : 'SDG 16.3 (Governance)'} to achieve Agenda 2063 targets.`}
                  {selectedCountry.priority_level === "high" && " 🚨 This country is flagged as HIGH PRIORITY for reform acceleration."}
                </p>
              </div>

              {selectedCountry.last_updated && (
                <p className="text-slate-500 text-xs text-center">
                  Last updated: {new Date(selectedCountry.last_updated).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}