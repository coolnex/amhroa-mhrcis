// app/login/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Shield,
  Globe,
  Users,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    clearChatState();
    checkSession();
  }, []);

  const clearChatState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_chat_id');
      localStorage.removeItem('guest_chat_name');
      supabase.removeAllChannels();
    }
  };

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setCheckingSession(false);
        return;
      }

      console.log("🔍 CheckSession - Session user ID:", session.user.id);

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      console.log("🔍 CheckSession - Profile:", profile);
      console.log("🔍 CheckSession - Profile Error:", profileError);

      if (profileError || !profile) {
        console.error("❌ CheckSession - Profile not found:", profileError);
        setCheckingSession(false);
        return;
      }

      // Check if user status is pending
      if (profile.status?.toLowerCase() === "pending") {
        setPendingMessage("Your account is pending approval. Please wait for an administrator to review your application.");
        setCheckingSession(false);
        // Sign out the user since they're not approved yet
        await supabase.auth.signOut();
        return;
      }

      clearChatState();
      redirectUser(profile.role);
    } catch (error) {
      console.log(error);
      setCheckingSession(false);
    } finally {
      setCheckingSession(false);
    }
  };

  const redirectUser = (role: string) => {
    console.log("Redirecting user with role:", role);
    clearChatState();
    
    switch (role?.toLowerCase()) {
      case "admin":
        router.push("/admin");
        break;
      case "policymaker":
        router.push("/policymaker");
        break;
      case "researcher":
        router.push("/researcher");
        break;
      case "cso":
        router.push("/organizations");
        break;
      case "regional_executive":
        router.push("/regional-executive");
        break;
      case "coordinator":
      case "researcher_coordinator":
      case "cso_coordinator":
      case "mental_health_coordinator":
        router.push("/coordinators");
        break;
      case "donor": 
        router.push("/donor");
        break;
      case "mental_health_professional":
        router.push("/mental-health-professional");
        break;
      default:
        router.push("/");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setPendingMessage(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const debugRLS = async (userId: string) => {
    console.log("🐛 ===== STARTING RLS DEBUG =====");
    console.log("🐛 User ID:", userId);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("🐛 Test 1 - Auth User:", user);
      console.log("🐛 Test 1 - Auth User Error:", userError);

      const { data: allUsers, error: allError } = await supabase
        .from("users")
        .select("*")
        .limit(1);

      const { data: userByAuthId, error: authIdError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId);

      const { data: userByEmail, error: emailError } = await supabase
        .from("users")
        .select("*")
        .eq("email", formData.email);

      const { data: userWithUid, error: uidError } = await supabase
        .from("users")
        .select("*")
        .eq("id", (await supabase.auth.getUser()).data.user?.id);
      console.log("🐛 Test 5 - User with auth.uid():", userWithUid);
      console.log("🐛 Test 5 - User with auth.uid() error:", uidError);

      const { data: count, error: countError } = await supabase
        .from("users")
        .select("*", { count: 'exact', head: true });
      console.log("🐛 Test 6 - Total users count:", count);
      console.log("🐛 Test 6 - Total users count error:", countError);

      setDebugInfo({
        user,
        allUsers,
        userByAuthId,
        userByEmail,
        userWithUid,
        count,
        errors: {
          userError,
          allError,
          authIdError,
          emailError,
          uidError,
          countError
        }
      });

    } catch (error) {
      console.error("🐛 RLS Debug Error:", error);
    }
    console.log("🐛 ===== END RLS DEBUG =====");
  };

  // app/login/page.tsx - Updated handleSubmit

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setDebugInfo(null);

  try {
    console.log("🔐 ===== STARTING LOGIN =====");
    console.log("🔐 Email:", formData.email);

    // Sign in with Supabase
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    console.log("🔐 SignIn response:", data);
    console.log("🔐 SignIn error:", signInError);

    if (signInError || !data.user) {
      setError(signInError?.message || "Invalid email or password");
      setLoading(false);
      return;
    }

    const userId = data.user.id;
    console.log("🔐 Auth User ID:", userId);

    // Load profile from users table
    console.log("🔐 Attempting to fetch profile");

    // Try with auth_user_id first
    let { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", userId)
      .maybeSingle();

    console.log("🔐 Profile by auth_user_id:", profile);
    console.log("🔐 Profile by auth_user_id error:", profileError);

    // If not found, try by id
    if (!profile) {
      console.log("🔐 Trying by id...");
      const { data: profileById, error: errorById } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      console.log("🔐 Profile by id:", profileById);
      console.log("🔐 Profile by id error:", errorById);
      
      if (profileById) {
        profile = profileById;
      }
    }

    // If still not found, try by email
    if (!profile) {
      console.log("🔐 Trying by email...");
      const { data: profileByEmail, error: emailError } = await supabase
        .from("users")
        .select("*")
        .eq("email", formData.email)
        .maybeSingle();
      
      console.log("🔐 Profile by email:", profileByEmail);
      console.log("🔐 Profile by email error:", emailError);
      
      if (profileByEmail) {
        profile = profileByEmail;
      }
    }

    if (!profile) {
      console.error("❌ Profile not found in any query");
      
      // Try to create the user from auth data
      console.log("🔐 Attempting to create user from auth data...");
      
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user) {
        const userMetadata = authUser.user.user_metadata || {};
        const newProfile = {
          id: authUser.user.id,
          full_name: userMetadata.full_name || authUser.user.email?.split('@')[0] || 'User',
          email: authUser.user.email,
          role: userMetadata.role || 'Researcher',
          status: 'Pending',
          auth_user_id: authUser.user.id,
          created_at: new Date().toISOString(),
        };
        
        const { data: inserted, error: insertError } = await supabase
          .from("users")
          .insert(newProfile)
          .select()
          .single();
          
        if (inserted) {
          profile = inserted;
          console.log("✅ Created new user profile:", profile);
        } else {
          console.error("❌ Failed to create user:", insertError);
        }
      }

      if (!profile) {
        setError("User profile not found. Please contact support.");
        setLoading(false);
        return;
      }
    }

    console.log("✅ Profile found:", profile);

    // Check user status
    if (profile.status?.toLowerCase() === "pending") {
      setPendingMessage("Your account is pending approval. Please wait for an administrator to review your application.");
      setLoading(false);
      await supabase.auth.signOut();
      return;
    }

    if (profile.status?.toLowerCase() === "rejected") {
      setError("Your account has been rejected. Please contact support for assistance.");
      setLoading(false);
      await supabase.auth.signOut();
      return;
    }

    // Store user profile in localStorage
    localStorage.setItem("user", JSON.stringify(profile));
    localStorage.setItem("session", JSON.stringify({
      user: data.user,
      expires_at: data.session?.expires_at
    }));

    console.log("✅ Login successful! Profile:", profile);
    console.log("🔐 ===== END LOGIN =====");

    // Redirect based on role
    redirectUser(profile.role);

  } catch (error) {
    console.error("❌ Login error:", error);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  // Show pending approval message if there is one
  if (pendingMessage) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-10 h-10 text-yellow-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Account Pending Approval</h2>
            <p className="text-slate-300 mb-6">{pendingMessage}</p>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-300 text-sm text-left">
                  If you have been waiting for more than 48 hours, please contact the system administrator at{" "}
                  <a href="mailto:support@amhroa.org" className="text-cyan-400 hover:underline">
                    support@amhroa.org
                  </a>
                </p>
              </div>
            </div>
            <Link 
              href="/login" 
              onClick={() => setPendingMessage(null)}
              className="inline-block px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex">
      {/* LEFT PANEL */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-cyan-950 via-slate-950 to-blue-950">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 blur-[140px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Image
              src="/logo.png"
              alt="AMHROA"
              width={120}
              height={120}
              className="mb-8"
            />
            <span className="inline-flex px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
              Continental Governance Platform
            </span>
            <h1 className="text-5xl font-bold text-white mt-8 leading-tight">
              African Mental Health Reform Observatory
            </h1>
            <p className="text-slate-300 mt-6 text-lg max-w-xl leading-relaxed">
              Empowering governments, researchers, donors, mental health professionals,
              and organizations with trusted governance data, research intelligence,
              reform monitoring, and collaboration opportunities across Africa.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <Globe className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-3xl font-bold text-white">54</h3>
              <p className="text-slate-400">Countries</p>
            </div>
            <div>
              <Users className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-3xl font-bold text-white">500+</h3>
              <p className="text-slate-400">Organizations</p>
            </div>
            <div>
              <FileText className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-3xl font-bold text-white">10K+</h3>
              <p className="text-slate-400">Reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Image src="/logo.png" alt="AMHROA" width={80} height={80} className="mx-auto" />
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <Image
                  src="/og-image.png"
                  alt="AMHROA Logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
              <h2 className="text-4xl font-bold text-white">Welcome Back</h2>
              <p className="text-slate-400 mt-2">Sign in to AMHROA Portal</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Info Message - Pending */}
            {pendingMessage && (
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
                <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Account Pending Approval</p>
                  <p className="text-yellow-200/70 text-sm mt-1">{pendingMessage}</p>
                </div>
              </div>
            )}

            {/* Debug Info */}
            {debugInfo && (
              <details className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <summary className="text-cyan-300 text-sm cursor-pointer font-medium">
                  🔍 Debug Info (Click to expand)
                </summary>
                <pre className="mt-2 text-xs text-slate-300 overflow-auto max-h-96">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-11 pr-12 py-3 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link href="/signup" className="block text-cyan-400 hover:text-cyan-300">
                Create Account
              </Link>
              <Link href="/forgot-password" className="block text-slate-400 hover:text-white">
                Forgot Password?
              </Link>
            </div>

            {/* Status Legend */}
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="flex justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Approved</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span>Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}