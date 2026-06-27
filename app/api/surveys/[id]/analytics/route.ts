// app/api/surveys/[id]/analytics/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateSurveyStats } from "@/lib/survey-analytics";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch survey
    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", id)
      .single();

    if (surveyError) throw surveyError;

    // Fetch responses
    const { data: responses, error: responsesError } = await supabase
      .from("survey_responses")
      .select("*")
      .eq("survey_id", id);

    if (responsesError) throw responsesError;

    // Calculate stats using the library
    const stats = calculateSurveyStats(responses || [], survey.questions || []);

    return NextResponse.json({
      success: true,
      data: {
        survey: {
          id: survey.id,
          title: survey.title,
          description: survey.description,
        },
        stats,
        totalResponses: responses?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching survey analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}