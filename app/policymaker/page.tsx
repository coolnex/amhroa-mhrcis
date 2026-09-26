"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Target,
  FileDown, 
  Printer as PrintIcon, 
  Stamp, 
  PenLine,
  AlertTriangle,
  Download,
  Calendar,
  Globe,
  FileText,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  MessageSquare,
  Printer,
  Share2,
  Landmark,
  Gavel,
  Wallet,
  Users,
  BarChart3,
  ChevronRight,
  Loader2,
  Sparkles,
  Shield,
  Activity,
  Layers,
  BookOpen,
  Handshake,
  Flag,
  Bell,
} from "lucide-react";

// ============================================================
// Types
// ============================================================
interface ReformRow {
  id: number;
  country_name: string;
  reform_tier: string | null;
  law_status: string | null;
  implementation_status: string | null;
  budget_level: string | null;
  priority_level: string | null;
  strategy: string | null;
  reform_score: number | null;
  implementation_score: number | null;
  sdg3_score: number | null;
  sdg10_score: number | null;
  sdg16_score: number | null;
  agenda2063_score: number | null;
  funding_gap_level: string | null;
  investment_priority: string | null;
  estimated_investment_need: number | null;
  donor_readiness_score: number | null;
  created_at: string;
}

interface KPI {
  label: string;
  value: string | number;
  sublabel: string;
  delta?: number;
  icon: React.ElementType;
  accent: string;
}

// ============================================================
// Accent palette
// ============================================================
const ACCENTS: Record<
  string,
  { bg: string; text: string; border: string; glow: string }
> = {
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
    glow: "from-cyan-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    glow: "from-purple-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "from-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    glow: "from-amber-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    glow: "from-rose-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    glow: "from-blue-500/20",
  },
};

