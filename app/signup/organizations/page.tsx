// app/signup/organizations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CountrySelect } from "@/components/ui/country-select";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const organizationTypes = [
  "Non-Governmental Organization (NGO)",
  "Community-Based Organization (CBO)",
  "Faith-Based Organization (FBO)",
  "Government Ministry",
  "Research Institution",
  "Academic Institution",
  "Hospital / Health Facility",
  "Development Partner",
  "Private Sector",
  "Professional Association",
  "Network/Coalition",
];

const regions = ["East Africa", "West Africa", "Southern Africa", "North Africa", "Central Africa", "Island States"];

const focusAreasOptions = [
  "Mental Health Advocacy", "Service Delivery", "Research", "Training & Capacity Building",
  "Policy Reform", "Suicide Prevention", "Youth Mental Health", "Workplace Mental Health",
  "Community Mental Health", "Substance Abuse", "Disability Rights", "Human Rights",
];

export default function OrganizationRegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    country: "",
    region: "",
    description: "",
    registration_number: "",
    website: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    focus_areas: [] as string[],
    agree_terms: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔐 Organization Registration - Verifying user...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.status === "Approved") {
            setUser(userData);
            setIsLoading(false);
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

      // 4. Check if user is approved
      if (userData.status !== "Approved") {
        router.push("/login?message=Account pending approval");
        return;
      }

      // 5. Cache user data
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCountrySelect = (code: string, name: string) => {
    setSelectedCountryCode(code);
    setFormData(prev => ({ ...prev, country: name }));
  };

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.agree_terms) {
      setError("Please agree to the terms and conditions");
      setLoading(false);
      return;
    }

    try {
      // Check if user is authenticated
      if (!user) {
        router.push("/login");
        return;
      }

      console.log("🔍 Registering organization for user:", user.id);

      // Insert organization
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: formData.name,
          type: formData.type,
          country: formData.country,
          region: formData.region,
          description: formData.description,
          registration_number: formData.registration_number || null,
          website: formData.website || null,
          contact_person: formData.contact_person,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          focus_areas: formData.focus_areas,
          created_by: user.id,
          status: "Pending",
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (orgError) {
        console.error("Organization insert error:", orgError);
        throw orgError;
      }

      console.log("✅ Organization created:", orgData.id);

      // Add user as organization member - FIXED: correct table name
      const { error: memError } = await supabase
        .from("organization_members")  // Changed from organizations_members to organization_members
        .insert({
          organization_id: orgData.id,
          user_id: user.id,
          role: "Admin",  // Changed from "Leader" to "Admin" to match your schema
          joined_at: new Date().toISOString(),
        });

      if (memError) {
        console.error("Member insert error:", memError);
        // Don't throw - the organization was created, just log the error
        console.warn("Member creation failed but organization was created");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/organizations");
      }, 3000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register organization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null
  if (!user) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center">
            <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Registration Submitted!</h2>
            <p className="text-slate-300 mb-4">
              Your organization has been registered and is pending approval.
            </p>
            <p className="text-slate-400 text-sm mb-6">Redirecting to dashboard...</p>
            <Link href="/organizations" className="text-cyan-400 hover:text-cyan-300">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Register Your Organization
            </h1>
            <p className="text-slate-400 mt-2">Join the continental mental health reform movement</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Organization Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                placeholder="Enter organization name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Organization Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Type</option>
                  {organizationTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Registration Number</label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., RC/12345/2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Country *</label>
                <CountrySelect 
                  value={selectedCountryCode} 
                  onChange={handleCountrySelect} 
                  required 
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Region *</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Region</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Contact Person *</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Full name of contact person"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Contact Email *</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="contact@organization.org"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Contact Phone *</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="https://example.org"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Focus Areas *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {focusAreasOptions.map(area => (
                  <label key={area} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.focus_areas.includes(area)}
                      onChange={() => handleFocusAreaToggle(area)}
                      className="w-4 h-4 accent-cyan-500"
                    />
                    <span className="text-slate-300 text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Organization Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-cyan-500"
                placeholder="Describe your organization's mission and work"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agree_terms"
                checked={formData.agree_terms}
                onChange={handleChange}
                required
                className="w-5 h-5 mt-0.5 accent-cyan-500"
              />
              <label className="text-slate-400 text-sm">
                I agree to the <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">Terms and Conditions</Link> and{" "}
                <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              {loading ? "Registering..." : "Register Organization"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold">Pending Approval</p>
                <p className="text-slate-400 text-xs mt-1">
                  Your organization will be reviewed by an administrator. You will receive a notification once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}