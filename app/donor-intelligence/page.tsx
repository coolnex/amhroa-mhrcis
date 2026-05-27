"use client";

import { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Search,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  BarChart3,
  LineChart,
  Users,
  Building2,
  Award,
  Flame,
  Zap,
  Leaf,
  ArrowUpRight,
  ChevronRight,
  Eye,
  MapPin,
  Calendar,
  Percent,
  Wallet,
  Briefcase,
  Shield,
  Heart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend, 
} from "recharts";

interface DonorCountry {
  id: number;
  country_name: string;
  region: string;
  funding_gap_level: "Critical" | "High" | "Moderate" | "Low";
  funding_gap_score: number;
  investment_priority: "🔥 Urgent" | "⚡ High" | "📈 Medium" | "🌱 Low";
  estimated_investment_need: number;
  donor_readiness_score: number;
  current_funding: number;
  population: number;
  reform_score: number;
  roi_potential: number;
  risk_level: "High" | "Medium" | "Low";
  key_gaps: string[];
  recommended_donors: string[];
  last_updated: string;
}

// Mock data for demonstration
const mockDonorData: DonorCountry[] = [
  {
    id: 1,
    country_name: "Nigeria",
    region: "West Africa",
    funding_gap_level: "Critical",
    funding_gap_score: 92,
    investment_priority: "🔥 Urgent",
    estimated_investment_need: 125000000,
    donor_readiness_score: 45,
    current_funding: 25000000,
    population: 218.6,
    reform_score: 62,
    roi_potential: 75,
    risk_level: "High",
    key_gaps: ["Workforce shortage", "Infrastructure deficit", "Policy implementation"],
    recommended_donors: ["World Bank", "WHO", "Global Fund"],
    last_updated: "2024-03-15",
  },
  {
    id: 2,
    country_name: "Kenya",
    region: "East Africa",
    funding_gap_level: "High",
    funding_gap_score: 78,
    investment_priority: "⚡ High",
    estimated_investment_need: 85000000,
    donor_readiness_score: 68,
    current_funding: 35000000,
    population: 53.8,
    reform_score: 74,
    roi_potential: 85,
    risk_level: "Medium",
    key_gaps: ["County-level implementation", "Community services", "Monitoring systems"],
    recommended_donors: ["USAID", "Global Affairs Canada", "EU"],
    last_updated: "2024-03-15",
  },
  {
    id: 3,
    country_name: "South Africa",
    region: "Southern Africa",
    funding_gap_level: "Moderate",
    funding_gap_score: 55,
    investment_priority: "📈 Medium",
    estimated_investment_need: 95000000,
    donor_readiness_score: 82,
    current_funding: 60000000,
    population: 60.1,
    reform_score: 81,
    roi_potential: 70,
    risk_level: "Low",
    key_gaps: ["Equity in access", "Community care expansion", "Workforce distribution"],
    recommended_donors: ["Rockefeller Foundation", "Wellcome Trust", "Open Society"],
    last_updated: "2024-03-15",
  },
  {
    id: 4,
    country_name: "Ghana",
    region: "West Africa",
    funding_gap_level: "High",
    funding_gap_score: 72,
    investment_priority: "⚡ High",
    estimated_investment_need: 65000000,
    donor_readiness_score: 62,
    current_funding: 25000000,
    population: 32.8,
    reform_score: 68,
    roi_potential: 78,
    risk_level: "Medium",
    key_gaps: ["Mental Health Authority strengthening", "Workforce training", "Awareness campaigns"],
    recommended_donors: ["DFID", "GIZ", "AfDB"],
    last_updated: "2024-03-15",
  },
  {
    id: 5,
    country_name: "Rwanda",
    region: "East Africa",
    funding_gap_level: "Moderate",
    funding_gap_score: 48,
    investment_priority: "📈 Medium",
    estimated_investment_need: 45000000,
    donor_readiness_score: 88,
    current_funding: 30000000,
    population: 13.3,
    reform_score: 77,
    roi_potential: 82,
    risk_level: "Low",
    key_gaps: ["Scale community services", "Telepsychiatry", "M&E systems"],
    recommended_donors: ["Global Fund", "WHO", "Partners in Health"],
    last_updated: "2024-03-15",
  },
  {
    id: 6,
    country_name: "DR Congo",
    region: "Central Africa",
    funding_gap_level: "Critical",
    funding_gap_score: 95,
    investment_priority: "🔥 Urgent",
    estimated_investment_need: 150000000,
    donor_readiness_score: 25,
    current_funding: 5000000,
    population: 89.6,
    reform_score: 16,
    roi_potential: 88,
    risk_level: "High",
    key_gaps: ["No mental health law", "No implementation structure", "Humanitarian crisis integration"],
    recommended_donors: ["UNICEF", "WHO", "Emergency Response Funds"],
    last_updated: "2024-03-15",
  },
  {
    id: 7,
    country_name: "Ethiopia",
    region: "East Africa",
    funding_gap_level: "High",
    funding_gap_score: 82,
    investment_priority: "⚡ High",
    estimated_investment_need: 95000000,
    donor_readiness_score: 55,
    current_funding: 20000000,
    population: 117.9,
    reform_score: 65,
    roi_potential: 80,
    risk_level: "Medium",
    key_gaps: ["PHC integration", "Workforce expansion", "Supply chain"],
    recommended_donors: ["World Bank", "Global Fund", "EU"],
    last_updated: "2024-03-15",
  },
  {
    id: 8,
    country_name: "Uganda",
    region: "East Africa",
    funding_gap_level: "High",
    funding_gap_score: 75,
    investment_priority: "⚡ High",
    estimated_investment_need: 72000000,
    donor_readiness_score: 58,
    current_funding: 25000000,
    population: 45.9,
    reform_score: 68,
    roi_potential: 76,
    risk_level: "Medium",
    key_gaps: ["Community services", "Workforce shortage", "Stigma reduction"],
    recommended_donors: ["USAID", "DFID", "WHO"],
    last_updated: "2024-03-15",
  },
  {
    id: 9,
    country_name: "Tanzania",
    region: "East Africa",
    funding_gap_level: "High",
    funding_gap_score: 70,
    investment_priority: "⚡ High",
    estimated_investment_need: 68000000,
    donor_readiness_score: 48,
    current_funding: 22000000,
    population: 61.5,
    reform_score: 48,
    roi_potential: 72,
    risk_level: "High",
    key_gaps: ["Law reform", "Primary healthcare integration", "Data systems"],
    recommended_donors: ["Global Fund", "WHO", "World Bank"],
    last_updated: "2024-03-15",
  },
  {
    id: 10,
    country_name: "Mauritius",
    region: "Island States",
    funding_gap_level: "Low",
    funding_gap_score: 25,
    investment_priority: "🌱 Low",
    estimated_investment_need: 15000000,
    donor_readiness_score: 92,
    current_funding: 12000000,
    population: 1.3,
    reform_score: 85,
    roi_potential: 65,
    risk_level: "Low",
    key_gaps: ["Innovation scaling", "Specialized services", "Research capacity"],
    recommended_donors: ["Innovation funds", "Technical partners"],
    last_updated: "2024-03-15",
  },
];

const regions = ["all", "West Africa", "East Africa", "Southern Africa", "North Africa", "Central Africa", "Island States"];

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case "🔥 Urgent": return { icon: Flame, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
    case "⚡ High": return { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
    case "📈 Medium": return { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" };
    case "🌱 Low": return { icon: Leaf, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" };
    default: return { icon: Target, color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/30" };
  }
};

const getGapColor = (level: string) => {
  switch (level) {
    case "Critical": return "text-red-400 bg-red-500/10";
    case "High": return "text-orange-400 bg-orange-500/10";
    case "Moderate": return "text-yellow-400 bg-yellow-500/10";
    case "Low": return "text-emerald-400 bg-emerald-500/10";
    default: return "text-slate-400 bg-slate-500/10";
  }
};

const getRiskConfig = (level: string) => {
  switch (level) {
    case "High": return { color: "text-red-400", bg: "bg-red-500/20", text: "High Risk" };
    case "Medium": return { color: "text-yellow-400", bg: "bg-yellow-500/20", text: "Medium Risk" };
    case "Low": return { color: "text-emerald-400", bg: "bg-emerald-500/20", text: "Low Risk" };
    default: return { color: "text-slate-400", bg: "bg-slate-500/20", text: "Unknown" };
  }
};

export default function DonorIntelligencePage() {
  const [countries, setCountries] = useState<DonorCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState<DonorCountry | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  useEffect(() => {
    fetchDonorData();
  }, []);

  const fetchDonorData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/donor-intelligence");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.countries) {
          setCountries(data.countries);
        } else {
          setCountries(mockDonorData);
        }
      } else {
        setCountries(mockDonorData);
      }
    } catch (error) {
      console.error("Error fetching donor data:", error);
      setCountries(mockDonorData);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = useMemo(() => {
    return countries.filter(country => {
      const matchesSearch = country.country_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === "all" || country.region === selectedRegion;
      const matchesPriority = selectedPriority === "all" || country.investment_priority === selectedPriority;
      const matchesRisk = selectedRisk === "all" || country.risk_level === selectedRisk;
      return matchesSearch && matchesRegion && matchesPriority && matchesRisk;
    });
  }, [countries, searchTerm, selectedRegion, selectedPriority, selectedRisk]);

  const stats = {
    totalCountries: countries.length,
    totalFundingGap: countries.reduce((acc, c) => acc + (c.estimated_investment_need - c.current_funding), 0),
    criticalGap: countries.filter(c => c.funding_gap_level === "Critical").length,
    highGap: countries.filter(c => c.funding_gap_level === "High").length,
    avgReadiness: Math.round(countries.reduce((acc, c) => acc + c.donor_readiness_score, 0) / countries.length),
    totalNeed: countries.reduce((acc, c) => acc + c.estimated_investment_need, 0),
  };

  // Chart data
  const priorityDistribution = [
    { name: "Urgent", value: countries.filter(c => c.investment_priority === "🔥 Urgent").length, color: "#ef4444" },
    { name: "High", value: countries.filter(c => c.investment_priority === "⚡ High").length, color: "#facc15" },
    { name: "Medium", value: countries.filter(c => c.investment_priority === "📈 Medium").length, color: "#3b82f6" },
    { name: "Low", value: countries.filter(c => c.investment_priority === "🌱 Low").length, color: "#10b981" },
  ];

  const topOpportunities = [...countries].sort((a, b) => b.roi_potential - a.roi_potential).slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading investment intelligence data...</p>
        </div>
      </div>
    );
  }

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
                    INVESTMENT INTELLIGENCE
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">Real-time Funding Analytics</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Donor & Investment Intelligence
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Continental financing, donor prioritization, and investment intelligence system for strategic funding decisions.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchDonorData}
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
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Countries Analyzed</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalCountries}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-xs">Critical Funding Gap</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.criticalGap}</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-orange-400" />
              <p className="text-orange-400 text-xs">High Priority</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.highGap}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Avg Donor Readiness</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.avgReadiness}%</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Total Need</p>
            </div>
            <p className="text-xl font-bold text-purple-400">${(stats.totalNeed / 1000000).toFixed(0)}M</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Priority Distribution Pie Chart */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              Investment Priority Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent = 1 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#0f172a' }} />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top ROI Opportunities */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Top ROI Opportunities
            </h3>
            <div className="space-y-3">
              {topOpportunities.map((country, idx) => (
                <div key={country.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm font-mono">#{idx + 1}</span>
                    <div>
                      <p className="text-white font-medium">{country.country_name}</p>
                      <p className="text-slate-400 text-xs">{country.region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">{country.roi_potential}%</p>
                    <p className="text-slate-500 text-xs">ROI Potential</p>
                  </div>
                </div>
              ))}
            </div>
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
            <option value="🔥 Urgent">Urgent Priority 🔥</option>
            <option value="⚡ High">High Priority ⚡</option>
            <option value="📈 Medium">Medium Priority 📈</option>
            <option value="🌱 Low">Low Priority 🌱</option>
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          <div className="flex bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === "table" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === "cards" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Cards
            </button>
          </div>
        </div>

        {/* Table View */}
        {viewMode === "table" && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Funding Gap</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Estimated Need</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Current Funding</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Donor Readiness</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Risk Level</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">ROI</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCountries.map((country) => {
                    const priorityConfig = getPriorityConfig(country.investment_priority);
                    const riskConfig = getRiskConfig(country.risk_level);
                    const PriorityIcon = priorityConfig.icon;
                    
                    return (
                      <tr key={country.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{country.country_name}</p>
                            <p className="text-slate-400 text-xs">{country.region}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-700 rounded-full h-2">
                              <div className={`h-2 rounded-full ${country.funding_gap_score >= 80 ? "bg-red-500" : country.funding_gap_score >= 60 ? "bg-orange-500" : "bg-yellow-500"}`} style={{ width: `${country.funding_gap_score}%` }}></div>
                            </div>
                            <span className={`text-sm font-medium ${country.funding_gap_score >= 80 ? "text-red-400" : country.funding_gap_score >= 60 ? "text-orange-400" : "text-yellow-400"}`}>
                              {country.funding_gap_score}%
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getGapColor(country.funding_gap_level)}`}>
                            {country.funding_gap_level}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium">${(country.estimated_investment_need / 1000000).toFixed(1)}M</p>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-300">${(country.current_funding / 1000000).toFixed(1)}M</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-700 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${country.donor_readiness_score}%` }}></div>
                            </div>
                            <span className="text-white text-sm">{country.donor_readiness_score}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${riskConfig.bg} ${riskConfig.color}`}>
                            {riskConfig.text}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">{country.roi_potential}%</span>
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
          </div>
        )}

        {/* Cards View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCountries.map((country) => {
              const priorityConfig = getPriorityConfig(country.investment_priority);
              const riskConfig = getRiskConfig(country.risk_level);
              const PriorityIcon = priorityConfig.icon;
              
              return (
                <div
                  key={country.id}
                  className={`bg-slate-800/50 rounded-2xl border ${priorityConfig.border} hover:shadow-lg transition-all cursor-pointer overflow-hidden`}
                  onClick={() => setSelectedCountry(country)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{country.country_name}</h3>
                        <p className="text-slate-400 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {country.region}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full ${priorityConfig.bg} flex items-center gap-1`}>
                        <PriorityIcon className={`w-3 h-3 ${priorityConfig.color}`} />
                        <span className={`text-xs ${priorityConfig.color}`}>{country.investment_priority}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Funding Gap</span>
                          <span className={`font-medium ${country.funding_gap_score >= 80 ? "text-red-400" : "text-yellow-400"}`}>{country.funding_gap_score}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className={`h-2 rounded-full ${country.funding_gap_score >= 80 ? "bg-red-500" : "bg-orange-500"}`} style={{ width: `${country.funding_gap_score}%` }}></div>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <div>
                          <p className="text-slate-400 text-xs">Need</p>
                          <p className="text-white font-bold">${(country.estimated_investment_need / 1000000).toFixed(0)}M</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Current</p>
                          <p className="text-white">${(country.current_funding / 1000000).toFixed(0)}M</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Readiness</p>
                          <p className={`font-bold ${country.donor_readiness_score >= 70 ? "text-emerald-400" : "text-yellow-400"}`}>{country.donor_readiness_score}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${riskConfig.bg} ${riskConfig.color}`}>
                          {riskConfig.text}
                        </span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 text-sm">{country.roi_potential}% ROI</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredCountries.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No investment data found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* Country Detail Modal */}
        {selectedCountry && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCountry(null)}>
            <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedCountry.country_name}</h2>
                    <p className="text-slate-400">{selectedCountry.region}</p>
                  </div>
                  <button onClick={() => setSelectedCountry(null)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">Funding Gap</p>
                    <p className="text-2xl font-bold text-red-400">{selectedCountry.funding_gap_score}%</p>
                    <p className="text-slate-500 text-sm">{selectedCountry.funding_gap_level}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">Donor Readiness</p>
                    <p className="text-2xl font-bold text-emerald-400">{selectedCountry.donor_readiness_score}%</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">Estimated Need</p>
                    <p className="text-xl font-bold text-white">${(selectedCountry.estimated_investment_need / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">Current Funding</p>
                    <p className="text-xl font-bold text-white">${(selectedCountry.current_funding / 1000000).toFixed(1)}M</p>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-white text-sm font-semibold mb-2">Key Investment Gaps</p>
                  <ul className="space-y-1">
                    {selectedCountry.key_gaps.map((gap, idx) => (
                      <li key={idx} className="text-slate-300 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-cyan-600/10 rounded-lg p-4 border border-cyan-500/20">
                  <p className="text-cyan-400 text-sm font-semibold mb-2">Recommended Donors</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountry.recommended_donors.map((donor, idx) => (
                      <span key={idx} className="px-2 py-1 bg-cyan-500/20 rounded-lg text-cyan-300 text-xs">{donor}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-white text-sm font-semibold mb-2">Investment Case</p>
                  <p className="text-slate-300 text-sm">
                    {selectedCountry.country_name} has a {selectedCountry.funding_gap_level.toLowerCase()} funding gap with 
                    {selectedCountry.donor_readiness_score >= 70 ? " strong" : selectedCountry.donor_readiness_score >= 50 ? " moderate" : " limited"} donor readiness. 
                    Investment of ${((selectedCountry.estimated_investment_need - selectedCountry.current_funding) / 1000000).toFixed(1)}M could yield 
                    {selectedCountry.roi_potential}% return on investment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}