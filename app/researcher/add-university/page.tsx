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
  Upload,
  Image,
  Link2,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  FileText,
  Check,
  LogOut,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

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
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    country: "",
    region: "",
    website: "",
    contact_email: "",
    contact_phone: "",
    established_year: new Date().getFullYear(),
    research_areas: [] as string[],
    active_researchers: 0,
    publications: 0,
    funding_received: 0,
    partnerships: 0,
    rating: 0,
    status: "Active",
    logo_url: "",
    social_media: {
      twitter: "",
      linkedin: "",
      youtube: "",
      instagram: "",
    },
    address: "",
    city: "",
    postal_code: "",
    motto: "",
    accreditation: "",
    programs_offered: [] as string[],
    facilities: [] as string[],
  });

  const [newResearchArea, setNewResearchArea] = useState("");
  const [newProgram, setNewProgram] = useState("");
  const [newFacility, setNewFacility] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔐 Add University - Verifying security clearance...");

      // 1. First check localStorage for user profile
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
        .select("id, full_name, email, role, status, country")
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Authorization Guard Rule
      const allowedRoles = ["Researcher", "Admin", "University"];
      
      if (!allowedRoles.includes(userData.role)) {
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
    
    // Validation
    if (!formData.name.trim()) {
      setError("University name is required");
      return;
    }
    if (!formData.country) {
      setError("Country is required");
      return;
    }
    if (!formData.type) {
      setError("University type is required");
      return;
    }

    // Check if user is authenticated
    if (!user) {
      setError("You must be logged in to add a university");
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log("📝 Adding university for user:", user.id);

      const { data, error: insertError } = await supabase
        .from("universities")
        .insert({
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          country: formData.country,
          region: formData.region || null,
          website: formData.website || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          established_year: formData.established_year || null,
          research_areas: formData.research_areas,
          active_researchers: formData.active_researchers || 0,
          publications: formData.publications || 0,
          funding_received: formData.funding_received || 0,
          partnerships: formData.partnerships || 0,
          rating: formData.rating || 0,
          status: formData.status,
          logo_url: formData.logo_url || null,
          address: formData.address || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          motto: formData.motto || null,
          accreditation: formData.accreditation || null,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
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

  const addResearchArea = () => {
    if (newResearchArea.trim() && !formData.research_areas.includes(newResearchArea.trim())) {
      setFormData({
        ...formData,
        research_areas: [...formData.research_areas, newResearchArea.trim()],
      });
      setNewResearchArea("");
    }
  };

  const removeResearchArea = (area: string) => {
    setFormData({
      ...formData,
      research_areas: formData.research_areas.filter(a => a !== area),
    });
  };

  const addProgram = () => {
    if (newProgram.trim() && !formData.programs_offered.includes(newProgram.trim())) {
      setFormData({
        ...formData,
        programs_offered: [...formData.programs_offered, newProgram.trim()],
      });
      setNewProgram("");
    }
  };

  const removeProgram = (program: string) => {
    setFormData({
      ...formData,
      programs_offered: formData.programs_offered.filter(p => p !== program),
    });
  };

  const addFacility = () => {
    if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, newFacility.trim()],
      });
      setNewFacility("");
    }
  };

  const removeFacility = (facility: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter(f => f !== facility),
    });
  };

  // Show loading state
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

  // If not authorized, return null
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
                Register a university to the research network. Provide details about the institution, research areas, and facilities.
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
          {/* Basic Information */}
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

              <div>
                <label className="text-slate-400 text-sm block mb-2">University Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">Select Type</option>
                  {universityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

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
                <label className="text-slate-400 text-sm block mb-2">Region</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
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
                  value={formData.established_year}
                  onChange={(e) => setFormData({ ...formData, established_year: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 text-sm block mb-2">Motto</label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  placeholder="University motto..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://university.edu"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="admin@university.edu"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+234 800 000 0000"
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
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Location Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="text-slate-400 text-sm block mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Postal Code</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="Postal Code"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Research Areas */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Research Areas
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
              {formData.research_areas.map((area) => (
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
              {formData.research_areas.length === 0 && (
                <p className="text-slate-400 text-sm">No research areas added yet</p>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Active Researchers</label>
                <input
                  type="number"
                  value={formData.active_researchers}
                  onChange={(e) => setFormData({ ...formData, active_researchers: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Publications</label>
                <input
                  type="number"
                  value={formData.publications}
                  onChange={(e) => setFormData({ ...formData, publications: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Funding Received ($)</label>
                <input
                  type="number"
                  value={formData.funding_received}
                  onChange={(e) => setFormData({ ...formData, funding_received: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Partnerships</label>
                <input
                  type="number"
                  value={formData.partnerships}
                  onChange={(e) => setFormData({ ...formData, partnerships: parseInt(e.target.value) || 0 })}
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
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-cyan-400" />
              Logo URL
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

          {/* Accreditation */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              Accreditation
            </h2>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Accreditation Details</label>
              <textarea
                value={formData.accreditation}
                onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                placeholder="Accreditation bodies, certifications, etc."
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Programs Offered */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Programs Offered
            </h2>

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
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.programs_offered.map((program) => (
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
              {formData.programs_offered.length === 0 && (
                <p className="text-slate-400 text-sm">No programs added yet</p>
              )}
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Facilities
            </h2>

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
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.facilities.map((facility) => (
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
              {formData.facilities.length === 0 && (
                <p className="text-slate-400 text-sm">No facilities added yet</p>
              )}
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