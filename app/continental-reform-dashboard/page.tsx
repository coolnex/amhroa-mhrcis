// app/continental-reform-dashboard/page.tsx
// Updated version with fixes

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Shield,
  Users,
  Building2,
  FileText,
  DollarSign,
  MapPin,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  RefreshCw,
  Loader2,
  LogOut,
  ArrowLeft,
  Flame,
  Zap,
  Leaf,
  Crown,
  Star,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Heart,
  Brain,
  Stethoscope,
  Wallet,
  Home,
  AlertCircle,
  UserCheck,
} from "lucide-react";

// ============================================
// INTERFACES
// ============================================

interface CountryReformData {
  country: string;
  law_status: "Modern" | "Outdated" | "None" | "Partial";
  law_icon: string;
  implementation_level: "Moderate" | "Weak" | "Minimal" | "None";
  implementation_icon: string;
  budget_allocation: "High" | "Medium" | "Low";
  priority_level: "High" | "Medium" | "Low";
  priority_icon: string;
  strategy: string;
  tier: number;
  reform_score: number;
  population: number;
  region: string;
}

interface TrackerMetrics {
  country: string;
  care_systems?: {
    phc_integration_score: number;
    workforce_score: number;
    service_delivery_score: number;
    task_shifting_implemented: boolean;
    phc_facilities_count: number;
    phc_facilities_with_mh: number;
    phc_providers_trained: number;
    psychiatrists_total: number;
    mental_health_nurses: number;
    community_health_workers_total: number;
    chw_trained_in_mh: number;
    outpatient_visits: number;
    community_visits: number;
    telemedicine_consultations: number;
    vacancy_rate: number;
    hiv_integration_score: number;
    ncd_integration_score: number;
    maternal_health_integration: number;
    youth_health_integration: number;
    last_updated: string;
  };
  financing?: {
    fiscal_year: string;
    total_health_budget: number;
    mental_health_budget: number;
    mh_percentage_of_health: number;
    mh_per_capita: number;
    donor_funding_total: number;
    donor_projects: number;
    investment_case_developed: boolean;
    advocacy_campaigns: number;
    budget_increase_achieved: boolean;
    budget_increase_percentage: number;
    target_mh_budget_percentage: number;
    last_updated: string;
  };
  community?: {
    stigma_index: number;
    discrimination_index: number;
    public_awareness_percentage: number;
    community_programs: number;
    community_workers_deployed: number;
    community_sessions_held: number;
    peer_support_groups: number;
    unemployment_rate: number;
    displacement_count: number;
    faith_organizations_engaged: number;
    traditional_healers_involved: number;
    cultural_sensitivity_score: number;
    stigma_reduction_programs: number;
    well_being_index: number;
    social_cohesion_score: number;
    community_acceptance_score: number;
    resilience_index: number;
    last_updated: string;
  };
  crisis?: {
    early_warning_system_active: boolean;
    alert_level: string;
    rapid_response_teams: number;
    team_coverage: number;
    response_time_hours: number;
    rapid_response_activated: boolean;
    crises_monitored: number;
    active_crises: number;
    psychosocial_teams_deployed: number;
    psychosocial_sessions_held: number;
    beneficiaries_reached: number;
    crisis_hotline_active: boolean;
    hotline_calls_received: number;
    mental_health_first_aid_trained: number;
    trained_responders: number;
    crisis_impact_score: number;
    mh_impact_score: number;
    recovery_progress: number;
    coordination_meetings: number;
    last_updated: string;
  };
}

// ============================================
// STATIC TRACKER DATA (Fallback for display)
// ============================================

