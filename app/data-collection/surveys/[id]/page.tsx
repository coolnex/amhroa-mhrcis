// app/data-collection/surveys/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: any;
  created_at: string;
}

interface SurveyResponse {
  age_group: string;
  gender: string;
  country: string;
  stress_level: string;
  wellbeing: string;
  accessed_services: string;
  additional_comments: string;
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  
  const [responses, setResponses] = useState<SurveyResponse>({
    age_group: "",
    gender: "",
    country: "",
    stress_level: "",
    wellbeing: "",
    accessed_services: "",
    additional_comments: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);
    await fetchSurvey();
    await checkExistingResponse(user.id);
  };

  const fetchSurvey = async () => {
    setLoading(true);
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
      
      setSurvey(data);
    } catch (error) {
      console.error("Error fetching survey:", error);
      router.push("/data-collection/surveys");
    } finally {
      setLoading(false);
    }
  };

  const checkExistingResponse = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("id")
        .eq("survey_id", surveyId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setHasResponded(true);
      }
    } catch (error) {
      console.error("Error checking existing response:", error);
    }
  };

  const handleCountrySelect = (code: string, name: string) => {
    setSelectedCountryCode(code);
    setResponses(prev => ({ ...prev, country: name }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase.from("survey_responses").insert({
        survey_id: surveyId,
        user_id: user.id,
        responses: {
          age_group: responses.age_group,
          gender: responses.gender,
          country: responses.country,
          stress_level: responses.stress_level,
          wellbeing: responses.wellbeing,
          accessed_services: responses.accessed_services,
          additional_comments: responses.additional_comments,
        },
      });

      if (error) throw error;
      setSubmitted(true);
      setTimeout(() => {
        router.push("/data-collection/surveys");
      }, 3000);
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("Failed to submit survey. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-white mb-2">Already Completed</h2>
          <p className="text-slate-300 mb-4">You have already completed this survey.</p>
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
          <p className="text-slate-300 mb-4">Your responses have been submitted successfully.</p>
          <p className="text-slate-400 text-sm">Redirecting to surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="px-4 md:px-8 py-6">
        <Link href="/data-collection/surveys" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Surveys
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
            <div className="text-center mb-8">
              <div className="bg-cyan-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">{survey?.title}</h1>
              <p className="text-slate-400 mt-2">{survey?.description}</p>
              <div className="flex items-center justify-center gap-4 mt-4 text-slate-500 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {survey?.created_at ? new Date(survey.created_at).toLocaleDateString() : "Recently added"}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Anonymous & Confidential
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Demographic Section */}
              <div className="bg-slate-700/30 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Demographic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Age Group *</label>
                    <select
                      value={responses.age_group}
                      onChange={(e) => setResponses({ ...responses, age_group: e.target.value })}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select Age Group</option>
                      {ageGroups.map(age => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Gender *</label>
                    <select
                      value={responses.gender}
                      onChange={(e) => setResponses({ ...responses, gender: e.target.value })}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select Gender</option>
                      {genders.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-400 text-sm block mb-2">Country *</label>
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
                <h2 className="text-xl font-semibold text-white mb-4">Mental Health Assessment</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-slate-400 text-sm block mb-3">How often have you felt stressed? *</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {frequencyOptions.map(option => (
                        <label key={option} className={`flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          responses.stress_level === option 
                            ? "bg-cyan-600 text-white" 
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}>
                          <input
                            type="radio"
                            name="stress_level"
                            value={option}
                            checked={responses.stress_level === option}
                            onChange={(e) => setResponses({ ...responses, stress_level: e.target.value })}
                            className="hidden"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm block mb-3">How would you rate your mental wellbeing? *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {wellbeingOptions.map(option => (
                        <label key={option} className={`flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          responses.wellbeing === option 
                            ? "bg-cyan-600 text-white" 
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}>
                          <input
                            type="radio"
                            name="wellbeing"
                            value={option}
                            checked={responses.wellbeing === option}
                            onChange={(e) => setResponses({ ...responses, wellbeing: e.target.value })}
                            className="hidden"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm block mb-3">Have you accessed mental health services? *</label>
                    <div className="flex gap-4">
                      {yesNoOptions.map(option => (
                        <label key={option} className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg cursor-pointer transition-all ${
                          responses.accessed_services === option 
                            ? "bg-cyan-600 text-white" 
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}>
                          <input
                            type="radio"
                            name="accessed_services"
                            value={option}
                            checked={responses.accessed_services === option}
                            onChange={(e) => setResponses({ ...responses, accessed_services: e.target.value })}
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
                <h2 className="text-xl font-semibold text-white mb-4">Additional Comments</h2>
                <textarea
                  value={responses.additional_comments}
                  onChange={(e) => setResponses({ ...responses, additional_comments: e.target.value })}
                  rows={4}
                  placeholder="Please share any additional thoughts, experiences, or concerns..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Privacy Notice */}
              <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Your responses are anonymous and confidential. Data will be used for continental research purposes only.
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