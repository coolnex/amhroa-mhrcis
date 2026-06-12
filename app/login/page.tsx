"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Heart,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Fetch user profile to verify role
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          
          if (profile) {
            localStorage.setItem("user", JSON.stringify(profile));
            const role = profile.role?.toLowerCase();
            const roleRedirects: Record<string, string> = {
              admin: "/admin",
              policymaker: "/dashboard",
              researcher: "/dashboard",
              cso: "/dashboard",
              coordinator: "/dashboard",
              donor: "/dashboard",
              mental_health_professional: "/dashboard",
            };
            const redirectPath = roleRedirects[role] || "/dashboard";
            router.push(redirectPath);
            return;
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Unable to authenticate. Please try again.");
        setLoading(false);
        return;
      }

      // Fetch user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile fetch error:", profileError);
        setError("User profile not found. Please contact support.");
        setLoading(false);
        await supabase.auth.signOut();
        return;
      }

      // Check if account is approved
      if (profile.status === "Pending") {
        setError("Your account is pending approval. You will receive an email once approved.");
        setLoading(false);
        await supabase.auth.signOut();
        return;
      }

      if (profile.status === "Rejected") {
        setError("Your account application was rejected. Please contact support for more information.");
        setLoading(false);
        await supabase.auth.signOut();
        return;
      }

      // Store user in localStorage
      const userData = {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
        organization: profile.organization,
        country: profile.country,
        status: profile.status,
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Store session in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      // Redirect based on role
      const role = profile.role?.toLowerCase();
      const roleRedirects: Record<string, string> = {
        admin: "/admin",
        policymaker: "/dashboard",
        researcher: "/dashboard",
        cso: "/dashboard",
        coordinator: "/dashboard",
        donor: "/dashboard",
        mental_health_professional: "/dashboard",
      };

      const redirectPath = roleRedirects[role] || "/dashboard";
      router.push(redirectPath);
      
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo - Fixed height to prevent layout shift */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Image
              src="/logo.png"
              alt="AMHROA Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        {/* Form Card - Fixed dimensions */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          {/* Error Message - Fixed height area */}
          <div className="mb-6 min-h-[80px]">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm font-semibold">Login Failed</p>
                  <p className="text-red-300/80 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="text-slate-400 text-sm block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-slate-400 text-sm block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-11 pr-11 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
                <span className="text-slate-400 text-sm">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box - Fixed height */}
        <div className="mt-6 p-4 bg-cyan-600/10 rounded-xl border border-cyan-500/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-semibold">Secure Access</p>
              <p className="text-slate-400 text-xs mt-1">
                Your credentials are encrypted and secure. Never share your password with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}