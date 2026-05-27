import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  req: Request,
  context: any
) {
  try {
    const country =
      context.params.country;

    const [rows]: any = await pool.query(
      "SELECT * FROM countries WHERE country_slug = ?",
      [country]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Country not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      country: rows[0],
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch country",
      },
      { status: 500 }
    );
  }
}