"use client";

import {
  useEffect,
  useState,
} from "react";

export default function ReformIntelligencePage() {

  const [reforms, setReforms] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchReforms();

  }, []);

  const fetchReforms = async () => {

    try {

      const response =
        await fetch(
          "/api/reform-intelligence"
        );

      const data =
        await response.json();

      if (data.success) {

        setReforms(data.reforms);

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  /*
    GROUP BY TIER
  */
  const groupedReforms =
    reforms.reduce(
      (
        acc: any,
        reform: any
      ) => {

        if (
          !acc[
            reform.reform_tier
          ]
        ) {

          acc[
            reform.reform_tier
          ] = [];

        }

        acc[
          reform.reform_tier
        ].push(reform);

        return acc;

      },
      {}
    );

  /*
    TIER COLORS
  */
  const tierColors: any = {

    "Tier 1":
      "bg-red-600",

    "Tier 2":
      "bg-orange-500",

    "Tier 3":
      "bg-yellow-500",

    "Tier 4":
      "bg-green-600",

    "Tier 5":
      "bg-cyan-600",

  };

  if (loading) {

    return (
      <main className="p-10">
        Loading reform intelligence...
      </main>
    );

  }

  return (

    <main className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-slate-900 text-white rounded-3xl p-10 mb-10 shadow-xl">

          <h1 className="text-5xl font-bold">
            Continental Reform Intelligence
          </h1>

          <p className="text-slate-300 mt-4 text-lg">
            Live Pan-African mental health reform observatory.
          </p>

        </div>

        {/* TIER SECTIONS */}
        <div className="space-y-10">

          {Object.keys(
            groupedReforms
          ).map((tier) => (

            <div
              key={tier}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >

              {/* TIER HEADER */}
              <div
                className={`${tierColors[tier]} text-white p-6`}
              >

                <h2 className="text-4xl font-bold">
                  {tier}
                </h2>

                <p className="mt-2">
                  Continental Reform Classification
                </p>

              </div>

              {/* COUNTRY TABLE */}
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-100">

                    <tr>

                      <th className="text-left p-4">
                        Country
                      </th>

                      <th className="text-left p-4">
                        Law
                      </th>

                      <th className="text-left p-4">
                        Implementation
                      </th>

                      <th className="text-left p-4">
                        Budget
                      </th>

                      <th className="text-left p-4">
                        Priority
                      </th>

                      <th className="text-left p-4">
                        Score
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {
                      groupedReforms[
                        tier
                      ].map(
                        (
                          reform: any
                        ) => (

                          <tr
                            key={
                              reform.id
                            }
                            className="border-b"
                          >

                            <td className="p-4 font-semibold">
                              {
                                reform.country_name
                              }
                            </td>

                            <td className="p-4">
                              {
                                reform.law_status
                              }
                            </td>

                            <td className="p-4">
                              {
                                reform.implementation_status
                              }
                            </td>

                            <td className="p-4">
                              {
                                reform.budget_level
                              }
                            </td>

                            <td className="p-4">
                              {
                                reform.priority_level
                              }
                            </td>

                            <td className="p-4">

                              <div className="flex items-center gap-3">

                                <div className="w-32 bg-slate-200 rounded-full h-4 overflow-hidden">

                                  <div
                                    className="bg-cyan-600 h-4"
                                    style={{
                                      width: `${reform.reform_score}%`,
                                    }}
                                  />

                                </div>

                                <span>
                                  {
                                    reform.reform_score
                                  }%
                                </span>

                              </div>

                            </td>

                          </tr>

                        )
                      )
                    }

                  </tbody>

                </table>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>

  );

}