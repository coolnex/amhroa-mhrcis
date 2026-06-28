// app/data-collection/surveys/[id]/page.tsx
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Link from "next/link";

import { supabase } from "@/lib/supabase";

import {
  ArrowLeft,
  Heart,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  LogOut,
} from "lucide-react";

import { CountrySelect } from "@/components/ui/country-select";

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: any;
  created_at: string;
  type?: string;
}

// Dynamic response interface that can hold any field
interface SurveyResponse {
  [key: string]: any;
}

const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55+"];
const genders = ["Male", "Female", "Non-binary", "Prefer not to say"];
const frequencyOptions = ["Never", "Rarely", "Sometimes", "Often", "Always"];
const wellbeingOptions = ["Poor", "Fair", "Good", "Excellent"];
const yesNoOptions = ["Yes", "No"];

export default function SurveyFormPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [authError, setAuthError] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Dynamic responses object - can hold any question
  const [responses, setResponses] = useState<SurveyResponse>({});

  /* -------------------------------- */
  /* Draft Key                        */
  /* -------------------------------- */

  const draftKey = useMemo(() => `survey_${surveyId}_draft`, [surveyId]);

  /* -------------------------------- */
  /* Progress                         */
  /* -------------------------------- */

  const calculateProgress = useCallback(() => {
    if (!survey) return 0;
    
    const allQuestions = extractAllQuestions(survey.questions);
    const totalQuestions = allQuestions.length;
    
    if (totalQuestions === 0) return 0;
    
    // Count answered questions
    let answeredQuestions = 0;
    allQuestions.forEach((q: any) => {
      const value = responses[q.id];
      if (value !== undefined && value !== null && value !== "") {
        answeredQuestions++;
      }
    });
    
    return Math.round((answeredQuestions / totalQuestions) * 100);
  }, [survey, responses]);

  /* -------------------------------- */
  /* Load Draft                       */
  /* -------------------------------- */

  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem(draftKey);
      if (!draft) return;
      const parsed = JSON.parse(draft);
      setResponses((prev) => ({ ...prev, ...parsed }));
    } catch (err) {
      console.error("Error loading draft:", err);
    }
  }, [draftKey]);

  /* -------------------------------- */
  /* Save Draft                       */
  /* -------------------------------- */

  useEffect(() => {
    if (!user) return;

    const timeout = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(responses));
    }, 500);

    return () => clearTimeout(timeout);
  }, [responses, draftKey, user]);

  /* -------------------------------- */
  /* Update Field (Unified)           */
  /* -------------------------------- */

  const updateField = useCallback((field: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (formError) setFormError("");
  }, [formError]);

  /* -------------------------------- */
  /* Authentication                   */
  /* -------------------------------- */

  const checkAuth = useCallback(async () => {
    try {
      console.log("🔐 Survey Form - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.status === "Approved") {
            setUser(userData);
            setIsAuthorized(true);
            loadDraft();
            await Promise.all([fetchSurvey(), checkExistingResponse(userData.id)]);
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
        router.replace("/login");
        return;
      }

      // 3. Fetch structural profile record from public.users table
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, country")
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.replace("/login");
        return;
      }

      // 4. Approval Constraint Guard Rule
      if (userData.status !== "Approved") {
        console.log("Account is not yet marked as Approved.");
        router.replace("/login?message=Account pending approval");
        return;
      }

      // 5. Cache user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthorized(true);
      
      loadDraft();
      await Promise.all([fetchSurvey(), checkExistingResponse(userData.id)]);

    } catch (error) {
      console.error("Critical error encountered during security verification:", error);
      setAuthError("Authentication failed.");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router, surveyId, loadDraft]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /* -------------------------------- */
  /* Fetch Survey                     */
  /* -------------------------------- */

  const fetchSurvey = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .single();

      if (error) throw error;

      if (!data) {
        router.push("/data-collection/surveys");
        return;
      }

      console.log("📊 Survey data:", data);
      console.log("📊 Questions structure:", JSON.stringify(data.questions, null, 2));

      setSurvey(data);
    } catch (error) {
      console.error("Error fetching survey:", error);
      router.push("/data-collection/surveys");
    }
  };

  /* -------------------------------- */
  /* Check Existing Response          */
  /* -------------------------------- */

  const checkExistingResponse = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("id")
        .eq("survey_id", surveyId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      if (data) setHasResponded(true);
    } catch (error) {
      console.error("Error checking existing response:", error);
    }
  };

  /* -------------------------------- */
  /* Handle Country Select            */
  /* -------------------------------- */

  const handleCountrySelect = (code: string, name: string) => {
    setSelectedCountryCode(code);
    updateField("country", name);
  };

  /* -------------------------------- */
  /* Extract All Questions            */
  /* -------------------------------- */

  const extractAllQuestions = useCallback((obj: any): any[] => {
    const questions: any[] = [];
    if (!obj) return questions;
    
    // If it's an array, process each item
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        questions.push(...extractAllQuestions(item));
      });
      return questions;
    }
    
    // If it's an object
    if (typeof obj === 'object') {
      // Check if this is a question object
      if (obj.id && (obj.label || obj.text || obj.question) && obj.visible !== false) {
        questions.push(obj);
      }
      
      // Check for nested arrays/objects
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value && typeof value === 'object') {
          // Check if this is a questions array
          if (key === 'questions' || key === 'fields' || key === 'items') {
            questions.push(...extractAllQuestions(value));
          } else if (key !== 'id' && key !== 'label' && key !== 'type' && 
                     key !== 'required' && key !== 'options' && key !== 'placeholder' &&
                     key !== 'helpText' && key !== 'min' && key !== 'max' && key !== 'rows') {
            // Only recurse into non-question properties that might contain questions
            questions.push(...extractAllQuestions(value));
          }
        }
      });
    }
    
    return questions;
  }, []);

  /* -------------------------------- */
  /* Validate Form                    */
  /* -------------------------------- */

  const validateForm = () => {
    if (!survey) return false;
    
    const allQuestions = extractAllQuestions(survey.questions);
    const requiredQuestions = allQuestions.filter((q: any) => q.required === true);
    
    // Check each required question
    for (const q of requiredQuestions) {
      const value = responses[q.id];
      if (value === undefined || value === null || value === "") {
        setFormError(`Please answer: ${q.label || q.text || q.question || q.id}`);
        return false;
      }
    }
    
    return true;
  };

  // Add this check before attempting to submit
