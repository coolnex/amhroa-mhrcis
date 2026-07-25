// app/opportunities/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Globe,
  Users,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Briefcase,
  GraduationCap,
  Heart,
  Award,
  TrendingUp,
  Building2,
  Mail,
  Phone,
  Link2,
  FileText,
  User,
  Check,
  Send,
  ChevronRight,
  Download,
  Eye,
  Tag,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail as MailIcon,
} from "lucide-react";
import { africanCountries } from "@/lib/countries-data";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunity_type: string;
  target_audience: string[];
  target_countries: string[];
  target_regions: string[];
  eligibility_criteria: string;
  application_deadline: string;
  start_date: string;
  end_date: string;
  funding_amount: number;
  funding_currency: string;
  organization_name: string;
  organization_logo: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  application_url: string;
  application_instructions: string;
  documents_required: string[];
  is_remote: boolean;
  location: string;
  status: string;
  views: number;
  applications_count: number;
  created_at: string;
  published_at: string;
  tags: string[];
  created_by: string;
}

interface Application {
  id: string;
  opportunity_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_organization: string;
  applicant_country: string;
  applicant_role: string;
  cover_letter: string;
  resume_url: string;
  additional_documents: string[];
  answers: any;
  status: string;
  submitted_at: string;
}

const OPPORTUNITY_TYPES: Record<string, { label: string; icon: any; color: string }> = {
  grant: { label: "Grant", icon: DollarSign, color: "emerald" },
  job: { label: "Job", icon: Briefcase, color: "blue" },
  fellowship: { label: "Fellowship", icon: Award, color: "purple" },
  training: { label: "Training", icon: GraduationCap, color: "cyan" },
  scholarship: { label: "Scholarship", icon: GraduationCap, color: "yellow" },
  internship: { label: "Internship", icon: Briefcase, color: "pink" },
  volunteer: { label: "Volunteer", icon: Heart, color: "orange" },
  consultancy: { label: "Consultancy", icon: Briefcase, color: "indigo" },
  award: { label: "Award", icon: Award, color: "amber" },
  competition: { label: "Competition", icon: TrendingUp, color: "red" },
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    grant: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    job: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    fellowship: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    training: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    scholarship: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    internship: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    volunteer: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    consultancy: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    award: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    competition: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return colors[type] || "bg-slate-500/10 text-slate-400";
};

