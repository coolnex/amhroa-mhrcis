// app/donor/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  FileText,
  Calendar,
  Award,
  Target,
  Globe,
  Briefcase,
  Heart,
  Shield,
  Download,
  RefreshCw,
  Eye,
  ChevronRight,
  Star,
  Zap,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface DonorMetrics {
  total_investment: number;
  active_projects: number;
  countries_reached: number;
  beneficiaries: number;
  roi_avg: number;
  impact_score: number;
}

interface FundingRequest {
  id: string;
  researcher_id: string;
  title: string;
  amount_needed: number;
  amount_raised: number;
  country: string;
  status: "Open" | "Funded" | "Closed";
  created_at: string;
  researcher: {
    full_name: string;
    organization: string;
  };
}

interface Organization {
  id: string;
  name: string;
  type: string;
  country: string;
  status: string;
}

interface ResearchProject {
  id: string;
  title: string;
  country: string;
  status: string;
  budget: number;
}

export default function DonorDashboard() {
  const [donor, setDonor] = useState<any>(null);
  const [metrics, setMetrics] = useState<DonorMetrics>({
    total_investment: 0,
    active_projects: 0,
    countries_reached: 0,
    beneficiaries: 0,
    roi_avg: 0,
    impact_score: 0,
  });
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [workforceData, setWorkforceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [donorType, setDonorType] = useState<"premium" | "standard">("premium");

  useEffect(() => {
    checkDonor();
    fetchDonorData();
  }, []);

  const checkDonor = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "Donor") {
      window.location.href = "/dashboard";
      return;
    }

    setDonor(profile);
    // Check donor tier based on subscription or total investment
    const { data: investments } = await supabase
      .from("investments")
      .select("amount")
      .eq("donor_id", user.id);
    
    const totalInvested = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    setDonorType(totalInvested >= 100000 ? "premium" : "standard");
  };

  const fetchDonorData = async () => {
    setLoading(true);
    try {
      // Fetch funding requests
      const { data: fundingData } = await supabase
        .from("funding_requests")
        .select(`
          *,
          researcher:researcher_id (
            full_name,
            organization
          )
        `)
        .eq("status", "Open")
        .order("created_at", { ascending: false });

      setFundingRequests(fundingData || []);

      // Fetch approved organizations
      const { data: orgData } = await supabase
        .from("organizations")
        .select("*")
        .eq("status", "Approved")
        .limit(10);

      setOrganizations(orgData || []);

      // Fetch research projects
      const { data: researchData } = await supabase
        .from("research_projects")
        .select("*")
        .eq("status", "Active")
        .limit(10);

      setResearchProjects(researchData || []);

      // Fetch events
      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString())
        .limit(5);

      setEvents(eventsData || []);

      // Fetch workforce data
      const { data: workforceData } = await supabase
        .from("countries")
        .select("country_name, workforce_score, psychiatrists_per_100k")
        .order("workforce_score", { ascending: false })
        .limit(10);

      setWorkforceData(workforceData || []);

      // Calculate metrics
      const { data: investments } = await supabase
        .from("investments")
        .select("amount, country")
        .eq("donor_id", donor?.id);

      const totalInvested = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      const uniqueCountries = [...new Set(investments?.map(inv => inv.country) || [])];
      
      setMetrics({
        total_investment: totalInvested,
        active_projects: researchProjects.length,
        countries_reached: uniqueCountries.length,
        beneficiaries: Math.floor(totalInvested / 100) * 50, // Mock calculation
        roi_avg: 18.5,
        impact_score: 92,
      });
    } catch (error) {
      console.error("Error fetching donor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFundRequest = async (requestId: string, amount: number) => {
    // Implement funding logic
    alert(`Funding request ${requestId} with $${amount}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Donor Intelligence Dashboard...</p>
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
                    DONOR INTELLIGENCE PORTAL
                  </span>
                </div>
                {donorType === "premium" && (
                  <div className="px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
                    <span className="text-amber-300 text-xs font-mono">PREMIUM ACCESS</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Donor & Investment Intelligence
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Strategic investment insights, funding opportunities, and impact tracking for continental mental health reform.
              </p>
            </div>
            <button
              onClick={fetchDonorData}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <p className="text-slate-400 text-xs">Total Investment</p>
            </div>
            <p className="text-2xl font-bold text-white">${(metrics.total_investment / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Active Projects</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.active_projects}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <p className="text-slate-400 text-xs">Countries Reached</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.countries_reached}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <p className="text-slate-400 text-xs">Beneficiaries</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.beneficiaries.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <p className="text-slate-400 text-xs">Avg ROI</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.roi_avg}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <p className="text-slate-400 text-xs">Impact Score</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">{metrics.impact_score}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setSelectedTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTab === "overview" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab("funding")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTab === "funding" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Funding Requests
            {fundingRequests.length > 0 && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{fundingRequests.length}</span>}
          </button>
          <button
            onClick={() => setSelectedTab("organizations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTab === "organizations" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Organizations
          </button>
          <button
            onClick={() => setSelectedTab("workforce")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTab === "workforce" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Workforce Data
          </button>
          <button
            onClick={() => setSelectedTab("events")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTab === "events" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Events & Networking
          </button>
        </div>

        {/* Overview Tab */}
        {selectedTab === "overview" && (
          <div className="space-y-6">
            {/* Top Investment Opportunities */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Top Investment Opportunities
              </h3>
              <div className="space-y-3">
                {fundingRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{request.title}</p>
                      <p className="text-slate-400 text-sm">{request.country} · {request.researcher?.organization || "Independent Researcher"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">${(request.amount_needed / 1000).toFixed(0)}K</p>
                      <button
                        onClick={() => handleFundRequest(request.id, request.amount_needed)}
                        className="mt-1 text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        Fund Now →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  SDG Impact Alignment
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-sm">SDG 3.4 - Mental Health</span>
                      <span className="text-cyan-400 text-sm">78%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-sm">SDG 10.2 - Social Inclusion</span>
                      <span className="text-cyan-400 text-sm">65%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-sm">SDG 16.3 - Rule of Law</span>
                      <span className="text-cyan-400 text-sm">72%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "72%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  Premium Features (Unlocked)
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    AI-powered investment recommendations
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Direct researcher matching
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Exclusive impact reports
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Priority event access
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Funding Requests Tab */}
        {selectedTab === "funding" && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Project Title</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Researcher</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Amount Needed</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {fundingRequests.map((request) => (
                    <tr key={request.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium text-white">{request.title}</td>
                      <td className="p-4 text-slate-300">{request.researcher?.full_name}</td>
                      <td className="p-4 text-slate-300">{request.country}</td>
                      <td className="p-4">
                        <span className="text-cyan-400 font-bold">${(request.amount_needed / 1000).toFixed(0)}K</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">{request.status}</span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleFundRequest(request.id, request.amount_needed)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors"
                        >
                          Fund Project
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add similar sections for Organizations, Workforce, Events tabs... */}
      </div>
    </div>
  );
}