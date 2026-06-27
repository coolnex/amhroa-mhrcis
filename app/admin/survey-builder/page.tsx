// app/admin/survey-builder/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { INTERNAL_SURVEY_TEMPLATES, getInternalSurveyOptions } from "@/lib/survey_templates/internal-templates";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  GripVertical,
  Copy,
  EyeOff,
  Settings,
  Users,
  Calendar,
  Tag,
  Globe,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  rows?: number;
  conditional?: {
    field: string;
    value: any;
  };
  visible?: boolean; // For toggling visibility
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
  visible: boolean;
}

interface SurveyBuilder {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  sections: Section[];
  isInternal: boolean;
  status: "draft" | "published" | "archived";
  targetAudience: "all" | "team" | "coordinators" | "public";
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
}

const FIELD_TYPES = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "boolean", label: "Yes/No" },
  { value: "rating", label: "Rating Scale" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];

const TARGET_AUDIENCES = [
  { value: "all", label: "Everyone" },
  { value: "team", label: "Team Members Only" },
  { value: "coordinators", label: "Coordinators Only" },
  { value: "public", label: "Public" },
];

export default function SurveyBuilderPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const [survey, setSurvey] = useState<SurveyBuilder>({
    id: "",
    title: "",
    description: "",
    category: "Internal",
    type: "",
    sections: [],
    isInternal: true,
    status: "draft",
    targetAudience: "team",
    createdBy: "",
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("🔐 Guard Check - Verifying Admin permissions for Survey Creation...");
  
      // 1. Fetch active authentication token session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
      if (sessionError || !session?.user) {
        console.log("No active authentication token found, routing back to login.");
        router.push("/login");
        return;
      }
  
      // 2. Fetch structural profile columns from public.users directory table
      const { data: userData, error: dbError } = await supabase
        .from("users")
        .select("id, full_name, email, role, status")
        .eq("id", session.user.id)
        .single();
  
      if (dbError || !userData) {
        console.error("Profile matching session ID not found in database registry:", dbError?.message);
        router.push("/login");
        return;
      }
  
      // 3. User Context Hydration
      setUser(userData);
  
      // 4. Admin Role Access Guard
      if (userData.role !== "Admin") {
        console.warn(`🛑 Unauthorized access attempt. User role "${userData.role}" is not an Admin.`);
        router.push("/dashboard");
        return;
      }
  
      // 5. Inject verified User ID into Survey State payload safely
      setSurvey(prev => ({ 
        ...prev, 
        createdBy: userData.id 
      }));
      
      setLoading(false);
    } catch (err) {
      console.error("Catastrophic error inside admin authorization checker:", err);
      router.push("/login");
    }
  };
  

  const handleTemplateSelect = (templateId: string) => {
    const template = INTERNAL_SURVEY_TEMPLATES[templateId as keyof typeof INTERNAL_SURVEY_TEMPLATES];
    if (template) {
      setSurvey(prev => ({
        ...prev,
        title: template.title,
        description: template.description,
        type: template.type,
        sections: template.sections.map((section: any) => ({
          ...section,
          visible: true,
          fields: section.fields.map((field: any) => ({
            ...field,
            visible: true
          }))
        }))
      }));
      setSelectedTemplate(templateId);
    }
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section_${Date.now()}`,
      title: "New Section",
      fields: [],
      visible: true
    };
    setSurvey(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveSection(newSection.id);
  };

  const removeSection = (sectionId: string) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      )
    }));
  };

  const addField = (sectionId: string) => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      label: "New Question",
      type: "text",
      required: false,
      visible: true
    };
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s
      )
    }));
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) } : s
      )
    }));
  };

  const toggleFieldVisibility = (sectionId: string, fieldId: string) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? {
          ...s,
          fields: s.fields.map(f => 
            f.id === fieldId ? { ...f, visible: !f.visible } : f
          )
        } : s
      )
    }));
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<Field>) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? {
          ...s,
          fields: s.fields.map(f => 
            f.id === fieldId ? { ...f, ...updates } : f
          )
        } : s
      )
    }));
  };

  const handleSave = async () => {
    if (!survey.title) {
      setError("Please enter a survey title");
      return;
    }

    if (survey.sections.length === 0) {
      setError("Please add at least one section");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Prepare questions from sections
      const questions = survey.sections.map(section => ({
        sectionTitle: section.title,
        visible: section.visible,
        questions: section.fields
          .filter(f => f.visible !== false)
          .map(field => ({
            id: field.id,
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options,
            placeholder: field.placeholder,
            helpText: field.helpText,
            min: field.min,
            max: field.max,
            rows: field.rows,
            conditional: field.conditional
          }))
      }));

      const { error: insertError } = await supabase
        .from("surveys")
        .insert({
          title: survey.title,
          description: survey.description,
          category: survey.category,
          type: "internal",
          questions: questions,
          status: survey.status,
          metadata: {
            isInternal: true,
            targetAudience: survey.targetAudience,
            templateId: selectedTemplate,
            startDate: survey.startDate,
            endDate: survey.endDate,
            createdBy: user.id,
            type: survey.type
          },
          created_by: user.id,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/surveys");
      }, 2000);
    } catch (err: any) {
      console.error("Error saving survey:", err);
      setError(err.message || "Failed to save survey");
    } finally {
      setSaving(false);
    }
  };

  const renderFieldEditor = (sectionId: string, field: Field) => {
    return (
      <div key={field.id} className="bg-slate-700/30 rounded-lg p-4 mb-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 mt-1">
            <GripVertical className="w-4 h-4 text-slate-500 cursor-move" />
            <button
              onClick={() => toggleFieldVisibility(sectionId, field.id)}
              className="p-1 hover:bg-slate-600 rounded transition-colors"
              title={field.visible ? "Hide field" : "Show field"}
            >
              {field.visible ? (
                <Eye className="w-4 h-4 text-cyan-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Question</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(sectionId, field.id, { label: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm"
                  placeholder="Enter question"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Field Type</label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(sectionId, field.id, { type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm"
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(sectionId, field.id, { required: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                />
                <label className="text-slate-400 text-xs">Required</label>
              </div>
              <div>
                <input
                  type="text"
                  value={field.helpText || ""}
                  onChange={(e) => updateField(sectionId, field.id, { helpText: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs"
                  placeholder="Help text"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={field.placeholder || ""}
                  onChange={(e) => updateField(sectionId, field.id, { placeholder: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs"
                  placeholder="Placeholder"
                />
              </div>
            </div>

            {field.type === "select" && (
              <div className="mt-2">
                <label className="text-slate-400 text-xs block mb-1">Options (comma separated)</label>
                <input
                  type="text"
                  value={field.options?.join(", ") || ""}
                  onChange={(e) => updateField(sectionId, field.id, { 
                    options: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                  })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm"
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}

            {(field.type === "number" || field.type === "rating") && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Min</label>
                  <input
                    type="number"
                    value={field.min || ""}
                    onChange={(e) => updateField(sectionId, field.id, { min: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Max</label>
                  <input
                    type="number"
                    value={field.max || ""}
                    onChange={(e) => updateField(sectionId, field.id, { max: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm"
                  />
                </div>
              </div>
            )}

            <div className="mt-2 flex justify-end">
              <button
                onClick={() => removeField(sectionId, field.id)}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading survey builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="px-4 md:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin/surveys" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Surveys
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Survey
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400 text-sm">Survey saved successfully! Redirecting...</p>
          </div>
        )}

        {showPreview ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-2">{survey.title || "Untitled Survey"}</h2>
            <p className="text-slate-400 mb-6">{survey.description || "No description provided"}</p>
            
            {survey.sections.map((section) => (
              section.visible && section.fields.some(f => f.visible !== false) && (
                <div key={section.id} className="bg-slate-700/30 rounded-xl p-6 mb-4">
                  <h3 className="text-white font-semibold text-lg mb-4">{section.title}</h3>
                  {section.fields.map((field) => (
                    field.visible !== false && (
                      <div key={field.id} className="mb-4">
                        <label className="text-slate-300 text-sm block mb-2">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        {field.type === "text" && (
                          <input
                            type="text"
                            placeholder={field.placeholder}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400"
                            disabled
                          />
                        )}
                        {field.type === "textarea" && (
                          <textarea
                            rows={field.rows || 3}
                            placeholder={field.placeholder}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 resize-none"
                            disabled
                          />
                        )}
                        {field.type === "select" && (
                          <select className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white" disabled>
                            <option>Select option...</option>
                            {field.options?.map((opt, idx) => (
                              <option key={idx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                        {field.type === "rating" && (
                          <div className="flex gap-2">
                            {Array.from({ length: field.max || 5 }, (_, i) => (
                              <button key={i} className="w-10 h-10 bg-slate-700 rounded-lg text-white" disabled>
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        )}
                        {field.helpText && (
                          <p className="text-slate-500 text-xs mt-1">{field.helpText}</p>
                        )}
                      </div>
                    )
                  ))}
                </div>
              )
            ))}
          </div>
        ) : (
          <>
            {/* Survey Details */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Survey Title *</label>
                  <input
                    type="text"
                    value={survey.title}
                    onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                    placeholder="Enter survey title"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Target Audience</label>
                  <select
                    value={survey.targetAudience}
                    onChange={(e) => setSurvey(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                  >
                    {TARGET_AUDIENCES.map(audience => (
                      <option key={audience.value} value={audience.value}>{audience.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-slate-400 text-sm block mb-2">Description</label>
                <textarea
                  value={survey.description}
                  onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white resize-none"
                  placeholder="Describe the purpose of this survey"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-slate-400 text-sm block mb-2">Start Date</label>
                  <input
                    type="date"
                    value={survey.startDate || ""}
                    onChange={(e) => setSurvey(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm block mb-2">End Date</label>
                  <input
                    type="date"
                    value={survey.endDate || ""}
                    onChange={(e) => setSurvey(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
              <h3 className="text-white font-semibold text-lg mb-4">Quick Templates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(INTERNAL_SURVEY_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => handleTemplateSelect(key)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedTemplate === key
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <p className={`text-sm font-medium ${selectedTemplate === key ? "text-white" : "text-slate-300"}`}>
                      {template.title}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sections Builder */}
            <div className="space-y-4">
              {survey.sections.map((section) => (
                <div key={section.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-slate-800/80">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleSectionVisibility(section.id)}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                      >
                        {section.visible ? (
                          <Eye className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => {
                          setSurvey(prev => ({
                            ...prev,
                            sections: prev.sections.map(s =>
                              s.id === section.id ? { ...s, title: e.target.value } : s
                            )
                          }));
                        }}
                        className="bg-transparent text-white font-medium border-b border-transparent hover:border-slate-600 focus:border-cyan-500 outline-none px-1"
                        placeholder="Section Title"
                      />
                      <span className="text-slate-500 text-xs">
                        {section.fields.filter(f => f.visible !== false).length} questions
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addField(section.id)}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Question
                      </button>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="p-1 hover:bg-slate-700 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {section.visible && (
                    <div className="p-4">
                      {section.fields.map((field) => renderFieldEditor(section.id, field))}
                      {section.fields.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <p>No questions yet. Click "Add Question" to start building.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!section.visible && (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      This section is hidden
                    </div>
                  )}
                </div>
              ))}

              {/* Add Section Button */}
              <button
                onClick={addSection}
                className="w-full p-4 border-2 border-dashed border-slate-700 rounded-2xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-slate-400 hover:text-cyan-400 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            {/* Survey Status */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-slate-400 text-sm">Status:</span>
              <select
                value={survey.status}
                onChange={(e) => setSurvey(prev => ({ ...prev, status: e.target.value as any }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <span className="text-slate-500 text-xs">
                {survey.sections.length} sections, {survey.sections.reduce((acc, s) => acc + s.fields.filter(f => f.visible !== false).length, 0)} total questions
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}