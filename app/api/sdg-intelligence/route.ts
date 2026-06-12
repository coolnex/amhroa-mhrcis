// app/api/sdg-intelligence/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const year = searchParams.get("year");

    let query = supabase
      .from("countries")
      .select(`
        id,
        country_name,
        region,
        sdg_score,
        sdg_3_4_score,
        sdg_10_2_score,
        sdg_16_3_score,
        reform_score,
        population,
        last_updated
      `)
      .order("sdg_score", { ascending: false });

    // Apply filters
    if (region && region !== "all") {
      query = query.eq("region", region);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch SDG intelligence",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Calculate SDG metrics
    const metrics = {
      total_countries: data?.length || 0,
      average_sdg_score: Math.round(data?.reduce((sum, c) => sum + (c.sdg_score || 0), 0) / (data?.length || 1)),
      average_sdg_3_4: Math.round(data?.reduce((sum, c) => sum + (c.sdg_3_4_score || 0), 0) / (data?.length || 1)),
      average_sdg_10_2: Math.round(data?.reduce((sum, c) => sum + (c.sdg_10_2_score || 0), 0) / (data?.length || 1)),
      average_sdg_16_3: Math.round(data?.reduce((sum, c) => sum + (c.sdg_16_3_score || 0), 0) / (data?.length || 1)),
      high_performers: data?.filter(c => (c.sdg_score || 0) >= 70).length || 0,
      low_performers: data?.filter(c => (c.sdg_score || 0) < 40).length || 0,
    };

    // Group by region
    const byRegion = data?.reduce((acc, country) => {
      const regionName = country.region || "Unknown";
      if (!acc[regionName]) {
        acc[regionName] = {
          region: regionName,
          countries: [],
          average_sdg_score: 0,
        };
      }
      acc[regionName].countries.push(country);
      acc[regionName].average_sdg_score = Math.round(
        acc[regionName].countries.reduce((sum: any, c: { sdg_score: any; }) => sum + (c.sdg_score || 0), 0) / 
        acc[regionName].countries.length
      );
      return acc;
    }, {} as Record<string, any>);

    // Get top performers
    const topPerformers = data?.slice(0, 10).map((country, index) => ({
      rank: index + 1,
      country_name: country.country_name,
      sdg_score: country.sdg_score,
      sdg_3_4_score: country.sdg_3_4_score,
      sdg_10_2_score: country.sdg_10_2_score,
      sdg_16_3_score: country.sdg_16_3_score,
    }));

    // Get bottom performers
    const bottomPerformers = data?.slice(-10).reverse().map((country, index) => ({
      rank: data.length - 9 + index,
      country_name: country.country_name,
      sdg_score: country.sdg_score,
      sdg_3_4_score: country.sdg_3_4_score,
      sdg_10_2_score: country.sdg_10_2_score,
      sdg_16_3_score: country.sdg_16_3_score,
    }));

    return NextResponse.json({
      success: true,
      countries: data,
      metrics,
      by_region: Object.values(byRegion || {}),
      top_performers: topPerformers,
      bottom_performers: bottomPerformers,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch SDG intelligence",
      },
      { status: 500 }
    );
  }
}

// POST endpoint to update SDG scores for a country
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      country_id,
      sdg_score,
      sdg_3_4_score,
      sdg_10_2_score,
      sdg_16_3_score,
    } = body;

    if (!country_id) {
      return NextResponse.json(
        { success: false, message: "Country ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };
    
    if (sdg_score !== undefined) updateData.sdg_score = sdg_score;
    if (sdg_3_4_score !== undefined) updateData.sdg_3_4_score = sdg_3_4_score;
    if (sdg_10_2_score !== undefined) updateData.sdg_10_2_score = sdg_10_2_score;
    if (sdg_16_3_score !== undefined) updateData.sdg_16_3_score = sdg_16_3_score;

    const { data, error } = await supabase
      .from("countries")
      .update(updateData)
      .eq("id", country_id)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update SDG scores" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "SDG scores updated successfully",
      country: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update SDG scores" },
      { status: 500 }
    );
  }
}