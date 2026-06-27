// app/api/surveys/daily-report/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateSurveyStats } from "@/lib/survey-analytics";

export async function GET() {
  try {
    // Get all active surveys from the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: surveys } = await supabase
      .from("surveys")
      .select("*")
      .eq("status", "published")
      .gte("created_at", yesterday.toISOString());

    const reports = [];
    
    for (const survey of surveys || []) {
      const { data: responses } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("survey_id", survey.id);

      const stats = calculateSurveyStats(responses || [], survey.questions || []);
      
      reports.push({
        surveyTitle: survey.title,
        totalResponses: stats.totalResponses,
        completionRate: stats.completionRate,
        topQuestions: Object.entries(stats.questionStats)
          .sort((a: any, b: any) => b[1].responseCount - a[1].responseCount)
          .slice(0, 5)
          .map(([id, stat]: [string, any]) => ({
            question: stat.questionLabel || id,
            responses: stat.responseCount,
          })),
      });
    }

    // Here you would send an email with the reports
    // For now, just return the data
    return NextResponse.json({
      success: true,
      reports,
      totalSurveys: surveys?.length || 0,
    });
  } catch (error) {
    console.error("Error generating daily report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    );
  }
}