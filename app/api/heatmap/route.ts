import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {

  try {

    const [rows] = await pool.query(
      `
      SELECT
        id,
        country_name,
        reform_score
      FROM countries
      `
    );

    return NextResponse.json({
      success: true,
      countries: rows,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch heatmap data",
      },
      { status: 500 }
    );

  }
}