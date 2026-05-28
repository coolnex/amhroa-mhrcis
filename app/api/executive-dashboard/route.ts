import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {

  try {

    /*
      COUNTRIES
    */
    const [countries]: any =
      await pool.query(
        `
        SELECT *
        FROM mental_health_reforms
        `
      );

    /*
      REPORTS
    */
      const reports: any[] = [];

    /*
      CALCULATIONS
    */

    const totalCountries =
      countries.length;

    const avgReformScore =
      Math.round(

        countries.reduce(
          (
            acc: number,
            country: any
          ) =>
            acc +
            country.reform_score,
          0
        ) / totalCountries

      );

    const highPriority =
      countries.filter(
        (
          country: any
        ) =>
          country.priority_level ===
          "High Priority"
      ).length;

    const avgSDG3 =
      Math.round(

        countries.reduce(
          (
            acc: number,
            country: any
          ) =>
            acc +
            country.sdg3_score,
          0
        ) / totalCountries

      );

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

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load executive intelligence",
      },
      { status: 500 }
    );

  }

}