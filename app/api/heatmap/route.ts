// app/api/heatmap/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("countries")
      .select(`
        id,
        country_name,
        reform_score,
        reform_tier,
        region,
        sdg_score,
        legislation_score,
        workforce_score,
        financing_score
      `)
      .order("country_name", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch heatmap data",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Calculate additional metrics for the heatmap
    const metrics = {
      total_countries: data?.length || 0,
      average_reform_score: data?.reduce((sum, country) => sum + (country.reform_score || 0), 0) / (data?.length || 1),
      highest_score: Math.max(...(data?.map(c => c.reform_score) || [0])),
      lowest_score: Math.min(...(data?.map(c => c.reform_score) || [0])),
    };

    return NextResponse.json({
      success: true,
      countries: data,
      metrics,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch heatmap data",
      },
      { status: 500 }
    );
  }
}

// Optional: POST to update heatmap data for a specific country
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { country_id, reform_score, sdg_score, legislation_score, workforce_score, financing_score } = body;

    if (!country_id) {
      return NextResponse.json(
        { success: false, message: "Country ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("countries")
      .update({
        reform_score: reform_score,
        sdg_score: sdg_score,
        legislation_score: legislation_score,
        workforce_score: workforce_score,
        financing_score: financing_score,
        updated_at: new Date().toISOString(),
      })
      .eq("id", country_id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update country data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Heatmap data updated successfully",
      country: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update heatmap data" },
      { status: 500 }
    );
  }
}