// hooks/useTrackerSurveys.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TRACKER_SURVEY_TEMPLATES, createTrackerSurvey } from '@/lib/survey_templates/tracker-templates';

export const useTrackerSurveys = (country: string) => {
  const [surveyIds, setSurveyIds] = useState<Record<string, string | null>>({
    care_systems: null,
    financing: null,
    community: null,
    crisis: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (country) {
      fetchTrackerSurveyIds();
    }
  }, [country]);

  const fetchTrackerSurveyIds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const trackerTemplates = {
        care_systems: 'care_systems_tracker',
        financing: 'financing_tracker',
        community: 'community_tracker',
        crisis: 'crisis_tracker'
      };

      const { data, error } = await supabase
        .from('surveys')
        .select('id, metadata')
        .eq('status', 'Active')
        .contains('metadata', { country, type: 'tracker' });

      if (error) throw error;

      const surveyMap: Record<string, string> = {};
      data?.forEach(survey => {
        const templateId = survey.metadata?.template_id;
        if (templateId) {
          surveyMap[templateId] = survey.id;
        }
      });

      const newSurveyIds = {
        care_systems: surveyMap[trackerTemplates.care_systems] || null,
        financing: surveyMap[trackerTemplates.financing] || null,
        community: surveyMap[trackerTemplates.community] || null,
        crisis: surveyMap[trackerTemplates.crisis] || null
      };

      setSurveyIds(newSurveyIds);

      // Check for missing surveys
      const missingTemplates = [];
      if (!surveyMap[trackerTemplates.care_systems]) missingTemplates.push('care_systems_tracker');
      if (!surveyMap[trackerTemplates.financing]) missingTemplates.push('financing_tracker');
      if (!surveyMap[trackerTemplates.community]) missingTemplates.push('community_tracker');
      if (!surveyMap[trackerTemplates.crisis]) missingTemplates.push('crisis_tracker');

      if (missingTemplates.length > 0) {
        await createMissingTrackerSurveys(country, missingTemplates);
        // Re-fetch
        await fetchTrackerSurveyIds();
      }

    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching tracker survey IDs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMissingTrackerSurveys = async (country: string, missingTemplateIds: string[]) => {
    try {
      const templateMap: Record<string, any> = {
        'care_systems_tracker': TRACKER_SURVEY_TEMPLATES.CARE_SYSTEMS,
        'financing_tracker': TRACKER_SURVEY_TEMPLATES.FINANCING,
        'community_tracker': TRACKER_SURVEY_TEMPLATES.COMMUNITY,
        'crisis_tracker': TRACKER_SURVEY_TEMPLATES.CRISIS
      };

      for (const templateId of missingTemplateIds) {
        const template = templateMap[templateId];
        if (template) {
          await createTrackerSurvey(supabase, template, country);
        }
      }
    } catch (error) {
      console.error('Error creating missing surveys:', error);
    }
  };

  return { surveyIds, loading, error, refetch: fetchTrackerSurveyIds };
};