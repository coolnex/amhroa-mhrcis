// app/coordinators/reform-data-entry/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Brain,
  Scale,
  Target,
  Users,
  DollarSign,
  Building2,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  LogOut,
  Save,
  Gavel,
  Heart,
  TrendingUp,
  Globe,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface ReformData {
  country_name: string;
  reform_tier: string;
  law_status: string;
  implementation_status: string;
  budget_level: string;
  priority_level: string;
  strategy: string;
  reform_score: number;
  implementation_score: number;
  sdg3_score: number;
  sdg10_score: number;
  sdg16_score: number;
  agenda2063_score: number;
  funding_gap_level: string;
  investment_priority: string;
  estimated_investment_need: number;
  donor_readiness_score: number;
}

const reformTiers = [
  "Tier 1 - System Failure",
  "Tier 2 - Law Exists / Limited Implementation",
  "Tier 3 - Outdated Laws",
  "Tier 4 - Moderate Systems",
  "Tier 5 - Mixed Systems",
];

const lawStatuses = [
  "No Law",
  "Outdated Law",
  "Modern Law",
  "Modern Law (Recent)",
];

const implementationStatuses = [
  "None",
  "Minimal",
  "Partial",
  "Substantial",
  "Full",
];

const budgetLevels = ["Very Low", "Low", "Medium", "High", "Very High"];

const priorityLevels = ["Crisis", "High", "Medium", "Low", "Model"];

const fundingGapLevels = ["Critical", "High", "Medium", "Low", "None"];

const investmentPriorities = [
  "Critical - Immediate Action Needed",
  "High - Priority Investment",
  "Medium - Strategic Investment",
  "Low - Monitor",
  "None",
];

