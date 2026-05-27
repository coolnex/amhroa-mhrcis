import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      organization_name,
      country,
      organization_type,
      email,
      phone,
    } = body;

    await pool.query(
      `INSERT INTO organizations
      (organization_name, country, organization_type, email, phone)
      VALUES (?, ?, ?, ?, ?)`,
      [
        organization_name,
        country,
        organization_type,
        email,
        phone,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Organization registered successfully",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM organizations ORDER BY id DESC"
    );

    return NextResponse.json({
      success: true,
      organizations: rows,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organizations",
      },
      { status: 500 }
    );
  }
}