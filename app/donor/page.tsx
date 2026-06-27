// app/donor/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { GovernanceAlertsWidget } from "@/components/GovernanceAlertsWidget";
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
  Loader2,
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
  const router = useRouter();
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
  const [donorType, setDonorType] = useState<"premium" | "standard">("standard");
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkDonor();
  }, []);

  const checkDonor = async () => {
    try {
      // 1. First check localStorage
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.role === "Donor" || userData.role === "Admin") {
            setDonor(userData);
            await fetchDonorData(userData);
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      // 2. Check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push("/login");
        return;
      }

      // 3. Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile) {
        router.push("/login");
        return;
      }

      if (profile.role !== "Donor" && profile.role !== "Admin") {
        router.push("/dashboard");
        return;
      }

      // 4. Cache user data
      localStorage.setItem("user", JSON.stringify(profile));
      setDonor(profile);
      await fetchDonorData(profile);
      
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchDonorData = async (currentUser?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = currentUser?.id || donor?.id;
      
      if (!userId) {
        console.error("No user ID available");
        setError("User not found");
        setLoading(false);
        return;
      }

      // Check donor tier based on total investment
      const { data: investments, error: investmentsError } = await supabase
        .from("investments")
        .select("amount, country")
        .eq("donor_id", userId);

      if (investmentsError) {
        console.error("Error fetching investments:", investmentsError);
        // Don't fail completely, just use default values
      }

      const totalInvested = investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
      const uniqueCountries = [...new Set(investments?.map(inv => inv.country).filter(Boolean) || [])];
      
      setDonorType(totalInvested >= 100000 ? "premium" : "standard");

      // Fetch funding requests (without the problematic join)
      const { data: fundingData, error: fundingError } = await supabase
        .from("funding_requests")
        .select("*")
        .eq("status", "Open")
        .order("created_at", { ascending: false });

      if (fundingError) {
        console.error("Error fetching funding requests:", fundingError);
        // Try without status filter
        const { data: fallbackData } = await supabase
          .from("funding_requests")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (fallbackData) {
          // Get researcher names separately
          const researcherIds = fallbackData.map(r => r.researcher_id).filter(id => id);
          let researchersMap: Record<string, { full_name: string; organization: string }> = {};
          
          if (researcherIds.length > 0) {
            const { data: usersData } = await supabase
              .from("users")
              .select("id, full_name, organization")
              .in("id", researcherIds);
            
            if (usersData) {
              researchersMap = usersData.reduce((acc: any, user: any) => {
                acc[user.id] = { 
                  full_name: user.full_name || "Unknown", 
                  organization: user.organization || "N/A" 
                };
                return acc;
              }, {});
            }
          }

          const formattedRequests = fallbackData.map(request => ({
            ...request,
            researcher: researchersMap[request.researcher_id] || { 
              full_name: "Unknown", 
              organization: "N/A" 
            },
          }));
          
          setFundingRequests(formattedRequests);
        }
      } else if (fundingData) {
        // Get researcher names separately
        const researcherIds = fundingData.map(r => r.researcher_id).filter(id => id);
        let researchersMap: Record<string, { full_name: string; organization: string }> = {};
        
        if (researcherIds.length > 0) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id, full_name, organization")
            .in("id", researcherIds);
          
          if (usersData) {
            researchersMap = usersData.reduce((acc: any, user: any) => {
              acc[user.id] = { 
                full_name: user.full_name || "Unknown", 
                organization: user.organization || "N/A" 
              };
              return acc;
            }, {});
          }
        }

        const formattedRequests = fundingData.map(request => ({
          ...request,
          researcher: researchersMap[request.researcher_id] || { 
            full_name: "Unknown", 
            organization: "N/A" 
          },
        }));
        
        setFundingRequests(formattedRequests);
      }

      // Fetch approved organizations
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("status", "Approved")
        .limit(10);

      if (orgError) {
        console.error("Error fetching organizations:", orgError);
      } else {
        setOrganizations(orgData || []);
      }

      // Fetch research projects
      const { data: researchData, error: researchError } = await supabase
        .from("research_projects")
        .select("*")
        .eq("status", "Active")
        .limit(10);

      if (researchError) {
        console.error("Error fetching research projects:", researchError);
      } else {
        setResearchProjects(researchData || []);
      }

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("approval_status", "Approved")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(5);

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
      } else {
        setEvents(eventsData || []);
      }

      // Fetch workforce data - use columns that exist
      const { data: workforceData, error: workforceError } = await supabase
        .from("countries")
        .select("country_name, workforce_score, reform_score")
        .order("workforce_score", { ascending: false, nullsFirst: false })
        .limit(10);

      if (workforceError) {
        console.error("Error fetching workforce data:", workforceError);
        // Try alternative query
        const { data: altData } = await supabase
          .from("countries")
          .select("country_name, reform_score")
          .order("reform_score", { ascending: false, nullsFirst: true })
          .limit(10);
        
        setWorkforceData(altData || []);
      } else {
        setWorkforceData(workforceData || []);
      }

      // Calculate metrics
      setMetrics({
        total_investment: totalInvested,
        active_projects: researchProjects.length || 0,
        countries_reached: uniqueCountries.length || 0,
        beneficiaries: Math.floor(totalInvested / 100) * 50,
        roi_avg: 18.5,
        impact_score: 92,
      });

    } catch (error) {
      console.error("Error fetching donor data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleFundRequest = async (requestId: string, amount: number) => {
    if (!donor) {
      alert("Please login to fund requests");
      return;
    }

    setActionLoading(requestId);
    try {
      // Here you would implement the actual funding logic
      // This is a placeholder
      alert(`Funding request ${requestId} with $${amount}`);
      
      // Refresh data after funding
      await fetchDonorData(donor);
    } catch (error) {
      console.error("Error funding request:", error);
      alert("Failed to fund request. Please try again.");
    } finally {
      setActionLoading(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading Donor Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <GovernanceAlertsWidget userRole="Donor" userCountry={donor?.country || "Unknown"} />
      
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
            <div className="flex gap-2">
              <button
                onClick={() => fetchDonorData(donor)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
              >
                <Shield className="w-4 h-4" />
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
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
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
                        disabled={actionLoading === request.id}
                        className="mt-1 text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="w-3 h-3 animate-spin inline" />
                        ) : (
                          "Fund Now →"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                {fundingRequests.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No open funding requests at this time</p>
                )}
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
                      <td className="p-4 text-slate-300">{request.researcher?.full_name || "Unknown"}</td>
                      <td className="p-4 text-slate-300">{request.country || "N/A"}</td>
                      <td className="p-4">
                        <span className="text-cyan-400 font-bold">${(request.amount_needed / 1000).toFixed(0)}K</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">{request.status}</span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleFundRequest(request.id, request.amount_needed)}
                          disabled={actionLoading === request.id}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors disabled:opacity-50"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Fund Project"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {fundingRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No open funding requests</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Organizations Tab */}
        {selectedTab === "organizations" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div key={org.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/30 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{org.name}</h4>
                    <p className="text-slate-400 text-sm">{org.type}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">{org.country}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    org.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {org.status}
                  </span>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm">View Profile →</button>
                </div>
              </div>
            ))}
            {organizations.length === 0 && (
              <div className="col-span-full bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No organizations found</p>
              </div>
            )}
          </div>
        )}

        {/* Workforce Data Tab */}
        {selectedTab === "workforce" && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/80">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Mental Health Workforce by Country
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Country</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Workforce Score</th>
                    <th className="text-left p-4 text-slate-400 text-sm font-medium">Reform Score</th>
                  </tr>
                </thead>
                <tbody>
                  {workforceData.map((country, idx) => (
                    <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium text-white">{country.country_name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${country.workforce_score || 0}%` }}></div>
                          </div>
                          <span className="text-cyan-400 text-sm">{country.workforce_score || 0}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{country.reform_score || 0}%</td>
                    </tr>
                  ))}
                  {workforceData.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No workforce data available</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {selectedTab === "events" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-slate-400">{new Date(event.start_date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-white font-semibold">{event.title}</h4>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{event.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{event.event_type}</span>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm">View Details →</button>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="col-span-full bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No upcoming events</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}