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
  const [step, setStep] = useState<"email" | "sent" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  // ============================================================
  // STEP 1: Detect if user arrived via Supabase reset link
  // Supabase appends #access_token=...&type=recovery to the URL
  // The onAuthStateChange listener will fire with PASSWORD_RECOVERY
  // ============================================================
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      // Check if there's a code in the URL (PKCE flow) or hash (implicit flow)
      const code = searchParams.get("code");
      const hash = typeof window !== "undefined" ? window.location.hash : "";

      // Handle PKCE flow: exchange code for session
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Code exchange error:", error);
            if (mounted) {
              setError("Invalid or expired reset link. Please request a new one.");
              setStep("email");
            }
          } else if (data.session) {
            console.log("✅ Session established via PKCE code");
            if (mounted) {
              setSessionReady(true);
              setStep("reset");
            }
          }
        } catch (err) {
          console.error("Exchange error:", err);
        } finally {
          if (mounted) setCheckingSession(false);
        }
        return;
      }

      // Handle implicit flow: tokens in the hash
      if (hash && hash.includes("access_token")) {
        // Supabase client automatically picks this up via onAuthStateChange
        // We just wait for the event below
        console.log("🔗 Hash contains access_token, waiting for auth event...");
      }

      // Check if user already has a valid session (e.g., from a recovery link)
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        if (session) {
          console.log("✅ Existing session found");
          setSessionReady(true);
          setStep("reset");
        }
        setCheckingSession(false);
      }
    };

    checkSession();

    // Listen for Supabase auth events — this fires PASSWORD_RECOVERY
    // when the user clicks the reset link in their email
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔔 Auth event:", event);
        
        if (event === "PASSWORD_RECOVERY" && session) {
          console.log("✅ PASSWORD_RECOVERY event — user can now set a new password");
          if (mounted) {
            setSessionReady(true);
            setStep("reset");
            setError(null);
          }
        }
        
        if (event === "SIGNED_IN" && session && mounted) {
          // Could also be from a recovery link
          const hash = window.location.hash;
          if (hash.includes("type=recovery")) {
            setSessionReady(true);
            setStep("reset");
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [searchParams]);

  // ============================================================
  // STEP 2: Send reset email
  // ============================================================
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Reset email error:", error);
        // Don't reveal whether the email exists (security best practice)
        // but still show a message
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log("✅ Reset email sent");
      setStep("sent");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP 3: Set new password (user now has a session from email link)
  // ============================================================
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
      // Verify we actually have a session before attempting update
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError(
          "Your reset link has expired or is invalid. Please request a new password reset email."
        );
        setStep("email");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error("Update error:", updateError);
        setError(updateError.message || "Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      console.log("✅ Password updated successfully");
      
      // Sign out so user logs in fresh with new password
      await supabase.auth.signOut();
      
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

  // ============================================================
  // RENDER: Loading session check
  // ============================================================
  if (checkingSession) {
    return (
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Success
  // ============================================================
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

  // ============================================================
  // RENDER: Email sent confirmation
  // ============================================================
  if (step === "sent") {
    return (
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 text-center">
          <div className="bg-cyan-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
          <p className="text-slate-300 mb-2">
            We've sent a password reset link to:
          </p>
          <p className="text-cyan-400 font-medium mb-4">{email}</p>
          <p className="text-slate-400 text-sm mb-6">
            Click the link in the email to set a new password. The link expires in 1 hour.
          </p>
          <p className="text-slate-500 text-xs mb-6">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              try again
            </button>
            .
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Main form (email step OR reset step)
  // ============================================================
  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          {step === "reset" ? "Set New Password" : "Reset Password"}
        </h1>
        <p className="text-slate-400 mt-2">
          {step === "reset"
            ? "Create a new password for your account"
            : "Enter your email address to reset your password"}
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendResetEmail} className="space-y-5">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500"
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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mb-2">
              <p className="text-cyan-400 text-xs">
                ✅ Reset link verified. Please enter your new password below.
              </p>
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-11 pr-11 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
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
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-11 pr-11 py-3 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
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
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
          >
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
        <Suspense
          fallback={
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}