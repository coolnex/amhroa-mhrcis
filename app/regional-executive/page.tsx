// app/regional-executive/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AlertsWidget } from "@/components/AlertsWidget";
import { Bell } from "lucide-react";
import { GovernanceAlertsWidget } from "@/components/GovernanceAlertsWidget";
import { africanCountries, getCountryByName, getCountriesByRegion } from "@/lib/countries-data";
import {
  Flag,
  Users,
  FileText,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  MapPin,
  Building2,
  Settings,
  LogOut,
  RefreshCw,
  Eye,
  Award,
  Heart,
  Briefcase,
  BookOpen,
  Handshake,
  BarChart3,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  PieChart,
  LineChart,
} from "lucide-react";
import Link from "next/link";

interface RegionData {
  name: string;
  countries: string[];
  totalPopulation: number;
  avgReformScore: number;
  totalReports: number;
  totalOrganizations: number;
  totalFieldReports: number;
  activeWorkingGroups: number;
}

interface CountrySummary {
  name: string;
  code: string;
  flag: string;
  reformScore: number;
  reportsCount: number;
  organizationsCount: number;
  fieldReportsCount: number;
  workingGroupsCount: number;
  trend: "up" | "down" | "stable";
}

interface WorkingGroup {
  id: string;
  name: string;
  description: string;
  country: string;
  status: string;
  progress: number;
  members: number;
}

interface RegionalAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  country: string;
  created_at: string;
}

