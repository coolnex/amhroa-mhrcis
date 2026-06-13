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
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setCheckingSession(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!profile) {
        setCheckingSession(false);
        return;
      }

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
    
    switch (role?.toLowerCase()) {
      case "admin":
        console.log("Redirecting to /admin");
        router.push("/admin");
        break;

      case "policymaker":
      case "researcher":
      case "cso":
      case "coordinator":
      case "donor":
      case "mental_health_professional":
        console.log("Redirecting to /dashboard");
        router.push("/dashboard");
        break;

      default:
        console.log("Redirecting to /");
        router.push("/");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
  
    setLoading(true);
    setError("");
  
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
  
      const data = await response.json();
  
      console.log("LOGIN RESPONSE:", data);
  
      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
  
      console.log("Stored User:", localStorage.getItem("user"));
      console.log("User role:", data.user.role);
  
      // Small delay to ensure localStorage is set before redirect
      setTimeout(() => {
        redirectUser(data.user.role);
      }, 100);
  
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
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
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white">Welcome Back</h2>
              <p className="text-slate-400 mt-2">Sign in to AMHROA Portal</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
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
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign In"}
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
          </div>
        </div>
      </section>
    </main>
  );
}