// app/api/heatmap/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Fetch data from countries table
    const { data: countriesData, error: countriesError } = await supabase
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
        financing_score,
        implementation_score,
        law_status,
        implementation_status,
        priority_level,
        budget_level,
        funding_gap_level,
        investment_priority,
        donor_readiness_score,
        population,
        psychiatrists_per_100k,
        sdg_3_4_score,
        sdg_10_2_score,
        sdg_16_3_score,
        last_updated
      `)
      .order("country_name", { ascending: true });

    if (countriesError) {
      console.error("Countries table error:", countriesError);
      // Don't return yet, try the mental_health_reforms table
    }

    // 2. Fetch data from mental_health_reforms table
    const { data: reformsData, error: reformsError } = await supabase
      .from("mental_health_reforms")
      .select(`
        id,
        country_name,
        reform_tier,
        law_status,
        implementation_status,
        budget_level,
        priority_level,
        strategy,
        reform_score,
        implementation_score,
        sdg3_score,
        sdg10_score,
        sdg16_score,
        agenda2063_score,
        funding_gap_level,
        investment_priority,
        estimated_investment_need,
        donor_readiness_score,
        created_at
      `)
      .order("country_name", { ascending: true });

    if (reformsError) {
      console.error("Mental health reforms table error:", reformsError);
    }

    // 3. Merge data from both tables
    const mergedData = mergeCountryData(countriesData || [], reformsData || []);

    // 4. Calculate additional metrics for the heatmap
    const metrics = calculateMetrics(mergedData);

    // 5. Get continental statistics
    const continentalStats = getContinentalStats(mergedData);

    return NextResponse.json({
      success: true,
      countries: mergedData,
      metrics,
      continental_stats: continentalStats,
      data_sources: {
        countries_table: countriesData?.length || 0,
        reforms_table: reformsData?.length || 0,
        merged_total: mergedData.length,
      },
    });
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch heatmap data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to merge data from both tables
function mergeCountryData(countriesData: any[], reformsData: any[]) {
  // Create a map of country data from reforms table
  const reformsMap = new Map();
  reformsData.forEach(reform => {
    reformsMap.set(reform.country_name, reform);
  });

  // Merge data, prioritizing countries table data but filling gaps from reforms
  const merged = countriesData.map(country => {
    const reform = reformsMap.get(country.country_name);
    
    return {
      ...country,
      // Use reform data if country data is missing or null
      reform_tier: country.reform_tier || reform?.reform_tier || null,
      law_status: country.law_status || reform?.law_status || null,
      implementation_status: country.implementation_status || reform?.implementation_status || null,
      budget_level: country.budget_level || reform?.budget_level || null,
      priority_level: country.priority_level || reform?.priority_level || null,
      reform_score: country.reform_score || reform?.reform_score || 0,
      implementation_score: country.implementation_score || reform?.implementation_score || 0,
      funding_gap_level: country.funding_gap_level || reform?.funding_gap_level || null,
      investment_priority: country.investment_priority || reform?.investment_priority || null,
      donor_readiness_score: country.donor_readiness_score || reform?.donor_readiness_score || 0,
      // Additional fields from reforms
      strategy: reform?.strategy || null,
      sdg3_score: country.sdg_3_4_score || reform?.sdg3_score || 0,
      sdg10_score: country.sdg_10_2_score || reform?.sdg10_score || 0,
      sdg16_score: country.sdg_16_3_score || reform?.sdg16_score || 0,
      agenda2063_score: reform?.agenda2063_score || 0,
      estimated_investment_need: reform?.estimated_investment_need || 0,
      // Calculated fields
      sdg_score: country.sdg_score || Math.round(
        ((country.sdg_3_4_score || reform?.sdg3_score || 0) + 
         (country.sdg_10_2_score || reform?.sdg10_score || 0) + 
         (country.sdg_16_3_score || reform?.sdg16_score || 0)) / 3
      ),
      data_source: {
        countries_table: !!country,
        reforms_table: !!reform,
      },
    };
  });

  // Add countries that are only in reforms table
  const countryNames = new Set(merged.map(c => c.country_name));
  reformsData.forEach(reform => {
    if (!countryNames.has(reform.country_name)) {
      merged.push({
        id: `reform_${reform.id}`,
        country_name: reform.country_name,
        reform_tier: reform.reform_tier,
        law_status: reform.law_status,
        implementation_status: reform.implementation_status,
        budget_level: reform.budget_level,
        priority_level: reform.priority_level,
        strategy: reform.strategy,
        reform_score: reform.reform_score || 0,
        implementation_score: reform.implementation_score || 0,
        sdg_score: Math.round((reform.sdg3_score + reform.sdg10_score + reform.sdg16_score) / 3) || 0,
        legislation_score: reform.sdg16_score || 0,
        workforce_score: reform.implementation_score || 0,
        financing_score: reform.donor_readiness_score || 0,
        funding_gap_level: reform.funding_gap_level,
        investment_priority: reform.investment_priority,
        donor_readiness_score: reform.donor_readiness_score || 0,
        sdg3_score: reform.sdg3_score || 0,
        sdg10_score: reform.sdg10_score || 0,
        sdg16_score: reform.sdg16_score || 0,
        agenda2063_score: reform.agenda2063_score || 0,
        estimated_investment_need: reform.estimated_investment_need || 0,
        data_source: {
          countries_table: false,
          reforms_table: true,
        },
      });
    }
  });

  return merged.sort((a, b) => a.country_name.localeCompare(b.country_name));
}

// Helper function to calculate metrics
function calculateMetrics(data: any[]) {
  const validScores = data.filter(c => c.reform_score > 0);
  
  return {
    total_countries: data.length,
    average_reform_score: validScores.length > 0 
      ? Math.round(validScores.reduce((sum, c) => sum + c.reform_score, 0) / validScores.length)
      : 0,
    average_implementation_score: validScores.length > 0
      ? Math.round(validScores.reduce((sum, c) => sum + (c.implementation_score || 0), 0) / validScores.length)
      : 0,
    highest_score: Math.max(...(validScores.map(c => c.reform_score) || [0])),
    lowest_score: Math.min(...(validScores.map(c => c.reform_score) || [0])),
    countries_with_data: validScores.length,
    countries_missing_data: data.length - validScores.length,
  };
}

// Helper function to get continental statistics
function getContinentalStats(data: any[]) {
  const validData = data.filter(c => c.reform_score > 0);
  
  const tiers = {
    tier_1: validData.filter(c => c.reform_score < 30).length,
    tier_2: validData.filter(c => c.reform_score >= 30 && c.reform_score < 50).length,
    tier_3: validData.filter(c => c.reform_score >= 50 && c.reform_score < 70).length,
    tier_4: validData.filter(c => c.reform_score >= 70 && c.reform_score < 85).length,
    tier_5: validData.filter(c => c.reform_score >= 85).length,
  };

  const priorityLevels = {
    crisis: validData.filter(c => c.priority_level?.toLowerCase() === 'crisis' || c.priority_level === '🔥').length,
    high: validData.filter(c => c.priority_level?.toLowerCase() === 'high' || c.priority_level === '⚡').length,
    model: validData.filter(c => c.priority_level?.toLowerCase() === 'model' || c.priority_level === '🌱').length,
  };

  return {
    total_countries: validData.length,
    average_reform_score: validData.length > 0 
      ? Math.round(validData.reduce((sum, c) => sum + c.reform_score, 0) / validData.length)
      : 0,
    reform_tiers: tiers,
    priority_levels: priorityLevels,
    top_performer: validData.sort((a, b) => b.reform_score - a.reform_score)[0]?.country_name || 'N/A',
    top_score: Math.max(...(validData.map(c => c.reform_score) || [0])),
  };
}

// Optional: POST to update heatmap data for a specific country
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      country_name, 
      reform_score, 
      sdg_score, 
      legislation_score, 
      workforce_score, 
      financing_score,
      implementation_score,
      law_status,
      implementation_status,
      priority_level,
      budget_level,
      funding_gap_level,
      investment_priority,
      donor_readiness_score,
    } = body;

    if (!country_name) {
      return NextResponse.json(
        { success: false, message: "Country name is required" },
        { status: 400 }
      );
    }

    // First, try to update in countries table
    const { data: countriesData, error: countriesError } = await supabase
      .from("countries")
      .update({
        reform_score: reform_score,
        sdg_score: sdg_score,
        legislation_score: legislation_score,
        workforce_score: workforce_score,
        financing_score: financing_score,
        implementation_score: implementation_score,
        law_status: law_status,
        implementation_status: implementation_status,
        priority_level: priority_level,
        budget_level: budget_level,
        funding_gap_level: funding_gap_level,
        investment_priority: investment_priority,
        donor_readiness_score: donor_readiness_score,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("country_name", country_name)
      .select();

    if (countriesError) {
      console.error("Error updating countries table:", countriesError);
    }

    // Also update the mental_health_reforms table
    const { data: reformsData, error: reformsError } = await supabase
      .from("mental_health_reforms")
      .update({
        reform_score: reform_score,
        implementation_score: implementation_score,
        law_status: law_status,
        implementation_status: implementation_status,
        priority_level: priority_level,
        budget_level: budget_level,
        funding_gap_level: funding_gap_level,
        investment_priority: investment_priority,
        donor_readiness_score: donor_readiness_score,
        sdg3_score: sdg_score,
        sdg10_score: Math.round(sdg_score * 0.9),
        sdg16_score: legislation_score,
        updated_at: new Date().toISOString(),
      })
      .eq("country_name", country_name)
      .select();

    if (reformsError) {
      console.error("Error updating mental_health_reforms table:", reformsError);
    }

    // If both updates failed, return error
    if (countriesError && reformsError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to update data in both tables",
          errors: { countries: countriesError.message, reforms: reformsError.message }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Heatmap data updated successfully",
      updated: {
        countries_table: !!countriesData,
        reforms_table: !!reformsData,
      },
    });
  } catch (error) {
    console.error("Error updating heatmap data:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update heatmap data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: GET a single country's detailed heatmap data
export async function GET_COUNTRY(req: Request) {
  try {
    const url = new URL(req.url);
    const countryName = url.searchParams.get("country");

    if (!countryName) {
      return NextResponse.json(
        { success: false, message: "Country name is required" },
        { status: 400 }
      );
    }

    // Fetch from both tables
    const [countriesResult, reformsResult] = await Promise.all([
      supabase
        .from("countries")
        .select("*")
        .eq("country_name", countryName)
        .single(),
      supabase
        .from("mental_health_reforms")
        .select("*")
        .eq("country_name", countryName)
        .single(),
    ]);

    // Merge the data
    const mergedData = {
      ...(countriesResult.data || {}),
      ...(reformsResult.data || {}),
      data_sources: {
        countries_table: !!countriesResult.data,
        reforms_table: !!reformsResult.data,
      },
    };

    return NextResponse.json({
      success: true,
      country: mergedData,
    });
  } catch (error) {
    console.error("Error fetching country data:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch country data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}