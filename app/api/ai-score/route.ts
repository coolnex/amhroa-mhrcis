// app/api/ai-score/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      countryId,
      legislation_score,
      suicide_decriminalization_score,
      workforce_score,
      sdg_score,
      financing_score,
    } = body;

    // Validate required fields
    if (!countryId) {
      return NextResponse.json(
        { success: false, message: "Country ID is required" },
        { status: 400 }
      );
    }

    // CALCULATE TOTAL SCORE
    const totalScore = Math.round(
      (legislation_score || 0) +
      (suicide_decriminalization_score || 0) +
      (workforce_score || 0) +
      (sdg_score || 0) +
      (financing_score || 0)
    ) / 5; // Average of all scores

    // UPDATE COUNTRY IN SUPABASE
    const { data, error } = await supabase
      .from("countries")
      .update({
        legislation_score: legislation_score || 0,
        suicide_decriminalization_score: suicide_decriminalization_score || 0,
        workforce_score: workforce_score || 0,
        sdg_score: sdg_score || 0,
        financing_score: financing_score || 0,
        reform_score: totalScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", countryId)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to update country score",
          error: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      totalScore,
      message: "AI reform score calculated successfully",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to calculate score",
      },
      { status: 500 }
    );
  }
}