// app/api/donor-intelligence/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Define types for better type safety
type InvestmentPriority = "🔥 Urgent" | "⚡ High" | "📈 Medium" | "🌱 Low";
type FundingGapLevel = "Critical" | "High" | "Moderate" | "Low";
type RiskLevel = "High" | "Medium" | "Low";

interface DonorCountry {
  id: number;
  country_name: string;
  region: string;
  funding_gap_level: FundingGapLevel;
  funding_gap_score: number;
  investment_priority: InvestmentPriority;
  estimated_investment_need: number;
  donor_readiness_score: number;
  current_funding: number;
  population: number;
  reform_score: number;
  roi_potential: number;
  risk_level: RiskLevel;
  key_gaps: string[];
  recommended_donors: string[];
  last_updated: string;
}

// Helper function to map database values to frontend expected values
function mapPriority(priority: string | null): InvestmentPriority {
  if (!priority) return '📈 Medium';
  
  // If already has emoji, return as is
  if (priority.includes('🔥') || priority.includes('⚡') || priority.includes('📈') || priority.includes('🌱')) {
    return priority as InvestmentPriority;
  }
  
  const priorityMap: Record<string, InvestmentPriority> = {
    'Urgent': '🔥 Urgent',
    'High': '⚡ High',
    'Medium': '📈 Medium',
    'Low': '🌱 Low',
    'Critical': '🔥 Urgent',
    'Moderate': '📈 Medium',
  };
  return priorityMap[priority] || '📈 Medium';
}

function mapFundingGapLevel(level: string | null): FundingGapLevel {
  if (!level) return 'Moderate';
  
  const levelMap: Record<string, FundingGapLevel> = {
    'Critical': 'Critical',
    'critical': 'Critical',
    'High': 'High',
    'high': 'High',
    'Moderate': 'Moderate',
    'moderate': 'Moderate',
    'Low': 'Low',
    'low': 'Low',
  };
  return levelMap[level] || 'Moderate';
}

function mapRiskLevel(level: string | null): RiskLevel {
  if (!level) return 'Medium';
  
  const levelMap: Record<string, RiskLevel> = {
    'High': 'High',
    'high': 'High',
    'Medium': 'Medium',
    'medium': 'Medium',
    'Low': 'Low',
    'low': 'Low',
  };
  return levelMap[level] || 'Medium';
}

