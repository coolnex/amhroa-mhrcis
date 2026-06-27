// app/researcher/create-project/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  BookOpen,
  Plus,
  X,
  FileText,
  Clock,
  Globe,
  Award,
  Tag,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  Phone,
  User,
  LogOut,
} from "lucide-react";
import { CountrySelect } from "@/components/ui/country-select";

const researchTypes = [
  "Clinical Research",
  "Community Research",
  "Policy Research",
  "Implementation Research",
  "Health Systems Research",
  "Epidemiological Research",
  "Qualitative Research",
  "Quantitative Research",
  "Mixed Methods Research",
  "Action Research",
  "Participatory Research",
  "Translational Research",
];

const sdgOptions = [
  "SDG 1: No Poverty",
  "SDG 2: Zero Hunger",
  "SDG 3: Good Health and Well-being",
  "SDG 4: Quality Education",
  "SDG 5: Gender Equality",
  "SDG 6: Clean Water and Sanitation",
  "SDG 7: Affordable and Clean Energy",
  "SDG 8: Decent Work and Economic Growth",
  "SDG 9: Industry, Innovation and Infrastructure",
  "SDG 10: Reduced Inequalities",
  "SDG 11: Sustainable Cities and Communities",
  "SDG 12: Responsible Consumption and Production",
  "SDG 13: Climate Action",
  "SDG 14: Life Below Water",
  "SDG 15: Life on Land",
  "SDG 16: Peace, Justice and Strong Institutions",
  "SDG 17: Partnerships for the Goals",
];

const projectStatuses = [
  "Proposed",
  "Approved",
  "Active",
  "In Progress",
  "Under Review",
  "Completed",
  "On Hold",
  "Cancelled",
];

