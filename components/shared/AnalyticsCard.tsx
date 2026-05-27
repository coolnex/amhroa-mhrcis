import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  trend?: { value: number; direction: "up" | "down" };
  color?: "blue" | "purple" | "green" | "red" | "yellow";
}

const colorClasses = {
  blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  green: "from-green-500/20 to-green-600/10 border-green-500/30",
  red: "from-red-500/20 to-red-600/10 border-red-500/30",
  yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
};

export function AnalyticsCard({ title, value, unit, icon: Icon, trend, color = "blue" }: AnalyticsCardProps) {
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 border backdrop-blur-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">
            {value}{unit && <span className="text-lg ml-1 text-slate-400">{unit}</span>}
          </p>
        </div>
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          {trend.direction === "up" ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-xs ${trend.direction === "up" ? "text-green-400" : "text-red-400"}`}>
            {trend.value}%
          </span>
          <span className="text-xs text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  );
}