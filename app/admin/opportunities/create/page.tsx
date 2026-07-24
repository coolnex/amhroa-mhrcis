// app/admin/opportunities/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  LogOut,
  Plus,
  X,
  Globe,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Link2,
  Mail,
  Phone,
  FileText,
  Tag,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";
import { africanCountries } from "@/lib/countries-data";

const OPPORTUNITY_TYPES = [
  { value: "grant", label: "Grant" },
  { value: "job", label: "Job" },
  { value: "fellowship", label: "Fellowship" },
  { value: "training", label: "Training" },
  { value: "scholarship", label: "Scholarship" },
  { value: "internship", label: "Internship" },
  { value: "volunteer", label: "Volunteer" },
  { value: "consultancy", label: "Consultancy" },
  { value: "award", label: "Award" },
  { value: "competition", label: "Competition" },
];

const TARGET_AUDIENCES = [
  { value: "individuals", label: "Individuals" },
  { value: "organizations", label: "Organizations" },
  { value: "students", label: "Students" },
  { value: "researchers", label: "Researchers" },
  { value: "policymakers", label: "Policymakers" },
  { value: "cso", label: "CSOs" },
  { value: "youth", label: "Youth" },
  { value: "women", label: "Women" },
  { value: "rural", label: "Rural Communities" },
  { value: "urban", label: "Urban Communities" },
];

const COUNTRIES = africanCountries.map(c => c.name).sort();

