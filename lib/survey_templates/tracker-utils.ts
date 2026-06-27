// lib/surveys/tracker-utils.ts
import { supabase } from '@/lib/supabase';

export const getTrackerSurveyIds = async (country: string) => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('id, metadata')
      .eq('status', 'Active')
      .contains('metadata', { 
        country: country, 
        type: 'tracker' 
      });

    if (error) throw error;

    const result = {
      care_systems: null as string | null,
      financing: null as string | null,
      community: null as string | null,
      crisis: null as string | null
    };

    data?.forEach(survey => {
      const templateId = survey.metadata?.template_id;
      if (templateId === 'care_systems_tracker') {
        result.care_systems = survey.id;
      } else if (templateId === 'financing_tracker') {
        result.financing = survey.id;
      } else if (templateId === 'community_tracker') {
        result.community = survey.id;
      } else if (templateId === 'crisis_tracker') {
        result.crisis = survey.id;
      }
    });

    return result;
  } catch (error) {
    console.error('Error getting tracker survey IDs:', error);
    return null;
  }
};