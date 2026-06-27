// app/api/health/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Test database connection
    const start = Date.now();
    const { error } = await supabase.from("users").select("count", { count: "exact", head: true });
    const databaseLatency = Date.now() - start;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: error ? "unhealthy" : "healthy",
      databaseLatency,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", error: "Service unavailable" },
      { status: 503 }
    );
  }
}