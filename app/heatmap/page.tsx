"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  MapPin,
  Info,
  X,
  Download,
  Filter,
} from "lucide-react";

// Sample data - replace with your API data
const sampleCountryScores: Record<string, number> = {
  Nigeria: 62,
  Kenya: 74,
  "South Africa": 81,
  Egypt: 70,
  Ghana: 68,
  Ethiopia: 65,
  "DR Congo": 16,
  Tanzania: 48,
  Sudan: 25,
  Morocco: 72,
  Angola: 44,
  Mozambique: 40,
  Madagascar: 25,
  Cameroon: 42,
  Uganda: 68,
  Algeria: 50,
  Rwanda: 77,
  Zambia: 58,
  Zimbabwe: 55,
  Senegal: 48,
  Tunisia: 68,
  Botswana: 75,
  Namibia: 73,
  Mali: 24,
  BurkinaFaso: 26,
  Niger: 20,
  Chad: 15,
  Somalia: 12,
  "South Sudan": 8,
  "Central African Republic": 10,
  Liberia: 32,
  "Sierra Leone": 35,
  "The Gambia": 38,
  "Côte d'Ivoire": 45,
  Benin: 28,
  Togo: 30,
  "Cabo Verde": 70,
  Mauritius: 85,
  Seychelles: 82,
  Comoros: 28,
  Djibouti: 30,
  Lesotho: 45,
  Eswatini: 48,
  Libya: 22,
  Gabon: 52,
  Guinea: 28,
  "Equatorial Guinea": 22,
  "Republic of Congo": 20,
  Burundi: 22,
  Mauritania: 26,
  Eritrea: 14,
  "Guinea-Bissau": 18,
};

// Color scale from red (0) to yellow (50) to green (100)
const colorScale = scaleLinear<string>()
  .domain([0, 50, 100])
  .range(["#dc2626", "#facc15", "#16a34a"]);

// Get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 80) return "#22c55e";
  if (score >= 70) return "#4ade80";
  if (score >= 60) return "#a3e635";
  if (score >= 50) return "#facc15";
  if (score >= 40) return "#f97316";
  if (score >= 30) return "#fb923c";
  if (score >= 20) return "#ef4444";
  if (score >= 10) return "#dc2626";
  return "#b91c1c";
};

// Get status text
const getStatusText = (score: number): string => {
  if (score >= 80) return "High Reform";
  if (score >= 60) return "Moderate Reform";
  if (score >= 40) return "Limited Reform";
  if (score >= 20) return "Minimal Reform";
  return "Crisis Level";
};

// Get tier based on score
const getTier = (score: number): string => {
  if (score >= 80) return "Tier 5";
  if (score >= 60) return "Tier 4";
  if (score >= 40) return "Tier 3";
  if (score >= 20) return "Tier 2";
  return "Tier 1";
};

const geoUrl = "/maps/africa.json";

