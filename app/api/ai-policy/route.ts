import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {

  try {

    const [rows]: any =
      await pool.query(
        `
        SELECT *
        FROM mental_health_reforms
        `
      );

    const intelligence =
      rows.map(
        (country: any) => {

          let recommendations =
            [];

          /*
            LAW ANALYSIS
          */
          if (
            country.law_status ===
            "No Law"
          ) {

            recommendations.push(
              "Develop and adopt modern rights-based mental health legislation."
            );

          }

          /*
            IMPLEMENTATION
          */
          if (
            country.implementation_status ===
            "Critical"
          ) {

            recommendations.push(
              "Establish national implementation framework and emergency workforce development."
            );

          }

          if (
            country.implementation_status ===
            "Moderate"
          ) {

            recommendations.push(
              "Strengthen decentralization and community mental health services."
            );

          }

          /*
            SDG ANALYSIS
          */
          if (
            country.sdg3_score < 50
          ) {

            recommendations.push(
              "Increase SDG 3 investment in mental health integration and primary healthcare."
            );

          }

          /*
            GOVERNANCE
          */
          if (
            country.sdg16_score < 50
          ) {

            recommendations.push(
              "Strengthen governance, human rights protections, and accountability systems."
            );

          }

          /*
            PRIORITY
          */
          if (
            country.priority_level ===
            "High Priority"
          ) {

            recommendations.push(
              "Mobilize urgent donor, AU, and WHO engagement."
            );

          }

          return {

            ...country,

            ai_recommendations:
              recommendations,

          };

        }
      );

    return NextResponse.json({
      success: true,
      intelligence,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "AI intelligence generation failed",
      },
      { status: 500 }
    );

  }

}