const STATIC_TRACKER_DATA: Record<string, TrackerMetrics> = {
  "Kenya": {
    country: "Kenya",
    care_systems: {
      phc_integration_score: 68,
      workforce_score: 65,
      service_delivery_score: 72,
      task_shifting_implemented: true,
      phc_facilities_count: 4500,
      phc_facilities_with_mh: 1800,
      phc_providers_trained: 3200,
      psychiatrists_total: 27,
      mental_health_nurses: 850,
      community_health_workers_total: 12000,
      chw_trained_in_mh: 5400,
      outpatient_visits: 45000,
      community_visits: 28000,
      telemedicine_consultations: 1200,
      vacancy_rate: 32,
      hiv_integration_score: 78,
      ncd_integration_score: 65,
      maternal_health_integration: 72,
      youth_health_integration: 58,
      last_updated: "2024-03-15"
    },
    financing: {
      fiscal_year: "2023/2024",
      total_health_budget: 1800000000,
      mental_health_budget: 45000000,
      mh_percentage_of_health: 2.5,
      mh_per_capita: 0.84,
      donor_funding_total: 12000000,
      donor_projects: 8,
      investment_case_developed: true,
      advocacy_campaigns: 5,
      budget_increase_achieved: true,
      budget_increase_percentage: 15,
      target_mh_budget_percentage: 5,
      last_updated: "2024-03-15"
    },
    community: {
      stigma_index: 62,
      discrimination_index: 58,
      public_awareness_percentage: 45,
      community_programs: 120,
      community_workers_deployed: 850,
      community_sessions_held: 3400,
      peer_support_groups: 65,
      unemployment_rate: 12.5,
      displacement_count: 180000,
      faith_organizations_engaged: 45,
      traditional_healers_involved: 120,
      cultural_sensitivity_score: 72,
      stigma_reduction_programs: 28,
      well_being_index: 58,
      social_cohesion_score: 62,
      community_acceptance_score: 55,
      resilience_index: 60,
      last_updated: "2024-03-15"
    },
    crisis: {
      early_warning_system_active: true,
      alert_level: "Medium",
      rapid_response_teams: 12,
      team_coverage: 65,
      response_time_hours: 4,
      rapid_response_activated: false,
      crises_monitored: 8,
      active_crises: 2,
      psychosocial_teams_deployed: 15,
      psychosocial_sessions_held: 2800,
      beneficiaries_reached: 45000,
      crisis_hotline_active: true,
      hotline_calls_received: 3200,
      mental_health_first_aid_trained: 450,
      trained_responders: 280,
      crisis_impact_score: 42,
      mh_impact_score: 55,
      recovery_progress: 65,
      coordination_meetings: 24,
      last_updated: "2024-03-15"
    }
  },
  "Nigeria": {
    country: "Nigeria",
    care_systems: {
      phc_integration_score: 55,
      workforce_score: 45,
      service_delivery_score: 50,
      task_shifting_implemented: false,
      phc_facilities_count: 12000,
      phc_facilities_with_mh: 2800,
      phc_providers_trained: 1500,
      psychiatrists_total: 120,
      mental_health_nurses: 1200,
      community_health_workers_total: 45000,
      chw_trained_in_mh: 8000,
      outpatient_visits: 95000,
      community_visits: 42000,
      telemedicine_consultations: 800,
      vacancy_rate: 45,
      hiv_integration_score: 52,
      ncd_integration_score: 48,
      maternal_health_integration: 55,
      youth_health_integration: 40,
      last_updated: "2024-03-15"
    },
    financing: {
      fiscal_year: "2023/2024",
      total_health_budget: 2500000000,
      mental_health_budget: 50000000,
      mh_percentage_of_health: 2.0,
      mh_per_capita: 0.24,
      donor_funding_total: 25000000,
      donor_projects: 12,
      investment_case_developed: false,
      advocacy_campaigns: 3,
      budget_increase_achieved: false,
      budget_increase_percentage: 0,
      target_mh_budget_percentage: 5,
      last_updated: "2024-03-15"
    },
    community: {
      stigma_index: 72,
      discrimination_index: 68,
      public_awareness_percentage: 35,
      community_programs: 85,
      community_workers_deployed: 1200,
      community_sessions_held: 2800,
      peer_support_groups: 42,
      unemployment_rate: 22.5,
      displacement_count: 3500000,
      faith_organizations_engaged: 80,
      traditional_healers_involved: 250,
      cultural_sensitivity_score: 65,
      stigma_reduction_programs: 15,
      well_being_index: 42,
      social_cohesion_score: 48,
      community_acceptance_score: 40,
      resilience_index: 45,
      last_updated: "2024-03-15"
    },
    crisis: {
      early_warning_system_active: false,
      alert_level: "High",
      rapid_response_teams: 8,
      team_coverage: 35,
      response_time_hours: 8,
      rapid_response_activated: true,
      crises_monitored: 15,
      active_crises: 5,
      psychosocial_teams_deployed: 25,
      psychosocial_sessions_held: 3500,
      beneficiaries_reached: 85000,
      crisis_hotline_active: false,
      hotline_calls_received: 0,
      mental_health_first_aid_trained: 200,
      trained_responders: 150,
      crisis_impact_score: 68,
      mh_impact_score: 72,
      recovery_progress: 35,
      coordination_meetings: 18,
      last_updated: "2024-03-15"
    }
  },
  "South Africa": {
    country: "South Africa",
    care_systems: {
      phc_integration_score: 78,
      workforce_score: 75,
      service_delivery_score: 82,
      task_shifting_implemented: true,
      phc_facilities_count: 3800,
      phc_facilities_with_mh: 2200,
      phc_providers_trained: 4800,
      psychiatrists_total: 180,
      mental_health_nurses: 3200,
      community_health_workers_total: 18000,
      chw_trained_in_mh: 9200,
      outpatient_visits: 85000,
      community_visits: 52000,
      telemedicine_consultations: 2400,
      vacancy_rate: 22,
      hiv_integration_score: 85,
      ncd_integration_score: 72,
      maternal_health_integration: 78,
      youth_health_integration: 65,
      last_updated: "2024-03-15"
    },
    financing: {
      fiscal_year: "2023/2024",
      total_health_budget: 4500000000,
      mental_health_budget: 135000000,
      mh_percentage_of_health: 3.0,
      mh_per_capita: 2.28,
      donor_funding_total: 35000000,
      donor_projects: 15,
      investment_case_developed: true,
      advocacy_campaigns: 8,
      budget_increase_achieved: true,
      budget_increase_percentage: 12,
      target_mh_budget_percentage: 5,
      last_updated: "2024-03-15"
    },
    community: {
      stigma_index: 48,
      discrimination_index: 42,
      public_awareness_percentage: 65,
      community_programs: 180,
      community_workers_deployed: 1200,
      community_sessions_held: 5600,
      peer_support_groups: 120,
      unemployment_rate: 28.5,
      displacement_count: 450000,
      faith_organizations_engaged: 60,
      traditional_healers_involved: 180,
      cultural_sensitivity_score: 78,
      stigma_reduction_programs: 35,
      well_being_index: 65,
      social_cohesion_score: 58,
      community_acceptance_score: 62,
      resilience_index: 68,
      last_updated: "2024-03-15"
    },
    crisis: {
      early_warning_system_active: true,
      alert_level: "Medium",
      rapid_response_teams: 20,
      team_coverage: 80,
      response_time_hours: 3,
      rapid_response_activated: false,
      crises_monitored: 12,
      active_crises: 3,
      psychosocial_teams_deployed: 30,
      psychosocial_sessions_held: 4800,
      beneficiaries_reached: 75000,
      crisis_hotline_active: true,
      hotline_calls_received: 5800,
      mental_health_first_aid_trained: 800,
      trained_responders: 450,
      crisis_impact_score: 35,
      mh_impact_score: 45,
      recovery_progress: 75,
      coordination_meetings: 32,
      last_updated: "2024-03-15"
    }
  },
  "Ghana": {
    country: "Ghana",
    care_systems: {
      phc_integration_score: 62,
      workforce_score: 58,
      service_delivery_score: 65,
      task_shifting_implemented: true,
      phc_facilities_count: 2800,
      phc_facilities_with_mh: 1200,
      phc_providers_trained: 1800,
      psychiatrists_total: 35,
      mental_health_nurses: 450,
      community_health_workers_total: 8000,
      chw_trained_in_mh: 2800,
      outpatient_visits: 32000,
      community_visits: 18000,
      telemedicine_consultations: 600,
      vacancy_rate: 35,
      hiv_integration_score: 68,
      ncd_integration_score: 58,
      maternal_health_integration: 65,
      youth_health_integration: 50,
      last_updated: "2024-03-15"
    },
    financing: {
      fiscal_year: "2023/2024",
      total_health_budget: 800000000,
      mental_health_budget: 24000000,
      mh_percentage_of_health: 3.0,
      mh_per_capita: 0.77,
      donor_funding_total: 8000000,
      donor_projects: 6,
      investment_case_developed: true,
      advocacy_campaigns: 4,
      budget_increase_achieved: true,
      budget_increase_percentage: 10,
      target_mh_budget_percentage: 5,
      last_updated: "2024-03-15"
    },
    community: {
      stigma_index: 58,
      discrimination_index: 52,
      public_awareness_percentage: 50,
      community_programs: 95,
      community_workers_deployed: 600,
      community_sessions_held: 2800,
      peer_support_groups: 48,
      unemployment_rate: 14.5,
      displacement_count: 120000,
      faith_organizations_engaged: 35,
      traditional_healers_involved: 90,
      cultural_sensitivity_score: 72,
      stigma_reduction_programs: 20,
      well_being_index: 55,
      social_cohesion_score: 60,
      community_acceptance_score: 52,
      resilience_index: 58,
      last_updated: "2024-03-15"
    },
    crisis: {
      early_warning_system_active: true,
      alert_level: "Low",
      rapid_response_teams: 10,
      team_coverage: 55,
      response_time_hours: 5,
      rapid_response_activated: false,
      crises_monitored: 5,
      active_crises: 1,
      psychosocial_teams_deployed: 10,
      psychosocial_sessions_held: 1800,
      beneficiaries_reached: 28000,
      crisis_hotline_active: true,
      hotline_calls_received: 1500,
      mental_health_first_aid_trained: 300,
      trained_responders: 180,
      crisis_impact_score: 30,
      mh_impact_score: 40,
      recovery_progress: 70,
      coordination_meetings: 20,
      last_updated: "2024-03-15"
    }
  },
  "Rwanda": {
    country: "Rwanda",
    care_systems: {
      phc_integration_score: 72,
      workforce_score: 70,
      service_delivery_score: 75,
      task_shifting_implemented: true,
      phc_facilities_count: 1200,
      phc_facilities_with_mh: 800,
      phc_providers_trained: 2200,
      psychiatrists_total: 15,
      mental_health_nurses: 320,
      community_health_workers_total: 4500,
      chw_trained_in_mh: 2800,
      outpatient_visits: 22000,
      community_visits: 15000,
      telemedicine_consultations: 400,
      vacancy_rate: 25,
      hiv_integration_score: 82,
      ncd_integration_score: 68,
      maternal_health_integration: 75,
      youth_health_integration: 62,
      last_updated: "2024-03-15"
    },
    financing: {
      fiscal_year: "2023/2024",
      total_health_budget: 450000000,
      mental_health_budget: 18000000,
      mh_percentage_of_health: 4.0,
      mh_per_capita: 1.39,
      donor_funding_total: 10000000,
      donor_projects: 10,
      investment_case_developed: true,
      advocacy_campaigns: 6,
      budget_increase_achieved: true,
      budget_increase_percentage: 18,
      target_mh_budget_percentage: 5,
      last_updated: "2024-03-15"
    },
    community: {
      stigma_index: 42,
      discrimination_index: 38,
      public_awareness_percentage: 58,
      community_programs: 85,
      community_workers_deployed: 500,
      community_sessions_held: 3200,
      peer_support_groups: 55,
      unemployment_rate: 16.5,
      displacement_count: 80000,
      faith_organizations_engaged: 30,
      traditional_healers_involved: 60,
      cultural_sensitivity_score: 82,
      stigma_reduction_programs: 25,
      well_being_index: 65,
      social_cohesion_score: 72,
      community_acceptance_score: 68,
      resilience_index: 70,
      last_updated: "2024-03-15"
    },
    crisis: {
      early_warning_system_active: true,
      alert_level: "Low",
      rapid_response_teams: 8,
      team_coverage: 75,
      response_time_hours: 2,
      rapid_response_activated: false,
      crises_monitored: 3,
      active_crises: 0,
      psychosocial_teams_deployed: 8,
      psychosocial_sessions_held: 1200,
      beneficiaries_reached: 18000,
      crisis_hotline_active: true,
      hotline_calls_received: 800,
      mental_health_first_aid_trained: 250,
      trained_responders: 150,
      crisis_impact_score: 20,
      mh_impact_score: 28,
      recovery_progress: 85,
      coordination_meetings: 18,
      last_updated: "2024-03-15"
    }
  },
  "Uganda": {
    country: "Uganda",
    care_systems: {
      phc_integration_score: 58,
      workforce_score: 52,
      service_delivery_score: 55,
      task_shifting_implemented: true,
      phc_facilities_count: 2800,
      phc_facilities_with_mh: 850,
      phc_providers_trained: 1200,
      psychiatrists_total: 20,
      mental_health_nurses: 280,
      community_health_workers_total: 8000,
      chw_trained_in_mh: 2400,
      outpatient_visits: 28000,
      community_visits: 16000,
      telemedicine_consultations: 300,
      vacancy_rate: 42,
      hiv_integration_score: 72,
      ncd_integration_score: 55,
      maternal_health_integration: 62,
      youth_health_integration: 45,
      last_updated: "2024-03-15"
    },
    financing: {
      fiscal_year: "2023/2024",
      total_health_budget: 300000000,
      mental_health_budget: 9000000,
      mh_percentage_of_health: 3.0,
      mh_per_capita: 0.20,
      donor_funding_total: 6000000,
      donor_projects: 5,
      investment_case_developed: false,
      advocacy_campaigns: 3,
      budget_increase_achieved: false,
      budget_increase_percentage: 0,
      target_mh_budget_percentage: 5,
      last_updated: "2024-03-15"
    },
    community: {
      stigma_index: 68,
      discrimination_index: 62,
      public_awareness_percentage: 42,
      community_programs: 70,
      community_workers_deployed: 400,
      community_sessions_held: 2000,
      peer_support_groups: 35,
      unemployment_rate: 18.5,
      displacement_count: 1600000,
      faith_organizations_engaged: 50,
      traditional_healers_involved: 100,
      cultural_sensitivity_score: 68,
      stigma_reduction_programs: 15,
      well_being_index: 48,
      social_cohesion_score: 52,
      community_acceptance_score: 45,
      resilience_index: 50,
      last_updated: "2024-03-15"
    },
    crisis: {
      early_warning_system_active: false,
      alert_level: "Medium",
      rapid_response_teams: 6,
      team_coverage: 30,
      response_time_hours: 6,
      rapid_response_activated: true,
      crises_monitored: 10,
      active_crises: 3,
      psychosocial_teams_deployed: 12,
      psychosocial_sessions_held: 1500,
      beneficiaries_reached: 35000,
      crisis_hotline_active: false,
      hotline_calls_received: 0,
      mental_health_first_aid_trained: 150,
      trained_responders: 100,
      crisis_impact_score: 55,
      mh_impact_score: 60,
      recovery_progress: 45,
      coordination_meetings: 15,
      last_updated: "2024-03-15"
    }
  }
};

