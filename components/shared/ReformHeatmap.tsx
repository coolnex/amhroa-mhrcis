interface ReformHeatmapProps {
    title: string;
    data: { regions: string[]; scores: number[] };
    onDrillDown?: (region: string) => void;
  }
  
  export function ReformHeatmap({ title, data, onDrillDown }: ReformHeatmapProps) {
    const getColor = (score: number) => {
      if (score >= 80) return "bg-emerald-500";
      if (score >= 60) return "bg-green-500";
      if (score >= 40) return "bg-yellow-500";
      if (score >= 20) return "bg-orange-500";
      return "bg-red-500";
    };
  
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-white font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {data.regions.map((region, idx) => (
            <button
              key={region}
              onClick={() => onDrillDown?.(region)}
              className="w-full group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 text-sm">{region}</span>
                <span className="text-white text-sm font-mono">{data.scores[idx]}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`${getColor(data.scores[idx])} h-2 rounded-full transition-all group-hover:opacity-80`}
                  style={{ width: `${data.scores[idx]}%` }}
                ></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }