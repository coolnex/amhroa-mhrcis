// app/continental-reform-dashboard/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Shield,
  Users,
  Building2,
  FileText,
  DollarSign,
  MapPin,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  RefreshCw,
  Loader2,
  LogOut,
  ArrowLeft,
  Flame,
  Zap,
  Leaf,
  Crown,
  Star,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Heart,
  Brain,
} from "lucide-react";

interface CountryReformData {
  country: string;
  law_status: "Modern" | "Outdated" | "None" | "Partial";
  law_icon: string;
  implementation_level: "Moderate" | "Weak" | "Minimal" | "None";
  implementation_icon: string;
  budget_allocation: "High" | "Medium" | "Low";
  priority_level: "High" | "Medium" | "Low";
  priority_icon: string;
  strategy: string;
  tier: number;
  reform_score: number;
  population: number;
  region: string;
}

const COUNTRY_DATA: CountryReformData[] = [
  // Tier 1: High Priority Countries
  { country: "Somalia", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Emergency mental health policy + humanitarian integration", tier: 1, reform_score: 15, population: 15893000, region: "East Africa" },
  { country: "South Sudan", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Build from scratch (policy + workforce)", tier: 1, reform_score: 12, population: 11193000, region: "East Africa" },
  { country: "Chad", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy development + WHO engagement", tier: 1, reform_score: 18, population: 16426000, region: "Central Africa" },
  { country: "Central African Republic", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Integrate into primary healthcare", tier: 1, reform_score: 14, population: 5496000, region: "Central Africa" },
  { country: "Eritrea", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy advocacy via AU/WHO channels", tier: 1, reform_score: 16, population: 3545000, region: "East Africa" },
  { country: "Guinea-Bissau", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Regional policy support (ECOWAS)", tier: 1, reform_score: 19, population: 1968000, region: "West Africa" },
  { country: "DR Congo", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "National law + decentralization strategy", tier: 1, reform_score: 13, population: 89561000, region: "Central Africa" },
  { country: "Republic of Congo", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Legislative advocacy", tier: 1, reform_score: 17, population: 5518000, region: "Central Africa" },
  { country: "Equatorial Guinea", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy initiation + technical support", tier: 1, reform_score: 11, population: 1403000, region: "Central Africa" },

  // Tier 2: Law Exists But Minimal Implementation
  { country: "Nigeria", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Domestication + state-level rollout + funding", tier: 2, reform_score: 45, population: 206140000, region: "West Africa" },
  { country: "Kenya", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Devolution + county-level implementation", tier: 2, reform_score: 48, population: 53771000, region: "East Africa" },
  { country: "Uganda", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Community mental health scale-up", tier: 2, reform_score: 42, population: 45741000, region: "East Africa" },
  { country: "Ethiopia", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Integrate into PHC + workforce expansion", tier: 2, reform_score: 44, population: 114964000, region: "East Africa" },
  { country: "Ghana", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Strengthen Mental Health Authority", tier: 2, reform_score: 52, population: 31073000, region: "West Africa" },
  { country: "Sierra Leone", law_status: "Modern", law_icon: "✅", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Post-law operational structures", tier: 2, reform_score: 38, population: 7977000, region: "West Africa" },
  { country: "Liberia", law_status: "Modern", law_icon: "✅", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "System rebuilding + donor alignment", tier: 2, reform_score: 35, population: 5058000, region: "West Africa" },
  { country: "The Gambia", law_status: "Modern", law_icon: "✅", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Implementation framework development", tier: 2, reform_score: 40, population: 2417000, region: "West Africa" },
  { country: "Rwanda", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Scale community services", tier: 2, reform_score: 55, population: 12952000, region: "East Africa" },
  { country: "Zambia", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Conference leverage for national reform", tier: 2, reform_score: 41, population: 18384000, region: "Southern Africa" },
  { country: "Malawi", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Workforce + PHC integration", tier: 2, reform_score: 39, population: 19130000, region: "Southern Africa" },
  { country: "Zimbabwe", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy-to-service transition", tier: 2, reform_score: 43, population: 14863000, region: "Southern Africa" },

  // Tier 3: Outdated Laws
  { country: "Cameroon", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Law reform advocacy", tier: 3, reform_score: 36, population: 26546000, region: "Central Africa" },
  { country: "Senegal", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Policy update + decentralization", tier: 3, reform_score: 47, population: 16744000, region: "West Africa" },
  { country: "Côte d'Ivoire", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Legal modernization", tier: 3, reform_score: 49, population: 26378000, region: "West Africa" },
  { country: "Togo", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Reform + system strengthening", tier: 3, reform_score: 32, population: 8279000, region: "West Africa" },
  { country: "Benin", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy overhaul", tier: 3, reform_score: 30, population: 12123000, region: "West Africa" },
  { country: "Madagascar", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "National law reform", tier: 3, reform_score: 28, population: 27691000, region: "Southern Africa" },
  { country: "Mozambique", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Update + implementation", tier: 3, reform_score: 45, population: 31255000, region: "Southern Africa" },
  { country: "Angola", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Reform + workforce investment", tier: 3, reform_score: 46, population: 32866000, region: "Southern Africa" },
  { country: "Algeria", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Align with human rights", tier: 3, reform_score: 50, population: 43851000, region: "North Africa" },
  { country: "Burundi", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Reform + basic services", tier: 3, reform_score: 25, population: 11891000, region: "East Africa" },
  { country: "Niger", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Law + system establishment", tier: 3, reform_score: 22, population: 24207000, region: "West Africa" },
  { country: "Mali", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Conflict-sensitive reform", tier: 3, reform_score: 24, population: 20251000, region: "West Africa" },
  { country: "Mauritania", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy development", tier: 3, reform_score: 26, population: 4650000, region: "West Africa" },

  // Tier 4: Moderate Systems
  { country: "South Africa", law_status: "Modern", law_icon: "✅", implementation_level: "Moderate", implementation_icon: "🟢", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Equity + community care", tier: 4, reform_score: 68, population: 59309000, region: "Southern Africa" },
  { country: "Egypt", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Decentralization", tier: 4, reform_score: 54, population: 102334000, region: "North Africa" },
  { country: "Morocco", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Community-based care", tier: 4, reform_score: 56, population: 36910600, region: "North Africa" },
  { country: "Tunisia", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "System reform", tier: 4, reform_score: 52, population: 11819000, region: "North Africa" },
  { country: "Botswana", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Workforce expansion", tier: 4, reform_score: 53, population: 2352000, region: "Southern Africa" },
  { country: "Namibia", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Service decentralization", tier: 4, reform_score: 51, population: 2541000, region: "Southern Africa" },
  { country: "Mauritius", law_status: "Modern", law_icon: "✅", implementation_level: "Moderate", implementation_icon: "🟢", budget_allocation: "High", priority_level: "Low", priority_icon: "🌱", strategy: "Model system strengthening", tier: 4, reform_score: 72, population: 1272000, region: "Eastern Africa" },
  { country: "Cabo Verde", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Scale services", tier: 4, reform_score: 48, population: 555000, region: "West Africa" },

  // Tier 5: Small States / Mixed Systems
  { country: "Seychelles", law_status: "Modern", law_icon: "✅", implementation_level: "Moderate", implementation_icon: "🟢", budget_allocation: "Medium", priority_level: "Low", priority_icon: "🌱", strategy: "Sustain + innovation", tier: 5, reform_score: 70, population: 98000, region: "Eastern Africa" },
  { country: "Comoros", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Law reform", tier: 5, reform_score: 28, population: 869000, region: "Eastern Africa" },
  { country: "Djibouti", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "System development", tier: 5, reform_score: 30, population: 988000, region: "East Africa" },
  { country: "Lesotho", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Legal update", tier: 5, reform_score: 42, population: 2142000, region: "Southern Africa" },
  { country: "Eswatini", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Reform + services", tier: 5, reform_score: 40, population: 1160000, region: "Southern Africa" },

  // Additional Countries
  { country: "Sudan", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Reform in fragile context", tier: 3, reform_score: 20, population: 43849000, region: "North Africa" },
  { country: "Libya", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "System rebuilding", tier: 3, reform_score: 22, population: 6871000, region: "North Africa" },
  { country: "Tanzania", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Law reform + PHC", tier: 3, reform_score: 44, population: 59734000, region: "East Africa" },
  { country: "Gabon", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Legal modernization", tier: 3, reform_score: 46, population: 2225000, region: "Central Africa" },
  { country: "Guinea", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Reform + awareness", tier: 3, reform_score: 30, population: 13133000, region: "West Africa" },
  { country: "Burkina Faso", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy + service rollout", tier: 3, reform_score: 28, population: 20903000, region: "West Africa" },
  { country: "Cape Verde", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Strengthen implementation", tier: 4, reform_score: 47, population: 555000, region: "West Africa" },
];

export default function ContinentalReformDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<number | "all">("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("tier");
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.status === "Approved") {
          setUser(userData);
          setIsAuthorized(true);
          setLoading(false);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile && profile.status === "Approved") {
        setUser(profile);
        setIsAuthorized(true);
        localStorage.setItem("user", JSON.stringify(profile));
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("token");
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High": return <Flame className="w-4 h-4 text-red-500" />;
      case "Medium": return <Zap className="w-4 h-4 text-yellow-500" />;
      case "Low": return <Leaf className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return "bg-red-500/20 text-red-400 border-red-500/30";
      case 2: return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case 3: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 4: return "bg-green-500/20 text-green-400 border-green-500/30";
      case 5: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return "High Priority - System Failure";
      case 2: return "Law Exists - Minimal Implementation";
      case 3: return "Outdated Laws - Reform Urgent";
      case 4: return "Moderate Systems - Implementation Gaps";
      case 5: return "Small States / Mixed Systems";
      default: return "Unknown";
    }
  };

  const getImplementationIcon = (level: string) => {
    switch (level) {
      case "Moderate": return "🟢";
      case "Weak": return "🟡";
      case "Minimal": return "🔴";
      case "None": return "🔴";
      default: return "⚪";
    }
  };

  const getLawIcon = (status: string) => {
    switch (status) {
      case "Modern": return "✅";
      case "Outdated": return "⚠️";
      case "Partial": return "🔶";
      case "None": return "❌";
      default: return "❌";
    }
  };

  const filteredData = useMemo(() => {
    let filtered = COUNTRY_DATA;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.country.toLowerCase().includes(term) ||
        c.strategy.toLowerCase().includes(term) ||
        c.region.toLowerCase().includes(term)
      );
    }

    if (selectedTier !== "all") {
      filtered = filtered.filter(c => c.tier === selectedTier);
    }

    if (selectedRegion !== "all") {
      filtered = filtered.filter(c => c.region === selectedRegion);
    }

    if (selectedPriority !== "all") {
      filtered = filtered.filter(c => c.priority_level === selectedPriority);
    }

    if (sortBy === "tier") {
      filtered.sort((a, b) => a.tier - b.tier);
    } else if (sortBy === "reform_score") {
      filtered.sort((a, b) => b.reform_score - a.reform_score);
    } else if (sortBy === "country") {
      filtered.sort((a, b) => a.country.localeCompare(b.country));
    }

    return filtered;
  }, [searchTerm, selectedTier, selectedRegion, selectedPriority, sortBy]);

  const stats = {
    totalCountries: COUNTRY_DATA.length,
    highPriority: COUNTRY_DATA.filter(c => c.priority_level === "High").length,
    mediumPriority: COUNTRY_DATA.filter(c => c.priority_level === "Medium").length,
    lowPriority: COUNTRY_DATA.filter(c => c.priority_level === "Low").length,
    tier1Count: COUNTRY_DATA.filter(c => c.tier === 1).length,
    tier2Count: COUNTRY_DATA.filter(c => c.tier === 2).length,
    tier3Count: COUNTRY_DATA.filter(c => c.tier === 3).length,
    tier4Count: COUNTRY_DATA.filter(c => c.tier === 4).length,
    tier5Count: COUNTRY_DATA.filter(c => c.tier === 5).length,
    avgReformScore: Math.round(COUNTRY_DATA.reduce((acc, c) => acc + c.reform_score, 0) / COUNTRY_DATA.length),
    modernLaw: COUNTRY_DATA.filter(c => c.law_status === "Modern").length,
    outdatedLaw: COUNTRY_DATA.filter(c => c.law_status === "Outdated").length,
    noLaw: COUNTRY_DATA.filter(c => c.law_status === "None").length,
  };

  const regions = [...new Set(COUNTRY_DATA.map(c => c.region))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading Continental Reform Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    CONTINENTAL REFORM INTELLIGENCE
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">54 Countries Monitored</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Continental Mental Health Reform Dashboard
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-3xl">
                Comprehensive monitoring of mental health reform across Africa. Track legislation, implementation, and investment priorities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Legend */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-white font-semibold mb-2">📋 Law Status</p>
              <div className="space-y-1 text-slate-300">
                <p>✅ Modern (Post-2010, rights-based)</p>
                <p>⚠️ Outdated (Colonial / pre-2000)</p>
                <p>❌ None / No functional law</p>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">📊 Implementation Level</p>
              <div className="space-y-1 text-slate-300">
                <p>🟢 Moderate</p>
                <p>🟡 Weak / Fragmented</p>
                <p>🔴 Minimal / Non-existent</p>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">💰 Budget Allocation</p>
              <div className="space-y-1 text-slate-300">
                <p>🟢 High: &gt;2% health budget</p>
                <p>🟡 Medium: 1–2%</p>
                <p>🔴 Low: &lt;1%</p>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">🔥 Advocacy Priority</p>
              <div className="space-y-1 text-slate-300">
                <p>🔥 High (Urgent intervention)</p>
                <p>⚡ Medium (Strengthening needed)</p>
                <p>🌱 Low (Optimization stage)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Total Countries</p>
            <p className="text-2xl font-bold text-white">{stats.totalCountries}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">High Priority</p>
            <p className="text-2xl font-bold text-red-400">{stats.highPriority}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs">Medium Priority</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.mediumPriority}</p>
          </div>
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
            <p className="text-green-400 text-xs">Low Priority</p>
            <p className="text-2xl font-bold text-green-400">{stats.lowPriority}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-purple-400 text-xs">Avg Reform Score</p>
            <p className="text-2xl font-bold text-purple-400">{stats.avgReformScore}%</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-400 text-xs">Modern Laws</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.modernLaw}</p>
          </div>
        </div>

        {/* Tier Summary */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          <div className="bg-red-500/10 rounded-lg p-2 text-center border border-red-500/20">
            <p className="text-red-400 font-bold text-lg">Tier 1</p>
            <p className="text-white text-xs">{stats.tier1Count} countries</p>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-2 text-center border border-orange-500/20">
            <p className="text-orange-400 font-bold text-lg">Tier 2</p>
            <p className="text-white text-xs">{stats.tier2Count} countries</p>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-2 text-center border border-yellow-500/20">
            <p className="text-yellow-400 font-bold text-lg">Tier 3</p>
            <p className="text-white text-xs">{stats.tier3Count} countries</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-2 text-center border border-green-500/20">
            <p className="text-green-400 font-bold text-lg">Tier 4</p>
            <p className="text-white text-xs">{stats.tier4Count} countries</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-2 text-center border border-blue-500/20">
            <p className="text-blue-400 font-bold text-lg">Tier 5</p>
            <p className="text-white text-xs">{stats.tier5Count} countries</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Tiers</option>
              <option value="1">Tier 1 - System Failure</option>
              <option value="2">Tier 2 - Law Exists</option>
              <option value="3">Tier 3 - Outdated Laws</option>
              <option value="4">Tier 4 - Moderate Systems</option>
              <option value="5">Tier 5 - Small States</option>
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Regions</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Priorities</option>
              <option value="High">🔥 High Priority</option>
              <option value="Medium">⚡ Medium Priority</option>
              <option value="Low">🌱 Low Priority</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="tier">Sort by Tier</option>
              <option value="reform_score">Sort by Score</option>
              <option value="country">Sort by Name</option>
            </select>

            <div className="flex bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "grid" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "table" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((country) => (
              <div
                key={country.country}
                className={`bg-slate-800/50 rounded-2xl border p-5 transition-all cursor-pointer hover:border-cyan-500/30 ${
                  getTierColor(country.tier)
                }`}
                onClick={() => setExpandedCountry(expandedCountry === country.country ? null : country.country)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">{country.country}</h3>
                    <p className="text-slate-400 text-sm">{country.region}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTierColor(country.tier)}`}>
                      Tier {country.tier}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      {getPriorityIcon(country.priority_level)}
                      <span className="text-xs text-slate-400">{country.priority_level}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <p className="text-2xl">{country.law_icon}</p>
                    <p className="text-slate-400 text-xs">Law</p>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <p className="text-2xl">{country.implementation_icon}</p>
                    <p className="text-slate-400 text-xs">Implementation</p>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <p className="text-xl font-bold text-cyan-400">{country.reform_score}%</p>
                    <p className="text-slate-400 text-xs">Score</p>
                  </div>
                </div>

                {expandedCountry === country.country && (
                  <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                    <div>
                      <p className="text-slate-400 text-xs">Strategy</p>
                      <p className="text-white text-sm">{country.strategy}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Budget: <span className="text-white">{country.budget_allocation}</span></span>
                      <span className="text-slate-400">Population: <span className="text-white">{(country.population / 1000000).toFixed(1)}M</span></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Country</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Tier</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Law</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Implementation</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Budget</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Priority</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Score</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((country) => (
                    <tr key={country.country} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-medium text-white">{country.country}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getTierColor(country.tier)}`}>
                          Tier {country.tier}
                        </span>
                      </td>
                      <td className="p-3 text-2xl">{country.law_icon}</td>
                      <td className="p-3 text-2xl">{country.implementation_icon}</td>
                      <td className="p-3 text-sm text-white">{country.budget_allocation}</td>
                      <td className="p-3">{getPriorityIcon(country.priority_level)}</td>
                      <td className="p-3">
                        <span className="text-cyan-400 font-bold">{country.reform_score}%</span>
                      </td>
                      <td className="p-3 text-slate-300 text-sm max-w-xs">{country.strategy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredData.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No countries match your filters</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Key Insights */}
        <div className="mt-8 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/30 p-6">
          <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Continental Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-white font-bold">{stats.tier1Count + stats.tier2Count + stats.tier3Count}</span>
              </div>
              <p className="text-slate-400 text-sm">Countries requiring urgent intervention</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-bold">{stats.modernLaw}</span>
              </div>
              <p className="text-slate-400 text-sm">Countries with modern, rights-based legislation</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-bold">{stats.avgReformScore}%</span>
              </div>
              <p className="text-slate-400 text-sm">Continental average reform score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}