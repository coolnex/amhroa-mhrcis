// app/advocacy-campaigns/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  X, 
  Target, 
  Users, 
  Calendar, 
  Globe, 
  FileText,
  Send,
  MessageSquare,
  Megaphone,
  Handshake,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface Action {
  id: string;
  title: string;
  description: string;
  type: string;
  target_audience: string;
  due_date: string;
  assigned_to: string;
}

const actionTypes = [
  { value: "petition", label: "Petition", icon: FileText },
  { value: "letter", label: "Letter Writing", icon: Send },
  { value: "meeting", label: "Policy Meeting", icon: Handshake },
  { value: "social_media", label: "Social Media Campaign", icon: Megaphone },
  { value: "rally", label: "Rally/March", icon: Users },
  { value: "policy_brief", label: "Policy Brief", icon: FileText },
  { value: "media_engagement", label: "Media Engagement", icon: MessageSquare },
];

const regions = [
  "Continental",
  "West Africa",
  "East Africa",
  "Southern Africa",
  "North Africa",
  "Central Africa",
  "Horn of Africa",
  "Sahel Region",
];

const countries = [
  "Nigeria", "Kenya", "South Africa", "Ghana", "Ethiopia",
  "Tanzania", "Uganda", "Rwanda", "Zambia", "Malawi",
  "Senegal", "Cameroon", "Botswana", "Namibia", "Zimbabwe"
];

const sdgOptions = [
  "SDG 3: Good Health and Well-being",
  "SDG 10: Reduced Inequalities",
  "SDG 16: Peace, Justice and Strong Institutions",
  "SDG 5: Gender Equality",
  "SDG 17: Partnerships for the Goals",
];

export default function NewAdvocacyCampaignPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    region: "",
    country: "",
    start_date: "",
    end_date: "",
    priority: "Medium",
    sdg_alignment: [] as string[],
    coalition_organizations: [] as string[],
  });

  const [actions, setActions] = useState<Action[]>([
    { id: "1", title: "", description: "", type: "", target_audience: "", due_date: "", assigned_to: "" }
  ]);
  const [newSdg, setNewSdg] = useState("");
  const [newOrg, setNewOrg] = useState("");

  useEffect(() => {
    fetchUserData();
    fetchOrganizations();
    fetchUsers();
  }, []);

  const fetchUserData = async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  };

  const fetchOrganizations = async () => {
    const { data } = await supabase
      .from("organizations")
      .select("id, name, country")
      .eq("status", "Approved")
      .limit(50);
    if (data) setOrganizations(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, role")
      .eq("status", "Approved")
      .limit(50);
    if (data) setUsers(data);
  };

  const addAction = () => {
    setActions([
      ...actions,
      { id: `action_${Date.now()}`, title: "", description: "", type: "", target_audience: "", due_date: "", assigned_to: "" }
    ]);
  };

  const removeAction = (id: string) => {
    if (actions.length <= 1) return;
    setActions(actions.filter(a => a.id !== id));
  };

  const updateAction = (id: string, field: string, value: any) => {
    setActions(actions.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const addSdg = () => {
    if (newSdg && !formData.sdg_alignment.includes(newSdg)) {
      setFormData({ ...formData, sdg_alignment: [...formData.sdg_alignment, newSdg] });
      setNewSdg("");
    }
  };

  const removeSdg = (sdg: string) => {
    setFormData({ ...formData, sdg_alignment: formData.sdg_alignment.filter(s => s !== sdg) });
  };

  const addOrganization = () => {
    if (newOrg && !formData.coalition_organizations.includes(newOrg)) {
      setFormData({ ...formData, coalition_organizations: [...formData.coalition_organizations, newOrg] });
      setNewOrg("");
    }
  };

  const removeOrganization = (org: string) => {
    setFormData({ ...formData, coalition_organizations: formData.coalition_organizations.filter(o => o !== org) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create the campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("advocacy_campaigns")
        .insert({
          title: formData.title,
          description: formData.description,
          region: formData.region || null,
          country: formData.country || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          priority: formData.priority,
          status: "Planning",
          created_by: user?.id,
          metadata: {
            sdg_alignment: formData.sdg_alignment,
            coalition_organizations: formData.coalition_organizations,
          }
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // 2. Create actions
      const validActions = actions.filter(a => a.title.trim());
      if (validActions.length > 0) {
        const actionsToInsert = validActions.map(a => ({
          campaign_id: campaign.id,
          title: a.title,
          description: a.description,
          type: a.type,
          target_audience: a.target_audience,
          due_date: a.due_date || null,
          assigned_to: a.assigned_to || null,
          status: "Planned",
          progress: 0,
        }));

        const { error: actionsError } = await supabase
          .from("advocacy_actions")
          .insert(actionsToInsert);

        if (actionsError) throw actionsError;
      }

      // 3. Add coalition members
      if (formData.coalition_organizations.length > 0) {
        const coalitionMembers = formData.coalition_organizations.map(orgId => ({
          campaign_id: campaign.id,
          organization_id: orgId,
          role: "Member",
          status: "Active",
        }));

        const { error: coalitionError } = await supabase
          .from("advocacy_coalition_members")
          .insert(coalitionMembers);

        if (coalitionError) throw coalitionError;
      }

      router.push("/advocacy-campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
      setError(error instanceof Error ? error.message : "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/advocacy-campaigns" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Create Advocacy Campaign</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Details */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Campaign Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-slate-400 text-sm block mb-2">Campaign Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                    placeholder="e.g., #MentalHealthMatters Africa Campaign"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 text-sm block mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none"
                    placeholder="Describe the campaign goals, target audience, and expected outcomes..."
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="">Select Region</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-sm block mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
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
            </div>

            {/* SDG Alignment */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                SDG Alignment
              </h2>
              
              <div className="flex gap-2 mb-3">
                <select
                  value={newSdg}
                  onChange={(e) => setNewSdg(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                >
                  <option value="">Select SDG</option>
                  {sdgOptions.map(sdg => (
                    <option key={sdg} value={sdg}>{sdg}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addSdg}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
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
              </div>
            </div>

            {/* Coalition Building */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Coalition Building
              </h2>
              
              <div className="flex gap-2 mb-3">
                <select
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                >
                  <option value="">Select Organization</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name} ({org.country})</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addOrganization}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.coalition_organizations.map((orgId) => {
                  const org = organizations.find(o => o.id === orgId);
                  return (
                    <span key={orgId} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm flex items-center gap-2">
                      {org?.name || orgId}
                      <button
                        type="button"
                        onClick={() => removeOrganization(orgId)}
                        className="text-purple-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Campaign Actions */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-cyan-400" />
                  Campaign Actions
                </h2>
                <button
                  type="button"
                  onClick={addAction}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Action
                </button>
              </div>

              {actions.map((action, index) => (
                <div key={action.id} className="bg-slate-800/30 rounded-xl p-4 mb-4 border border-slate-700/50">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-slate-400 text-xs">Action {index + 1}</span>
                    {actions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAction(action.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={action.title}
                        onChange={(e) => updateAction(action.id, "title", e.target.value)}
                        placeholder="Action title"
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={action.description}
                        onChange={(e) => updateAction(action.id, "description", e.target.value)}
                        placeholder="Action description"
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm"
                      />
                    </div>

                    <div>
                      <select
                        value={action.type}
                        onChange={(e) => updateAction(action.id, "type", e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm"
                      >
                        <option value="">Action Type</option>
                        {actionTypes.map(at => (
                          <option key={at.value} value={at.value}>{at.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={action.target_audience}
                        onChange={(e) => updateAction(action.id, "target_audience", e.target.value)}
                        placeholder="Target audience"
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm"
                      />
                    </div>

                    <div>
                      <input
                        type="date"
                        value={action.due_date}
                        onChange={(e) => updateAction(action.id, "due_date", e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm"
                      />
                    </div>

                    <div>
                      <select
                        value={action.assigned_to}
                        onChange={(e) => updateAction(action.id, "assigned_to", e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm"
                      >
                        <option value="">Assign to</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? "Creating Campaign..." : "Launch Campaign"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}