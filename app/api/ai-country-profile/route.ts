import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {

  try {

    const { searchParams } =
      new URL(req.url);

    const countryId =
      searchParams.get("countryId");

    if (!countryId) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Country ID required",
        },
        { status: 400 }
      );

    }

    const [rows]: any =
      await pool.query(
        `
        SELECT *
        FROM countries
        WHERE id = ?
        `,
        [countryId]
      );

    if (!rows.length) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Country not found",
        },
        { status: 404 }
      );

    }

    const country = rows[0];

    /*
      AI INTELLIGENCE ENGINE
    */

    let reformLevel = "";
    let riskLevel = "";
    let recommendations: string[] = [];

    // REFORM LEVEL
    if (country.reform_score >= 80) {

      reformLevel =
        "High Reform Progress";

    } else if (
      country.reform_score >= 50
    ) {

      reformLevel =
        "Moderate Reform Progress";

    } else {

      reformLevel =
        "Low Reform Progress";

    }

    // RISK LEVEL
    if (country.reform_score >= 75) {

      riskLevel =
        "Low Governance Risk";

    } else if (
      country.reform_score >= 50
    ) {

      riskLevel =
        "Moderate Governance Risk";

    } else {

      riskLevel =
        "High Governance Risk";

    }

    // RECOMMENDATIONS
    if (
      country.financing_score < 15
    ) {

      recommendations.push(
        "Increase domestic mental health financing mechanisms."
      );

    }

    if (
      country.sdg_score < 15
    ) {

      recommendations.push(
        "Strengthen SDG alignment and integration."
      );

    }

    if (
      country.workforce_score < 15
    ) {

      recommendations.push(
        "Expand community mental health workforce training."
      );

    }

    if (
      country.legislation_score < 15
    ) {

      recommendations.push(
        "Modernize national mental health legislation."
      );

    }

    if (
      country.suicide_decriminalization_score < 15
    ) {

      recommendations.push(
        "Accelerate suicide decriminalization reforms."
      );

    }

    // AI SUMMARY
    const summary = `
${country.country_name} demonstrates ${reformLevel.toLowerCase()}
with a reform score of ${country.reform_score}%.

Current assessment indicates:
${riskLevel.toLowerCase()}.

Strategic priorities include:
${recommendations.join(" ")}
`;

    return NextResponse.json({
      success: true,

      country: {
        id: country.id,
        country_name:
          country.country_name,
        reform_score:
          country.reform_score,
      },

      intelligence: {
        reformLevel,
        riskLevel,
        recommendations,
        summary,
      },
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to generate AI profile",
      },
      { status: 500 }
    );

  }
}