export default function CreateProjectPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    research_type: "",
    status: "Proposed",
    university_id: "",
    lead_researcher_id: "",
    collaborators: [] as string[],
    start_date: "",
    end_date: "",
    funding: "",
    country: "",
    region: "",
    sdg_alignment: [] as string[],
    objectives: [] as string[],
    methodology: "",
    expected_outcomes: [] as string[],
    keywords: [] as string[],
    ethical_approval: false,
    approval_body: "",
    approval_reference: "",
    budget: "",
    contact_email: "",
    contact_phone: "",
    collaboration_type: "lead",
    is_public: true,
  });

  const [newCollaborator, setNewCollaborator] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newOutcome, setNewOutcome] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newSdg, setNewSdg] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUniversities();
      // Set lead researcher and contact info
      setFormData(prev => ({
        ...prev,
        lead_researcher_id: user.id,
        contact_email: user.email,
        contact_phone: user.phone || "",
      }));
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      console.log("🔐 Create Project - Verifying security clearance...");

      // 1. First check localStorage for user profile
      const userStr = localStorage.getItem("user");
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const allowedRoles = ["Researcher", "Admin", "University"];
          
          if (allowedRoles.includes(userData.role) && userData.status === "Approved") {
            setUser(userData);
            setIsAuthorized(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      // 2. Fetch active authentication token session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.log("No active session found, routing back to login page.");
        router.push("/login");
        return;
      }

      // 3. Fetch structural profile record from public.users table
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, country, phone, organization")
        .eq("id", session.user.id)
        .single();

      if (dbError || !userData) {
        console.error("Profile matching session ID not found:", dbError?.message);
        router.push("/login");
        return;
      }

      // 4. Authorization Guard Rule
      const allowedRoles = ["Researcher", "Admin", "University"];
      
      if (!allowedRoles.includes(userData.role)) {
        console.warn(`🛑 Unauthorized access attempt. User role "${userData.role}" is not authorized.`);
        router.push("/dashboard");
        return;
      }

      // 5. Approval Constraint Guard Rule
      if (userData.status !== "Approved") {
        console.log("Account is not yet marked as Approved.");
        router.push("/login?message=Account pending approval");
        return;
      }

      // 6. Cache user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthorized(true);
      
    } catch (error) {
      console.error("Critical error encountered during security verification:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("token");
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from("universities")
        .select("id, name, country")
        .eq("status", "Active")
        .order("name", { ascending: true });

      if (error) throw error;
      setUniversities(data || []);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError("Project title is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Project description is required");
      return;
    }
    if (!formData.research_type) {
      setError("Research type is required");
      return;
    }
    if (!formData.start_date) {
      setError("Start date is required");
      return;
    }
    if (!formData.end_date) {
      setError("End date is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Insert project
      const { data, error: insertError } = await supabase
        .from("research_projects")
        .insert({
          title: formData.title,
          description: formData.description,
          research_type: formData.research_type,
          status: formData.status,
          university_id: formData.university_id || null,
          lead_researcher: formData.lead_researcher_id,
          collaborators: formData.collaborators,
          start_date: formData.start_date,
          end_date: formData.end_date,
          funding: formData.funding ? parseFloat(formData.funding) : 0,
          country: formData.country || null,
          region: formData.region || null,
          sdg_alignment: formData.sdg_alignment,
          objectives: formData.objectives,
          methodology: formData.methodology || null,
          expected_outcomes: formData.expected_outcomes,
          keywords: formData.keywords,
          ethical_approval: formData.ethical_approval,
          approval_body: formData.approval_body || null,
          approval_reference: formData.approval_reference || null,
          budget: formData.budget ? parseFloat(formData.budget) : 0,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          collaboration_type: formData.collaboration_type,
          is_public: formData.is_public,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          progress: 0,
        })
        .select();

      if (insertError) {
        console.error("Supabase error:", insertError);
        setError(insertError.message || "Failed to create project");
        setSubmitting(false);
        return;
      }

      console.log("✅ Project created successfully:", data);
      setSuccess(true);
      setTimeout(() => {
        router.push("/researcher");
      }, 3000);
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || "Failed to create project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const addCollaborator = () => {
    if (newCollaborator.trim() && !formData.collaborators.includes(newCollaborator.trim())) {
      setFormData({
        ...formData,
        collaborators: [...formData.collaborators, newCollaborator.trim()],
      });
      setNewCollaborator("");
    }
  };

  const removeCollaborator = (collaborator: string) => {
    setFormData({
      ...formData,
      collaborators: formData.collaborators.filter(c => c !== collaborator),
    });
  };

  const addObjective = () => {
    if (newObjective.trim() && !formData.objectives.includes(newObjective.trim())) {
      setFormData({
        ...formData,
        objectives: [...formData.objectives, newObjective.trim()],
      });
      setNewObjective("");
    }
  };

  const removeObjective = (objective: string) => {
    setFormData({
      ...formData,
      objectives: formData.objectives.filter(o => o !== objective),
    });
  };

  const addOutcome = () => {
    if (newOutcome.trim() && !formData.expected_outcomes.includes(newOutcome.trim())) {
      setFormData({
        ...formData,
        expected_outcomes: [...formData.expected_outcomes, newOutcome.trim()],
      });
      setNewOutcome("");
    }
  };

  const removeOutcome = (outcome: string) => {
    setFormData({
      ...formData,
      expected_outcomes: formData.expected_outcomes.filter(o => o !== outcome),
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, newKeyword.trim()],
      });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword),
    });
  };

  const addSdg = () => {
    if (newSdg && !formData.sdg_alignment.includes(newSdg)) {
      setFormData({
        ...formData,
        sdg_alignment: [...formData.sdg_alignment, newSdg],
      });
      setNewSdg("");
    }
  };

  const removeSdg = (sdg: string) => {
    setFormData({
      ...formData,
      sdg_alignment: formData.sdg_alignment.filter(s => s !== sdg),
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authorized, return null
  if (!isAuthorized || !user) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800/50 rounded-2xl border border-emerald-500/30 p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Project Created!</h2>
          <p className="text-slate-300">Your research project has been successfully created.</p>
          <p className="text-slate-400 text-sm mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-center mb-4">
            <Link href="/researcher" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl border border-red-500/30 text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    CREATE RESEARCH PROJECT
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create Research Project
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Set up a new research project. Define objectives, collaborators, timelines, and expected outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Project Details */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Project Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-slate-400 text-sm block mb-2">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Community Mental Health Interventions in Rural Kenya"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 text-sm block mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the research project..."
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Research Type *</label>
                <select
                  value={formData.research_type}
                  onChange={(e) => setFormData({ ...formData, research_type: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">Select Research Type</option>
                  {researchTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Project Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  {projectStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Institution & Location */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Institution & Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Affiliated University</label>
                <select
                  value={formData.university_id}
                  onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select University</option>
                  {universities.map(uni => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Country</label>
                <CountrySelect
                  value={selectedCountryCode}
                  onChange={(code, name) => {
                    setSelectedCountryCode(code);
                    setFormData({ ...formData, country: name });
                  }}
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Region</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g., East Africa"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Timeline & Funding */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Timeline & Funding
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">End Date *</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Funding Amount ($)</label>
                <input
                  type="number"
                  value={formData.funding}
                  onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Team & Collaborators */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Team & Collaborators
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Lead Researcher</label>
                <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl px-4 py-3">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-white">{user?.full_name || "You"}</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Collaboration Type</label>
                <select
                  value={formData.collaboration_type}
                  onChange={(e) => setFormData({ ...formData, collaboration_type: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="lead">Lead Institution</option>
                  <option value="partner">Partner Institution</option>
                  <option value="affiliate">Affiliate</option>
                  <option value="consultant">Consultant</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-slate-400 text-sm block mb-2">Collaborators</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCollaborator}
                  onChange={(e) => setNewCollaborator(e.target.value)}
                  placeholder="Add collaborator name or institution..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCollaborator())}
                />
                <button
                  type="button"
                  onClick={addCollaborator}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.collaborators.map((collaborator) => (
                  <span key={collaborator} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm flex items-center gap-2">
                    {collaborator}
                    <button
                      type="button"
                      onClick={() => removeCollaborator(collaborator)}
                      className="text-blue-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {formData.collaborators.length === 0 && (
                  <p className="text-slate-400 text-sm">No collaborators added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Objectives & Outcomes */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Objectives & Outcomes
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Objectives</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Add objective..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())}
                  />
                  <button
                    type="button"
                    onClick={addObjective}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.objectives.map((objective) => (
                    <span key={objective} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm flex items-center gap-2">
                      {objective}
                      <button
                        type="button"
                        onClick={() => removeObjective(objective)}
                        className="text-purple-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.objectives.length === 0 && (
                    <p className="text-slate-400 text-sm">No objectives added yet</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Expected Outcomes</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    placeholder="Add expected outcome..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOutcome())}
                  />
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.expected_outcomes.map((outcome) => (
                    <span key={outcome} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm flex items-center gap-2">
                      {outcome}
                      <button
                        type="button"
                        onClick={() => removeOutcome(outcome)}
                        className="text-emerald-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.expected_outcomes.length === 0 && (
                    <p className="text-slate-400 text-sm">No expected outcomes added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Methodology & Keywords */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Methodology & Keywords
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Methodology</label>
                <textarea
                  value={formData.methodology}
                  onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                  placeholder="Describe your research methodology..."
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Keywords</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <span key={keyword} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-sm flex items-center gap-2">
                      #{keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="text-amber-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.keywords.length === 0 && (
                    <p className="text-slate-400 text-sm">No keywords added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SDG Alignment */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              SDG Alignment
            </h2>

            <div className="flex gap-2 mb-3">
              <select
                value={newSdg}
                onChange={(e) => setNewSdg(e.target.value)}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select SDG</option>
                {sdgOptions.map(sdg => (
                  <option key={sdg} value={sdg}>{sdg}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSdg}
                disabled={!newSdg}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.sdg_alignment.map((sdg) => (
                <span key={sdg} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-300 text-sm flex items-center gap-2">
                  {sdg}
                  <button
                    type="button"
                    onClick={() => removeSdg(sdg)}
                    className="text-green-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {formData.sdg_alignment.length === 0 && (
                <p className="text-slate-400 text-sm">No SDGs selected</p>
              )}
            </div>
          </div>

          {/* Ethical Approval */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              Ethical Approval
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.ethical_approval}
                  onChange={(e) => setFormData({ ...formData, ethical_approval: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500"
                />
                <label className="text-slate-300 text-sm">Ethical Approval Obtained</label>
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Approval Body</label>
                <input
                  type="text"
                  value={formData.approval_body}
                  onChange={(e) => setFormData({ ...formData, approval_body: e.target.value })}
                  placeholder="e.g., National Ethics Committee"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Approval Reference</label>
                <input
                  type="text"
                  value={formData.approval_reference}
                  onChange={(e) => setFormData({ ...formData, approval_reference: e.target.value })}
                  placeholder="e.g., NEC/2024/001"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Contact & Visibility */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Contact & Visibility
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500"
                />
                <label className="text-slate-300 text-sm">Make project publicly visible</label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Project
                </>
              )}
            </button>

            <Link
              href="/researcher"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}