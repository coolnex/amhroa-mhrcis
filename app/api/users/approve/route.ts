import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId } = body;

    await pool.query(
      "UPDATE users SET status = 'Approved' WHERE id = ?",
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: "User approved",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Approval failed",
      },
      { status: 500 }
    );
  }
}