// lib/survey-templates.ts
export const SURVEY_TEMPLATES = {
    POLICY_IMPLEMENTATION: {
      title: "Policy Implementation Tracking Survey",
      description: "Track the progress of mental health policy implementation in your country",
      category: "Policy",
      questions: [
        {
          id: "policy_name",
          type: "text",
          label: "Policy Name",
          required: true
        },
        {
          id: "policy_category",
          type: "select",
          label: "Policy Category",
          options: ["Mental Health Act", "Decriminalization", "Healthcare Access", "Workforce Development", "Financing", "Other"],
          required: true
        },
        {
          id: "status",
          type: "select",
          label: "Implementation Status",
          options: ["Not Started", "In Progress", "Under Review", "Completed"],
          required: true
        },
        {
          id: "progress_percentage",
          type: "number",
          label: "Progress Percentage",
          min: 0,
          max: 100,
          required: true
        },
        {
          id: "start_date",
          type: "date",
          label: "Start Date",
          required: true
        },
        {
          id: "target_completion",
          type: "date",
          label: "Target Completion Date",
          required: true
        },
        {
          id: "description",
          type: "textarea",
          label: "Policy Description",
          required: false
        },
        {
          id: "challenges",
          type: "textarea",
          label: "Implementation Challenges",
          required: false
        },
        {
          id: "achievements",
          type: "textarea",
          label: "Key Achievements",
          required: false
        }
      ]
    },
    
    SUICIDE_DECRIMINALIZATION: {
      title: "Suicide Decriminalization Status Survey",
      description: "Report on the legal status and progress of suicide decriminalization",
      category: "Rights",
      questions: [
        {
          id: "status",
          type: "select",
          label: "Current Status",
          options: ["Criminalized", "Under Consideration", "Partially Decriminalized", "Decriminalized"],
          required: true
        },
        {
          id: "legislation_status",
          type: "select",
          label: "Legislation Status",
          options: ["No Legislation", "Draft", "Proposed", "Passed", "Implemented"],
          required: true
        },
        {
          id: "year_legislated",
          type: "number",
          label: "Year of Legislation",
          min: 1900,
          max: 2024,
          required: false
        },
        {
          id: "progress_score",
          type: "number",
          label: "Progress Score (0-100)",
          min: 0,
          max: 100,
          required: true
        },
        {
          id: "awareness_campaigns",
          type: "boolean",
          label: "Are there awareness campaigns?",
          required: true
        },
        {
          id: "support_services",
          type: "boolean",
          label: "Are there support services available?",
          required: true
        },
        {
          id: "notes",
          type: "textarea",
          label: "Additional Notes",
          required: false
        }
      ]
    },
    
    WORKFORCE_TRACKER: {
      title: "Mental Health Workforce Statistics Survey",
      description: "Report on mental health workforce numbers and capacity",
      category: "Workforce",
      questions: [
        {
          id: "year",
          type: "number",
          label: "Reporting Year",
          min: 2000,
          max: 2024,
          required: true
        },
        {
          id: "psychiatrists_total",
          type: "number",
          label: "Number of Psychiatrists",
          min: 0,
          required: true
        },
        {
          id: "psychologists_total",
          type: "number",
          label: "Number of Psychologists",
          min: 0,
          required: true
        },
        {
          id: "nurses_total",
          type: "number",
          label: "Number of Mental Health Nurses",
          min: 0,
          required: true
        },
        {
          id: "social_workers_total",
          type: "number",
          label: "Number of Social Workers",
          min: 0,
          required: true
        },
        {
          id: "peer_support_workers",
          type: "number",
          label: "Number of Peer Support Workers",
          min: 0,
          required: true
        },
        {
          id: "training_programs",
          type: "number",
          label: "Number of Training Programs",
          min: 0,
          required: true
        },
        {
          id: "vacancies",
          type: "number",
          label: "Current Job Vacancies",
          min: 0,
          required: true
        },
        {
          id: "government_spending",
          type: "number",
          label: "Government Spending (USD)",
          min: 0,
          required: true
        },
        {
          id: "donor_support",
          type: "number",
          label: "Donor Support/Funding (USD)",
          min: 0,
          required: true
        }
      ]
    }
  };
  
  // Helper to create surveys from templates
  export const createSurveyFromTemplate = async (supabase: any, template: any, country: string) => {
    const { data, error } = await supabase
      .from("surveys")
      .insert({
        title: `${template.title} - ${country}`,
        description: template.description,
        category: template.category,
        questions: template.questions,
        status: "Active",
        metadata: {
          type: "tracker",
          country: country,
          template_id: template.id
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };