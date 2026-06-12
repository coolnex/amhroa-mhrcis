// app/signup/user/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Heart,
  Shield,
} from "lucide-react";

const userRoles = [
  { value: "Policymaker", label: "Policymaker", description: "Policy analytics and reform intelligence" },
  { value: "Researcher", label: "Researcher", description: "Access research repository and datasets" },
  { value: "CSO", label: "CSO / NGO", description: "Civil society organization portal" },
  { value: "Coordinator", label: "Country Coordinator", description: "National reporting and coordination" },
  { value: "Donor", label: "Donor / Investor", description: "Investment intelligence and funding" },
  { value: "Mental_Health_Professional", label: "Mental Health Professional", description: "Clinical resources and networking" },
];

const countries = [
  "Nigeria", "Kenya", "South Africa", "Ghana", "Rwanda", "Egypt", "Morocco",
  "Ethiopia", "Tanzania", "Uganda", "Senegal", "Zambia", "DR Congo", "Somalia"
];

export default function IndividualSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "Researcher",
    country: "",
    organization: "",
    agree_terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.full_name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!formData.agree_terms) {
      setError("Please agree to the terms and conditions");
      setLoading(false);
      return;
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
            country: formData.country,
            organization: formData.organization,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Insert into users table
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            id: authData.user.id,
            full_name: formData.full_name,
            email: formData.email,
            role: formData.role,
            status: "Pending",
            country: formData.country || null,
            organization: formData.organization || null,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Error inserting user:", insertError);
          // Continue anyway, the auth user is created
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Signup error:", err);
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
            <h2 className="text-2xl font-bold text-white mb-3">Registration Successful!</h2>
            <p className="text-slate-300 mb-4">
              Your account has been created and is pending approval. You will receive an email once approved.
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
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Individual Registration
            </h1>
            <p className="text-slate-400 mt-2">Create your professional account</p>
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
                <label className="text-slate-400 text-sm block mb-2">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white pr-10"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                >
                  {userRoles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1">
                  {userRoles.find(r => r.value === formData.role)?.description}
                </p>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Select your country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Organization (Optional)</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  placeholder="Your organization name"
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
                  I agree to the{" "}
                  <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                {loading ? "Creating Account..." : "Register"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-cyan-600/10 rounded-xl border border-cyan-500/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold">Account Approval Required</p>
                <p className="text-slate-400 text-xs mt-1">
                  All accounts require administrative approval before access is granted. 
                  You will receive an email notification once your account is approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}