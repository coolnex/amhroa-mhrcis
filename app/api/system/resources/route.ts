// app/api/system/resources/route.ts
import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  // Note: This is approximate and works on Vercel/Node.js environment
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
  
  // CPU load average (1, 5, 15 minutes)
  const loadAvg = os.loadavg();
  const cpuUsage = Math.min(100, (loadAvg[0] / os.cpus().length) * 100);
  
  return NextResponse.json({
    cpu: Math.round(cpuUsage),
    memory: Math.round(memoryUsage),
    uptime: os.uptime(),
    loadAverage: loadAvg,
  });
}