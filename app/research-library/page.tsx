"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Report {
  id: string;
  title: string;
  description: string;
  country: string;
  organization: string;
  report_type: string;
  submitted_by: string;
  file_url: string;
  status: string;
  created_at: string;
  sdg_alignment: string[];
}

export default function ResearchLibraryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const filtered = reports.filter((report) =>
      [
        report.title,
        report.country,
        report.organization,
        report.report_type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  async function fetchReports() {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("status", "Approved")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        return;
      }

      setReports(data || []);
      setFilteredReports(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-xl">Loading research library...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Research Library
          </h1>

          <p className="text-slate-600 mt-2">
            Access approved reports, research findings, and policy documents.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full p-4 border rounded-xl shadow-sm"
          />
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="font-semibold text-lg">
              Total Approved Reports
            </h2>

            <p className="text-3xl font-bold mt-2">
              {filteredReports.length}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow">
            <h2 className="text-xl font-semibold">
              No reports found
            </h2>

            <p className="text-slate-500 mt-2">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow p-6"
              >
                <h2 className="text-xl font-bold mb-3">
                  {report.title}
                </h2>

                <p className="text-slate-600 text-sm mb-4">
                  {report.description}
                </p>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Country:</strong>{" "}
                    {report.country}
                  </p>

                  <p>
                    <strong>Organization:</strong>{" "}
                    {report.organization || "N/A"}
                  </p>

                  <p>
                    <strong>Type:</strong>{" "}
                    {report.report_type}
                  </p>

                  <p>
                    <strong>Author:</strong>{" "}
                    {report.submitted_by}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      report.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>

                {/* SDGs */}
                {report.sdg_alignment?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.sdg_alignment.map(
                      (sdg, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                        >
                          {sdg}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6">
                  <a
                    href={report.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    View Report
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}