// app/components/MetricsModal.tsx
"use client";

import { useState } from "react";
import { Loader2, TrendingUp, X } from "lucide-react";

interface MetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { reach: number; engagement: number; notes: string }) => Promise<void>;
  actionTitle?: string;
  isLoading?: boolean;
}

export function MetricsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  actionTitle,
  isLoading = false 
}: MetricsModalProps) {
  const [reach, setReach] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (reach === 0 && engagement === 0) {
      alert("Please enter at least one metric value.");
      return;
    }
    await onSave({ reach, engagement, notes });
    setReach(0);
    setEngagement(0);
    setNotes("");
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              Add Impact Metrics
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          {actionTitle && (
            <p className="text-slate-400 text-sm mt-1">For: {actionTitle}</p>
          )}
        </div>
        <div className="p-6 space-y-4">
          <p className="text-slate-400 text-sm">
            Record the impact of this action. These metrics help track the overall campaign success.
          </p>
          
          <div>
            <label className="text-slate-400 text-sm block mb-2">Reach</label>
            <input
              type="number"
              value={reach}
              onChange={(e) => setReach(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
              placeholder="Number of people reached"
            />
            <p className="text-slate-500 text-xs mt-1">Total number of people who saw or heard about this action</p>
          </div>

          <div>
            <label className="text-slate-400 text-sm block mb-2">Engagement</label>
            <input
              type="number"
              value={engagement}
              onChange={(e) => setEngagement(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white"
              placeholder="Number of engagements"
            />
            <p className="text-slate-500 text-xs mt-1">Number of people who actively engaged (e.g., signed, attended, shared)</p>
          </div>

          <div>
            <label className="text-slate-400 text-sm block mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white resize-none"
              placeholder="Add any notes about this metric..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || (reach === 0 && engagement === 0)}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            {isLoading ? "Recording..." : "Record Metrics"}
          </button>
        </div>
      </div>
    </div>
  );
}