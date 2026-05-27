"use client";

import {
  useEffect,
  useState,
} from "react";

export default function RepositoryPage() {

  const [resources, setResources] =
    useState<any[]>([]);
    const [country, setCountry] =
    useState("");
  
  const [category, setCategory] =
    useState("");
  
  const [year, setYear] =
    useState("");
  
  const [author, setAuthor] =
    useState("");

    useEffect(() => {
        fetchResources();
      }, [country, category, year, author]);

  const fetchResources = async () => {

    let url =
      "/api/repository?";
  
    if (country) {
      url += `country=${country}&`;
    }
  
    if (category) {
      url += `category=${category}&`;
    }
  
    if (year) {
      url += `year=${year}&`;
    }
  
    if (author) {
      url += `author=${author}&`;
    }
  
    const response =
      await fetch(url);
  
    const data =
      await response.json();
  
    if (data.success) {
      setResources(data.resources);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-slate-900 text-white rounded-3xl p-10 mb-10 shadow-xl">


          <h1 className="text-5xl font-bold">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-10">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* COUNTRY */}
        <input
            type="text"
            placeholder="Filter by Country"
            value={country}
            onChange={(e) =>
            setCountry(e.target.value)
            }
            className="border rounded-xl px-4 py-3"
        />

        {/* CATEGORY */}
        <input
            type="text"
            placeholder="Filter by Category"
            value={category}
            onChange={(e) =>
            setCategory(e.target.value)
            }
            className="border rounded-xl px-4 py-3"
        />

        {/* YEAR */}
        <input
            type="text"
            placeholder="Publication Year"
            value={year}
            onChange={(e) =>
            setYear(e.target.value)
            }
            className="border rounded-xl px-4 py-3"
        />

        {/* AUTHOR */}
        <input
            type="text"
            placeholder="Search Author"
            value={author}
            onChange={(e) =>
            setAuthor(e.target.value)
            }
            className="border rounded-xl px-4 py-3"
        />

        </div>

        </div>
            Research Repository
          </h1>

          <p className="text-slate-300 mt-4 text-lg">
            Pan-African Mental Health Knowledge Hub
          </p>

        </div>

        {/* RESOURCES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {resources.map((resource) => (

            <div
              key={resource.id}
              className="bg-white rounded-3xl shadow-xl p-8"
            >

              <div className="mb-5">

                <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm">
                  {resource.category}
                </span>

              </div>

              <h2 className="text-2xl font-bold">
                {resource.title}
              </h2>

              <p className="text-slate-500 mt-4">
                {resource.description}
              </p>

              <div className="mt-6 space-y-2 text-sm text-slate-600">

                <p>
                  <strong>Country:</strong>{" "}
                  {resource.country}
                </p>

                <p>
                  <strong>Author:</strong>{" "}
                  {resource.author}
                </p>

                <p>
                  <strong>Year:</strong>{" "}
                  {resource.publication_year}
                </p>

              </div>

              <a
                href={resource.file_url}
                target="_blank"
                className="inline-block mt-6 bg-slate-900 text-white px-5 py-3 rounded-xl"
              >
                Download Resource
              </a>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}