// ============================================================
// Component
// ============================================================
export default function PolicymakerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [allReforms, setAllReforms] = useState<ReformRow[]>([]);
  const [selectedReform, setSelectedReform] = useState<ReformRow | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // Init
  // ============================================================
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const row = allReforms.find((r) => r.country_name === selectedCountry) || null;
      setSelectedReform(row);
    }
  }, [selectedCountry, allReforms]);

  const init = async () => {
    try {
      // Auth: cached or session
      const userStr = localStorage.getItem("user");
      let profile: any = null;

      if (userStr) {
        try {
          profile = JSON.parse(userStr);
        } catch {
          localStorage.removeItem("user");
        }
      }

      if (!profile) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from("users")
            .select("id, full_name, email, role, country, status")
            .eq("auth_user_id", session.user.id)
            .single();
          profile = data;
          if (profile) localStorage.setItem("user", JSON.stringify(profile));
        }
      }

      // Guard
      const role = profile?.role;
      const allowed = ["Policymaker", "policymaker", "Admin", "policymaker_coordinator"];
      if (!profile || !allowed.includes(role)) {
        router.push("/dashboard");
        return;
      }
      if (profile.status && profile.status !== "Approved") {
        router.push("/login?message=Account pending approval");
        return;
      }

      setIsAuthenticated(true);
      setUser(profile);

      // Preferred starting country
      if (profile.country) setSelectedCountry(profile.country);

      await fetchReforms(profile);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error("Policymaker dashboard init:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Data
  // ============================================================
  const fetchReforms = async (profile: any) => {
    try {
      const { data, error } = await supabase
        .from("mental_health_reforms")
        .select("*")
        .order("country_name", { ascending: true });

      if (error) throw error;

      const rows = (data || []) as ReformRow[];
      setAllReforms(rows);

      // Pick a sensible default
      if (!selectedCountry && rows.length > 0) {
        const first =
          rows.find((r) => r.country_name === profile?.country) || rows[0];
        setSelectedCountry(first.country_name);
      }
    } catch (err) {
      console.error("fetchReforms error:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReforms(user);
    setLastUpdated(new Date().toLocaleString());
    setRefreshing(false);
  };
  const executiveRef = user?.full_name || "AMHROA Policy Unit";
const referenceNumber = useMemo(() => {
  const year = new Date().getFullYear();
  const countryCode = (selectedCountry || "AFR").slice(0, 3).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AMHROA/POL/${year}/${countryCode}-${rand}`;
}, [selectedCountry]);

// ============================================================
// DOWNLOAD EXECUTIVE BRIEF (HTML → PDF via browser print)
// ============================================================
const handleDownloadBrief = () => {
  if (!r) return;

  const generatedAt = new Date().toLocaleString("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const rag = (score: number) => {
    if (score >= 80) return { label: "Strong", color: "#10b981" };
    if (score >= 60) return { label: "Adequate", color: "#06b6d4" };
    if (score >= 40) return { label: "Developing", color: "#f59e0b" };
    return { label: "Critical", color: "#ef4444" };
  };

  const fmt = (n: number | null | undefined) => `${n ?? 0}%`;
  const fmtMoney = (n: number | null | undefined) =>
    n ? `$${Number(n).toLocaleString()}` : "—";

  const profileRows = [
    ["Reform Score", fmt(r.reform_score)],
    ["Implementation Score", fmt(r.implementation_score)],
    ["SDG 3 Alignment", fmt(r.sdg3_score)],
    ["SDG 10 Alignment", fmt(r.sdg10_score)],
    ["SDG 16 Alignment", fmt(r.sdg16_score)],
    ["Agenda 2063", fmt(r.agenda2063_score)],
  ];

  const fundingRows = [
    ["Funding Gap", r.funding_gap_level || "—"],
    ["Investment Priority", r.investment_priority || "—"],
    ["Estimated Investment Need", fmtMoney(r.estimated_investment_need)],
    ["Donor Readiness", fmt(r.donor_readiness_score)],
  ];

  const benchmarkRows = benchmarks
    .map(
      (b) => `
      <tr>
        <td>#${b.rank}</td>
        <td>${b.country}</td>
        <td>${b.tier}</td>
        <td style="text-align:right;font-weight:700;color:#0891b2">${b.score}%</td>
      </tr>`
    )
    .join("");

  const recommendationRows = recommendations
    .map((rec) => {
      const color =
        rec.severity === "high"
          ? "#ef4444"
          : rec.severity === "medium"
          ? "#f59e0b"
          : "#3b82f6";
      const label =
        rec.severity === "high"
          ? "HIGH PRIORITY"
          : rec.severity === "medium"
          ? "MEDIUM"
          : "INFORMATIONAL";
      return `
        <div class="rec">
          <div class="rec-badge" style="background:${color}20;color:${color};border:1px solid ${color}40">
            ${label}
          </div>
          <div class="rec-text">${rec.text}</div>
        </div>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Executive Brief — ${r.country_name}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #0f172a;
    background: #ffffff;
    line-height: 1.55;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm 18mm;
    page-break-after: always;
    position: relative;
  }
  .page:last-child { page-break-after: auto; }

  /* ============ COVER ============ */
  .cover {
    background: linear-gradient(135deg, #0e7490 0%, #0c4a6e 55%, #082f49 100%);
    color: white;
    padding: 30mm 18mm;
    min-height: 297mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .cover-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .seal {
    width: 78px; height: 78px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: 2px solid rgba(255,255,255,0.3);
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 26px; letter-spacing: 1px;
  }
  .org-name {
    text-align: right;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.85;
  }
  .org-sub {
    text-align: right;
    font-size: 9px;
    letter-spacing: 1px;
    opacity: 0.6;
    margin-top: 4px;
  }
  .classification {
    display: inline-block;
    padding: 5px 14px;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 20px;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .cover-title {
    margin: 40mm 0;
  }
  .cover-kicker {
    font-size: 12px;
    letter-spacing: 5px;
    text-transform: uppercase;
    opacity: 0.75;
    margin-bottom: 16px;
  }
  .cover-country {
    font-size: 54px;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -1px;
    margin-bottom: 12px;
  }
  .cover-subtitle {
    font-size: 18px;
    font-style: italic;
    opacity: 0.85;
    margin-bottom: 24px;
  }
  .cover-rule {
    width: 80px; height: 4px;
    background: #67e8f9;
    margin-bottom: 24px;
  }
  .cover-summary {
    font-size: 13px;
    line-height: 1.7;
    opacity: 0.9;
    max-width: 470px;
  }
  .cover-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-top: 1px solid rgba(255,255,255,0.2);
    padding-top: 20px;
    font-size: 10px;
    letter-spacing: 1px;
  }
  .cover-bottom div span {
    display: block;
    opacity: 0.6;
    font-size: 9px;
    margin-bottom: 3px;
    letter-spacing: 2px;
  }
  .cover-bottom div strong {
    font-size: 12px;
    font-weight: 600;
  }

  /* ============ CONTENT PAGES ============ */
  .page-title {
    font-size: 22px;
    font-weight: 900;
    color: #0c4a6e;
    letter-spacing: -0.5px;
    padding-bottom: 10px;
    border-bottom: 3px solid #0891b2;
    margin-bottom: 24px;
  }
  .page-title small {
    display: block;
    font-size: 11px;
    font-weight: 400;
    color: #64748b;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 4px;
  }

  .section {
    margin-bottom: 26px;
  }
  .section-head {
    font-size: 12px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #0891b2;
    font-weight: 700;
    margin-bottom: 12px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  thead th {
    background: #0c4a6e;
    color: white;
    text-align: left;
    padding: 9px 12px;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-weight: 600;
  }
  tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid #e2e8f0;
  }
  tbody tr:nth-child(even) td { background: #f8fafc; }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px 18px;
    background: #f8fafc;
  }
  .card-title {
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 700;
    margin-bottom: 12px;
  }
  .metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px dashed #cbd5e1;
    font-size: 11.5px;
  }
  .metric-row:last-child { border-bottom: none; }
  .metric-label { color: #475569; }
  .metric-value { font-weight: 800; color: #0c4a6e; }
  .metric-value.warn { color: #d97706; }
  .metric-value.bad { color: #dc2626; }
  .metric-value.good { color: #059669; }

  .bar-row {
    margin-bottom: 14px;
  }
  .bar-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    margin-bottom: 5px;
    color: #334155;
  }
  .bar-label strong { color: #0c4a6e; }
  .bar-track {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }
  .bar-fill {
    height: 8px;
    border-radius: 4px;
  }

  .rec {
    border-left: 4px solid #0891b2;
    padding: 12px 16px;
    background: #f8fafc;
    margin-bottom: 12px;
    border-radius: 0 8px 8px 0;
  }
  .rec-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 9px;
    letter-spacing: 1.5px;
    font-weight: 800;
    margin-bottom: 6px;
  }
  .rec-text {
    font-size: 11.5px;
    line-height: 1.6;
    color: #1e293b;
  }

  /* ============ SIGNATURE ============ */
  .signature-block {
    margin-top: 50px;
    padding-top: 22px;
    border-top: 2px solid #0c4a6e;
    page-break-inside: avoid;
  }
  .signature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 30px;
  }
  .sig-line {
    border-bottom: 1.5px solid #0f172a;
    height: 46px;
    margin-bottom: 8px;
    position: relative;
  }
  .sig-name {
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
  }
  .sig-title {
    font-size: 10px;
    color: #64748b;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 2px;
  }
  .sig-date {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 6px;
  }

  .stamp-box {
    margin-top: 40px;
    border: 2px dashed #94a3b8;
    border-radius: 12px;
    padding: 18px;
    text-align: center;
    color: #64748b;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  /* ============ FOOTER ============ */
  .footer {
    position: absolute;
    bottom: 12mm;
    left: 18mm;
    right: 18mm;
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #94a3b8;
    letter-spacing: 1px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
  }
</style>
</head>
<body>

<!-- ================= COVER PAGE ================= -->
<div class="page cover">
  <div>
    <div class="cover-top">
      <div class="seal">A</div>
      <div>
        <div class="org-name">AMHROA</div>
        <div class="org-sub">Association of Mental Health Reform Organizations of Africa</div>
      </div>
    </div>
    <div style="margin-top:24px">
      <span class="classification">Executive · Confidential</span>
    </div>
  </div>

  <div class="cover-title">
    <div class="cover-kicker">Policy Intelligence Brief</div>
    <div class="cover-country">${r.country_name}</div>
    <div class="cover-rule"></div>
    <div class="cover-subtitle">National Mental Health Reform — Executive Decision Support</div>
    <p class="cover-summary">
      This brief provides a consolidated, evidence-based snapshot of ${r.country_name}'s mental health reform landscape, drawing on the continental AMHROA registry. It is intended for ministers, cabinet members, technical advisors, and development partners engaged in mental health policy and investment decisions.
    </p>
  </div>

  <div class="cover-bottom">
    <div>
      <span>Reference</span>
      <strong>${referenceNumber}</strong>
    </div>
    <div>
      <span>Issued</span>
      <strong>${generatedAt}</strong>
    </div>
    <div>
      <span>Prepared For</span>
      <strong>${executiveRef}</strong>
    </div>
  </div>
</div>

<!-- ================= PAGE 2: PROFILE & FUNDING ================= -->
<div class="page">
  <h1 class="page-title">
    01 · Reform Profile
    <small>Reform scores, SDG & continental alignment</small>
  </h1>

  <div class="section">
    <div class="section-head">Reform Dimensions</div>
    ${implementationGaps
      .map((g) => {
        const ragColor =
          g.score >= 80
            ? "#059669"
            : g.score >= 60
            ? "#0891b2"
            : g.score >= 40
            ? "#f59e0b"
            : "#dc2626";
        return `
        <div class="bar-row">
          <div class="bar-label">
            <span>${g.area}</span>
            <strong>${g.score}%</strong>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${g.score}%;background:${ragColor}"></div>
          </div>
        </div>`;
      })
      .join("")}
  </div>

  <div class="grid-2 section">
    <div class="card">
      <div class="card-title">Reform Status</div>
      ${profileRows
        .map(
          ([k, v]) => `
        <div class="metric-row">
          <span class="metric-label">${k}</span>
          <span class="metric-value">${v}</span>
        </div>`
        )
        .join("")}
    </div>
    <div class="card">
      <div class="card-title">Funding Snapshot</div>
      ${fundingRows
        .map(
          ([k, v]) => `
        <div class="metric-row">
          <span class="metric-label">${k}</span>
          <span class="metric-value">${v}</span>
        </div>`
        )
        .join("")}
    </div>
  </div>

  <div class="section">
    <div class="section-head">Current National Strategy</div>
    <div class="card" style="background:#f0f9ff;border-color:#0891b2">
      <p style="font-size:12px;line-height:1.75;color:#0c4a6e">
        ${r.strategy || "No strategy document has been published to the continental registry at this time."}
      </p>
    </div>
  </div>

  <div class="section">
    <div class="section-head">Reform Tier Classification</div>
    <div class="grid-2">
      <div class="card">
        <div class="metric-row">
          <span class="metric-label">Reform Tier</span>
          <span class="metric-value">${r.reform_tier || "—"}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Law Status</span>
          <span class="metric-value">${r.law_status || "—"}</span>
        </div>
      </div>
      <div class="card">
        <div class="metric-row">
          <span class="metric-label">Implementation Status</span>
          <span class="metric-value">${r.implementation_status || "—"}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Priority Level</span>
          <span class="metric-value">${r.priority_level || "—"}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>AMHROA · Policy Intelligence Center</span>
    <span>${referenceNumber}</span>
    <span>Page 2</span>
  </div>
</div>

<!-- ================= PAGE 3: RECOMMENDATIONS & BENCHMARKING ================= -->
<div class="page">
  <h1 class="page-title">
    02 · Strategic Recommendations
    <small>Action items prioritized for executive decision</small>
  </h1>

  <div class="section">
    ${recommendationRows}
  </div>

  <h1 class="page-title" style="margin-top:32px">
    03 · Peer Benchmarking
    <small>Comparison with countries in the same reform tier</small>
  </h1>

  <div class="section">
    <table>
      <thead>
        <tr>
          <th style="width:60px">Rank</th>
          <th>Country</th>
          <th>Reform Tier</th>
          <th style="text-align:right;width:90px">Reform Score</th>
        </tr>
      </thead>
      <tbody>
        ${benchmarkRows}
      </tbody>
    </table>
  </div>

  <!-- ================= SIGNATURE BLOCK ================= -->
  <div class="signature-block">
    <div class="section-head">Executive Attestation</div>
    <p style="font-size:11px;color:#475569;line-height:1.7;margin-bottom:14px">
      This brief has been prepared by the AMHROA Policy Intelligence Center. The findings and recommendations herein are based on the most current data submitted to the continental mental health reform registry. Any decisions taken should be verified against national sources and applicable legal frameworks.
    </p>

    <div class="signature-grid">
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">Chief Policy Officer</div>
        <div class="sig-title">AMHROA Policy Intelligence Center</div>
        <div class="sig-date">Date: ________________________</div>
      </div>
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">Country Representative</div>
        <div class="sig-title">${r.country_name} · Ministry of Health</div>
        <div class="sig-date">Date: ________________________</div>
      </div>
    </div>

    <div class="stamp-box">
      Official Seal & Stamp Here
    </div>

    <p style="font-size:9px;color:#94a3b8;text-align:center;margin-top:22px;letter-spacing:2px;text-transform:uppercase">
      End of Brief · ${referenceNumber}
    </p>
  </div>

  <div class="footer">
    <span>AMHROA · Policy Intelligence Center</span>
    <span>${referenceNumber}</span>
    <span>Page 3</span>
  </div>
</div>

</body>
</html>`;

  // Open in a new window and trigger print (which is how most browsers save as PDF)
  const win = window.open("", "_blank", "width=900,height=1200");
  if (!win) {
    alert("Please allow pop-ups to generate the executive brief.");
    return;
  }
  win.document.write(html);
  win.document.close();

  // Give the browser a moment to render fonts/styles before printing
  setTimeout(() => {
    win.focus();
    win.print();
  }, 500);
};

// ============================================================
// PRINT (same output, kept as a separate handler for clarity)
// ============================================================
const handlePrintBrief = () => {
  handleDownloadBrief();
};

  function shortenValue(v: string | null | undefined, max = 18): string {
    if (!v) return "";
    return v.length > max ? `${v.slice(0, max - 1)}…` : v;
  }

  // ============================================================
  // Derived data
  // ============================================================
  const kpis: KPI[] = useMemo(() => {
    const r = selectedReform;
    if (!r) return [];
    return [
      {
        label: "Reform Score",
        value: `${r.reform_score ?? 0}%`,
        sublabel: "Overall legal & policy readiness",
        delta: 5,
        icon: Scale,
        accent: "cyan",
      },
      {
        label: "Implementation",
        value: `${r.implementation_score ?? 0}%`,
        sublabel: "On-the-ground rollout progress",
        delta: 3,
        icon: Activity,
        accent: "emerald",
      },
      {
        label: "SDG 3 Alignment",
        value: `${r.sdg3_score ?? 0}%`,
        sublabel: "Mental health & well-being (SDG 3.4)",
        delta: 8,
        icon: Target,
        accent: "purple",
      },
      {
        label: "Agenda 2063",
        value: `${r.agenda2063_score ?? 0}%`,
        sublabel: "Continental development alignment",
        delta: 4,
        icon: Flag,
        accent: "amber",
      },
    ];
  }, [selectedReform]);

  const benchmarks = useMemo(() => {
    if (!selectedReform) return [];
    // Peers in the same reform_tier (fallback: same law_status tier)
    const peers = allReforms.filter(
      (r) =>
        r.country_name !== selectedReform.country_name &&
        r.reform_tier === selectedReform.reform_tier
    );
    const pool = peers.length > 0 ? peers : allReforms;
    return [...pool]
      .sort((a, b) => (b.reform_score ?? 0) - (a.reform_score ?? 0))
      .slice(0, 5)
      .map((r, idx) => ({
        country: r.country_name,
        score: r.reform_score ?? 0,
        rank: idx + 1,
        tier: r.reform_tier || "—",
      }));
  }, [selectedReform, allReforms]);

  const implementationGaps = useMemo(() => {
    if (!selectedReform) return [];
    const r = selectedReform;
    // Derive a "gap profile" from available scores
    const gaps = [
      { area: "Legal & Policy Framework", score: r.reform_score ?? 0 },
      { area: "Implementation & Delivery", score: r.implementation_score ?? 0 },
      { area: "SDG 3 Health Alignment", score: r.sdg3_score ?? 0 },
      { area: "SDG 10 Equity Alignment", score: r.sdg10_score ?? 0 },
      { area: "SDG 16 Governance Alignment", score: r.sdg16_score ?? 0 },
      { area: "Agenda 2063 Alignment", score: r.agenda2063_score ?? 0 },
    ];
    return gaps.sort((a, b) => a.score - b.score);
  }, [selectedReform]);

  const recommendations = useMemo(() => {
    if (!selectedReform) return [];
    const r = selectedReform;
    const recs: { text: string; severity: "high" | "medium" | "info" }[] = [];

    if ((r.implementation_score ?? 0) < 60) {
      recs.push({
        text: `Implementation is at ${r.implementation_score}% — establish a cross-ministerial delivery unit with quarterly milestones.`,
        severity: "high",
      });
    }
    if ((r.reform_score ?? 0) < 65 && (r.law_status || "").toLowerCase() !== "enacted") {
      recs.push({
        text: `Legal framework is not yet enacted. Prioritize tabling the mental health bill in the next legislative session.`,
        severity: "high",
      });
    }
    if ((r.funding_gap_level || "").toLowerCase() === "high" || (r.estimated_investment_need ?? 0) > 0) {
      recs.push({
        text: `Funding gap is ${r.funding_gap_level || "material"} — develop a domestic resource mobilization strategy aligned to the ${r.investment_priority || "high"} investment priority.`,
        severity: "medium",
      });
    }
    if ((r.sdg10_score ?? 0) < 50) {
      recs.push({
        text: `SDG 10 alignment is low — embed equity and disability-inclusion provisions into the policy design.`,
        severity: "medium",
      });
    }
    if ((r.sdg16_score ?? 0) < 50) {
      recs.push({
        text: `Strengthen governance & accountability (SDG 16) — introduce a public reporting dashboard and independent oversight.`,
        severity: "medium",
      });
    }
    if ((r.donor_readiness_score ?? 0) < 55) {
      recs.push({
        text: `Donor readiness is ${r.donor_readiness_score}% — prepare a costed investment case and results framework to unlock external financing.`,
        severity: "info",
      });
    }
    if (recs.length === 0) {
      recs.push({
        text: "Country is on a strong reform trajectory — focus on sustaining momentum through annual reporting and peer learning.",
        severity: "info",
      });
    }
    return recs.slice(0, 4);
  }, [selectedReform]);

  // ============================================================
  // Program areas — the 6 pillars of mental health policy
  // ============================================================
  const programAreas = [
    {
      icon: Gavel,
      title: "Legislative Reform",
      desc: "Enact rights-based mental health laws that align with the CRPD and WHO guidance.",
      color: "cyan",
    },
    {
      icon: Wallet,
      title: "Budget & Financing",
      desc: "Secure domestic financing and blend public, donor, and private resources.",
      color: "amber",
    },
    {
      icon: Landmark,
      title: "Institutional Governance",
      desc: "Stand up national commissions, coordinating bodies, and accountability systems.",
      color: "purple",
    },
    {
      icon: Users,
      title: "Workforce & Services",
      desc: "Train and deploy community mental health workers, nurses, and peer specialists.",
      color: "emerald",
    },
    {
      icon: Shield,
      title: "Rights & Inclusion",
      desc: "End stigma, decriminalize suicide, protect the rights of persons with disabilities.",
      color: "rose",
    },
    {
      icon: Layers,
      title: "M&E and Reporting",
      desc: "Track SDG 3.4, SDG 10, SDG 16 and Agenda 2063 progress transparently.",
      color: "blue",
    },
  ];

  // ============================================================
  // Loading
  // ============================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading policy intelligence…</p>
        </div>
      </main>
    );
  }

  const r = selectedReform;

  // ============================================================
  // Render
  // ============================================================
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* =====================================================
            HERO
        ===================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950 via-slate-900/80 to-slate-900 p-8 md:p-10 mb-8 shadow-2xl">
          {/* blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
          {/* watermark */}
          <div className="absolute right-0 top-0 text-[180px] font-black text-white/[0.03] select-none pointer-events-none leading-none">
            POLICY
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-start gap-6 mb-8">
              <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 backdrop-blur">
                <Scale className="w-10 h-10 text-cyan-300" />
              </div>
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider">
                    POLICYMAKER · NATIONAL REFORM INTELLIGENCE
                  </span>
                  <Link
                    href="/notifications"
                    className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-wider flex items-center gap-1.5 hover:bg-amber-500/25 transition-colors"
                  >
                    <Bell className="w-3 h-3" />
                    View alerts
                  </Link>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  {user?.full_name
                    ? `Welcome back, ${user.full_name.split(" ")[0]}`
                    : "National Reform Intelligence Center"}
                </h1>
                <p className="text-cyan-100/80 mt-3 text-base md:text-lg max-w-3xl">
                  Evidence-driven decision support for mental health reform —
                  legislation, budget, implementation, and continental
                  alignment.
                </p>
              </div>
            </div>

            {/* quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStat
                label="Countries Tracked"
                value={allReforms.length}
                icon={Globe}
              />
              <QuickStat
                label="Reform Tier"
                value={shortenValue(r?.reform_tier, 18) || "—"}
                icon={Award}
              />
              <QuickStat
                label="Law Status"
                value={shortenValue(r?.law_status, 18) || "—"}
                icon={Gavel}
              />
              <QuickStat
                label="Priority"
                value={shortenValue(r?.priority_level, 18) || "—"}
                icon={Flag}
              />
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/continental-reform-dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-cyan-900 font-semibold hover:bg-cyan-50 transition-colors shadow-lg"
              >
                <BarChart3 className="w-4 h-4" />
                Continental Reform Dashboard
              </Link>

              <button
                onClick={handlePrintBrief}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-100 font-semibold hover:bg-cyan-500/25 transition-colors"
                title="Open the executive brief for printing"
              >
                <Printer className="w-4 h-4" />
                Print Executive Brief
              </button>

              <button
                onClick={handleDownloadBrief}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-colors shadow-lg shadow-cyan-500/20"
                title="Generate a PDF-ready executive brief"
              >
                <Download className="w-4 h-4" />
                Download Executive Brief
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            COUNTRY SELECTOR
        ===================================================== */}
        <section className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-[220px]"
              >
                {allReforms.length === 0 && (
                  <option value="">No data available</option>
                )}
                {allReforms.map((row) => (
                  <option key={row.id} value={row.country_name}>
                    {row.country_name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated: {lastUpdated || "—"}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="text-sm hidden sm:inline">Refresh</span>
          </button>
        </section>

        {/* =====================================================
            KPI GRID
        ===================================================== */}
        {r && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {kpis.map((kpi) => (
              <KPICard key={kpi.label} kpi={kpi} />
            ))}
          </section>
        )}

        {!r && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center mb-10">
            <Globe className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-semibold">
              No reform data yet for this country
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Ask the continental team to publish a country profile.
            </p>
          </div>
        )}
        <section className="mb-10 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950 via-slate-900/80 to-slate-900 p-6 md:p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-start gap-4 min-w-[260px] flex-1">
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 shrink-0">
              <FileDown className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg md:text-xl">
                Executive Decision Brief — {r?.country_name || "Selected Country"}
              </h3>
              <p className="text-cyan-100/70 text-sm mt-1 max-w-2xl">
                Generate a minister-ready PDF with reform scores, funding snapshot,
                strategic recommendations, peer benchmarking, and a formal signature
                block.
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handlePrintBrief}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadBrief}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" />
              Download Brief
            </button>
          </div>
        </section>

        {/* =====================================================
            PROGRAM AREAS
        ===================================================== */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Six Pillars of Mental Health Policy
              </h2>
              <p className="text-slate-400 mt-1 text-sm">
                What effective national reform looks like on the ground.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              6 PILLARS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programAreas.map((area) => {
              const Icon = area.icon;
              const accent = ACCENTS[area.color] || ACCENTS.cyan;
              return (
                <div
                  key={area.title}
                  className={`relative overflow-hidden rounded-2xl border ${accent.border} bg-slate-900/60 backdrop-blur p-5 hover:bg-slate-800/60 transition-colors group`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${accent.bg} border ${accent.border}`}
                    >
                      <Icon className={`w-5 h-5 ${accent.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{area.title}</h3>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        {area.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            MAIN GRID: Gaps + Recommendations
        ===================================================== */}
        {r && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Implementation gaps */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    Implementation Profile
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Scores across the reform dimensions used by AMHROA.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {implementationGaps.map((g) => {
                  const color =
                    g.score >= 80
                      ? "bg-emerald-500"
                      : g.score >= 60
                      ? "bg-cyan-500"
                      : g.score >= 40
                      ? "bg-yellow-500"
                      : "bg-rose-500";
                  const textColor =
                    g.score >= 80
                      ? "text-emerald-400"
                      : g.score >= 60
                      ? "text-cyan-400"
                      : g.score >= 40
                      ? "text-yellow-400"
                      : "text-rose-400";
                  return (
                    <div key={g.area}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-300 text-sm">
                          {g.area}
                        </span>
                        <span
                          className={`text-sm font-mono font-bold ${textColor}`}
                        >
                          {g.score}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${color}`}
                          style={{ width: `${g.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strategy callout */}
              {r.strategy && (
                <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">
                        National Strategy
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {r.strategy}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI recommendations */}
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-slate-900/40 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30">
                  <Sparkles className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Policy Recommendations
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Generated from this country's scores.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec, idx) => {
                  const styles =
                    rec.severity === "high"
                      ? {
                          border: "border-rose-500/30",
                          bg: "bg-rose-500/5",
                          text: "text-rose-300",
                        }
                      : rec.severity === "medium"
                      ? {
                          border: "border-amber-500/30",
                          bg: "bg-amber-500/5",
                          text: "text-amber-300",
                        }
                      : {
                          border: "border-blue-500/30",
                          bg: "bg-blue-500/5",
                          text: "text-blue-300",
                        };
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border ${styles.border} ${styles.bg}`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                            rec.severity === "high"
                              ? "bg-rose-400"
                              : rec.severity === "medium"
                              ? "bg-amber-400"
                              : "bg-blue-400"
                          }`}
                        />
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {rec.text}
                        </p>
                      </div>
                      <button className="mt-3 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1">
                        Draft talking points
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Funding box */}
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                    Funding Snapshot
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs">Gap Level</p>
                    <p className="text-white font-semibold">
                      {r.funding_gap_level || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Donor Readiness</p>
                    <p className="text-white font-semibold">
                      {r.donor_readiness_score ?? 0}%
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-400 text-xs">
                      Estimated Investment Need
                    </p>
                    <p className="text-white font-semibold">
                      {r.estimated_investment_need
                        ? `$${Number(
                            r.estimated_investment_need
                          ).toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            BENCHMARKING
        ===================================================== */}
        {r && benchmarks.length > 0 && (
          <section className="rounded-3xl border border-slate-700/60 bg-slate-900/60 backdrop-blur p-6 md:p-8 mb-10">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Peer Benchmarking
                </h2>
                <p className="text-slate-400 mt-1 text-sm">
                  Countries in the same reform tier as {r.country_name}.
                </p>
              </div>
              <Link
                href="/compare"
                className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Full comparison <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {benchmarks.map((b) => (
                <div
                  key={b.country}
                  className="flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <span className="text-cyan-300 font-black text-sm">
                      #{b.rank}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold truncate">
                        {b.country}
                      </p>
                      <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                        {b.tier}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${b.score}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-cyan-400 font-mono font-bold text-lg shrink-0">
                    {b.score}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <p className="text-center text-slate-500 text-xs mt-10">
          AMHROA · Policy Intelligence Center · Data sourced live from the
          continental mental health reforms registry
        </p>
      </div>
    </main>
  );
}

// ============================================================
// Sub-components
// ============================================================
function QuickStat({
  label,
  value,
  icon: Icon,
  fullWidth = false,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  fullWidth?: boolean;
}) {
  const displayValue = String(value);
  const isLong = displayValue.length > 14;

  return (
    <div
      className={`rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4 hover:bg-white/10 transition-colors min-w-0 ${
        fullWidth ? "col-span-2 md:col-span-1" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="text-cyan-100/70 text-xs font-medium truncate">
          {label}
        </p>
        <Icon className="w-4 h-4 text-cyan-300/60 shrink-0" />
      </div>
      <p
        className={`font-black text-white leading-tight break-words ${
          isLong ? "text-sm md:text-base" : "text-xl md:text-2xl"
        }`}
        title={displayValue}
      >
        {displayValue}
      </p>
    </div>
  );
}

function KPICard({ kpi }: { kpi: KPI }) {
  const accent = ACCENTS[kpi.accent] || ACCENTS.cyan;
  const Icon = kpi.icon;
  const isPositive = (kpi.delta ?? 0) >= 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${accent.border} bg-slate-900/60 backdrop-blur p-5 hover:bg-slate-800/60 transition-colors`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
          {kpi.label}
        </p>
        <div className={`p-2 rounded-xl ${accent.bg} border ${accent.border}`}>
          <Icon className={`w-4 h-4 ${accent.text}`} />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <h2 className={`text-3xl md:text-4xl font-black ${accent.text}`}>
          {kpi.value}
        </h2>
        {kpi.delta !== undefined && (
          <span
            className={`text-xs font-bold flex items-center gap-1 pb-1 ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(kpi.delta)}%
          </span>
        )}
      </div>
      <p className="text-slate-500 text-xs mt-2">{kpi.sublabel}</p>
    </div>
  );
}