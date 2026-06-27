// lib/export-service.ts
export const exportSurveyResults = (data: any[], format: "csv" | "json" | "xlsx") => {
    switch (format) {
      case "csv":
        return exportToCSV(data);
      case "json":
        return exportToJSON(data);
      case "xlsx":
        return exportToExcel(data);
      default:
        throw new Error("Unsupported format");
    }
  };
  
  const exportToCSV = (data: any[]) => {
    if (data.length === 0) return "";
  
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(h => {
        const val = row[h];
        if (typeof val === "string" && val.includes(",")) {
          return `"${val}"`;
        }
        return val;
      }).join(",")
    );
  
    return [headers.join(","), ...rows].join("\n");
  };
  
  const exportToJSON = (data: any[]) => {
    return JSON.stringify(data, null, 2);
  };
  
  const exportToExcel = async (data: any[]) => {
    // Would use a library like xlsx
    alert("Excel export coming soon!");
  };

  // lib/export-service.ts
import { calculateSurveyStats } from "./survey-analytics";

export const generateAnalyticsReport = (responses: any[], questions: any[]) => {
  const stats = calculateSurveyStats(responses, questions);
  
  return {
    summary: {
      totalResponses: stats.totalResponses,
      completionRate: stats.completionRate,
      averageTime: stats.averageTime,
      totalQuestions: Object.keys(stats.questionStats).length,
    },
    questions: stats.questionStats,
    exportDate: new Date().toISOString(),
  };
};

export const generateCSVReport = (responses: any[], questions: any[]) => {
  const stats = calculateSurveyStats(responses, questions);
  
  // Create CSV rows
  const rows = [
    ["Question", "Response Count", "Average", "Min", "Max", "Median"],
  ];

  Object.entries(stats.questionStats).forEach(([id, questionStat]: [string, any]) => {
    rows.push([
      questionStat.questionLabel || id,
      String(questionStat.responseCount),
      questionStat.average?.toFixed(2) || "N/A",
      questionStat.min?.toString() || "N/A",
      questionStat.max?.toString() || "N/A",
      questionStat.median?.toString() || "N/A",
    ]);
  });

  return rows.map(row => row.join(",")).join("\n");
};