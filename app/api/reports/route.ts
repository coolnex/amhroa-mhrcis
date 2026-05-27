import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM country_reports ORDER BY id DESC"
    );

    return NextResponse.json({
      success: true,
      reports: rows,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reports",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      country,
      submitted_by,
      report_type,
      title,
      description,
      file_url,
    } = body;

    await pool.query(
      `INSERT INTO country_reports
      (
        country,
        submitted_by,
        report_type,
        title,
        description,
        file_url
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        country,
        submitted_by,
        report_type,
        title,
        description,
        file_url,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit report",
      },
      { status: 500 }
    );
  }
}