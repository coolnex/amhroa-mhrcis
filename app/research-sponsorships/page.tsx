// app/research-sponsorships/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Briefcase,
  DollarSign,
  MapPin,
  Building2,
  Calendar,
  CheckCircle,
  Target,
  Users,
  Award,
  TrendingUp,
  RefreshCw,
  Eye,
  Heart,
} from "lucide-react";
import Link from "next/link";

interface Sponsorship {
  id: string;
  funding_request_id: string;
  donor_id: string;
  amount: number;
  status: string;
  created_at: string;
  funding_request: {
    title: string;
    description: string;
    country: string;
    category: string;
    researcher: {
      full_name: string;
      organization: string;
    };
  };
  donor: {
    full_name: string;
    email: string;
    organization: string;
  };
}

export default function ResearchSponsorshipsPage() {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    checkUser();
    fetchSponsorships();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(profile?.role || "");
    }
  };

  const fetchSponsorships = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("research_sponsorships")
        .select(`
          *,
          funding_request:funding_request_id (
            title,
            description,
            country,
            category,
            researcher:researcher_id (
              full_name,
              organization
            )
          ),
          donor:donor_id (
            full_name,
            email,
            organization
          )
        `)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setSponsorships(data || []);
    } catch (error) {
      console.error("Error fetching sponsorships:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: sponsorships.length,
    totalAmount: sponsorships.reduce((sum, s) => sum + s.amount, 0),
    uniqueDonors: new Set(sponsorships.map(s => s.donor_id)).size,
    uniqueProjects: new Set(sponsorships.map(s => s.funding_request_id)).size,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading sponsorships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    RESEARCH SPONSORSHIP MARKETPLACE
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Research Sponsorships
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Track and manage your research sponsorships and investments in mental health reform across Africa.
              </p>
            </div>

            <button
              onClick={fetchSponsorships}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <p className="text-slate-400 text-xs">Total Sponsorships</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-xs">Total Invested</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">${(stats.totalAmount / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400 text-xs">Unique Donors</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.uniqueDonors}</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <p className="text-cyan-400 text-xs">Projects Funded</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{stats.uniqueProjects}</p>
          </div>
        </div>

        {/* Sponsorships List */}
        <div className="space-y-4">
          {sponsorships.map((sponsorship) => (
            <div key={sponsorship.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 hover:border-cyan-500/30 transition-all">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{sponsorship.funding_request?.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {sponsorship.funding_request?.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {sponsorship.funding_request?.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">${(sponsorship.amount / 1000).toFixed(0)}K</p>
                  <p className="text-slate-500 text-xs flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" />
                    {new Date(sponsorship.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Researcher</p>
                  <p className="text-white">{sponsorship.funding_request?.researcher?.full_name}</p>
                  <p className="text-slate-500 text-sm">{sponsorship.funding_request?.researcher?.organization}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Sponsor / Donor</p>
                  <p className="text-white">{sponsorship.donor?.full_name}</p>
                  <p className="text-slate-500 text-sm">{sponsorship.donor?.organization || "Individual Donor"}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href={`/funding-requests/${sponsorship.funding_request_id}`}
                  className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                >
                  View Project Details
                  <Eye className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sponsorships.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No sponsorships yet</p>
            <p className="text-slate-500 text-sm mt-2">Browse funding requests to start sponsoring research projects</p>
            <Link
              href="/funding-requests"
              className="inline-block mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
            >
              Explore Funding Opportunities
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}