const REGIONS = [
  "West Africa",
  "East Africa",
  "North Africa",
  "Southern Africa",
  "Central Africa",
  "Island States",
];

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    opportunity_type: "",
    target_audience: [] as string[],
    target_countries: [] as string[],
    target_regions: [] as string[],
    eligibility_criteria: "",
    application_deadline: "",
    start_date: "",
    end_date: "",
    funding_amount: "",
    funding_currency: "USD",
    organization_name: "",
    organization_logo: "",
    contact_email: "",
    contact_phone: "",
    website_url: "",
    application_url: "",
    application_instructions: "",
    documents_required: [] as string[],
    is_remote: false,
    location: "",
    status: "draft",
    visibility: "public",
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState("");
  const [newDocument, setNewDocument] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.role === "Admin" && userData.status === "Approved") {
          setUser(userData);
          setIsAuthorized(true);
          setLoading(false);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !userData || userData.role !== "Admin") {
        router.push("/dashboard");
        return;
      }

      setUser(userData);
      setIsAuthorized(true);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
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

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const addDocument = () => {
    if (newDocument.trim() && !formData.documents_required.includes(newDocument.trim())) {
      setFormData({ ...formData, documents_required: [...formData.documents_required, newDocument.trim()] });
      setNewDocument("");
    }
  };

  const removeDocument = (doc: string) => {
    setFormData({ ...formData, documents_required: formData.documents_required.filter(d => d !== doc) });
  };

  const toggleAudience = (audience: string) => {
    if (formData.target_audience.includes(audience)) {
      setFormData({ ...formData, target_audience: formData.target_audience.filter(a => a !== audience) });
    } else {
      setFormData({ ...formData, target_audience: [...formData.target_audience, audience] });
    }
  };

  const toggleCountry = (country: string) => {
    if (formData.target_countries.includes(country)) {
      setFormData({ ...formData, target_countries: formData.target_countries.filter(c => c !== country) });
    } else {
      setFormData({ ...formData, target_countries: [...formData.target_countries, country] });
    }
  };

  const toggleRegion = (region: string) => {
    if (formData.target_regions.includes(region)) {
      setFormData({ ...formData, target_regions: formData.target_regions.filter(r => r !== region) });
    } else {
      setFormData({ ...formData, target_regions: [...formData.target_regions, region] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { error } = await supabase
        .from("opportunities")
        .insert({
          ...formData,
          funding_amount: formData.funding_amount ? parseFloat(formData.funding_amount) : null,
          created_by: user.id,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/opportunities");
      }, 2000);
    } catch (err: any) {
      console.error("Error creating opportunity:", err);
      setError(err.message || "Failed to create opportunity");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-2xl border border-emerald-500/30 p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Opportunity Created!</h2>
          <p className="text-slate-300">Your opportunity has been successfully created.</p>
          <p className="text-slate-400 text-sm mt-2">Redirecting to opportunities list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/admin/opportunities" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Opportunities
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                <span className="text-cyan-300 text-xs font-mono tracking-wider">
                  CREATE OPPORTUNITY
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Create New Opportunity
            </h1>
            <p className="text-slate-400 mt-1">
              Post grants, jobs, fellowships, and more for African individuals and organizations
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., African Mental Health Innovation Grant"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-cyan-500"
                    placeholder="Describe the opportunity in detail..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Opportunity Type *</label>
                    <select
                      value={formData.opportunity_type}
                      onChange={(e) => setFormData({ ...formData, opportunity_type: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                      required
                    >
                      <option value="">Select Type</option>
                      {OPPORTUNITY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Organization Name *</label>
                  <input
                    type="text"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., African Mental Health Foundation"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Target Audience & Geography */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Target Audience & Geography
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Target Audience</label>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_AUDIENCES.map(audience => (
                      <button
                        key={audience.value}
                        type="button"
                        onClick={() => toggleAudience(audience.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          formData.target_audience.includes(audience.value)
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {audience.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Target Countries</label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2">
                    {COUNTRIES.map(country => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => toggleCountry(country)}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${
                          formData.target_countries.includes(country)
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Select specific countries or leave empty for all African countries</p>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Target Regions</label>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map(region => (
                      <button
                        key={region}
                        type="button"
                        onClick={() => toggleRegion(region)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          formData.target_regions.includes(region)
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Eligibility & Requirements */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                Eligibility & Requirements
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Eligibility Criteria</label>
                  <textarea
                    value={formData.eligibility_criteria}
                    onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-cyan-500"
                    placeholder="Who is eligible to apply? e.g., African-led organizations, Mental health professionals..."
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Required Documents</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newDocument}
                      onChange={(e) => setNewDocument(e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g., CV, Cover Letter, Proposal"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDocument())}
                    />
                    <button
                      type="button"
                      onClick={addDocument}
                      className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.documents_required.map((doc) => (
                      <span key={doc} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm flex items-center gap-2">
                        {doc}
                        <button
                          type="button"
                          onClick={() => removeDocument(doc)}
                          className="text-cyan-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates & Funding */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Dates & Funding
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Application Deadline</label>
                  <input
                    type="datetime-local"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Funding Amount</label>
                    <input
                      type="number"
                      value={formData.funding_amount}
                      onChange={(e) => setFormData({ ...formData, funding_amount: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                      placeholder="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Currency</label>
                    <select
                      value={formData.funding_currency}
                      onChange={(e) => setFormData({ ...formData, funding_currency: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="ZAR">ZAR</option>
                      <option value="KES">KES</option>
                      <option value="NGN">NGN</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Location
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_remote}
                    onChange={(e) => setFormData({ ...formData, is_remote: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label className="text-slate-300 text-sm">This opportunity is remote/virtual</label>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., Nairobi, Kenya (or Remote)"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Links */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-cyan-400" />
                Contact & Links
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="contact@organization.org"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Website URL</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="https://organization.org"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Application URL</label>
                  <input
                    type="url"
                    value={formData.application_url}
                    onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="https://organization.org/apply"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-slate-400 text-sm block mb-2">Application Instructions</label>
                <textarea
                  value={formData.application_instructions}
                  onChange={(e) => setFormData({ ...formData, application_instructions: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-cyan-500"
                  placeholder="How to apply, steps, special requirements..."
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-cyan-400" />
                Tags
              </h2>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm flex items-center gap-2">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-purple-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Opportunity
                  </>
                )}
              </button>

              <Link
                href="/admin/opportunities"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}