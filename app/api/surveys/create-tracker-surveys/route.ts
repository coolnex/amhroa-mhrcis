// app/api/surveys/create-tracker-surveys/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TRACKER_SURVEY_TEMPLATES, createTrackerSurvey } from '@/lib/survey_templates/tracker-templates';

export async function POST(request: Request) {
  try {
    const { country } = await request.json();
    
    // Get all countries or specific country
    const { data: countries } = await supabase
      .from('countries')
      .select('country_name')
      .eq('status', 'Active');

    const results = [];
    
    for (const country of countries || []) {
      // Create surveys for each tracker type
      for (const [key, template] of Object.entries(TRACKER_SURVEY_TEMPLATES)) {
        try {
          const survey = await createTrackerSurvey(supabase, template, country.country_name);
          results.push({ 
            country: country.country_name, 
            tracker: key, 
            surveyId: survey.id,
            status: 'created' 
          });
        } catch (error) {
          results.push({ 
            country: country.country_name, 
            tracker: key, 
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'failed' 
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      message: `Created ${results.filter(r => r.status === 'created').length} surveys` 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}