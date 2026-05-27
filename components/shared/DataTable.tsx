import { Eye } from "lucide-react";

interface DataTableProps {
  title: string;
  columns: string[];
  data: Record<string, any>[];
  actions?: { label: string; icon: any; onClick: (row: any) => void }[];
}

export function DataTable({ title, columns, data, actions }: DataTableProps) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="text-left p-3 text-slate-400 text-sm font-medium">
                  {col}
                </th>
              ))}
              {actions && actions.length > 0 && <th className="text-left p-3 text-slate-400 text-sm">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                {columns.map((col) => (
                  <td key={col} className="p-3 text-slate-300 text-sm">
                    {row[col.toLowerCase().replace(/ /g, "")] || row[col] || "-"}
                  </td>
                ))}
                {actions && (
                  <td className="p-3">
                    <div className="flex gap-2">
                      {actions.map((action, actionIdx) => (
                        <button
                          key={actionIdx}
                          onClick={() => action.onClick(row)}
                          className="p-1 hover:bg-slate-600 rounded transition-colors"
                        >
                          <action.icon className="w-4 h-4 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}