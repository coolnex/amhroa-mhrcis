// app/coordinator/data-entry/trackers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Heart, DollarSign, Users, AlertCircle, 
  Building2, TrendingUp, Handshake, Megaphone,
  Loader2, CheckCircle, ArrowLeft, Plus,
  X, Calendar, MapPin, FileText, Globe,
  Brain, Scale, Zap, Clock, Award, Target
} from "lucide-react";
import Link from "next/link";

const TRACKER_TYPES = {
  "care-systems": {
    label: "Care Systems Strengthening",
    icon: Heart,
    description: "Monitor PHC integration, workforce mapping, and service delivery",
    table: "care_system_metrics",
    color: "text-pink-400",
    bgColor: "bg-pink-500/20"
  },
  "financing": {
    label: "Financing & Budget Advocacy",
    icon: DollarSign,
    description: "Track mental health budgets, donor funding, and advocacy impact",
    table: "financing_metrics",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20"
  },
  "community": {
    label: "Community & Social Determinants",
    icon: Users,
    description: "Monitor stigma, community interventions, and social determinants",
    table: "community_determinants",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20"
  },
  "crisis": {
    label: "Crisis & Emergency Response",
    icon: AlertCircle,
    description: "Track early warning systems, rapid response, and psychosocial support",
    table: "crisis_response_metrics",
    color: "text-red-400",
    bgColor: "bg-red-500/20"
  }
};

