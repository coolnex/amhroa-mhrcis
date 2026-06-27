// app/working-groups/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function NewWorkingGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First check localStorage
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      // Check Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push("/login?redirect=/working-groups/new");
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .single();

      if (profileError || !profile) {
        router.push("/login?redirect=/working-groups/new");
        return;
      }

      // Cache in localStorage
      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
      setIsLoading(false);

    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login?redirect=/working-groups/new");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("Please login to create a working group");
      }

      console.log("Creating working group...");

      // Insert working group
      const { data: groupData, error: groupError } = await supabase
        .from("working_groups")
        .insert({
          name: formData.name,
          description: formData.description,
          status: "Active",
          progress: 0,
          created_by: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (groupError) {
        console.error("Group insert error:", groupError);
        throw new Error(groupError.message);
      }

      console.log("Working group created:", groupData);

      // Add creator as member with Lead role
      const { error: memberError } = await supabase
        .from("working_group_members")
        .insert({
          working_group_id: groupData.id,
          user_id: user.id,
          role: "Lead",
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        console.error("Member insert error:", memberError);
        // Don't throw, just log - group was created successfully
      }

      router.push("/working-groups");
    } catch (err) {
      console.error("Error creating working group:", err);
      setError(err instanceof Error ? err.message : "Failed to create working group");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/working-groups" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Working Groups
        </Link>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Create Working Group</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Group Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="e.g., Policy & Advocacy Working Group"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Describe the purpose and goals of this working group"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? "Creating..." : "Create Working Group"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}