// ============================================
// CONSTANTS
// ============================================

const COUNTRY_DATA: CountryReformData[] = [
  // Tier 1: High Priority Countries
  { country: "Somalia", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Emergency mental health policy + humanitarian integration", tier: 1, reform_score: 15, population: 15893000, region: "East Africa" },
  { country: "South Sudan", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Build from scratch (policy + workforce)", tier: 1, reform_score: 12, population: 11193000, region: "East Africa" },
  { country: "Chad", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy development + WHO engagement", tier: 1, reform_score: 18, population: 16426000, region: "Central Africa" },
  { country: "Central African Republic", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Integrate into primary healthcare", tier: 1, reform_score: 14, population: 5496000, region: "Central Africa" },
  { country: "Eritrea", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy advocacy via AU/WHO channels", tier: 1, reform_score: 16, population: 3545000, region: "East Africa" },
  { country: "Guinea-Bissau", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Regional policy support (ECOWAS)", tier: 1, reform_score: 19, population: 1968000, region: "West Africa" },
  { country: "DR Congo", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "National law + decentralization strategy", tier: 1, reform_score: 13, population: 89561000, region: "Central Africa" },
  { country: "Republic of Congo", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Legislative advocacy", tier: 1, reform_score: 17, population: 5518000, region: "Central Africa" },
  { country: "Equatorial Guinea", law_status: "None", law_icon: "❌", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy initiation + technical support", tier: 1, reform_score: 11, population: 1403000, region: "Central Africa" },
  // Tier 2: Law Exists But Minimal Implementation
  { country: "Nigeria", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Domestication + state-level rollout + funding", tier: 2, reform_score: 45, population: 206140000, region: "West Africa" },
  { country: "Kenya", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Devolution + county-level implementation", tier: 2, reform_score: 48, population: 53771000, region: "East Africa" },
  { country: "Uganda", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Community mental health scale-up", tier: 2, reform_score: 42, population: 45741000, region: "East Africa" },
  { country: "Ethiopia", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Integrate into PHC + workforce expansion", tier: 2, reform_score: 44, population: 114964000, region: "East Africa" },
  { country: "Ghana", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Strengthen Mental Health Authority", tier: 2, reform_score: 52, population: 31073000, region: "West Africa" },
  { country: "Sierra Leone", law_status: "Modern", law_icon: "✅", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Post-law operational structures", tier: 2, reform_score: 38, population: 7977000, region: "West Africa" },
  { country: "Liberia", law_status: "Modern", law_icon: "✅", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "System rebuilding + donor alignment", tier: 2, reform_score: 35, population: 5058000, region: "West Africa" },
  { country: "The Gambia", law_status: "Modern", law_icon: "✅", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Implementation framework development", tier: 2, reform_score: 40, population: 2417000, region: "West Africa" },
  { country: "Rwanda", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Scale community services", tier: 2, reform_score: 55, population: 12952000, region: "East Africa" },
  { country: "Zambia", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Conference leverage for national reform", tier: 2, reform_score: 41, population: 18384000, region: "Southern Africa" },
  { country: "Malawi", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Workforce + PHC integration", tier: 2, reform_score: 39, population: 19130000, region: "Southern Africa" },
  { country: "Zimbabwe", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy-to-service transition", tier: 2, reform_score: 43, population: 14863000, region: "Southern Africa" },
  // Tier 3: Outdated Laws
  { country: "Cameroon", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Law reform advocacy", tier: 3, reform_score: 36, population: 26546000, region: "Central Africa" },
  { country: "Senegal", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Policy update + decentralization", tier: 3, reform_score: 47, population: 16744000, region: "West Africa" },
  { country: "Côte d'Ivoire", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Legal modernization", tier: 3, reform_score: 49, population: 26378000, region: "West Africa" },
  { country: "Togo", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Reform + system strengthening", tier: 3, reform_score: 32, population: 8279000, region: "West Africa" },
  { country: "Benin", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy overhaul", tier: 3, reform_score: 30, population: 12123000, region: "West Africa" },
  { country: "Madagascar", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "National law reform", tier: 3, reform_score: 28, population: 27691000, region: "Southern Africa" },
  { country: "Mozambique", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Update + implementation", tier: 3, reform_score: 45, population: 31255000, region: "Southern Africa" },
  { country: "Angola", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Reform + workforce investment", tier: 3, reform_score: 46, population: 32866000, region: "Southern Africa" },
  { country: "Algeria", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Align with human rights", tier: 3, reform_score: 50, population: 43851000, region: "North Africa" },
  { country: "Burundi", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Reform + basic services", tier: 3, reform_score: 25, population: 11891000, region: "East Africa" },
  { country: "Niger", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Law + system establishment", tier: 3, reform_score: 22, population: 24207000, region: "West Africa" },
  { country: "Mali", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Conflict-sensitive reform", tier: 3, reform_score: 24, population: 20251000, region: "West Africa" },
  { country: "Mauritania", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy development", tier: 3, reform_score: 26, population: 4650000, region: "West Africa" },
  // Tier 4: Moderate Systems
  { country: "South Africa", law_status: "Modern", law_icon: "✅", implementation_level: "Moderate", implementation_icon: "🟢", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Equity + community care", tier: 4, reform_score: 68, population: 59309000, region: "Southern Africa" },
  { country: "Egypt", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Decentralization", tier: 4, reform_score: 54, population: 102334000, region: "North Africa" },
  { country: "Morocco", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Community-based care", tier: 4, reform_score: 56, population: 36910600, region: "North Africa" },
  { country: "Tunisia", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "System reform", tier: 4, reform_score: 52, population: 11819000, region: "North Africa" },
  { country: "Botswana", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Workforce expansion", tier: 4, reform_score: 53, population: 2352000, region: "Southern Africa" },
  { country: "Namibia", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Service decentralization", tier: 4, reform_score: 51, population: 2541000, region: "Southern Africa" },
  { country: "Mauritius", law_status: "Modern", law_icon: "✅", implementation_level: "Moderate", implementation_icon: "🟢", budget_allocation: "High", priority_level: "Low", priority_icon: "🌱", strategy: "Model system strengthening", tier: 4, reform_score: 72, population: 1272000, region: "Eastern Africa" },
  { country: "Cabo Verde", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Scale services", tier: 4, reform_score: 48, population: 555000, region: "West Africa" },
  // Tier 5: Small States / Mixed Systems
  { country: "Seychelles", law_status: "Modern", law_icon: "✅", implementation_level: "Moderate", implementation_icon: "🟢", budget_allocation: "Medium", priority_level: "Low", priority_icon: "🌱", strategy: "Sustain + innovation", tier: 5, reform_score: 70, population: 98000, region: "Eastern Africa" },
  { country: "Comoros", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Law reform", tier: 5, reform_score: 28, population: 869000, region: "Eastern Africa" },
  { country: "Djibouti", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "System development", tier: 5, reform_score: 30, population: 988000, region: "East Africa" },
  { country: "Lesotho", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Legal update", tier: 5, reform_score: 42, population: 2142000, region: "Southern Africa" },
  { country: "Eswatini", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Reform + services", tier: 5, reform_score: 40, population: 1160000, region: "Southern Africa" },
  // Additional Countries
  { country: "Sudan", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Reform in fragile context", tier: 3, reform_score: 20, population: 43849000, region: "North Africa" },
  { country: "Libya", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "System rebuilding", tier: 3, reform_score: 22, population: 6871000, region: "North Africa" },
  { country: "Tanzania", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Low", priority_level: "Medium", priority_icon: "⚡", strategy: "Law reform + PHC", tier: 3, reform_score: 44, population: 59734000, region: "East Africa" },
  { country: "Gabon", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Legal modernization", tier: 3, reform_score: 46, population: 2225000, region: "Central Africa" },
  { country: "Guinea", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Reform + awareness", tier: 3, reform_score: 30, population: 13133000, region: "West Africa" },
  { country: "Burkina Faso", law_status: "Outdated", law_icon: "⚠️", implementation_level: "Minimal", implementation_icon: "🔴", budget_allocation: "Low", priority_level: "High", priority_icon: "🔥", strategy: "Policy + service rollout", tier: 3, reform_score: 28, population: 20903000, region: "West Africa" },
  { country: "Cape Verde", law_status: "Modern", law_icon: "✅", implementation_level: "Weak", implementation_icon: "🟡", budget_allocation: "Medium", priority_level: "Medium", priority_icon: "⚡", strategy: "Strengthen implementation", tier: 4, reform_score: 47, population: 555000, region: "West Africa" },
];


// ============================================
// COUNTRY DETAIL MODAL COMPONENT
// ============================================

interface CountryDetailModalProps {
  country: CountryReformData | null;
  metrics: TrackerMetrics | null;
  onClose: () => void;
  isOpen: boolean;
}

function CountryDetailModal({ country, metrics, onClose, isOpen }: CountryDetailModalProps) {
  if (!isOpen || !country) return null;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500/20";
    if (score >= 50) return "bg-yellow-500/20";
    return "bg-red-500/20";
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return "bg-red-500/20 text-red-400 border-red-500/30";
      case 2: return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case 3: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 4: return "bg-green-500/20 text-green-400 border-green-500/30";
      case 5: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return "High Priority - System Failure";
      case 2: return "Law Exists - Minimal Implementation";
      case 3: return "Outdated Laws - Reform Urgent";
      case 4: return "Moderate Systems - Implementation Gaps";
      case 5: return "Small States / Mixed Systems";
      default: return "Unknown";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High": return <Flame className="w-4 h-4 text-red-500" />;
      case "Medium": return <Zap className="w-4 h-4 text-yellow-500" />;
      case "Low": return <Leaf className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-start z-10">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl font-bold text-white">{country.country}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(country.tier)}`}>
                Tier {country.tier} - {getTierLabel(country.tier)}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-slate-700 text-slate-300">
                {getPriorityIcon(country.priority_level)}
                {country.priority_level} Priority
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{country.region} · Population: {(country.population / 1000000).toFixed(1)}M</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-3xl transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Reform Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-sm">Reform Score</p>
              <p className={`text-4xl font-bold ${getScoreColor(country.reform_score)}`}>
                {country.reform_score}%
              </p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${getScoreBgColor(country.reform_score)}`}
                  style={{ width: `${country.reform_score}%` }}
                />
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-sm">Law Status</p>
              <p className="text-4xl">{country.law_icon}</p>
              <p className="text-white font-medium mt-1">{country.law_status}</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-sm">Implementation</p>
              <p className="text-4xl">{country.implementation_icon}</p>
              <p className="text-white font-medium mt-1">{country.implementation_level}</p>
            </div>
          </div>

          {/* Strategy & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-semibold mb-2">🎯 Strategic Pathway</p>
              <p className="text-white text-sm">{country.strategy}</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-semibold mb-2">💰 Budget Allocation</p>
              <div className="flex items-center gap-3">
                <span className={`text-2xl ${
                  country.budget_allocation === "High" ? "text-emerald-400" :
                  country.budget_allocation === "Medium" ? "text-yellow-400" :
                  "text-red-400"
                }`}>
                  {country.budget_allocation}
                </span>
                <span className="text-slate-400 text-sm">
                  {country.budget_allocation === "High" ? ">2% of health budget" :
                    country.budget_allocation === "Medium" ? "1-2% of health budget" :
                    "<1% of health budget"}
                </span>
              </div>
            </div>
          </div>

          {/* Tracker Metrics - If available */}
          {metrics && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg border-b border-slate-700 pb-2">
                📊 Tracker Intelligence
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Care Systems */}
                {metrics.care_systems && (
                  <div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Stethoscope className="w-5 h-5 text-pink-400" />
                      <h4 className="text-pink-400 font-semibold">Care Systems</h4>
                      <span className="text-slate-500 text-xs ml-auto">
                        Updated: {new Date(metrics.care_systems.last_updated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">PHC Integration</span>
                        <span className="text-white font-medium">{metrics.care_systems.phc_integration_score}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${metrics.care_systems.phc_integration_score}%` }} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Workforce Score</span>
                        <span className="text-white font-medium">{metrics.care_systems.workforce_score}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${metrics.care_systems.workforce_score}%` }} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Service Delivery</span>
                        <span className="text-white font-medium">{metrics.care_systems.service_delivery_score}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${metrics.care_systems.service_delivery_score}%` }} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Task Shifting</span>
                        <span className="text-white font-medium">
                          {metrics.care_systems.task_shifting_implemented ? "✅ Implemented" : "❌ Not Implemented"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-pink-500/20">
                        <div>
                          <p>Psychiatrists</p>
                          <p className="text-white font-bold">{metrics.care_systems.psychiatrists_total || 0}</p>
                        </div>
                        <div>
                          <p>MH Nurses</p>
                          <p className="text-white font-bold">{metrics.care_systems.mental_health_nurses || 0}</p>
                        </div>
                        <div>
                          <p>CHWs Trained</p>
                          <p className="text-white font-bold">{metrics.care_systems.chw_trained_in_mh || 0}</p>
                        </div>
                        <div>
                          <p>Vacancy Rate</p>
                          <p className="text-white font-bold">{metrics.care_systems.vacancy_rate || 0}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financing */}
                {metrics.financing && (
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-emerald-400 font-semibold">Financing</h4>
                      <span className="text-slate-500 text-xs ml-auto">
                        {metrics.financing.fiscal_year}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">MH % of Health Budget</span>
                        <span className="text-white font-medium">{metrics.financing.mh_percentage_of_health}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, metrics.financing.mh_percentage_of_health * 10)}%` }} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Donor Funding</span>
                        <span className="text-white font-medium">${(metrics.financing.donor_funding_total / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Donor Projects</span>
                        <span className="text-white font-medium">{metrics.financing.donor_projects}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Investment Case</span>
                        <span className="text-white font-medium">
                          {metrics.financing.investment_case_developed ? "✅ Developed" : "❌ Not Developed"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Budget Increase</span>
                        <span className="text-white font-medium">
                          {metrics.financing.budget_increase_achieved ? `✅ ${metrics.financing.budget_increase_percentage}%` : "❌ Not Achieved"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-emerald-500/20">
                        <div>
                          <p>Target MH Budget</p>
                          <p className="text-white font-bold">{metrics.financing.target_mh_budget_percentage || 5}%</p>
                        </div>
                        <div>
                          <p>MH Per Capita</p>
                          <p className="text-white font-bold">${metrics.financing.mh_per_capita || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Community */}
                {metrics.community && (
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Home className="w-5 h-5 text-blue-400" />
                      <h4 className="text-blue-400 font-semibold">Community</h4>
                      <span className="text-slate-500 text-xs ml-auto">
                        Updated: {new Date(metrics.community.last_updated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-slate-400 text-xs">Stigma Index</p>
                          <p className="text-white font-bold">{metrics.community.stigma_index}</p>
                          <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                            <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${metrics.community.stigma_index}%` }} />
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Awareness</p>
                          <p className="text-white font-bold">{metrics.community.public_awareness_percentage}%</p>
                          <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                            <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${metrics.community.public_awareness_percentage}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-blue-500/20">
                        <div>
                          <p>Community Programs</p>
                          <p className="text-white font-bold">{metrics.community.community_programs}</p>
                        </div>
                        <div>
                          <p>Peer Support Groups</p>
                          <p className="text-white font-bold">{metrics.community.peer_support_groups}</p>
                        </div>
                        <div>
                          <p>Well-being Index</p>
                          <p className="text-white font-bold">{metrics.community.well_being_index}</p>
                        </div>
                        <div>
                          <p>Resilience Index</p>
                          <p className="text-white font-bold">{metrics.community.resilience_index}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Crisis */}
                {metrics.crisis && (
                  <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <h4 className="text-red-400 font-semibold">Crisis Response</h4>
                      <span className="text-slate-500 text-xs ml-auto">
                        Updated: {new Date(metrics.crisis.last_updated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Alert Level</span>
                        <span className={`font-medium ${
                          metrics.crisis.alert_level === "Critical" || metrics.crisis.alert_level === "Emergency" ? "text-red-400" :
                          metrics.crisis.alert_level === "High" ? "text-orange-400" :
                          metrics.crisis.alert_level === "Elevated" ? "text-yellow-400" :
                          "text-emerald-400"
                        }`}>
                          {metrics.crisis.alert_level}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Early Warning System</span>
                        <span className="text-white font-medium">
                          {metrics.crisis.early_warning_system_active ? "✅ Active" : "❌ Inactive"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Rapid Response Teams</span>
                        <span className="text-white font-medium">{metrics.crisis.rapid_response_teams}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Crisis Impact Score</span>
                        <span className={`font-medium ${getScoreColor(100 - metrics.crisis.crisis_impact_score)}`}>
                          {metrics.crisis.crisis_impact_score}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Recovery Progress</span>
                        <span className="text-emerald-400 font-medium">{metrics.crisis.recovery_progress}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-red-500/20">
                        <div>
                          <p>Hotline Active</p>
                          <p className="text-white font-bold">{metrics.crisis.crisis_hotline_active ? "✅" : "❌"}</p>
                        </div>
                        <div>
                          <p>MHFA Trained</p>
                          <p className="text-white font-bold">{metrics.crisis.mental_health_first_aid_trained}</p>
                        </div>
                        <div>
                          <p>Beneficiaries Reached</p>
                          <p className="text-white font-bold">{metrics.crisis.beneficiaries_reached.toLocaleString()}</p>
                        </div>
                        <div>
                          <p>Coordination Meetings</p>
                          <p className="text-white font-bold">{metrics.crisis.coordination_meetings}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={() => {
                window.location.href = `/countries/${encodeURIComponent(country.country)}`;
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Full Country Profile
            </button>
            <button
              onClick={() => {
                window.location.href = `/ai-country-profile?country=${encodeURIComponent(country.country)}`;
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              AI Intelligence
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ContinentalReformDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState<number | "all">("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("tier");
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [trackerMetrics, setTrackerMetrics] = useState<Record<string, TrackerMetrics>>({});
  const [loadingTrackers, setLoadingTrackers] = useState(true);
  const [useStaticData, setUseStaticData] = useState(true);
  
  // Modal state
  const [selectedCountry, setSelectedCountry] = useState<CountryReformData | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchTrackerMetrics();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.status === "Approved") {
          setUser(userData);
          setIsAuthorized(true);
          setLoading(false);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile && profile.status === "Approved") {
        setUser(profile);
        setIsAuthorized(true);
        localStorage.setItem("user", JSON.stringify(profile));
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackerMetrics = async () => {
    setLoadingTrackers(true);
    try {
      const metrics: Record<string, TrackerMetrics> = {};

      if (useStaticData) {
        Object.entries(STATIC_TRACKER_DATA).forEach(([country, data]) => {
          metrics[country] = data;
        });
      }

      // Fetch Care Systems metrics
      const { data: careData } = await supabase
        .from("care_system_metrics")
        .select("*")
        .order("created_at", { ascending: false });

      if (careData && careData.length > 0) {
        careData.forEach((item: any) => {
          if (!metrics[item.country]) {
            metrics[item.country] = { country: item.country };
          }
          metrics[item.country].care_systems = {
            phc_integration_score: item.phc_integration_score || 0,
            workforce_score: item.workforce_score || item.service_delivery_score || 0,
            service_delivery_score: item.service_delivery_score || 0,
            task_shifting_implemented: item.task_shifting_implemented || false,
            phc_facilities_count: item.phc_facilities_count || 0,
            phc_facilities_with_mh: item.phc_facilities_with_mh || 0,
            phc_providers_trained: item.phc_providers_trained || 0,
            psychiatrists_total: item.psychiatrists_total || 0,
            mental_health_nurses: item.mental_health_nurses || 0,
            community_health_workers_total: item.community_health_workers_total || 0,
            chw_trained_in_mh: item.chw_trained_in_mh || 0,
            outpatient_visits: item.outpatient_visits || 0,
            community_visits: item.community_visits || 0,
            telemedicine_consultations: item.telemedicine_consultations || 0,
            vacancy_rate: item.vacancy_rate || 0,
            hiv_integration_score: item.hiv_integration_score || 0,
            ncd_integration_score: item.ncd_integration_score || 0,
            maternal_health_integration: item.maternal_health_integration || 0,
            youth_health_integration: item.youth_health_integration || 0,
            last_updated: item.created_at || item.updated_at || new Date().toISOString(),
          };
        });
      }

      // Fetch Financing metrics
      const { data: financeData } = await supabase
        .from("financing_metrics")
        .select("*")
        .order("created_at", { ascending: false });

      if (financeData && financeData.length > 0) {
        financeData.forEach((item: any) => {
          if (!metrics[item.country]) {
            metrics[item.country] = { country: item.country };
          }
          metrics[item.country].financing = {
            fiscal_year: item.fiscal_year || "",
            total_health_budget: item.total_health_budget || 0,
            mental_health_budget: item.mental_health_budget || 0,
            mh_percentage_of_health: item.mh_percentage_of_health || 0,
            mh_per_capita: item.mh_per_capita || 0,
            donor_funding_total: item.donor_funding_total || 0,
            donor_projects: item.donor_projects || 0,
            investment_case_developed: item.investment_case_developed || false,
            advocacy_campaigns: item.advocacy_campaigns || 0,
            budget_increase_achieved: item.budget_increase_achieved || false,
            budget_increase_percentage: item.budget_increase_percentage || 0,
            target_mh_budget_percentage: item.target_mh_budget_percentage || 0,
            last_updated: item.created_at || item.updated_at || new Date().toISOString(),
          };
        });
      }

      // Fetch Community metrics
      const { data: communityData } = await supabase
        .from("community_determinants")
        .select("*")
        .order("created_at", { ascending: false });

      if (communityData && communityData.length > 0) {
        communityData.forEach((item: any) => {
          if (!metrics[item.country]) {
            metrics[item.country] = { country: item.country };
          }
          metrics[item.country].community = {
            stigma_index: item.stigma_index || 0,
            discrimination_index: item.discrimination_index || 0,
            public_awareness_percentage: item.public_awareness_percentage || 0,
            community_programs: item.community_programs || 0,
            community_workers_deployed: item.community_workers_deployed || 0,
            community_sessions_held: item.community_sessions_held || 0,
            peer_support_groups: item.peer_support_groups || 0,
            unemployment_rate: item.unemployment_rate || 0,
            displacement_count: item.displacement_count || 0,
            faith_organizations_engaged: item.faith_organizations_engaged || 0,
            traditional_healers_involved: item.traditional_healers_involved || 0,
            cultural_sensitivity_score: item.cultural_sensitivity_score || 0,
            stigma_reduction_programs: item.stigma_reduction_programs || 0,
            well_being_index: item.well_being_index || 0,
            social_cohesion_score: item.social_cohesion_score || 0,
            community_acceptance_score: item.community_acceptance_score || 0,
            resilience_index: item.resilience_index || 0,
            last_updated: item.created_at || item.updated_at || new Date().toISOString(),
          };
        });
      }

      // Fetch Crisis metrics
      const { data: crisisData } = await supabase
        .from("crisis_response_metrics")
        .select("*")
        .order("created_at", { ascending: false });

      if (crisisData && crisisData.length > 0) {
        crisisData.forEach((item: any) => {
          if (!metrics[item.country]) {
            metrics[item.country] = { country: item.country };
          }
          metrics[item.country].crisis = {
            early_warning_system_active: item.early_warning_system_active || false,
            alert_level: item.alert_level || "Normal",
            rapid_response_teams: item.rapid_response_teams || 0,
            team_coverage: item.team_coverage || 0,
            response_time_hours: item.response_time_hours || 0,
            rapid_response_activated: item.rapid_response_activated || false,
            crises_monitored: item.crises_monitored || 0,
            active_crises: item.active_crises || 0,
            psychosocial_teams_deployed: item.psychosocial_teams_deployed || 0,
            psychosocial_sessions_held: item.psychosocial_sessions_held || 0,
            beneficiaries_reached: item.beneficiaries_reached || 0,
            crisis_hotline_active: item.crisis_hotline_active || false,
            hotline_calls_received: item.hotline_calls_received || 0,
            mental_health_first_aid_trained: item.mental_health_first_aid_trained || 0,
            trained_responders: item.trained_responders || 0,
            crisis_impact_score: item.crisis_impact_score || 0,
            mh_impact_score: item.mh_impact_score || 0,
            recovery_progress: item.recovery_progress || 0,
            coordination_meetings: item.coordination_meetings || 0,
            last_updated: item.created_at || item.updated_at || new Date().toISOString(),
          };
        });
      }

      setTrackerMetrics(metrics);
    } catch (error) {
      console.error("Error fetching tracker metrics:", error);
      setTrackerMetrics(STATIC_TRACKER_DATA);
    } finally {
      setLoadingTrackers(false);
    }
  };

  // ============================================
  // HANDLE COUNTRY CLICK FOR MODAL
  // ============================================

  const handleCountryClick = (country: CountryReformData) => {
    setSelectedCountry(country);
    setShowCountryModal(true);
  };

  // ============================================
  // HELPERS
  // ============================================

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High": return <Flame className="w-4 h-4 text-red-500" />;
      case "Medium": return <Zap className="w-4 h-4 text-yellow-500" />;
      case "Low": return <Leaf className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return "bg-red-500/20 text-red-400 border-red-500/30";
      case 2: return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case 3: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 4: return "bg-green-500/20 text-green-400 border-green-500/30";
      case 5: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return "High Priority - System Failure";
      case 2: return "Law Exists - Minimal Implementation";
      case 3: return "Outdated Laws - Reform Urgent";
      case 4: return "Moderate Systems - Implementation Gaps";
      case 5: return "Small States / Mixed Systems";
      default: return "Unknown";
    }
  };

  const getLawIcon = (status: string) => {
    switch (status) {
      case "Modern": return "✅";
      case "Outdated": return "⚠️";
      case "Partial": return "🔶";
      case "None": return "❌";
      default: return "❌";
    }
  };

  const getTrackerIcon = (type: string) => {
    switch (type) {
      case "care": return <Stethoscope className="w-4 h-4 text-pink-400" />;
      case "financing": return <Wallet className="w-4 h-4 text-emerald-400" />;
      case "community": return <Home className="w-4 h-4 text-blue-400" />;
      case "crisis": return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrackerLabel = (type: string) => {
    switch (type) {
      case "care": return "Care Systems";
      case "financing": return "Financing";
      case "community": return "Community";
      case "crisis": return "Crisis Response";
      default: return "All";
    }
  };

  const filteredData = useMemo(() => {
    let filtered = COUNTRY_DATA;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.country.toLowerCase().includes(term) ||
        c.strategy.toLowerCase().includes(term) ||
        c.region.toLowerCase().includes(term)
      );
    }

    if (selectedTier !== "all") {
      filtered = filtered.filter(c => c.tier === selectedTier);
    }

    if (selectedRegion !== "all") {
      filtered = filtered.filter(c => c.region === selectedRegion);
    }

    if (selectedPriority !== "all") {
      filtered = filtered.filter(c => c.priority_level === selectedPriority);
    }

    if (sortBy === "tier") {
      filtered.sort((a, b) => a.tier - b.tier);
    } else if (sortBy === "reform_score") {
      filtered.sort((a, b) => b.reform_score - a.reform_score);
    } else if (sortBy === "country") {
      filtered.sort((a, b) => a.country.localeCompare(b.country));
    }

    return filtered;
  }, [searchTerm, selectedTier, selectedRegion, selectedPriority, sortBy]);

  const stats = {
    totalCountries: COUNTRY_DATA.length,
    highPriority: COUNTRY_DATA.filter(c => c.priority_level === "High").length,
    mediumPriority: COUNTRY_DATA.filter(c => c.priority_level === "Medium").length,
    lowPriority: COUNTRY_DATA.filter(c => c.priority_level === "Low").length,
    tier1Count: COUNTRY_DATA.filter(c => c.tier === 1).length,
    tier2Count: COUNTRY_DATA.filter(c => c.tier === 2).length,
    tier3Count: COUNTRY_DATA.filter(c => c.tier === 3).length,
    tier4Count: COUNTRY_DATA.filter(c => c.tier === 4).length,
    tier5Count: COUNTRY_DATA.filter(c => c.tier === 5).length,
    avgReformScore: Math.round(COUNTRY_DATA.reduce((acc, c) => acc + c.reform_score, 0) / COUNTRY_DATA.length),
    modernLaw: COUNTRY_DATA.filter(c => c.law_status === "Modern").length,
    outdatedLaw: COUNTRY_DATA.filter(c => c.law_status === "Outdated").length,
    noLaw: COUNTRY_DATA.filter(c => c.law_status === "None").length,
    countriesWithTrackerData: Object.keys(trackerMetrics).length,
  };

  const regions = [...new Set(COUNTRY_DATA.map(c => c.region))];

  const renderTrackerBadges = (country: string) => {
    const metrics = trackerMetrics[country];
    if (!metrics) return null;

    const hasCare = metrics.care_systems;
    const hasFinancing = metrics.financing;
    const hasCommunity = metrics.community;
    const hasCrisis = metrics.crisis;

    const activeTrackers = [];
    if (hasCare) activeTrackers.push("care");
    if (hasFinancing) activeTrackers.push("financing");
    if (hasCommunity) activeTrackers.push("community");
    if (hasCrisis) activeTrackers.push("crisis");

    if (activeTrackers.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {activeTrackers.map((type) => (
          <span key={type} className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300 flex items-center gap-1">
            {getTrackerIcon(type)}
            {getTrackerLabel(type)}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading Continental Reform Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-6 md:py-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
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
                    CONTINENTAL REFORM INTELLIGENCE
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">54 Countries Monitored</span>
                </div>
                {stats.countriesWithTrackerData > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                    <Activity className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-400 text-xs">{stats.countriesWithTrackerData} with Tracker Data</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Continental Mental Health Reform Dashboard
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-3xl">
                Comprehensive monitoring of mental health reform across Africa. Track legislation, implementation, and investment priorities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Legend */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-white font-semibold mb-2">📋 Law Status</p>
              <div className="space-y-1 text-slate-300">
                <p>✅ Modern (Post-2010, rights-based)</p>
                <p>⚠️ Outdated (Colonial / pre-2000)</p>
                <p>❌ None / No functional law</p>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">📊 Implementation Level</p>
              <div className="space-y-1 text-slate-300">
                <p>🟢 Moderate</p>
                <p>🟡 Weak / Fragmented</p>
                <p>🔴 Minimal / Non-existent</p>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">💰 Budget Allocation</p>
              <div className="space-y-1 text-slate-300">
                <p>🟢 High: &gt;2% health budget</p>
                <p>🟡 Medium: 1–2%</p>
                <p>🔴 Low: &lt;1%</p>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">🔥 Advocacy Priority</p>
              <div className="space-y-1 text-slate-300">
                <p>🔥 High (Urgent intervention)</p>
                <p>⚡ Medium (Strengthening needed)</p>
                <p>🌱 Low (Optimization stage)</p>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">📊 Tracker Icons</p>
              <div className="space-y-1 text-slate-300">
                <p>🩺 Care Systems</p>
                <p>💰 Financing</p>
                <p>🏠 Community</p>
                <p>🚨 Crisis Response</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Total Countries</p>
            <p className="text-2xl font-bold text-white">{stats.totalCountries}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">High Priority</p>
            <p className="text-2xl font-bold text-red-400">{stats.highPriority}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs">Medium Priority</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.mediumPriority}</p>
          </div>
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
            <p className="text-green-400 text-xs">Low Priority</p>
            <p className="text-2xl font-bold text-green-400">{stats.lowPriority}</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-purple-400 text-xs">Avg Reform Score</p>
            <p className="text-2xl font-bold text-purple-400">{stats.avgReformScore}%</p>
          </div>
          <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-400 text-xs">Modern Laws</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.modernLaw}</p>
          </div>
        </div>

        {/* Tracker Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-pink-500/10 rounded-xl p-3 border border-pink-500/20 text-center">
            <Stethoscope className="w-5 h-5 text-pink-400 mx-auto mb-1" />
            <p className="text-pink-400 text-xs">Care Systems</p>
            <p className="text-white font-bold text-lg">
              {Object.values(trackerMetrics).filter(m => m.care_systems).length}
            </p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
            <Wallet className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-emerald-400 text-xs">Financing</p>
            <p className="text-white font-bold text-lg">
              {Object.values(trackerMetrics).filter(m => m.financing).length}
            </p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20 text-center">
            <Home className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-blue-400 text-xs">Community</p>
            <p className="text-white font-bold text-lg">
              {Object.values(trackerMetrics).filter(m => m.community).length}
            </p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 text-center">
            <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-red-400 text-xs">Crisis Response</p>
            <p className="text-white font-bold text-lg">
              {Object.values(trackerMetrics).filter(m => m.crisis).length}
            </p>
          </div>
        </div>

        {/* Tier Summary */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          <div className="bg-red-500/10 rounded-lg p-2 text-center border border-red-500/20">
            <p className="text-red-400 font-bold text-lg">Tier 1</p>
            <p className="text-white text-xs">{stats.tier1Count} countries</p>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-2 text-center border border-orange-500/20">
            <p className="text-orange-400 font-bold text-lg">Tier 2</p>
            <p className="text-white text-xs">{stats.tier2Count} countries</p>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-2 text-center border border-yellow-500/20">
            <p className="text-yellow-400 font-bold text-lg">Tier 3</p>
            <p className="text-white text-xs">{stats.tier3Count} countries</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-2 text-center border border-green-500/20">
            <p className="text-green-400 font-bold text-lg">Tier 4</p>
            <p className="text-white text-xs">{stats.tier4Count} countries</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-2 text-center border border-blue-500/20">
            <p className="text-blue-400 font-bold text-lg">Tier 5</p>
            <p className="text-white text-xs">{stats.tier5Count} countries</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Tiers</option>
              <option value="1">Tier 1 - System Failure</option>
              <option value="2">Tier 2 - Law Exists</option>
              <option value="3">Tier 3 - Outdated Laws</option>
              <option value="4">Tier 4 - Moderate Systems</option>
              <option value="5">Tier 5 - Small States</option>
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Regions</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Priorities</option>
              <option value="High">🔥 High Priority</option>
              <option value="Medium">⚡ Medium Priority</option>
              <option value="Low">🌱 Low Priority</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="tier">Sort by Tier</option>
              <option value="reform_score">Sort by Score</option>
              <option value="country">Sort by Name</option>
            </select>

            <div className="flex bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "grid" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "table" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Table
              </button>
            </div>

            <button
              onClick={fetchTrackerMetrics}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Trackers
            </button>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((country) => {
              const metrics = trackerMetrics[country.country];
              return (
                <div
                  key={country.country}
                  className={`bg-slate-800/50 rounded-2xl border p-5 transition-all cursor-pointer hover:border-cyan-500/30 ${
                    getTierColor(country.tier)
                  }`}
                  onClick={() => handleCountryClick(country)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">{country.country}</h3>
                      <p className="text-slate-400 text-sm">{country.region}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${getTierColor(country.tier)}`}>
                        Tier {country.tier}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        {getPriorityIcon(country.priority_level)}
                        <span className="text-xs text-slate-400">{country.priority_level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl">{country.law_icon}</p>
                      <p className="text-slate-400 text-xs">Law</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl">{country.implementation_icon}</p>
                      <p className="text-slate-400 text-xs">Implementation</p>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <p className="text-xl font-bold text-cyan-400">{country.reform_score}%</p>
                      <p className="text-slate-400 text-xs">Score</p>
                    </div>
                  </div>

                  {renderTrackerBadges(country.country)}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Country</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Tier</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Law</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Implementation</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Budget</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Priority</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Score</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Trackers</th>
                    <th className="text-left p-3 text-slate-400 text-xs font-medium">Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((country) => {
                    const metrics = trackerMetrics[country.country];
                    const trackerTypes = [];
                    if (metrics?.care_systems) trackerTypes.push("🩺");
                    if (metrics?.financing) trackerTypes.push("💰");
                    if (metrics?.community) trackerTypes.push("🏠");
                    if (metrics?.crisis) trackerTypes.push("🚨");

                    return (
                      <tr key={country.country} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 font-medium text-white">{country.country}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getTierColor(country.tier)}`}>
                            Tier {country.tier}
                          </span>
                        </td>
                        <td className="p-3 text-2xl">{country.law_icon}</td>
                        <td className="p-3 text-2xl">{country.implementation_icon}</td>
                        <td className="p-3 text-sm text-white">{country.budget_allocation}</td>
                        <td className="p-3">{getPriorityIcon(country.priority_level)}</td>
                        <td className="p-3">
                          <span className="text-cyan-400 font-bold">{country.reform_score}%</span>
                        </td>
                        <td className="p-3">
                          {trackerTypes.length > 0 ? (
                            <span className="text-lg">{trackerTypes.join(" ")}</span>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300 text-sm max-w-xs">{country.strategy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredData.length === 0 && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No countries match your filters</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Key Insights */}
        <div className="mt-8 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-2xl border border-cyan-500/30 p-6">
          <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Continental Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-white font-bold">{stats.tier1Count + stats.tier2Count + stats.tier3Count}</span>
              </div>
              <p className="text-slate-400 text-sm">Countries requiring urgent intervention</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-bold">{stats.modernLaw}</span>
              </div>
              <p className="text-slate-400 text-sm">Countries with modern, rights-based legislation</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-bold">{stats.avgReformScore}%</span>
              </div>
              <p className="text-slate-400 text-sm">Continental average reform score</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-white font-bold">{stats.countriesWithTrackerData}</span>
              </div>
              <p className="text-slate-400 text-sm">Countries with active tracker data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Country Detail Modal - Rendered at root level */}
      {showCountryModal && selectedCountry && (
        <CountryDetailModal
          country={selectedCountry}
          metrics={trackerMetrics[selectedCountry.country] || null}
          onClose={() => {
            setShowCountryModal(false);
            setSelectedCountry(null);
          }}
          isOpen={showCountryModal}
        />
      )}
    </div>
  );
}