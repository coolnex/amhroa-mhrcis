"use client";

import {
  useEffect,
  useState,
} from "react";

export default function SDGIntelligencePage() {

  const [countries, setCountries] =
    useState<any[]>([]);

  useEffect(() => {

    fetchSDGData();

  }, []);

  const fetchSDGData = async () => {

    try {

      const response =
        await fetch(
          "/api/sdg-intelligence"
        );

      const data =
        await response.json();

      if (data.success) {

        setCountries(data.countries);

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
            Continental SDG Intelligence
          </h1>

          <p className="text-slate-300 mt-4 text-lg">
            SDG mental health governance benchmarking across Africa.
          </p>

        </div>

        {/* SDG TABLE */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="text-left p-4">
                  Country
                </th>

                <th className="text-left p-4">
                  SDG 3
                </th>

                <th className="text-left p-4">
                  SDG 10
                </th>

                <th className="text-left p-4">
                  SDG 16
                </th>

                <th className="text-left p-4">
                  Agenda 2063
                </th>

              </tr>

            </thead>

            <tbody>

              {countries.map(
                (country) => (

                  <tr
                    key={country.id}
                    className="border-b"
                  >

                    <td className="p-4 font-semibold">
                      {
                        country.country_name
                      }
                    </td>

                    <td className="p-4">
                      {
                        country.sdg3_score
                      }%
                    </td>

                    <td className="p-4">
                      {
                        country.sdg10_score
                      }%
                    </td>

                    <td className="p-4">
                      {
                        country.sdg16_score
                      }%
                    </td>

                    <td className="p-4">
                      {
                        country.agenda2063_score
                      }%
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