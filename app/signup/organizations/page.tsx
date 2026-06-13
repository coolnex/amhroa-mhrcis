// app/signup/organizations/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
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
  User,
  Loader2,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

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

export default function OrganizationSignupPage() {
  const router = useRouter();
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
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
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
      // Check if contact email already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", formData.contact_email)
        .single();

      if (existingUser) {
        setError("A user with this email already exists");
        setLoading(false);
        return;
      }

      // Generate random password for the admin user
      const tempPassword = Math.random().toString(36).slice(-12) + "A1!";
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const userId = crypto.randomUUID();

      // Create user account - using service role or handling RLS error
      const { error: userError } = await supabase
        .from("users")
        .insert({
          id: userId,
          full_name: formData.contact_person,
          email: formData.contact_email,
          password_hash: hashedPassword,
          role: "Organization",
          status: "Pending",
          country: formData.country,
          organization: formData.name,
          created_at: new Date().toISOString(),
        });

      if (userError) {
        console.error("User insert error:", userError);
        
        // If RLS error, try a different approach - insert without id
        if (userError.message.includes("row-level security")) {
          const { data: newUser, error: retryError } = await supabase
            .from("users")
            .insert({
              full_name: formData.contact_person,
              email: formData.contact_email,
              password_hash: hashedPassword,
              role: "Organization",
              status: "Pending",
              country: formData.country,
              organization: formData.name,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (retryError) {
            setError(retryError.message || "Failed to create account");
            setLoading(false);
            return;
          }
          
          // Update userId with the auto-generated ID
          const autoUserId = newUser.id;
          
          // Create organization with auto-generated user ID
          const { error: orgError } = await supabase
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
              created_by: autoUserId,
              status: "Pending",
              created_at: new Date().toISOString(),
            });

          if (orgError) {
            console.error("Organization insert error:", orgError);
            setError(orgError.message || "Failed to create organization");
            setLoading(false);
            return;
          }
        } else {
          setError(userError.message || "Failed to create account");
          setLoading(false);
          return;
        }
      } else {
        // Create organization with the provided user ID
        const { error: orgError } = await supabase
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
            created_by: userId,
            status: "Pending",
            created_at: new Date().toISOString(),
          });

        if (orgError) {
          console.error("Organization insert error:", orgError);
          setError(orgError.message || "Failed to create organization");
          setLoading(false);
          return;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-slate-400 text-sm mb-6">Redirecting to login...</p>
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex flex-col">
      <div className="px-6 md:px-8 py-6">
        <Link href="/signup" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Registration Options
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Organization Registration
            </h1>
            <p className="text-slate-400 mt-2">Register your organization</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
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
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Country *</label>
                  <CountrySelect value={selectedCountryCode} onChange={handleCountrySelect} required />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Region *</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Focus Areas *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {focusAreasOptions.map(area => (
                    <label key={area} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg cursor-pointer">
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
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none"
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
                  I agree to the <Link href="/terms" className="text-cyan-400">Terms and Conditions</Link> and{" "}
                  <Link href="/privacy" className="text-cyan-400">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                {loading ? "Registering..." : "Register Organization"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}