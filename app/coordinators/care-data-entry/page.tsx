// app/coordinator/data-entry/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  TRACKER_SURVEY_TEMPLATES, 
  getTrackerOptions,
  getTrackerTemplate 
} from "@/lib/survey_templates/tracker-templates";
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
  Heart,
  DollarSign,
  UserPlus,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import Link from "next/link";

// Icon mapping
const IconMap: Record<string, any> = {
  Heart: Heart,
  DollarSign: DollarSign,
  Users: Users,
  AlertCircle: AlertCircle,
  Gavel: Gavel,
  Scale: Scale,
};

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
  const [trackerOptions, setTrackerOptions] = useState<any[]>([]);

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
          const coordinatorTypes = ["Coordinator", "researcher_coordinator", "mental_health_coordinator"];
          
          if (coordinatorTypes.includes(userData.role) || userData.role === "Admin") {
            setUser(userData);
            const assignedCountry = userData.assigned_country || userData.country || "Kenya";
            setSelectedCountry(assignedCountry);
            
            // Get tracker options
            const options = getTrackerOptions();
            setTrackerOptions(options);
            
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
      const coordinatorTypes = ["Coordinator", "researcher_coordinator", "mental_health_coordinator"];
      
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

      // Get tracker options
      const options = getTrackerOptions();
      setTrackerOptions(options);
      
    } catch (error) {
      console.error("Critical error encountered during coordinator security verification:", error);
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

  // In your handleSubmit function, map form data to correct column names
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError("");

  try {
    const template = getTrackerTemplate(selectedTracker);
    if (!template) {
      throw new Error("Invalid tracker selected");
    }

    // Map form data to match actual column names
    let insertData: any = {
      country: selectedCountry,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Map based on tracker type
    switch (selectedTracker) {
      case "policy":
        insertData = {
          ...insertData,
          policy_name: formData.policy_name,
          policy_category: formData.policy_category,
          status: formData.status,
          progress_percentage: formData.progress_percentage,
          start_date: formData.start_date,
          target_completion: formData.target_completion,
          description: formData.description,
          challenges: formData.challenges,
          achievements: formData.achievements,
          // Don't include awareness_campaigns if it doesn't exist
        };
        break;

      case "suicide":
        insertData = {
          ...insertData,
          status: formData.status,
          legislation_status: formData.legislation_status,
          year_legislated: formData.year_legislated,
          progress_score: formData.progress_score,
          awareness_campaigns: formData.awareness_campaigns === "true",
          support_services: formData.support_services === "true",
          notes: formData.notes,
        };
        break;

      case "workforce":
        insertData = {
          ...insertData,
          year: formData.year,
          psychiatrists_total: formData.psychiatrists_total,
          psychologists_total: formData.psychologists_total,
          nurses_total: formData.nurses_total,
          social_workers_total: formData.social_workers_total,
          peer_support_workers: formData.peer_support_workers,
          training_programs: formData.training_programs,
          vacancies: formData.vacancies,
          government_spending: formData.government_spending,
          donor_support: formData.donor_support,
          // achievements column might not exist, so we'll skip it or add it conditionally
        };
        break;
    }

    console.log("📝 Inserting data:", insertData);

    const { error: insertError } = await supabase
      .from(template.tableName)
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

  const renderField = (field: any, sectionId: string) => {
    const value = formData[field.id] || "";
    const fieldId = `${sectionId}_${field.id}`;

    // Check conditional visibility
    if (field.conditional) {
      const conditionValue = formData[field.conditional.field];
      if (conditionValue !== field.conditional.value) {
        return null;
      }
    }

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="mb-4">
            <label className="text-slate-400 text-sm block mb-2">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              placeholder={field.placeholder || ""}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              required={field.required}
            />
            {field.helpText && (
              <p className="text-slate-500 text-xs mt-1">{field.helpText}</p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="mb-4">
            <label className="text-slate-400 text-sm block mb-2">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <input
              type="number"
              min={field.min}
              max={field.max}
              step={field.step || 1}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.id]: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              required={field.required}
            />
            {field.helpText && (
              <p className="text-slate-500 text-xs mt-1">{field.helpText}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="mb-4">
            <label className="text-slate-400 text-sm block mb-2">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {field.helpText && (
              <p className="text-slate-500 text-xs mt-1">{field.helpText}</p>
            )}
          </div>
        );

      case "boolean":
        return (
          <div key={field.id} className="mb-4">
            <label className="text-slate-400 text-sm block mb-2">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                value === true ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}>
                <input
                  type="radio"
                  name={field.id}
                  value="true"
                  checked={value === true}
                  onChange={() => setFormData({ ...formData, [field.id]: true })}
                  className="hidden"
                />
                Yes
              </label>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                value === false ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}>
                <input
                  type="radio"
                  name={field.id}
                  value="false"
                  checked={value === false}
                  onChange={() => setFormData({ ...formData, [field.id]: false })}
                  className="hidden"
                />
                No
              </label>
            </div>
            {field.helpText && (
              <p className="text-slate-500 text-xs mt-1">{field.helpText}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="mb-4">
            <label className="text-slate-400 text-sm block mb-2">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              rows={field.rows || 3}
              placeholder={field.placeholder || ""}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
              required={field.required}
            />
            {field.helpText && (
              <p className="text-slate-500 text-xs mt-1">{field.helpText}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderTrackerSections = () => {
    const template = getTrackerTemplate(selectedTracker);
    if (!template) return null;

    return template.sections.map((section: any) => (
      <div key={section.id} className="bg-slate-700/30 rounded-xl p-6 mb-6">
        <h3 className="text-white font-semibold text-lg mb-4">{section.title}</h3>
        <div className="space-y-2">
          {section.fields.map((field: any) => renderField(field, section.id))}
        </div>
      </div>
    ));
  };

  const getTrackerIcon = (iconName: string) => {
    const Icon = IconMap[iconName] || FileText;
    return Icon;
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

        <div className="max-w-4xl mx-auto">
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
                <label className="text-slate-400 text-sm block mb-3">Select Tracker *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {trackerOptions.map((option) => {
                    const Icon = getTrackerIcon(option.icon);
                    const isSelected = selectedTracker === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setSelectedTracker(option.id);
                          setFormData({});
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                            : "border-slate-700 hover:border-slate-500 hover:bg-slate-700/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? "bg-cyan-500/20" : "bg-slate-700/50"
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              isSelected ? "text-cyan-400" : "text-slate-400"
                            }`} />
                          </div>
                          <div>
                            <p className={`font-medium text-sm ${
                              isSelected ? "text-white" : "text-slate-300"
                            }`}>
                              {option.label}
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedTracker && (
                <>
                  {/* Common fields */}
                  <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
                    <h3 className="text-white font-semibold text-lg mb-4">Reporting Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Reporting Period *</label>
                        <input
                          type="month"
                          value={formData.reporting_period || new Date().toISOString().slice(0, 7)}
                          onChange={(e) => setFormData({ ...formData, reporting_period: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Reporting Date *</label>
                        <input
                          type="date"
                          value={formData.reporting_date || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setFormData({ ...formData, reporting_date: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic sections from template */}
                  {renderTrackerSections()}

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
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}