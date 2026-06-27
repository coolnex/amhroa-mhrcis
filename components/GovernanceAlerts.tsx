// components/GovernanceAlerts.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Bell, XCircle, Globe } from "lucide-react";

export function GovernanceAlerts({ userRole, userCountry }: { userRole: string; userCountry?: string }) {
  const [alerts, setAlerts] = useState<{ id: string; severity: string; title: string; message: string; country?: string }[]>([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("status", "active")
      .or(`audience.eq.all,audience.eq.${userRole}`)
      .or(`country.is.null,country.eq.${userCountry || ""}`);
    
    if (data) setAlerts(data);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => (
        <div key={alert.id} className={`p-4 rounded-xl border ${
          alert.severity === "high" ? "bg-red-500/10 border-red-500/30" :
          alert.severity === "medium" ? "bg-yellow-500/10 border-yellow-500/30" : "bg-blue-500/10 border-blue-500/30"
        }`}>
          <div className="flex items-start gap-3">
            {alert.severity === "high" && <AlertTriangle className="w-5 h-5 text-red-400" />}
            {alert.severity === "medium" && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
            {alert.severity === "low" && <Bell className="w-5 h-5 text-blue-400" />}
            <div>
              <h4 className="text-white font-semibold">{alert.title}</h4>
              <p className="text-slate-300 text-sm">{alert.message}</p>
              {alert.country && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-cyan-400">
                  <Globe className="w-3 h-3" />
                  {alert.country}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}