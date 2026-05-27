import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(
  req: Request,
  context: any
) {
  try {
    const reportId =
      context.params.id;

    const body = await req.json();

    const {
      status,
      reviewed_by,
      admin_notes,
    } = body;

    await pool.query(
      `UPDATE country_reports
       SET
       status = ?,
       reviewed_by = ?,
       reviewed_at = NOW(),
       admin_notes = ?
       WHERE id = ?`,
      [
        status,
        reviewed_by,
        admin_notes,
        reportId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Report updated successfully",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update report",
      },
      { status: 500 }
    );
  }
}