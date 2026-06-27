// lib/survey_templates/tracker-templates.ts

export const TRACKER_SURVEY_TEMPLATES = {
  CARE_SYSTEMS: {
    id: "care_systems_tracker",
    title: "Care Systems Strengthening & Integration",
    description: "Monitor PHC integration, workforce mapping, and service delivery",
    category: "Health Systems",
    tableName: "care_system_metrics",
    icon: "Heart",
    sections: [
      {
        id: "phc_integration",
        title: "PHC Integration",
        fields: [
          {
            id: "phc_integration_score",
            label: "PHC Integration Score",
            type: "number",
            min: 0,
            max: 100,
            required: true,
            helpText: "0 = No integration, 100 = Full integration"
          },
          {
            id: "phc_facilities_count",
            label: "Total PHC Facilities",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "phc_facilities_with_mh",
            label: "PHC Facilities with MH Services",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "phc_providers_trained",
            label: "PHC Providers Trained in MH",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "phc_integration_target",
            label: "PHC Integration Target",
            type: "number",
            min: 0,
            max: 100,
            required: true
          }
        ]
      },
      {
        id: "workforce_mapping",
        title: "Mental Health Workforce Mapping",
        fields: [
          {
            id: "psychiatrists_total",
            label: "Total Psychiatrists",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "psychiatrists_per_capita",
            label: "Psychiatrists per Capita",
            type: "number",
            min: 0,
            max: 100,
            required: true,
            helpText: "Calculate as: (Total Psychiatrists / Population) × 100,000"
          },
          {
            id: "psychologists_total",
            label: "Total Psychologists",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "mental_health_nurses",
            label: "Mental Health Nurses",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "community_health_workers_total",
            label: "Total Community Health Workers",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "chw_trained_in_mh",
            label: "CHWs Trained in Mental Health",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "vacancy_rate",
            label: "Workforce Vacancy Rate",
            type: "number",
            min: 0,
            max: 100,
            required: true
          }
        ]
      },
      {
        id: "service_delivery",
        title: "Service Delivery Models",
        fields: [
          {
            id: "service_delivery_score",
            label: "Service Delivery Score",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "outpatient_visits",
            label: "Outpatient Visits",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "inpatient_admissions",
            label: "Inpatient Admissions",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "community_visits",
            label: "Community Visits",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "telemedicine_consultations",
            label: "Telemedicine Consultations",
            type: "number",
            min: 0,
            required: true
          }
        ]
      },
      {
        id: "task_shifting",
        title: "Task Shifting Strategies",
        fields: [
          {
            id: "task_shifting_implemented",
            label: "Task Shifting Implemented",
            type: "boolean",
            required: true
          },
          {
            id: "task_shifting_programs",
            label: "Task Shifting Programs",
            type: "number",
            min: 0,
            required: true,
            conditional: {
              field: "task_shifting_implemented",
              value: true
            }
          },
          {
            id: "task_shifting_providers_trained",
            label: "Task Shifting Providers Trained",
            type: "number",
            min: 0,
            required: true,
            conditional: {
              field: "task_shifting_implemented",
              value: true
            }
          }
        ]
      },
      {
        id: "integration_services",
        title: "Integration with Other Health Services",
        fields: [
          {
            id: "hiv_integration_score",
            label: "HIV Integration Score",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "ncd_integration_score",
            label: "NCD Integration Score",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "maternal_health_integration",
            label: "Maternal Health Integration",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "youth_health_integration",
            label: "Youth Health Integration",
            type: "number",
            min: 0,
            max: 100,
            required: true
          }
        ]
      }
    ]
  },

  FINANCING: {
    id: "financing_tracker",
    title: "Financing & Budget Advocacy Intelligence",
    description: "Track national mental health budgets, donor funding, and advocacy impact",
    category: "Financing",
    tableName: "financing_metrics",
    icon: "DollarSign",
    sections: [
      {
        id: "national_budget",
        title: "National Budget Tracking",
        fields: [
          {
            id: "fiscal_year",
            label: "Fiscal Year",
            type: "text",
            required: true,
            placeholder: "YYYY/YYYY"
          },
          {
            id: "total_health_budget",
            label: "Total Health Budget (USD)",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "mental_health_budget",
            label: "Mental Health Budget (USD)",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "mh_percentage_of_health",
            label: "Mental Health % of Health Budget",
            type: "number",
            min: 0,
            max: 100,
            required: true,
            helpText: "Target: ≥5%"
          },
          {
            id: "mh_per_capita",
            label: "Mental Health Spending per Capita (USD)",
            type: "number",
            min: 0,
            required: true
          }
        ]
      },
      {
        id: "sub_national",
        title: "Sub-National Budgets",
        fields: [
          {
            id: "sub_national_budget",
            label: "Sub-National Budget Tracking",
            type: "boolean",
            required: true
          },
          {
            id: "regions_with_budgets",
            label: "Regions with Mental Health Budgets",
            type: "number",
            min: 0,
            required: true,
            conditional: {
              field: "sub_national_budget",
              value: true
            }
          }
        ]
      },
      {
        id: "investment_case",
        title: "Investment Case Development",
        fields: [
          {
            id: "investment_case_developed",
            label: "Investment Case Developed",
            type: "boolean",
            required: true
          },
          {
            id: "investment_case_status",
            label: "Investment Case Status",
            type: "select",
            options: ["Drafting", "Finalized", "Presented to Government", "Approved", "Not Started"],
            required: true,
            conditional: {
              field: "investment_case_developed",
              value: true
            }
          },
          {
            id: "implementation_cost",
            label: "Implementation Cost (USD)",
            type: "number",
            min: 0,
            required: true,
            conditional: {
              field: "investment_case_developed",
              value: true
            }
          }
        ]
      },
      {
        id: "donor_funding",
        title: "Donor Funding Tracking",
        fields: [
          {
            id: "donor_funding_total",
            label: "Total Donor Funding (USD)",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "donor_projects",
            label: "Active Donor Projects",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "donor_funding_gap",
            label: "Donor Funding Gap (USD)",
            type: "number",
            min: 0,
            required: true
          }
        ]
      },
      {
        id: "advocacy",
        title: "Advocacy Impact",
        fields: [
          {
            id: "advocacy_campaigns",
            label: "Advocacy Campaigns",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "advocacy_meetings",
            label: "Advocacy Meetings",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "policy_influenced",
            label: "Policy Influenced",
            type: "boolean",
            required: true
          },
          {
            id: "budget_increase_achieved",
            label: "Budget Increase Achieved",
            type: "boolean",
            required: true
          },
          {
            id: "budget_increase_percentage",
            label: "Budget Increase Percentage",
            type: "number",
            min: 0,
            required: true,
            conditional: {
              field: "budget_increase_achieved",
              value: true
            }
          }
        ]
      }
    ]
  },

  COMMUNITY: {
    id: "community_tracker",
    title: "Community & Social Determinants Monitoring",
    description: "Track stigma, community interventions, and social determinants",
    category: "Community",
    tableName: "community_determinants",
    icon: "Users",
    sections: [
      {
        id: "stigma_attitudes",
        title: "Stigma & Social Attitudes",
        fields: [
          {
            id: "stigma_index",
            label: "Stigma Index",
            type: "number",
            min: 0,
            max: 100,
            required: true,
            helpText: "Lower score indicates less stigma"
          },
          {
            id: "discrimination_index",
            label: "Discrimination Index",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "public_awareness_percentage",
            label: "Public Awareness",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "stigma_reduction_programs",
            label: "Stigma Reduction Programs",
            type: "number",
            min: 0,
            required: true
          }
        ]
      },
      {
        id: "community_interventions",
        title: "Community-Based Interventions",
        fields: [
          {
            id: "community_programs",
            label: "Community Programs",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "community_workers_deployed",
            label: "Community Workers Deployed",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "community_sessions_held",
            label: "Community Sessions Held",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "community_reach",
            label: "Community Reach",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "peer_support_groups",
            label: "Peer Support Groups",
            type: "number",
            min: 0,
            required: true
          }
        ]
      },
      {
        id: "social_determinants",
        title: "Social Determinants",
        fields: [
          {
            id: "unemployment_rate",
            label: "Unemployment Rate",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "displacement_count",
            label: "Displaced Population",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "food_insecurity_level",
            label: "Food Insecurity Level",
            type: "select",
            options: ["None", "Minimal", "Stressed", "Crisis", "Emergency", "Famine"],
            required: true
          },
          {
            id: "poverty_index",
            label: "Poverty Index",
            type: "number",
            min: 0,
            max: 100,
            required: true
          }
        ]
      },
      {
        id: "faith_cultural",
        title: "Faith & Cultural Engagement",
        fields: [
          {
            id: "faith_organizations_engaged",
            label: "Faith Organizations Engaged",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "traditional_healers_involved",
            label: "Traditional Healers Involved",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "cultural_sensitivity_score",
            label: "Cultural Sensitivity Score",
            type: "number",
            min: 0,
            max: 100,
            required: true
          }
        ]
      },
      {
        id: "wellbeing",
        title: "Well-being & Resilience",
        fields: [
          {
            id: "well_being_index",
            label: "Well-being Index",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "resilience_index",
            label: "Resilience Index",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "social_cohesion_score",
            label: "Social Cohesion Score",
            type: "number",
            min: 0,
            max: 100,
            required: true
          }
        ]
      }
    ]
  },

  CRISIS: {
    id: "crisis_tracker",
    title: "Crisis & Emergency Mental Health Response",
    description: "Track early warning systems, rapid response, and psychosocial support",
    category: "Crisis Response",
    tableName: "crisis_response_metrics",
    icon: "AlertCircle",
    sections: [
      {
        id: "early_warning",
        title: "Early Warning Systems",
        fields: [
          {
            id: "early_warning_system_active",
            label: "Early Warning System Active",
            type: "boolean",
            required: true
          },
          {
            id: "early_warning_coverage",
            label: "Early Warning Coverage",
            type: "number",
            min: 0,
            max: 100,
            required: true,
            conditional: {
              field: "early_warning_system_active",
              value: true
            }
          },
          {
            id: "alert_level",
            label: "Current Alert Level",
            type: "select",
            options: ["Normal", "Elevated", "High", "Critical", "Emergency"],
            required: true
          }
        ]
      },
      {
        id: "rapid_response",
        title: "Rapid Response Capacity",
        fields: [
          {
            id: "rapid_response_teams",
            label: "Rapid Response Teams",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "rapid_response_activated",
            label: "Rapid Response Activated",
            type: "boolean",
            required: true
          },
          {
            id: "response_time_hours",
            label: "Average Response Time (hours)",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "team_coverage",
            label: "Team Coverage",
            type: "number",
            min: 0,
            max: 100,
            required: true
          }
        ]
      },
      {
        id: "crisis_events",
        title: "Crisis Events Monitoring",
        fields: [
          {
            id: "crises_monitored",
            label: "Crises Monitored",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "active_crises",
            label: "Active Crises",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "affected_population",
            label: "Affected Population",
            type: "number",
            min: 0,
            required: true
          }
        ]
      },
      {
        id: "psychosocial_support",
        title: "Psychosocial Support Services",
        fields: [
          {
            id: "psychosocial_teams_deployed",
            label: "Psychosocial Teams Deployed",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "psychosocial_sessions_held",
            label: "Psychosocial Sessions Held",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "beneficiaries_reached",
            label: "Beneficiaries Reached",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "crisis_hotline_active",
            label: "Crisis Hotline Active",
            type: "boolean",
            required: true
          },
          {
            id: "mental_health_first_aid_trained",
            label: "MHFA Trained Responders",
            type: "number",
            min: 0,
            required: true
          }
        ]
      },
      {
        id: "humanitarian_collaboration",
        title: "Humanitarian Collaboration",
        fields: [
          {
            id: "coordination_meetings",
            label: "Coordination Meetings",
            type: "number",
            min: 0,
            required: true
          },
          {
            id: "who_collaboration",
            label: "WHO Collaboration",
            type: "boolean",
            required: true
          },
          {
            id: "unhcr_collaboration",
            label: "UNHCR Collaboration",
            type: "boolean",
            required: true
          },
          {
            id: "unicef_collaboration",
            label: "UNICEF Collaboration",
            type: "boolean",
            required: true
          }
        ]
      },
      {
        id: "impact_outcomes",
        title: "Impact & Outcomes",
        fields: [
          {
            id: "crisis_impact_score",
            label: "Crisis Impact Score",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "mh_impact_score",
            label: "Mental Health Impact Score",
            type: "number",
            min: 0,
            max: 100,
            required: true
          },
          {
            id: "recovery_progress",
            label: "Recovery Progress",
            type: "number",
            min: 0,
            max: 100,
            required: true
          }
        ]
      }
    ]
  }
};

