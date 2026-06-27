// lib/reports/tracker-reports.ts
export const generateTrackerReport = async (supabase: any, country: string, trackerType: string) => {
    // Get latest survey response
    const { data: survey } = await supabase
      .from('surveys')
      .select('id, questions')
      .eq('metadata->>country', country)
      .eq('metadata->>template_id', trackerType)
      .single();
  
    if (!survey) return null;
  
    // Get latest response
    const { data: response } = await supabase
      .from('survey_responses')
      .select('responses, created_at')
      .eq('survey_id', survey.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
  
    if (!response) return null;
  
    // Generate insights based on template type
    const insights = generateInsights(trackerType, response.responses);
    
    return {
      country,
      trackerType,
      response: response.responses,
      insights,
      submittedAt: response.created_at
    };
  };
function generateInsights(trackerType: string, responses: any) {
    switch (trackerType) {
        case 'health_tracker':
            return responses.map((response: any) => ({
                question: response.question,
                answer: response.answer,
                isHealthy: response.answer === 'yes'
            }));
        case 'finance_tracker':
            return responses.map((response: any) => ({
                question: response.question,
                answer: response.answer,
                isPositive: parseFloat(response.answer) > 0
            }));
        case 'education_tracker':
            return responses.map((response: any) => ({
                question: response.question,
                answer: response.answer,
                isPassing: response.answer === 'pass'
            }));
        default:
            throw new Error(`Unsupported tracker type: ${trackerType}`);
    }
}

