"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Globe,
  TrendingUp,
  Target,
  Award,
  Search,
  BarChart3,
} from "lucide-react";

interface Country {
  id: string;
  country_name: string;
  sdg3_score: number;
  sdg10_score: number;
  sdg16_score: number;
  agenda2063_score: number;
}

export default function SDGIntelligencePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSDGData();
  }, []);

  const fetchSDGData = async () => {
    try {
      const response = await fetch(
        "/api/sdg-intelligence"
      );

      const data = await response.json();

      if (data.success) {
        setCountries(data.countries);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = useMemo(() => {
    return countries.filter((country) =>
      country.country_name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [countries, search]);

  const continentalAverage = useMemo(() => {
    if (!countries.length) return 0;

    const total = countries.reduce(
      (acc, c) =>
        acc +
        (
          c.sdg3_score +
          c.sdg10_score +
          c.sdg16_score +
          c.agenda2063_score
        ) /
          4,
      0
    );

    return Math.round(total / countries.length);
  }, [countries]);

  const highestCountry = useMemo(() => {
    if (!countries.length) return null;

    return [...countries].sort(
      (a, b) =>
        (
          b.sdg3_score +
          b.sdg10_score +
          b.sdg16_score +
          b.agenda2063_score
        ) /
          4 -
        (
          a.sdg3_score +
          a.sdg10_score +
          a.sdg16_score +
          a.agenda2063_score
        ) /
          4
    )[0];
  }, [countries]);

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return "text-emerald-600";

    if (score >= 60)
      return "text-yellow-500";

    return "text-red-500";
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="max-w-7xl mx-auto">

        {/* Hero */}

        <div className="bg-gradient-to-r from-cyan-700 to-blue-900 text-white rounded-3xl p-10 shadow-2xl mb-8">

          <div className="flex items-center gap-4 mb-4">
            <Globe className="w-10 h-10" />

            <h1 className="text-4xl md:text-5xl font-bold">
              Continental SDG Intelligence
            </h1>
          </div>

          <p className="text-cyan-100 text-lg max-w-3xl">
            Monitor Africa's progress on Mental Health,
            Sustainable Development Goals and Agenda
            2063 implementation using real-time
            governance intelligence.
          </p>

        </div>

        {/* Summary Cards */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <Globe className="text-cyan-600 mb-3" />
            <p className="text-slate-500">
              Countries Tracked
            </p>
            <h2 className="text-4xl font-bold">
              {countries.length}
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <TrendingUp className="text-emerald-600 mb-3" />
            <p className="text-slate-500">
              Continental Average
            </p>
            <h2 className="text-4xl font-bold">
              {continentalAverage}%
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <Award className="text-purple-600 mb-3" />
            <p className="text-slate-500">
              Best Performing Country
            </p>

            <h2 className="text-xl font-bold">
              {highestCountry?.country_name ??
                "-"}
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <Target className="text-orange-500 mb-3" />
            <p className="text-slate-500">
              Agenda 2063 Alignment
            </p>

            <h2 className="text-4xl font-bold">
              {continentalAverage}%
            </h2>
          </div>

        </div>

        {/* Search */}

        <div className="bg-white rounded-3xl shadow-lg p-5 mb-8">

          <div className="relative">

            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search country..."
              className="w-full border border-slate-300 rounded-xl pl-12 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
            />

          </div>

        </div>

        {/* Intelligence Alert */}

        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-3xl p-6 mb-8">

          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="text-amber-700" />
            <h3 className="font-bold text-amber-800">
              AI Intelligence Insight
            </h3>
          </div>

          <p className="text-amber-900">
            Countries scoring below 60%
            across SDG 3 and SDG 16 should be
            prioritized for mental health
            governance strengthening,
            workforce investment and policy
            reform acceleration.
          </p>

        </div>

        {/* Country Rankings */}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">
              Country Benchmark Rankings
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              Loading SDG Intelligence...
            </div>
          ) : (
            <table className="w-full">

              <thead className="bg-slate-100">

                <tr>
                  <th className="p-4 text-left">
                    Country
                  </th>

                  <th className="p-4 text-left">
                    SDG 3
                  </th>

                  <th className="p-4 text-left">
                    SDG 10
                  </th>

                  <th className="p-4 text-left">
                    SDG 16
                  </th>

                  <th className="p-4 text-left">
                    Agenda 2063
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredCountries.map(
                  (country) => (
                    <tr
                      key={country.id}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="p-4 font-semibold">
                        {
                          country.country_name
                        }
                      </td>

                      <td
                        className={`p-4 font-bold ${getScoreColor(
                          country.sdg3_score
                        )}`}
                      >
                        {country.sdg3_score}%
                      </td>

                      <td
                        className={`p-4 font-bold ${getScoreColor(
                          country.sdg10_score
                        )}`}
                      >
                        {country.sdg10_score}%
                      </td>

                      <td
                        className={`p-4 font-bold ${getScoreColor(
                          country.sdg16_score
                        )}`}
                      >
                        {country.sdg16_score}%
                      </td>

                      <td
                        className={`p-4 font-bold ${getScoreColor(
                          country.agenda2063_score
                        )}`}
                      >
                        {
                          country.agenda2063_score
                        }
                        %
                      </td>
                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}

        </div>

      </div>

    </main>
  );
}