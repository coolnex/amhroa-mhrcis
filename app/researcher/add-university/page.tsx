// app/research/add-university/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  University,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Users,
  BookOpen,
  Award,
  Calendar,
  Plus,
  X,
  Image,
  FileText,
  Check,
  LogOut,
  Briefcase,
  Tag,
  Star,
  TrendingUp,
  DollarSign,
  Clock,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

// These will be stored in metadata JSONB
const researchAreas = [
  "Mental Health Research",
  "Policy Analysis",
  "Community Research",
  "Clinical Trials",
  "Data Science",
  "Public Health",
  "Health Economics",
  "Implementation Science",
  "Qualitative Research",
  "Quantitative Research",
  "Mixed Methods",
  "Epidemiology",
  "Health Systems",
  "Global Health",
  "Neuroscience",
  "Psychology",
  "Psychiatry",
  "Social Work",
  "Nursing",
  "Pharmacy",
  "Public Policy",
  "Health Law",
  "Bioethics",
  "Health Informatics",
];

const universityTypes = [
  "Public University",
  "Private University",
  "Research Intensive",
  "Comprehensive",
  "Specialized",
  "Technical University",
  "Open University",
  "Virtual University",
];

const regions = [
  "West Africa",
  "East Africa",
  "Central Africa",
  "Southern Africa",
  "North Africa",
  "Sahel Region",
  "Horn of Africa",
  "Great Lakes Region",
];

