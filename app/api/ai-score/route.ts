import { NextResponse } from "next/server";
import pool from "@/lib/db";

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

    // CALCULATE TOTAL SCORE
    const totalScore =
      legislation_score +
      suicide_decriminalization_score +
      workforce_score +
      sdg_score +
      financing_score;

    // UPDATE COUNTRY
    await pool.query(
      `
      UPDATE countries
      SET
      legislation_score = ?,
      suicide_decriminalization_score = ?,
      workforce_score = ?,
      sdg_score = ?,
      financing_score = ?,
      reform_score = ?
      WHERE id = ?
      `,
      [
        legislation_score,
        suicide_decriminalization_score,
        workforce_score,
        sdg_score,
        financing_score,
        totalScore,
        countryId,
      ]
    );

    return NextResponse.json({
      success: true,
      totalScore,
      message:
        "AI reform score calculated successfully",
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to calculate score",
      },
      { status: 500 }
    );

  }
}