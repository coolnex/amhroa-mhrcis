import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: countries, error } = await supabase
      .from("mental_health_reforms")
      .select("*");

    if (error) {
      throw error;
    }

    const reports: any[] = [];

    const totalCountries = countries.length;

    const avgReformScore =
      totalCountries > 0
        ? Math.round(
            countries.reduce(
              (acc, country) =>
                acc + (country.reform_score || 0),
              0
            ) / totalCountries
          )
        : 0;

    const highPriority =
      countries.filter(
        (country) =>
          country.priority_level ===
          "High Priority"
      ).length;

    const avgSDG3 =
      totalCountries > 0
        ? Math.round(
            countries.reduce(
              (acc, country) =>
                acc + (country.sdg3_score || 0),
              0
            ) / totalCountries
          )
        : 0;

    return NextResponse.json({
      success: true,

      metrics: {
        totalCountries,
        avgReformScore,
        highPriority,
        avgSDG3,
      },

      countries,
      reports,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load executive intelligence",
      },
      {
        status: 500,
      }
    );
  }
}