const getTypeIcon = (type: string) => {
  return OPPORTUNITY_TYPES[type]?.icon || Briefcase;
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.id as string;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Application form state
  const [application, setApplication] = useState<Partial<Application>>({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    applicant_organization: "",
    applicant_country: "",
    applicant_role: "",
    cover_letter: "",
    resume_url: "",
    additional_documents: [],
  });

  useEffect(() => {
    if (opportunityId) {
      fetchOpportunity();
      checkUser();
    }
  }, [opportunityId]);

  const checkUser = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setApplication(prev => ({
          ...prev,
          applicant_name: userData.full_name || "",
          applicant_email: userData.email || "",
          applicant_country: userData.country || "",
          applicant_organization: userData.organization || "",
        }));
        if (userData.id && opportunityId) {
          await checkSaved(userData.id);
          await checkApplied(userData.id);
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (userData) {
          setUser(userData);
          setApplication(prev => ({
            ...prev,
            applicant_name: userData.full_name || "",
            applicant_email: userData.email || "",
            applicant_country: userData.country || "",
            applicant_organization: userData.organization || "",
          }));
          await checkSaved(userData.id);
          await checkApplied(userData.id);
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const checkSaved = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("opportunity_saves")
        .select("id")
        .eq("opportunity_id", opportunityId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error checking saved:", error);
    }
  };

  const checkApplied = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("opportunity_applications")
        .select("id")
        .eq("opportunity_id", opportunityId)
        .eq("applicant_id", userId)
        .maybeSingle();

      if (!error && data) {
        setHasApplied(true);
      }
    } catch (error) {
      console.error("Error checking applied:", error);
    }
  };

  const fetchOpportunity = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", opportunityId)
        .single();

      if (error) throw error;
      if (!data) {
        setError("Opportunity not found");
        return;
      }

      setOpportunity(data);

      // Increment view count
      await supabase.rpc('increment_views', { row_id: opportunityId });
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      setError("Failed to load opportunity details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      if (isSaved) {
        const { error } = await supabase
          .from("opportunity_saves")
          .delete()
          .eq("opportunity_id", opportunityId)
          .eq("user_id", user.id);

        if (error) throw error;
        setIsSaved(false);
      } else {
        const { error } = await supabase
          .from("opportunity_saves")
          .insert({
            opportunity_id: opportunityId,
            user_id: user.id,
          });

        if (error) throw error;
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving opportunity:", error);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("opportunity_applications")
        .insert({
          opportunity_id: opportunityId,
          applicant_id: user.id,
          applicant_name: application.applicant_name,
          applicant_email: application.applicant_email,
          applicant_phone: application.applicant_phone,
          applicant_organization: application.applicant_organization,
          applicant_country: application.applicant_country,
          applicant_role: application.applicant_role,
          cover_letter: application.cover_letter,
          resume_url: application.resume_url,
          additional_documents: application.additional_documents || [],
          status: "pending",
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update applications count
      await supabase
        .from("opportunities")
        .update({ applications_count: (opportunity?.applications_count || 0) + 1 })
        .eq("id", opportunityId);

      setApplicationSuccess(true);
      setHasApplied(true);
      setTimeout(() => {
        router.push("/opportunities");
      }, 3000);
    } catch (error) {
      console.error("Error applying:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    const url = window.location.href;
    const title = opportunity?.title || "Opportunity";
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this opportunity: ${url}`)}`,
    };
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  const getDeadlineStatus = (deadline: string) => {
    if (!deadline) return { label: "No Deadline", color: "text-slate-400" };
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { label: "Expired", color: "text-red-400" };
    if (daysUntil <= 7) return { label: `${daysUntil} days left`, color: "text-red-400 font-semibold" };
    if (daysUntil <= 30) return { label: `${daysUntil} days left`, color: "text-yellow-400" };
    return { label: `${daysUntil} days left`, color: "text-emerald-400" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Opportunity Not Found</h2>
          <p className="text-slate-400 mb-6">{error || "The opportunity you're looking for doesn't exist or has been removed."}</p>
          <Link href="/opportunities" className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(opportunity.opportunity_type);
  const typeColor = getTypeColor(opportunity.opportunity_type);
  const deadlineStatus = getDeadlineStatus(opportunity.application_deadline);
  const isDeadlinePassed = opportunity.application_deadline && new Date(opportunity.application_deadline) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <Link href="/opportunities" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Opportunities
              </Link>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs border ${typeColor}`}>
                  <TypeIcon className="w-3 h-3 inline mr-1" />
                  {OPPORTUNITY_TYPES[opportunity.opportunity_type]?.label || opportunity.opportunity_type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${deadlineStatus.color}`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {deadlineStatus.label}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{opportunity.title}</h1>
              <p className="text-slate-400 mt-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {opportunity.organization_name}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className={`p-2 rounded-xl border transition-colors ${
                  isSaved
                    ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30"
                    : "bg-slate-700 border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600"
                }`}
                title={isSaved ? "Remove bookmark" : "Save opportunity"}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  copyToClipboard(url);
                }}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
              <button
                onClick={() => shareOnSocial("twitter")}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition-colors"
                title="Share on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => shareOnSocial("linkedin")}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Description</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{opportunity.description}</p>
                </div>
              </div>

              {/* Eligibility Criteria */}
              {opportunity.eligibility_criteria && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    Eligibility Criteria
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{opportunity.eligibility_criteria}</p>
                  </div>
                </div>
              )}

              {/* Required Documents */}
              {opportunity.documents_required && opportunity.documents_required.length > 0 && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    Required Documents
                  </h2>
                  <ul className="space-y-2">
                    {opportunity.documents_required.map((doc, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-cyan-400" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Application Instructions */}
              {opportunity.application_instructions && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    Application Instructions
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{opportunity.application_instructions}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {opportunity.tags && opportunity.tags.length > 0 && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-cyan-400" />
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-slate-700 rounded-full text-slate-300 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 sticky top-6">
                <h3 className="text-white font-semibold text-lg mb-4">Quick Information</h3>
                
                <div className="space-y-4">
                  {/* Organization */}
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400 text-sm">Organization</p>
                      <p className="text-white font-medium">{opportunity.organization_name}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400 text-sm">Location</p>
                      <p className="text-white font-medium">
                        {opportunity.is_remote ? "🌐 Remote" : opportunity.location || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Target Countries */}
                  {opportunity.target_countries && opportunity.target_countries.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-400 text-sm">Target Countries</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {opportunity.target_countries.slice(0, 3).map((country) => (
                            <span key={country} className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">
                              {country}
                            </span>
                          ))}
                          {opportunity.target_countries.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-400">
                              +{opportunity.target_countries.length - 3}
                            </span>
                          )}
                          {opportunity.target_countries.length === 0 && (
                            <span className="text-slate-400 text-sm">All African Countries</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Target Audience */}
                  {opportunity.target_audience && opportunity.target_audience.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-400 text-sm">Target Audience</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {opportunity.target_audience.map((audience) => (
                            <span key={audience} className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">
                              {audience}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Funding */}
                  {opportunity.funding_amount > 0 && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-400 text-sm">Funding</p>
                        <p className="text-white font-medium">
                          {opportunity.funding_amount.toLocaleString()} {opportunity.funding_currency}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Deadline */}
                  {opportunity.application_deadline && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-400 text-sm">Application Deadline</p>
                        <p className={`font-medium ${deadlineStatus.color}`}>
                          {new Date(opportunity.application_deadline).toLocaleDateString()} · {deadlineStatus.label}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <Eye className="w-4 h-4" />
                      {opportunity.views || 0}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <Users className="w-4 h-4" />
                      {opportunity.applications_count || 0} applied
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  {!user && (
                    <Link
                      href="/login"
                      className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold text-center transition-colors block"
                    >
                      Login to Apply
                    </Link>
                  )}

                  {user && hasApplied && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                      <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <p className="text-emerald-400 font-medium">Application Submitted!</p>
                      <p className="text-slate-400 text-sm mt-1">You've already applied for this opportunity.</p>
                    </div>
                  )}

                  {user && !hasApplied && !isDeadlinePassed && (
                    <button
                      onClick={() => setShowApplicationForm(!showApplicationForm)}
                      className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Apply Now
                    </button>
                  )}

                  {isDeadlinePassed && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                      <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 font-medium">Application Closed</p>
                      <p className="text-slate-400 text-sm mt-1">The deadline for this opportunity has passed.</p>
                    </div>
                  )}

                  {opportunity.application_url && (
                    <a
                      href={opportunity.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 text-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apply on External Site
                    </a>
                  )}

                  {opportunity.website_url && (
                    <a
                      href={opportunity.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 text-sm transition-colors flex items-center justify-center gap-2 text-center"
                    >
                      <Link2 className="w-4 h-4" />
                      Visit Organization Website
                    </a>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              {(opportunity.contact_email || opportunity.contact_phone) && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Contact Information</h3>
                  {opportunity.contact_email && (
                    <a href={`mailto:${opportunity.contact_email}`} className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors mb-2">
                      <Mail className="w-4 h-4" />
                      {opportunity.contact_email}
                    </a>
                  )}
                  {opportunity.contact_phone && (
                    <a href={`tel:${opportunity.contact_phone}`} className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors">
                      <Phone className="w-4 h-4" />
                      {opportunity.contact_phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Application Form Modal */}
          {showApplicationForm && user && !hasApplied && !isDeadlinePassed && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Apply for {opportunity.title}</h2>
                    <button
                      onClick={() => setShowApplicationForm(false)}
                      className="text-slate-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {applicationSuccess ? (
                  <div className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Application Submitted!</h3>
                    <p className="text-slate-300">Your application has been successfully submitted.</p>
                    <p className="text-slate-400 text-sm mt-2">Redirecting to opportunities...</p>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={application.applicant_name}
                          onChange={(e) => setApplication({ ...application, applicant_name: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Email *</label>
                        <input
                          type="email"
                          value={application.applicant_email}
                          onChange={(e) => setApplication({ ...application, applicant_email: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Phone</label>
                        <input
                          type="tel"
                          value={application.applicant_phone}
                          onChange={(e) => setApplication({ ...application, applicant_phone: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Organization</label>
                        <input
                          type="text"
                          value={application.applicant_organization}
                          onChange={(e) => setApplication({ ...application, applicant_organization: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Country</label>
                        <select
                          value={application.applicant_country}
                          onChange={(e) => setApplication({ ...application, applicant_country: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">Select Country</option>
                          {africanCountries.map((c) => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Role/Title</label>
                        <input
                          type="text"
                          value={application.applicant_role}
                          onChange={(e) => setApplication({ ...application, applicant_role: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 text-sm block mb-2">Cover Letter *</label>
                      <textarea
                        value={application.cover_letter}
                        onChange={(e) => setApplication({ ...application, cover_letter: e.target.value })}
                        rows={5}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-cyan-500"
                        placeholder="Tell us why you're interested and why you're a good fit..."
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 text-sm block mb-2">Resume/CV URL</label>
                      <input
                        type="url"
                        value={application.resume_url}
                        onChange={(e) => setApplication({ ...application, resume_url: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                        placeholder="https://example.com/resume.pdf"
                      />
                      <p className="text-slate-500 text-xs mt-1">Upload your resume to a cloud service and paste the link here</p>
                    </div>

                    {opportunity.documents_required && opportunity.documents_required.length > 0 && (
                      <div>
                        <label className="text-slate-400 text-sm block mb-2">Additional Documents (URLs)</label>
                        <div className="space-y-2">
                          {opportunity.documents_required.map((doc, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="url"
                                placeholder={`${doc} URL`}
                                onChange={(e) => {
                                  const docs = [...(application.additional_documents || [])];
                                  docs[index] = e.target.value;
                                  setApplication({ ...application, additional_documents: docs });
                                }}
                                className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                              />
                              <span className="text-slate-400 text-xs whitespace-nowrap">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Application
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}