// components/ui/country-select.tsx
"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Check, Globe } from "lucide-react";
import { allAfricanCountries } from "@/lib/countries-data";

interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string, countryName: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function CountrySelect({ value, onChange, placeholder = "Select a country", required, className = "" }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedCountry = allAfricanCountries.find(c => c.code === value);

  const filteredCountries = allAfricanCountries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country: typeof allAfricanCountries[0]) => {
    onChange(country.code, country.name);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white flex items-center justify-between focus:outline-none focus:border-cyan-500"
      >
        <div className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              <span className="text-xl">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-700 border border-slate-600 rounded-xl overflow-hidden shadow-xl">
          <div className="p-2 border-b border-slate-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelect(country)}
                className="w-full px-4 py-3 text-left hover:bg-slate-600 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{country.flag}</span>
                  <div>
                    <p className="text-white">{country.name}</p>
                    <p className="text-slate-400 text-xs">{country.region}</p>
                  </div>
                </div>
                {selectedCountry?.code === country.code && (
                  <Check className="w-4 h-4 text-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}