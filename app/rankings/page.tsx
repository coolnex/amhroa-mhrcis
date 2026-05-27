"use client";

import {
  useEffect,
  useState,
} from "react";

export default function RankingsPage() {

  const [rankings, setRankings] =
    useState<any[]>([]);

  useEffect(() => {

    fetchRankings();

  }, []);

  const fetchRankings = async () => {

    try {

      const response =
        await fetch("/api/rankings");

      const data =
        await response.json();

      if (data.success) {

        setRankings(data.rankings);

      }

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <main className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-slate-900 text-white rounded-3xl p-10 mb-10 shadow-xl">

          <h1 className="text-5xl font-bold">
            Continental Rankings & Leaderboards
          </h1>

          <p className="text-slate-300 mt-4 text-lg">
            Pan-African reform benchmarking and implementation intelligence system.
          </p>

        </div>

        {/* TOP PERFORMERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          {rankings.slice(0, 3).map(
            (
              country,
              index
            ) => (

              <div
                key={country.id}
                className="bg-white rounded-3xl shadow-xl p-8 text-center"
              >

                <div className="text-6xl mb-4">

                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}

                </div>

                <h2 className="text-3xl font-bold">
                  {country.country_name}
                </h2>

                <p className="text-slate-500 mt-3">
                  Reform Score
                </p>

                <p className="text-6xl font-bold text-cyan-600 mt-4">
                  {country.reform_score}%
                </p>

              </div>

            )
          )}

        </div>

        {/* FULL RANKINGS */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="p-6 border-b">

            <h2 className="text-3xl font-bold">
              Continental Performance Rankings
            </h2>

          </div>

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="text-left p-4">
                  Rank
                </th>

                <th className="text-left p-4">
                  Country
                </th>

                <th className="text-left p-4">
                  Tier
                </th>

                <th className="text-left p-4">
                  Reform Score
                </th>

                <th className="text-left p-4">
                  Implementation
                </th>

                <th className="text-left p-4">
                  Priority
                </th>

              </tr>

            </thead>

            <tbody>

              {rankings.map(
                (
                  country,
                  index
                ) => (

                  <tr
                    key={country.id}
                    className="border-b"
                  >

                    <td className="p-4 font-bold">
                      #{index + 1}
                    </td>

                    <td className="p-4 font-semibold">
                      {
                        country.country_name
                      }
                    </td>

                    <td className="p-4">
                      {
                        country.reform_tier
                      }
                    </td>

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="w-32 bg-slate-200 rounded-full h-4 overflow-hidden">

                          <div
                            className="bg-cyan-600 h-4"
                            style={{
                              width: `${country.reform_score}%`,
                            }}
                          />

                        </div>

                        <span>
                          {
                            country.reform_score
                          }%
                        </span>

                      </div>

                    </td>

                    <td className="p-4">
                      {
                        country.implementation_status
                      }
                    </td>

                    <td className="p-4">
                      {
                        country.priority_level
                      }
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </main>

  );

}