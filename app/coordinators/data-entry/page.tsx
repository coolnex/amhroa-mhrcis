// app/coordinator/data-entry/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SURVEY_TEMPLATES, createSurveyFromTemplate } from "@/lib/survey-templates";
import { getCountryByName } from "@/lib/countries-data";
import {
  FileText,
  Gavel,
  Scale,
  Users,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default function CoordinatorDataEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTracker, setSelectedTracker] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔐 Coordinator Data Entry - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const coordinatorTypes = ["Coordinator", "researcher_coordinator", "mental_health_coordinator", "cso_coordinator"];
          
          if (coordinatorTypes.includes(userData.role) || userData.role === "Admin") {
            setUser(userData);
            setIsAuthorized(true);
            
            // Get assigned country
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

      // 4. Check if user is authorized (Coordinator or Admin)
      const coordinatorTypes = ["Coordinator", "researcher_coordinator", "mental_health_coordinator"];
      
      if (!coordinatorTypes.includes(userData.role) && userData.role !== "Admin") {
        console.warn(`🛑 Unauthorized access attempt. User role "${userData.role}" is not authorized.`);
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
      setIsAuthorized(true);
      
      const assignedCountry = userData.assigned_country || userData.country || "Kenya";
      setSelectedCountry(assignedCountry);
      
    } catch (error) {
      console.error("Critical error encountered during security verification:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Get the appropriate template
      let template;
      let tableName;
      
      switch (selectedTracker) {
        case "policy":
          template = SURVEY_TEMPLATES.POLICY_IMPLEMENTATION;
          tableName = "policy_implementations";
          break;
        case "suicide":
          template = SURVEY_TEMPLATES.SUICIDE_DECRIMINALIZATION;
          tableName = "suicide_decriminalization";
          break;
        case "workforce":
          template = SURVEY_TEMPLATES.WORKFORCE_TRACKER;
          tableName = "mental_health_workforce";
          break;
        default:
          throw new Error("Invalid tracker selected");
      }

      // Prepare data for insertion
      const insertData = {
        ...formData,
        country: selectedCountry,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("📝 Inserting data:", insertData);

      // Insert data directly into the tracker tables
      const { error: insertError } = await supabase
        .from(tableName)
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
    switch (selectedTracker) {
      case "policy":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Policy Name *</label>
              <input
                type="text"
                value={formData.policy_name || ""}
                onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Policy Category *</label>
              <select
                value={formData.policy_category || ""}
                onChange={(e) => setFormData({ ...formData, policy_category: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required
              >
                <option value="">Select Category</option>
                <option value="Mental Health Act">Mental Health Act</option>
                <option value="Decriminalization">Decriminalization</option>
                <option value="Healthcare Access">Healthcare Access</option>
                <option value="Workforce Development">Workforce Development</option>
                <option value="Financing">Financing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Status *</label>
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required
              >
                <option value="">Select Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Progress Percentage *</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress_percentage || 0}
                onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date || ""}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Target Completion *</label>
                <input
                  type="date"
                  value={formData.target_completion || ""}
                  onChange={(e) => setFormData({ ...formData, target_completion: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Description</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Challenges</label>
              <textarea
                value={formData.challenges || ""}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                rows={2}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Achievements</label>
              <textarea
                value={formData.achievements || ""}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                rows={2}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        );

      case "suicide":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Status *</label>
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required
              >
                <option value="">Select Status</option>
                <option value="Criminalized">Criminalized</option>
                <option value="Under Consideration">Under Consideration</option>
                <option value="Partially Decriminalized">Partially Decriminalized</option>
                <option value="Decriminalized">Decriminalized</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Legislation Status *</label>
              <select
                value={formData.legislation_status || ""}
                onChange={(e) => setFormData({ ...formData, legislation_status: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required
              >
                <option value="">Select Legislation Status</option>
                <option value="No Legislation">No Legislation</option>
                <option value="Draft">Draft</option>
                <option value="Proposed">Proposed</option>
                <option value="Passed">Passed</option>
                <option value="Implemented">Implemented</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Year of Legislation</label>
              <input
                type="number"
                min="1900"
                max="2025"
                value={formData.year_legislated || ""}
                onChange={(e) => setFormData({ ...formData, year_legislated: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Progress Score (0-100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress_score || 0}
                onChange={(e) => setFormData({ ...formData, progress_score: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Awareness Campaigns *</label>
                <select
                  value={formData.awareness_campaigns || ""}
                  onChange={(e) => setFormData({ ...formData, awareness_campaigns: e.target.value === "true" })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Support Services *</label>
                <select
                  value={formData.support_services || ""}
                  onChange={(e) => setFormData({ ...formData, support_services: e.target.value === "true" })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Additional Notes</label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        );

      case "workforce":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Reporting Year *</label>
              <input
                type="number"
                min="2000"
                max="2025"
                value={formData.year || 2024}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Psychiatrists *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.psychiatrists_total || 0}
                  onChange={(e) => setFormData({ ...formData, psychiatrists_total: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Psychologists *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.psychologists_total || 0}
                  onChange={(e) => setFormData({ ...formData, psychologists_total: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Mental Health Nurses *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.nurses_total || 0}
                  onChange={(e) => setFormData({ ...formData, nurses_total: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Social Workers *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.social_workers_total || 0}
                  onChange={(e) => setFormData({ ...formData, social_workers_total: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Peer Support Workers *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.peer_support_workers || 0}
                  onChange={(e) => setFormData({ ...formData, peer_support_workers: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Training Programs *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.training_programs || 0}
                  onChange={(e) => setFormData({ ...formData, training_programs: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Vacancies *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.vacancies || 0}
                  onChange={(e) => setFormData({ ...formData, vacancies: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Government Spending (USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.government_spending || 0}
                  onChange={(e) => setFormData({ ...formData, government_spending: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Donor Support (USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.donor_support || 0}
                  onChange={(e) => setFormData({ ...formData, donor_support: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state
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

  // If not authorized, don't render the page
  if (!isAuthorized || !user) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Data Submitted!</h2>
          <p className="text-slate-300">Your tracker data has been successfully submitted.</p>
          <p className="text-slate-400 text-sm mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="px-4 md:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/coordinator" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
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

        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
            <h1 className="text-2xl font-bold text-white mb-2">Tracker Data Entry</h1>
            <p className="text-slate-400 mb-6">Submit data for <span className="text-cyan-400">{selectedCountry}</span></p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="text-slate-400 text-sm block mb-2">Select Tracker *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTracker("policy")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTracker === "policy"
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <Gavel className={`w-6 h-6 mx-auto mb-2 ${selectedTracker === "policy" ? "text-purple-400" : "text-slate-400"}`} />
                    <p className={`text-sm font-medium ${selectedTracker === "policy" ? "text-white" : "text-slate-400"}`}>Policy Implementation</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTracker("suicide")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTracker === "suicide"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <Scale className={`w-6 h-6 mx-auto mb-2 ${selectedTracker === "suicide" ? "text-emerald-400" : "text-slate-400"}`} />
                    <p className={`text-sm font-medium ${selectedTracker === "suicide" ? "text-white" : "text-slate-400"}`}>Suicide Decriminalization</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTracker("workforce")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTracker === "workforce"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <Users className={`w-6 h-6 mx-auto mb-2 ${selectedTracker === "workforce" ? "text-blue-400" : "text-slate-400"}`} />
                    <p className={`text-sm font-medium ${selectedTracker === "workforce" ? "text-white" : "text-slate-400"}`}>Workforce Tracker</p>
                  </button>
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