export default function ReformDataEntry() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [existingData, setExistingData] = useState<any>(null);

  const [formData, setFormData] = useState<ReformData>({
    country_name: "",
    reform_tier: "",
    law_status: "",
    implementation_status: "",
    budget_level: "",
    priority_level: "",
    strategy: "",
    reform_score: 0,
    implementation_score: 0,
    sdg3_score: 0,
    sdg10_score: 0,
    sdg16_score: 0,
    agenda2063_score: 0,
    funding_gap_level: "",
    investment_priority: "",
    estimated_investment_need: 0,
    donor_readiness_score: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const coordinatorTypes = ["Coordinator", "researcher_coordinator", "mental_health_coordinator", "cso_coordinator"];
          
          if (coordinatorTypes.includes(userData.role) || userData.role === "Admin") {
            setUser(userData);
            const assignedCountry = userData.assigned_country || userData.country || "";
            setSelectedCountry(assignedCountry);
            setFormData(prev => ({ ...prev, country_name: assignedCountry }));
            
            if (assignedCountry) {
              await fetchExistingData(assignedCountry);
            }
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, country, assigned_country")
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        router.push("/login");
        return;
      }

      const coordinatorTypes = ["Coordinator", "researcher_coordinator", "mental_health_coordinator"];
      
      if (!coordinatorTypes.includes(userData.role) && userData.role !== "Admin") {
        router.push("/dashboard");
        return;
      }

      if (userData.status !== "Approved") {
        router.push("/login?message=Account pending approval");
        return;
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      const assignedCountry = userData.assigned_country || userData.country || "";
      setSelectedCountry(assignedCountry);
      setFormData(prev => ({ ...prev, country_name: assignedCountry }));
      
      if (assignedCountry) {
        await fetchExistingData(assignedCountry);
      }
      
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingData = async (country: string) => {
    try {
      // Fetch from mental_health_reforms
      const { data: reformsData } = await supabase
        .from("mental_health_reforms")
        .select("*")
        .eq("country_name", country)
        .maybeSingle();

      if (reformsData) {
        setExistingData(reformsData);
        setFormData({
          country_name: reformsData.country_name || country,
          reform_tier: reformsData.reform_tier || "",
          law_status: reformsData.law_status || "",
          implementation_status: reformsData.implementation_status || "",
          budget_level: reformsData.budget_level || "",
          priority_level: reformsData.priority_level || "",
          strategy: reformsData.strategy || "",
          reform_score: reformsData.reform_score || 0,
          implementation_score: reformsData.implementation_score || 0,
          sdg3_score: reformsData.sdg3_score || 0,
          sdg10_score: reformsData.sdg10_score || 0,
          sdg16_score: reformsData.sdg16_score || 0,
          agenda2063_score: reformsData.agenda2063_score || 0,
          funding_gap_level: reformsData.funding_gap_level || "",
          investment_priority: reformsData.investment_priority || "",
          estimated_investment_need: reformsData.estimated_investment_need || 0,
          donor_readiness_score: reformsData.donor_readiness_score || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching existing data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!formData.country_name) {
        throw new Error("Country name is required");
      }

      // 1. Insert/Update mental_health_reforms table
      const reformsData = {
        country_name: formData.country_name,
        reform_tier: formData.reform_tier || null,
        law_status: formData.law_status || null,
        implementation_status: formData.implementation_status || null,
        budget_level: formData.budget_level || null,
        priority_level: formData.priority_level || null,
        strategy: formData.strategy || null,
        reform_score: formData.reform_score || 0,
        implementation_score: formData.implementation_score || 0,
        sdg3_score: formData.sdg3_score || 0,
        sdg10_score: formData.sdg10_score || 0,
        sdg16_score: formData.sdg16_score || 0,
        agenda2063_score: formData.agenda2063_score || 0,
        funding_gap_level: formData.funding_gap_level || null,
        investment_priority: formData.investment_priority || null,
        estimated_investment_need: formData.estimated_investment_need || 0,
        donor_readiness_score: formData.donor_readiness_score || 0,
        created_at: new Date().toISOString(),
      };

      let reformsError;

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("mental_health_reforms")
          .update(reformsData)
          .eq("country_name", formData.country_name);
        reformsError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("mental_health_reforms")
          .insert(reformsData);
        reformsError = error;
      }

      if (reformsError) throw reformsError;

      // 2. Also update the countries table with relevant fields
      const countriesData = {
        country_name: formData.country_name,
        reform_score: formData.reform_score || 0,
        reform_tier: formData.reform_tier || null,
        legislation_score: formData.sdg16_score || 0, // SDG 16 relates to rule of law
        sdg_score: Math.round((formData.sdg3_score + formData.sdg10_score + formData.sdg16_score) / 3) || 0,
        implementation_score: formData.implementation_score || 0,
        budget_level: formData.budget_level || null,
        priority_level: formData.priority_level || null,
        law_status: formData.law_status || null,
        implementation_status: formData.implementation_status || null,
        sdg_3_4_score: formData.sdg3_score || 0,
        sdg_10_2_score: formData.sdg10_score || 0,
        sdg_16_3_score: formData.sdg16_score || 0,
        funding_gap_level: formData.funding_gap_level || null,
        investment_priority: formData.investment_priority || null,
        estimated_investment_need: formData.estimated_investment_need || 0,
        donor_readiness_score: formData.donor_readiness_score || 0,
        last_updated: new Date().toISOString(),
      };

      // Check if country exists in countries table
      const { data: existingCountry } = await supabase
        .from("countries")
        .select("id")
        .eq("country_name", formData.country_name)
        .maybeSingle();

      if (existingCountry) {
        const { error } = await supabase
          .from("countries")
          .update(countriesData)
          .eq("country_name", formData.country_name);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("countries")
          .insert(countriesData);
        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/coordinators");
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting data:", err);
      setError(err.message || "Failed to submit data. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const calculateAutoScores = () => {
    // Auto-calculate scores based on the form data
    const reformScore = Math.round(
      (formData.sdg3_score + formData.sdg10_score + formData.sdg16_score + formData.agenda2063_score) / 4
    );
    
    // Implementation score is weighted
    let implScore = formData.implementation_score || 0;
    
    // Adjust based on statuses
    if (formData.law_status === "No Law") implScore = Math.min(implScore, 20);
    if (formData.implementation_status === "None") implScore = Math.min(implScore, 10);
    
    setFormData(prev => ({
      ...prev,
      reform_score: reformScore,
      implementation_score: Math.min(implScore, 100),
    }));
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
        <div className="bg-slate-800/50 rounded-2xl border border-emerald-500/30 p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Data Submitted!</h2>
          <p className="text-slate-300">Reform data has been successfully updated.</p>
          <p className="text-slate-400 text-sm mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    REFORM DATA ENTRY
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400 text-xs">{selectedCountry}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Mental Health Reform Data Entry
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2">
                Enter or update reform metrics for {selectedCountry}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/coordinators"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Back</span>
              </Link>
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
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Country Info */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Country Information
              </h2>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Country Name *</label>
                <input
                  type="text"
                  value={formData.country_name}
                  onChange={(e) => setFormData({ ...formData, country_name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                  disabled
                />
                <p className="text-slate-500 text-xs mt-1">This is your assigned country</p>
              </div>
            </div>

            {/* Status & Tier */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                Status & Classification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Reform Tier</label>
                  <select
                    value={formData.reform_tier}
                    onChange={(e) => setFormData({ ...formData, reform_tier: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Tier</option>
                    {reformTiers.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Priority Level</label>
                  <select
                    value={formData.priority_level}
                    onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Priority</option>
                    {priorityLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Law Status</label>
                  <select
                    value={formData.law_status}
                    onChange={(e) => setFormData({ ...formData, law_status: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Law Status</option>
                    {lawStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Implementation Status</label>
                  <select
                    value={formData.implementation_status}
                    onChange={(e) => setFormData({ ...formData, implementation_status: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Implementation</option>
                    {implementationStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Reform Scores (0-100)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">SDG 3.4 Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.sdg3_score}
                    onChange={(e) => setFormData({ ...formData, sdg3_score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">SDG 10.2 Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.sdg10_score}
                    onChange={(e) => setFormData({ ...formData, sdg10_score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">SDG 16.3 Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.sdg16_score}
                    onChange={(e) => setFormData({ ...formData, sdg16_score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Agenda 2063 Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.agenda2063_score}
                    onChange={(e) => setFormData({ ...formData, agenda2063_score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Implementation Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.implementation_score}
                    onChange={(e) => setFormData({ ...formData, implementation_score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Donor Readiness Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.donor_readiness_score}
                    onChange={(e) => setFormData({ ...formData, donor_readiness_score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Funding */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                Funding & Investment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Funding Gap Level</label>
                  <select
                    value={formData.funding_gap_level}
                    onChange={(e) => setFormData({ ...formData, funding_gap_level: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Funding Gap</option>
                    {fundingGapLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Investment Priority</label>
                  <select
                    value={formData.investment_priority}
                    onChange={(e) => setFormData({ ...formData, investment_priority: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Priority</option>
                    {investmentPriorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Estimated Investment Need (USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimated_investment_need}
                    onChange={(e) => setFormData({ ...formData, estimated_investment_need: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Budget Level</label>
                  <select
                    value={formData.budget_level}
                    onChange={(e) => setFormData({ ...formData, budget_level: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Budget Level</option>
                    {budgetLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Strategy */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                Strategic Pathway
              </h2>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Strategy Description</label>
                <textarea
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Describe the strategic pathway for mental health reform..."
                />
              </div>
            </div>

            {/* Auto-calculate & Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={calculateAutoScores}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Auto-Calculate Scores
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {existingData ? "Update Reform Data" : "Submit Reform Data"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}