// Region definitions with their countries
const REGIONS: Record<string, string[]> = {
  "Northern Africa": ["Algeria", "Egypt", "Libya", "Morocco", "Sudan", "Tunisia", "Western Sahara"],
  "Western Africa": ["Benin", "Burkina Faso", "Cabo Verde", "Côte d'Ivoire", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Liberia", "Mali", "Mauritania", "Niger", "Nigeria", "Senegal", "Sierra Leone", "Togo"],
  "Central Africa": ["Angola", "Cameroon", "Central African Republic", "Chad", "Democratic Republic of the Congo", "Equatorial Guinea", "Gabon", "Republic of the Congo", "São Tomé and Príncipe"],
  "Eastern Africa": ["Burundi", "Comoros", "Djibouti", "Eritrea", "Ethiopia", "Kenya", "Madagascar", "Malawi", "Mauritius", "Mozambique", "Rwanda", "Seychelles", "Somalia", "South Sudan", "Tanzania", "Uganda", "Zambia", "Zimbabwe"],
  "Southern Africa": ["Botswana", "Eswatini", "Lesotho", "Namibia", "South Africa"],
};

const REGION_OPTIONS = Object.keys(REGIONS);

export default function RegionalExecutiveDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("Western Africa");
  const [regionData, setRegionData] = useState<RegionData | null>(null);
  const [countrySummaries, setCountrySummaries] = useState<CountrySummary[]>([]);
  const [workingGroups, setWorkingGroups] = useState<WorkingGroup[]>([]);
  const [regionalAlerts, setRegionalAlerts] = useState<RegionalAlert[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "countries" | "working-groups" | "alerts" | "reports">("overview");
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRegionalData();
    }
  }, [selectedRegion, user]);

  const checkAuth = async () => {
    try {
      console.log("🔐 Regional Executive - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.role === "Regional_Executive" || userData.role === "Admin") {
            if (userData.status === "Approved") {
              setUser(userData);
              await fetchRegionalData();
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      // 2. Fetch active authentication token session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.log("No active session found, routing back to login page.");
        router.push("/login");
        return;
      }

      // 3. Fetch structural profile record from public.users table
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, country, assigned_region")
        .eq("auth_user_id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Regional Executive Authorization Guard Rule
      if (userData.role !== "Regional_Executive" && userData.role !== "Admin") {
        console.warn(`🛑 Unauthorized access attempt. User role "${userData.role}" is not a Regional Executive.`);
        router.push("/dashboard");
        return;
      }

      // 5. Approval Constraint Guard Rule
      if (userData.status !== "Approved") {
        console.log("Account is not yet marked as Approved.");
        router.push("/login?message=Account pending approval");
        return;
      }

      // 6. Cache user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // If user has assigned_region, use it
      if (userData.assigned_region && REGIONS[userData.assigned_region]) {
        setSelectedRegion(userData.assigned_region);
      }

      await fetchRegionalData();

    } catch (error) {
      console.error("Critical error encountered during security verification:", error);
      setError("Failed to authenticate. Please try again.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegionalData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const countries = REGIONS[selectedRegion] || [];
      
      // Fetch data for each country in parallel
      const countryPromises = countries.map(async (countryName) => {
        const countryInfo = getCountryByName(countryName);
        
        // Get reports count
        const { count: reportsCount, error: reportsError } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("country", countryName);

        if (reportsError) {
          console.warn(`Error fetching reports for ${countryName}:`, reportsError);
        }

        // Get organizations count
        const { count: orgsCount, error: orgsError } = await supabase
          .from("organizations")
          .select("*", { count: "exact", head: true })
          .eq("country", countryName)
          .eq("status", "Approved");

        if (orgsError) {
          console.warn(`Error fetching organizations for ${countryName}:`, orgsError);
        }

        // Get field reports count
        const { count: fieldReportsCount, error: fieldError } = await supabase
          .from("field_reports")
          .select("*", { count: "exact", head: true })
          .eq("country", countryName);

        if (fieldError) {
          console.warn(`Error fetching field reports for ${countryName}:`, fieldError);
        }

        // Get reform score
        const { data: countryData, error: countryError } = await supabase
          .from("countries")
          .select("reform_score")
          .eq("country_name", countryName)
          .maybeSingle();

        if (countryError) {
          console.warn(`Error fetching country data for ${countryName}:`, countryError);
        }

        // Get working groups count
        const { count: workingGroupsCount, error: wgError } = await supabase
          .from("working_groups")
          .select("*", { count: "exact", head: true })
          .eq("country", countryName);

        if (wgError) {
          console.warn(`Error fetching working groups for ${countryName}:`, wgError);
        }

        return {
          name: countryName,
          code: countryInfo?.code || "",
          flag: countryInfo?.flag || "🏳️",
          reformScore: countryData?.reform_score || 0,
          reportsCount: reportsCount || 0,
          organizationsCount: orgsCount || 0,
          fieldReportsCount: fieldReportsCount || 0,
          workingGroupsCount: workingGroupsCount || 0,
          trend: "stable" as const,
        };
      });

      const summaries = await Promise.all(countryPromises);
      setCountrySummaries(summaries);

      // Calculate region totals
      const totalPopulation = summaries.reduce((acc, c) => {
        const countryInfo = getCountryByName(c.name);
        return acc + (countryInfo?.population || 0);
      }, 0);

      const avgReformScore = summaries.reduce((acc, c) => acc + c.reformScore, 0) / (summaries.length || 1);
      const totalReports = summaries.reduce((acc, c) => acc + c.reportsCount, 0);
      const totalOrganizations = summaries.reduce((acc, c) => acc + c.organizationsCount, 0);
      const totalFieldReports = summaries.reduce((acc, c) => acc + c.fieldReportsCount, 0);
      const activeWorkingGroups = summaries.reduce((acc, c) => acc + c.workingGroupsCount, 0);

      setRegionData({
        name: selectedRegion,
        countries: countries,
        totalPopulation: totalPopulation / 1000000,
        avgReformScore: Math.round(avgReformScore),
        totalReports,
        totalOrganizations,
        totalFieldReports,
        activeWorkingGroups,
      });

      // Fetch working groups for the region
      const { data: wgData, error: wgError } = await supabase
        .from("working_groups")
        .select("*")
        .in("country", countries)
        .order("created_at", { ascending: false });

      if (wgError) {
        console.warn("Error fetching working groups:", wgError);
      }

      if (wgData) setWorkingGroups(wgData);

      // Fetch regional alerts
      const { data: alertData, error: alertError } = await supabase
        .from("alerts")
        .select("*")
        .in("country", [...countries, null])
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (alertError) {
        console.warn("Error fetching alerts:", alertError);
      }

      if (alertData) setRegionalAlerts(alertData);

    } catch (error) {
      console.error("Error fetching regional data:", error);
      setError("Failed to load regional data");
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 70) return "text-cyan-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 50) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500/20 text-red-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-blue-500/20 text-blue-400";
    }
  };

  const filteredCountries = countrySummaries.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Regional Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Governance Alerts Widget */}
      <GovernanceAlertsWidget userRole="regional_executive" />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    REGIONAL EXECUTIVE COMMAND CENTER
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">Regional Oversight</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {selectedRegion} Regional Command Center
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-3xl">
                Welcome, {user?.full_name}. Oversee mental health reform across {regionData?.countries.length} countries in {selectedRegion}.
              </p>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              >
                {REGION_OPTIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <button
                onClick={fetchRegionalData}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Alerts Widget */}
        <div className="mb-6">
          <AlertsWidget 
            userRole={user?.role}
            userCountry={user?.country}
            userId={user?.id}
            limit={3}
            showViewAll={true}
          />
        </div>

        {/* Regional KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Countries</p>
            </div>
            <p className="text-2xl font-bold text-white">{regionData?.countries.length}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <p className="text-cyan-400 text-xs">Avg Reform Score</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{regionData?.avgReformScore}%</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Population (M)</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{regionData?.totalPopulation.toFixed(0)}M</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Total Reports</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{regionData?.totalReports}</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 text-xs">Organizations</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{regionData?.totalOrganizations}</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-orange-400" />
              <p className="text-orange-400 text-xs">Working Groups</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">{regionData?.activeWorkingGroups}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "overview" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("countries")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "countries" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Flag className="w-4 h-4" />
            Country Intelligence
          </button>
          <button
            onClick={() => setActiveTab("working-groups")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "working-groups" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Working Groups
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "alerts" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Regional Alerts
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "reports" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            Reports Overview
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Region Map Visualization */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                {selectedRegion} Regional Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {REGIONS[selectedRegion].map((country) => {
                  const countryInfo = getCountryByName(country);
                  const summary = countrySummaries.find(c => c.name === country);
                  return (
                    <div key={country} className="bg-slate-700/30 rounded-xl p-3 text-center hover:bg-slate-700/50 transition-colors">
                      <span className="text-2xl">{countryInfo?.flag}</span>
                      <p className="text-white text-sm mt-1 font-medium truncate">{country}</p>
                      <p className={`text-xs font-bold ${getScoreColor(summary?.reformScore || 0)}`}>
                        {summary?.reformScore || 0}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performers & Areas of Concern */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  Top Performing Countries
                </h3>
                <div className="space-y-3">
                  {[...countrySummaries]
                    .sort((a, b) => b.reformScore - a.reformScore)
                    .slice(0, 5)
                    .map((country, idx) => (
                      <div key={country.name} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{country.flag}</span>
                          <div>
                            <p className="text-white font-medium">{country.name}</p>
                            <p className="text-slate-400 text-xs">{country.reportsCount} reports</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getScoreColor(country.reformScore)}`}>
                            {country.reformScore}%
                          </p>
                          <p className="text-slate-500 text-xs">Reform Score</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Areas Needing Attention
                </h3>
                <div className="space-y-3">
                  {[...countrySummaries]
                    .sort((a, b) => a.reformScore - b.reformScore)
                    .slice(0, 5)
                    .map((country, idx) => (
                      <div key={country.name} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{country.flag}</span>
                          <div>
                            <p className="text-white font-medium">{country.name}</p>
                            <p className="text-slate-400 text-xs">{country.fieldReportsCount} field reports</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getScoreColor(country.reformScore)}`}>
                            {country.reformScore}%
                          </p>
                          <button className="text-cyan-400 text-xs hover:text-cyan-300">View Details →</button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/30 p-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Regional Rank</p>
                  <p className="text-3xl font-bold text-white">
                    {REGION_OPTIONS.findIndex(r => r === selectedRegion) + 1}/{REGION_OPTIONS.length}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">vs Continental Avg</p>
                  <p className={`text-3xl font-bold ${(regionData?.avgReformScore || 0) >= 55 ? "text-emerald-400" : "text-red-400"}`}>
                    {(regionData?.avgReformScore || 0) >= 55 ? "+" : ""}{(regionData?.avgReformScore || 0) - 55}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Working Groups</p>
                  <p className="text-3xl font-bold text-white">{regionData?.activeWorkingGroups}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Active Alerts</p>
                  <p className="text-3xl font-bold text-yellow-400">{regionalAlerts.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Country Intelligence Tab */}
        {activeTab === "countries" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCountries.map((country) => (
                <div key={country.name} className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedCountry(expandedCountry === country.name ? null : country.name)}
                    className="w-full p-5 flex justify-between items-center hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{country.flag}</span>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-white">{country.name}</h3>
                        <div className="flex gap-3 mt-1">
                          <span className="text-slate-400 text-sm">{country.reportsCount} reports</span>
                          <span className="text-slate-400 text-sm">{country.organizationsCount} orgs</span>
                          <span className="text-slate-400 text-sm">{country.workingGroupsCount} working groups</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-slate-400 text-sm">Reform Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(country.reformScore)}`}>
                          {country.reformScore}%
                        </p>
                      </div>
                      {expandedCountry === country.name ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expandedCountry === country.name && (
                    <div className="border-t border-slate-700 p-5 bg-slate-800/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                          <p className="text-slate-400 text-xs">Field Reports</p>
                          <p className="text-2xl font-bold text-white">{country.fieldReportsCount}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                          <p className="text-slate-400 text-xs">Working Groups</p>
                          <p className="text-2xl font-bold text-white">{country.workingGroupsCount}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                          <p className="text-slate-400 text-xs">Organizations</p>
                          <p className="text-2xl font-bold text-white">{country.organizationsCount}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                          <p className="text-slate-400 text-xs">Reports</p>
                          <p className="text-2xl font-bold text-white">{country.reportsCount}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/coordinator?country=${encodeURIComponent(country.name)}`}
                          className="flex-1 text-center py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors"
                        >
                          View Country Dashboard
                        </Link>
                        <Link
                          href={`/countries/${encodeURIComponent(country.name)}`}
                          className="flex-1 text-center py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
                        >
                          View Country Profile
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Working Groups Tab */}
        {activeTab === "working-groups" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workingGroups.map((wg) => (
              <div key={wg.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 hover:border-cyan-500/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white">{wg.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    wg.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {wg.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{wg.description}</p>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                  <MapPin className="w-4 h-4" />
                  {wg.country}
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-cyan-400">{wg.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${wg.progress}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {wg.members} members
                  </span>
                  <Link href={`/working-groups/${wg.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
            {workingGroups.length === 0 && (
              <div className="col-span-full bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No working groups in this region</p>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-4">
            {regionalAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-xl border ${getSeverityBadge(alert.severity)}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <h4 className="text-white font-semibold">{alert.title}</h4>
                      <span className="text-slate-500 text-xs">{new Date(alert.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                    {alert.country && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-400">
                        <MapPin className="w-3 h-3" />
                        {alert.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {regionalAlerts.length === 0 && (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
                <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No active alerts in this region</p>
              </div>
            )}
          </div>
        )}

        {/* Reports Overview Tab */}
        {activeTab === "reports" && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Reports by Country
              </h3>
            </div>
            <div className="divide-y divide-slate-700">
              {countrySummaries.map((country) => (
                <div key={country.name} className="p-4 flex justify-between items-center hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <p className="text-white font-medium">{country.name}</p>
                      <p className="text-slate-400 text-xs">{country.reportsCount} total reports</p>
                    </div>
                  </div>
                  <Link
                    href={`/reports?country=${encodeURIComponent(country.name)}`}
                    className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                  >
                    View Reports
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}