"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Heart,
} from "lucide-react";

interface SignupFormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: string;
  organization: string;
  country: string;
  agree_terms: boolean;
  agree_terms_message: String;
}

const userRoles = [
  { value: "Researcher", label: "Researcher", description: "Access research repository and datasets" },
  { value: "Policymaker", label: "Policymaker", description: "Policy analytics and reform intelligence" },
  { value: "CSO", label: "CSO / NGO", description: "Civil society organization portal" },
  { value: "Coordinator", label: "Country Coordinator", description: "National reporting and coordination" },
  { value: "Donor", label: "Donor / Investor", description: "Investment intelligence and funding" },
  { value: "Mental_Health_Professional", label: "Mental Health Professional", description: "Clinical resources and networking" },
];

const countries = [
  "Nigeria", "Kenya", "South Africa", "Ghana", "Rwanda", "Egypt", "Morocco",
  "Ethiopia", "Tanzania", "Uganda", "Senegal", "Zambia", "DR Congo", "Somalia"
];

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "Researcher",
    organization: "",
    country: "",
    agree_terms: false,
    agree_terms_message: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.length < 3) {
      newErrors.full_name = "Full name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (!formData.agree_terms) {
      newErrors.agree_terms_message = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
            organization: formData.organization,
            country: formData.country,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setServerError("This email is already registered. Please login instead.");
        } else {
          setServerError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Insert user profile into users table
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            full_name: formData.full_name,
            email: formData.email,
            role: formData.role,
            organization: formData.organization,
            country: formData.country,
            status: "Pending",
            created_at: new Date().toISOString(),
          },
        ]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't throw, just log - auth is already created
        }
      }

      // Show success message instead of immediate redirect
      setSuccess(true);
      setLoading(false);
      
      // Redirect after 3 seconds to allow user to read success message
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Signup error:", error);
      setServerError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for this field when user starts typing
    if (errors[name as keyof SignupFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center">
            <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Registration Successful!</h2>
            <p className="text-slate-300 mb-4">
              Thank you for registering with AMHROA. Please check your email to verify your account.
            </p>
            <p className="text-slate-400 text-sm mb-6">
              You will be redirected to the login page in a few seconds...
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-400 mt-2">Join the continental mental health reform movement</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          {serverError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-slate-400 text-sm block mb-2">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full bg-slate-700 border rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors ${
                    errors.full_name ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.full_name && (
                <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-slate-400 text-sm block mb-2">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-700 border rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors ${
                    errors.email ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-400 text-sm block mb-2">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-700 border rounded-xl pl-11 pr-11 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors ${
                    errors.password ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
              <p className="text-slate-500 text-xs mt-1">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-slate-400 text-sm block mb-2">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full bg-slate-700 border rounded-xl pl-11 pr-11 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors ${
                    errors.confirm_password ? "border-red-500" : "border-slate-600"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-400 text-xs mt-1">{errors.confirm_password}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="text-slate-400 text-sm block mb-2">Role *</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  {userRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-slate-500 text-xs mt-1">
                {userRoles.find(r => r.value === formData.role)?.description}
              </p>
            </div>

            {/* Organization */}
            <div>
              <label className="text-slate-400 text-sm block mb-2">Organization (Optional)</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                placeholder="Your organization name"
              />
            </div>

            {/* Country */}
            <div>
              <label className="text-slate-400 text-sm block mb-2">Country (Optional)</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select your country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agree_terms"
                checked={formData.agree_terms}
                onChange={handleChange}
                className="w-5 h-5 mt-0.5 accent-cyan-500 rounded"
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
            {errors.agree_terms && (
              <p className="text-red-400 text-xs">{errors.agree_terms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
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
  );
}