export default function HeatmapPage() {
  const [countryScores, setCountryScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<{
    name: string;
    score: number;
  } | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [position, setPosition] = useState({ coordinates: [20, 5], zoom: 1 });

  useEffect(() => {
    // Try to fetch from API, fall back to sample data
    const fetchHeatmapData = async () => {
      try {
        const response = await fetch("/api/heatmap");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.countries) {
            const scores: Record<string, number> = {};
            data.countries.forEach((country: any) => {
              scores[country.country_name] = country.reform_score;
            });
            setCountryScores(scores);
          } else {
            setCountryScores(sampleCountryScores);
          }
        } else {
          setCountryScores(sampleCountryScores);
        }
      } catch (error) {
        console.log("Using sample data:", error);
        setCountryScores(sampleCountryScores);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  // Calculate statistics
  const stats = {
    totalCountries: Object.keys(countryScores).length,
    averageScore: Math.round(
      Object.values(countryScores).reduce((a, b) => a + b, 0) /
        Object.values(countryScores).length || 0
    ),
    highReform: Object.values(countryScores).filter((s) => s >= 70).length,
    crisis: Object.values(countryScores).filter((s) => s < 30).length,
  };

  const handleCountryClick = (geo: any) => {
    const countryName = geo.properties.name;
    const score = countryScores[countryName] || 0;
    setSelectedCountry({ name: countryName, score });
  };

  const handleZoomIn = () => {
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.2 }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.2 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [20, 5], zoom: 1 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading continental intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="px-4 md:px-8 pt-4">
        <Link 
          href="/countries" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Countries
        </Link>
      </div>
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-500/20">
        <div className="relative px-6 md:px-8 py-8 md:py-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-mono tracking-wider">
                    CONTINENTAL VISUALIZATION
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-xs">Live Intelligence</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Africa Reform Heatmap
              </h1>
              <p className="text-slate-300 text-base md:text-lg mt-3 max-w-2xl">
                Pan-African reform intelligence and policy visualization — color-coded by implementation progress.
              </p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Export Map Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Countries Tracked</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalCountries}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">Continental Avg Score</p>
            <p className="text-2xl md:text-3xl font-bold text-cyan-400">{stats.averageScore}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">✅ High Reform (70+)</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-400">{stats.highReform}</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-red-400 text-xs">🔴 Crisis (&lt;30)</p>
            <p className="text-2xl md:text-3xl font-bold text-red-400">{stats.crisis}</p>
          </div>
        </div>

        {/* Legend & Controls */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 bg-slate-800/50 rounded-xl px-4 py-2 border border-slate-700">
            <span className="text-slate-400 text-sm">Reform Score:</span>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-red-600"></div>
              <span className="text-white text-xs">0-20</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-orange-500"></div>
              <span className="text-white text-xs">21-40</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-yellow-400"></div>
              <span className="text-white text-xs">41-60</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-green-400"></div>
              <span className="text-white text-xs">61-80</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-emerald-600"></div>
              <span className="text-white text-xs">81-100</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
            >
              <span className="text-white text-lg">+</span>
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
            >
              <span className="text-white text-lg">-</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 text-white text-sm transition-colors"
            >
              Reset View
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 overflow-hidden">
          <div className="relative" style={{ height: "600px", width: "100%" }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 800,
                center: [20, 5],
              }}
              style={{ width: "100%", height: "100%" }}
            >
              <ZoomableGroup zoom={position.zoom} center={position.coordinates as [number, number]}>
                <Geographies geography={geoUrl}>
                {({
                    geographies,
                  }: {
                    geographies: any[];
                  }) =>
                    geographies.map((geo: any) => {
                      const countryName = geo.properties.name;
                      const score = countryScores[countryName] || 0;
                      const fillColor = getScoreColor(score);
                      const isHovered = hoveredCountry === countryName;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fillColor}
                          stroke="#1e293b"
                          strokeWidth={0.5}
                          style={{
                            default: {
                              outline: "none",
                              transition: "all 0.2s ease",
                            },
                            hover: {
                              fill: "#06b6d4",
                              outline: "none",
                              cursor: "pointer",
                              stroke: "#fff",
                              strokeWidth: 1.5,
                            },
                            pressed: {
                              outline: "none",
                            },
                          }}
                          onMouseEnter={() => setHoveredCountry(countryName)}
                          onMouseLeave={() => setHoveredCountry(null)}
                          onClick={() => handleCountryClick(geo)}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {/* Tooltip on hover */}
            {hoveredCountry && countryScores[hoveredCountry] !== undefined && (
              <div
                className="absolute bg-slate-900 border border-cyan-500/30 rounded-lg px-3 py-2 pointer-events-none z-10"
                style={{
                  bottom: "20px",
                  left: "20px",
                }}
              >
                <p className="text-white text-sm font-semibold">{hoveredCountry}</p>
                <p className="text-cyan-400 text-xs">
                  Score: {countryScores[hoveredCountry]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Country Detail Modal */}
        {selectedCountry && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCountry(null)}
          >
            <div
              className="bg-slate-800 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedCountry.name}</h2>
                    <p className="text-slate-400 text-sm mt-1">Reform Intelligence Report</p>
                  </div>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="text-slate-400 hover:text-white text-2xl"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div
                    className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{
                      background: `conic-gradient(from 0deg, ${getScoreColor(
                        selectedCountry.score
                      )} 0deg ${(selectedCountry.score / 100) * 360}deg, #1e293b ${(selectedCountry.score / 100) * 360}deg 360deg)`,
                    }}
                  >
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {selectedCountry.score}
                      </span>
                    </div>
                  </div>
                  <p className="text-white text-lg font-semibold">Reform Score</p>
                  <p className="text-slate-400 text-sm mt-1">{getStatusText(selectedCountry.score)}</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Priority Tier</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        selectedCountry.score < 30
                          ? "bg-red-500/20 text-red-400"
                          : selectedCountry.score < 50
                          ? "bg-orange-500/20 text-orange-400"
                          : selectedCountry.score < 70
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {getTier(selectedCountry.score)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Continental Rank</span>
                    <span className="text-white text-sm">
                      #
                      {Object.entries(countryScores)
                        .sort((a, b) => b[1] - a[1])
                        .findIndex(([name]) => name === selectedCountry.name) + 1}
                      of {stats.totalCountries}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCountry(null)}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}