export default function AddUniversityPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Form state matching EXACT database columns
  const [formData, setFormData] = useState({
    // Core columns from database
    name: "",
    abbreviation: "",
    country: "",
    city: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    logo_url: "",
    status: "Pending",
    
    // Metadata fields (stored in JSONB)
    metadata: {
      type: "",
      region: "",
      established_year: new Date().getFullYear(),
      research_areas: [] as string[],
      active_researchers: 0,
      publications: 0,
      funding_received: 0,
      partnerships: 0,
      rating: 0,
      postal_code: "",
      motto: "",
      programs_offered: [] as string[],
      facilities: [] as string[],
    }
  });

  // UI state for dynamic lists
  const [newResearchArea, setNewResearchArea] = useState("");
  const [newProgram, setNewProgram] = useState("");
  const [newFacility, setNewFacility] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔐 Add University - Verifying security clearance...");

      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const allowedRoles = ["Researcher", "Admin", "University"];
          
          if (allowedRoles.includes(userData.role) && userData.status === "Approved") {
            setUser(userData);
            setIsAuthorized(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.push("/login");
        return;
      }

      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, country")
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        router.push("/login");
        return;
      }

      const allowedRoles = ["Researcher", "Admin", "University"];
      
      if (!allowedRoles.includes(userData.role)) {
        router.push("/dashboard");
        return;
      }

      if (userData.status !== "Approved") {
        router.push("/login?message=Account pending approval");
        return;
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthorized(true);
      
    } catch (error) {
      console.error("Critical error during security verification:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation - only required fields
    if (!formData.name.trim()) {
      setError("University name is required");
      return;
    }
    if (!formData.country) {
      setError("Country is required");
      return;
    }

    if (!user) {
      setError("You must be logged in to add a university");
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log("📝 Adding university for user:", user.id);

      // Prepare data matching EXACT database schema
      const insertData = {
        name: formData.name,
        abbreviation: formData.abbreviation || null,
        country: formData.country,
        city: formData.city || null,
        website: formData.website || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        description: formData.description || null,
        logo_url: formData.logo_url || null,
        status: formData.status,
        // Store all extra fields in metadata JSONB
        metadata: formData.metadata,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("📤 Inserting data:", insertData);

      const { data, error: insertError } = await supabase
        .from("universities")
        .insert(insertData)
        .select();

      if (insertError) {
        console.error("Supabase error:", insertError);
        setError(insertError.message || "Failed to add university");
        setSubmitting(false);
        return;
      }

      console.log("✅ University added successfully:", data);
      setSuccess(true);
      setTimeout(() => {
        router.push("/researcher");
      }, 2000);
    } catch (err: any) {
      console.error("Error adding university:", err);
      setError(err.message || "Failed to add university. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions for metadata arrays
  const addResearchArea = () => {
    if (newResearchArea.trim() && !formData.metadata.research_areas.includes(newResearchArea.trim())) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          research_areas: [...formData.metadata.research_areas, newResearchArea.trim()],
        }
      });
      setNewResearchArea("");
    }
  };

  const removeResearchArea = (area: string) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        research_areas: formData.metadata.research_areas.filter(a => a !== area),
      }
    });
  };

  const addProgram = () => {
    if (newProgram.trim() && !formData.metadata.programs_offered.includes(newProgram.trim())) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          programs_offered: [...formData.metadata.programs_offered, newProgram.trim()],
        }
      });
      setNewProgram("");
    }
  };

  const removeProgram = (program: string) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        programs_offered: formData.metadata.programs_offered.filter(p => p !== program),
      }
    });
  };

  const addFacility = () => {
    if (newFacility.trim() && !formData.metadata.facilities.includes(newFacility.trim())) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          facilities: [...formData.metadata.facilities, newFacility.trim()],
        }
      });
      setNewFacility("");
    }
  };

  const removeFacility = (facility: string) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        facilities: formData.metadata.facilities.filter(f => f !== facility),
      }
    });
  };

  // Helper to update metadata fields
  const updateMetadata = (field: string, value: any) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [field]: value,
      }
    });
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

  if (!isAuthorized || !user) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-2xl border border-emerald-500/30 p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">University Added!</h2>
          <p className="text-slate-300">Your university has been successfully added to the platform.</p>
          <p className="text-slate-400 text-sm mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-center mb-4">
            <Link href="/researcher" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
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

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    ADD UNIVERSITY
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Add University
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Register a university to the research network. Provide details about the institution.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Basic Information - Database Columns */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <University className="w-5 h-5 text-cyan-400" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-slate-400 text-sm block mb-2">University Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., University of Nairobi"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Abbreviation</label>
                <input
                  type="text"
                  value={formData.abbreviation}
                  onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                  placeholder="e.g., UoN"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 text-sm block mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the university..."
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Contact & Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Country *</label>
                <CountrySelect
                  value={selectedCountryCode}
                  onChange={(code, name) => {
                    setSelectedCountryCode(code);
                    setFormData({ ...formData, country: name });
                  }}
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 text-sm block mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@university.edu"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 text-sm block mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://university.edu"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-cyan-400" />
              Logo
            </h2>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Logo URL</label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://university.edu/logo.png"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Additional Information (stored in metadata) */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              Additional Information
              <span className="text-xs text-slate-500 font-normal ml-2">(stored in metadata)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">University Type</label>
                <select
                  value={formData.metadata.type}
                  onChange={(e) => updateMetadata("type", e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Type</option>
                  {universityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Region</label>
                <select
                  value={formData.metadata.region}
                  onChange={(e) => updateMetadata("region", e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Established Year</label>
                <input
                  type="number"
                  value={formData.metadata.established_year}
                  onChange={(e) => updateMetadata("established_year", parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Postal Code</label>
                <input
                  type="text"
                  value={formData.metadata.postal_code}
                  onChange={(e) => updateMetadata("postal_code", e.target.value)}
                  placeholder="Postal Code"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 text-sm block mb-2">Motto</label>
                <input
                  type="text"
                  value={formData.metadata.motto}
                  onChange={(e) => updateMetadata("motto", e.target.value)}
                  placeholder="University motto..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Research Areas - stored in metadata */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Research Areas
              <span className="text-xs text-slate-500 font-normal ml-2">(stored in metadata)</span>
            </h2>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newResearchArea}
                onChange={(e) => setNewResearchArea(e.target.value)}
                placeholder="Add research area..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResearchArea())}
              />
              <button
                type="button"
                onClick={addResearchArea}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.metadata.research_areas.map((area) => (
                <span key={area} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-300 text-sm flex items-center gap-2">
                  {area}
                  <button
                    type="button"
                    onClick={() => removeResearchArea(area)}
                    className="text-cyan-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {formData.metadata.research_areas.length === 0 && (
                <p className="text-slate-400 text-sm">No research areas added yet</p>
              )}
            </div>
          </div>

          {/* Statistics - stored in metadata */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              Statistics
              <span className="text-xs text-slate-500 font-normal ml-2">(stored in metadata)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Active Researchers</label>
                <input
                  type="number"
                  value={formData.metadata.active_researchers}
                  onChange={(e) => updateMetadata("active_researchers", parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Publications</label>
                <input
                  type="number"
                  value={formData.metadata.publications}
                  onChange={(e) => updateMetadata("publications", parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Funding Received ($)</label>
                <input
                  type="number"
                  value={formData.metadata.funding_received}
                  onChange={(e) => updateMetadata("funding_received", parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Partnerships</label>
                <input
                  type="number"
                  value={formData.metadata.partnerships}
                  onChange={(e) => updateMetadata("partnerships", parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.metadata.rating}
                  onChange={(e) => updateMetadata("rating", parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Programs & Facilities - stored in metadata */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Programs & Facilities
              <span className="text-xs text-slate-500 font-normal ml-2">(stored in metadata)</span>
            </h2>

            {/* Programs */}
            <div className="mb-6">
              <label className="text-slate-400 text-sm block mb-2">Programs Offered</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value)}
                  placeholder="Add program..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addProgram())}
                />
                <button
                  type="button"
                  onClick={addProgram}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.metadata.programs_offered.map((program) => (
                  <span key={program} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm flex items-center gap-2">
                    {program}
                    <button
                      type="button"
                      onClick={() => removeProgram(program)}
                      className="text-purple-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {formData.metadata.programs_offered.length === 0 && (
                  <p className="text-slate-400 text-sm">No programs added yet</p>
                )}
              </div>
            </div>

            {/* Facilities */}
            <div>
              <label className="text-slate-400 text-sm block mb-2">Facilities</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  placeholder="Add facility..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
                />
                <button
                  type="button"
                  onClick={addFacility}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.metadata.facilities.map((facility) => (
                  <span key={facility} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm flex items-center gap-2">
                    {facility}
                    <button
                      type="button"
                      onClick={() => removeFacility(facility)}
                      className="text-emerald-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {formData.metadata.facilities.length === 0 && (
                  <p className="text-slate-400 text-sm">No facilities added yet</p>
                )}
              </div>
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
                  Adding University...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Add University
                </>
              )}
            </button>

            <Link
              href="/researcher"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}