// Dynamic form fields for each tracker type
const TRACKER_FIELDS: Record<string, any[]> = {
  "care-systems": [
    { name: "reporting_period", label: "Reporting Period", type: "select", options: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024", "Annual 2024"] },
    { name: "phc_integration_score", label: "PHC Integration Score", type: "number", min: 0, max: 100 },
    { name: "phc_facilities_count", label: "Total PHC Facilities", type: "number", min: 0 },
    { name: "phc_facilities_with_mh", label: "PHC Facilities with MH Services", type: "number", min: 0 },
    { name: "phc_providers_trained", label: "PHC Providers Trained", type: "number", min: 0 },
    { name: "psychiatrists_total", label: "Total Psychiatrists", type: "number", min: 0 },
    { name: "psychologists_total", label: "Total Psychologists", type: "number", min: 0 },
    { name: "mental_health_nurses", label: "Mental Health Nurses", type: "number", min: 0 },
    { name: "community_health_workers_total", label: "Community Health Workers", type: "number", min: 0 },
    { name: "chw_trained_in_mh", label: "CHWs Trained in MH", type: "number", min: 0 },
    { name: "outpatient_visits", label: "Outpatient Visits", type: "number", min: 0 },
    { name: "community_visits", label: "Community Visits", type: "number", min: 0 },
    { name: "telemedicine_consultations", label: "Telemedicine Consultations", type: "number", min: 0 },
    { name: "service_delivery_score", label: "Service Delivery Score", type: "number", min: 0, max: 100 },
    { name: "task_shifting_implemented", label: "Task Shifting Implemented", type: "checkbox" },
    { name: "task_shifting_programs", label: "Task Shifting Programs", type: "number", min: 0 },
    { name: "task_shifting_providers_trained", label: "Task Shifting Providers Trained", type: "number", min: 0 },
    { name: "hiv_integration_score", label: "HIV Integration Score", type: "number", min: 0, max: 100 },
    { name: "ncd_integration_score", label: "NCD Integration Score", type: "number", min: 0, max: 100 },
    { name: "maternal_health_integration", label: "Maternal Health Integration", type: "number", min: 0, max: 100 },
    { name: "youth_health_integration", label: "Youth Health Integration", type: "number", min: 0, max: 100 },
    { name: "vacancy_rate", label: "Vacancy Rate (%)", type: "number", min: 0, max: 100 },
  ],
  "financing": [
    { name: "fiscal_year", label: "Fiscal Year", type: "text" },
    { name: "total_health_budget", label: "Total Health Budget (USD)", type: "number", min: 0, step: 1000 },
    { name: "mental_health_budget", label: "Mental Health Budget (USD)", type: "number", min: 0, step: 1000 },
    { name: "mh_percentage_of_health", label: "MH % of Health Budget", type: "number", min: 0, max: 100 },
    { name: "mh_per_capita", label: "MH Per Capita (USD)", type: "number", min: 0, step: 0.01 },
    { name: "donor_funding_total", label: "Donor Funding Total (USD)", type: "number", min: 0, step: 1000 },
    { name: "donor_projects", label: "Active Donor Projects", type: "number", min: 0 },
    { name: "investment_case_developed", label: "Investment Case Developed", type: "checkbox" },
    { name: "advocacy_campaigns", label: "Advocacy Campaigns", type: "number", min: 0 },
    { name: "budget_increase_achieved", label: "Budget Increase Achieved", type: "checkbox" },
    { name: "budget_increase_percentage", label: "Budget Increase %", type: "number", min: 0, max: 100 },
    { name: "target_mh_budget_percentage", label: "Target MH Budget %", type: "number", min: 0, max: 100 },
  ],
  "community": [
    { name: "stigma_index", label: "Stigma Index (0-100)", type: "number", min: 0, max: 100 },
    { name: "discrimination_index", label: "Discrimination Index (0-100)", type: "number", min: 0, max: 100 },
    { name: "public_awareness_percentage", label: "Public Awareness %", type: "number", min: 0, max: 100 },
    { name: "community_programs", label: "Community Programs", type: "number", min: 0 },
    { name: "community_workers_deployed", label: "Community Workers Deployed", type: "number", min: 0 },
    { name: "community_sessions_held", label: "Community Sessions Held", type: "number", min: 0 },
    { name: "peer_support_groups", label: "Peer Support Groups", type: "number", min: 0 },
    { name: "unemployment_rate", label: "Unemployment Rate %", type: "number", min: 0, max: 100 },
    { name: "displacement_count", label: "Displacement Count", type: "number", min: 0 },
    { name: "faith_organizations_engaged", label: "Faith Organizations Engaged", type: "number", min: 0 },
    { name: "traditional_healers_involved", label: "Traditional Healers Involved", type: "number", min: 0 },
    { name: "cultural_sensitivity_score", label: "Cultural Sensitivity Score", type: "number", min: 0, max: 100 },
    { name: "stigma_reduction_programs", label: "Stigma Reduction Programs", type: "number", min: 0 },
    { name: "well_being_index", label: "Well-being Index (0-100)", type: "number", min: 0, max: 100 },
    { name: "social_cohesion_score", label: "Social Cohesion Score", type: "number", min: 0, max: 100 },
    { name: "community_acceptance_score", label: "Community Acceptance Score", type: "number", min: 0, max: 100 },
    { name: "resilience_index", label: "Resilience Index (0-100)", type: "number", min: 0, max: 100 },
  ],
  "crisis": [
    { name: "early_warning_system_active", label: "Early Warning System Active", type: "checkbox" },
    { name: "alert_level", label: "Alert Level", type: "select", options: ["Normal", "Medium", "High", "Critical"] },
    { name: "rapid_response_teams", label: "Rapid Response Teams", type: "number", min: 0 },
    { name: "team_coverage", label: "Team Coverage %", type: "number", min: 0, max: 100 },
    { name: "response_time_hours", label: "Response Time (Hours)", type: "number", min: 0 },
    { name: "rapid_response_activated", label: "Rapid Response Activated", type: "checkbox" },
    { name: "crises_monitored", label: "Crises Monitored", type: "number", min: 0 },
    { name: "active_crises", label: "Active Crises", type: "number", min: 0 },
    { name: "psychosocial_teams_deployed", label: "Psychosocial Teams Deployed", type: "number", min: 0 },
    { name: "psychosocial_sessions_held", label: "Psychosocial Sessions Held", type: "number", min: 0 },
    { name: "beneficiaries_reached", label: "Beneficiaries Reached", type: "number", min: 0 },
    { name: "crisis_hotline_active", label: "Crisis Hotline Active", type: "checkbox" },
    { name: "hotline_calls_received", label: "Hotline Calls Received", type: "number", min: 0 },
    { name: "mental_health_first_aid_trained", label: "MHFA Trained", type: "number", min: 0 },
    { name: "trained_responders", label: "Trained Responders", type: "number", min: 0 },
    { name: "crisis_impact_score", label: "Crisis Impact Score (0-100)", type: "number", min: 0, max: 100 },
    { name: "mh_impact_score", label: "MH Impact Score (0-100)", type: "number", min: 0, max: 100 },
    { name: "recovery_progress", label: "Recovery Progress %", type: "number", min: 0, max: 100 },
    { name: "coordination_meetings", label: "Coordination Meetings", type: "number", min: 0 },
    { name: "pss_supports_online", label: "PSS Supports Online", type: "checkbox" },
    { name: "who_collaboration", label: "WHO Collaboration", type: "checkbox" },
    { name: "unicef_collaboration", label: "UNICEF Collaboration", type: "checkbox" },
    { name: "unhcr_collaboration", label: "UNHCR Collaboration", type: "checkbox" },
    { name: "ifrc_collaboration", label: "IFRC Collaboration", type: "checkbox" },
  ]
};

export default function TrackerDataEntry() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTracker, setSelectedTracker] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔐 Tracker Data Entry - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const coordinatorTypes = ["Coordinator", "mental_health_coordinator"];
          
          if (coordinatorTypes.includes(userData.role) || userData.role === "Admin") {
            setUser(userData);
            const assignedCountry = userData.assigned_country || userData.country || "Kenya";
            setSelectedCountry(assignedCountry);
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
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Coordinator Authorization Guard Rule
      const coordinatorTypes = ["Coordinator", "mental_health_coordinator"];
      
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
      
    } catch (error) {
      console.error("Critical error encountered during coordinator security verification:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: Record<string, any>) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!selectedTracker) {
        throw new Error("Please select a tracker type");
      }

      const tracker = TRACKER_TYPES[selectedTracker as keyof typeof TRACKER_TYPES];
      if (!tracker) throw new Error("Invalid tracker selected");

      // Validate required fields
      const fields = TRACKER_FIELDS[selectedTracker] || [];
      for (const field of fields) {
        if (field.required && !formData[field.name]) {
          throw new Error(`Please fill in the ${field.label} field`);
        }
      }

      // Prepare data for insertion
      const insertData = {
        ...formData,
        country: selectedCountry,
        reporting_date: formData.reporting_date || new Date().toISOString().split('T')[0],
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log("📝 Inserting data:", insertData);

      const { error: insertError } = await supabase
        .from(tracker.table)
        .insert(insertData);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(insertError.message);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/coordinator");
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting data:", err);
      setError(err.message || "Failed to submit data. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTrackerForm = () => {
    if (!selectedTracker) return null;

    const fields = TRACKER_FIELDS[selectedTracker] || [];
    const tracker = TRACKER_TYPES[selectedTracker as keyof typeof TRACKER_TYPES];
    const Icon = tracker?.icon || FileText;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-700/30 rounded-xl">
          <Icon className={`w-6 h-6 ${tracker?.color || "text-cyan-400"}`} />
          <div>
            <p className="text-white font-medium">{tracker?.label}</p>
            <p className="text-slate-400 text-sm">{selectedCountry}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.name} className={field.type === "checkbox" ? "col-span-2" : ""}>
              <label className="text-slate-400 text-sm block mb-2">
                {field.label}
                {field.type !== "checkbox" && " *"}
              </label>
              
              {field.type === "select" ? (
                <select
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[field.name] || false}
                    onChange={(e) => handleInputChange(field.name, e.target.checked)}
                    className="w-5 h-5 accent-cyan-500 rounded"
                  />
                  <span className="text-slate-300">Yes</span>
                </label>
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(
                    field.name, 
                    field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value
                  )}
                  min={field.min || 0}
                  max={field.max}
                  step={field.step || 1}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
              {field.max && field.type === "number" && (
                <p className="text-slate-500 text-xs mt-1">Range: {field.min || 0} - {field.max}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="px-4 md:px-8 py-6">
        <Link href="/coordinator" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
            <h1 className="text-2xl font-bold text-white mb-2">Tracker Data Entry</h1>
            <p className="text-slate-400 mb-6">Submit data for {selectedCountry}</p>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-emerald-400 font-semibold">Data Submitted Successfully!</p>
                  <p className="text-slate-300 text-sm">Redirecting to dashboard...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="text-slate-400 text-sm block mb-2">Select Tracker *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(TRACKER_TYPES).map(([key, tracker]) => {
                    const Icon = tracker.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedTracker(key);
                          setFormData({});
                          setError("");
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedTracker === key
                            ? `border-cyan-500 ${tracker.bgColor}`
                            : "border-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${selectedTracker === key ? tracker.bgColor : "bg-slate-700/50"}`}>
                            <Icon className={`w-5 h-5 ${selectedTracker === key ? tracker.color : "text-slate-400"}`} />
                          </div>
                          <div>
                            <p className={`font-medium ${selectedTracker === key ? "text-white" : "text-slate-300"}`}>
                              {tracker.label}
                            </p>
                            <p className="text-slate-500 text-xs">{tracker.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedTracker && renderTrackerForm()}

              {selectedTracker && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Submit Data
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}