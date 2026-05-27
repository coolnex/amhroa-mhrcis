import { Brain, TrendingUp, AlertCircle, Download } from "lucide-react";

interface IntelligenceWidgetProps {
  title: string;
  subtitle?: string;
  type: "comparison" | "recommendations" | "alert";
  data: any[];
  primaryMetric?: string;
  secondaryMetric?: string;
  icon?: string;
  onExport?: () => void;
  onApply?: (item: any) => void;
}

export function IntelligenceWidget({ 
  title, 
  subtitle, 
  type, 
  data, 
  primaryMetric, 
  secondaryMetric,
  onExport,
  onApply 
}: IntelligenceWidgetProps) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            {title}
          </h3>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {onExport && (
          <button onClick={onExport} className="p-1 hover:bg-slate-700 rounded">
            <Download className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        {type === "comparison" && data.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-slate-300 text-sm">{item.country}</span>
            <div className="flex items-center gap-4">
              <div className="w-24 bg-slate-700 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${item[primaryMetric || "score"]}%` }}></div>
              </div>
              <span className="text-white text-sm font-mono">{item[primaryMetric || "score"]}</span>
              {secondaryMetric && (
                <span className="text-slate-500 text-xs">Rank #{item[secondaryMetric] + 1}</span>
              )}
            </div>
          </div>
        ))}
        
        {type === "recommendations" && data.map((rec, idx) => (
          <div key={idx} className="p-3 bg-slate-700/30 rounded-lg">
            <p className="text-slate-300 text-sm">{rec}</p>
            {onApply && (
              <button 
                onClick={() => onApply(rec)}
                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
              >
                Apply Recommendation →
              </button>
            )}
          </div>
        ))}
        
        {type === "alert" && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-300 text-sm">{data[0]}</p>
          </div>
        )}
      </div>
    </div>
  );
}