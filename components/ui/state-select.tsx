// components/ui/state-select.tsx
"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getStatesByCountry } from "@/lib/countries-data";

interface StateSelectProps {
  countryCode: string;
  value: string;
  onChange: (stateId: string, stateName: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function StateSelect({ 
  countryCode, 
  value, 
  onChange, 
  placeholder = "Select state/region", 
  required, 
  className = "" 
}: StateSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [states, setStates] = useState<{ id: string; name: string; type: string }[]>([]);

  useEffect(() => {
    if (countryCode) {
      const statesData = getStatesByCountry(countryCode);
      setStates(statesData.map(s => ({ id: s.id, name: s.name, type: s.type || "state" })));
    } else {
      setStates([]);
    }
  }, [countryCode]);

  const selectedState = states.find(s => s.id === value);

  if (!countryCode) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-slate-400">
          Select a country first
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={states.length === 0}
        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white flex items-center justify-between focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedState ? "text-white" : "text-slate-400"}>
          {selectedState ? selectedState.name : placeholder}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && states.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-700 border border-slate-600 rounded-xl overflow-hidden shadow-xl max-h-64 overflow-y-auto">
          {states.map((state) => (
            <button
              key={state.id}
              type="button"
              onClick={() => {
                onChange(state.id, state.name);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-slate-600 transition-colors"
            >
              <p className="text-white">{state.name}</p>
              <p className="text-slate-400 text-xs capitalize">{state.type}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}