// Transform database record to match frontend interface
function transformCountryData(dbRecord: any): DonorCountry {
  // Ensure key_gaps is an array
  let keyGaps = dbRecord.key_gaps || [];
  if (typeof keyGaps === 'string') {
    try {
      keyGaps = JSON.parse(keyGaps);
    } catch {
      keyGaps = keyGaps.split(',').map((g: string) => g.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(keyGaps)) {
    keyGaps = [];
  }

  // Ensure recommended_donors is an array
  let recommendedDonors = dbRecord.recommended_donors || [];
  if (typeof recommendedDonors === 'string') {
    try {
      recommendedDonors = JSON.parse(recommendedDonors);
    } catch {
      recommendedDonors = recommendedDonors.split(',').map((d: string) => d.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(recommendedDonors)) {
    recommendedDonors = [];
  }

  return {
    id: dbRecord.id,
    country_name: dbRecord.country_name || 'Unknown',
    region: dbRecord.region || 'Unknown',
    funding_gap_level: mapFundingGapLevel(dbRecord.funding_gap_level),
    funding_gap_score: dbRecord.funding_gap_score || 0,
    investment_priority: mapPriority(dbRecord.investment_priority),
    estimated_investment_need: dbRecord.estimated_investment_need || 0,
    donor_readiness_score: dbRecord.donor_readiness_score || 0,
    current_funding: dbRecord.current_funding || 0,
    population: dbRecord.population || 0,
    reform_score: dbRecord.reform_score || 0,
    roi_potential: dbRecord.roi_potential || 0,
    risk_level: mapRiskLevel(dbRecord.risk_level),
    key_gaps: keyGaps,
    recommended_donors: recommendedDonors,
    last_updated: dbRecord.last_updated || new Date().toISOString().split('T')[0],
  };
}

export async function GET() {
  try {
    console.log("Fetching donor intelligence data...");

    // Test Supabase connection first
    const { data: testData, error: testError } = await supabase
      .from('countries')
      .select('count')
      .limit(1);

    if (testError) {
      console.error("Supabase connection error:", testError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Database connection failed",
          error: testError.message,
          countries: [],
        },
        { status: 503 }
      );
    }

    console.log("Supabase connection successful, fetching countries...");

    // Fetch country data
    const { data, error } = await supabase
      .from("countries")
      .select(`
        id,
        country_name,
        region,
        reform_score,
        reform_tier,
        population,
        funding_gap_level,
        funding_gap_score,
        investment_priority,
        estimated_investment_need,
        current_funding,
        donor_readiness_score,
        roi_potential,
        risk_level,
        key_gaps,
        recommended_donors,
        last_updated
      `)
      .order("estimated_investment_need", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch donor intelligence",
          error: error.message,
          countries: [],
        },
        { status: 500 }
      );
    }

    console.log(`Found ${data?.length || 0} countries`);

    // If no data, return empty array with fallback flag
    if (!data || data.length === 0) {
      console.log("No data found in database");
      return NextResponse.json({
        success: false,
        countries: [],
        metrics: {
          total_funding_gap: 0,
          average_donor_readiness: 0,
          high_priority_countries: 0,
          critical_funding_gap: 0,
          total_countries: 0,
        },
        message: "No data available in database",
      });
    }

    // Transform data to match frontend expectations
    const transformedCountries = data.map(transformCountryData);
    console.log(`Transformed ${transformedCountries.length} countries`);

    // Calculate metrics with proper null handling
    const totalFundingGap = data.reduce((sum, country) => {
      const need = country.estimated_investment_need || 0;
      const current = country.current_funding || 0;
      return sum + Math.max(0, need - current);
    }, 0);

    const totalReadiness = data.reduce((sum, country) => {
      return sum + (country.donor_readiness_score || 0);
    }, 0);
    
    const averageReadiness = data.length > 0 
      ? Math.round(totalReadiness / data.length) 
      : 0;

    const highPriorityCount = data.filter(c => {
      const priority = c.investment_priority || '';
      return priority === 'High' || priority === '⚡ High' || 
             priority === 'Urgent' || priority === '🔥 Urgent' ||
             priority === 'Critical';
    }).length;

    const criticalGapCount = data.filter(c => {
      const level = c.funding_gap_level || '';
      return level === 'Critical' || level === 'critical';
    }).length;

    return NextResponse.json({
      success: true,
      countries: transformedCountries,
      metrics: {
        total_funding_gap: totalFundingGap,
        average_donor_readiness: averageReadiness,
        high_priority_countries: highPriorityCount,
        critical_funding_gap: criticalGapCount,
        total_countries: data.length,
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
        countries: [],
      },
      { status: 500 }
    );
  }
}

// POST endpoint to update donor intelligence for a specific country
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      country_id,
      funding_gap_level,
      funding_gap_score,
      investment_priority,
      estimated_investment_need,
      current_funding,
      donor_readiness_score,
      roi_potential,
      risk_level,
      key_gaps,
      recommended_donors,
    } = body;

    if (!country_id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Country ID is required" 
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (funding_gap_level !== undefined) updateData.funding_gap_level = funding_gap_level;
    if (funding_gap_score !== undefined) {
      if (funding_gap_score < 0 || funding_gap_score > 100) {
        return NextResponse.json(
          { success: false, message: "Funding gap score must be between 0 and 100" },
          { status: 400 }
        );
      }
      updateData.funding_gap_score = funding_gap_score;
    }
    if (investment_priority !== undefined) {
      // Handle both formats (with and without emoji)
      const priorityMap: Record<string, string> = {
        '🔥 Urgent': 'Urgent',
        'Urgent': 'Urgent',
        '⚡ High': 'High',
        'High': 'High',
        '📈 Medium': 'Medium',
        'Medium': 'Medium',
        '🌱 Low': 'Low',
        'Low': 'Low',
      };
      updateData.investment_priority = priorityMap[investment_priority] || investment_priority;
    }
    if (estimated_investment_need !== undefined) updateData.estimated_investment_need = estimated_investment_need;
    if (current_funding !== undefined) updateData.current_funding = current_funding;
    if (donor_readiness_score !== undefined) {
      if (donor_readiness_score < 0 || donor_readiness_score > 100) {
        return NextResponse.json(
          { success: false, message: "Donor readiness score must be between 0 and 100" },
          { status: 400 }
        );
      }
      updateData.donor_readiness_score = donor_readiness_score;
    }
    if (roi_potential !== undefined) {
      if (roi_potential < 0 || roi_potential > 100) {
        return NextResponse.json(
          { success: false, message: "ROI potential must be between 0 and 100" },
          { status: 400 }
        );
      }
      updateData.roi_potential = roi_potential;
    }
    if (risk_level !== undefined) updateData.risk_level = risk_level;
    if (key_gaps !== undefined) updateData.key_gaps = key_gaps;
    if (recommended_donors !== undefined) updateData.recommended_donors = recommended_donors;

    // Check if country exists first
    const { data: existingCountry, error: checkError } = await supabase
      .from("countries")
      .select("id")
      .eq("id", country_id)
      .single();

    if (checkError || !existingCountry) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Country not found" 
        },
        { status: 404 }
      );
    }

    // Update the country
    const { data, error } = await supabase
      .from("countries")
      .update(updateData)
      .eq("id", country_id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to update donor intelligence",
          error: error.message 
        },
        { status: 500 }
      );
    }

    // Transform and return the updated data
    const transformedData = data.map(transformCountryData);

    return NextResponse.json({
      success: true,
      message: "Donor intelligence updated successfully",
      country: transformedData[0] || null,
    });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update donor intelligence",
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}