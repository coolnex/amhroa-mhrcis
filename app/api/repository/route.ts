import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {

  try {

    const { searchParams } =
      new URL(req.url);

    const country =
      searchParams.get("country");

    const category =
      searchParams.get("category");

    const year =
      searchParams.get("year");

    const author =
      searchParams.get("author");

    let query =
      "SELECT * FROM repository_resources WHERE 1=1";

    const values: any[] = [];

    // COUNTRY FILTER
    if (country) {
      query += " AND country = ?";
      values.push(country);
    }

    // CATEGORY FILTER
    if (category) {
      query += " AND category = ?";
      values.push(category);
    }

    // YEAR FILTER
    if (year) {
      query +=
        " AND publication_year = ?";
      values.push(year);
    }

    // AUTHOR FILTER
    if (author) {
      query += " AND author LIKE ?";
      values.push(`%${author}%`);
    }

    query += " ORDER BY id DESC";

    const [rows] =
      await pool.query(query, values);

    return NextResponse.json({
      success: true,
      resources: rows,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch resources",
      },
      { status: 500 }
    );

  }
}