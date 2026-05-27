"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

import { useState } from "react";
import { useRouter } from "next/navigation";

const geoUrl = "/maps/africa.json";

const countryScores: Record<string, number> = {
  Nigeria: 62,
  Kenya: 74,
  Ghana: 68,
  "South Africa": 81,
  Rwanda: 77,
};

export default function AfricaMapPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] =
    useState<string | null>(null);
    

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-10 mb-10 shadow-xl">
          <h1 className="text-5xl font-bold">
            Africa Mental Health Reform Map
          </h1>

          <p className="text-slate-300 mt-4 text-lg">
            Interactive visualization of mental health reform progress across Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAP */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 350,
              center: [20, 0],
            }}
            width={800}
            height={600}
            style={{
              width: "100%",
              height: "auto",
            }}
          >
              <Geographies geography={geoUrl}>
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name;

                    const score =
                      countryScores[countryName];

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          setSelectedCountry(countryName);
                        
                          router.push(
                            `/countries/${countryName.toLowerCase()}`
                          );
                        }}
                        style={{
                          default: {
                            fill: score
                              ? score > 75
                                ? "#16a34a"
                                : score > 65
                                ? "#0891b2"
                                : "#eab308"
                              : "#CBD5E1",
                            stroke: "#FFF",
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          hover: {
                            fill: "#1e293b",
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: "#0f172a",
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>

          {/* SIDE PANEL */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-6">
              Country Insights
            </h2>

            {selectedCountry ? (
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  {selectedCountry}
                </h3>

                <div className="space-y-4">

                  <div className="bg-slate-100 rounded-2xl p-4">
                    <p className="text-slate-500 text-sm">
                      Reform Score
                    </p>

                    <p className="text-4xl font-bold mt-2">
                      {countryScores[selectedCountry] || 0}%
                    </p>
                  </div>

                  <div className="bg-emerald-100 rounded-2xl p-4">
                    <p className="text-emerald-700 text-sm">
                      Status
                    </p>

                    <p className="text-xl font-semibold mt-2">
                      Reforming
                    </p>
                  </div>

                  <div className="bg-cyan-100 rounded-2xl p-4">
                    <p className="text-cyan-700 text-sm">
                      Priority Area
                    </p>

                    <p className="text-xl font-semibold mt-2">
                      Rights-Based Care
                    </p>
                  </div>

                  <div className="bg-yellow-100 rounded-2xl p-4">
                    <p className="text-yellow-700 text-sm">
                      Regional Collaboration
                    </p>

                    <p className="text-xl font-semibold mt-2">
                      Active
                    </p>
                  </div>

                </div>
              </div>
            ) : (
              <div className="text-slate-500">
                Click a country on the map to view reform insights.
              </div>
            )}
          </div>

        </div>

        {/* LEGEND */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mt-10">
          <h2 className="text-2xl font-bold mb-6">
            Reform Score Legend
          </h2>

          <div className="flex flex-wrap gap-6">

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-green-600"></div>
              <span>75%+ Strong Reform Progress</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-cyan-600"></div>
              <span>65%+ Moderate Reform Progress</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-yellow-500"></div>
              <span>Below 65% Needs Improvement</span>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}