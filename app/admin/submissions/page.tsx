"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Submission {
    id: string;
    title: string;
    country: string;
    file_url: string;
    approval_status: string;
    created_at: string;
    reviewed_at?: string;
    review_notes?: string;
  }

export default function AdminSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setSubmissions(data);
    }

    setLoading(false);
  }

  async function approveSubmission(id: string) {
    const { error } = await supabase
      .from("submissions")
      .update({
        status: "Approved",
        reviewed_at: new Date(),
      })
      .eq("id", id);

    if (!error) {
      fetchSubmissions();
    }
  }

  async function rejectSubmission(id: string) {
    const reason = prompt("Reason for rejection");

    const { error } = await supabase
      .from("submissions")
      .update({
        status: "Rejected",
        admin_comment: reason,
        reviewed_at: new Date(),
      })
      .eq("id", id);

    if (!error) {
      fetchSubmissions();
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Report Approvals
      </h1>

      <div className="space-y-4">
        {submissions.map((submission: any) => (
          <div
            key={submission.id}
            className="border rounded-xl p-5 bg-white shadow"
          >
            <h2 className="font-semibold text-lg">
              {submission.title}
            </h2>

            <p className="text-sm text-slate-600">
              {submission.country}
            </p>

            <p className="mt-2">
              Status:
              <span className="ml-2 font-semibold">
                {submission.approval_status}
              </span>
            </p>

            <div className="flex gap-3 mt-4">
              <a
                href={submission.file_url}
                target="_blank"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                View Report
              </a>

              {submission.approval_status === "Pending" && (
                <>
                  <button
                    onClick={() =>
                      approveSubmission(submission.id)
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      rejectSubmission(submission.id)
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}