// Helper to get tracker options for UI
export const getTrackerOptions = () => {
  return Object.entries(TRACKER_SURVEY_TEMPLATES).map(([key, template]) => ({
    id: key,
    label: template.title,
    description: template.description,
    icon: template.icon,
    tableName: template.tableName,
    sections: template.sections
  }));
};

// Helper to get a specific tracker template
export const getTrackerTemplate = (trackerId: string) => {
  const key = Object.keys(TRACKER_SURVEY_TEMPLATES).find(
    k => k === trackerId || TRACKER_SURVEY_TEMPLATES[k as keyof typeof TRACKER_SURVEY_TEMPLATES].id === trackerId
  );
  return key ? TRACKER_SURVEY_TEMPLATES[key as keyof typeof TRACKER_SURVEY_TEMPLATES] : null;
};
export const createTrackerSurvey = async (supabase: any, template: any, country: string) => {
  // Check if survey already exists for this template and country
  const { data: existing } = await supabase
    .from("surveys")
    .select("id")
    .eq("metadata->>template_id", template.id)
    .eq("metadata->>country", country)
    .single();

  if (existing) {
    // Update existing survey
    const { data, error } = await supabase
      .from("surveys")
      .update({
        title: `${template.title} - ${country}`,
        description: template.description,
        category: template.category,
        questions: template.sections,
        status: "Active",
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Create new survey
  const { data, error } = await supabase
    .from("surveys")
    .insert({
      title: `${template.title} - ${country}`,
      description: template.description,
      category: template.category,
      questions: template.sections,
      status: "Active",
      metadata: {
        type: "tracker",
        template_id: template.id,
        country: country,
        frequency: template.frequency
      }
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};