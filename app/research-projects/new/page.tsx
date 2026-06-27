// app/research-projects/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewResearchProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lead: "",
    collaborators: 1,
    start_date: "",
    end_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr || "{}");

      const { error } = await supabase.from("research_projects").insert({
        ...formData,
        lead_id: user.id,
        status: "Pending",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      router.push("/mental-health-professional?tab=research");
    } catch (error) {
      console.error("Error creating research project:", error);
      alert("Failed to create research project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/mental-health-professional" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Create Research Project</h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Project Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                placeholder="e.g., African Mental Health Workforce Study"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none"
                placeholder="Describe the research objectives and methodology"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Lead Researcher *</label>
                <input
                  type="text"
                  value={formData.lead}
                  onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Collaborators</label>
                <input
                  type="number"
                  value={formData.collaborators}
                  onChange={(e) => setFormData({ ...formData, collaborators: parseInt(e.target.value) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Research Project"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}