// app/coordinator/page.tsx
"use client";

import { Brain, Gavel, Scale, Users as UsersIcon, Activity, Pill, Stethoscope } from "lucide-react";
import { useTrackerSurveys } from '@/hooks/useTrackerSurveys';
import { AlertsWidget } from "@/components/AlertsWidget";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { GovernanceAlertsWidget } from "@/components/GovernanceAlertsWidget";
import { africanCountries, getCountryByName } from "@/lib/countries-data";
import {
  Flag,
  Users,
  FileText,
  TrendingUp,
  Target,
  XCircle,
  Calendar,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Globe,
  Megaphone,
  Phone,
  MapPin,
  Building2,
  Settings,
  LogOut,
  RefreshCw,
  Plus,
  Eye,
  LinkIcon,
  Award,
  Loader2,
  Heart,
  Briefcase,
  BookOpen,
  Handshake,
  BarChart3,
  Download,
  Filter,
  Search,
} from "lucide-react";
import Link from "next/link";
import { CountrySelect } from "@/components/ui/country-select";
import { StateSelect } from "@/components/ui/state-select";

interface Report {
  id: string;
  title: string;
  type: string;
  status: string;
  submitted_at: string;
  score?: number;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  status: string;
  contact_person: string;
  contact_email: string;
}

interface FieldReport {
  id: string;
  title: string;
  incident_type: string;
  severity: string;
  status: string;
  created_at: string;
}

interface ReformMetric {
  reform_score: number;
  legislation_score: number;
  implementation_score: number;
  workforce_score: number;
  financing_score: number;
  sdg_score: number;
}

interface PolicyImplementation {
  id: string;
  country: string;
  policy_name: string;
  policy_category: string;
  status: string;
  progress_percentage: number;
  start_date: string;
  target_completion: string;
  description: string;
  challenges: string;
  achievements: string;
}

interface SuicideDecriminalization {
  id: string;
  country: string;
  status: string;
  legislation_status: string;
  year_legislated: number;
  notes: string;
  progress_score: number;
  awareness_campaigns: boolean;
  support_services: boolean;
}

interface WorkforceTracker {
  id: string;
  country: string;
  year: number;
  psychiatrists_total: number;
  psychologists_total: number;
  nurses_total: number;
  social_workers_total: number;
  peer_support_workers: number;
  training_programs: number;
  vacancies: number;
  government_spending: number;
  donor_support: number;
}

interface CareSystemMetrics {
  id: string;
  country: string;
  reporting_period: string;
  phc_integration_score: number;
  phc_facilities_count: number;
  phc_facilities_with_mh: number;
  phc_providers_trained: number;
  community_health_workers: number;
  outpatient_visits: number;
  community_clinics: number;
  community_reach_percentage: number;
  psychiatrists_total: number;
  psychiatrists_per_capita: number;
  psychologists_total: number;
  mental_health_nurses: number;
  community_health_workers_total: number;
  community_visits: number;
  telemedicine_consultations: number;
  task_shifting_providers_trained: number;
  chw_trained_in_mh: number;
  vacancy_rate: number;
  service_delivery_score: number;
  task_shifting_implemented: boolean;
  task_shifting_programs: number;
  hiv_integration_score: number;
  ncd_integration_score: number;
  maternal_health_integration: number;
  youth_health_integration: number;
  created_at: string;
  updated_at: string;
}

interface FinancingMetrics {
  id: string;
  country: string;
  fiscal_year: string;
  total_health_budget: number;
  mental_health_budget: number;
  mh_percentage_of_health: number;
  mh_per_capita: number;
  donor_organizations: string[];
  service_cost_per_person: number;
  investment_case_developed: boolean;
  donor_funding_total: number;
  donor_projects: number;
  advocacy_campaigns: number;
  budget_increase_achieved: boolean;
  budget_increase_percentage: number;
  target_mh_budget_percentage: number;
  created_at: string;
}

interface Submission {
  id: string;
  title: string;
  description: string;
  country: string;
  report_type: string;
  status: string;
  approval_status: string;
  priority: string;
  submitted_by: string;
  submitted_by_role: string;
  file_url: string;
  created_at: string;
  user_id: string;
  sdg_alignment: string[];
  review_notes?: string;
}
interface CommunityDeterminants {
  id: string;
  country: string;
  reporting_date: string;
  stigma_index: number;
  discrimination_index: number;
  public_awareness_percentage: number;
  community_programs: number;
  community_workers_deployed: number;
  food_insecurity_level: number;
  community_sessions_held: number;
  peer_support_groups: number;
  unemployment_rate: number;
  displacement_count: number;
  faith_organizations_engaged: number;
  traditional_healers_involved: number;
  cultural_sensitivity_score: number;
  stigma_reduction_programs: number;
  well_being_index: number;
  social_cohesion_score: number;
  community_acceptance_score: number;
  resilience_index: number;
  created_at: string;
}

interface CrisisResponseMetrics {
  id: string;
  country: string;
  early_warning_system_active: boolean;
  alert_level: string;
  rapid_response_teams: number;
  team_coverage: number;
  response_time_hours: number;
  rapid_response_activated: boolean;
  crises_monitored: number;
  active_crises: number;
  psychosocial_teams_deployed: number;
  psychosocial_sessions_held: number;
  beneficiaries_reached: number;
  crisis_hotline_active: boolean;
  hotline_calls_received: number;
  mental_health_first_aid_trained: number;
  humanitarian_agencies: string[];
  emergency_funding: number;
  trained_responders: number;
  crisis_impact_score: number;
  pss_supports_online: number;
  coordination_meetings: number;
  mh_impact_score: number;
  who_collaboration: number;
  unicef_collaboration: number;
  unhcr_collaboration: number;
  ifrc_collaboration: number;
  recovery_progress: number;
  created_at: string;
}

