import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM coordinators ORDER BY id DESC"
    );

    return NextResponse.json({
      success: true,
      coordinators: rows,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch coordinators",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      full_name,
      email,
      phone,
      country,
      region,
      organization,
      assigned_by,
    } = body;

    await pool.query(
      `INSERT INTO coordinators
      (
        full_name,
        email,
        phone,
        country,
        region,
        organization,
        assigned_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        phone,
        country,
        region,
        organization,
        assigned_by,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Coordinator added successfully",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add coordinator",
      },
      { status: 500 }
    );
  }
}