const checkCanSubmit = async () => {
  try {
    // Check if user exists and is approved
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, status")
      .eq("id", user.id)
      .single();
      
    if (userError || !userData) {
      console.error("User not found:", userError);
      return false;
    }
    
    if (userData.status !== "Approved") {
      setFormError("Your account must be approved to submit surveys.");
      return false;
    }
    
    // Check if survey exists and is active
    const { data: surveyData, error: surveyError } = await supabase
      .from("surveys")
      .select("id, status")
      .eq("id", surveyId)
      .single();
      
    if (surveyError || !surveyData) {
      setFormError("Survey not found.");
      return false;
    }
    
    if (surveyData.status !== "Active" && surveyData.status !== "published") {
      setFormError("This survey is no longer accepting responses.");
      return false;
    }
    
    // Check if user already submitted
    const { data: existing, error: existingError } = await supabase
      .from("survey_responses")
      .select("id")
      .eq("survey_id", surveyId)
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (existing) {
      setFormError("You have already completed this survey.");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking submission eligibility:", error);
    return false;
  }
};
  /* -------------------------------- */
  /* Handle Submit                    */
  /* -------------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to submit a survey.");
      router.push("/login");
      return;
    }

    if (!validateForm()) {
      return;
    }
    // Check if user can submit
    const canSubmit = await checkCanSubmit();
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setFormError("");
    
    try {
      // Extract all questions from the survey
      const allQuestions = extractAllQuestions(survey?.questions);
      console.log("📊 All questions extracted:", allQuestions);
      
      // Build response object with all question answers
      const responseData: any = {};
      
      // Add all question responses
      allQuestions.forEach((q: any) => {
        const value = responses[q.id];
        if (value !== undefined && value !== null && value !== "") {
          responseData[q.id] = value;
          console.log(`📊 Adding response for ${q.id}:`, value);
        }
      });
      
      // Also ensure demographic fields are included if they exist in the response
      const demographicFields = ['age_group', 'gender', 'country', 'stress_level', 'wellbeing', 'accessed_services', 'additional_comments'];
      demographicFields.forEach(field => {
        if (responses[field] !== undefined && responses[field] !== null && responses[field] !== "") {
          responseData[field] = responses[field];
          console.log(`📊 Adding demographic field ${field}:`, responses[field]);
        }
      });

      console.log("📊 Final response data:", responseData);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      // Insert the response
      const { data, error } = await supabase.from("survey_responses").insert({
        survey_id: surveyId,
        user_id: user.id,
        responses: responseData,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }).select();

      if (error) {
        console.error("❌ Supabase insert error:", error);
        
        // Check for specific error types
        if (error.code === '42501') {
          // RLS policy violation
          setFormError("You don't have permission to submit this survey. Please contact an administrator.");
        } else if (error.code === '23503') {
          // Foreign key violation
          setFormError("The survey you're trying to submit doesn't exist or has been removed.");
        } else if (error.code === '23505') {
          // Duplicate key violation (if there's a unique constraint)
          setFormError("You've already submitted this survey.");
        } else {
          setFormError(`Failed to submit: ${error.message}`);
        }
        return;
      }

      console.log("✅ Survey submitted successfully:", data);

      // Clear draft after successful submission
      localStorage.removeItem(draftKey);
      setSubmitted(true);
      setTimeout(() => {
        router.push("/data-collection/surveys");
      }, 3000);
      
    } catch (error: any) {
      console.error("❌ Error submitting survey:", error);
      
      if (error.message?.includes("JWT") || error.message?.includes("auth")) {
        setFormError("Your session has expired. Please log in again.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setFormError(error.message || "Failed to submit survey. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------------------- */
  /* Render Dynamic Question          */
  /* -------------------------------- */

  const renderQuestion = useCallback(
    (question: any, sectionIndex: number, questionIndex: number) => {
      const value = responses[question.id] || "";

      // Check conditional visibility
      if (question.conditional) {
        const conditionValue = responses[question.conditional.field];
        if (conditionValue !== question.conditional.value) {
          return null;
        }
      }

      // Skip if not visible
      if (question.visible === false) {
        return null;
      }

      switch (question.type) {
        case "text":
          return (
            <div key={question.id} className="mb-4">
              <label className="text-slate-300 text-sm block mb-2">
                {question.label}{" "}
                {question.required && <span className="text-red-400">*</span>}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => updateField(question.id, e.target.value)}
                placeholder={question.placeholder || ""}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                required={question.required}
              />
              {question.helpText && (
                <p className="text-slate-500 text-xs mt-1">{question.helpText}</p>
              )}
            </div>
          );

        case "textarea":
          return (
            <div key={question.id} className="mb-4">
              <label className="text-slate-300 text-sm block mb-2">
                {question.label}{" "}
                {question.required && <span className="text-red-400">*</span>}
              </label>
              <textarea
                value={value}
                onChange={(e) => updateField(question.id, e.target.value)}
                rows={question.rows || 3}
                placeholder={question.placeholder || ""}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                required={question.required}
              />
              {question.helpText && (
                <p className="text-slate-500 text-xs mt-1">{question.helpText}</p>
              )}
            </div>
          );

        case "number":
          return (
            <div key={question.id} className="mb-4">
              <label className="text-slate-300 text-sm block mb-2">
                {question.label}{" "}
                {question.required && <span className="text-red-400">*</span>}
              </label>
              <input
                type="number"
                min={question.min}
                max={question.max}
                value={value}
                onChange={(e) =>
                  updateField(
                    question.id,
                    e.target.value ? parseFloat(e.target.value) : ""
                  )
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required={question.required}
              />
              {question.helpText && (
                <p className="text-slate-500 text-xs mt-1">{question.helpText}</p>
              )}
            </div>
          );

        case "select":
          return (
            <div key={question.id} className="mb-4">
              <label className="text-slate-300 text-sm block mb-2">
                {question.label}{" "}
                {question.required && <span className="text-red-400">*</span>}
              </label>
              <select
                value={value}
                onChange={(e) => updateField(question.id, e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required={question.required}
              >
                <option value="">Select option...</option>
                {question.options?.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {question.helpText && (
                <p className="text-slate-500 text-xs mt-1">{question.helpText}</p>
              )}
            </div>
          );

        case "boolean":
          return (
            <div key={question.id} className="mb-4">
              <label className="text-slate-300 text-sm block mb-2">
                {question.label}{" "}
                {question.required && <span className="text-red-400">*</span>}
              </label>
              <div className="flex gap-4">
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                    value === true
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value="true"
                    checked={value === true}
                    onChange={() => updateField(question.id, true)}
                    className="hidden"
                  />
                  Yes
                </label>
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                    value === false
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value="false"
                    checked={value === false}
                    onChange={() => updateField(question.id, false)}
                    className="hidden"
                  />
                  No
                </label>
              </div>
              {question.helpText && (
                <p className="text-slate-500 text-xs mt-1">{question.helpText}</p>
              )}
            </div>
          );

        case "rating":
          return (
            <div key={question.id} className="mb-4">
              <label className="text-slate-300 text-sm block mb-2">
                {question.label}{" "}
                {question.required && <span className="text-red-400">*</span>}
              </label>
              <div className="flex gap-2">
                {Array.from({ length: question.max || 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => updateField(question.id, i + 1)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      value === i + 1
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              {question.helpText && (
                <p className="text-slate-500 text-xs mt-1">{question.helpText}</p>
              )}
            </div>
          );

        case "date":
          return (
            <div key={question.id} className="mb-4">
              <label className="text-slate-300 text-sm block mb-2">
                {question.label}{" "}
                {question.required && <span className="text-red-400">*</span>}
              </label>
              <input
                type="date"
                value={value}
                onChange={(e) => updateField(question.id, e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                required={question.required}
              />
              {question.helpText && (
                <p className="text-slate-500 text-xs mt-1">{question.helpText}</p>
              )}
            </div>
          );

        default:
          return null;
      }
    },
    [responses, updateField]
  );

  /* -------------------------------- */
  /* Get All Questions for Rendering  */
  /* -------------------------------- */

  const getVisibleSections = useCallback(() => {
    if (!survey?.questions) return [];
    
    // If questions is an array, use it directly
    if (Array.isArray(survey.questions)) {
      return survey.questions.filter((s: any) => s.visible !== false);
    }
    
    // If questions is an object, try to find sections
    if (typeof survey.questions === 'object') {
      if (survey.questions.sections) {
        return survey.questions.sections.filter((s: any) => s.visible !== false);
      }
      // Try to convert object to array
      return [survey.questions];
    }
    
    return [];
  }, [survey]);

  /* -------------------------------- */
  /* Check if survey has hardcoded demographics */
  /* -------------------------------- */

  const hasDemographicQuestions = useMemo(() => {
    if (!survey?.questions) return false;
    const allQuestions = extractAllQuestions(survey.questions);
    return allQuestions.some((q: any) => 
      q.id === 'age_group' || q.id === 'gender' || q.id === 'country' ||
      q.id === 'stress_level' || q.id === 'wellbeing' || q.id === 'accessed_services' ||
      q.id === 'additional_comments'
    );
  }, [survey]);

  /* -------------------------------- */
  /* Loading State                    */
  /* -------------------------------- */

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-red-500/10 rounded-2xl border border-red-500/30 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Authentication Error
          </h2>
          <p className="text-red-400 mb-4">{authError}</p>
          <p className="text-slate-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (hasResponded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Already Completed
          </h2>
          <p className="text-slate-300 mb-4">
            You have already completed this survey.
          </p>
          <Link
            href="/data-collection/surveys"
            className="inline-block px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
          >
            Back to Surveys
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-slate-300 mb-4">
            Your responses have been submitted successfully.
          </p>
          <p className="text-slate-400 text-sm">Redirecting to surveys...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Login Required
          </h2>
          <p className="text-slate-300 mb-4">
            Please log in to submit a survey.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const visibleSections = getVisibleSections();

  /* -------------------------------- */
  /* Main Render                      */
  /* -------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="px-4 md:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/data-collection/surveys"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Surveys
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
            {/* Survey Header */}
            <div className="text-center mb-8">
              <div className="bg-cyan-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">{survey?.title}</h1>
              <p className="text-slate-400 mt-2">{survey?.description}</p>
              <div className="flex items-center justify-center gap-4 mt-4 text-slate-500 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {survey?.created_at
                    ? new Date(survey.created_at).toLocaleDateString()
                    : "Recently added"}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Anonymous & Confidential
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Progress</span>
                <span>{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dynamic Sections from Survey */}
              {visibleSections.map((section: any, sectionIndex: number) => {
                const sectionQuestions = section.questions || section.fields || [];
                const visibleQuestions = sectionQuestions.filter((q: any) => q.visible !== false);
                
                if (visibleQuestions.length === 0) return null;
                
                return (
                  <div
                    key={section.id || sectionIndex}
                    className="bg-slate-700/30 rounded-xl p-6"
                  >
                    <h2 className="text-xl font-semibold text-white mb-4">
                      {section.sectionTitle || section.title || `Section ${sectionIndex + 1}`}
                    </h2>
                    <div className="space-y-4">
                      {visibleQuestions.map((question: any, questionIndex: number) =>
                        renderQuestion(question, sectionIndex, questionIndex)
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Hardcoded Demographic Section (only if not in dynamic questions) */}
              {!hasDemographicQuestions && (
                <>
                  {/* Demographic Section */}
                  <div className="bg-slate-700/30 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Demographic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">
                          Age Group *
                        </label>
                        <select
                          value={responses.age_group || ""}
                          onChange={(e) => updateField("age_group", e.target.value)}
                          required
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">Select Age Group</option>
                          {ageGroups.map((age) => (
                            <option key={age} value={age}>
                              {age}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">
                          Gender *
                        </label>
                        <select
                          value={responses.gender || ""}
                          onChange={(e) => updateField("gender", e.target.value)}
                          required
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">Select Gender</option>
                          {genders.map((gender) => (
                            <option key={gender} value={gender}>
                              {gender}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-slate-400 text-sm block mb-2">
                          Country *
                        </label>
                        <CountrySelect
                          value={selectedCountryCode}
                          onChange={handleCountrySelect}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assessment Questions */}
                  <div className="bg-slate-700/30 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Mental Health Assessment
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="text-slate-400 text-sm block mb-3">
                          How often have you felt stressed? *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {frequencyOptions.map((option) => (
                            <label
                              key={option}
                              className={`flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                responses.stress_level === option
                                  ? "bg-cyan-600 text-white"
                                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              }`}
                            >
                              <input
                                type="radio"
                                name="stress_level"
                                value={option}
                                checked={responses.stress_level === option}
                                onChange={(e) =>
                                  updateField("stress_level", e.target.value)
                                }
                                className="hidden"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 text-sm block mb-3">
                          How would you rate your mental wellbeing? *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {wellbeingOptions.map((option) => (
                            <label
                              key={option}
                              className={`flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                responses.wellbeing === option
                                  ? "bg-cyan-600 text-white"
                                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              }`}
                            >
                              <input
                                type="radio"
                                name="wellbeing"
                                value={option}
                                checked={responses.wellbeing === option}
                                onChange={(e) =>
                                  updateField("wellbeing", e.target.value)
                                }
                                className="hidden"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 text-sm block mb-3">
                          Have you accessed mental health services? *
                        </label>
                        <div className="flex gap-4">
                          {yesNoOptions.map((option) => (
                            <label
                              key={option}
                              className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg cursor-pointer transition-all ${
                                responses.accessed_services === option
                                  ? "bg-cyan-600 text-white"
                                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              }`}
                            >
                              <input
                                type="radio"
                                name="accessed_services"
                                value={option}
                                checked={responses.accessed_services === option}
                                onChange={(e) =>
                                  updateField("accessed_services", e.target.value)
                                }
                                className="hidden"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Comments */}
                  <div className="bg-slate-700/30 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Additional Comments
                    </h2>
                    <textarea
                      value={responses.additional_comments || ""}
                      onChange={(e) =>
                        updateField("additional_comments", e.target.value)
                      }
                      rows={4}
                      placeholder="Please share any additional thoughts, experiences, or concerns..."
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              )}

              {/* Privacy Notice */}
              <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Your responses are anonymous and confidential. Data will be
                  used for{" "}
                  {survey?.type === "internal"
                    ? "internal team improvements"
                    : "continental research purposes"}
                  .
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Survey
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}