export default function CoordinatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [countryData, setCountryData] = useState<any>(null);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionTab, setSubmissionTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([]);
  const [careSystem, setCareSystem] = useState<CareSystemMetrics | null>(null);
  const [financing, setFinancing] = useState<FinancingMetrics | null>(null);
  const [communityDeterminants, setCommunityDeterminants] = useState<CommunityDeterminants | null>(null);
  const [crisisResponse, setCrisisResponse] = useState<CrisisResponseMetrics | null>(null);
  const { surveyIds, loading: loadingSurveyIds } = useTrackerSurveys(selectedCountry);
  const [reformMetrics, setReformMetrics] = useState<ReformMetric>({
    reform_score: 0,
    legislation_score: 0,
    implementation_score: 0,
    workforce_score: 0,
    financing_score: 0,
    sdg_score: 0,
  });
  
  const [policies, setPolicies] = useState<PolicyImplementation[]>([]);
  const [suicideDecrim, setSuicideDecrim] = useState<SuicideDecriminalization | null>(null);
  const [workforceData, setWorkforceData] = useState<WorkforceTracker | null>(null);
  
  const careSystemsSurveyId = surveyIds.care_systems;
  const financingSurveyId = surveyIds.financing;
  const communitySurveyId = surveyIds.community;
  const crisisSurveyId = surveyIds.crisis;

  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "organizations" | "field-reports" | "metrics" | "trackers" | "care-systems" | "financing" | "community" | "submissions" | "crisis">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔐 Coordinator Gate - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const coordinatorTypes = ["Coordinator", "researcher_coordinator", "cso_coordinator", "mental_health_coordinator"];
          
          if (coordinatorTypes.includes(userData.role) || userData.role === "Admin") {
            setUser(userData);
            const assignedCountry = userData.assigned_country || userData.country || "Kenya";
            setSelectedCountry(assignedCountry);
            
            const countryInfo = getCountryByName(assignedCountry);
            if (countryInfo) {
              setSelectedCountryCode(countryInfo.code);
            }
            
            await fetchAllData(assignedCountry);
            setLoading(false);
            return;
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
        .select("id, full_name, email, role, status, country, assigned_country")
        .eq("auth_user_id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Coordinator Authorization Guard Rule
      const coordinatorTypes = ["Coordinator", "researcher_coordinator", "cso_coordinator", "mental_health_coordinator"];
      
      if (!coordinatorTypes.includes(userData.role) && userData.role !== "Admin") {
        console.warn(`🛑 Unauthorized access attempt. User role "${userData.role}" is not a Coordinator.`);
        router.push("/dashboard");
        return;
      }

      // 5. Approval Constraint Guard Rule
      if (userData.status !== "Approved") {
        console.log("Coordinator account is not yet marked as Approved.");
        router.push("/login?message=Account pending approval");
        return;
      }

      // 6. Cache user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      const assignedCountry = userData.assigned_country || userData.country || "Kenya";
      setSelectedCountry(assignedCountry);
      
      const countryInfo = getCountryByName(assignedCountry);
      if (countryInfo) {
        setSelectedCountryCode(countryInfo.code);
      }

      await fetchAllData(assignedCountry);
      
    } catch (error) {
      console.error("Critical error encountered during coordinator security verification:", error);
      setError("Failed to load dashboard. Please try again.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async (country: string) => {
    try {
      const results = await Promise.allSettled([
        fetchCountryData(country),
        fetchReports(country),
        fetchOrganizations(country),
        fetchFieldReports(country),
        fetchReformMetrics(country),
        fetchPolicies(country),
        fetchSuicideDecriminalization(country),
        fetchWorkforceData(country),
        fetchCareSystemMetrics(country),
        fetchFinancingMetrics(country),
        fetchCommunityDeterminants(country),
        fetchCrisisResponse(country),
        fetchSubmissions(country)
      ]);
  
      // Check for any rejected promises
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);
      
      if (errors.length > 0) {
        console.warn("Some data fetches failed:", errors);
        // Don't set error message for missing tables, just log them
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load some data. Please refresh.");
    }
  };

  const fetchSubmissions = async (country: string) => {
    try {
      console.log("🔍 Fetching submissions for country:", country);
      
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("country", country)
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching submissions:", error);
        return;
      }
  
      console.log("✅ Submissions found:", data?.length || 0);
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setSubmissions([]);
    }
  };

  // Replace the existing fetch functions with these

const fetchCareSystemMetrics = async (country: string) => {
  try {
    const { data, error } = await supabase
      .from("care_system_metrics")
      .select("*")
      .eq("country", country)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle instead of single
  
    if (error) {
      console.warn("Care system metrics not found:", error.message);
      setCareSystem(null);
      return;
    }
    setCareSystem(data);
  } catch (error) {
    console.error("Error fetching care system metrics:", error);
    setCareSystem(null);
  }
};
  
const fetchFinancingMetrics = async (country: string) => {
  try {
    const { data, error } = await supabase
      .from("financing_metrics")
      .select("*")
      .eq("country", country)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  
    if (error) {
      console.warn("Financing metrics not found:", error.message);
      setFinancing(null);
      return;
    }
    setFinancing(data);
  } catch (error) {
    console.error("Error fetching financing metrics:", error);
    setFinancing(null);
  }
};
  
const fetchCommunityDeterminants = async (country: string) => {
  try {
    const { data, error } = await supabase
      .from("community_determinants")
      .select("*")
      .eq("country", country)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  
    if (error) {
      console.warn("Community determinants not found:", error.message);
      setCommunityDeterminants(null);
      return;
    }
    setCommunityDeterminants(data);
  } catch (error) {
    console.error("Error fetching community determinants:", error);
    setCommunityDeterminants(null);
  }
};
  
const fetchCrisisResponse = async (country: string) => {
  try {
    const { data, error } = await supabase
      .from("crisis_response_metrics")
      .select("*")
      .eq("country", country)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  
    if (error) {
      console.warn("Crisis response metrics not found:", error.message);
      setCrisisResponse(null);
      return;
    }
    setCrisisResponse(data);
  } catch (error) {
    console.error("Error fetching crisis response:", error);
    setCrisisResponse(null);
  }
};

const fetchCountryData = async (country: string) => {
  try {
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .eq("country_name", country)
      .maybeSingle();
      
    if (error) {
      console.warn("Country data not found:", error.message);
      setCountryData(null);
      return;
    }
    if (data) setCountryData(data);
  } catch (err) {
    console.error("Error fetching country data:", err);
    setCountryData(null);
  }
};

const fetchReformMetrics = async (country: string) => {
  try {
    const { data, error } = await supabase
      .from("countries")
      .select("reform_score, legislation_score, implementation_score, workforce_score, financing_score, sdg_score")
      .eq("country_name", country)
      .maybeSingle();
      
    if (error) {
      console.warn("Reform metrics not found:", error.message);
      return;
    }
    if (data) {
      setReformMetrics({
        reform_score: data.reform_score || 0,
        legislation_score: data.legislation_score || 0,
        implementation_score: data.implementation_score || 0,
        workforce_score: data.workforce_score || 0,
        financing_score: data.financing_score || 0,
        sdg_score: data.sdg_score || 0,
      });
    }
  } catch (err) {
    console.error("Error fetching reform metrics:", err);
  }
};

const fetchSuicideDecriminalization = async (country: string) => {
  try {
    const { data, error } = await supabase
      .from("suicide_decriminalization")
      .select("*")
      .eq("country", country)
      .maybeSingle();
      
    if (error) {
      console.warn("Suicide decriminalization data not found:", error.message);
      setSuicideDecrim(null);
      return;
    }
    if (data) setSuicideDecrim(data);
  } catch (err) {
    console.error("Error fetching suicide decriminalization data:", err);
    setSuicideDecrim(null);
  }
};

const fetchWorkforceData = async (country: string) => {
  try {
    const { data, error } = await supabase
      .from("mental_health_workforce")
      .select("*")
      .eq("country", country)
      .order("year", { ascending: false })
      .limit(1);
      
    if (error) {
      console.warn("Workforce data not found:", error.message);
      setWorkforceData(null);
      return;
    }
    if (data && data.length > 0) setWorkforceData(data[0]);
  } catch (err) {
    console.error("Error fetching workforce data:", err);
    setWorkforceData(null);
  }
};


  const fetchReports = async (country: string) => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("country", country)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      if (data) setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReports([]);
    }
  };

  
  const fetchOrganizations = async (country: string) => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("country", country)
        .eq("status", "Approved")
        .limit(10);
      
      if (error) throw error;
      if (data) setOrganizations(data);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setOrganizations([]);
    }
  };

  const fetchFieldReports = async (country: string) => {
    try {
      const { data, error } = await supabase
        .from("field_reports")
        .select("*")
        .eq("country", country)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      if (data) setFieldReports(data);
    } catch (err) {
      console.error("Error fetching field reports:", err);
      setFieldReports([]);
    }
  };

  const fetchPolicies = async (country: string) => {
    try {
      const { data, error } = await supabase
        .from("policy_implementations")
        .select("*")
        .eq("country", country)
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      if (data) setPolicies(data);
    } catch (err) {
      console.error("Error fetching policies:", err);
      setPolicies([]);
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

  // ==================== SUBMISSION APPROVAL FUNCTIONS ====================

const handleApproveSubmission = async (submissionId: string) => {
  if (!user) return;
  
  setActionLoading(submissionId);
  try {
    const { error } = await supabase
      .from("submissions")
      .update({
        status: "Approved",
        approval_status: "Approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (error) throw error;
    
    alert("Submission approved successfully!");
    await fetchSubmissions(selectedCountry);
  } catch (error) {
    console.error("Error approving submission:", error);
    alert("Failed to approve submission");
  } finally {
    setActionLoading(null);
  }
};

const handleRejectSubmission = async (submissionId: string) => {
  const reason = prompt("Please enter the reason for rejection:");
  if (reason === null) return;
  
  if (!reason.trim()) {
    alert("Please provide a reason for rejection");
    return;
  }

  setActionLoading(submissionId);
  try {
    const { error } = await supabase
      .from("submissions")
      .update({
        status: "Rejected",
        approval_status: "Rejected",
        review_notes: reason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (error) throw error;
    
    alert("Submission rejected successfully!");
    await fetchSubmissions(selectedCountry);
  } catch (error) {
    console.error("Error rejecting submission:", error);
    alert("Failed to reject submission");
  } finally {
    setActionLoading(null);
  }
};

const getSubmissionStatusBadge = (status: string) => {
  switch (status) {
    case "Approved":
      return { color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle };
    case "Pending":
      return { color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
    case "Rejected":
      return { color: "bg-red-500/20 text-red-400", icon: XCircle };
    default:
      return { color: "bg-slate-500/20 text-slate-400", icon: Clock };
  }
};
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-500/20 text-emerald-400";
      case "Pending": return "bg-yellow-500/20 text-yellow-400";
      case "Under Review": return "bg-blue-500/20 text-blue-400";
      case "Rejected": return "bg-red-500/20 text-red-400";
      case "In Progress": return "bg-cyan-500/20 text-cyan-400";
      case "Completed": return "bg-emerald-500/20 text-emerald-400";
      case "Not Started": return "bg-slate-500/20 text-slate-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "low": return "bg-emerald-500/20 text-emerald-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getDecrimStatusBadge = (status: string) => {
    switch (status) {
      case "Decriminalized": return "bg-emerald-500/20 text-emerald-400";
      case "Partially Decriminalized": return "bg-yellow-500/20 text-yellow-400";
      case "Under Consideration": return "bg-blue-500/20 text-blue-400";
      case "Criminalized": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Coordinator Dashboard...</p>
        </div>
      </div>
    );
  }

  const countryInfo = getCountryByName(selectedCountry);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <GovernanceAlertsWidget userRole={user?.role} userCountry={user?.assigned_country || user?.country} />
      
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    COUNTRY COORDINATOR PORTAL
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {countryInfo && <span className="text-2xl">{countryInfo.flag}</span>}
                  <span className="text-slate-400 text-xs">{selectedCountry}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {selectedCountry} Reform Coordination Center
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2">
                Welcome, {user?.full_name}. Manage national reports, organizations, and reform progress.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fetchAllData(selectedCountry)}
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
        {/* Alerts Widget */}
        <div className="mb-6">
          <AlertsWidget 
            userRole={user?.role}
            userCountry={user?.country || selectedCountry}
            userId={user?.id}
            limit={3}
            showViewAll={true}
          />
        </div>
      
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Reports</p>
            </div>
            <p className="text-2xl font-bold text-white">{reports.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Organizations</p>
            </div>
            <p className="text-2xl font-bold text-white">{organizations.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Gavel className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Active Policies</p>
            </div>
            <p className="text-2xl font-bold text-white">{policies.filter(p => p.status === "In Progress" || p.status === "Completed").length}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Reform Score</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{reformMetrics.reform_score}%</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-400 text-xs">Pending Submissions</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              {submissions.filter(s => s.approval_status === "Pending").length}
            </p>
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
            <Globe className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "reports" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab("organizations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "organizations" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Organizations
          </button>
          <button
            onClick={() => setActiveTab("field-reports")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "field-reports" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Field Reports
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "metrics" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Reform Metrics
          </button>
          <button
            onClick={() => setActiveTab("trackers")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "trackers" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            Trackers
          </button>
          <button
            onClick={() => setActiveTab("care-systems")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "care-systems" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Heart className="w-4 h-4" />
            Care Systems
          </button>
          <button
            onClick={() => setActiveTab("financing")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "financing" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Financing
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "community" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Community
          </button>
          <button
            onClick={() => setActiveTab("crisis")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "crisis" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Crisis Response
          </button>
          <button
              onClick={() => setActiveTab("submissions")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === "submissions" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              Submissions
              {submissions.filter(s => s.approval_status === "Pending").length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                  {submissions.filter(s => s.approval_status === "Pending").length}
                </span>
              )}
            </button>
        </div>

        {/* Overview Tab - Keep existing content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Country Profile Card */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  {countryInfo && <span className="text-4xl">{countryInfo.flag}</span>}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">{selectedCountry}</h3>
                  <p className="text-slate-400">{countryInfo?.region} · Capital: {countryInfo?.capital}</p>
                  <p className="text-slate-400 text-sm mt-1">Population: {((countryInfo?.population ?? 0) / 1000000).toFixed(1)}M</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Overall Reform Score</p>
                  <p className="text-4xl font-bold text-cyan-400">{reformMetrics.reform_score}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-sm">Legislation</p>
                  <p className="text-2xl font-bold text-white">{reformMetrics.legislation_score}%</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-sm">Implementation</p>
                  <p className="text-2xl font-bold text-white">{reformMetrics.implementation_score}%</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-sm">SDG Alignment</p>
                  <p className="text-2xl font-bold text-white">{reformMetrics.sdg_score}%</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/coordinators/data-entry" className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all group">
                <Plus className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="text-white font-semibold">Add Tracker Data</h3>
                <p className="text-slate-400 text-sm mt-1">Submit policy, decriminalization, or workforce data</p>
              </Link>
              <Link href="/coordinators/care-data-entry" className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all group">
                <Plus className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="text-white font-semibold">Add More Data</h3>
                <p className="text-slate-400 text-sm mt-1">Submit care systems, financing, community, or crisis data</p>
              </Link>
              <Link href="/data-collection/submissions" className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all group">
                <FileText className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="text-white font-semibold">Submit Report</h3>
                <p className="text-slate-400 text-sm mt-1">Upload country progress report</p>
              </Link>
            </div>

            {/* Quick Access to Tracker Surveys */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href={`/data-collection/surveys/${careSystemsSurveyId}`}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all"
              >
                <Heart className="w-8 h-8 text-pink-400 mb-2" />
                <h4 className="text-white font-medium">Care Systems</h4>
                <p className="text-slate-400 text-sm">Update PHC & workforce data</p>
              </Link>
              
              <Link 
                href={`/data-collection/surveys/${financingSurveyId}`}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all"
              >
                <DollarSign className="w-8 h-8 text-emerald-400 mb-2" />
                <h4 className="text-white font-medium">Financing</h4>
                <p className="text-slate-400 text-sm">Update budget & funding data</p>
              </Link>
              
              <Link 
                href={`/data-collection/surveys/${communitySurveyId}`}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all"
              >
                <Users className="w-8 h-8 text-blue-400 mb-2" />
                <h4 className="text-white font-medium">Community</h4>
                <p className="text-slate-400 text-sm">Update community & stigma data</p>
              </Link>
              
              <Link 
                href={`/data-collection/surveys/${crisisSurveyId}`}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all"
              >
                <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                <h4 className="text-white font-medium">Crisis Response</h4>
                <p className="text-slate-400 text-sm">Update emergency response data</p>
              </Link>
            </div>

            {/* Quick Stats Cards for Trackers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Gavel className="w-5 h-5 text-purple-400" />
                  <h4 className="text-white font-medium">Policy Implementation</h4>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Policies</span>
                  <span className="text-white font-bold">{policies.filter(p => p.status === "In Progress").length}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-400">Completed</span>
                  <span className="text-white font-bold">{policies.filter(p => p.status === "Completed").length}</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Scale className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-white font-medium">Suicide Decriminalization</h4>
                </div>
                {suicideDecrim ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Status</span>
                      <span className={`font-bold ${getDecrimStatusBadge(suicideDecrim.status)} px-2 py-0.5 rounded-full text-xs`}>
                        {suicideDecrim.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-bold">{suicideDecrim.progress_score}%</span>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">No data available</p>
                )}
              </div>

              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <UsersIcon className="w-5 h-5 text-blue-400" />
                  <h4 className="text-white font-medium">Mental Health Workforce</h4>
                </div>
                {workforceData ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Psychiatrists</span>
                      <span className="text-white font-bold">{workforceData.psychiatrists_total}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-400">Psychologists</span>
                      <span className="text-white font-bold">{workforceData.psychologists_total}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-400">Vacancies</span>
                      <span className="text-red-400 font-bold">{workforceData.vacancies}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">No data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium">{report.title}</h4>
                      <p className="text-slate-400 text-sm mt-1">Submitted: {new Date(report.submitted_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  {report.score && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-slate-400 text-sm">Score:</span>
                      <span className="text-cyan-400 font-bold">{report.score}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === "organizations" && (
          <div className="space-y-3">
            {organizations.map((org) => (
              <div key={org.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">{org.name}</h4>
                    <p className="text-slate-400 text-sm">{org.type}</p>
                    <p className="text-slate-400 text-xs mt-1">{org.contact_person} · {org.contact_email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(org.status)}`}>
                    {org.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Field Reports Tab */}
        {activeTab === "field-reports" && (
          <div className="space-y-3">
            {fieldReports.map((report) => (
              <div key={report.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">{report.title}</h4>
                    <p className="text-slate-400 text-sm">{report.incident_type}</p>
                    <p className="text-slate-400 text-xs mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSeverityBadge(report.severity)}`}>
                      {report.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reform Metrics Tab */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Reform Performance Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Reform Score</span>
                    <span className="text-cyan-400">{reformMetrics.reform_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${reformMetrics.reform_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Legislation Score</span>
                    <span className="text-cyan-400">{reformMetrics.legislation_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${reformMetrics.legislation_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Implementation Score</span>
                    <span className="text-cyan-400">{reformMetrics.implementation_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${reformMetrics.implementation_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Workforce Score</span>
                    <span className="text-cyan-400">{reformMetrics.workforce_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${reformMetrics.workforce_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Financing Score</span>
                    <span className="text-cyan-400">{reformMetrics.financing_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${reformMetrics.financing_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">SDG Alignment</span>
                    <span className="text-cyan-400">{reformMetrics.sdg_score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${reformMetrics.sdg_score}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/30 p-6">
              <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Recommendations for {selectedCountry}
              </h3>
              <ul className="space-y-2">
                {reformMetrics.legislation_score < 70 && (
                  <li className="text-slate-300 text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                    Accelerate legislative reforms to improve legal framework
                  </li>
                )}
                {reformMetrics.implementation_score < 60 && (
                  <li className="text-slate-300 text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                    Strengthen implementation mechanisms and monitoring systems
                  </li>
                )}
                {reformMetrics.workforce_score < 50 && (
                  <li className="text-slate-300 text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                    Expand mental health workforce training programs
                  </li>
                )}
                {reformMetrics.financing_score < 50 && (
                  <li className="text-slate-300 text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                    Increase budget allocation for mental health services
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Trackers Tab */}
        {activeTab === "trackers" && (
          <div className="space-y-6">
            {/* Policy Implementation Tracker */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gavel className="w-6 h-6 text-purple-400" />
                <h3 className="text-white font-semibold text-lg">Policy Implementation Tracker</h3>
              </div>
              
              {policies.length > 0 ? (
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div key={policy.id} className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-medium">{policy.policy_name}</h4>
                          <p className="text-slate-400 text-sm">{policy.policy_category}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(policy.status)}`}>
                          {policy.status}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-cyan-400">{policy.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${policy.progress_percentage}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <span className="text-slate-400">Started:</span>
                          <span className="text-white ml-2">{new Date(policy.start_date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Target:</span>
                          <span className="text-white ml-2">{new Date(policy.target_completion).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {policy.description && (
                        <p className="text-slate-400 text-sm mt-2">{policy.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No policy data available for {selectedCountry}</p>
              )}
            </div>

            {/* Suicide Decriminalization Tracker */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-emerald-400" />
                <h3 className="text-white font-semibold text-lg">Suicide Decriminalization Tracker</h3>
              </div>
              
              {suicideDecrim ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-slate-400 text-sm">Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold inline-block mt-1 ${getDecrimStatusBadge(suicideDecrim.status)}`}>
                        {suicideDecrim.status}
                      </span>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-slate-400 text-sm">Legislation Status</p>
                      <p className="text-white font-bold mt-1">{suicideDecrim.legislation_status}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-slate-400 text-sm">Progress Score</p>
                      <p className="text-emerald-400 font-bold text-xl mt-1">{suicideDecrim.progress_score}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm">Year Legislated</p>
                        <p className="text-white font-bold">{suicideDecrim.year_legislated || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Awareness Campaigns</p>
                        <p className="text-white font-bold">{suicideDecrim.awareness_campaigns ? "✅ Yes" : "❌ No"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Support Services</p>
                        <p className="text-white font-bold">{suicideDecrim.support_services ? "✅ Yes" : "❌ No"}</p>
                      </div>
                    </div>
                    {suicideDecrim.notes && (
                      <p className="text-slate-300 text-sm mt-3 border-t border-slate-600 pt-3">{suicideDecrim.notes}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No suicide decriminalization data available for {selectedCountry}</p>
              )}
            </div>

            {/* Mental Health Workforce Tracker */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <UsersIcon className="w-6 h-6 text-blue-400" />
                <h3 className="text-white font-semibold text-lg">Mental Health Workforce Tracker</h3>
              </div>
              
              {workforceData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-slate-400 text-sm">Psychiatrists</p>
                      <p className="text-white font-bold text-xl">{workforceData.psychiatrists_total}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-slate-400 text-sm">Psychologists</p>
                      <p className="text-white font-bold text-xl">{workforceData.psychologists_total}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-slate-400 text-sm">Nurses</p>
                      <p className="text-white font-bold text-xl">{workforceData.nurses_total}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                      <p className="text-slate-400 text-sm">Social Workers</p>
                      <p className="text-white font-bold text-xl">{workforceData.social_workers_total}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700/30 rounded-xl p-3">
                      <p className="text-slate-400 text-sm">Peer Support Workers</p>
                      <p className="text-white font-bold">{workforceData.peer_support_workers}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-3">
                      <p className="text-slate-400 text-sm">Training Programs</p>
                      <p className="text-white font-bold">{workforceData.training_programs}</p>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                      <p className="text-slate-400 text-sm">Vacancies</p>
                      <p className="text-red-400 font-bold">{workforceData.vacancies}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                      <p className="text-slate-400 text-sm">Government Spending (USD)</p>
                      <p className="text-emerald-400 font-bold">${(workforceData.government_spending / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                      <p className="text-slate-400 text-sm">Donor Support (USD)</p>
                      <p className="text-blue-400 font-bold">${(workforceData.donor_support / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No workforce data available for {selectedCountry}</p>
              )}
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
              <div className="space-y-4">
                {/* Status Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setSubmissionTab("pending")}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      submissionTab === "pending" ? "bg-yellow-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    Pending ({submissions.filter(s => s.approval_status === "Pending").length})
                  </button>
                  <button
                    onClick={() => setSubmissionTab("approved")}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      submissionTab === "approved" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    Approved ({submissions.filter(s => s.approval_status === "Approved").length})
                  </button>
                  <button
                    onClick={() => setSubmissionTab("rejected")}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      submissionTab === "rejected" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    Rejected ({submissions.filter(s => s.approval_status === "Rejected").length})
                  </button>
                </div>

                {/* Submissions List */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="p-4 border-b border-slate-700 bg-slate-800/80">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Country Submissions
                      <span className="text-slate-400 text-sm font-normal ml-2">
                        ({submissions.filter(s => s.approval_status === submissionTab || submissionTab === "pending").length} submissions)
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-900/50">
                        <tr>
                          <th className="text-left p-4 text-slate-400 text-sm font-medium">Title</th>
                          <th className="text-left p-4 text-slate-400 text-sm font-medium">Type</th>
                          <th className="text-left p-4 text-slate-400 text-sm font-medium">Submitted By</th>
                          <th className="text-left p-4 text-slate-400 text-sm font-medium">Priority</th>
                          <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
                          <th className="text-left p-4 text-slate-400 text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions
                          .filter(s => s.approval_status === submissionTab || 
                            (submissionTab === "pending" && s.approval_status === "Pending"))
                          .map((submission) => {
                            const statusBadge = getSubmissionStatusBadge(submission.approval_status);
                            const StatusIcon = statusBadge.icon;
                            
                            return (
                              <tr key={submission.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                <td className="p-4">
                                  <p className="text-white font-medium">{submission.title}</p>
                                  <p className="text-slate-400 text-xs">{submission.description?.slice(0, 60)}...</p>
                                </td>
                                <td className="p-4">
                                  <span className="px-2 py-1 bg-slate-700 rounded-lg text-xs text-slate-300">
                                    {submission.report_type}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <p className="text-white text-sm">{submission.submitted_by}</p>
                                  <p className="text-slate-400 text-xs">{submission.submitted_by_role}</p>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    submission.priority === "High" ? "bg-red-500/20 text-red-400" :
                                    submission.priority === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                                    "bg-blue-500/20 text-blue-400"
                                  }`}>
                                    {submission.priority}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                    <StatusIcon className="w-3 h-3 inline mr-1" />
                                    {submission.approval_status}
                                  </span>
                                  {submission.review_notes && (
                                    <p className="text-red-400 text-xs mt-1">Note: {submission.review_notes}</p>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    {submission.file_url && (
                                      <a
                                        href={submission.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 bg-slate-600/20 hover:bg-slate-600/30 rounded-lg text-slate-400 transition-colors"
                                        title="View File"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </a>
                                    )}
                                    {submission.approval_status === "Pending" && (
                                      <>
                                        <button
                                          onClick={() => handleApproveSubmission(submission.id)}
                                          disabled={actionLoading === submission.id}
                                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-colors disabled:opacity-50"
                                          title="Approve"
                                        >
                                          {actionLoading === submission.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <CheckCircle className="w-4 h-4" />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => handleRejectSubmission(submission.id)}
                                          disabled={actionLoading === submission.id}
                                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                                          title="Reject"
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                    {submission.approval_status === "Rejected" && (
                                      <button
                                        onClick={() => {
                                          if (confirm("Do you want to reopen this submission for review?")) {
                                            supabase
                                              .from("submissions")
                                              .update({
                                                approval_status: "Pending",
                                                status: "Pending",
                                                review_notes: null,
                                              })
                                              .eq("id", submission.id)
                                              .then(() => fetchSubmissions(selectedCountry));
                                          }
                                        }}
                                        className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 transition-colors"
                                        title="Reopen for Review"
                                      >
                                        <RefreshCw className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        {submissions.filter(s => s.approval_status === submissionTab || 
                          (submissionTab === "pending" && s.approval_status === "Pending")).length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400">
                              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                              <p>No {submissionTab} submissions found</p>
                              <p className="text-sm mt-1">
                                {submissionTab === "pending" 
                                  ? "All submissions have been reviewed" 
                                  : submissionTab === "approved"
                                  ? "No approved submissions yet"
                                  : "No rejected submissions"}
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

        {/* Care Systems Tab */}
        {activeTab === "care-systems" && (
          <div className="space-y-6">
            {/* PHC Integration */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                PHC Integration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Integration Score</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold text-cyan-400">{careSystem?.phc_integration_score || 0}%</p>
                    <span className="text-slate-500 text-sm">Target: ≥75%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${careSystem?.phc_integration_score || 0}%` }}></div>
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Facilities with MH Services</p>
                  <p className="text-2xl font-bold text-white">
                    {careSystem?.phc_facilities_with_mh || 0} / {careSystem?.phc_facilities_count || 0}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">{((careSystem?.phc_facilities_with_mh || 0) / (careSystem?.phc_facilities_count || 1) * 100).toFixed(1)}% coverage</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Providers Trained</p>
                  <p className="text-2xl font-bold text-white">{careSystem?.phc_providers_trained || 0}</p>
                  <p className="text-slate-500 text-sm mt-1">Community level</p>
                </div>
              </div>
            </div>

            {/* Workforce Mapping */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Mental Health Workforce
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Psychiatrists</p>
                  <p className="text-2xl font-bold text-white">{careSystem?.psychiatrists_total || 0}</p>
                  <p className="text-slate-500 text-xs">Ratio: 1:{careSystem?.psychiatrists_per_capita || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Psychologists</p>
                  <p className="text-2xl font-bold text-white">{careSystem?.psychologists_total || 0}</p>
                  <p className="text-slate-500 text-xs">{careSystem?.psychologists_total || 0} total</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Mental Health Nurses</p>
                  <p className="text-2xl font-bold text-white">{careSystem?.mental_health_nurses || 0}</p>
                  <p className="text-slate-500 text-xs">Community based</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">CHWs Trained</p>
                  <p className="text-2xl font-bold text-white">{careSystem?.chw_trained_in_mh || 0}</p>
                  <p className="text-slate-500 text-xs">of {careSystem?.community_health_workers_total || 0} total</p>
                </div>
              </div>
              {careSystem?.vacancy_rate && (
                <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-red-400 text-sm">Vacancy Rate: {careSystem.vacancy_rate}%</p>
                  <p className="text-slate-400 text-xs">Workforce gap analysis available</p>
                </div>
              )}
            </div>

            {/* Service Delivery & Integration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Service Delivery
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Score</span>
                    <span className="text-white font-bold">{careSystem?.service_delivery_score || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Outpatient Visits</span>
                    <span className="text-white">{careSystem?.outpatient_visits || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Community Visits</span>
                    <span className="text-white">{careSystem?.community_visits || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telemedicine</span>
                    <span className="text-white">{careSystem?.telemedicine_consultations || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-400" />
                  Integration with Services
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">HIV Integration</span>
                    <span className="text-white">{careSystem?.hiv_integration_score || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">NCD Integration</span>
                    <span className="text-white">{careSystem?.ncd_integration_score || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Maternal Health</span>
                    <span className="text-white">{careSystem?.maternal_health_integration || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Youth Health</span>
                    <span className="text-white">{careSystem?.youth_health_integration || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Shifting */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                Task Shifting Strategies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm ${careSystem?.task_shifting_implemented ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {careSystem?.task_shifting_implemented ? '✅ Implemented' : 'Not Implemented'}
                  </span>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Programs</p>
                  <p className="text-2xl font-bold text-white">{careSystem?.task_shifting_programs || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Providers Trained</p>
                  <p className="text-2xl font-bold text-white">{careSystem?.task_shifting_providers_trained || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financing Tab */}
        {activeTab === "financing" && (
          <div className="space-y-6">
            {/* Budget Overview */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                National Mental Health Budget
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Fiscal Year</p>
                  <p className="text-2xl font-bold text-white">{financing?.fiscal_year || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Total Health Budget</p>
                  <p className="text-2xl font-bold text-white">${((financing?.total_health_budget || 0) / 1000000).toFixed(1)}M</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Mental Health Budget</p>
                  <p className="text-2xl font-bold text-white">${((financing?.mental_health_budget || 0) / 1000000).toFixed(1)}M</p>
                </div>
                <div className={`rounded-xl p-4 ${(financing?.mh_percentage_of_health || 0) >= 5 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <p className="text-slate-400 text-sm">% of Health Budget</p>
                  <p className={`text-2xl font-bold ${(financing?.mh_percentage_of_health || 0) >= 5 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {financing?.mh_percentage_of_health || 0}%
                  </p>
                  <p className="text-slate-500 text-xs mt-1">Target: ≥5%</p>
                </div>
              </div>
            </div>

            {/* Donor Funding */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-blue-400" />
                Donor Funding & Investment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Total Donor Funding</p>
                  <p className="text-2xl font-bold text-blue-400">${((financing?.donor_funding_total || 0) / 1000000).toFixed(1)}M</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Active Projects</p>
                  <p className="text-2xl font-bold text-white">{financing?.donor_projects || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Investment Case</p>
                  <span className={`px-3 py-1 rounded-full text-sm ${financing?.investment_case_developed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {financing?.investment_case_developed ? '✅ Developed' : 'Not Developed'}
                  </span>
                </div>
              </div>
              {financing?.donor_organizations && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {financing.donor_organizations.map((org: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-slate-700 rounded-lg text-slate-300 text-sm">
                      {org}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Advocacy & Budget Increase */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-400" />
                Advocacy Impact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Advocacy Campaigns</p>
                  <p className="text-2xl font-bold text-white">{financing?.advocacy_campaigns || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Budget Increase</p>
                  <span className={`px-3 py-1 rounded-full text-sm ${financing?.budget_increase_achieved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {financing?.budget_increase_achieved ? `✅ ${financing.budget_increase_percentage}%` : 'Not Achieved'}
                  </span>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Target</p>
                  <p className="text-2xl font-bold text-emerald-400">{financing?.target_mh_budget_percentage || 5}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === "community" && (
          <div className="space-y-6">
            {/* Stigma & Attitudes */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Stigma & Social Attitudes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Stigma Index</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold text-pink-400">{communityDeterminants?.stigma_index || 0}</p>
                    <span className="text-slate-500 text-sm">/100</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Lower is better</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Discrimination Index</p>
                  <p className="text-2xl font-bold text-orange-400">{communityDeterminants?.discrimination_index || 0}</p>
                  <p className="text-slate-500 text-xs mt-1">/100</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Public Awareness</p>
                  <p className="text-2xl font-bold text-blue-400">{communityDeterminants?.public_awareness_percentage || 0}%</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Stigma Reduction Programs</p>
                  <p className="text-2xl font-bold text-white">{communityDeterminants?.stigma_reduction_programs || 0}</p>
                </div>
              </div>
            </div>

            {/* Community Engagement */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Community-Based Interventions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Community Programs</p>
                  <p className="text-2xl font-bold text-white">{communityDeterminants?.community_programs || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">CHWs Deployed</p>
                  <p className="text-2xl font-bold text-white">{communityDeterminants?.community_workers_deployed || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Sessions Held</p>
                  <p className="text-2xl font-bold text-white">{communityDeterminants?.community_sessions_held || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Peer Support Groups</p>
                  <p className="text-2xl font-bold text-white">{communityDeterminants?.peer_support_groups || 0}</p>
                </div>
              </div>
            </div>

            {/* Social Determinants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                  Social Determinants
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unemployment Rate</span>
                    <span className="text-white">{communityDeterminants?.unemployment_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Displacement</span>
                    <span className="text-white">{communityDeterminants?.displacement_count || 0} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Food Insecurity</span>
                    <span className="text-white">{communityDeterminants?.food_insecurity_level || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  Faith & Cultural Engagement
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Faith Organizations Engaged</span>
                    <span className="text-white">{communityDeterminants?.faith_organizations_engaged || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Traditional Healers Involved</span>
                    <span className="text-white">{communityDeterminants?.traditional_healers_involved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cultural Sensitivity Score</span>
                    <span className="text-white">{communityDeterminants?.cultural_sensitivity_score || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Well-being & Resilience */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Community Well-being & Resilience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Well-being Index</p>
                  <p className="text-3xl font-bold text-emerald-400">{communityDeterminants?.well_being_index || 0}</p>
                  <p className="text-slate-500 text-xs">/100</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Resilience Index</p>
                  <p className="text-3xl font-bold text-blue-400">{communityDeterminants?.resilience_index || 0}</p>
                  <p className="text-slate-500 text-xs">/100</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Social Cohesion</p>
                  <p className="text-3xl font-bold text-purple-400">{communityDeterminants?.social_cohesion_score || 0}</p>
                  <p className="text-slate-500 text-xs">/100</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-sm">Community Acceptance</p>
                  <p className="text-3xl font-bold text-pink-400">{communityDeterminants?.community_acceptance_score || 0}</p>
                  <p className="text-slate-500 text-xs">/100</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crisis Response Tab */}
        {activeTab === "crisis" && (
          <div className="space-y-6">
            {/* Early Warning Systems */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Early Warning & Alert Systems
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">System Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm ${crisisResponse?.early_warning_system_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {crisisResponse?.early_warning_system_active ? '✅ Active' : '❌ Inactive'}
                  </span>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Alert Level</p>
                  <p className={`text-2xl font-bold ${
                    crisisResponse?.alert_level === 'critical' ? 'text-red-400' :
                    crisisResponse?.alert_level === 'high' ? 'text-orange-400' :
                    crisisResponse?.alert_level === 'medium' ? 'text-yellow-400' :
                    'text-emerald-400'
                  }`}>
                    {crisisResponse?.alert_level || 'Normal'}
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Crises Monitored</p>
                  <p className="text-2xl font-bold text-white">{crisisResponse?.crises_monitored || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Active Crises</p>
                  <p className={`text-2xl font-bold ${(crisisResponse?.active_crises || 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {crisisResponse?.active_crises || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Rapid Response */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Rapid Response Capacity
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Response Teams</p>
                  <p className="text-2xl font-bold text-white">{crisisResponse?.rapid_response_teams || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Team Coverage</p>
                  <p className="text-2xl font-bold text-white">{crisisResponse?.team_coverage || 0}%</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Response Time</p>
                  <p className="text-2xl font-bold text-white">{crisisResponse?.response_time_hours || 0}h</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Trained Responders</p>
                  <p className="text-2xl font-bold text-white">{crisisResponse?.trained_responders || 0}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-700/30 rounded-xl">
                <p className="text-slate-300">
                  Status: {crisisResponse?.rapid_response_activated ? '🟢 Activated' : '🟡 Standby'}
                </p>
              </div>
            </div>

            {/* Psychosocial Support */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Psychosocial Support Services
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Teams Deployed</p>
                  <p className="text-2xl font-bold text-white">{crisisResponse?.psychosocial_teams_deployed || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Sessions Held</p>
                  <p className="text-2xl font-bold text-white">{crisisResponse?.psychosocial_sessions_held || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Beneficiaries Reached</p>
                  <p className="text-2xl font-bold text-white">{crisisResponse?.beneficiaries_reached || 0}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">MHFA Trained</p>
                  <p className="text-2xl font-bold text-white">{crisisResponse?.mental_health_first_aid_trained || 0}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-3">
                  <p className="text-slate-400 text-sm">Crisis Hotline</p>
                  <span className={`px-3 py-1 rounded-full text-sm ${crisisResponse?.crisis_hotline_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {crisisResponse?.crisis_hotline_active ? '✅ Active' : '❌ Inactive'}
                  </span>
                  {crisisResponse?.crisis_hotline_active && (
                    <p className="text-white mt-1">{crisisResponse.hotline_calls_received || 0} calls received</p>
                  )}
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3">
                  <p className="text-slate-400 text-sm">Online Support</p>
                  <span className={`px-3 py-1 rounded-full text-sm ${crisisResponse?.pss_supports_online ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {crisisResponse?.pss_supports_online ? '✅ Available' : '❌ Not Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Humanitarian Collaboration */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-blue-400" />
                Humanitarian Collaboration
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-sm">WHO</p>
                  <span className={crisisResponse?.who_collaboration ? 'text-emerald-400' : 'text-slate-500'}>
                    {crisisResponse?.who_collaboration ? '✅' : '❌'}
                  </span>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-sm">UNHCR</p>
                  <span className={crisisResponse?.unhcr_collaboration ? 'text-emerald-400' : 'text-slate-500'}>
                    {crisisResponse?.unhcr_collaboration ? '✅' : '❌'}
                  </span>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-sm">UNICEF</p>
                  <span className={crisisResponse?.unicef_collaboration ? 'text-emerald-400' : 'text-slate-500'}>
                    {crisisResponse?.unicef_collaboration ? '✅' : '❌'}
                  </span>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-sm">IFRC</p>
                  <span className={crisisResponse?.ifrc_collaboration ? 'text-emerald-400' : 'text-slate-500'}>
                    {crisisResponse?.ifrc_collaboration ? '✅' : '❌'}
                  </span>
                </div>
              </div>
              {crisisResponse?.humanitarian_agencies && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {crisisResponse.humanitarian_agencies.map((agency, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-700 rounded-lg text-slate-300 text-sm">
                      {agency}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 p-3 bg-slate-700/30 rounded-xl">
                <p className="text-slate-400 text-sm">Coordination Meetings</p>
                <p className="text-white font-bold">{crisisResponse?.coordination_meetings || 0}</p>
              </div>
            </div>

            {/* Crisis Impact & Recovery */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Impact & Recovery Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Crisis Impact Score</p>
                  <p className={`text-3xl font-bold ${(crisisResponse?.crisis_impact_score || 0) > 70 ? 'text-red-400' : (crisisResponse?.crisis_impact_score || 0) > 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {crisisResponse?.crisis_impact_score || 0}
                  </p>
                  <p className="text-slate-500 text-xs">/100</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Mental Health Impact</p>
                  <p className={`text-3xl font-bold ${(crisisResponse?.mh_impact_score || 0) > 70 ? 'text-red-400' : (crisisResponse?.mh_impact_score || 0) > 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {crisisResponse?.mh_impact_score || 0}
                  </p>
                  <p className="text-slate-500 text-xs">/100</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Recovery Progress</p>
                  <p className={`text-3xl font-bold ${(crisisResponse?.recovery_progress || 0) > 70 ? 'text-emerald-400' : (crisisResponse?.recovery_progress || 0) > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {crisisResponse?.recovery_progress || 0}%
                  </p>
                  <p className="text-slate-500 text-xs">Target: 100%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}