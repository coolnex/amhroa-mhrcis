import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Milestone {
  date: string;
  title: string;
  status: "completed" | "in-progress" | "pending";
}

interface PolicyTimelineProps {
  title: string;
  milestones: Milestone[];
}

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  "in-progress": { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  pending: { icon: AlertCircle, color: "text-slate-400", bg: "bg-slate-500/20" },
};

export function PolicyTimeline({ title, milestones }: PolicyTimelineProps) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {milestones.map((milestone, idx) => {
          const config = statusConfig[milestone.status];
          const Icon = config.icon;
          return (
            <div key={idx} className="flex items-start gap-3">
              <div className={`p-1 rounded-full ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <p className="text-white text-sm font-medium">{milestone.title}</p>
                  <span className="text-slate-500 text-xs">{milestone.date}</span>
                </div>
                <div className="mt-1 h-1 w-full bg-slate-700 rounded-full">
                  <div 
                    className={`h-1 rounded-full ${
                      milestone.status === "completed" ? "bg-emerald-500 w-full" :
                      milestone.status === "in-progress" ? "bg-yellow-500 w-1/2" : "bg-slate-500 w-0"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}