// app/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  User,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const cleanAndValidateEmail = (rawEmail: string): string | null => {
    try {
      let decoded = rawEmail;
      while (decoded.includes("%")) {
        try {
          const newDecoded = decodeURIComponent(decoded);
          if (newDecoded === decoded) break;
          decoded = newDecoded;
        } catch {
          break;
        }
      }
      
      const cleanEmail = decoded.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      return emailRegex.test(cleanEmail) ? cleanEmail : null;
    } catch {
      return null;
    }
  };

  const checkUserExists = async (emailToCheck: string) => {
    try {
      console.log("🔍 Checking if user exists:", emailToCheck);
      
      // First check if user exists in auth.users
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id, email')
        .eq('email', emailToCheck);
      
      if (authError) {
        console.error("Auth check error:", authError);
      }
      
      // Check if user exists in public.users table
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, full_name, email, auth_user_id")
        .eq("email", emailToCheck)
        .single();

      if (userError || !user) {
        console.log("❌ User not found in public.users");
        return null;
      }

      console.log("✅ User found:", user);
      return user;
    } catch (err) {
      console.error("Error checking user:", err);
      return null;
    }
  };

  const handleCheckEmailDirect = useCallback(async (emailToCheck: string) => {
    setCheckingEmail(true);
    setError(null);

    const emailValue = cleanAndValidateEmail(emailToCheck);
    if (!emailValue) {
      setError("The email provided in the link is invalid.");
      setCheckingEmail(false);
      setInitialCheckDone(true);
      return;
    }

    setEmail(emailValue);

    const user = await checkUserExists(emailValue);
    
    if (user) {
      setStep("reset");
    } else {
      setError("No account found with this email address. Please check and try again.");
    }
    
    setCheckingEmail(false);
    setInitialCheckDone(true);
  }, []);

  useEffect(() => {
    if (initialCheckDone) return;
    
    const emailParam = searchParams.get("email");
    if (emailParam && !initialCheckDone) {
      handleCheckEmailDirect(emailParam);
    } else {
      setInitialCheckDone(true);
    }
  }, [searchParams, handleCheckEmailDirect, initialCheckDone]);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    const user = await checkUserExists(email);
    
    if (user) {
      setStep("reset");
    } else {
      setError("No account found with this email address");
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
  
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
  
    try {
      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error("Update error:", updateError);
        setError(updateError.message || "Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      console.log("✅ Password updated successfully for user");
      
      setStep("success");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Reset error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center">
          <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Password Reset Successful!</h2>
          <p className="text-slate-300 mb-4">Your password has been reset successfully.</p>
          <p className="text-slate-400 text-sm mb-6">Redirecting to login...</p>
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (checkingEmail) {
    return (
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
            <p className="text-slate-300">Verifying your account...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          {step === "email" ? "Reset Password" : "Set New Password"}
        </h1>
        <p className="text-slate-400 mt-2">
          {step === "email" 
            ? "Enter your email address to reset your password"
            : `Create a new password`}
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleCheckEmail} className="space-y-5">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="text-slate-400 text-sm block mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-11 pr-11 py-3 text-white"
                  placeholder="Enter new password"
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
              <label className="text-slate-400 text-sm block mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-11 pr-11 py-3 text-white"
                  placeholder="Confirm new password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>

      <div className="mt-6 p-4 bg-cyan-600/10 rounded-xl border border-cyan-500/20">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-semibold">Need Help?</p>
            <p className="text-slate-400 text-xs mt-1">
              If you're having trouble resetting your password, please contact the system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <Suspense fallback={
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}